/** Indian Railways helpers — format checks + official deep links. */

export function isValidPnr(pnr: string): boolean {
  return /^\d{10}$/.test(pnr.trim());
}

export function isValidTrainNumber(train: string): boolean {
  return /^\d{4,5}$/.test(train.trim());
}

export function pnrCheckLinks(pnr: string) {
  const p = encodeURIComponent(pnr.trim());
  return [
    {
      label: "ConfirmTkt PNR status",
      href: `https://www.confirmtkt.com/pnr/${p}`,
    },
    {
      label: "RailYatri PNR status",
      href: `https://www.railyatri.in/pnr-status/${p}`,
    },
    {
      label: "IRCTC (login may be required)",
      href: "https://www.irctc.co.in/nget/train-search",
    },
  ];
}

export function trainStatusLinks(trainNumber: string) {
  const t = encodeURIComponent(trainNumber.trim());
  return [
    {
      label: "RailYatri live train status",
      href: `https://www.railyatri.in/live-train-status/${t}`,
    },
    {
      label: "ConfirmTkt running status",
      href: `https://www.confirmtkt.com/train-running-status/${t}`,
    },
    {
      label: "NTES (official enquiry)",
      href: "https://enquiry.indianrail.gov.in/ntes/",
    },
  ];
}

export type PnrPassenger = {
  bookingStatus?: string;
  currentStatus?: string;
  coach?: string;
  berth?: string;
};

export type PnrLookupResult = {
  ok: boolean;
  pnr: string;
  trainNumber?: string;
  trainName?: string;
  from?: string;
  to?: string;
  journeyDate?: string;
  chartPrepared?: boolean;
  passengers?: PnrPassenger[];
  message?: string;
  source?: string;
};

/**
 * Best-effort public PNR lookup. Indian Railways has no stable free API —
 * we try a known public JSON endpoint and fail soft.
 */
export async function lookupPnr(pnr: string): Promise<PnrLookupResult> {
  const clean = pnr.trim();
  if (!isValidPnr(clean)) {
    return { ok: false, pnr: clean, message: "PNR must be exactly 10 digits." };
  }

  try {
    const url = `https://www.confirmtkt.com/api/pnr/status?pnr=${clean}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ContentVerse/1.0 (+https://contentverse.co.in)",
      },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const trainNumber = String(
        data.trainNumber || data.trainNo || data.TrainNo || ""
      );
      if (trainNumber || data.trainName || data.from) {
        return {
          ok: true,
          pnr: clean,
          trainNumber: trainNumber || undefined,
          trainName: String(data.trainName || data.TrainName || "") || undefined,
          from: String(data.from || data.From || "") || undefined,
          to: String(data.to || data.To || "") || undefined,
          journeyDate: String(data.doj || data.journeyDate || "") || undefined,
          chartPrepared: Boolean(data.chartPrepared ?? data.ChartPrepared),
          source: "confirmtkt",
          message: "Live status fetched. Always reconfirm on IRCTC before travel.",
        };
      }
    }
  } catch {
    /* fall through */
  }

  return {
    ok: false,
    pnr: clean,
    message:
      "Live PNR feed is temporarily unavailable. Use the official check links below — they open with your PNR.",
  };
}

export type TrainStatusResult = {
  ok: boolean;
  trainNumber: string;
  message?: string;
  links: ReturnType<typeof trainStatusLinks>;
};

export function buildTrainStatusResult(trainNumber: string): TrainStatusResult {
  const clean = trainNumber.trim();
  if (!isValidTrainNumber(clean)) {
    return {
      ok: false,
      trainNumber: clean,
      message: "Enter a valid 4–5 digit Indian train number (e.g. 12951).",
      links: [],
    };
  }
  return {
    ok: true,
    trainNumber: clean,
    message:
      "Open a live status provider below. NTES is the official Indian Railways enquiry site.",
    links: trainStatusLinks(clean),
  };
}
