/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Stores {
  _id: string;
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * Store name
   */
  name: string;
  /**
   * Simple description of store
   */
  description?: string;
  /**
   * ID of store main segment, get options and IDs at /segments.json
   */
  segment_id: number;
  /**
   * Responsible person or organization document type
   */
  doc_type: 'CPF' | 'CNPJ';
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
  /**
   * Registered company name or responsible fullname
   */
  corporate_name: string;
  /**
   * Full registered address of company
   */
  address?: string;
  /**
   * Financial contact phone
   */
  phone?: string;
  /**
   * Name of company representative for commercial contact
   */
  representant_name?: string;
  /**
   * Email address of company representative
   */
  representant_email?: string;
  /**
   * Public email address for news and general contact
   */
  contact_email?: string;
  /**
   * Email address to receive notifications, invoices and vouchers
   */
  financial_email: string;
  /**
   * Image link to shop's logo
   */
  logo?: {
    /**
     * Image link
     */
    url: string;
    /**
     * Image size (width x height) in px, such as 100x50 (100px width, 50px height)
     */
    size?: string;
    /**
     * Alternative text, HTML alt tag (important for SEO)
     */
    alt?: string;
  };
  /**
   * Preferred sales channel domain name, with subdomain if any
   */
  domain?: string;
  /**
   * Preferred shop homepage link (full URI)
   */
  homepage?: string;
  /**
   * Main colors to compose shop's visual identity
   */
  brand_colors?: {
    /**
     * Primary color RGB code with #
     */
    primary?: string;
    /**
     * Secondary color RGB code with #
     */
    secondary?: string;
  };
  /**
   * Public contact phone
   */
  contact_phone?: string;
  /**
   * Secondary public contact phone, commonly a cell phone number
   */
  contact_cellphone?: string;
  /**
   * @maxItems 30
   */
  sales_channels?: {
    channel_id: string;
    type?: 'ecommerce' | 'mobile' | 'pos' | 'button' | 'social' | 'chatbot' | 'live';
    title?: string;
  }[];
}
