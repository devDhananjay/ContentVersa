export type PostOffice = {
  name: string;
  branchType: string;
  deliveryStatus: string;
  district: string;
  state: string;
  circle: string;
};

export type PincodeResult = {
  pincode: string;
  offices: PostOffice[];
};

type PostalApiOffice = {
  Name: string;
  BranchType: string;
  DeliveryStatus: string;
  District: string;
  State: string;
  Circle: string;
};

type PostalApiResponse = {
  Status: string;
  PostOffice?: PostalApiOffice[] | null;
};

export async function lookupPincode(pincode: string): Promise<PincodeResult | null> {
  const code = pincode.trim();
  if (!/^\d{6}$/.test(code)) return null;

  const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
    next: { revalidate: 604800 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as PostalApiResponse[];
  const block = data?.[0];
  if (!block || block.Status !== "Success" || !block.PostOffice?.length) {
    return null;
  }

  return {
    pincode: code,
    offices: block.PostOffice.map((o) => ({
      name: o.Name,
      branchType: o.BranchType,
      deliveryStatus: o.DeliveryStatus,
      district: o.District,
      state: o.State,
      circle: o.Circle,
    })),
  };
}
