import { ReportsQueue } from "@/components/admin/reports-queue";
import { getAdminReports, getAdminReportsCounts } from "@/lib/data/admin-reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [reports, counts] = await Promise.all([
    getAdminReports("PENDING"),
    getAdminReportsCounts(),
  ]);

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          User-submitted reports on content, comments, and users.
        </p>
      </div>
      <ReportsQueue initialReports={reports} initialCounts={counts} />
    </div>
  );
}
