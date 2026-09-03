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

export default function Refund() {
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
          <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Refund Policy</h1>
          <p className="text-xs text-muted-foreground/60">Last updated: May 4, 2026</p>
        </motion.div>

        <motion.div variants={fadeUp} className="soul-glass rounded-2xl px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Inner Wake is operated by DeWayne Woods. Purchases are processed by our Merchant of Record,
            Paddle.com Market Limited. This page explains how refunds work.
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

        <motion.div variants={fadeUp} className="text-center pt-4 pb-8 space-y-3">
          <p className="text-xs text-muted-foreground/80">
            Billing mechanics are governed by{' '}
            <a
              href="https://www.paddle.com/legal/checkout-buyer-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Paddle's Buyer Terms
            </a>
            .
          </p>
          <p className="text-[10px] text-muted-foreground/30">© 2026 DeWayne Woods · Inner Wake. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
