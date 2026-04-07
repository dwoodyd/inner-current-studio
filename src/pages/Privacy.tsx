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
    title: '1. Information We Collect',
    content: `When you create an account, we collect your email address and an encrypted password. As you use SoulCurrent, we store your check-ins, reflections, rituals, and emotional data — all tied to your account. We do not collect your real name, phone number, or location unless you choose to provide them.`,
  },
  {
    title: '2. How We Use Your Data',
    content: `Your emotional data powers your personal experience — insights, pattern recognition, and AI-guided reframes. We never sell, rent, or share your personal data with third parties for marketing. Anonymized, aggregated statistics may be used to improve the app.`,
  },
  {
    title: '3. AI & Third-Party Processing',
    content: `When you use the Current Guide feature, your emotional context is sent to our AI service to generate personalized responses. You will be asked for explicit consent before any data is sent. We use industry-standard encryption for data in transit and at rest.`,
  },
  {
    title: '4. Data Storage & Security',
    content: `Your data is stored securely using encrypted cloud infrastructure. Access is restricted through row-level security policies, ensuring only you can access your own data. We use HTTPS for all communications and follow industry best practices for data protection.`,
  },
  {
    title: '5. Your Rights',
    content: `You can export your data at any time from the Profile screen. You can delete your account and all associated data permanently through the app. Upon deletion, all personal data is removed from our servers within 30 days.`,
  },
  {
    title: '6. Cookies & Analytics',
    content: `SoulCurrent uses minimal, functional cookies required for authentication. We do not use advertising trackers or third-party analytics cookies. Session data is stored locally in your browser.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `SoulCurrent is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with data, please contact us for removal.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this policy from time to time. Material changes will be communicated through the app. Continued use after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact',
    content: `For questions about this privacy policy or your data, reach out to us at privacy@soulcurrent.app.`,
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
          <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground/60">Last updated: April 7, 2026</p>
        </motion.div>

        <motion.div variants={fadeUp} className="soul-glass rounded-2xl px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            SoulCurrent ("we," "our," or "us") is committed to protecting your privacy.
            This policy explains how we collect, use, and safeguard your information when you use our app.
          </p>
        </motion.div>

        <div className="space-y-3">
          {sections.map(({ title, content }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="soul-glass rounded-2xl px-5 py-4 space-y-2"
            >
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="text-center pt-4 pb-8">
          <p className="text-[10px] text-muted-foreground/30">© 2026 SoulCurrent. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
