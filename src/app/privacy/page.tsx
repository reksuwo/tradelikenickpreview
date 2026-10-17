import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { LEGAL_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — TradeLikeNick",
  description: "What TradeLikeNick collects about you, why, who we share it with, and how to control it.",
};

const mail = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <p>
        TradeLikeNick (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs this website, our apps, and the
        courses and books sold on them. We are responsible for the personal information described in
        this policy. You can reach us about privacy at any time at {mail}.
      </p>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p>
          <strong>Information you give us.</strong>
        </p>
        <ul>
          <li>Your name, email address and password when you create an account.</li>
          <li>
            If you sign in with Google or Apple, the name, email address and profile photo that service
            shares with us. We never receive your Google or Apple password.
          </li>
          <li>Anything you send us, such as support emails or questions in live sessions.</li>
        </ul>
        <p>
          <strong>Information created as you use TradeLikeNick.</strong>
        </p>
        <ul>
          <li>What you buy, your order history and your refund requests.</li>
          <li>Your library, wishlist, and where you stopped in each lesson.</li>
          <li>
            Technical data such as your IP address, browser, device type and sign-in times, which our
            hosting and sign-in providers log to keep accounts secure.
          </li>
        </ul>
        <p>
          <strong>Payment information.</strong> Card payments are taken by Stripe. Stripe receives your
          card details directly. We only receive a record of the payment, such as the amount, date, card
          brand and last four digits.
        </p>
        <p>We do not collect information about your brokerage accounts, positions or trades.</p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <ul>
        <li>To create and secure your account and sign you in.</li>
        <li>To give you access to the courses and books you buy, and to process payments and refunds.</li>
        <li>To remember your progress and sync it across your devices.</li>
        <li>
          To send account emails, such as sign-up confirmation, password resets and receipts. You
          cannot opt out of these while you have an account.
        </li>
        <li>
          To send news about new courses and live sessions, only if you ask for it. Every such email
          has an unsubscribe link.
        </li>
        <li>To answer your questions, prevent fraud and account sharing, and comply with the law.</li>
        <li>To understand which lessons are useful so we can improve them.</li>
      </ul>
    ),
  },
  {
    id: "legal-bases",
    title: "Legal bases",
    body: (
      <>
        <p>
          If you are in the UK, the European Economic Area or a similar jurisdiction, we rely on these
          legal bases:
        </p>
        <ul>
          <li>
            <strong>Contract</strong> for running your account and delivering what you buy.
          </li>
          <li>
            <strong>Legitimate interests</strong> for security, fraud prevention and improving lessons.
          </li>
          <li>
            <strong>Consent</strong> for marketing emails. You can withdraw it at any time.
          </li>
          <li>
            <strong>Legal obligation</strong> for keeping tax and accounting records.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>
          <strong>We do not sell your personal information,</strong> and we do not share it for
          cross-context behavioural advertising. We share it only with service providers who help run
          TradeLikeNick and who may use it only to provide their service to us:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> hosts our database and handles sign-in.
          </li>
          <li>
            <strong>Stripe</strong> processes payments.
          </li>
          <li>
            <strong>Our email provider</strong> delivers account and receipt emails.
          </li>
          <li>
            <strong>Google and Apple</strong>, only if you choose to sign in with them.
          </li>
          <li>
            <strong>Our website host</strong> serves the site and keeps standard server logs.
          </li>
        </ul>
        <p>
          We may also disclose information when the law requires it, to protect someone&rsquo;s safety,
          or as part of a sale or merger of the business. In a sale, this policy would continue to
          apply to your information.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <>
        <p>We only use cookies that the site needs to work:</p>
        <ul>
          <li>A sign-in cookie that keeps you logged in.</li>
          <li>
            A short-lived cookie that remembers your email between signing up and confirming it, so we
            can resend the confirmation link. It is deleted once you confirm.
          </li>
        </ul>
        <p>
          We do not use advertising cookies or cross-site tracking. If we ever add analytics that need
          your consent, we will ask first and update this policy.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep your account information for as long as your account is open. When you delete your
        account, we delete or anonymise your personal information within 30 days. The exception is
        purchase records, which we keep for as long as tax and accounting law requires, usually up to
        seven years. Backups are overwritten on a rolling schedule.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Passwords are hashed and never stored in readable form. Data travels over encrypted connections
        and access to our systems is limited to people who need it. No system is perfectly secure, so
        please use a strong, unique password. If a breach affects your information, we will tell you
        and the relevant authorities as the law requires.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights and choices",
    body: (
      <>
        <p>Depending on where you live, you can ask us to:</p>
        <ul>
          <li>Give you a copy of the personal information we hold about you.</li>
          <li>Correct anything that is wrong. You can change your name yourself in account settings.</li>
          <li>Delete your account and personal information.</li>
          <li>Send your information to you or another service in a portable format.</li>
          <li>Stop or limit certain uses, including marketing emails.</li>
        </ul>
        <p>
          Email {mail} from the address on your account and we will respond within 30 days. We will not
          treat you differently for using these rights. If you are in the UK or EEA, you can also
          complain to your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <p>
        Our service providers may store and process information in the United States and other
        countries. Where the law requires it, we rely on safeguards such as the European
        Commission&rsquo;s standard contractual clauses for these transfers.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        TradeLikeNick is for adults. You must be 18 or older to create an account, and we do not
        knowingly collect information from anyone younger. If you think a child has signed up, email{" "}
        {mail} and we will delete the account.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We will update this policy when our practices change and show the new date at the top. If a
        change is significant, we will email you or show a notice when you sign in before it takes
        effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions or requests about your privacy? Email {mail}. For the rules on using TradeLikeNick,
        see our <Link href="/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          The short version: we collect what we need to run your account and deliver your courses. We
          never sell it, we only use cookies the site needs, and you can ask us to delete it at any
          time.
        </p>
      }
      sections={SECTIONS}
      related={{ label: "Read the Terms of Service", href: "/terms" }}
    />
  );
}
