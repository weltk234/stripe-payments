import type { ComponentType } from "react";
import type { SectionSlug } from "@/lib/sections";
import { AllActivityView } from "./all-activity/View";
import { BalancesView } from "./balances/View";
import { ClimateView } from "./climate/View";
import { CollectedFeesView } from "./collected-fees/View";
import { ConnectView } from "./connect/View";
import { ConnectedAccountsView } from "./connected-accounts/View";
import { DevelopersView } from "./developers/View";
import { DisputesView } from "./disputes/View";
import { HomeView } from "./home/View";
import { InvoicesView } from "./invoices/View";
import { IssuingView } from "./issuing/View";
import { PaymentLinksView } from "./payment-links/View";
import { PaymentsAnalyticsView } from "./payments-analytics/View";
import { PayoutsView } from "./payouts/View";
import { ProductCatalogView } from "./product-catalog/View";
import { RadarView } from "./radar/View";
import { ReportsView } from "./reports/View";
import { RevenueRecognitionView } from "./revenue-recognition/View";
import { SigmaView } from "./sigma/View";
import { SubscriptionsView } from "./subscriptions/View";
import { TaxView } from "./tax/View";
import { TopUpsView } from "./top-ups/View";
import { TransfersView } from "./transfers/View";

/** Page component for every Dashboard section; `satisfies` makes a missing slug a type error. */
export const SECTION_VIEWS = {
  home: HomeView,
  balances: BalancesView,
  "product-catalog": ProductCatalogView,
  payouts: PayoutsView,
  "top-ups": TopUpsView,
  "collected-fees": CollectedFeesView,
  transfers: TransfersView,
  "all-activity": AllActivityView,
  "payments-analytics": PaymentsAnalyticsView,
  reports: ReportsView,
  sigma: SigmaView,
  radar: RadarView,
  connect: ConnectView,
  "connected-accounts": ConnectedAccountsView,
  disputes: DisputesView,
  "payment-links": PaymentLinksView,
  subscriptions: SubscriptionsView,
  invoices: InvoicesView,
  "revenue-recognition": RevenueRecognitionView,
  tax: TaxView,
  issuing: IssuingView,
  climate: ClimateView,
  developers: DevelopersView,
} satisfies Record<SectionSlug, ComponentType>;
