import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export default function Card({ children, className = '', dark = false }: CardProps) {
  return (
    <div className={`${styles.card} ${dark ? styles.dark : ''} ${className}`}>
      {children}
    </div>
  );
}
