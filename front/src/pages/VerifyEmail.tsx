import { useState, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const LEN = 6;

export default function VerifyEmail() {
  const { verify, resendCode } = useAuth();
  const navigate = useNavigate();
  const email = (useLocation().state as any)?.email;

  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  if (!email) return <Navigate to="/register" replace />;

  const onChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!text) return;
    setDigits(text.padEnd(LEN, '').split('').slice(0, LEN));
    refs.current[Math.min(text.length, LEN - 1)]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== LEN) { setError('Entrez le code complet'); return; }

    setError('');
    setLoading(true);
    const res = await verify(email, code);
    if (res.error) { setError(res.error); setLoading(false); }
    else navigate('/');
  };

  const handleResend = async () => {
    setResent(false);
    const res = await resendCode(email);
    if (res.error) setError(res.error);
    else { setResent(true); setError(''); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Vérification</h1>
          <p className={styles.subtitle}>
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          {resent && <div className={styles.success}>Code renvoyé !</div>}

          <div className={styles.codeInputs}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => onChange(i, e.target.value)}
                onKeyDown={e => onKeyDown(i, e)}
                onPaste={i === 0 ? onPaste : undefined}
                className={styles.codeInput}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>

        <p className={styles.footer}>
          Pas reçu le code ?{' '}
          <button type="button" onClick={handleResend} className={styles.footerLink}>
            Renvoyer
          </button>
        </p>
      </div>
    </div>
  );
}
