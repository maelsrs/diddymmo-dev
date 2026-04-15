import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const LEN = 6;
const COOLDOWNS = [30, 60, 120];

export default function VerifyEmail() {
  const { verify, resendCode } = useAuth();
  const navigate = useNavigate();
  const email = (useLocation().state as any)?.email;

  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWNS[0]);
  const [sendCount, setSendCount] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown > 0]);

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
    if (res.error) {
      setError(res.error);
      if (res.retryAfter) setCooldown(res.retryAfter);
    } else {
      setResent(true);
      setError('');
      const newCount = sendCount + 1;
      setSendCount(newCount);
      const tier = Math.min(newCount, COOLDOWNS.length - 1);
      setCooldown(res.retryAfter ?? COOLDOWNS[tier]);
    }
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
          {cooldown > 0 ? (
            <span className={styles.cooldown}>Renvoyer dans {cooldown}s</span>
          ) : (
            <button type="button" onClick={handleResend} className={styles.footerLink}>
              Renvoyer
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
