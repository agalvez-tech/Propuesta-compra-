import styles from './BottomBar.module.css';

export default function BottomBar({ step, totalSteps = 5, onBack, onNext, onGenerate, onSendPerfil, generating, sending, tab }) {
  const isLast = step === totalSteps;

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

      {tab === 'propuesta' && !isLast && (
        <button className={`${styles.btn} ${styles.primary}`} onClick={onNext} type="button">
          Continuar →
        </button>
      )}

      {tab === 'propuesta' && isLast && (
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onGenerate}
          disabled={generating}
          type="button"
        >
          {generating ? '⏳ Generando…' : '📄 Generar PDF'}
        </button>
      )}

      {tab === 'perfil' && (
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onSendPerfil}
          disabled={sending}
          type="button"
        >
          {sending ? '⏳ Enviando…' : '📤 Enviar al captador'}
        </button>
      )}
    </div>
  );
}
