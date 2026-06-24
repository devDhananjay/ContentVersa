import { JobsBrowseShell } from "@/components/jobs/jobs-browse-shell";

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <JobsBrowseShell>{children}</JobsBrowseShell>;
}
