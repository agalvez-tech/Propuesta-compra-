import styles from './BottomBar.module.css';

export default function BottomBar({ step, totalSteps = 5, onBack, onNext, onGenerate, onSendPerfil, generating, sending, tab, onFirmar, firmando }) {
  // Propuesta: el penúltimo paso genera el documento y el último lo manda a firmar.
  const isLast = step === totalSteps;
  const isGenerar = onFirmar ? step === totalSteps - 1 : isLast;

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

      {tab === 'propuesta' && !isLast && !isGenerar && (
        <button className={`${styles.btn} ${styles.primary}`} onClick={onNext} type="button">
          Continuar →
        </button>
      )}

      {tab === 'propuesta' && isGenerar && (
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onGenerate}
          disabled={generating}
          type="button"
        >
          {generating ? '⏳ Generando…' : '📄 Generar documento'}
        </button>
      )}

      {tab === 'propuesta' && onFirmar && isLast && (
        <button
          className={`${styles.btn} ${styles.primary}`}
          onClick={onFirmar}
          disabled={firmando}
          type="button"
        >
          {firmando ? '⏳ Enviando…' : '✍️ Enviar para firmar'}
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
