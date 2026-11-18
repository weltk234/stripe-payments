/** The Stripe account shown in the Dashboard chrome and used by the mock data. */
export const ACCOUNT = {
  name: "Tomas Gonzalez",
  initials: "TG",
  id: "acct_1NxTomasGonz8Kp2",
  /** Card statement descriptor (Stripe uppercases it). */
  statementDescriptor: "TOMAS GONZALEZ",
  /** Reserved `.example` TLD, so mock URLs never point at a real site. */
  domain: "tomasgonzalez.example",
  invoicePrefix: "TG",
} as const;

export const pageTitle = (...parts: string[]) => [...parts, ACCOUNT.name, "Stripe"].join(" – ");
