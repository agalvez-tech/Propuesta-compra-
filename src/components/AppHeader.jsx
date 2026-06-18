import styles from './AppHeader.module.css';

export default function AppHeader({ step, totalSteps }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.logoMark}>RK</div>
          <div className={styles.titles}>
            <span className={styles.brand}>RK Palanca Fontestad</span>
            <span className={styles.subtitle}>Redacción de Propuesta de Compra</span>
          </div>
        </div>
        {step && (
          <div className={styles.stepBadge}>
            Paso {step} de {totalSteps}
          </div>
        )}
      </div>
    </header>
  );
}
