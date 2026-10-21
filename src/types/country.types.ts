/** A country from the `countries` table, keyed by ISO 3166-1 alpha-2 code. */
export interface Country {
  code: string;
  name: string;
  /** International dialling code, e.g. "+971". */
  dialCode: string | null;
}
