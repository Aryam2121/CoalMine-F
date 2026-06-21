import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HardHat, Shield, Activity, Users } from 'lucide-react';

const HERO_POINTS = [
  { icon: Shield, text: 'Real-time safety alerts & compliance tracking' },
  { icon: Activity, text: 'Shift logs, attendance, and emergency SOS' },
  { icon: Users, text: 'Role-based access for every crew member' },
];

export function AuthShell({
  title,
  subtitle,
  heroTitle = 'Safer mines,\nsmarter operations',
  heroImage,
  heroImageAlt = 'Mine safety',
  children,
  footer,
}) {
  return (
    <div className="auth-page">
      <div className="auth-page__glow auth-page__glow--amber" aria-hidden />
      <div className="auth-page__glow auth-page__glow--blue" aria-hidden />

      <div className="auth-page__grid">
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="auth-hero hidden lg:flex"
        >
          <div className="auth-hero__inner">
            <Link to="/" className="auth-brand">
              <span className="auth-brand__icon">
                <HardHat className="w-5 h-5" strokeWidth={2.2} />
              </span>
              <span className="auth-brand__text">Mine Manager</span>
            </Link>

            <h2 className="auth-hero__title">{heroTitle}</h2>
            <p className="auth-hero__lead">
              One platform for underground safety, inspections, training, and daily operations.
            </p>

            <ul className="auth-hero__list">
              {HERO_POINTS.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <span className="auth-hero__list-icon">
                    <Icon className="w-4 h-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            {heroImage && (
              <div className="auth-hero__visual">
                <img src={heroImage} alt={heroImageAlt} className="auth-hero__img" />
                <div className="auth-hero__img-shine" aria-hidden />
              </div>
            )}
          </div>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="auth-main"
        >
          <div className="auth-card">
            <div className="auth-card__mobile-brand lg:hidden">
              <Link to="/" className="auth-brand auth-brand--sm">
                <span className="auth-brand__icon">
                  <HardHat className="w-4 h-4" />
                </span>
                <span className="auth-brand__text">Mine Manager</span>
              </Link>
            </div>

            <div className="auth-card__head">
              <h1 className="auth-card__title">{title}</h1>
              {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
            </div>

            {children}

            {footer && <div className="auth-card__footer">{footer}</div>}
          </div>
        </motion.main>
      </div>
    </div>
  );
}

export function AuthDivider({ label = 'or' }) {
  return (
    <div className="auth-divider">
      <span className="auth-divider__line" />
      <span className="auth-divider__text">{label}</span>
      <span className="auth-divider__line" />
    </div>
  );
}

export function AuthAlert({ type = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`auth-alert auth-alert--${type}`} role="alert">
      {children}
    </div>
  );
}

export default AuthShell;
