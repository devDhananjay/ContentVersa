import { sendEmail } from "@/lib/email/mailer";
import { accountInactiveEmail } from "@/lib/email/templates";
import { CONTACT_EMAIL } from "@/lib/site-contact";

function isRealEmail(email: string | null | undefined): email is string {
  const e = email?.trim().toLowerCase() ?? "";
  if (!e || !e.includes("@")) return false;
  if (e.endsWith("@phone.contentverse.local")) return false;
  return true;
}

/** Notify the user that an admin deactivated their account. */
export async function notifyAccountInactive(input: {
  email?: string | null;
  name?: string | null;
  reason?: string | null;
}): Promise<boolean> {
  if (!isRealEmail(input.email)) return false;

  const { subject, html } = accountInactiveEmail({
    name: input.name,
    reason: input.reason,
    contactEmail: CONTACT_EMAIL,
  });

  try {
    return await sendEmail({
      to: input.email,
      subject,
      html,
      replyTo: CONTACT_EMAIL,
    });
  } catch (err) {
    console.error("[account-inactive-email] failed", input.email, err);
    return false;
  }
}
