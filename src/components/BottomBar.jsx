import styles from './BottomBar.module.css';

export default function BottomBar({ step, onBack, onNext, onSend, sending }) {
  return (
    <div className={styles.bar}>
      <button
        className={`${styles.btn} ${styles.secondary}`}
        onClick={onBack}
        style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
        type="button"
      >
        ← Atrás
      </button>

      {step < 6 && (
        <button className={`${styles.btn} ${styles.primary}`} onClick={onNext} type="button">
          Continuar →
        </button>
      )}

      {step === 6 && (
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onSend}
          disabled={sending}
          type="button"
        >
          {sending ? '⏳ Enviando…' : '📤 Enviar al captador'}
        </button>
      )}
    </div>
  );
}
