import Link from "next/link";
import { ExternalLink, MapPin, MessageSquareWarning, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

const BIS_JEWELLER_SEARCH =
  "https://www.bis.gov.in/index.php/recognition/recognition-of-jewellers/";

const BIS_COMPLAINT =
  "https://www.bis.gov.in/index.php/complaint/complaint-registration/";

export function GoldVerseToolsStrip() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card p-6">
        <div className="flex items-center gap-2 text-amber-400">
          <MapPin className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold text-foreground">Nearby jewellers</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Find BIS-recognised jewellers and hallmarking centres on the official BIS portal.
          Search by state, city or registration number.
        </p>
        <Button asChild variant="outline" className="mt-4 gap-2 border-amber-500/30">
          <a href={BIS_JEWELLER_SEARCH} target="_blank" rel="noopener noreferrer">
            <Store className="h-4 w-4" />
            BIS jeweller directory
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </Button>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-card p-6">
        <div className="flex items-center gap-2 text-red-400">
          <MessageSquareWarning className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold text-foreground">BIS complaint</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Report fake hallmark, under-karat gold or jeweller misconduct directly to BIS.
          Keep your invoice and HUID details ready.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2 border-red-500/30">
            <a href={BIS_COMPLAINT} target="_blank" rel="noopener noreferrer">
              File BIS complaint
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/contact?subject=BIS%20Hallmark%20Issue">Need help from us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
