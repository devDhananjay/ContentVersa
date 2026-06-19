import { getBrandingAssets } from "@/lib/data/site-branding";

/** Dynamic favicon links when admin uploads a custom favicon. */
export async function BrandingHead() {
  const branding = await getBrandingAssets();
  const favicon = branding.favicon.current;

  if (!favicon) {
    return (
      <>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </>
    );
  }

  return (
    <>
      <link rel="icon" href={favicon} />
      <link rel="shortcut icon" href={favicon} />
      <link rel="apple-touch-icon" href={favicon} />
    </>
  );
}
