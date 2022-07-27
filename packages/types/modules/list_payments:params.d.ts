/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Triggered when listing payments, must return available methods
 */
export interface ListPaymentsParams {
  /**
   * Products composing the cart
   *
   * @maxItems 3000
   */
  items?: {
    /**
     * Product ID
     */
    product_id: string;
    /**
     * ID to specify the variation added to cart, if product has variations
     */
    variation_id?: string;
    /**
     * Product or variation unique reference code
     */
    sku?: string;
    /**
     * Product or variation full name, or other label for this cart item
     */
    name?: string;
    /**
     * Item quantity in cart
     */
    quantity: number;
    /**
     * Designator of currency according to ISO 4217 (3 uppercase letters)
     */
    currency_id?: string;
    /**
     * Graphic symbol used as a shorthand for currency's name
     */
    currency_symbol?: string;
    /**
     * Product sale price specifically for this cart
     */
    price: number;
    /**
     * Final item price including additions due to customizations and gift wrap
     */
    final_price?: number;
  }[];
  /**
   * Designator of currency according to ISO 4217 (3 uppercase letters)
   */
  currency_id?: string;
  /**
   * Graphic symbol used as a shorthand for currency's name
   */
  currency_symbol?: string;
  /**
   * Object with sums of values
   */
  amount?: {
    /**
     * Order total amount
     */
    total: number;
    /**
     * The sum of all items prices
     */
    subtotal?: number;
    /**
     * Order freight cost
     */
    freight?: number;
    /**
     * Applied discount value
     */
    discount?: number;
    /**
     * The sum of all the taxes applied to the order
     */
    tax?: number;
    /**
     * Sum of optional extra costs applied
     */
    extra?: number;
  };
  /**
   * Language two letters code, sometimes with region, eg.: pt_br, fr, en_us
   */
  lang?: string;
  /**
   * Store domain name (numbers and lowercase letters, eg.: www.myshop.sample)
   */
  domain?: string;
  /**
   * Customer object
   */
  customer?: {
    /**
     * Customer ID
     */
    _id?: null | string;
    /**
     * Customer language two letter code, sometimes with region, eg.: pt_br, fr, en_us
     */
    locale?: string;
    /**
     * Customer main email address
     */
    main_email: string;
    /**
     * List of customer email addresses
     *
     * @maxItems 20
     */
    emails?: {
      /**
       * The actual email address
       */
      address: string;
      /**
       * The type of email
       */
      type?: 'work' | 'home' | 'other';
      /**
       * States whether or not the email address has been verified
       */
      verified?: boolean;
    }[];
    /**
     * The name of this Customer, suitable for display
     */
    display_name?: string;
    /**
     * Customer name object
     */
    name: {
      /**
       * The family name of this user, or "last name"
       */
      family_name?: string;
      /**
       * The "first name" of this user
       */
      given_name?: string;
      /**
       * The middle name(s) of this user
       */
      middle_name?: string;
    };
    /**
     * Customer gender, female, male or third gender (X)
     */
    gender?: 'f' | 'm' | 'x';
    /**
     * User profile pictures
     *
     * @maxItems 20
     */
    photos?: string[];
    /**
     * List of customer phone numbers
     *
     * @maxItems 20
     */
    phones?: {
      /**
       * Country calling code (without +), defined by standards E.123 and E.164
       */
      country_code?: number;
      /**
       * The actual phone number, digits only
       */
      number: string;
      /**
       * The type of phone
       */
      type?: 'home' | 'personal' | 'work' | 'other';
    }[];
    /**
     * Physical or juridical (company) person
     */
    registry_type?: 'p' | 'j';
    /**
     * Country of document origin, an ISO 3166-2 code
     */
    doc_country?: string;
    /**
     * Responsible person or organization document number (only numbers)
     */
    doc_number?: string;
    /**
     * Municipal or state registration if exists
     */
    inscription_type?: 'State' | 'Municipal';
    /**
     * Municipal or state registration number (with characters) if exists
     */
    inscription_number?: string;
    /**
     * Registered company name or responsible fullname
     */
    corporate_name?: string;
    /**
     * List of customer addresses
     *
     * @maxItems 40
     */
    addresses?: {
      /**
       * Unique ID (ObjectID)
       */
      _id: string;
      /**
       * ZIP (CEP, postal...) code
       */
      zip: string;
      /**
       * Street or public place name
       */
      street?: string;
      /**
       * House or building street number
       */
      number?: number;
      /**
       * Address complement or second line, such as apartment number
       */
      complement?: string;
      /**
       * Borough name
       */
      borough?: string;
      /**
       * Some optional other reference for this address
       */
      near_to?: string;
      /**
       * Full in line mailing address, should include street, number and borough
       */
      line_address?: string;
      /**
       * City name
       */
      city?: string;
      /**
       * Country name
       */
      country?: string;
      /**
       * An ISO 3166-2 country code
       */
      country_code?: string;
      /**
       * Province or state name
       */
      province?: string;
      /**
       * The two-letter code for the province or state
       */
      province_code?: string;
      /**
       * The name of recipient, generally is the customer's name
       */
      name?: string;
      /**
       * The recipient's last name
       */
      last_name?: string;
      /**
       * Customer phone number for this mailing address
       */
      phone?: {
        /**
         * Country calling code (without +), defined by standards E.123 and E.164
         */
        country_code?: number;
        /**
         * The actual phone number, digits only
         */
        number: string;
      };
      /**
       * Indicates whether this address is the default address for the customer
       */
      default?: boolean;
    }[];
  };
  /**
   * Optional payment method selected by customer (if already selected)
   */
  payment_method?: {
    /**
     * Standardized payment method code
     */
    code:
      | 'credit_card'
      | 'banking_billet'
      | 'online_debit'
      | 'account_deposit'
      | 'debit_card'
      | 'balance_on_intermediary'
      | 'loyalty_points'
      | 'other';
    /**
     * Short description for payment method
     */
    name?: string;
  };
  /**
   * Whether list payments can be refetched on client when payment selected
   */
  can_fetch_when_selected?: boolean;
  /**
   * Whether payment were already chosen and is just being confirmed to complete checkout
   */
  is_checkout_confirmation?: boolean;
}