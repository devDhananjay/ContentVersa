export type IfscDetails = {
  bank: string;
  ifsc: string;
  branch: string;
  address: string;
  city: string;
  district: string;
  state: string;
  contact?: string;
  micr?: string;
  rtgs: boolean;
  neft: boolean;
  imps: boolean;
  upi: boolean;
};

type RazorpayIfsc = {
  BANK: string;
  IFSC: string;
  BRANCH: string;
  ADDRESS: string;
  CITY: string;
  DISTRICT: string;
  STATE: string;
  CONTACT?: string;
  MICR?: string;
  RTGS?: boolean;
  NEFT?: boolean;
  IMPS?: boolean;
  UPI?: boolean;
};

export async function lookupIfsc(ifsc: string): Promise<IfscDetails | null> {
  const code = ifsc.trim().toUpperCase();
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) return null;

  const res = await fetch(`https://ifsc.razorpay.com/${code}`, {
    next: { revalidate: 86400 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as RazorpayIfsc;
  if (!data?.IFSC) return null;

  return {
    bank: data.BANK,
    ifsc: data.IFSC,
    branch: data.BRANCH,
    address: data.ADDRESS,
    city: data.CITY,
    district: data.DISTRICT,
    state: data.STATE,
    contact: data.CONTACT,
    micr: data.MICR,
    rtgs: Boolean(data.RTGS),
    neft: Boolean(data.NEFT),
    imps: Boolean(data.IMPS),
    upi: Boolean(data.UPI),
  };
}
