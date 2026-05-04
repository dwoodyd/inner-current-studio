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

const sections = [
  {
    title: '1. Who You Are Contracting With',
    content: `Inner Wake (the "Service") is operated by DeWayne Woods, sole proprietor, trading as Inner Wake (the "Seller", "we", "our", or "us"). By creating an account, accessing the Service, or making a purchase, you ("you" or "User") enter into a binding agreement with the Seller on these Terms of Service (the "Terms"). If you do not agree, do not use the Service.`,
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

export default function Terms() {
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
          <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground/60">Last updated: May 4, 2026</p>
        </motion.div>

        <motion.div variants={fadeUp} className="soul-glass rounded-2xl px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to Inner Wake. These Terms govern your use of the Service. Please read them carefully
            before creating an account or making a purchase.
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
