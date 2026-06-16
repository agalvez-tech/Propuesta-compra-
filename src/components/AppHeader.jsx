import styles from './AppHeader.module.css';

export default function AppHeader({ activeTab, onTabChange, onSettings }) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.logoMark}>RK</div>
        <span className={styles.title}>RK Palanca Fontestad</span>
        <button className={styles.settingsBtn} onClick={onSettings} type="button" title="Ajustes Slack">
          ⚙️
        </button>
      </div>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'propuesta' ? styles.active : ''}`}
          onClick={() => onTabChange('propuesta')}
          type="button"
        >
          📄 Redacción de Propuesta de Precio
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'perfil' ? styles.active : ''}`}
          onClick={() => onTabChange('perfil')}
          type="button"
        >
          👤 Perfil del Comprador
        </button>
      </div>
    </header>
  );
}
