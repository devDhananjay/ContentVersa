import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("careers");
export const generateMetadata = makeSitePageMetadata("careers");
