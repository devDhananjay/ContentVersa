import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("creator-program");
export const generateMetadata = makeSitePageMetadata("creator-program");
