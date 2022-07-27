/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Triggered when order is being closed, must create payment transaction and return info
 */
export interface CreateTransactionParams {
  /**
   * Products composing the cart
   *
   * @maxItems 3000
   */
  items: {
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
  amount: {
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
   * Transaction type
   */
  type?: 'payment' | 'recurrence';
  /**
   * Chosen payment method object
   */
  payment_method: {
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
   * Order buyer info
   */
  buyer: {
    /**
     * Customer ID in the store
     */
    customer_id: string;
    /**
     * Buyer email address
     */
    email: string;
    /**
     * Customer full name or company corporate name
     */
    fullname: string;
    /**
     * Customer gender, female, male or third gender (X)
     */
    gender?: 'f' | 'm' | 'x';
    /**
     * Date of customer birth
     */
    birth_date: {
      /**
       * Day of birth
       */
      day?: number;
      /**
       * Number of month of birth
       */
      month?: number;
      /**
       * Year of birth
       */
      year?: number;
    };
    /**
     * Buyer contact phone
     */
    phone: {
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
    };
    /**
     * Physical or juridical (company) person
     */
    registry_type: 'p' | 'j';
    /**
     * Country of document origin, an ISO 3166-2 code
     */
    doc_country?: string;
    /**
     * Responsible person or organization document number (only numbers)
     */
    doc_number: string;
    /**
     * Municipal or state registration if exists
     */
    inscription_type?: 'State' | 'Municipal';
    /**
     * Municipal or state registration number (with characters) if exists
     */
    inscription_number?: string;
  };
  /**
   * Transation payer info
   */
  payer?: {
    /**
     * Payer full name or company corporate name
     */
    fullname?: string;
    /**
     * Date of payer birth
     */
    birth_date?: {
      /**
       * Day of birth
       */
      day?: number;
      /**
       * Number of month of birth
       */
      month?: number;
      /**
       * Year of birth
       */
      year?: number;
    };
    /**
     * Payer contact phone
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
      /**
       * The type of phone
       */
      type?: 'home' | 'personal' | 'work' | 'other';
    };
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
  };
  /**
   * ID of customer account in the intermediator
   */
  intermediator_buyer_id?: string;
  billing_address?: Address;
  to?: Address1;
  /**
   * Credit card data, if payment will be done with credit card
   */
  credit_card?: {
    /**
     * Full name of the holder, as it is on the credit card
     */
    holder_name?: string;
    /**
     * Issuer identification number (IIN), known as bank identification number (BIN)
     */
    bin?: number;
    /**
     * Credit card issuer name, eg.: Visa, American Express, MasterCard
     */
    company?: string;
    /**
     * Last digits (up to 4) of credit card number
     */
    last_digits?: string;
    /**
     * Unique credit card token
     */
    token?: string;
    /**
     * Credit card CVV number (Card Verification Value)
     */
    cvv?: number;
    /**
     * Credit card encrypted hash
     */
    hash?: string;
    /**
     * Whether the hashed credit card should be saved for further use
     */
    save?: boolean;
  };
  /**
   * Number of installments chosen
   */
  installments_number?: number;
  /**
   * Customer's loyalty points applied, program ID as property
   */
  loyalty_points_applied?: {
    /**
     * Number of loyalty points used
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-z0-9_]{2,30}$".
     */
    [k: string]: number;
  };
  /**
   * ID of created order
   */
  order_id?: string;
  /**
   * Number of created order
   */
  order_number: number;
  /**
   * Payment or order ID if pre committed on gateway (authorization/capture)
   */
  open_payment_id?: string;
  /**
   * UTM campaign HTTP parameters
   */
  utm?: {
    /**
     * Parameter "utm_source", the referrer: (e.g. google, newsletter)
     */
    source?: string;
    /**
     * Parameter "utm_medium", the marketing medium: (e.g. cpc, banner, email)
     */
    medium?: string;
    /**
     * Parameter "utm_campaign", the product, promo code, or slogan (e.g. spring_sale)
     */
    campaign?: string;
    /**
     * Parameter "utm_term", identifies the paid keywords
     */
    term?: string;
    /**
     * Parameter "utm_content", used to differentiate ads
     */
    content?: string;
  };
  /**
   * Code to identify the affiliate that referred the customer
   */
  affiliate_code?: string;
  /**
   * IP address of the browser used by the customer when placing the order
   */
  browser_ip?: string;
  /**
   * Channel unique identificator
   */
  channel_id?: number;
  /**
   * Channel type or source
   */
  channel_type?: 'ecommerce' | 'mobile' | 'pdv' | 'button' | 'facebook' | 'chatbot';
  /**
   * Store domain name (numbers and lowercase letters, eg.: www.myshop.sample)
   */
  domain?: string;
  /**
   * Language two letters code, sometimes with region, eg.: pt_br, fr, en_us
   */
  lang?: string;
}
/**
 * The mailing address associated with the payment method
 */
export interface Address {
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
}
/**
 * Shipping address (recipient)
 */
export interface Address1 {
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
}