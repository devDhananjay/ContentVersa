import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("privacy");
export const generateMetadata = makeSitePageMetadata("privacy");
