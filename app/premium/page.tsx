import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("premium");
export const generateMetadata = makeSitePageMetadata("premium");
