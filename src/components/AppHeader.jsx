import styles from './AppHeader.module.css';

export default function AppHeader({ captadorName }) {
  return (
    <header className={styles.header}>
      <div className={styles.logoMark}>RK</div>
      <span className={styles.title}>Propuesta de Compra</span>
      {captadorName && (
        <span className={styles.sub}>→ {captadorName}</span>
      )}
    </header>
  );
}
