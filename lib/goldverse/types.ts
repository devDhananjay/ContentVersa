export type HuidRecord = {
  huid: string;
  purity?: string;
  articleType?: string;
  material?: string;
  jewellerName?: string;
  jewellerRegNo?: string;
  jewellerAddress?: string;
  hallmarkCentre?: string;
  ahcRegNo?: string;
  pincode?: string;
  dateOfMarking?: string;
  status?: string;
  weight?: string;
};

export type HuidVerifyResult = {
  ok: boolean;
  source: "mock" | "bis";
  message?: string;
  huid?: string;
  data?: HuidRecord;
};

export type HuidQuotaStatus = {
  used: number;
  limit: number;
  bonusCredits: number;
  remaining: number;
  canVerify: boolean;
  loggedIn: boolean;
};

export type GoldRateRow = {
  city: string;
  gold24k: number;
  gold22k: number;
  gold18k: number;
};

export type GoldPriceSnapshot = {
  rates: GoldRateRow[];
  unit: "per 10g";
  currency: "INR";
  updatedAt: string;
  source: "5paisa" | "yahoo" | "api" | "indicative";
};
