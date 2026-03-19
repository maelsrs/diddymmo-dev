import styles from './Badge.module.css';

interface BadgeProps {
  children: string;
  variant?: 'default' | 'accent';
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
  );
}
