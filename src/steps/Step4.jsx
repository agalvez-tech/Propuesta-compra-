import SectionCard from '../components/SectionCard';
import { PREGUNTAS } from '../data';
import styles from './Step4.module.css';

export default function Step4({ answers, onAnswer, error }) {
  return (
    <div>
      <p className="step-title">Cuestionario de control</p>
      <p className="step-desc">
        Confirma que el comprador ha sido informado de todos los puntos. Responde Sí o No a cada pregunta.
      </p>

      <SectionCard icon="📋" title="Control — Información recibida">
        {PREGUNTAS.map((q, i) => (
          <div key={i} className={styles.qItem}>
            <span className={styles.qText}>
              <span className={styles.qNum}>{i + 1}.</span>
              {q}
            </span>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${answers[i] === 'SI' ? styles.activeSi : ''}`}
                onClick={() => onAnswer(i, 'SI')}
              >
                SÍ
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${answers[i] === 'NO' ? styles.activeNo : ''}`}
                onClick={() => onAnswer(i, 'NO')}
              >
                NO
              </button>
            </div>
          </div>
        ))}
      </SectionCard>

      {error && (
        <p className={styles.error}>Debes responder todas las preguntas para continuar.</p>
      )}
    </div>
  );
}
