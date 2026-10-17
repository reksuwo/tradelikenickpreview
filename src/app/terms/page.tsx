import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { GOVERNING_LAW, LEGAL_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service — TradeLikeNick",
  description:
    "The agreement between you and TradeLikeNick when you create an account, watch lessons or buy a course.",
};

const mail = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreeing to these terms",
    body: (
      <>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) are an agreement between you and TradeLikeNick
          (&ldquo;TradeLikeNick&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). They cover the website,
          the apps, the courses, books, live sessions and anything else we offer (together, the
          &ldquo;Service&rdquo;).
        </p>
        <p>
          By creating an account, signing in with Google or Apple, or buying anything from us, you
          agree to these Terms and to our <Link href="/privacy">Privacy Policy</Link>. If you do not
          agree, do not use the Service.
        </p>
      </>
    ),
  },
  {
    id: "education",
    title: "Educational content only, not financial advice",
    body: (
      <>
        <p>
          <strong>
            Everything on TradeLikeNick is general education. None of it is investment, financial,
            legal or tax advice, and none of it is a recommendation to buy or sell any security,
            future, option, currency or other instrument.
          </strong>
        </p>
        <p>
          TradeLikeNick and Nick Pham are not registered broker-dealers, investment advisers or
          financial planners. We do not know your finances, goals or tolerance for risk, and nothing
          we publish takes them into account. Talk to a licensed professional before making financial
          decisions.
        </p>
        <p>
          Examples, case studies, trade reviews and past results shown in lessons are for
          illustration. They are not signals, and you should not copy them.
        </p>
      </>
    ),
  },
  {
    id: "risk",
    title: "Trading risk",
    body: (
      <>
        <p>
          Trading futures, options, stocks, forex and crypto involves substantial risk of loss. With
          some products you can lose more than you deposit. Past performance, whether real,
          hypothetical or simulated, does not indicate future results. Hypothetical and simulated
          results have inherent limits and do not reflect real trading.
        </p>
        <p>
          Testimonials describe individual experiences. They are not typical and are not a promise
          that you will get similar results.
        </p>
        <p>
          You alone decide whether, what and how to trade, and you alone are responsible for the
          result. Never trade with money you cannot afford to lose.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use TradeLikeNick",
    body: (
      <p>
        You must be at least 18 years old, or the age of majority where you live if that is higher,
        and able to enter a binding contract. You must not use the Service where doing so would break
        the law that applies to you.
      </p>
    ),
  },
  {
    id: "account",
    title: "Your account",
    body: (
      <ul>
        <li>Give us accurate details and keep your email address current.</li>
        <li>
          Keep your password private. You are responsible for everything done through your account.
        </li>
        <li>
          One account is for one person. Do not share your login or let anyone else watch on your
          account.
        </li>
        <li>Tell us at {mail} straight away if you think someone else has accessed your account.</li>
      </ul>
    ),
  },
  {
    id: "purchases",
    title: "Purchases and access",
    body: (
      <>
        <p>
          A free account lets you watch the opening episodes of each course. Other courses, books and
          content are sold individually. There is no subscription.
        </p>
        <p>
          Prices are shown at checkout in the currency displayed, and tax may be added depending on
          where you live. Payments are handled by our payment provider, Stripe. We never see or store
          your full card number.
        </p>
        <p>
          When you buy a course or book, you can use it for as long as TradeLikeNick operates the
          Service, including lessons we later add to that title. If we ever stop offering a title you
          paid for, we will give you reasonable notice and, where we can, a way to keep studying it.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds",
    body: (
      <>
        <p>
          If a purchase is not right for you, email {mail} within 30 days of buying it and we will
          refund the full amount. No forms and no questions. Refunds go back to the original payment
          method and the title is removed from your library.
        </p>
        <p>
          We may refuse refunds where an account shows clear abuse, such as repeated buy-and-refund
          cycles. This does not limit any refund right that the law where you live gives you.
        </p>
      </>
    ),
  },
  {
    id: "licence",
    title: "Your licence to use our content",
    body: (
      <>
        <p>
          All lessons, videos, books, worksheets, templates, live sessions and other material on the
          Service belong to TradeLikeNick or its licensors and are protected by copyright and other
          laws.
        </p>
        <p>
          We give you a personal, non-exclusive, non-transferable licence to watch and use the content
          you have access to for your own learning. You may not:
        </p>
        <ul>
          <li>
            Copy, record, screen-capture, download outside our apps, resell or redistribute any
            content.
          </li>
          <li>Share course material, books or live-session recordings publicly or in paid groups.</li>
          <li>Use the content to build a competing course, product or AI training data set.</li>
          <li>Remove copyright notices or get around access controls.</li>
        </ul>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Acceptable use",
    body: (
      <>
        <p>
          When you use the Service, including live sessions and any comment or community spaces, you
          agree not to:
        </p>
        <ul>
          <li>Harass, threaten or abuse anyone.</li>
          <li>
            Promote signal services, paid groups, brokers or other products without our permission.
          </li>
          <li>Post anything unlawful, misleading, or that infringes someone else&rsquo;s rights.</li>
          <li>Probe, scrape, overload or interfere with the Service or its security.</li>
          <li>Create accounts by automated means or under a false identity.</li>
        </ul>
        <p>
          If you post or send us content, you keep ownership of it. You give us permission to host and
          show it as part of the Service.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <p>
        The Service relies on other companies, such as our hosting, sign-in, payment and market-data
        providers. Market prices shown on the site may be delayed or wrong and are for illustration
        only. Links to other websites, brokers or tools are for convenience. We do not control them and
        are not responsible for them.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Suspension and closing your account",
    body: (
      <>
        <p>
          You can stop using the Service at any time, and you can ask us to delete your account by
          emailing {mail}.
        </p>
        <p>
          We may suspend or close an account that breaks these Terms, for example by sharing logins or
          redistributing content. Where the breach is not serious we will warn you first. If we close
          your account without good reason under these Terms, we will refund what you paid for content
          you can no longer reach.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <p>
        We work hard to keep the Service accurate and available, but it is provided &ldquo;as
        is&rdquo; and &ldquo;as available&rdquo;. To the extent the law allows, we make no warranty
        that the Service will be uninterrupted or error-free, or that any content will lead to a
        particular trading result.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limits on our liability",
    body: (
      <>
        <p>
          To the extent the law allows, TradeLikeNick, Nick Pham and our team are not liable for trading
          losses, lost profits, or indirect, incidental or consequential damages arising from your use
          of the Service, even if we were told they were possible.
        </p>
        <p>
          Our total liability for any claim relating to the Service is limited to the amount you paid
          us in the 12 months before the claim. Some places do not allow these limits, so they may not
          all apply to you.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <p>
        If you break these Terms or the law and someone brings a claim against us because of it, you
        agree to cover our reasonable costs of dealing with that claim.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these Terms as the Service changes. If a change is significant, we will email you
        or show a notice when you sign in at least 14 days before it takes effect. Continuing to use the
        Service after that date means you accept the new Terms.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <p>
        These Terms are governed by the laws of {GOVERNING_LAW}. Before starting any formal dispute,
        please email {mail} so we can try to sort it out informally. Nothing here removes consumer
        rights you have under the law of the country where you live.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: <p>Questions about these Terms? Email {mail} and a person will reply within a day.</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          The short version: TradeLikeNick teaches trading process. It is not financial advice,
          trading is risky, what you buy is for your own use, and you have 30 days to change your
          mind.
        </p>
      }
      sections={SECTIONS}
      related={{ label: "Read the Privacy Policy", href: "/privacy" }}
    />
  );
}
