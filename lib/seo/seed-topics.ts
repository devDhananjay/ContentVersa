/** SEO article topics for AI seeding — travel, finance, tech (India-focused). */
export type SeedTopic = {
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  affiliateNote?: string;
  searchIntent: string;
};

export const SEO_ARTICLE_TOPICS: SeedTopic[] = [
  // Travel (8)
  {
    slug: "bareilly-uttar-pradesh-complete-travel-guide-2026",
    title: "Bareilly, Uttar Pradesh: A Complete Travel Guide (2026)",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1524492412937-280b9ca8c063?w=1600&auto=format&fit=crop",
    affiliateNote: "Include a practical tips section; mention booking trains/buses via IRCTC and MakeMyTrip as examples.",
    searchIntent: "Bareilly travel guide, places to visit, best time, food, how to reach",
  },
  {
    slug: "weekend-getaways-from-delhi-under-5000",
    title: "15 Weekend Getaways from Delhi Under ₹5,000 (2026)",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop",
    affiliateNote: "Mention budget stays on MakeMyTrip or Booking.com for price comparison.",
    searchIntent: "cheap weekend trips from Delhi, budget travel India",
  },
  {
    slug: "jaipur-3-day-itinerary-first-time-visitors",
    title: "Jaipur 3-Day Itinerary for First-Time Visitors",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600&auto=format&fit=crop",
    searchIntent: "Jaipur itinerary, Amber Fort, Hawa Mahal, best places Jaipur",
  },
  {
    slug: "rishikesh-travel-guide-yoga-adventure-2026",
    title: "Rishikesh Travel Guide: Yoga, Rafting & Riverside Stays (2026)",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop",
    searchIntent: "Rishikesh travel guide, rafting, yoga retreats, best time to visit",
  },
  {
    slug: "goa-monsoon-travel-guide-india",
    title: "Goa in Monsoon: A Complete Travel Guide for Indians",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&auto=format&fit=crop",
    searchIntent: "Goa monsoon travel, off-season Goa, beaches rains",
  },
  {
    slug: "manali-budget-trip-guide-himachal-2026",
    title: "Manali on a Budget: Himachal Pradesh Trip Guide (2026)",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&auto=format&fit=crop",
    searchIntent: "Manali budget trip, Solang Valley, Rohtang, Himachal travel",
  },
  {
    slug: "kerala-backwaters-munnar-alleppey-guide",
    title: "Kerala Backwaters: Munnar & Alleppey Travel Guide",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1602216051446-39c65eeef257?w=1600&auto=format&fit=crop",
    searchIntent: "Kerala backwaters, Munnar tea gardens, Alleppey houseboat",
  },
  {
    slug: "varanasi-spiritual-travel-guide-beginners",
    title: "Varanasi for Beginners: A Spiritual Travel Guide",
    category: "travel",
    coverImage:
      "https://images.unsplash.com/photo-1561361513-2d2a58e2ac28?w=1600&auto=format&fit=crop",
    searchIntent: "Varanasi travel guide, Ganga aarti, ghats, Kashi",
  },
  // Finance (8)
  {
    slug: "how-to-start-sip-investing-india-2026",
    title: "How to Start SIP Investing in India: Beginner Guide (2026)",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&auto=format&fit=crop",
    affiliateNote:
      "Mention comparing direct plans on Groww, Zerodha Coin, or official AMC sites. Add disclaimer: not financial advice.",
    searchIntent: "SIP investing India beginner, how to start mutual fund SIP",
  },
  {
    slug: "nifty-50-index-fund-vs-direct-stocks-india",
    title: "Nifty 50 Index Funds vs Direct Stocks: What Should Indians Pick?",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1600&auto=format&fit=crop",
    affiliateNote: "Reference index funds and discount brokers for education only.",
    searchIntent: "Nifty 50 index fund vs stocks, passive investing India",
  },
  {
    slug: "emergency-fund-how-much-save-india",
    title: "Emergency Fund in India: How Much Should You Save?",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&auto=format&fit=crop",
    searchIntent: "emergency fund India, how many months expenses, liquid funds",
  },
  {
    slug: "ppf-vs-nps-vs-mutual-funds-comparison",
    title: "PPF vs NPS vs Mutual Funds: A Practical Comparison for Indians",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&auto=format&fit=crop",
    searchIntent: "PPF vs NPS vs mutual funds, long term investing India",
  },
  {
    slug: "credit-card-rewards-optimization-india",
    title: "Credit Card Rewards in India: How to Optimize Without Overspending",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1563013547-824ae1b704d3?w=1600&auto=format&fit=crop",
    searchIntent: "best credit card rewards India, cashback travel points",
  },
  {
    slug: "tax-saving-investments-80c-guide-india-2026",
    title: "Section 80C Tax Saving: Complete Guide for FY 2025–26",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&auto=format&fit=crop",
    searchIntent: "80C deductions India, ELSS PPF tax saving",
  },
  {
    slug: "gold-vs-real-estate-vs-equity-india",
    title: "Gold vs Real Estate vs Equity: Where Indians Should Invest in 2026",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1610375461246-83c9af3d0f4a?w=1600&auto=format&fit=crop",
    searchIntent: "gold vs real estate vs stocks India, asset allocation",
  },
  {
    slug: "freelancer-income-tax-guide-india",
    title: "Freelancer Income Tax in India: GST, ITR & Deductions Explained",
    category: "finance",
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&auto=format&fit=crop",
    searchIntent: "freelancer tax India, ITR filing, GST threshold",
  },
  // Tech / AI / Creator (9)
  {
    slug: "nextjs-15-app-router-best-practices-2026",
    title: "Next.js 15 App Router: Best Practices for Production (2026)",
    category: "technology",
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop",
    searchIntent: "Next.js 15 app router, server components, best practices",
  },
  {
    slug: "ai-content-creation-workflow-creators",
    title: "AI Content Creation Workflow: A Practical Guide for Creators",
    category: "ai",
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&auto=format&fit=crop",
    searchIntent: "AI writing workflow, Gemini ChatGPT content creators",
  },
  {
    slug: "typescript-tips-react-developers-2026",
    title: "TypeScript Tips Every React Developer Should Know (2026)",
    category: "programming",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop",
    searchIntent: "TypeScript React tips, types patterns 2026",
  },
  {
    slug: "building-creator-platform-tech-stack-guide",
    title: "Building a Creator Platform: Tech Stack Guide for Indie Founders",
    category: "startups",
    coverImage:
      "https://images.unsplash.com/photo-1664575599736-c5197c684128?w=1600&auto=format&fit=crop",
    searchIntent: "creator platform tech stack, Next.js Postgres SaaS",
  },
  {
    slug: "google-gemini-api-integration-guide-developers",
    title: "Google Gemini API Integration: A Developer's Step-by-Step Guide",
    category: "ai",
    coverImage:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop",
    searchIntent: "Gemini API tutorial, Google AI Studio integration",
  },
  {
    slug: "seo-checklist-new-websites-2026",
    title: "SEO Checklist for New Websites in 2026 (Google Search Console)",
    category: "business",
    coverImage:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=1600&auto=format&fit=crop",
    searchIntent: "SEO checklist new website, sitemap indexing Google",
  },
  {
    slug: "how-to-monetize-blog-india-2026",
    title: "How to Monetize a Blog in India: AdSense, Affiliates & Tips (2026)",
    category: "business",
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop",
    affiliateNote:
      "Cover AdSense, affiliate marketing (Amazon Associates, finance/travel), and creator tips. Not financial advice.",
    searchIntent: "blog monetization India, AdSense affiliate income",
  },
  {
    slug: "cloudinary-vs-s3-media-hosting-creators",
    title: "Cloudinary vs AWS S3: Best Media Hosting for Creator Apps",
    category: "technology",
    coverImage:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1600&auto=format&fit=crop",
    searchIntent: "Cloudinary vs S3, video image hosting creators",
  },
  {
    slug: "postgresql-vs-mongodb-content-applications",
    title: "PostgreSQL vs MongoDB for Content & Creator Applications",
    category: "programming",
    coverImage:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1600&auto=format&fit=crop",
    searchIntent: "PostgreSQL vs MongoDB blogs CMS, database choice",
  },
];
