import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("press");
export const generateMetadata = makeSitePageMetadata("press");
