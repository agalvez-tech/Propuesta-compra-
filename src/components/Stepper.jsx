import { STEPS_PROPUESTA } from '../data';
import styles from './Stepper.module.css';

export default function Stepper({ current }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.stepper}>
        {STEPS_PROPUESTA.map((step, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <div
              key={n}
              className={`${styles.item} ${done ? styles.done : ''} ${active ? styles.active : ''}`}
            >
              <div className={styles.dot}>{done ? '✓' : n}</div>
              <span className={styles.label}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
