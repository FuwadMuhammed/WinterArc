import { CONTACT_EMAIL } from "@/lib/constants";

export function PrivacyContent() {
  return (
    <>
      <h2>Who runs this</h2>
      <p>
        Winter Arc is made and run by Fuwad, an individual designer, not a company. If anything
        here is unclear or you want to exercise any of the choices below, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>What is collected</h2>
      <p>Only what the app needs to work:</p>
      <ul>
        <li>
          <strong>Account.</strong> Your email address and a password. Passwords are handled and
          hashed by Supabase; Winter Arc never sees or stores them in plain text.
        </li>
        <li>
          <strong>Google sign-in.</strong> If you sign in with Google, Google shares your name,
          email address and profile picture. Nothing else from your Google account is accessed.
        </li>
        <li>
          <strong>Your progress.</strong> Which tasks you tick off, when you joined, and any notes
          or links you add as proof. Notes are private to you and are never shown to other
          members.
        </li>
        <li>
          <strong>Usage analytics.</strong> PostHog records page views, clicks and general
          interactions, along with your browser, device type and an approximate location derived
          from your IP address. This is used in aggregate to see what is working.
        </li>
        <li>
          <strong>Cookies.</strong> A session cookie keeps you signed in, and PostHog sets a cookie
          to tell returning visitors apart. There are no advertising cookies.
        </li>
      </ul>

      <h2>Why it is collected</h2>
      <ul>
        <li>To run the challenge: sign you in, save your ticks and show your progress.</li>
        <li>To understand how the app is used so it can be improved.</li>
        <li>To find and fix problems.</li>
      </ul>
      <p>
        Your data is never sold, and it is never used for advertising or shared with anyone
        other than the services listed below.
      </p>

      <h2>Where it lives</h2>
      <p>Winter Arc relies on a few services, each of which processes data on its behalf:</p>
      <ul>
        <li>
          <strong>Supabase</strong> stores your account and progress (authentication and database).
        </li>
        <li>
          <strong>Vercel</strong> hosts the website.
        </li>
        <li>
          <strong>PostHog</strong> stores usage analytics.
        </li>
        <li>
          <strong>Google</strong> is only involved if you choose to sign in with Google.
        </li>
      </ul>
      <p>These services may store data outside your country, including in the United States.</p>

      <h2>How long it is kept</h2>
      <p>
        Your account and progress are kept until you delete your account. Analytics data is kept
        according to PostHog&apos;s retention settings and is not tied back to your account after
        deletion.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          <strong>Delete your account</strong> at any time from your profile. This permanently
          removes your account, progress and notes.
        </li>
        <li>
          <strong>Reset your progress</strong> from your profile to start the arc again from Day 1.
        </li>
        <li>
          <strong>Ask for a copy</strong> of your data, or ask for it to be deleted, by emailing{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </li>
        <li>
          <strong>Block cookies</strong> in your browser. Signing in needs the session cookie, but
          everything else will keep working.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        Winter Arc is not intended for anyone under 16. If you believe a child has created an
        account, get in touch and it will be removed.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that matters, the date at the top will be updated and,
        for significant changes, a notice will be shown in the app.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
