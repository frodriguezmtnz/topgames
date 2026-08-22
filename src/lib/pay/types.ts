// Datos que viajan dentro del custom_data del checkout y vuelven en el webhook.
export type BidCustomData = {
  key: string;
  url: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  targetCents: number;
};

export type OrderResult = {
  provider: string;
  providerPaymentId: string;
  custom: BidCustomData | null;
};