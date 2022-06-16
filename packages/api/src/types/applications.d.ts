/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Applications {
  _id: string;
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * ID of application on marketplace
   */
  app_id: number;
  /**
   * The working state of this app in the shop
   */
  state?: 'inactive' | 'active' | 'test';
  /**
   * App title
   */
  title: string;
  /**
   * App unique slug on marketplace, only lowercase letters, numbers and hyphen
   */
  slug?: string;
  /**
   * Whether this app is paid
   */
  paid?: boolean;
  /**
   * Installed application version, semver e.g. 1.0.0
   */
  version: string;
  /**
   * When app installation was updated, date and time in ISO 8601 standard representation
   */
  version_date?: string;
  /**
   * Type of app
   */
  type: 'dashboard' | 'storefront' | 'external';
  /**
   * Modules handled by this app
   */
  modules?: {
    /**
     * Triggered after each term searched on storefront
     */
    term_searched?: {
      /**
       * Whether current app is enabled to handle the module requests
       */
      enabled: boolean;
      /**
       * URL to receive POST request of respective module
       */
      endpoint: string;
    };
    /**
     * Triggered after each cart saves on storefront, just before checkout
     */
    cart_confirmed?: {
      /**
       * Whether current app is enabled to handle the module requests
       */
      enabled: boolean;
      /**
       * URL to receive POST request of respective module
       */
      endpoint: string;
    };
    /**
     * Triggered to calculate shipping options, must return calculated values and times
     */
    calculate_shipping?: {
      /**
       * Whether current app is enabled to handle the module requests
       */
      enabled: boolean;
      /**
       * URL to receive POST request of respective module
       */
      endpoint: string;
    };
    /**
     * Triggered when listing payments, must return available methods
     */
    list_payments?: {
      /**
       * Whether current app is enabled to handle the module requests
       */
      enabled: boolean;
      /**
       * URL to receive POST request of respective module
       */
      endpoint: string;
    };
    /**
     * Triggered to validate and apply discout value, must return discount and conditions
     */
    apply_discount?: {
      /**
       * Whether current app is enabled to handle the module requests
       */
      enabled: boolean;
      /**
       * URL to receive POST request of respective module
       */
      endpoint: string;
    };
    /**
     * Triggered when order is being closed, must create payment transaction and return info
     */
    create_transaction?: {
      /**
       * Whether current app is enabled to handle the module requests
       */
      enabled: boolean;
      /**
       * URL to receive POST request of respective module
       */
      endpoint: string;
    };
    /**
     * Triggered after each order created from storefront, could return custom fields
     */
    checkout_done?: {
      /**
       * Whether current app is enabled to handle the module requests
       */
      enabled: boolean;
      /**
       * URL to receive POST request of respective module
       */
      endpoint: string;
    };
  };
  /**
   * Configuration options for staff on admin dashboard, saved on app data
   */
  admin_settings?: {
    /**
     * Configuration field object, property name same as saved on data object
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-z0-9_]{2,30}$".
     */
    [k: string]: {
      /**
       * JSON Schema (https://json-schema.org/specification.html) for field model
       */
      schema: {
        [k: string]: unknown;
      };
      /**
       * Whether the field value is private, saved in `hidden_data`
       */
      hide?: boolean;
    };
  };
  /**
   * Link to client side script (JS) to load on storefront
   */
  storefront_script_uri?: string;
  /**
   * Endpoint that receives POST back with authentication credentials, must be HTTPS
   */
  auth_callback_uri?: string;
  /**
   * If this app uses authentication, list the needed permissions
   */
  auth_scope?: {
    /**
     * Special scope to read authentications
     */
    authentications?: 'GET'[];
    /**
     * Requested resource, cannot be 'applications', 'authentications' or '$update' here
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^([$]?(?!app|aut|upd)([a-z][a-z0-9/_]{1,60}[^/]))$".
     */
    [k: string]: ('all' | 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE')[];
  };
  /**
   * Application object data, schema free
   */
  data?: {
    [k: string]: unknown;
  };
  /**
   * Application private data, available only with authentication
   */
  hidden_data?: {
    [k: string]: unknown;
  };
  /**
   * Flags to associate additional info
   */
  flags?: string[];
  /**
   * Optional notes with additional info about this user
   */
  notes?: string;
}