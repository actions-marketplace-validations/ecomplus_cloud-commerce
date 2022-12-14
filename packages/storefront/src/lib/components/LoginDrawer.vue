<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue';
import { i19myAccount, i19myOrders } from '@@i18n';
import ADrawer from '@@components/ADrawer.vue';

export interface Props {
  accountUrl?: string;
  additionalLinks?: Array<{
    href: string;
    isBlank?: boolean;
    innerHTML: string;
  }>;
}

withDefaults(defineProps<Props>(), {
  accountUrl: '/app/account',
  additionalLinks: () => [],
});
const isVisible = ref(false);
const loadingLoginForm = !import.meta.env.SSR
  ? import('./LoginForm.vue')
  : Promise.resolve() as Promise<any>;
const LoginForm = defineAsyncComponent(() => loadingLoginForm);
const toggle = (ev: MouseEvent) => {
  loadingLoginForm.then(() => {
    isVisible.value = !isVisible.value;
    ev.preventDefault();
  });
};
const isLogged = ref(false);
</script>

<template>
  <div class="login-offcanvas">
    <div @click="toggle">
      <slot name="toggle" v-bind="{ isVisible }" />
    </div>
    <ADrawer v-model="isVisible">
      <slot name="form">
        <div class="w-80">
          <LoginForm @login="isLogged = true" @logout="isLogged = false">
            <template #button-content>
              <slot name="form-button-content" />
            </template>
          </LoginForm>
        </div>
      </slot>
      <slot name="nav" v-bind="{ isLogged }">
        <hr>
        <aside>
          <nav>
            <ul>
              <template v-if="isLogged">
                <li><a :href="`${accountUrl}/#/orders`">{{ i19myOrders }}</a></li>
                <li><a :href="accountUrl">{{ i19myAccount }}</a></li>
              </template>
              <li
                v-for="({ href, isBlank, innerHTML }, i) in additionalLinks"
                :key="i"
              >
                <a
                  :href="href"
                  :target="isBlank ? '_blank' : null"
                  :rel="isBlank ? 'noopener' : null"
                  v-html="innerHTML"
                ></a>
              </li>
            </ul>
          </nav>
        </aside>
      </slot>
    </ADrawer>
  </div>
</template>
