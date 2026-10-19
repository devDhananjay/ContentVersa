import type { ToolGuide, ToolGuideSection } from "../tool-guide-types";

type NearbyCopy = {
  label: string;
  intro: string;
  how: string[];
  sectionA: ToolGuideSection;
  sectionB: ToolGuideSection;
  extra?: ToolGuideSection[];
  examples: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  ymyl?: ToolGuide["ymylKind"];
};

/** Shared how-to for every "near me" tool, with category-specific copy around it. */
function nearbyGuide(c: NearbyCopy): ToolGuide {
  return {
    intro: c.intro,
    sections: [
      {
        heading: `How to find ${c.label} near you`,
        paragraphs: c.how,
        bullets: [
          "Type an area, locality or city, or use your current location if your browser allows it",
          "Choose a radius from 1 km to 20 km",
          "Open a result to see its address and a map link",
        ],
      },
      c.sectionA,
      c.sectionB,
      ...(c.extra ?? []),
      {
        heading: "Location, privacy and accuracy",
        paragraphs: [
          "The tool asks for your location only when you press the “use my location” option, and your browser shows its own permission prompt. If you prefer not to share GPS, type an area or city instead; the search then uses geocoding and needs no permission.",
          "Results come from map data and can be incomplete or slightly out of date, especially in small towns and newly built areas. Always confirm opening hours, availability and the exact address by phone or on the provider’s own page before you travel.",
        ],
      },
    ],
    examples: c.examples,
    relatedLinks: [
      ...c.related,
      { href: "/tools/geo-location", label: "Geo location finder" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      ...c.faqs,
      {
        q: "Why are some places missing from the results?",
        a: "The data comes from map sources that may not list every business, and small or new places can be missing. Try a larger radius or a nearby landmark as the search area.",
      },
    ],
    ymylKind: c.ymyl ?? "general",
  };
}

/** Everyday utilities: dates, codes, language, maps and PDF tools. */
export const UTILITY_GUIDES: Partial<Record<string, ToolGuide>> = {
  "age-calculator": {
    intro:
      "Many forms in India ask for your exact age: school and college admissions, government job applications, insurance, pension schemes and passport or visa paperwork. This age calculator works out your age in years, months and days from your date of birth to today or to any date you choose, and shows how far away your next birthday is. It is useful when an eligibility rule says “as on 1 January” or “as on the last date of application”.",
    sections: [
      {
        heading: "How to use the age calculator",
        paragraphs: [
          "Enter your date of birth, then leave the “As of” date on today or change it to the cut-off date from the notification you are reading. The result shows the completed years, months and days between the two dates.",
          "Changing the “As of” date is the most useful feature. Government recruitment notices usually state a reference date, for example “age as on 1 August of the year”. Enter that date to see whether you meet the minimum or maximum age on the day that counts.",
        ],
        bullets: [
          "Date of birth: use the date printed on your school certificate or Aadhaar",
          "As of: today by default, or any cut-off date in the past or future",
          "Result: completed years, months and days",
        ],
      },
      {
        heading: "How the calculation works",
        paragraphs: [
          "The calculator subtracts the birth date from the reference date field by field. It counts completed years first, then the remaining months, then the remaining days, borrowing from the previous month when needed, using the real number of days in that month. Leap years, including 29 February birthdays, are handled by the calendar.",
          "If your birthday has not yet occurred in the reference year, the year count is one less. That is why a person born on 31 December is still a year younger than a person born on 1 January of the same year until the end of December.",
        ],
      },
      {
        heading: "Where age cut-offs matter in India",
        paragraphs: [
          "Competitive exams and public-sector recruitment fix a minimum and maximum age and often give relaxations for reserved categories, ex-servicemen or persons with disabilities. School admissions use a cut-off date such as 31 March for a given class. Insurance and pension products use age at the nearest or last birthday, which can change the premium.",
          "Always read the notification carefully: some use “age as on” the closing date and some use the first day of a month or year. A difference of a single day can decide eligibility, so calculate against the exact date given.",
        ],
        bullets: [
          "Check the exact reference date in the official notification",
          "Keep a copy of your birth certificate or Class 10 certificate for proof",
          "Category-based age relaxation is declared in the notification, not by this tool",
        ],
      },
      {
        heading: "Age in other ways",
        paragraphs: [
          "Besides completed age, people sometimes ask for age in months for infants, in days for medical records or the number of days until a birthday. The year, month and day result lets you read any of these quickly. For legal purposes the age shown on official documents is always the one that counts.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — checking eligibility for a job notification",
        body: "A notification asks for candidates aged 18 to 27 as on 1 August. Enter your date of birth and set “As of” to 1 August of that year. If the result shows 27 years 11 months, you are within the limit; if it shows 28 years 0 months, you are not.",
      },
      {
        title: "Example 2 — school admission cut-off",
        body: "A school asks that a child must be 5 years old as on 31 March. Enter the child’s date of birth and use 31 March as the reference to see whether the child qualifies for the class.",
      },
    ],
    relatedLinks: [
      { href: "/tools/indian-holidays", label: "Indian holidays" },
      { href: "/tools/pan-gstin-checker", label: "PAN / GSTIN checker" },
      { href: "/tools/salary-tax-calculator", label: "Salary tax calculator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How do I calculate my age on a particular date?",
        a: "Enter your date of birth and set the “As of” field to that date. The tool shows the completed years, months and days between them.",
      },
      {
        q: "How are leap-year birthdays handled?",
        a: "The calculation follows the real calendar, including 29 February, so the result matches how most official systems count completed years.",
      },
      {
        q: "Which date of birth should I use for official forms?",
        a: "Use the date printed on your Class 10 certificate or birth certificate, which is the proof most departments accept.",
      },
      {
        q: "Does this tool apply age relaxation for categories?",
        a: "No. Relaxation is defined in each notification. Calculate your age first, then apply the relaxation as stated in the official document.",
      },
    ],
    ymylKind: "general",
  },

  "qr-generator": {
    intro:
      "A QR code turns a link, text or payment address into a square pattern that a phone camera can read in a second. This free QR code generator creates a QR for any URL, plain text or UPI payment link and lets you download it as a PNG image. It runs in your browser, so what you type is not uploaded to a server. Use it for menus, shop payment boards, Wi-Fi notes, event pages and business cards.",
    sections: [
      {
        heading: "How to create a QR code",
        paragraphs: [
          "Type or paste the content into the box: a website address starting with https://, a line of text, or a UPI link such as upi://pay?pa=name@bank. The QR code updates as you type. When it looks right, press “Download PNG” and save the image.",
          "Before you print or share it, scan the code with your own phone and confirm it opens the right page or payment screen. A single wrong character in a link makes the code useless.",
        ],
        bullets: [
          "Use full links, including https://, so every phone opens them correctly",
          "Keep the content short; shorter text makes a simpler, easier-to-scan code",
          "Test with at least two phones before printing in bulk",
        ],
      },
      {
        heading: "What you can put in a QR code",
        paragraphs: [
          "The most common use is a website link: a restaurant menu, a Google review page, a form or a portfolio. QR codes can also carry plain text such as a Wi-Fi password note, a phone number or an address. For payments in India, a UPI link that includes the payee’s VPA and, optionally, the name and amount lets customers pay from any UPI app.",
          "Static QR codes cannot be edited after printing. If you might change the destination, point the code to a short link you control and update the link later.",
        ],
      },
      {
        heading: "Printing and design tips",
        paragraphs: [
          "Print the code at least 2 cm by 2 cm for close scanning and larger for posters. Keep a quiet margin of white space around it, use dark modules on a light background and avoid placing it on a curved or reflective surface. Low contrast, such as light grey on white, is the most common reason a code fails.",
          "For shop counters, laminate the print or use a stand, and place it where there is good light. For standees and banners, increase the size according to the distance people will scan from.",
        ],
        bullets: [
          "Dark code on a light background scans best",
          "Do not stretch or crop the code",
          "Add a short call to action such as “Scan to pay” or “Scan for menu”",
        ],
      },
      {
        heading: "Safety: scanning and sharing QR codes",
        paragraphs: [
          "Scammers sometimes paste fake QR codes over genuine ones or send codes that ask you to “scan to receive money”. You never need to scan a code or enter a UPI PIN to receive money. Check the payee name shown in your UPI app before you pay, and avoid scanning codes from unknown messages.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — a menu link for a café",
        body: "Paste the link of your online menu, for example https://example.com/menu. Download the PNG, print it on a table card and test it with two phones before you print a batch.",
      },
      {
        title: "Example 2 — a UPI payment board",
        body: "Enter a UPI link of the form upi://pay?pa=yourname@bank&pn=Your%20Shop. Customers scan it with any UPI app and see your shop name before they enter the amount and their own PIN.",
      },
    ],
    relatedLinks: [
      { href: "/tools/barcode-generator", label: "Barcode generator" },
      { href: "/tools/uuid-generator", label: "UUID generator" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Is the QR code generator free?",
        a: "Yes. It is free to use, needs no sign-up and has no watermark on the downloaded image.",
      },
      {
        q: "Are my links or text stored by ContentVerse India?",
        a: "No. The QR code is generated in your browser and the content you type is not sent to our servers.",
      },
      {
        q: "Can a QR code expire?",
        a: "A static QR code does not expire. It only stops working if the page or link it points to goes offline.",
      },
      {
        q: "Do I need to pay to receive money through a QR code?",
        a: "No. You only need to enter your UPI PIN when you send money, never when you receive it. Be cautious of anyone asking you to scan a code to receive funds.",
      },
    ],
    ymylKind: "general",
  },

  "barcode-generator": {
    intro:
      "A barcode stores a number or short text as a series of bars that a scanner can read. This barcode generator creates a CODE128 barcode from any value, such as a product SKU, an asset tag, an order number or a library book ID, and lets you download it as an SVG file that stays sharp at any print size. It works in your browser, so the values you enter are not uploaded.",
    sections: [
      {
        heading: "How to create a barcode",
        paragraphs: [
          "Type the value you want to encode in the box. The barcode preview appears immediately. If the value can be encoded, you will see the bars; if not, the tool shows an error. Press “Download SVG” to save the image and place it in a label design, a Word or Canva document or a print template.",
          "Scan the printed barcode with your actual scanner or a barcode-reader app before you print many labels. Check that the number the scanner returns matches what you typed.",
        ],
        bullets: [
          "Use letters, digits and common symbols for CODE128",
          "Keep the value as short as practical for a cleaner barcode",
          "Test with the same type of scanner your shop or warehouse uses",
        ],
      },
      {
        heading: "What is CODE128?",
        paragraphs: [
          "CODE128 is a high-density barcode format that can encode all 128 ASCII characters, which means letters, digits and symbols. It is widely used in shipping labels, warehouses, inventory and internal tracking because it packs a lot of data into a small width and is read by almost every scanner.",
          "It is not the same as the retail EAN-13 or UPC codes you see on packaged products. Those are numeric-only formats tied to the GS1 numbering system and need registered company prefixes. Use this tool for internal labels and tracking; use GS1 for products you sell in retail chains.",
        ],
      },
      {
        heading: "Printing barcodes that scan reliably",
        paragraphs: [
          "Use a high-contrast print, usually black bars on a white background, and leave a clear quiet zone of blank space on both sides. Do not shrink the barcode so much that the thinnest bars blur on a thermal printer. SVG scales cleanly, so you can resize it before printing without losing sharpness.",
          "Avoid glossy laminates that cause glare and avoid placing the label over a curved edge. For small items, keep the value short so the barcode can be wider and more readable.",
        ],
        bullets: [
          "Black on white gives the best scan reliability",
          "Leave margins on the left and right of the bars",
          "Print a test sheet before a full run",
        ],
      },
      {
        heading: "Common uses for small businesses",
        paragraphs: [
          "Shops use barcodes for stock counting and billing, libraries for book tracking, schools for ID cards and offices for asset tags on laptops and furniture. Online sellers use them on parcels so the return and reconciliation process can be done with a quick scan.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — an inventory SKU",
        body: "Enter SKU-2045-BLU and download the SVG. Place it on a shelf label and scan it into your inventory sheet to confirm the same text appears.",
      },
      {
        title: "Example 2 — an order or parcel ID",
        body: "Enter the order number 100234567 and print it on the packing slip. At return time, scanning the code pulls the order up instantly instead of typing the number by hand.",
      },
    ],
    relatedLinks: [
      { href: "/tools/qr-generator", label: "QR generator" },
      { href: "/tools/uuid-generator", label: "UUID generator" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Which barcode format does this tool create?",
        a: "CODE128, which supports letters, digits and common symbols and is widely used for internal labels, shipping and inventory.",
      },
      {
        q: "Can I use this barcode on retail products?",
        a: "Retail products use GS1 EAN or UPC codes with a registered company prefix. Use this tool for internal tracking, not for retail listings that require GS1.",
      },
      {
        q: "Why does the tool say it could not encode my value?",
        a: "CODE128 supports standard ASCII characters. Remove unusual symbols or non-English characters and try again.",
      },
      {
        q: "Is the barcode uploaded anywhere?",
        a: "No. The barcode is generated in your browser and the value is not sent to our servers.",
      },
    ],
    ymylKind: "general",
  },

  "uuid-generator": {
    intro:
      "A UUID (Universally Unique Identifier) is a 128-bit value written as 32 hexadecimal characters in five groups, such as 3f2b8c1e-9a47-4d2f-b6a1-7c0e5d9a1b24. Developers use UUIDs as database keys, request IDs, file names and tokens because the chance of two random UUIDs matching is negligible. This tool generates version 4 (random) UUIDs instantly in your browser, one at a time or in a batch, ready to copy.",
    sections: [
      {
        heading: "How to use the UUID generator",
        paragraphs: [
          "Press “Generate 1” for a single UUID, or “Generate 5” or “Generate 10” to create a batch. Press “Copy all” to copy every value on the screen, one per line, and paste them into your code, a spreadsheet, a test fixture or a configuration file.",
          "Each press produces fresh random values. They are created locally with your browser’s cryptographic random source, so they are not sent to or logged by a server.",
        ],
        bullets: [
          "Generate 1, 5 or 10 UUIDs at a time",
          "Use Copy all and paste the values where you need IDs",
          "Lowercase hexadecimal is the usual format; most systems accept it as is",
        ],
      },
      {
        heading: "What a version 4 UUID looks like",
        paragraphs: [
          "A UUID has the form 8-4-4-4-12 hexadecimal digits. In version 4 the first digit of the third group is always 4, and the first digit of the fourth group is 8, 9, a or b. Those fixed positions mark the version and variant, and the remaining 122 bits are random.",
          "With 122 random bits, the number of possible UUIDs is about 5.3 × 10^36. Even if you generated a billion per second for decades, a collision would be extremely unlikely, which is why many systems can generate IDs independently without coordinating.",
        ],
      },
      {
        heading: "When to use UUIDs",
        paragraphs: [
          "UUIDs suit distributed systems where several servers or devices create records at the same time, public URLs where sequential numbers would reveal how many records exist, and offline apps that sync later. They avoid the need for a central counter.",
          "They have drawbacks: they are longer than integers, take more index space, and random UUIDs can fragment database indexes. Time-ordered identifiers such as UUID v7 or ULIDs solve the index problem where it matters. For most small projects v4 is fine.",
        ],
        bullets: [
          "Do not treat a UUID as a secret; use proper tokens for authentication",
          "Store UUIDs in a native UUID or binary column where your database supports it",
          "Avoid using UUIDs as human-readable codes",
        ],
      },
      {
        heading: "Testing and development tips",
        paragraphs: [
          "Use batches of UUIDs to seed test databases, mock API responses or create unique file names for uploads. If you need predictable values for tests, generate them once and commit them to the fixture rather than regenerating each run.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — a unique ID for a database record",
        body: "Generate one UUID, for example 3f2b8c1e-9a47-4d2f-b6a1-7c0e5d9a1b24, and use it as the primary key when you insert a new row from a mobile app that may be offline.",
      },
      {
        title: "Example 2 — filenames for uploads",
        body: "Press “Generate 10” and use the values as filenames for test uploads so that two files never overwrite each other.",
      },
    ],
    relatedLinks: [
      { href: "/tools/qr-generator", label: "QR generator" },
      { href: "/tools/barcode-generator", label: "Barcode generator" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Are these UUIDs truly unique?",
        a: "Version 4 UUIDs are random with 122 bits of randomness, so the chance of a duplicate is negligible for any practical use.",
      },
      {
        q: "Are the UUIDs generated on a server?",
        a: "No. They are generated in your browser and are not sent or stored by ContentVerse India.",
      },
      {
        q: "Is a UUID safe to use as a password or secret token?",
        a: "A random v4 UUID is hard to guess, but for authentication use a purpose-built secret generator or a library designed for tokens.",
      },
      {
        q: "What is the difference between UUID and GUID?",
        a: "They are the same concept. GUID is the term used mostly in Microsoft ecosystems, while UUID is the standard name.",
      },
    ],
    ymylKind: "general",
  },

  "english-hindi-translator": {
    intro:
      "Use this free English to Hindi and Hindi to English translator to understand a message, write a quick reply, read a notice or help a family member with a form. It uses machine translation for everyday text, so it is fast and works for short sentences and paragraphs. This page also explains how to get the best results and when you should use a human translator instead.",
    sections: [
      {
        heading: "How to use the translator",
        paragraphs: [
          "Choose the direction, English to Hindi or Hindi to English, type or paste your text in the left box and the translation appears in the right box. You can copy the result or swap the direction to translate a reply. Keep each request to a reasonable length so the result stays accurate.",
          "Hindi text can be typed in Devanagari script. If your keyboard is English only, write the English version and translate it into Hindi instead.",
        ],
        bullets: [
          "Pick the direction first, then enter your text",
          "Translate in short chunks for better accuracy",
          "Re-read the result and fix names and numbers manually",
        ],
      },
      {
        heading: "Getting better translations",
        paragraphs: [
          "Machine translation works best on simple, complete sentences. Avoid slang, abbreviations and idioms, which are often translated literally. “It’s raining cats and dogs” will not make sense in Hindi if translated word by word, so write what you mean: “It is raining heavily.”",
          "Names of people, places and brands should stay as they are. After translating, check that numbers, dates and amounts are unchanged. For messages that need a polite tone, consider whether the output uses the correct level of formality, such as “आप” instead of “तुम”.",
        ],
      },
      {
        heading: "When not to rely on machine translation",
        paragraphs: [
          "Machine translation is a convenience, not a certified translation. For legal agreements, court documents, medical instructions, immigration paperwork or anything where a mistake has consequences, use a qualified human translator and have it certified if the authority requires it.",
          "For official government forms, use the version published in Hindi by the department rather than translating the English form yourself.",
        ],
        bullets: [
          "Use certified translators for legal and official use",
          "Ask a Hindi speaker to proofread important messages",
          "Do not paste confidential documents into any online translator",
        ],
      },
      {
        heading: "Useful everyday uses",
        paragraphs: [
          "People use translators to understand SMS alerts, read notices from schools or housing societies, write notes to domestic help, check product instructions and learn new words. Pair it with a dictionary if you want to study a word’s meanings and usage.",
        ],
      },
      {
        heading: "Typing Hindi without a Hindi keyboard",
        paragraphs: [
          "If you want to translate Hindi to English but do not have a Devanagari keyboard, you do not need to install anything complicated. On Android and iPhone, open Settings, add the Hindi keyboard (many phones also offer a phonetic “Hinglish” layout that turns Roman letters into Devanagari as you type) and switch to it when you need it. On Windows and Mac you can add Hindi as an input language from the system settings and switch with a keyboard shortcut.",
          "You can also copy Hindi text from a WhatsApp message, a PDF, a news page or a notice and paste it directly into the left box. Pasting avoids typing mistakes, which matter because one wrong matra can change the meaning of a word.",
        ],
        bullets: [
          "Add the Hindi keyboard in your phone’s language settings",
          "Use a phonetic Hindi layout if you are comfortable typing in Roman letters",
          "Paste text instead of retyping it to avoid spelling errors",
        ],
      },
      {
        heading: "Common translation pitfalls and how to avoid them",
        paragraphs: [
          "Words with several meanings are the biggest source of errors. “Bank” can mean a financial institution or the side of a river, “fair” can mean a market or something just, and “paper” can mean a newspaper, an exam or the material. When a translation looks odd, add a few words of context to the sentence, for example “I went to the bank to deposit money”, so the engine can pick the right meaning.",
          "Formality is the second big problem. English has one word for “you”, while Hindi has तू, तुम and आप. Machine translation usually picks a neutral form, so read the output and change it if you are writing to an elder, a customer or an officer. Gender is another trap: Hindi verbs change with the gender of the speaker and the listener, and the tool cannot always know who is speaking.",
          "Finally, check numbers and units. Amounts in lakh and crore, dates written as day/month/year and measurements such as bigha, acre or square feet should be re-read carefully after translating, because a small mistake in a figure is worse than a clumsy sentence.",
        ],
        bullets: [
          "Add context to ambiguous words such as bank, fair or paper",
          "Adjust आप, तुम and तू to suit the person you are writing to",
          "Re-check amounts, dates and measurements after translating",
          "Keep names, addresses and brand names unchanged",
        ],
      },
      {
        heading: "Using the translator for study, work and travel",
        paragraphs: [
          "Students can use the tool to check the meaning of a paragraph in a textbook, but should write their own answers instead of copying the output, since examiners can recognise machine-translated text. A better habit is to translate a sentence, then try to rebuild it yourself from memory and compare.",
          "At work, the translator is handy for understanding a customer’s message or drafting a quick reply. Read the final text aloud, or ask a colleague who knows the language, before you send anything that represents your company. When travelling, translate short phrases such as asking for directions or the price of an item, and keep the sentences simple.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — a simple message",
        body: "“Please send the documents by tomorrow evening” translates to a polite Hindi request you can send on WhatsApp. Read it once to check that the word for “documents” is the one your reader uses.",
      },
      {
        title: "Example 2 — reading a notice",
        body: "Paste a short Hindi notice from your society into the tool, choose Hindi to English and read the summary. For anything involving payments or deadlines, confirm the key facts with the office.",
      },
      {
        title: "Example 3 — adding context to an ambiguous word",
        body: "Translating “I will go to the bank” alone is unclear, because the engine cannot tell a financial bank from a river bank. Rewrite it as “I will go to the bank to withdraw money” and the Hindi output will use the word for a financial bank. A few extra words of context often fix an odd result.",
      },
      {
        title: "Example 4 — choosing the right level of respect",
        body: "You want to ask a senior colleague, “Can you check this file?”. If the Hindi result uses the casual “तुम”, change it to “आप” before sending it. The meaning is the same, but the tone is much more appropriate in an office setting.",
      },
    ],
    relatedLinks: [
      { href: "/tools/age-calculator", label: "Age calculator" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Is the translation 100% accurate?",
        a: "No. It is machine translation intended for everyday use. Review the result and use a human translator for important documents.",
      },
      {
        q: "Can I translate long documents?",
        a: "The tool is built for short texts. Break long content into smaller parts for better results.",
      },
      {
        q: "Does it support Hinglish?",
        a: "Results are best with standard English or Hindi in Devanagari. Hinglish in Roman script may translate unpredictably.",
      },
      {
        q: "Is my text stored?",
        a: "Do not paste sensitive or confidential content into any online translator. The text is sent to a translation service to produce the result.",
      },
      {
        q: "Why does the translation sometimes look strange or word-for-word?",
        a: "Machine translation struggles with idioms, slang and words that have several meanings. Rewrite the sentence in simple, literal English, add context, or translate it in smaller pieces and combine the results yourself.",
      },
      {
        q: "Can I use it for homework, assignments or official submissions?",
        a: "Use it to understand text and to get a first draft, not as a final submission. Teachers and offices expect your own wording, and certified documents need a qualified human translator.",
      },
      {
        q: "How do I type Hindi if my keyboard only has English?",
        a: "Add the Hindi keyboard in your phone or computer language settings, use a phonetic Hindi layout, or paste Hindi text from another source. Alternatively, type the English version and translate it to Hindi.",
      },
    ],
    ymylKind: "general",
  },

  "geo-location": {
    intro:
      "Every place on Earth can be described by two numbers: latitude and longitude. This geo location tool finds your current position (only if you allow it), or converts a latitude and longitude pair into a readable address. It is useful for sharing your exact spot, filling GPS fields in forms, checking where a photo was taken or sending a location to a driver or delivery partner.",
    sections: [
      {
        heading: "How to use the geo location finder",
        paragraphs: [
          "Press the “use my location” button and allow the browser to share your position to see your latitude, longitude and an approximate address. To look up a point, type the latitude and longitude into the two boxes and press “Reverse geocode address”; the tool then shows the address it belongs to.",
          "Your browser asks permission before sharing your location. If you decline, nothing is read. You can still type coordinates manually to find an address.",
        ],
        bullets: [
          "Allow location access only when you want to detect your position",
          "Enter coordinates in decimal degrees, for example 28.6139 and 77.2090",
          "Copy the coordinates or address to share them",
        ],
      },
      {
        heading: "Latitude and longitude in plain words",
        paragraphs: [
          "Latitude measures how far north or south of the equator a place is, from 0° to 90°. Longitude measures how far east or west of the prime meridian it is, from 0° to 180°. India lies roughly between 8° and 37° north and 68° and 97° east, so Indian coordinates are usually positive numbers such as 28.6139° N, 77.2090° E for Delhi.",
          "Decimal degrees with four decimal places point to within about 11 metres, and six decimal places to within about 11 centimetres, so more digits make the position more precise.",
        ],
      },
      {
        heading: "Accuracy and privacy",
        paragraphs: [
          "Position accuracy depends on your device. A phone with GPS outdoors can be accurate to a few metres, while a laptop that uses Wi-Fi location may be off by hundreds of metres. Dense buildings and indoor spaces can reduce accuracy.",
          "Your coordinates are used only to display the result in your browser and to fetch the address. Do not share exact coordinates publicly if you do not want people to find your home.",
        ],
        bullets: [
          "Switch on device location and step outdoors for the best GPS fix",
          "Share your live location only with people you trust",
          "Remove location data from photos before posting them publicly",
        ],
      },
      {
        heading: "Practical uses",
        paragraphs: [
          "Use the coordinates to guide a courier to a hard-to-find address, fill in the location field in a farming, survey or insurance form, or save the position of a parked vehicle. Paste the coordinates into a maps app to open the exact spot.",
        ],
      },
      {
        heading: "What reverse geocoding means",
        paragraphs: [
          "Turning an address into coordinates is called geocoding, and turning coordinates back into an address is reverse geocoding. This tool does the second one. It takes a latitude and longitude, looks up the nearest known road, locality and city in an open map database and returns a readable address.",
          "Because the address is the nearest match in map data and not a postal record, it may show the neighbouring road, a nearby landmark or only the locality for remote areas. In farmland, forests and new colonies the result can be general, such as a village and district. For an exact delivery address always give the house number and landmark in words as well.",
        ],
        bullets: [
          "Reverse geocoding returns the nearest mapped address, not a legal address",
          "Remote locations may show only a village, district or state",
          "Use the PIN code finder to confirm the postal code for the area",
        ],
      },
      {
        heading: "Ways to write coordinates",
        paragraphs: [
          "Coordinates appear in three common styles. Decimal degrees, such as 28.6139, 77.2090, are used by this tool and by most apps. Degrees and decimal minutes, such as 28° 36.834′ N, 77° 12.540′ E, appear on some GPS devices. Degrees, minutes and seconds, such as 28° 36′ 50″ N, 77° 12′ 32″ E, appear in older surveys and maps.",
          "To convert degrees, minutes and seconds to decimal degrees, divide the minutes by 60 and the seconds by 3600 and add them to the degrees. For example 28° 36′ 50″ is 28 + 36/60 + 50/3600, which is about 28.6139. Enter negative numbers only for places south of the equator or west of the prime meridian, which does not apply to India.",
        ],
      },
      {
        heading: "Common mistakes",
        paragraphs: [
          "The most common mistake is swapping latitude and longitude. Latitude comes first and, for India, is the smaller number (between about 8 and 37); longitude comes second and is larger (between about 68 and 97). If the address shows an ocean or a different country, check the order. Other mistakes include using a comma instead of a decimal point, adding the degree symbol or letters like N and E to the boxes, and cutting digits so much that the point shifts by several hundred metres.",
        ],
        bullets: [
          "Latitude first, longitude second",
          "Use a decimal point and plain numbers only",
          "Keep at least four decimal places for street-level accuracy",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — sharing a precise location",
        body: "At a new warehouse with no clear address, press “use my location” and send the latitude and longitude to the delivery partner, who can paste them into a maps app.",
      },
      {
        title: "Example 2 — finding the address for coordinates",
        body: "A form gives you 19.0760, 72.8777. Enter them in the two boxes, press “Reverse geocode address” and the tool shows an address in Mumbai.",
      },
      {
        title: "Example 3 — converting degrees, minutes and seconds",
        body: "An old survey map lists a point as 26° 54′ 36″ N, 75° 49′ 12″ E. Latitude is 26 + 54/60 + 36/3600 = 26.91, and longitude is 75 + 49/60 + 12/3600 = 75.82. Enter 26.91 and 75.82 to find the address, which falls in Jaipur.",
      },
      {
        title: "Example 4 — catching swapped values",
        body: "If you type 77.2090 as latitude and 28.6139 as longitude, the result will not be in Delhi. India’s latitudes are smaller than its longitudes, so swapping them back immediately corrects the lookup.",
      },
    ],
    relatedLinks: [
      { href: "/tools/nearby-places", label: "Nearby places" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
      { href: "/tools/weather", label: "Weather" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Why does my browser ask for permission?",
        a: "Reading your location needs your consent. The browser will ask each time or remember your choice depending on your settings.",
      },
      {
        q: "How accurate is my detected location?",
        a: "Accuracy ranges from a few metres with GPS to hundreds of metres with Wi-Fi or network location, depending on your device.",
      },
      {
        q: "What is the format of the coordinates?",
        a: "The tool uses decimal degrees, for example 28.6139 for latitude and 77.2090 for longitude.",
      },
      {
        q: "Is my location stored?",
        a: "The tool uses your location to show the result and the address. Avoid sharing sensitive coordinates publicly.",
      },
      {
        q: "Why does the address look different from my real address?",
        a: "The tool returns the nearest address found in open map data, which may show a nearby road or only a locality. Always give the house number and a landmark in words when you need exact delivery.",
      },
      {
        q: "Does it work without GPS or on a laptop?",
        a: "Yes, if your browser allows location access. A laptop uses Wi-Fi or network location, which is less precise than phone GPS. You can also type coordinates manually.",
      },
      {
        q: "How do I convert degrees, minutes and seconds to decimal degrees?",
        a: "Add the degrees, the minutes divided by 60 and the seconds divided by 3600. For example, 28° 36′ 50″ equals about 28.6139.",
      },
    ],
    ymylKind: "general",
  },

  "nearby-places": nearbyGuide({
    label: "places of interest",
    intro:
      "Whether you are new in town, travelling or just looking for something to do, this nearby places tool shows points of interest around any area in India. Enter a locality or use your current location, choose a search radius and see places such as landmarks, parks, temples, malls and attractions with their addresses and map links.",
    how: [
      "Type an area or city, for example “Connaught Place Delhi” or “Civil Lines Bareilly”, or use your current location. Pick a radius of 1, 3, 5, 10 or 20 km and run the search. The list shows nearby places with their address and a link to open them in a map.",
      "Start with a small radius in cities, since many results are packed into a few kilometres. In small towns, increase the radius to 10 or 20 km so that you see meaningful options.",
    ],
    sectionA: {
      heading: "Planning a day around a new area",
      paragraphs: [
        "Search around your hotel or home to find parks, markets, heritage spots and local landmarks within a short ride. Combine results with the weather forecast and opening hours so you can plan an efficient route with fewer long trips.",
        "Local spots that are not famous online often appear here because map data includes small temples, community parks and neighbourhood markets. They can make a visit more interesting than the main tourist list.",
      ],
      bullets: [
        "Search around your stay rather than the city centre for walkable options",
        "Check opening hours and entry rules before you go",
        "Carry water and plan for the weather in summer and monsoon",
      ],
    },
    sectionB: {
      heading: "Tips for safe and respectful visits",
      paragraphs: [
        "Follow local rules at religious sites: dress modestly, remove footwear where required and ask before taking photographs. Keep valuables safe in crowded places and prefer official guides at protected monuments.",
      ],
    },
    examples: [
      {
        title: "Example 1 — a free afternoon in a new city",
        body: "Search around your hotel with a 3 km radius to find nearby parks and markets, then pick two places close to each other and check their opening times.",
      },
      {
        title: "Example 2 — exploring around a hill-town stay",
        body: "Use a 10 km radius to see viewpoints and temples around the town and pair the list with the weather forecast before choosing a day.",
      },
    ],
    faqs: [
      {
        q: "What counts as a “place” in this tool?",
        a: "It includes points of interest in map data such as landmarks, parks, attractions and public places. Businesses like hotels and ATMs have their own tools.",
      },
      {
        q: "Can I search a city I am not in?",
        a: "Yes. Type the area or city name and the tool searches around it, so you can plan a trip in advance.",
      },
    ],
    related: [
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools/nearby-restaurants", label: "Nearby restaurants" },
      { href: "/tools/weather", label: "Weather" },
    ],
  }),

  "nearby-hotels": nearbyGuide({
    label: "hotels",
    intro:
      "Finding a place to stay late at night or in an unfamiliar city can be stressful. This nearby hotels tool lists hotels, lodges and guest houses around any area or your current location, with addresses and map links. Use it to compare options near a railway station, bus stand, hospital or event venue before you call or book.",
    how: [
      "Enter the area where you need to stay, such as a station name or a landmark, or use your current location. Choose a radius and search. The results list nearby hotels with their address and a map link so you can judge distance from your destination.",
      "Use a small radius near stations and airports where many hotels are packed together, and a larger one in smaller towns.",
    ],
    sectionA: {
      heading: "How to choose a hotel from the list",
      paragraphs: [
        "Distance is only one factor. Check recent guest reviews on the booking site, confirm the room rate including taxes and ask what is included, such as breakfast, Wi-Fi and parking. A hotel slightly farther from the station but in a quieter lane may be a better choice.",
        "Compare the price on the hotel’s own website or by phone with the price on booking apps. Some hotels offer a direct discount, and you also avoid the app’s cancellation conditions.",
      ],
      bullets: [
        "Look at the last few months of reviews, not only the star rating",
        "Ask about check-in and check-out times and cancellation policy",
        "Confirm that the hotel accepts the ID you carry, such as Aadhaar or passport",
      ],
    },
    sectionB: {
      heading: "Safety tips for travellers",
      paragraphs: [
        "Prefer hotels with visible reception staff, CCTV in common areas and working locks. For solo or late-night arrivals, share the hotel address with a family member and keep your first night’s booking confirmed in advance. Pay only through official booking channels or the hotel’s verified payment methods.",
        "Avoid paying a large advance to unknown numbers found on social media. If a room looks different from the listing, ask for a replacement before you unpack.",
      ],
    },
    examples: [
      {
        title: "Example 1 — a hotel near a railway station",
        body: "Search the station name with a 1 km radius, shortlist two hotels, and check their reviews and rates by phone before you arrive.",
      },
      {
        title: "Example 2 — staying near a hospital",
        body: "If you are visiting a patient, search the hospital area with a 3 km radius to find a hotel or lodge within a short auto ride.",
      },
    ],
    faqs: [
      {
        q: "Does this tool show room prices or availability?",
        a: "No. It lists nearby hotels from map data. Call the hotel or use a booking site to confirm prices and availability.",
      },
      {
        q: "How do I find a hotel for late-night arrival?",
        a: "Search near your arrival point, call two or three places to confirm they have a 24-hour reception, and share the address with someone you trust.",
      },
    ],
    related: [
      { href: "/tools/nearby-restaurants", label: "Nearby restaurants" },
      { href: "/tools/nearby-atms", label: "Nearby ATMs" },
      { href: "/tools/pnr-status", label: "PNR status" },
    ],
  }),

  "nearby-restaurants": nearbyGuide({
    label: "restaurants",
    intro:
      "Hungry in a new neighbourhood? This nearby restaurants tool finds restaurants, cafés and eateries around any area in India or around your current location, with addresses and map links. Use it to find a place close to your hotel, office or event, and to explore local food beyond the places you already know.",
    how: [
      "Type a locality or use your location, select the radius and search. The list shows nearby restaurants with their addresses. Open the map link to check the distance and the route, and then call or check the menu on the restaurant’s own page.",
      "In busy city areas a 1 or 3 km radius already gives plenty of options. For highway stops or smaller towns, choose 10 km or more.",
    ],
    sectionA: {
      heading: "Choosing a good place to eat",
      paragraphs: [
        "Look for places with a steady stream of local customers, a short menu that is clearly done well and visible hygiene in the serving area. Ratings help, but read the recent reviews to see whether quality has changed.",
        "For dietary needs, call ahead. Vegetarian-only and Jain-friendly options, halal kitchens and allergy-safe dishes are not always clear from a listing, and staff can tell you what is actually possible.",
      ],
      bullets: [
        "Check opening hours, especially on Sundays and festival days",
        "Look for the FSSAI licence number displayed at the restaurant",
        "Carry cash or UPI; small eateries may not accept cards",
      ],
    },
    sectionB: {
      heading: "Food safety and hygiene basics",
      paragraphs: [
        "Choose freshly cooked and hot food, drink sealed or filtered water and be cautious with raw salads and cut fruit in extreme heat. Restaurants must display a valid FSSAI licence or registration, and you can check the number with our FSSAI tool before you trust a packaged or takeaway brand.",
      ],
    },
    extra: [
      {
        heading: "Finding the right kind of restaurant",
        paragraphs: [
          "India’s eating-out options range from street stalls and dhabas to cafés, family restaurants, fine dining and regional specialities. The right choice depends on the occasion. For a quick meal, look for a busy place with a short menu. For a family dinner, check seating, parking and whether the restaurant takes reservations. For a business lunch, pick a quieter spot close to the meeting location.",
          "When you travel, search for local specialities rather than only familiar chains. A thali place in Gujarat, a dosa restaurant in Chennai, a fish-curry kitchen in Goa or a kebab lane in Lucknow will usually give a better meal than a generic menu. Search by area, scan the names on the list and then use the map link to see how far each one is.",
        ],
        bullets: [
          "Family dinner: check seating, parking and booking",
          "Quick meal: choose a busy, short-menu place close by",
          "Travel: look for regional specialities over chains",
        ],
      },
      {
        heading: "Eating out with dietary needs",
        paragraphs: [
          "If you follow a vegetarian, Jain, vegan or halal diet, or have an allergy, do not rely on the name of a place alone. Call ahead and ask how food is prepared, whether the kitchen is separate, and which oils or ingredients are used. In India, a green dot marks vegetarian items and a brown dot marks non-vegetarian ones on packaged foods, and many restaurants follow the same practice on menus.",
          "For serious allergies, tell the staff clearly before you order, and carry your medicines. Street food and buffets are higher risk because of shared utensils and open ingredients.",
        ],
      },
      {
        heading: "Ordering, paying and tipping",
        paragraphs: [
          "Most restaurants accept UPI, cards and cash, but small eateries and dhabas may take only cash or UPI. Check that the bill lists GST correctly; a service charge is optional unless it was clearly printed on the menu before you ordered, and you can ask for it to be removed if it was not. A tip of around 5 to 10 per cent is common if you were happy with the service.",
        ],
        bullets: [
          "Check the bill for GST and any service charge",
          "Keep UPI or cash ready for small eateries",
          "Ask for a printed menu with prices before you order",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — dinner near your hotel",
        body: "Search around the hotel with a 1 km radius, pick two places in walking distance and check their closing time before you step out.",
      },
      {
        title: "Example 2 — a highway lunch stop",
        body: "Enter the next town on your route with a 10 km radius and choose a place with a parking area and clean washrooms.",
      },
      {
        title: "Example 3 — a group meal for ten people",
        body: "Search around your meeting point with a 3 km radius, shortlist three places and call each one to confirm seating for ten, the booking time and the per-person budget before you decide.",
      },
      {
        title: "Example 4 — a Jain-friendly meal while travelling",
        body: "Search the town you are visiting, then call the shortlisted restaurants and ask whether they serve food without onion and garlic and whether it is prepared separately. Confirm before you travel instead of relying on the listing.",
      },
    ],
    faqs: [
      {
        q: "Does the tool show menus or ratings?",
        a: "It shows names and addresses from map data. For menus, ratings and offers use the restaurant’s own page or an app.",
      },
      {
        q: "How can I check whether a restaurant is licensed?",
        a: "Look for the FSSAI number on the premises or bill and verify it on the official FoSCoS portal.",
      },
      {
        q: "Can I use it to find vegetarian or pure-veg restaurants?",
        a: "The list shows restaurants of all kinds. Search the area, then call the shortlisted places or check their own pages to confirm that they are vegetarian and how the food is prepared.",
      },
      {
        q: "What radius should I choose?",
        a: "Use 1 to 3 km in busy city areas, 5 km in smaller towns and 10 km or more on highways or in rural areas where eateries are far apart.",
      },
      {
        q: "Is the service charge compulsory?",
        a: "No. A service charge is voluntary. If it was not clearly displayed before you ordered, you can ask the restaurant to remove it from the bill.",
      },
    ],
    related: [
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools/fssai-checker", label: "FSSAI checker" },
      { href: "/tools/nearby-places", label: "Nearby places" },
    ],
  }),

  "nearby-hospitals": nearbyGuide({
    label: "hospitals",
    intro:
      "In a medical emergency, minutes matter. This nearby hospitals tool lists hospitals around your location or any area in India with their addresses and map links, so you can find the closest option quickly. It is a reference for planning and finding facilities; it does not replace emergency services. In an emergency, call 112 (national emergency number) or 108 (ambulance, in many states) first.",
    how: [
      "Use your current location or type the area, pick a radius and search. The list shows hospitals nearby with their address. Open the map link to see the distance and route and call the hospital to confirm that the department you need is available.",
      "Use a small radius in a city, and 10 to 20 km in small towns and rural areas where hospitals are further apart.",
    ],
    sectionA: {
      heading: "What to do in an emergency",
      paragraphs: [
        "For a serious emergency such as chest pain, severe bleeding, breathing difficulty, stroke symptoms or a road accident, call 112 or 108 immediately. Do not wait to search for a hospital while the patient’s condition worsens. If an ambulance is not available quickly, take the patient to the nearest hospital with an emergency department.",
        "Carry the patient’s ID, any medical records and a list of current medicines. Tell the staff about allergies and existing conditions. Most hospitals must provide initial emergency care regardless of payment.",
      ],
      bullets: [
        "Emergency numbers: 112 for all emergencies, 108 for ambulance in many states",
        "Keep a list of nearby hospitals saved on your phone",
        "Note the hospital’s emergency entrance on the map",
      ],
    },
    sectionB: {
      heading: "Choosing the right hospital",
      paragraphs: [
        "A nearby clinic is suitable for minor problems, while a hospital with an emergency department, ICU and the relevant specialists is needed for serious ones. Government hospitals and many private hospitals empanelled under schemes like Ayushman Bharat can offer cashless treatment for eligible patients; confirm eligibility with the hospital’s help desk.",
        "For planned treatment, compare the hospital’s facilities, doctors, costs and insurance acceptance in advance, and ask for an estimate in writing.",
      ],
    },
    examples: [
      {
        title: "Example 1 — finding a hospital while travelling",
        body: "On a road trip, search around the town you are passing through with a 10 km radius and save two hospital numbers in your phone before you continue.",
      },
      {
        title: "Example 2 — planning for an elderly relative",
        body: "Search around your home, note the closest hospitals with a cardiac or emergency department and keep their numbers on the fridge and in your phone.",
      },
    ],
    faqs: [
      {
        q: "Can I use this tool in an emergency?",
        a: "In a life-threatening emergency, call 112 or 108 first. Use this tool only to help find a nearby facility while help is on the way.",
      },
      {
        q: "Does the list show which departments are available?",
        a: "No. It shows hospitals from map data. Call the hospital to confirm the department, doctor and bed availability.",
      },
      {
        q: "Is this medical advice?",
        a: "No. ContentVerse India does not give medical advice. For symptoms or treatment decisions, consult a qualified doctor.",
      },
    ],
    related: [
      { href: "/tools/nearby-atms", label: "Nearby ATMs" },
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools/geo-location", label: "Geo location finder" },
    ],
    ymyl: "health",
  }),

  "nearby-schools": nearbyGuide({
    label: "schools",
    intro:
      "Moving to a new city or choosing a school for your child starts with knowing what is nearby. This nearby schools tool lists schools around any locality or your current location in India, with their addresses and map links, so you can shortlist options within a comfortable commute. Use it as a starting point and then verify admissions, board affiliation and fees directly with each school.",
    how: [
      "Type the locality or use your location, select a radius and search. The results show nearby schools with their address. Open the map link to see how far each school is from your home, and then check details on the school’s website or by visiting.",
      "A radius of 3 to 5 km is a sensible starting point for daily commutes in cities. Increase it in smaller towns where schools are fewer.",
    ],
    sectionA: {
      heading: "How to shortlist and compare schools",
      paragraphs: [
        "Start with distance and commute time, because a long daily journey tires young children. Then compare board affiliation (CBSE, ICSE, state board or IB), medium of instruction, class sizes, fee structure, transport availability and facilities such as labs, sports grounds and libraries.",
        "Visit the school if possible. Meet the staff, see the classrooms and ask about teacher qualifications, safety measures and how parent communication works. A visit tells you more than a brochure.",
      ],
      bullets: [
        "Check the board affiliation number on the board’s official site",
        "Ask for the full fee breakup, including annual charges and transport",
        "Check admission dates and age cut-offs early; they vary by state and school",
      ],
    },
    sectionB: {
      heading: "Admissions, age limits and the RTE Act",
      paragraphs: [
        "Many schools fix a minimum age for entry, such as 3 years for nursery or 5 to 6 years for Class 1 as on a cut-off date. Use our age calculator to check your child’s age on the date the school specifies. Under the Right to Education Act, private unaided schools are required to reserve a share of seats for children from economically weaker sections; the process is run by the state, so check your state’s RTE portal for dates.",
      ],
    },
    examples: [
      {
        title: "Example 1 — shortlisting schools near a new home",
        body: "Search around your new address with a 3 km radius, note four or five schools, and call each to ask about admission dates and fees before you visit.",
      },
      {
        title: "Example 2 — checking the age cut-off",
        body: "A school requires a child to be 5 years old on 31 March. Use the age calculator with that date to see whether your child is eligible for Class 1 this year.",
      },
    ],
    faqs: [
      {
        q: "Does the tool show fees, boards or ratings?",
        a: "No. It lists schools from map data. Confirm board affiliation, fees and admission rules with the school or the education department.",
      },
      {
        q: "How do I check if a school is recognised?",
        a: "Ask for the recognition and affiliation details and verify them on the respective board or state education department website.",
      },
    ],
    related: [
      { href: "/tools/age-calculator", label: "Age calculator" },
      { href: "/tools/nearby-hospitals", label: "Nearby hospitals" },
      { href: "/tools/pincode-finder", label: "Pincode finder" },
    ],
  }),

  "nearby-atms": nearbyGuide({
    label: "ATMs",
    intro:
      "Running low on cash in an unfamiliar area is a common travel problem. This nearby ATMs tool finds ATMs around your current location or any locality in India and shows their addresses with map links, so you can reach the closest machine quickly. It also covers tips on avoiding extra charges and staying safe when you withdraw cash.",
    how: [
      "Use your current location or type the area, pick a radius and search. The list shows ATMs and bank branches nearby with their addresses. Open the map link to see the route and distance. A 1 km radius is usually enough in a city, while highways and small towns may need 10 km or more.",
      "Machines can be out of service or out of cash, especially around holidays and weekends, so keep one or two backup options from the list.",
    ],
    sectionA: {
      heading: "Avoiding ATM charges",
      paragraphs: [
        "Your own bank’s ATM is usually free within the monthly free-transaction limit. Withdrawals from other banks’ ATMs are free for a limited number of transactions per month, after which a fee per transaction applies, and the limits differ between metro and non-metro cities. Check your bank’s current rules in its fee schedule.",
        "Balance enquiries and mini statements may also count as transactions at other banks’ ATMs. Use your bank’s app for balance checks and use UPI for payments when possible to keep ATM use low.",
      ],
      bullets: [
        "Prefer your own bank’s ATM to avoid interchange fees",
        "Check your bank’s monthly free-transaction limit",
        "Many ATMs now support cardless cash withdrawal through UPI",
      ],
    },
    sectionB: {
      heading: "ATM safety tips",
      paragraphs: [
        "Choose ATMs inside bank branches or in well-lit, busy locations. Cover the keypad when entering your PIN and never accept help from strangers. Check the card slot and keypad for anything unusual, such as loose attachments, before you insert your card.",
        "If the machine retains your card or does not dispense cash but debits your account, call your bank’s helpline immediately and note the ATM ID shown on the machine. Banks have set timelines to reverse failed transactions and pay compensation for delays.",
      ],
    },
    examples: [
      {
        title: "Example 1 — finding cash late in the evening",
        body: "Search around your location with a 1 km radius and pick an ATM that is inside a bank branch lobby or a busy market for safety.",
      },
      {
        title: "Example 2 — travelling on a highway",
        body: "Enter the next town on your route with a 10 km radius, note two ATM options in case the first is out of cash, and withdraw before you reach remote stretches.",
      },
    ],
    faqs: [
      {
        q: "Does the tool show whether an ATM has cash?",
        a: "No. It lists ATMs from map data. Machines can be out of service or out of cash, so keep a backup option.",
      },
      {
        q: "What should I do if the ATM debits my account but gives no cash?",
        a: "Note the ATM ID and time, then call your bank’s helpline and file a complaint. Banks have fixed timelines for reversing such transactions.",
      },
      {
        q: "Are there charges for using another bank’s ATM?",
        a: "Usually a few transactions each month are free and later ones carry a fee. Check your bank’s fee schedule for the current limits.",
      },
    ],
    related: [
      { href: "/tools/ifsc-finder", label: "IFSC finder" },
      { href: "/tools/nearby-hotels", label: "Nearby hotels" },
      { href: "/tools/currency-converter", label: "Currency converter" },
    ],
    ymyl: "finance",
  }),

  "merge-pdf": {
    intro:
      "Merging PDFs combines several files into one, which is handy for job applications, KYC uploads, loan documents, school forms and invoices that portals accept only as a single file. This merge PDF tool joins your files in the order you choose, and it runs entirely in your browser: your PDFs stay on your device and are never uploaded to a server.",
    sections: [
      {
        heading: "How to merge PDF files",
        paragraphs: [
          "Click the upload area or drag and drop your PDFs, then arrange them in the order you want them to appear. Press “Merge & download” and the combined file downloads straight to your device as merged.pdf. Open it and scroll through to confirm the page order before you submit it anywhere.",
          "Each file can be up to 25 MB. If a file is larger or encrypted, compress or unlock it first. Password-protected PDFs need the password removed before they can be merged.",
        ],
        bullets: [
          "Add files in the order you want pages to appear",
          "Maximum 25 MB per file",
          "Check the final file before uploading it to a portal",
        ],
      },
      {
        heading: "Why files stay private",
        paragraphs: [
          "The merge happens inside your browser using JavaScript. The documents are read into memory on your device and the new file is created locally. Nothing is sent to ContentVerse India servers, which matters when the PDFs contain Aadhaar, PAN, bank statements or salary slips.",
          "For extra safety, use a private browser window on shared computers and delete the downloaded file when you no longer need it.",
        ],
      },
      {
        heading: "Typical uses",
        paragraphs: [
          "Government and bank portals often ask for a single PDF with all supporting documents. Merge your ID proof, address proof, photographs and forms into one file in the order the instructions list. Students combine scanned assignment pages, and freelancers bundle invoices with timesheets.",
          "If the final file is too large for a portal that limits uploads to 1 or 2 MB, run it through the compress PDF tool afterwards.",
        ],
        bullets: [
          "Merge first, then compress if the upload limit is small",
          "Name the file clearly, such as Name_Application.pdf",
          "Keep the original files until the submission is accepted",
        ],
      },
      {
        heading: "Troubleshooting",
        paragraphs: [
          "If the merge fails, check that each file is a valid PDF and not an image renamed with a .pdf extension, and that it is not password-protected. Very large scans may need compression first. If a page looks rotated in the merged file, rotate it in the source before merging.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — a single PDF for a job application",
        body: "Add your resume, photo ID and degree certificate in that order, merge them and upload the result as one file to the recruitment portal.",
      },
      {
        title: "Example 2 — a bank loan document pack",
        body: "Merge your salary slips, bank statement and ID proof into one PDF and compress it afterwards if the bank’s portal has a 2 MB limit.",
      },
    ],
    relatedLinks: [
      { href: "/tools/split-pdf", label: "Split PDF" },
      { href: "/tools/compress-pdf", label: "Compress PDF" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Is there a limit on the number of files?",
        a: "The size limit is 25 MB per file. The total you can merge depends on your device’s memory.",
      },
      {
        q: "Can I merge password-protected PDFs?",
        a: "Not directly. Remove the password using the original program or viewer first, then merge.",
      },
      {
        q: "Will merging reduce quality?",
        a: "No. Pages are copied into the new file as they are, so the content and quality stay the same.",
      },
      {
        q: "Do you keep my files?",
        a: "No. Everything runs in your browser and the files are never uploaded to our servers.",
      },
    ],
    ymylKind: "general",
  },

  "split-pdf": {
    intro:
      "Splitting a PDF lets you pull out only the pages you need from a large document: a single certificate from a scanned bundle, the signed page of a contract or a range of chapters. This split PDF tool extracts a page range into a new file, entirely inside your browser, so your document is never uploaded.",
    sections: [
      {
        heading: "How to extract pages from a PDF",
        paragraphs: [
          "Upload the PDF and the tool reads the number of pages. Enter the “From page” and “To page” values, then press the button to download a new PDF that contains just that range. For a single page, enter the same number in both boxes.",
          "To split a document into several parts, run the tool more than once with different ranges, for example pages 1 to 5, then 6 to 10.",
        ],
        bullets: [
          "Upload a PDF up to 25 MB",
          "Enter the first and last page of the range you want",
          "Use the same number twice to extract one page",
        ],
      },
      {
        heading: "Privacy of your document",
        paragraphs: [
          "The file is processed on your device with your browser. It does not leave your computer or phone, which makes the tool suitable for bank statements, medical reports and identity documents.",
          "After downloading, delete the extracted file if it contains sensitive information and you no longer need it.",
        ],
      },
      {
        heading: "When splitting helps",
        paragraphs: [
          "Upload portals often ask for a specific page: the first page of a passport, a particular page of a form or the pages of a bank statement for one month. Splitting also helps you reduce a file’s size by removing pages you do not need, and share only the relevant part of a document with someone else.",
          "To send only some pages of a long scanned file, extract them first and then compress the result if the upload limit is tight.",
        ],
        bullets: [
          "Extract only the pages that are required, nothing more",
          "Rename the new file clearly so you can find it later",
          "Combine extracted pages from several files with the merge tool",
        ],
      },
      {
        heading: "Printed page numbers versus PDF page numbers",
        paragraphs: [
          "The most common mistake when splitting is mixing up the number printed on the page with the page’s position in the file. A report may have a cover page and a contents page before “Page 1”, so printed page 1 can be PDF page 3. The tool uses the position in the file, which is the number your PDF viewer shows in its page counter.",
          "Open the file in a viewer first, note the position of the first and last page you need and enter those values. Check the downloaded file once to confirm that it begins and ends where you expected.",
        ],
        bullets: [
          "Use the page counter of your PDF viewer, not the printed number",
          "Note the first and last page before you start",
          "Open the result to confirm the range",
        ],
      },
      {
        heading: "Documents people commonly split",
        paragraphs: [
          "Income tax returns and Form 16 often come as one long PDF, but a bank may ask only for the first page or the acknowledgement page. Insurance policies bundle the schedule, terms and endorsements, and a claim form may need just the schedule. Scanned marksheets, rent agreements and property papers are usually combined into one file, while an application needs individual pages. Long bank statements can be reduced to the months a lender asks for.",
          "Before you send a document to someone, remove pages that are not needed, such as pages with unrelated account numbers or personal details. Sharing less is safer and keeps the attachment small.",
        ],
      },
      {
        heading: "A simple workflow with the other PDF tools",
        paragraphs: [
          "Most tasks need more than one step. To build a custom pack, first split the pages you want from each source file, then join them with the merge tool in the order required, and finally compress the result if the portal has a size limit. If you only have photos, convert them with the images to PDF tool and then split or merge the output.",
          "Keep the original file untouched and work on copies, so that you can start again if you choose the wrong range.",
        ],
      },
      {
        heading: "Troubleshooting",
        paragraphs: [
          "If the tool cannot read the file, it may be password-protected, damaged or larger than 25 MB. Remove the password using the original software or compress the file offline first. If the page count looks wrong, open the file in a PDF viewer to confirm it opened completely.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — one page of a scanned bundle",
        body: "A 12-page scan holds several documents. To pull out only the ID proof on page 4, enter 4 in both boxes and download the one-page PDF.",
      },
      {
        title: "Example 2 — sharing part of a statement",
        body: "From a 20-page bank statement you only need pages 8 to 10 for a loan application. Enter From 8 To 10 and upload the new, smaller file.",
      },
      {
        title: "Example 3 — printed page 1 is not PDF page 1",
        body: "A 40-page annual report has a cover and a two-page index before the content, so “Page 5” printed on the sheet is the 8th page of the PDF. To extract printed pages 5 to 9, enter From 8 To 12 and check the first page of the result.",
      },
      {
        title: "Example 4 — cutting a long file into chapters",
        body: "A 30-page study guide has three 10-page chapters. Run the tool for 1 to 10, then 11 to 20 and 21 to 30 to create three separate files you can open on a phone during a commute.",
      },
    ],
    relatedLinks: [
      { href: "/tools/merge-pdf", label: "Merge PDF" },
      { href: "/tools/compress-pdf", label: "Compress PDF" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Can I extract non-continuous pages like 1, 3 and 7?",
        a: "The tool extracts one continuous range at a time. Run it once for each page or range and merge the results if needed.",
      },
      {
        q: "Is my PDF uploaded to a server?",
        a: "No. It is processed in your browser and stays on your device.",
      },
      {
        q: "What is the maximum file size?",
        a: "25 MB per file. Compress or split very large files before using the tool.",
      },
      {
        q: "Does splitting change the page quality?",
        a: "No. Pages are copied as they are, so the quality is unchanged.",
      },
      {
        q: "Why does the page range not match the numbers printed on the pages?",
        a: "The tool counts pages by their position in the file, so a cover page or index shifts the numbering. Use the page counter in your PDF viewer to pick the range.",
      },
      {
        q: "Can I split a password-protected PDF?",
        a: "Remove the password in the original software first. A protected or damaged file may fail to open in the tool.",
      },
      {
        q: "Can I use it on my phone?",
        a: "Yes. It runs in a modern mobile browser. For very large files a laptop is more comfortable, because the work is done on your device’s own memory.",
      },
    ],
    ymylKind: "general",
  },

  "compress-pdf": {
    intro:
      "Many Indian portals limit uploads to 1 MB, 2 MB or 5 MB, and scanned PDFs often exceed that. This compress PDF tool tries to reduce the file size right in your browser and shows the size before and after, so you know whether it worked. Your file is never uploaded to a server.",
    sections: [
      {
        heading: "How to compress a PDF",
        paragraphs: [
          "Choose your PDF, press the compress button and wait a few seconds. The tool shows the original and new sizes and downloads the compressed version. If the size is still above your portal’s limit, try the tips below.",
          "Compression results depend on what is inside the file. Text-based PDFs may shrink a little, files with duplicate or unoptimised data can shrink more, and scanned image PDFs may change only slightly because the images dominate the size.",
        ],
        bullets: [
          "Upload a PDF up to 25 MB",
          "Compare the before and after sizes shown",
          "Always open the result and check that it reads clearly",
        ],
      },
      {
        heading: "Why some PDFs do not shrink much",
        paragraphs: [
          "A PDF made from high-resolution photos or phone scans is mostly image data, which is already compressed. Structural clean-up cannot reduce it much. The tool reports the real before and after size, so you see the outcome rather than a promise.",
          "If the file is still too large, the best fix is at the source: rescan at a lower resolution, usually 150 to 200 DPI is enough for readable documents, or convert pages to grayscale if colour is not required.",
        ],
      },
      {
        heading: "Tips to meet strict upload limits",
        paragraphs: [
          "Remove pages you do not need with the split tool, then compress. Scan documents in black and white or grayscale when colour is not required, and avoid scanning at very high resolution. If a document has many images, reduce them before creating the PDF using the images-to-PDF tool with smaller photos.",
          "Always check that the text is still readable and that signatures and stamps are clear, since official portals can reject unreadable documents.",
        ],
        bullets: [
          "Scan at 150–200 DPI for text documents",
          "Use grayscale where colour is not needed",
          "Keep the original file in case the compressed one is rejected",
        ],
      },
      {
        heading: "Privacy",
        paragraphs: [
          "Compression runs in your browser. Your documents, which may contain ID numbers or financial information, stay on your device. Delete the downloaded copy after submission if it contains sensitive data.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — a 4 MB file for a 2 MB portal",
        body: "Compress the PDF and check the new size. If it drops only to 3 MB, extract the necessary pages with the split tool and compress again, or rescan at a lower resolution.",
      },
      {
        title: "Example 2 — an already optimised PDF",
        body: "A PDF exported from a word processor is only 300 KB. The tool may shrink it by just a few KB and will show the exact before and after sizes, so you can tell that no further reduction is possible.",
      },
    ],
    relatedLinks: [
      { href: "/tools/merge-pdf", label: "Merge PDF" },
      { href: "/tools/split-pdf", label: "Split PDF" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "How much smaller will my PDF get?",
        a: "It depends on the content. Already optimised or scanned-image PDFs may shrink little. The tool shows the exact before and after size.",
      },
      {
        q: "Will compression reduce the quality of my pages?",
        a: "The tool aims to keep the content readable. Always open the result and check text, signatures and stamps before you submit.",
      },
      {
        q: "Is my PDF uploaded?",
        a: "No. It is processed in your browser and stays on your device.",
      },
      {
        q: "What can I do if the file is still too large?",
        a: "Remove unnecessary pages, rescan at a lower resolution or in grayscale, or split the document into parts if the portal allows multiple uploads.",
      },
    ],
    ymylKind: "general",
  },

  "images-to-pdf": {
    intro:
      "Phone photos of documents are hard to upload and share, because many portals and offices ask for a PDF. This images to PDF tool converts JPG and PNG images into one PDF, placing each picture on its own page in the order you choose. It runs in your browser, so your photos are not uploaded.",
    sections: [
      {
        heading: "How to convert images to PDF",
        paragraphs: [
          "Add your JPG or PNG images, arrange them in the order you want the pages to appear and press “Create PDF & download”. The tool builds a single PDF with one image per page and downloads it as images.pdf.",
          "Before converting, make sure each photo is upright and cropped to the document so the text is large and readable. Crop away tables, fingers and backgrounds to reduce the file size.",
        ],
        bullets: [
          "Supported formats: JPG and PNG",
          "Image order is page order",
          "Each file can be up to 25 MB",
        ],
      },
      {
        heading: "Taking good document photos",
        paragraphs: [
          "Place the document on a flat, dark surface in good daylight and hold the phone directly above it so that the page is not skewed. Avoid shadows and flash glare. Use your phone’s document scan mode if it has one; it straightens and sharpens the page automatically.",
          "Keep the full document in the frame, including all edges, signatures and stamps. A clear, evenly lit photo converts into a clean PDF and is less likely to be rejected.",
        ],
      },
      {
        heading: "Keeping the PDF small enough to upload",
        paragraphs: [
          "Photos from modern phones can be several MB each, and a PDF of many photos quickly grows past a portal’s upload limit. Resize or compress images before converting, scan at moderate quality and use the compress PDF tool afterwards if needed.",
          "For forms that ask for a single PDF with several documents, convert all the images in one go in the correct order, then check the file’s size.",
        ],
        bullets: [
          "Convert all pages together in the right order",
          "Compress the PDF if the portal has a small limit",
          "Name the file with your name and the document type",
        ],
      },
      {
        heading: "Step-by-step: from phone photo to a clean PDF",
        paragraphs: [
          "First, photograph or scan every page and delete blurred or duplicate shots. Second, rotate any sideways photo in your gallery app so it is upright. Third, crop each page so that only the document is visible. Fourth, add the images to the tool in the order you want the pages to appear. Finally, press “Create PDF & download” and open the file once to check the order, orientation and readability.",
          "If a page is in the wrong place, clear the list and add the images again in the correct order. It takes a minute and is safer than trying to fix the order afterwards.",
        ],
        bullets: [
          "Delete blurry and duplicate photos before you start",
          "Rotate and crop in your gallery app",
          "Add pages in order, convert and check the result",
        ],
      },
      {
        heading: "Which documents people convert",
        paragraphs: [
          "Typical uses include identity and address proofs for KYC, mark sheets and certificates for admissions and job applications, handwritten assignments, receipts for reimbursement claims, medical reports for insurance and signed forms. Each of these usually has a size limit and a file-type rule on the portal, so read the instructions on the upload page before you start.",
          "Portals commonly limit files to somewhere between a few hundred kilobytes and a few megabytes, so check the exact limit shown by the portal and compress the PDF if needed. Never edit or retouch an identity document; submit a clear, honest image of the original.",
        ],
      },
      {
        heading: "Fixing common problems",
        paragraphs: [
          "If text looks blurry, retake the photo in better light and hold the phone steady. If pages appear sideways, rotate the original images and convert again. If the file is too large, crop out empty margins, lower the camera or scanner resolution slightly and run the finished PDF through the compress tool. If a photo does not appear in the list, check the format: iPhone photos saved as HEIC should be shared as JPG or captured in the “Most Compatible” setting, because this tool accepts only JPG and PNG.",
        ],
        bullets: [
          "Blurry text: retake in daylight, no flash",
          "Wrong direction: rotate the original image first",
          "HEIC photo: switch the camera to JPG or export as JPG",
          "Too large: crop, reduce resolution and compress the PDF",
        ],
      },
      {
        heading: "Privacy",
        paragraphs: [
          "Images are processed on your device. They are not sent to ContentVerse India servers, so ID proofs and certificates remain private. Delete the generated PDF when you are done if it contains sensitive information.",
        ],
      },
    ],
    examples: [
      {
        title: "Example 1 — Aadhaar front and back in one PDF",
        body: "Add the front photo first and the back second, convert them and upload the two-page PDF to the portal that asks for a single file.",
      },
      {
        title: "Example 2 — a multi-page handwritten assignment",
        body: "Photograph each page, add the images in page order and download one PDF to send to your teacher. If the file is too big, run it through the compress tool.",
      },
      {
        title: "Example 3 — bills for a reimbursement claim",
        body: "Photograph each receipt flat on a table, crop out the background and add the images in date order. Create a single PDF named with your name and the month, and upload it to the expense portal.",
      },
      {
        title: "Example 4 — an iPhone photo that does not appear",
        body: "A photo taken in HEIC format is not accepted. Open it in your gallery, export or share it as a JPG, then add the new file to the tool and convert as usual.",
      },
    ],
    relatedLinks: [
      { href: "/tools/merge-pdf", label: "Merge PDF" },
      { href: "/tools/compress-pdf", label: "Compress PDF" },
      { href: "/tools/split-pdf", label: "Split PDF" },
      { href: "/tools", label: "All India Tools" },
    ],
    faqs: [
      {
        q: "Which image formats are supported?",
        a: "JPG and PNG images are supported.",
      },
      {
        q: "Can I choose the order of pages?",
        a: "Yes. The order of the images you add is the order of the pages in the PDF.",
      },
      {
        q: "Are my images uploaded?",
        a: "No. The conversion happens in your browser and the images stay on your device.",
      },
      {
        q: "Why is my PDF so large?",
        a: "Phone photos are large. Crop and resize images before converting, or compress the finished PDF.",
      },
      {
        q: "Why does my iPhone photo not work?",
        a: "iPhones may save pictures as HEIC. Export the photo as JPG, or set the camera format to “Most Compatible”, because the tool accepts only JPG and PNG.",
      },
      {
        q: "How can I fix a wrong page order?",
        a: "Clear the list and add the images again in the correct order, because the order of adding is the page order.",
      },
      {
        q: "Can I convert a photo of a document that is sideways?",
        a: "Rotate the image in your gallery or editing app first and then add it, so the page is upright in the PDF.",
      },
    ],
    ymylKind: "general",
  },
};
