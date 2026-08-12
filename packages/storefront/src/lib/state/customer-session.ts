import type { Customers } from '@cloudcommerce/api/types';
import type { Auth } from 'firebase/auth';
import api from '@cloudcommerce/api';
import { nickname as getNickname } from '@ecomplus/utils';
import { ref, computed, watch } from 'vue';
import { requestIdleCallback } from '@@sf/sf-lib';
import useStorage from '@@sf/state/use-storage';

export const EMAIL_STORAGE_KEY = 'emailForSignIn';

const storageKey = 'ecomSession';
const emptySession = {
  customer: {
    display_name: '',
    main_email: '',
  },
  auth: null,
};
const session = useStorage<{
  customer: Partial<Customers>,
  auth: null | {
    access_token: string,
    expires: string,
    customer_id: Customers['_id'],
  },
}>(storageKey, emptySession);

/*
 * Profiles identified by e-mail and document only (without verified login) used to be
 * returned with censored fields: '***' surname, '000XX' phone, address holding just zip
 * and province. Sessions persisted back then are still cached on customer browsers and
 * get submitted on checkout, where they overwrite the saved profile and produce an
 * incomplete shipping address that payment gateways reject.
 */
const CENSORED = '***';
type CustomerAddress = NonNullable<Customers['addresses']>[number];
const isCensoredPhone = (number?: string) => !!number && /^0{3}\d{2}$/.test(number);
const isCensoredAddress = ({ name, line_address: lineAddress }: CustomerAddress) => {
  return name === CENSORED || !!lineAddress?.includes(CENSORED);
};
const hasCensoredFields = ({ name, phones, addresses }: Partial<Customers>) => {
  if (name?.family_name === CENSORED) return true;
  if (phones?.some(({ number }) => isCensoredPhone(number))) return true;
  return !!addresses?.some(isCensoredAddress);
};
const withoutCensoredFields = (customerData: Partial<Customers>) => {
  const {
    name,
    phones,
    addresses,
    ...safeCustomer
  } = customerData;
  const cleanCustomer: Partial<Customers> = safeCustomer;
  if (name && name.family_name !== CENSORED) cleanCustomer.name = name;
  const cleanPhones = phones?.filter(({ number }) => !isCensoredPhone(number));
  if (cleanPhones?.length) cleanCustomer.phones = cleanPhones;
  const cleanAddresses = addresses?.filter((address) => !isCensoredAddress(address));
  if (cleanAddresses?.length) cleanCustomer.addresses = cleanAddresses;
  return cleanCustomer;
};
if (hasCensoredFields(session.customer)) {
  // Keep any still-valid cached fields, but drop `doc_number` so `fetchCustomer`
  // runs again once the customer is authenticated.
  const cleanCustomer = withoutCensoredFields(session.customer);
  delete cleanCustomer.doc_number;
  cleanCustomer.display_name = cleanCustomer.display_name || '';
  cleanCustomer.main_email = cleanCustomer.main_email || '';
  session.customer = cleanCustomer;
}

const isAuthenticated = computed(() => {
  const { auth } = session;
  return auth && new Date(auth.expires).getTime() - Date.now() > 1000 * 10;
});
const customer = computed(() => session.customer);
const customerName = computed(() => getNickname(customer.value) as string);
const customerEmail = computed({
  get() {
    return customer.value.main_email;
  },
  set(email) {
    session.customer.main_email = email;
  },
});

let firebaseAuth: Auth | undefined;
const isLogged = computed(() => {
  return isAuthenticated.value || !!firebaseAuth?.currentUser?.emailVerified;
});
const throwNoAuth = (msg = 'Not authenticated') => {
  const err: any = new Error(msg);
  err.isNoAuth = true;
  throw err;
};

const authenticate = async () => {
  const authToken = await firebaseAuth?.currentUser?.getIdToken();
  if (!authToken) {
    throwNoAuth('Can\'t get Firebase user ID token');
    return;
  }
  const { domain } = globalThis.$storefront.settings;
  try {
    const resAuth = await fetch(`https://${domain}/_api/passport/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    session.auth = await resAuth.json();
  } catch (err) {
    console.error(err);
  }
};

const getAccessToken = async () => {
  if (!isAuthenticated.value) {
    await authenticate();
  }
  if (!session.auth) return throwNoAuth();
  return session.auth.access_token;
};

const fetchCustomer = async () => {
  const accessToken = await getAccessToken();
  const auth = session.auth as Exclude<typeof session.auth, null>;
  const { data } = await api.get(`customers/${auth.customer_id}`, {
    accessToken,
  });
  // Profiles already persisted with censored fields must not be reused as valid values.
  session.customer = withoutCensoredFields(data);
  return session.customer;
};

const isAuthReady = ref(false);
let isAuthInitialized = false;
const initializeFirebaseAuth = (canWaitIdle?: boolean) => {
  if (import.meta.env.SSR || isAuthInitialized) return;
  if (canWaitIdle === undefined) {
    canWaitIdle = !window.location.pathname.startsWith('/app/');
  }
  isAuthInitialized = true;
  const runImport = () => import('../scripts/firebase-app')
    .then(({
      getAuth,
      onAuthStateChanged,
      isSignInWithEmailLink,
      signInWithEmailLink,
    }) => {
      firebaseAuth = getAuth();
      firebaseAuth.languageCode = window.$storefront.settings.lang || 'pt_br';
      let countStateChanges = 0;
      onAuthStateChanged(firebaseAuth, async (user) => {
        countStateChanges += 1;
        if (countStateChanges === 1 && !user) return;
        if (user) {
          isAuthReady.value = false;
          if (user.displayName && !customerName.value) {
            session.customer.display_name = user.displayName;
          }
          if (user.email && (!customerEmail.value || user.emailVerified)) {
            session.customer.main_email = user.email;
          }
          if (user.emailVerified) {
            const isEmailChanged = user.email !== customerEmail.value;
            if (isEmailChanged || !isAuthenticated.value) {
              await authenticate();
            }
            if (isEmailChanged || !session.customer.doc_number) {
              await fetchCustomer();
            }
          }
        }
        isAuthReady.value = true;
      });
      if (isSignInWithEmailLink(firebaseAuth, window.location.href)) {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        if (email) {
          isAuthReady.value = !!firebaseAuth.currentUser;
          signInWithEmailLink(firebaseAuth, email, window.location.href)
            .then(() => window.localStorage.removeItem(EMAIL_STORAGE_KEY))
            .catch(console.error);
          return;
        }
      }
      isAuthReady.value = true;
    })
    .catch(console.error);
  if (canWaitIdle) {
    requestIdleCallback(runImport);
  } else {
    runImport();
  }
};

const logout = () => {
  if (!firebaseAuth) {
    initializeFirebaseAuth();
    watch(isAuthReady, () => logout(), { once: true });
    return;
  }
  firebaseAuth.signOut().then(() => {
    session.auth = emptySession.auth;
    session.customer = emptySession.customer;
    localStorage.removeItem(storageKey);
  });
};

export default session;

export {
  session,
  isAuthenticated,
  customer,
  customerName,
  customerEmail,
  isLogged,
  logout,
  authenticate,
  getAccessToken,
  fetchCustomer,
  initializeFirebaseAuth,
  isAuthReady,
};
