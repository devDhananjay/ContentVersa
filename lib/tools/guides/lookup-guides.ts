import type { ToolGuide } from "../tool-guide-types";

/** Lookup, ID-format, travel and daily-info tools. */
export const LOOKUP_GUIDES: Partial<Record<string, ToolGuide>> = {
  "ifsc-finder": {
    intro:
      "IFSC (Indian Financial System Code) is an 11-character code that identifies a specific bank branch for electronic transfers such as NEFT, RTGS and IMPS. A wrong IFSC can delay a payment or send it back, so it is worth checking before you add a beneficiary. This free IFSC finder shows the bank name, branch, address, MICR code and supported payment modes for any IFSC, and helps you find a code when you only know the bank and city.",
    sections: [
      {
        heading: "How to find an IFSC code step by step",
        paragraphs: [
          "Type the 11-character IFSC into the box and press “Find branch”. The tool shows the bank, branch, district and state it belongs to. Check that they match your passbook, cheque book or the beneficiary’s details. If you do not have the code, find it on a cheque leaf, in your net-banking profile or on the bank’s official branch locator, then paste it here to verify.",
          "For large payments, confirm the IFSC from a second trusted source, such as the bank’s SMS, the printed cheque or the bank’s official website. A quick check takes seconds and avoids a failed transfer.",
        ],
        bullets: [
          "Enter the 11-character IFSC and press Find branch",
          "Compare the bank, branch, district and state with your records",
          "Compare the result with your cheque book or passbook before you pay",
        ],
      },
      {
        heading: "How an IFSC code is structured",
        paragraphs: [
          "The first four characters are letters that identify the bank, for example SBIN for State Bank of India or HDFC for HDFC Bank. The fifth character is always the digit zero, reserved for future use. The last six characters are letters or digits identifying the branch.",
          "Because the format is fixed, many errors can be spotted at a glance: a code that is shorter than 11 characters, has a letter instead of the zero in the fifth position, or has an unknown bank prefix is probably mistyped.",
        ],
      },
      {
        heading: "NEFT, RTGS and IMPS: when the IFSC is needed",
        paragraphs: [
          "NEFT, RTGS and IMPS to a new beneficiary all use the account number together with the IFSC. UPI usually uses a VPA or a mobile number instead, but UPI payments linked to a bank account still use the IFSC behind the scenes. Salary credits, EMI mandates, mutual fund redemptions and tax refunds also rely on a correct IFSC.",
          "The result also shows which payment modes the branch supports where that data is available, so you can pick the right mode for large or urgent payments.",
        ],
        bullets: [
          "NEFT: any amount, settles in batches throughout the day",
          "RTGS: usually for high-value transfers above ₹2 lakh, settles in real time",
          "IMPS: instant, available round the clock",
        ],
      },
      {
        heading: "Common IFSC mistakes and how to avoid them",
        paragraphs: [
          "Branches merge and banks amalgamate. After a merger, branches may get a new IFSC and the old one may stop working. If a transfer fails, check whether your bank has recently merged with another. Using the latest code from your bank’s website or passbook avoids this.",
          "Never rely on an IFSC received only over an unverified message. Fraudsters sometimes send altered bank details. Confirm the beneficiary’s name and account number as well as the code before you confirm a payment.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — verifying a vendor’s bank details",
        body: "A vendor sends account number and IFSC for a first payment. Paste the IFSC here and check that the bank and the city match the address on the vendor’s invoice. If they do not match, call the vendor before you pay.",
      },
      {
        title: "Example 2 — confirming an IFSC from an old cheque book",
        body: "You have the IFSC from an old cheque book but are not sure the branch still exists. Paste it here to confirm the branch name, district and state, then compare with your bank’s latest details before you set up an EMI or salary mandate.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/emi-calculator", label: "EMI calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "What does each part of an IFSC code mean?",
        a: "The first four letters identify the bank, the fifth character is zero, and the last six characters identify the branch.",
      },
      {
        q: "Is the IFSC the same as the MICR code?",
        a: "No. The IFSC is an 11-character alphanumeric code used for electronic transfers. MICR is a 9-digit code printed on cheques that is used for cheque clearing.",
      },
      {
        q: "What if my transfer fails because of a wrong IFSC?",
        a: "The money is normally returned to your account within a few working days. Contact your bank if the refund does not arrive, and re-enter the correct IFSC for the next attempt.",
      },
      {
        q: "Do all branches of a bank share one IFSC?",
        a: "No. Every branch has its own IFSC, so use the code of the branch where the account is held.",
      },
    ],
    ymylKind: "finance",
  },

  "pincode-finder": {
    intro:
      "A PIN (Postal Index Number) code is the 6-digit code that India Post uses to route letters and parcels to the right delivery area. Couriers, e-commerce sites, banks and government forms all ask for it. This free pincode finder takes a 6-digit PIN and shows the post offices, district and state that belong to it, so you can confirm that a PIN matches the locality you expect.",
    sections: [
      {
        heading: "How to use the pincode finder",
        paragraphs: [
          "Type the 6-digit PIN code and search. The result lists the post offices covered by that PIN with their district and state. Check that the post office and district match your locality before you copy the PIN into a form or order. If you only know the area name, find the PIN on an address label or a courier’s website first, then verify it here.",
          "Some neighbourhoods are close to the border between two PIN areas. If you live near the boundary, confirm the PIN with the courier’s serviceability check or ask your local post office which one to use for your building.",
        ],
        bullets: [
          "Enter the 6-digit PIN and search",
          "Check that the post office, district and state match your area",
          "Cross-check with a courier’s pin-code serviceability page for important orders",
        ],
      },
      {
        heading: "How a PIN code is organised",
        paragraphs: [
          "The first digit identifies a postal zone of the country. For example, 1 covers Delhi, Haryana, Punjab and the northern hill states; 4 covers Maharashtra, Goa and parts of central India; 6 covers Kerala and Tamil Nadu; 7 covers West Bengal, Odisha and the north-east. The second digit marks a sub-zone, the third marks a sorting district, and the last three digits identify the specific delivery post office.",
          "This structure lets mail be sorted quickly, which is why a wrong digit can send a parcel to a different region altogether.",
        ],
      },
      {
        heading: "Why the right PIN matters",
        paragraphs: [
          "A wrong PIN code is one of the most common reasons for failed deliveries, extra delays and cash-on-delivery returns. Banks and telecom providers also use the address on KYC forms; a mismatch between the PIN and the city can lead to rejection or follow-up calls.",
          "Keep your home and work PIN codes saved in a note so you can fill forms quickly and accurately.",
        ],
        bullets: [
          "Match the PIN to the post office and the district shown in the result",
          "Use the same PIN spelling on all KYC documents",
          "Large societies sometimes get a separate delivery PIN; confirm if you are in a new locality",
        ],
      },
      {
        heading: "Delivery and non-delivery post offices",
        paragraphs: [
          "India Post classifies offices as delivery or non-delivery. A non-delivery sub-post office does not deliver mail directly; mail for that PIN is delivered through the head or another delivery office in the area. If a listing shows non-delivery, use it as the address PIN but expect delivery to be handled by the parent office.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — placing an online order",
        body: "Your area seems to have two possible PIN codes. Look up each PIN here, see which post office and district it maps to, and then enter the matching one on the seller’s serviceability checker.",
      },
      {
        title: "Example 2 — filling a KYC form",
        body: "Look up your PIN and confirm the district and state match the address on your Aadhaar. Entering the same PIN on every form avoids mismatch queries.",
      },
    ],
    relatedLinks: [
      { href: "/tools/ifsc-finder", label: "IFSC finder" },
      { href: "/tools/rto-finder", label: "RTO finder" },
      { href: "/tools/nearby-places", label: "Nearby places" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How many digits does an Indian PIN code have?",
        a: "Six digits. The first identifies the postal zone and the last three identify the delivery post office.",
      },
      {
        q: "Can one city have many PIN codes?",
        a: "Yes. Large cities have dozens or hundreds of PIN codes, each covering a part of the city.",
      },
      {
        q: "What if my locality shows more than one PIN?",
        a: "Check with your courier or local post office. Use the one your address documents and the courier’s serviceability list accept.",
      },
      {
        q: "Is this an official India Post tool?",
        a: "No. It is an independent lookup built on public PIN code data. For official confirmation use India Post.",
      },
    ],
    ymylKind: "general",
  },

  "rto-finder": {
    intro:
      "Every vehicle registered in India carries a state and RTO code that identifies the Regional Transport Office that registered it. This RTO finder lets you search more than 1,200 RTO codes by city, district or state and shows the office name and address. Use it to find the RTO code for a city, identify where a vehicle was registered or locate the right office for licence and registration work.",
    sections: [
      {
        heading: "How to use the RTO finder",
        paragraphs: [
          "Type a city name, a district or a code such as MH12 or UP25 in the search box. The results show the RTO code, office name and address where available. Add the state name or code to your search if a city name appears in more than one state.",
          "If you want to know which office a particular vehicle number came from, take the first four characters of the plate (state letters and the two-digit RTO number) and search them.",
        ],
        bullets: [
          "Search by code, city or district",
          "Add the state to the search if the city name is common",
          "Confirm the address on the transport department’s official site before visiting",
        ],
      },
      {
        heading: "How RTO codes work",
        paragraphs: [
          "A standard registration number looks like MH12AB1234. The first two letters stand for the state or union territory, the next two digits identify the RTO or district office within that state, followed by one to three letters for the series and a four-digit number. The RTO code usually maps to a city or district, such as 12 for Pune in Maharashtra.",
          "New offices are created from time to time, so the list of codes grows. That is why different cities in the same state can have codes that look sequential but are not always geographically close.",
        ],
      },
      {
        heading: "What you can do at an RTO",
        paragraphs: [
          "RTOs handle new vehicle registration, renewal of registration, transfer of ownership, driving licences, fitness certificates, permits and No Objection Certificates. Many of these services have moved online on the Parivahan portal, so check whether you can complete the task without a visit.",
          "When you move to another state you must re-register your vehicle with the new state’s RTO within the time the law allows, usually through an NOC from the original office.",
        ],
        bullets: [
          "Keep original documents ready, including RC, insurance and PUC",
          "Book appointments online where the state supports it",
          "Use only government portals for fees; avoid unofficial agents asking for extra money",
        ],
      },
      {
        heading: "BH series and special plates",
        paragraphs: [
          "The Bharat (BH) series lets people who move frequently between states, such as defence personnel and some private-sector employees, keep one registration number across India. BH plates do not follow the state-and-RTO format and instead use a year, BH, a number and letters.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — what does MH12 mean?",
        body: "MH is Maharashtra and 12 is the RTO code for Pune. A vehicle with a plate starting MH12 was registered at the Pune RTO.",
      },
      {
        title: "Example 2 — finding the office for a new registration",
        body: "Search your city to see its RTO code and address, then book an appointment through your state’s transport portal for the inspection or document verification.",
      },
    ],
    relatedLinks: [
      { href: "/tools/vehicle-plate-decoder", label: "Vehicle plate decoder" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools/fuel-price", label: "Fuel price" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "What does RTO stand for?",
        a: "Regional Transport Office. It is the state government office that registers vehicles and issues driving licences in a region.",
      },
      {
        q: "Does the tool show vehicle owner details?",
        a: "No. Owner information is not public through this tool. Use the official Parivahan or Vahan services for permitted checks.",
      },
      {
        q: "Are all RTO codes covered?",
        a: "The database covers more than 1,200 codes, but new offices are added by states over time, so a recent code may be missing.",
      },
      {
        q: "Can I transfer my vehicle to another state?",
        a: "Yes, by obtaining an NOC from your current RTO and re-registering in the new state within the permitted period.",
      },
    ],
    ymylKind: "general",
  },

  "vehicle-plate-decoder": {
    intro:
      "Indian vehicle number plates carry useful information: the state, the RTO that registered the vehicle and a series number. This decoder reads a registration number and tells you the state and RTO code, and recognises Bharat (BH) series plates. It is helpful when you are buying a used vehicle, checking where a car is registered or simply curious about a plate you see on the road.",
    sections: [
      {
        heading: "How to use the plate decoder",
        paragraphs: [
          "Type the registration number with or without spaces, for example DL3CAB1234 or MH12AB1234. The tool splits it into state, RTO, series and number and shows the state and the registering office where known.",
          "The decoder reads only what is printed in the number. It does not look up the owner or the vehicle’s history. For paperwork checks, use the official Parivahan services.",
        ],
        bullets: [
          "Enter the full plate; spaces and hyphens are ignored",
          "BH series plates are detected separately",
          "The result shows the state and RTO code only",
        ],
      },
      {
        heading: "How to read an Indian number plate",
        paragraphs: [
          "A standard plate follows the pattern SS NN XX NNNN. SS is the two-letter state or union territory code (DL, MH, KA, TN), NN is the two-digit RTO or district code, XX is a one-to-three-letter series, and the last four digits are the unique number.",
          "For example, KA01AB1234 was registered in Karnataka at the RTO coded 01, which is Bengaluru Central. The series letters change as numbers run out for a particular RTO.",
        ],
      },
      {
        heading: "BH series and other special plates",
        paragraphs: [
          "The Bharat series uses the format YY BH NNNN XX, where YY is the year of initial registration, BH marks the series, NNNN is a four-digit number and XX is one or two letters. It is meant for people who relocate across states often so they do not need to re-register.",
          "Other special plates include green-background plates for electric vehicles, yellow plates for commercial vehicles and plates with arrow marks for military vehicles. Colours indicate the usage category.",
        ],
        bullets: [
          "White plate with black text: private vehicle",
          "Yellow plate with black text: commercial vehicle",
          "Green plate: electric vehicle (white text on green for private)",
        ],
      },
      {
        heading: "Checking a used vehicle safely",
        paragraphs: [
          "Decoding the plate tells you where the vehicle was first registered, which is only one clue. Before buying, verify the RC, check for pending challans, confirm the insurance and verify the chassis and engine numbers against the documents. If the registration state differs from the seller’s city, ask about the NOC and re-registration status.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — decoding MH12AB1234",
        body: "MH means Maharashtra, 12 is the Pune RTO, AB is the series and 1234 is the vehicle number.",
      },
      {
        title: "Example 2 — a BH series number",
        body: "22BH1234AA means a vehicle first registered in 2022 under the Bharat series. The number is valid across states without re-registration.",
      },
    ],
    relatedLinks: [
      { href: "/tools/rto-finder", label: "RTO finder" },
      { href: "/tools/fuel-price", label: "Fuel price" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Can I find the owner’s name from a number plate?",
        a: "No. Owner details are not available through this tool and are protected. Use the official Vahan or Parivahan services within the permitted limits.",
      },
      {
        q: "What do the letters after the RTO number mean?",
        a: "They are the series letters. When a series reaches 9999 for an RTO, the next series letters are issued.",
      },
      {
        q: "What is a BH series plate?",
        a: "A Bharat series plate lets eligible people keep one registration number across India when they move between states.",
      },
      {
        q: "Why does a plate show a different state from the seller’s city?",
        a: "The vehicle may have been bought or registered elsewhere. Ask for the NOC and confirm it has been re-registered where required.",
      },
    ],
    ymylKind: "general",
  },

  "pan-gstin-checker": {
    intro:
      "A PAN (Permanent Account Number) is a 10-character ID issued by the Income Tax Department, and a GSTIN is the 15-character Goods and Services Tax Identification Number issued to registered businesses. This tool validates the format of a PAN or GSTIN and decodes what is inside it: the entity type, the state code and the checksum. It is a quick way to catch typing mistakes in invoices and forms. It does not confirm that a number is active with the government.",
    sections: [
      {
        heading: "How to use the PAN / GSTIN checker",
        paragraphs: [
          "Choose the PAN or GSTIN tab, then type or paste the number. The tool checks the length, the pattern of letters and digits, and, for GSTIN, the checksum character. If the format is valid, it shows the decoded details such as the taxpayer type from the fourth character of the PAN and the state from the first two digits of the GSTIN.",
          "A valid format does not prove the number belongs to a real, active taxpayer. To confirm registration status, use the official search on the GST portal or the Income Tax e-filing portal.",
        ],
        bullets: [
          "PAN pattern: five letters, four digits, one letter (for example ABCDE1234F)",
          "GSTIN pattern: two-digit state code, 10-character PAN, entity number, the letter Z and a checksum",
          "Format checks catch most typing errors",
        ],
      },
      {
        heading: "What a PAN tells you",
        paragraphs: [
          "The first three characters are an alphabetic series, the fourth character shows the type of holder, the fifth is usually the first letter of the surname (for individuals) or the entity’s name, followed by four digits and a check letter. The fourth character is useful: P is an individual, C a company, H a Hindu Undivided Family, F a firm, A an association of persons, T a trust, B a body of individuals, L a local authority, J an artificial juridical person and G a government entity.",
          "For example, a PAN starting ABCPK on the fourth place with P belongs to an individual. If an invoice for a company carries a PAN with the fourth character P, double-check the details.",
        ],
      },
      {
        heading: "How a GSTIN is built",
        paragraphs: [
          "The first two digits are the state code (for example 27 for Maharashtra and 07 for Delhi). The next ten characters are the PAN of the taxpayer. The thirteenth character is the number of registrations the same PAN holds in that state, the fourteenth is the letter Z by default and the fifteenth is a checksum character.",
          "Because the PAN is embedded in the GSTIN, you can cross-check the two. If the PAN on an invoice does not match the middle ten characters of the GSTIN, ask the supplier to correct it before you claim input tax credit.",
        ],
        bullets: [
          "Check the GSTIN on every B2B invoice before claiming input tax credit",
          "Match the supplier’s legal name on the GST portal with the invoice",
          "Never share OTPs or passwords with anyone claiming to verify your GST number",
        ],
      },
      {
        heading: "Format check versus live verification",
        paragraphs: [
          "A format check is offline. It tells you the number is structured correctly but not whether it is registered, cancelled or suspended. The official GST portal’s “Search Taxpayer” and the Income Tax portal’s “Verify PAN” services do that. Use both when the amount involved is significant.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — checking a supplier’s GSTIN",
        body: "A supplier shares GSTIN 27ABCDE1234F1Z5. The first two digits 27 point to Maharashtra, the middle characters ABCDE1234F are the PAN and the thirteenth character is 1. If your supplier is in Gujarat, ask why the state code is 27.",
      },
      {
        title: "Example 2 — catching a typing error in a PAN",
        body: "A PAN typed as ABCDE12345 has digits where the last letter should be, so the tool shows an invalid format. Fix the last character before you submit a KYC form.",
      },
    ],
    relatedLinks: [
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/tools/fssai-checker", label: "FSSAI checker" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Does this tool confirm that a PAN or GSTIN is active?",
        a: "No. It validates the format only. Use the official Income Tax and GST portals to verify live status.",
      },
      {
        q: "What does the fourth character of a PAN mean?",
        a: "It indicates the holder type. For example P is an individual, C a company, H a Hindu Undivided Family and F a firm.",
      },
      {
        q: "What is the state code in a GSTIN?",
        a: "The first two digits identify the state or union territory where the taxpayer is registered, such as 27 for Maharashtra and 29 for Karnataka.",
      },
      {
        q: "Is it safe to type a PAN here?",
        a: "The check runs in your browser and the number is not stored by us. As a general rule, share your PAN only with parties that need it.",
      },
    ],
    ymylKind: "tax",
  },

  "fssai-checker": {
    intro:
      "Every food business in India, from a street stall to a manufacturer, must hold an FSSAI registration or licence number. It appears as a 14-digit number on food labels, shop boards and invoices. This tool checks whether an FSSAI number is in the right 14-digit format. It is a quick first screen for consumers, retailers and small businesses. The live status of a licence should always be confirmed on the official FoSCoS portal.",
    sections: [
      {
        heading: "How to use the FSSAI checker",
        paragraphs: [
          "Type the 14-digit number you see on a food pack, a restaurant’s certificate or an invoice. The tool strips spaces and confirms whether it has exactly 14 digits. If the format is wrong it explains why, such as a missing digit or non-numeric characters.",
          "A correctly formatted number can still be fake or expired. After the format check, open the FoSCoS website and verify the licence or registration status to be sure.",
        ],
        bullets: [
          "FSSAI numbers have exactly 14 digits",
          "Spaces and hyphens are ignored by the tool",
          "Confirm status on the official FoSCoS portal",
        ],
      },
      {
        heading: "What an FSSAI number represents",
        paragraphs: [
          "The number is the unique identity of a food business operator. Broadly, the digits encode whether the business holds a registration or a licence, the state where it was issued, the year and a serial sequence. Small businesses under the turnover limit get a basic registration, and larger ones need a state or central licence.",
          "By law, every food label, invoice and licence-holder’s premises must display the FSSAI number. If a pack does not show a number, treat it with caution.",
        ],
      },
      {
        heading: "Who needs FSSAI registration or licence",
        paragraphs: [
          "Anyone who makes, stores, distributes, sells or imports food needs to be covered. Very small operators such as hawkers and small vendors take a basic registration, while larger manufacturers, caterers, restaurants and e-commerce food sellers take a state or central licence depending on their size and operations.",
          "Cloud kitchens and home bakers selling commercially also need to be registered, even if they work from home. Penalties apply to those who operate without a valid registration.",
        ],
        bullets: [
          "Display the FSSAI number on your premises, packaging and invoices",
          "Renew before the licence expires to avoid penalties",
          "Report a suspicious product through the FSSAI Food Safety Connect channels",
        ],
      },
      {
        heading: "For consumers: a quick safety routine",
        paragraphs: [
          "Look for the green FSSAI logo and the 14-digit number on packaged food. Check the manufacturing and expiry dates, buy from sealed packs, and avoid products with an unreadable or missing number. If something looks wrong, verify on FoSCoS or file a complaint with the food safety authority.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — checking a packed snack",
        body: "You read the 14-digit number on the back of the pack and enter it here. If the format is valid, open FoSCoS to confirm the business name and licence status.",
      },
      {
        title: "Example 2 — verifying a supplier as a restaurant owner",
        body: "Ask each food supplier for their FSSAI number and keep a copy. Run it through the format check and verify the licence on FoSCoS before you place a large order.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/gst-calculator", label: "GST calculator" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Is this a live FSSAI verification?",
        a: "No. It only checks that the number has 14 digits. Use the official FoSCoS portal for live status.",
      },
      {
        q: "What if a product has no FSSAI number?",
        a: "Packaged food sold in India must display an FSSAI number. If it is missing or unclear, avoid the product and consider reporting it.",
      },
      {
        q: "Do home-based food sellers need FSSAI?",
        a: "Yes, if they sell food commercially. The category of registration depends on turnover and the type of business.",
      },
      {
        q: "How do I report unsafe food?",
        a: "Use the FSSAI Food Safety Connect channels or contact your state food safety officer with details and photos of the product.",
      },
    ],
    ymylKind: "general",
  },

  "pnr-status": {
    intro:
      "A PNR (Passenger Name Record) is the 10-digit number printed on every Indian Railways ticket. It lets you track whether your ticket is confirmed, on the RAC list or on the waiting list. This PNR status page helps you validate the number format and then opens trusted railway enquiry sites to check the current status. It also explains what each booking status means and what to do when your ticket is still waitlisted.",
    sections: [
      {
        heading: "How to check your PNR status",
        paragraphs: [
          "Enter the 10-digit PNR from your ticket or booking SMS. The tool validates the format and then helps you open an official or trusted railway enquiry service where the live status is shown. Always cross-check with IRCTC or the railway enquiry before you travel, because the final chart is the only definitive record.",
          "Check the status again after the first chart is prepared, usually about four hours before departure, and again after the final chart, because waitlisted tickets move during that time.",
        ],
        bullets: [
          "PNR is exactly 10 digits",
          "Keep the PNR from the ticket, SMS or e-ticket",
          "Check status after the chart is prepared",
        ],
      },
      {
        heading: "What the booking statuses mean",
        paragraphs: [
          "CNF means the berth is confirmed and the coach and seat are shown. RAC (Reservation Against Cancellation) means you will be allowed to travel but may share a berth until another passenger cancels. WL (Waiting List) means you do not have a seat yet and will be confirmed only if others cancel.",
          "Waiting lists come in types: GNWL is the general waiting list and has the best chance of moving, RLWL is remote location, PQWL is pooled quota and TQWL is tatkal quota. A higher waiting number means a lower chance of confirmation.",
        ],
      },
      {
        heading: "Chances of a waitlisted ticket confirming",
        paragraphs: [
          "Cancellations rise close to departure, so a ticket in a short GNWL on a popular train has a decent chance of confirming. Long waiting lists on festival dates rarely clear. If your ticket is in a long waiting list, plan an alternative, such as another train, a different class or a bus.",
          "A fully waitlisted e-ticket is cancelled automatically when the final chart is prepared and the refund is processed to the original payment mode, less the cancellation charge for the class.",
        ],
        bullets: [
          "Tatkal and premium tatkal tickets have different cancellation rules",
          "Never travel on a waitlisted e-ticket in a reserved coach; you may be asked to get down",
          "Use the vikalp option, where available, to be moved to another train",
        ],
      },
      {
        heading: "Tips to keep your travel plans safe",
        paragraphs: [
          "Book early for festival and holiday travel, choose alternative dates when possible and keep a screenshot of the ticket and the ID you booked with. Use only the official IRCTC app and website to book or cancel, and ignore messages or calls that ask for your OTP or card details.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — ticket shows GNWL/12",
        body: "A general waiting list number of 12 means 12 other passengers are ahead of you. On many trains this clears as cancellations come in, so check again after the chart is prepared.",
      },
      {
        title: "Example 2 — ticket shows RAC/5",
        body: "You will be able to board and will share a side-lower berth with another RAC passenger until a berth is freed. RAC tickets have a high chance of full confirmation.",
      },
    ],
    relatedLinks: [
      { href: "/tools/train-running-status", label: "Train running status" },
      { href: "/tools/indian-holidays", label: "Indian holidays" },
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How many digits is a PNR number?",
        a: "A PNR has 10 digits. You can find it on the ticket, the booking SMS and the IRCTC booking history.",
      },
      {
        q: "When is the chart prepared?",
        a: "The first chart is usually prepared about four hours before departure and a final chart is prepared closer to departure. Check your status after both.",
      },
      {
        q: "What does WL mean on my ticket?",
        a: "WL means waiting list. You do not have a berth yet and will get one only if other passengers cancel.",
      },
      {
        q: "Will I get a refund if my waitlisted ticket does not confirm?",
        a: "For an e-ticket the booking is cancelled automatically and the fare is refunded to the original payment method, subject to applicable rules.",
      },
    ],
    ymylKind: "general",
  },

  "train-running-status": {
    intro:
      "Knowing whether your train is on time saves hours at the station. This tool helps you check the live running status of any Indian Railways train by its train number and opens trusted enquiry services, including official railway enquiry, for the current position and delay. It also explains how to read delay information and plan around it.",
    sections: [
      {
        heading: "How to check live train status",
        paragraphs: [
          "Enter the 5-digit train number. The tool validates the number and links to enquiry services that show the last crossed station, the expected arrival at upcoming stations and the delay in minutes.",
          "Train positions update as the train crosses stations or as the location is reported, so there may be a lag of a few minutes. For critical connections, check again as you get close to the station.",
        ],
        bullets: [
          "Train numbers have 5 digits, for example 12951",
          "If a train runs through the night, pick the right journey day on the enquiry site",
          "Refresh the status close to your boarding time",
        ],
      },
      {
        heading: "How to read the delay information",
        paragraphs: [
          "A delay of 0 or a negative number means the train is on time or early. A positive number is the minutes behind schedule. The expected arrival shown for later stations is an estimate; delay can grow or shrink along the route as the train makes up time.",
          "Trains that run late early in the journey often recover some time before the end. But if the delay is caused by a disruption such as fog or a track issue, it can increase.",
        ],
      },
      {
        heading: "Planning around delays",
        paragraphs: [
          "If your train is running more than an hour late, plan where to wait. Many stations have retiring rooms and waiting halls. For a connection, keep a buffer of at least two hours between the arrival of the first train and the departure of the second, and book both tickets on the same PNR where possible so that you are protected in a missed connection.",
          "In winter, fog causes extended delays and cancellations on northern routes. Check the railway’s announcements for the day, and consider alternative dates when travelling during peak fog months.",
        ],
        bullets: [
          "Check for cancelled or rescheduled trains before leaving home",
          "Keep a screenshot of your ticket and ID",
          "For long delays, check refund rules on IRCTC for your ticket",
        ],
      },
      {
        heading: "Refund rules when a train is very late",
        paragraphs: [
          "If a train is delayed by more than three hours at the origin, passengers with e-tickets can generally cancel and claim a full refund through IRCTC. Rules can change, so verify the latest conditions on the IRCTC website before relying on them.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — checking before leaving home",
        body: "Your train leaves at 18:30. At 16:00 the status shows a 90-minute delay at the previous station. You can reach the station about an hour later and avoid waiting on the platform.",
      },
      {
        title: "Example 2 — protecting a connection",
        body: "Your first train arrives at 14:00 and the second leaves at 15:00. If the first is running two hours late you will miss the connection, so look for another train on the route while you are still on the way.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pnr-status", label: "PNR status" },
      { href: "/tools/weather", label: "Weather" },
      { href: "/tools/indian-holidays", label: "Indian holidays" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How accurate is live train running status?",
        a: "It is usually accurate to within a few minutes, but updates depend on station crossings and reporting, so there can be a lag.",
      },
      {
        q: "Is this the official NTES service?",
        a: "No. It helps you open official and trusted enquiry services. For final confirmation use the official railway enquiry.",
      },
      {
        q: "What does a negative delay mean?",
        a: "It means the train is running ahead of schedule at that station.",
      },
      {
        q: "Can I get a refund if my train is very late?",
        a: "Passengers can generally claim a refund if the train is delayed beyond the limit set by the railways. Check the IRCTC refund rules for details.",
      },
    ],
    ymylKind: "general",
  },

  "indian-holidays": {
    intro:
      "Public holidays decide when banks close, offices shut and long weekends happen. This tool lists the public holidays in India for the current and next year, including national holidays such as Republic Day, Independence Day and Gandhi Jayanti, along with major festival holidays. Use it to plan leave, trips, bank work and business schedules.",
    sections: [
      {
        heading: "How to use the holiday calendar",
        paragraphs: [
          "Press the button for the current year or for next year to load that year’s list of holiday names and dates. Scan the list from the top, and combine the dates with weekends to spot long weekends and plan leave around them.",
          "Holiday dates for festivals such as Diwali, Holi, Eid and Dussehra depend on the lunar calendar and are announced by the government each year, so dates for future years may be updated later.",
        ],
        bullets: [
          "Switch between the current and next year with the two year buttons",
          "Look for holidays adjacent to a weekend to plan long breaks",
          "Verify with your employer or bank for state-specific holidays",
        ],
      },
      {
        heading: "National, gazetted and restricted holidays",
        paragraphs: [
          "Three days are national holidays observed across India: Republic Day on 26 January, Independence Day on 15 August and Gandhi Jayanti on 2 October. In addition, the central government notifies a list of gazetted holidays for festivals such as Holi, Diwali, Good Friday, Id-ul-Fitr and Christmas.",
          "Central government employees can also take a limited number of restricted holidays from a notified list. State governments publish their own holiday lists, which often add regional festivals like Pongal, Onam, Bihu or Ganesh Chaturthi.",
        ],
      },
      {
        heading: "Bank holidays and business planning",
        paragraphs: [
          "Bank holidays follow the RBI’s calendar and differ by state. Banks are also closed on the second and fourth Saturdays and on Sundays. Online banking and UPI remain available, but cheque clearing, branch work and some NEFT-linked settlements can be affected, so plan payments before a holiday cluster.",
          "For businesses, check the holiday list when you set delivery dates, payroll dates and GST or TDS due dates, because filing deadlines that fall on a holiday may move to the next working day.",
        ],
        bullets: [
          "Plan salary and vendor payments before a run of holidays",
          "Confirm state-specific holidays for offices in several states",
          "Check the RBI list for exact bank closures in your state",
        ],
      },
      {
        heading: "Planning long weekends",
        paragraphs: [
          "A holiday on a Friday or Monday creates a three-day weekend, and one on a Tuesday or Thursday may be worth bridging with a single day of leave. Book trains and hotels early for such dates, since prices and demand rise sharply.",
        ],
      },
      {
        heading: "Why festival dates change every year",
        paragraphs: [
          "India follows the Gregorian calendar for civil dates, but many festivals follow lunar or lunisolar calendars. Diwali, Holi, Dussehra, Raksha Bandhan and Janmashtami are tied to the Hindu lunisolar calendar and the position of the moon, which is why they fall on different dates each year. Eid and Muharram follow the Islamic lunar calendar, which is about 11 days shorter than the solar year, so they move earlier every year. Fixed-date holidays such as Republic Day, Independence Day, Gandhi Jayanti and Christmas stay on the same date.",
          "For moon-based festivals, the final date can also depend on the sighting of the moon, so the government may confirm it only a few days before. That is why a holiday can shift by a day from an early estimate.",
        ],
        bullets: [
          "Fixed dates: 26 January, 15 August, 2 October, 25 December",
          "Lunar festivals: Diwali, Holi, Dussehra, Eid, Muharram and others move every year",
          "Moon-sighting festivals can be confirmed late",
        ],
      },
      {
        heading: "Holidays for employees, students and businesses",
        paragraphs: [
          "Employees should check the holiday list in their offer letter or company policy, because private companies choose their own list, often based on the central or state calendar. Some companies give optional or floating holidays that you can pick from a list for festivals you celebrate.",
          "Students should check the school or university calendar, which can add days such as foundation day or exam breaks. Businesses should remember that banks, courts, government offices and stock exchanges each follow their own holiday lists, so check the specific notice before you plan a payment, a filing or a hearing.",
        ],
      },
      {
        heading: "Central and state holidays",
        paragraphs: [
          "The list on this page covers central government holidays. State governments add holidays such as regional new years, harvest festivals and the birth anniversaries of local leaders, and some national festivals are not holidays in every state. For exact dates for your state, check your state government’s notification or your employer’s calendar.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — turning one leave day into a five-day break",
        body: "If a holiday falls on a Thursday, taking leave on Friday gives you Thursday to Sunday, and if the previous Wednesday is also free you can stretch it further. Check the list and plan travel early.",
      },
      {
        title: "Example 2 — scheduling a vendor payment",
        body: "If the 1st of the month falls after a long weekend, release the payment on the last working day before the holidays so that the beneficiary receives it on time.",
      },
      {
        title: "Example 3 — checking whether a festival is a holiday in your state",
        body: "A festival may be a gazetted holiday in the central list but a restricted or optional day in your state, or the other way round. Check the list here for the central date, then confirm with your employer or the state notification before you book travel or schedule an exam.",
      },
      {
        title: "Example 4 — planning an annual leave calendar",
        body: "At the start of the year, press the current year button and mark every holiday that falls on a Monday, Friday or just before or after a weekend. These dates are where one or two leave days give a long break, so apply for them early.",
      },
    ],
    relatedLinks: [
      { href: "/tools/pnr-status", label: "PNR status" },
      { href: "/tools/age-calculator", label: "Age calculator" },
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Which holidays are national holidays in India?",
        a: "Republic Day (26 January), Independence Day (15 August) and Gandhi Jayanti (2 October) are observed across the country.",
      },
      {
        q: "Are the dates the same in every state?",
        a: "Central holidays are the same, but states add their own regional holidays. Check your state’s list for exact dates.",
      },
      {
        q: "Why do festival dates change every year?",
        a: "Many festivals follow the lunar calendar, so their dates on the Gregorian calendar shift from year to year.",
      },
      {
        q: "Are banks open on all holidays?",
        a: "No. Bank branches close on holidays notified in the RBI calendar for the state, and on Sundays and the second and fourth Saturdays. Digital services usually work throughout.",
      },
      {
        q: "Does the list include state and bank holidays?",
        a: "The page shows central government holidays. State holidays and RBI bank holidays differ by state, so check your state notification or the RBI list for exact closures.",
      },
      {
        q: "Do Diwali and Holi fall on the same date every year?",
        a: "No. They follow the lunisolar calendar, so the date moves each year. Fixed holidays such as Republic Day and Independence Day stay on the same dates.",
      },
      {
        q: "How can I find next year’s holidays?",
        a: "Press the next-year button on the page to see its list. Dates for moon-based festivals may be confirmed later by the government.",
      },
    ],
    ymylKind: "general",
  },

  weather: {
    intro:
      "Check the current weather and a 7-day forecast for any city in India. The tool shows the current condition, temperature, humidity and wind, plus the expected rainfall for each day, so you can plan your commute, travel, farming work or outdoor events. It uses public weather data and works without sign-up. This page also explains how to read a forecast and what the numbers mean in Indian conditions.",
    sections: [
      {
        heading: "How to use the weather tool",
        paragraphs: [
          "Search for your city or choose from the popular list. The current conditions appear first, followed by a 7-day forecast with minimum and maximum temperature and expected rainfall for each day. Use the expected rainfall and temperature range to decide whether to carry an umbrella, plan a drive or schedule outdoor work.",
          "Forecasts are most reliable for the next two or three days and become less certain after that. Check again the evening before an important event.",
        ],
        bullets: [
          "Search by city name",
          "Read temperature, humidity and wind together, and check rainfall in the daily list",
          "Check the forecast again on the day of an important plan",
        ],
      },
      {
        heading: "How to read the numbers",
        paragraphs: [
          "Temperature is shown in degrees Celsius, with the daily minimum and maximum in the forecast. Humidity tells you how muggy it will feel: in humid coastal cities such as Mumbai and Chennai, 34°C with high humidity feels far hotter than the same temperature in a dry city. The daily rainfall figure is the expected total in millimetres, which tells you how wet the day may be.",
          "Wind speed is shown in km/h and matters for two-wheeler riders and for outdoor events. Strong winds ahead of a storm often come with sudden rain, so it is better to wait than to ride in those conditions.",
        ],
      },
      {
        heading: "India’s seasons and what to expect",
        paragraphs: [
          "India has four broad seasons: winter from December to February, summer from March to May, the monsoon from June to September and a post-monsoon period in October and November. Rainfall, heat and fog vary widely by region. Northern plains see dense winter fog, the west coast gets heavy monsoon rain, and the south-east coast sees rain in the northeast monsoon from October.",
          "During heatwaves, drink water regularly and avoid direct sun in the afternoon. In the monsoon, check the forecast before long drives, since waterlogging and landslides can close roads quickly.",
        ],
        bullets: [
          "Carry an umbrella during the monsoon and in the post-monsoon season",
          "Keep an eye on official IMD alerts for heavy rain, cyclones and heatwaves",
          "Plan early-morning travel during heatwaves and fog",
        ],
      },
      {
        heading: "Weather and travel planning",
        paragraphs: [
          "Combine this tool with train status and flight information when you travel. Fog can delay trains in winter and heavy rain can disrupt flights and roads in the monsoon. If you are going to a hill station, check temperature and the chance of snow or landslides before leaving.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — planning a weekend trip",
        body: "Check the forecast for the destination for Saturday and Sunday. If the forecast shows heavy rainfall for both days, consider moving the trip or choosing indoor plans.",
      },
      {
        title: "Example 2 — scheduling an outdoor event",
        body: "Look at the forecast for the event day. If rainfall is expected, move the programme to a drier day or arrange a covered venue.",
      },
    ],
    relatedLinks: [
      { href: "/tools/train-running-status", label: "Train running status" },
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools/indian-holidays", label: "Indian holidays" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How accurate is the 7-day forecast?",
        a: "The first two to three days are usually reliable. Accuracy decreases for days further away, especially for rainfall.",
      },
      {
        q: "What does the rainfall figure in the forecast mean?",
        a: "It is the expected total rainfall for the day in millimetres. A few millimetres is light rain, while tens of millimetres in a day indicates heavy rain.",
      },
      {
        q: "Is this the official IMD forecast?",
        a: "No. It uses public weather data. For warnings and alerts, check the India Meteorological Department.",
      },
      {
        q: "Why does it feel hotter than the temperature shown?",
        a: "High humidity makes sweat evaporate more slowly, so the body cools less effectively and the same temperature feels hotter. Check the humidity figure alongside the temperature.",
      },
    ],
    ymylKind: "general",
  },
};
