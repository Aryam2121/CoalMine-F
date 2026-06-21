import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => (
  <motion.div
    whileHover={hover ? { y: -2 } : undefined}
    className={`card-surface ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export default Card;
