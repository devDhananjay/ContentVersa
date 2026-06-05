import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("terms");
export const generateMetadata = makeSitePageMetadata("terms");
