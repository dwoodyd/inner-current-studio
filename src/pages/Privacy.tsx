import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const SELLER = 'DeWayne Woods, sole proprietor, operating the Inner Wake service (the "Seller", "we", "our", or "us")';

const sections = [
  {
    title: '1. Who We Are (Data Controller)',
    content: `Inner Wake is operated by ${SELLER}. We act as the data controller for the personal information we collect from you when you create an account and use the Inner Wake app. You can contact us about this notice at privacy@innerwake.live.`,
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
    title: '12. Children\'s Privacy',
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

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[100dvh] pb-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.04), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-lg px-5 pt-6 space-y-6"
      >
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <motion.div variants={fadeUp} className="text-center space-y-3 pt-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={18} className="text-primary/60" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Privacy Notice</h1>
          <p className="text-xs text-muted-foreground/60">Last updated: May 4, 2026</p>
        </motion.div>

        <motion.div variants={fadeUp} className="soul-glass rounded-2xl px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This Privacy Notice explains how DeWayne Woods, operating the Inner Wake service, collects, uses,
            and protects your personal data when you use the app or website.
          </p>
        </motion.div>

        <div className="space-y-3">
          {sections.map(({ title, content }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="soul-glass rounded-2xl px-5 py-4 space-y-2"
            >
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="text-center pt-4 pb-8">
          <p className="text-[10px] text-muted-foreground/30">© 2026 DeWayne Woods · Inner Wake. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
