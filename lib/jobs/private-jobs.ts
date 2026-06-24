import type { PrivateJob } from "@/lib/jobs/types";

/** Curated private-sector listings — replace with a jobs API when available. */
export const PRIVATE_JOBS: PrivateJob[] = [
  {
    id: "pj-1",
    title: "Software Engineer — Full Stack",
    company: "Razorpay",
    location: "Bengaluru · Hybrid",
    type: "Full-time",
    experience: "2–5 years",
    salary: "₹18–32 LPA",
    posted: "2 days ago",
    applyUrl: "https://razorpay.com/jobs/",
    skills: ["React", "Node.js", "PostgreSQL"],
  },
  {
    id: "pj-2",
    title: "Product Designer",
    company: "Swiggy",
    location: "Bengaluru",
    type: "Full-time",
    experience: "3–6 years",
    salary: "₹20–35 LPA",
    posted: "1 day ago",
    applyUrl: "https://careers.swiggy.com/",
    skills: ["Figma", "UX Research", "Design Systems"],
  },
  {
    id: "pj-3",
    title: "Data Analyst",
    company: "Flipkart",
    location: "Bengaluru · On-site",
    type: "Full-time",
    experience: "1–3 years",
    salary: "₹10–18 LPA",
    posted: "3 days ago",
    applyUrl: "https://www.flipkartcareers.com/",
    skills: ["SQL", "Python", "Tableau"],
  },
  {
    id: "pj-4",
    title: "Content Writer — Tech",
    company: "ContentVerse Partner Network",
    location: "Remote · India",
    type: "Remote",
    experience: "1–4 years",
    salary: "₹6–12 LPA",
    posted: "Today",
    applyUrl: "/creator-program",
    skills: ["SEO", "Blogging", "Research"],
  },
  {
    id: "pj-5",
    title: "DevOps Engineer",
    company: "Zoho",
    location: "Chennai",
    type: "Full-time",
    experience: "3–7 years",
    salary: "₹15–28 LPA",
    posted: "4 days ago",
    applyUrl: "https://www.zoho.com/careers/",
    skills: ["AWS", "Kubernetes", "CI/CD"],
  },
  {
    id: "pj-6",
    title: "Digital Marketing Intern",
    company: "Nykaa",
    location: "Mumbai · Hybrid",
    type: "Internship",
    experience: "Fresher",
    salary: "₹25k–35k / month",
    posted: "2 days ago",
    applyUrl: "https://www.nykaa.com/careers",
    skills: ["Social Media", "Analytics", "Canva"],
  },
  {
    id: "pj-7",
    title: "Android Developer",
    company: "PhonePe",
    location: "Pune · Hybrid",
    type: "Full-time",
    experience: "2–5 years",
    salary: "₹16–30 LPA",
    posted: "5 days ago",
    applyUrl: "https://www.phonepe.com/careers/",
    skills: ["Kotlin", "Jetpack", "REST APIs"],
  },
  {
    id: "pj-8",
    title: "Customer Success Manager",
    company: "Freshworks",
    location: "Chennai · Remote-friendly",
    type: "Full-time",
    experience: "2–4 years",
    salary: "₹12–20 LPA",
    posted: "1 week ago",
    applyUrl: "https://www.freshworks.com/company/careers/",
    skills: ["SaaS", "Communication", "CRM"],
  },
  {
    id: "pj-9",
    title: "ML Engineer",
    company: "Ola Krutrim",
    location: "Bengaluru",
    type: "Full-time",
    experience: "3–6 years",
    salary: "₹22–40 LPA",
    posted: "3 days ago",
    applyUrl: "https://krutrim.ai/",
    skills: ["PyTorch", "LLMs", "MLOps"],
  },
  {
    id: "pj-10",
    title: "Finance Analyst",
    company: "Paytm",
    location: "Noida · On-site",
    type: "Full-time",
    experience: "1–3 years",
    salary: "₹9–15 LPA",
    posted: "6 days ago",
    applyUrl: "https://paytm.com/careers",
    skills: ["Excel", "Financial Modelling", "Reporting"],
  },
  {
    id: "pj-11",
    title: "Frontend Engineer — React",
    company: "CRED",
    location: "Bengaluru · Hybrid",
    type: "Full-time",
    experience: "2–5 years",
    salary: "₹20–36 LPA",
    posted: "Today",
    applyUrl: "https://careers.cred.club/",
    skills: ["React", "TypeScript", "Performance"],
  },
  {
    id: "pj-12",
    title: "HR Business Partner",
    company: "Deloitte India",
    location: "Gurugram · Hybrid",
    type: "Full-time",
    experience: "4–8 years",
    salary: "₹14–24 LPA",
    posted: "1 week ago",
    applyUrl: "https://www2.deloitte.com/in/en/careers.html",
    skills: ["Talent", "Policy", "Stakeholder Mgmt"],
  },
];

export function getPrivateJobs(filters?: {
  type?: string;
  q?: string;
}): PrivateJob[] {
  let jobs = [...PRIVATE_JOBS];

  if (filters?.type && filters.type !== "all") {
    jobs = jobs.filter((job) => job.type === filters.type);
  }

  if (filters?.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return jobs;
}
