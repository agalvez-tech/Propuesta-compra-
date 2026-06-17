import styles from './AppHeader.module.css';

export default function AppHeader({ activeTab, onTabChange, onSettings }) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.logoMark}>RK</div>
        <span className={styles.brand}>RK Palanca Fontestad</span>
        <button className={styles.settingsBtn} onClick={onSettings} type="button" title="Ajustes Slack">
          ⚙️
        </button>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabCard} ${activeTab === 'propuesta' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('propuesta')}
          type="button"
        >
          <span className={styles.tabIcon}>📄</span>
          <span className={styles.tabContent}>
            <span className={styles.tabTitle}>Propuesta de precio</span>
            <span className={styles.tabSub}>Redacción · Firma · PDF</span>
          </span>
          {activeTab === 'propuesta' && <span className={styles.tabCheck}>✓</span>}
        </button>

        <div className={styles.tabDivider} />

        <button
          className={`${styles.tabCard} ${activeTab === 'perfil' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('perfil')}
          type="button"
        >
          <span className={styles.tabIcon}>👤</span>
          <span className={styles.tabContent}>
            <span className={styles.tabTitle}>Perfil del comprador</span>
            <span className={styles.tabSub}>Checklist · Docs · Slack</span>
          </span>
          {activeTab === 'perfil' && <span className={styles.tabCheck}>✓</span>}
        </button>
      </div>
    </header>
  );
}
