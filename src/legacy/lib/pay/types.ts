// Datos que viajan dentro del custom_data del checkout y vuelven en el webhook.
// Los numeros viajan como string porque LemonSqueezy exige checkout_data como
// array de {name, value} y los custom values como strings.
export type BidCustomData = {
  key: string;
  url: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  targetCents: string; // centimos como string por exigencia de la API
};

export type OrderResult = {
  provider: string;
  providerPaymentId: string;
  custom: BidCustomData | null;
};