import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";

export function TermsContent() {
  return (
    <>
      <h2>The service</h2>
      <p>
        Winter Arc is a free, personal challenge tracker for designers, made by Fuwad. By creating
        an account you agree to these terms and to the{" "}
        <Link href="/privacy">Privacy Policy</Link>. The service may change, pause or stop at any
        time; if it stops for good, reasonable notice will be given so you can save anything you
        want to keep.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Use a real email address you control, and keep your password to yourself.</li>
        <li>One account per person. You are responsible for what happens under your account.</li>
        <li>You must be at least 16 to use Winter Arc.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        Notes and links you add are yours. They are private to your account and are only stored so
        the app can show them back to you. Don&apos;t submit anything that is illegal, harmful, or
        that you don&apos;t have the right to share.
      </p>

      <h2>Fair use</h2>
      <p>
        Please don&apos;t try to break, overload, scrape or reverse-engineer the service, access
        other people&apos;s accounts, or use it for anything unlawful. Accounts that do may be
        suspended or removed.
      </p>

      <h2>No guarantees</h2>
      <p>
        Winter Arc is provided as-is, free of charge, by one person. There is no promise that it
        will always be available, bug-free, or that your progress can never be lost. To the extent
        the law allows, Fuwad isn&apos;t liable for any loss that comes from using, or not being
        able to use, the service. The tasks are suggestions for your own practice; what you do with
        them is up to you.
      </p>

      <h2>Ending things</h2>
      <p>
        You can delete your account at any time from your profile, which permanently removes your
        data. Accounts that break these terms may be suspended or deleted.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        These terms may be updated from time to time. The date at the top shows the current
        version; continuing to use Winter Arc after a change means you accept the new terms.
      </p>

      <h2>Law</h2>
      <p>These terms are governed by the laws of India.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
