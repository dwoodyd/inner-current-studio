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
    title: '1. Acceptance of Terms',
    content: `By creating an account or using SoulCurrent, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.`,
  },
  {
    title: '2. Description of Service',
    content: `SoulCurrent is an emotional wellness practice app that provides tools for self-reflection, emotional check-ins, guided reframes, and AI-assisted emotional support. SoulCurrent is not a substitute for professional therapy, counseling, or medical treatment.`,
  },
  {
    title: '3. User Accounts',
    content: `You must provide a valid email address and create a password to use SoulCurrent. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years of age to use this service.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to: (a) use the service for any unlawful purpose; (b) attempt to gain unauthorized access to other users' data; (c) interfere with or disrupt the service; (d) submit false or misleading information; or (e) use automated systems to access the service without permission.`,
  },
  {
    title: '5. Intellectual Property',
    content: `All content within SoulCurrent — including text, reframes, ritual templates, UI design, and branding — is original and owned by SoulCurrent. You may not copy, reproduce, or distribute any content without written permission. Your personal data (check-ins, reflections, entries) remains yours.`,
  },
  {
    title: '6. AI-Generated Content',
    content: `The Current Guide feature uses AI to generate personalized emotional support. AI responses are not professional advice. They are designed to offer perspective and gentle reframing. SoulCurrent makes no guarantees about the accuracy or suitability of AI-generated content.`,
  },
  {
    title: '7. Account Deletion',
    content: `You may delete your account at any time from the Profile screen. Upon deletion, all personal data including check-ins, reflections, rituals, and emotional records will be permanently removed within 30 days.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `SoulCurrent is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service in the preceding 12 months.`,
  },
  {
    title: '9. Modifications',
    content: `We reserve the right to modify these terms at any time. Material changes will be communicated through the app. Continued use after changes constitutes acceptance.`,
  },
  {
    title: '10. Governing Law',
    content: `These terms are governed by applicable law. Any disputes arising from these terms or the use of SoulCurrent will be resolved through binding arbitration.`,
  },
  {
    title: '11. Contact',
    content: `For questions about these terms, contact us at legal@soulcurrent.app.`,
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
          <p className="text-xs text-muted-foreground/60">Last updated: April 7, 2026</p>
        </motion.div>

        <motion.div variants={fadeUp} className="soul-glass rounded-2xl px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to SoulCurrent. These terms govern your use of our app and services.
            Please read them carefully before creating an account.
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
