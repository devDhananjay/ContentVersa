import { makeSitePage, makeSitePageMetadata } from "@/lib/site-page-factory";

export const dynamic = "force-dynamic";
export default makeSitePage("policy");
export const generateMetadata = makeSitePageMetadata("policy");
