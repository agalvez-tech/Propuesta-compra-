import SectionCard from '../components/SectionCard';
import Field from '../components/Field';
import { CAPTADORES } from '../data';
import styles from './Step1.module.css';

export default function Step1({ form, onChange, captador, onCaptador, errors }) {
  return (
    <div>
      <p className="step-title">Datos del inmueble</p>
      <p className="step-desc">¿Para qué propiedad se realiza la propuesta de compra?</p>

      <SectionCard icon="🏠" title="Datos de la vivienda">
        <div className={styles.grid}>
          <Field label="Dirección completa" required>
            <input
              type="text"
              value={form.viviendaDir}
              onChange={e => onChange('viviendaDir', e.target.value)}
              placeholder="Ej: C/ Mayor, 12, 3º B, Foios"
              className={errors.viviendaDir ? styles.inputError : ''}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="Ref. comercial" required>
              <input
                type="text"
                value={form.viviendaRef}
                onChange={e => onChange('viviendaRef', e.target.value)}
                placeholder="Ej: FOI-1234"
                className={errors.viviendaRef ? styles.inputError : ''}
              />
            </Field>
            <Field label="Lugar de firma">
              <input
                type="text"
                value={form.lugarFirma}
                onChange={e => onChange('lugarFirma', e.target.value)}
                placeholder="Foios"
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="👤" title="Captador de la vivienda">
        <p className={styles.captadorHint}>
          Selecciona el agente captador para que reciba la oferta firmada por Slack.
        </p>
        <div className={styles.captadorGrid}>
          {CAPTADORES.map((c, i) => (
            <button
              key={i}
              className={`${styles.captadorCard} ${captador?.channel === c.channel ? styles.selected : ''}`}
              onClick={() => onCaptador(c)}
              type="button"
            >
              <div className={styles.avatar}>{c.initials}</div>
              <span className={styles.captadorName}>{c.name}</span>
            </button>
          ))}
        </div>
        {errors.captador && (
          <p className={styles.error}>Selecciona un captador para continuar.</p>
        )}
      </SectionCard>
    </div>
  );
}
