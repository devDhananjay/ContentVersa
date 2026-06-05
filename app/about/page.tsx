import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("about");
export const generateMetadata = makeSitePageMetadata("about");
