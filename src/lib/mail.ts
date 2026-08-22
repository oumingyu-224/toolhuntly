import { ApprovalEmail } from "@/emails/approval-email";
import { NotifySubmissionEmail } from "@/emails/notify-submission-to-admin";
import { NotifySubmissionToUserEmail } from "@/emails/notify-submission-to-user";
import { PaymentSuccessEmail } from "@/emails/payment-success";
import RejectionEmail from "@/emails/rejection-email";
import { ResetPasswordEmail } from "@/emails/reset-password";
import VerifyEmail from "@/emails/verify-email";
import { Resend } from "resend";

/**
 * NOTE: Lazy-init the Resend client. We intentionally avoid throwing at
 * module-evaluation time because Vercel's Next.js build phase imports the
 * module graph when collecting page data for every route — even client-only
 * pages like /unsubscribe drag this file in via server actions. A missing
 * RESEND_API_KEY at build time used to crash the entire build before any
 * page could be rendered. Instead we defer init to first use and surface
 * a clear error inside any caller.
 */
let _resend: Resend | null | undefined;

function initResend(): Resend | null {
  if (_resend !== undefined) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (typeof console !== "undefined") {
      console.warn(
        "[lib/mail] RESEND_API_KEY is not configured. Email services unavailable.",
      );
    }
    _resend = null;
    return _resend;
  }
  try {
    _resend = new Resend(apiKey);
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn("[lib/mail] Failed to initialize Resend client:", error);
    }
    _resend = null;
  }
  return _resend;
}

/**
 * Used by callers that need direct access to `resend.contacts.*` or
 * `resend.emails.*` (e.g. subscribe/unsubscribe actions). Callers must
 * handle a `null` return by returning an appropriate error payload.
 */
export function getResend(): Resend | null {
  return initResend();
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;

function missingKeyError(): Error {
  return new Error("RESEND_API_KEY is not configured. Cannot send email.");
}

export const sendPasswordResetEmail = async (
  userName: string,
  email: string,
  token: string,
) => {
  const resend = initResend();
  if (!resend) throw missingKeyError();

  const resetLink = `${SITE_URL}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to: email,
    subject: "Reset your password",
    react: ResetPasswordEmail({ userName, resetLink: resetLink }),
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const resend = initResend();
  if (!resend) throw missingKeyError();

  const confirmLink = `${SITE_URL}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to: email,
    subject: "Confirm your email",
    react: VerifyEmail({ confirmLink }),
  });
};

export const sendNotifySubmissionEmail = async (
  userName: string,
  userEmail: string,
  itemName: string,
  statusLink: string,
  reviewLink: string,
) => {
  const resend = initResend();
  if (!resend) {
    console.warn("[lib/mail] sendNotifySubmissionEmail skipped — no RESEND_API_KEY");
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to: userEmail,
    subject: "Thank you for your submission",
    react: NotifySubmissionToUserEmail({
      userName,
      itemName,
      statusLink,
    }),
  });

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to: process.env.RESEND_EMAIL_ADMIN,
    subject: "New submission",
    react: NotifySubmissionEmail({ itemName, reviewLink }),
  });
};

export const sendPaymentSuccessEmail = async (
  userName: string,
  email: string,
  itemLink: string,
) => {
  const resend = initResend();
  if (!resend) {
    console.warn("[lib/mail] sendPaymentSuccessEmail skipped — no RESEND_API_KEY");
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to: email,
    subject: "Thank your for your submission",
    react: PaymentSuccessEmail({ userName, itemLink }),
  });
};

export const sendApprovalEmail = async (
  userName: string,
  email: string,
  itemLink: string,
) => {
  const resend = initResend();
  if (!resend) {
    console.warn("[lib/mail] sendApprovalEmail skipped — no RESEND_API_KEY");
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to: email,
    subject: "Your submission has been approved",
    react: ApprovalEmail({ userName, itemLink }),
  });
};

export const sendRejectionEmail = async (
  userName: string,
  email: string,
  dashboardLink: string,
) => {
  const resend = initResend();
  if (!resend) {
    console.warn("[lib/mail] sendRejectionEmail skipped — no RESEND_API_KEY");
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to: email,
    subject: "Please check your submission",
    react: RejectionEmail({ userName, dashboardLink }),
  });
};