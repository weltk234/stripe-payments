import type { CardBrand, WalletType } from "@/lib/types";

/** Payment-method marks as they appear in the Dashboard table (18×18 tiles, 4px radius). */
const TILE = { width: 18, height: 18, viewBox: "0 0 18 18", "aria-hidden": true } as const;

export function VisaIcon() {
  return (
    <svg {...TILE}>
      <rect width="18" height="18" rx="4" fill="#2453A7" />
      <text
        x="9"
        y="11"
        textAnchor="middle"
        fontSize="5.6"
        fontWeight="800"
        fontStyle="italic"
        fill="#fff"
        fontFamily="Arial, sans-serif"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardIcon() {
  return (
    <svg {...TILE}>
      <rect width="18" height="18" rx="4" fill="#1C1C1C" />
      <circle cx="7.2" cy="9" r="3.4" fill="#EB001B" />
      <circle cx="10.8" cy="9" r="3.4" fill="#F79E1B" />
      <path d="M9 6.12a3.4 3.4 0 0 1 0 5.76 3.4 3.4 0 0 1 0-5.76z" fill="#FF5F00" />
    </svg>
  );
}

export function AmexIcon() {
  return (
    <svg {...TILE}>
      <rect width="18" height="18" rx="4" fill="#2E77BC" />
      <text
        x="9"
        y="10.7"
        textAnchor="middle"
        fontSize="4.6"
        fontWeight="800"
        fill="#fff"
        fontFamily="Arial, sans-serif"
      >
        AMEX
      </text>
    </svg>
  );
}

export function DiscoverIcon() {
  return (
    <svg {...TILE}>
      <rect x="0.5" y="0.5" width="17" height="17" rx="3.5" fill="#fff" stroke="#E3E8EE" />
      <rect x="2.5" y="7.6" width="13" height="2.8" rx="1.4" fill="#F48120" />
      <text
        x="9"
        y="6.2"
        textAnchor="middle"
        fontSize="3.2"
        fontWeight="700"
        fill="#231F20"
        fontFamily="Arial, sans-serif"
      >
        DISCOVER
      </text>
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg {...TILE}>
      <rect width="18" height="18" rx="4" fill="#00D66F" />
      <path d="M7 4.6 11.4 9 7 13.4" stroke="#011E0F" strokeWidth="2.4" fill="none" strokeLinecap="square" />
    </svg>
  );
}

export function ApplePayIcon() {
  return (
    <svg {...TILE}>
      <rect width="18" height="18" rx="4" fill="#000" />
      <g transform="translate(2 2)">
        <path
          fill="#fff"
          d="M9.36 7.3c0-.96.79-1.43.83-1.45a1.8 1.8 0 0 0-1.41-.76c-.6-.06-1.17.35-1.47.35-.31 0-.77-.34-1.27-.33-.65 0-1.25.38-1.59.96-.68 1.18-.17 2.92.49 3.88.32.47.71 1 1.21.98.49-.02.67-.31 1.26-.31.58 0 .75.31 1.26.3.52 0 .85-.48 1.17-.95.37-.54.52-1.06.53-1.09-.01 0-1.01-.39-1.01-1.58zM8.4 4.48c.27-.32.45-.77.4-1.22-.39.02-.86.26-1.13.58-.25.29-.47.75-.41 1.19.43.03.87-.22 1.14-.55z"
        />
      </g>
    </svg>
  );
}

export function GooglePayIcon() {
  return (
    <svg {...TILE}>
      <rect x="0.5" y="0.5" width="17" height="17" rx="3.5" fill="#fff" stroke="#E3E8EE" />
      <text
        x="9"
        y="12.4"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#4285F4"
        fontFamily="Arial, sans-serif"
      >
        G
      </text>
    </svg>
  );
}

export function BankIcon() {
  return (
    <svg {...TILE}>
      <rect x="0.5" y="0.5" width="17" height="17" rx="3.5" fill="#F5F6F8" stroke="#D5DBE1" />
      <path
        d="M9 3.6 4 6.2h10L9 3.6zM4.9 7h1.3v4.4H4.9zM8.35 7h1.3v4.4h-1.3zM11.8 7h1.3v4.4h-1.3zM4 12.2h10v1.3H4z"
        fill="#687385"
      />
    </svg>
  );
}

export const CARD_BRAND_ICON: Record<CardBrand, () => React.JSX.Element> = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
};

export const WALLET_ICON: Record<WalletType, () => React.JSX.Element> = {
  link: LinkIcon,
  apple_pay: ApplePayIcon,
  google_pay: GooglePayIcon,
};
