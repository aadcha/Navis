import { motion } from 'framer-motion';

export default function Logo({ size = 48, animated = true }) {
  const LogoContent = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="navisLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4aa" />
          <stop offset="100%" stopColor="#0099ff" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="28" stroke="url(#navisLogoGrad)" strokeWidth="2" fill="none" opacity="0.3" />
      <circle cx="32" cy="32" r="20" stroke="url(#navisLogoGrad)" strokeWidth="1" fill="none" opacity="0.2" />
      <circle cx="32" cy="32" r="12" stroke="url(#navisLogoGrad)" strokeWidth="1" fill="none" opacity="0.15" />
      <path
        d="M32 8 L32 32 L48 32"
        stroke="url(#navisLogoGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#logoGlow)"
      />
      <circle cx="32" cy="32" r="4" fill="url(#navisLogoGrad)" />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <LogoContent />
      </motion.div>
    );
  }
  return <LogoContent />;
}
