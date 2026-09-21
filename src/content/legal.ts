/**
 * Single source of truth for the legal / pricing copy.
 *
 * These pages must be readable by crawlers that do NOT execute JavaScript
 * (Paddle's readiness crawler among them), so the same data is consumed by:
 *   1. the React pages (src/pages/Terms|Privacy|Refund|Pricing.tsx)
 *   2. the build-time prerender plugin in vite.config.ts, which bakes the text
 *      into the initial HTML of /terms, /privacy, /refund and /pricing.
 * Never inline copy directly in those pages — edit it here.
 */

export type LegalSection = { title: string; content: string };

export const LEGAL_UPDATED = 'May 4, 2026';

const SELLER =
  'DeWayne Woods, sole proprietor, operating the Inner Wake service (the "Seller", "we", "our", or "us")';

export const TERMS_INTRO =
  'Welcome to Inner Wake. These Terms govern your use of the Service. Please read them carefully before creating an account or making a purchase.';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: '1. Who You Are Contracting With',
    content: `Inner Wake (the "Service") is operated by DeWayne Woods, sole proprietor, trading as Inner Wake (the "Seller", "we", "our", or "us"), with a principal place of business at 1041 Market St, San Diego, CA 92101, United States. By creating an account, accessing the Service, or making a purchase, you ("you" or "User") enter into a binding agreement with the Seller on these Terms of Service (the "Terms"). If you do not agree, do not use the Service.`,
  },
  {
    title: '2. Eligibility and Authority',
    content: `You must be at least 13 years of age (or 16 in the EEA/UK where required) to use the Service. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.`,
  },
  {
    title: '3. Description of Service',
    content: `Inner Wake is an emotional wellness practice app that provides tools for self-reflection, emotional check-ins, guided reframes, gathered affirmations, ritual templates, and AI-assisted emotional support. Inner Wake is not a substitute for professional therapy, counseling, medical, financial, or legal advice. If you are in crisis, please contact a qualified professional or local emergency service.`,
  },
  {
    title: '4. Your Account',
    content: `You must provide a valid email and create a password to use the Service. You are responsible for keeping your credentials confidential and for all activity under your account. You agree to provide accurate information and keep it up to date. Notify us immediately of any unauthorized use.`,
  },
  {
    title: '5. Acceptable Use',
    content: `You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to other users' data, our systems, or any underlying infrastructure; (c) probe, scan, scrape, or test the vulnerability of the Service; (d) introduce malware or interfere with the Service's operation; (e) misrepresent your identity or submit false or misleading information; (f) use the Service to harass, defame, or harm others; or (g) use automated systems to access the Service without our written permission. We may suspend or terminate accounts that violate this section.`,
  },
  {
    title: '6. AI Features — Acceptable Use and Limits',
    content: `Some features (Current Guide, Affirmation Coach, first-affirmation generation, script generation) use generative AI. You must not use AI features to: generate illegal content; create deepfakes, sexual content involving minors, or content that incites violence or hatred; generate malware or attempt to jailbreak the underlying models; or impersonate real people without consent. You are responsible for your prompts, for how you use any output, and for verifying accuracy before relying on it. AI outputs may be inaccurate or incomplete and are not professional advice. We may filter, refuse, or remove outputs and may suspend accounts that misuse AI features. You are responsible for ensuring you have the rights to any content you submit as input.`,
  },
  {
    title: '7. Intellectual Property',
    content: `All content within Inner Wake — including text, reframes, ritual templates, library affirmations, UI design, branding, code, and trademarks — is original to or licensed by the Seller and is protected by intellectual property laws. We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for personal, non-commercial use during the term of your account. You may not copy, reproduce, redistribute, sell, sublicense, reverse engineer, or create derivative works of the Service or its content without our written permission. Your personal data (your check-ins, reflections, scripts, evidence logs, and other entries you create) remains yours; you grant us a limited license to host, store, and process it solely to provide the Service to you.`,
  },
  {
    title: '8. Payment and Subscription Terms',
    content: `Paid plans are sold and processed by our reseller and Merchant of Record, Paddle.com Market Limited ("Paddle"). When you purchase a subscription or one-time plan, Paddle handles checkout, billing, sales tax, invoicing, refunds, and chargebacks on our behalf. Subscriptions automatically renew at the end of each billing period at the then-current price unless you cancel before the renewal date. You can cancel at any time through the customer portal linked from your Profile screen, or by contacting Paddle directly at paddle.net. Cancellation takes effect at the end of the current billing period; you keep access until then. Detailed payment, billing, tax, cancellation, and refund mechanics are governed by Paddle's Buyer Terms, available at https://www.paddle.com/legal/checkout-buyer-terms. Our refund policy is set out at /refund.`,
  },
  {
    title: '9. Paddle as Merchant of Record',
    content: `Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.`,
  },
  {
    title: '10. Service Level',
    content: `We work hard to keep the Service available and reliable, but we do not guarantee that it will be uninterrupted, error-free, or always available. We may modify, suspend, or discontinue features at any time. Scheduled maintenance and unforeseen outages can occur.`,
  },
  {
    title: '11. Suspension and Termination',
    content: `We may suspend or terminate your access to the Service, with or without notice, for: (a) material breach of these Terms; (b) non-payment; (c) suspected fraud, abuse, or security risk; (d) repeated or serious violations of Section 5 or Section 6; or (e) where required by law. You may stop using the Service and delete your account at any time from the Profile screen. Upon termination, all personal data tied to your account is permanently removed within 30 days as described in our Privacy Notice, except where we are legally required to retain it.`,
  },
  {
    title: '12. Disclaimers',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. The Service is for personal reflection and is not a medical device, mental health treatment, financial advice, or substitute for professional care.`,
  },
  {
    title: '13. Limitation of Liability',
    content: `TO THE FULLEST EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING FROM OR IN CONNECTION WITH THE SERVICE. OUR TOTAL AGGREGATE LIABILITY UNDER THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) USD 100. NOTHING IN THESE TERMS LIMITS LIABILITY THAT CANNOT BE LIMITED BY LAW (INCLUDING FRAUD, DEATH, OR PERSONAL INJURY CAUSED BY OUR NEGLIGENCE).`,
  },
  {
    title: '14. Indemnity',
    content: `You agree to indemnify and hold us harmless from any claims, losses, or expenses (including reasonable attorneys' fees) arising from your content, your unlawful use of the Service, or your breach of these Terms.`,
  },
  {
    title: '15. Modifications',
    content: `We may update these Terms from time to time. Material changes will be communicated through the app or by email at least 14 days before they take effect. Continued use of the Service after the effective date constitutes acceptance.`,
  },
  {
    title: '16. Assignment',
    content: `You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms in connection with a merger, acquisition, reorganization, or sale of assets — including a future transition of the Service to Soul Engineer Enterprises — and we will notify you of any such assignment.`,
  },
  {
    title: '17. Governing Law and Disputes',
    content: `These Terms are governed by the laws of the United States and the State of residence of the Seller, without regard to conflict-of-laws principles. Any dispute arising from these Terms or the Service will be resolved by binding individual arbitration, except that either party may seek injunctive relief in a court of competent jurisdiction for intellectual property infringement. You and we waive any right to a jury trial or to participate in a class action.`,
  },
  {
    title: '18. Force Majeure',
    content: `Neither party is liable for any failure or delay caused by events beyond reasonable control, including acts of God, war, terrorism, civil unrest, government action, pandemic, internet or power outages, or third-party service failures.`,
  },
  {
    title: '19. Contact',
    content: `Questions about these Terms: legal@innerwake.live. For payment and billing matters, contact Paddle at paddle.net.`,
  },
];

export const PRIVACY_INTRO =
  'This Privacy Notice explains how DeWayne Woods, operating the Inner Wake service, collects, uses, and protects your personal data when you use the app or website.';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: '1. Who We Are (Data Controller)',
    content: `Inner Wake is operated by ${SELLER}, with a principal place of business at 1041 Market St, San Diego, CA 92101, United States. We act as the data controller for the personal information we collect from you when you create an account and use the Inner Wake app. You can contact us about this notice at privacy@innerwake.live.`,
  },
  {
    title: '2. Categories of Personal Data We Collect',
    content: `We collect: (a) Account data — your email address and an encrypted password; (b) Profile data — display name, onboarding answers, companion preferences; (c) Practice data — check-ins, reflections, ritual entries, affirmations, scripts, evidence logs, and other emotional content you create inside the app; (d) Device & usage data — IP address, browser type, device identifiers, pages visited, and basic telemetry needed to operate the service securely; (e) Support data — any messages you send us. We do not collect your real name, address, phone number, or precise location unless you choose to provide it.`,
  },
  {
    title: '3. How We Use Your Data and Legal Basis',
    content: `We use your data to: (a) create and maintain your account and deliver the service (legal basis: performance of a contract); (b) personalize your practice and AI-guided responses (legal basis: performance of a contract); (c) keep the service secure, prevent fraud, and improve the product (legal basis: legitimate interests); (d) comply with tax, accounting, and other legal obligations (legal basis: legal obligation); (e) send you essential service emails (legal basis: performance of a contract). We never sell or rent your personal data, and we do not use it for third-party advertising.`,
  },
  {
    title: '4. AI Processing',
    content: `When you use AI features such as the Current Guide and Affirmation Coach, the prompts and emotional context you submit are sent to our AI service providers (currently Google and OpenAI, accessed via the Lovable AI Gateway) to generate a response. These providers process the data on our behalf as subprocessors and do not use it to train their general models. You will be told before any AI feature sends your data.`,
  },
  {
    title: '5. Who We Share Data With',
    content: `We share personal data only with the following categories of recipients: (a) Hosting and infrastructure providers (Lovable Cloud / Supabase) who store your data on our behalf; (b) AI processing providers (see Section 4); (c) Email delivery providers used for transactional and authentication emails; (d) Paddle.com Market Limited, our Merchant of Record (see Section 6); (e) Professional advisers (legal, accounting) where strictly necessary; (f) Authorities or regulators where required by law. All providers act as our processors under appropriate contractual safeguards.`,
  },
  {
    title: '6. Payments and Merchant of Record',
    content: `All purchases of paid plans inside Inner Wake are processed by our reseller and Merchant of Record, Paddle.com Market Limited ("Paddle"). When you make a purchase, Paddle independently collects and processes your payment information (such as billing name, billing address, and payment instrument details) as a separate data controller for that information. Paddle also handles invoicing, sales tax, refunds, and chargebacks. Their privacy notice is available at https://www.paddle.com/legal/privacy.`,
  },
  {
    title: '7. International Transfers',
    content: `Our hosting, AI, and payment providers may process your data in countries outside your own, including the United States and the European Union. Where data leaves the UK or EEA, we rely on appropriate safeguards such as the European Commission's Standard Contractual Clauses or equivalent mechanisms.`,
  },
  {
    title: '8. Data Retention',
    content: `We keep your account and practice data for as long as your account is active. If you delete your account from the Profile screen, all personal data tied to your account is permanently removed from our active systems within 30 days, and from routine backups within 90 days. Data we are legally required to keep (for example, billing records held by Paddle for tax purposes) is retained for the legally required period and then deleted.`,
  },
  {
    title: '9. Your Rights',
    content: `Subject to your local law, you have the right to: access the personal data we hold about you; correct inaccurate data; request deletion ("right to be forgotten"); restrict or object to certain processing; receive a portable copy of your data; and withdraw consent where processing is based on consent. You can exercise most of these rights directly inside the app (export and delete are available on the Profile screen). For anything else, email privacy@innerwake.live and we will respond within one month. If you are in the UK or EEA, you also have the right to lodge a complaint with your local data protection supervisory authority.`,
  },
  {
    title: '10. Security',
    content: `We use industry-standard technical and organisational measures to protect your data, including TLS encryption in transit, encryption at rest, row-level security policies that ensure only you can read your own data, restricted internal access, and regular security review of our infrastructure. No system is perfectly secure, but we treat your reflections as sensitive and protect them accordingly.`,
  },
  {
    title: '11. Cookies',
    content: `Inner Wake uses only essential cookies and local browser storage required for authentication, session continuity, and saving your preferences locally. We do not use advertising cookies, analytics cookies, or third-party trackers.`,
  },
  {
    title: "12. Children's Privacy",
    content: `Inner Wake is not intended for users under the age of 13 (or 16 in the EEA/UK where required). We do not knowingly collect personal information from children. If you believe a child has provided us with data, contact us at privacy@innerwake.live and we will remove it.`,
  },
  {
    title: '13. Changes to This Notice',
    content: `We may update this Privacy Notice from time to time. Material changes will be communicated through the app or by email. The "Last updated" date at the top of this page reflects the most recent revision.`,
  },
  {
    title: '14. Contact',
    content: `Questions about this notice or your personal data: privacy@innerwake.live. Future entity: this service will transition to be operated by Soul Engineer Enterprises; this notice will be updated when that transition takes effect.`,
  },
];

export const REFUND_INTRO =
  'Inner Wake is operated by DeWayne Woods. Purchases are processed by our Merchant of Record, Paddle.com Market Limited. This page explains how refunds work.';

export const REFUND_SECTIONS: LegalSection[] = [
  {
    title: '30-day money-back guarantee',
    content: `We offer a 30-day money-back guarantee on all paid Inner Wake plans (monthly, annual, and lifetime). If Inner Wake is not the right fit, you can request a full refund within 30 days of your original purchase date — no explanation required.`,
  },
  {
    title: 'How to request a refund',
    content: `All purchases are processed by our reseller and Merchant of Record, Paddle.com Market Limited. To request a refund, visit https://paddle.net and look up your order using the email address you used at checkout, then submit a refund request. You can also email us at support@innerwake.live and we will help coordinate the request with Paddle on your behalf.`,
  },
  {
    title: 'How long refunds take',
    content: `Once approved, refunds are typically processed by Paddle within 3–10 business days. The exact timing depends on your payment method and bank. You will receive an email confirmation from Paddle when the refund is issued.`,
  },
  {
    title: 'Subscriptions and renewals',
    content: `You can cancel a subscription at any time from your Profile screen or directly through Paddle's customer portal at paddle.net. Cancelling stops future renewals; you keep access until the end of the current billing period. If a renewal charge happens unexpectedly, contact us within 30 days of the renewal date and we will refund it under this policy.`,
  },
  {
    title: 'Lifetime plans',
    content: `Lifetime plans are also covered by the 30-day money-back guarantee from the date of purchase.`,
  },
  {
    title: 'Questions',
    content: `If you are unsure whether you qualify or you need help, email support@innerwake.live and we will respond within 2 business days.`,
  },
];

export type PricingTier = {
  name: string;
  price: string;
  period: string;
  note?: string;
  tagline: string;
  highlight?: boolean;
  features: string[];
};

/** Amounts here must match the live Paddle catalog. */
export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'One practice a day, no card required.',
    features: [
      'Daily emotional check-in',
      'One guided practice per day',
      'The Center breathing room',
      'Your own private history',
    ],
  },
  {
    name: 'Pro · Monthly',
    price: '$4.99',
    period: 'per month',
    note: 'Founding rate · $7.99/mo once the founding window closes',
    tagline: 'Every current, every ritual, unlimited.',
    highlight: true,
    features: [
      'Unlimited practices, all five Currents',
      'Guided sequences and reality scripting',
      'AI affirmation coach and current guide',
      'Reminders, exports, and full history',
      'Cancel anytime',
    ],
  },
  {
    name: 'Pro · Annual',
    price: '$39',
    period: 'per year',
    note: 'Founding rate · $59/yr once the founding window closes',
    tagline: 'Everything in Pro, about $3.25 a month.',
    features: ['Everything in Pro Monthly', 'Two months free vs. monthly', 'Cancel anytime'],
  },
  {
    name: 'Lifetime',
    price: '$99',
    period: 'one-time',
    note: 'Founding 100 only — retiring when the slots fill',
    tagline: 'One charge. Never billed again.',
    features: ['Everything in Pro, permanently', 'Founding Member badge', 'All future Currents included'],
  },
];

export const PRICING_MOR_NOTE =
  'Inner Wake is operated by DeWayne Woods, sole proprietor. Our order process is conducted by our online reseller Paddle.com Market Limited, the Merchant of Record for all orders. Paddle handles checkout, billing, sales tax, invoices, refunds, and buyer support. Subscriptions renew automatically at the then-current price until cancelled; cancel any time from your profile or at paddle.net.';
