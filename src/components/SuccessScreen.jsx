import styles from './SuccessScreen.module.css';

export default function SuccessScreen({ captador, isDownload, onReset }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>✅</div>
      <h2 className={styles.title}>
        {isDownload ? '¡Propuesta generada!' : '¡Propuesta enviada!'}
      </h2>
      <p className={styles.desc}>
        {isDownload
          ? 'La propuesta de compra se ha descargado como PDF en tu dispositivo.'
          : 'La propuesta de compra firmada ha sido enviada al captador por Slack.'}
      </p>

      {!isDownload && captador && (
        <div className={styles.badge}>
          <div className={styles.badgeAvatar}>{captador.initials}</div>
          <span>Enviado a {captador.name}</span>
        </div>
      )}

      <button className={styles.btnNew} onClick={onReset} type="button">
        Nueva propuesta
      </button>
    </div>
  );
}
