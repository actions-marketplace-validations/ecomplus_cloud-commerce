import type { Customers } from '@cloudcommerce/api/types';

/*
 * Profiles identified by e-mail and document only (without verified login) used to be
 * returned with censored fields: '***' surname, '000XX' phone, address holding just zip
 * and province. Sessions persisted back then are still cached on customer browsers and
 * get submitted on checkout, where they overwrite the saved profile and produce an
 * incomplete shipping address that payment gateways reject.
 */
const CENSORED = '***';

type CustomerAddress = NonNullable<Customers['addresses']>[number];

// Predicates must match server side checks on `@cloudcommerce/modules` checkout.ts
const isCensoredPhone = (number?: string) => !!number && /^0{3,}\d{1,4}$/.test(number);
const isCensoredAddress = ({ name, line_address: lineAddress }: CustomerAddress) => {
  return !!name?.includes(CENSORED) || !!lineAddress?.includes(CENSORED);
};

export const hasCensoredFields = ({ name, phones, addresses }: Partial<Customers>) => {
  if (name?.family_name?.includes(CENSORED)) return true;
  if (phones?.some(({ number }) => isCensoredPhone(number))) return true;
  return !!addresses?.some(isCensoredAddress);
};

export const withoutCensoredFields = (customerData: Partial<Customers>) => {
  const { phones, addresses, ...safeCustomer } = customerData;
  const cleanCustomer: Partial<Customers> = safeCustomer;
  /* `name` is intentionally kept even when `family_name` is censored: it's required
  on `@checkout` contract, `given_name` is preserved valid by the mask, and the
  '***' marker triggers server side restore from the saved profile (checkout.ts). */
  const cleanPhones = phones?.filter(({ number }) => !isCensoredPhone(number));
  if (cleanPhones?.length) cleanCustomer.phones = cleanPhones;
  const cleanAddresses = addresses?.filter((address) => !isCensoredAddress(address));
  if (cleanAddresses?.length) cleanCustomer.addresses = cleanAddresses;
  return cleanCustomer;
};
