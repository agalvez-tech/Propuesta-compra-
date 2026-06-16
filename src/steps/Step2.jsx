import SectionCard from '../components/SectionCard';
import Field from '../components/Field';
import styles from './StepShared.module.css';

export default function Step2({ form, onChange, errors }) {
  return (
    <div>
      <p className="step-title">Datos del comprador</p>
      <p className="step-desc">Información personal del ofertante.</p>

      <SectionCard icon="🪪" title="Identificación">
        <div className={styles.grid}>
          <Field label="Nombre y apellidos" required>
            <input
              type="text"
              value={form.compradorNombre}
              onChange={e => onChange('compradorNombre', e.target.value)}
              placeholder="Nombre completo del comprador"
              className={errors.compradorNombre ? styles.inputError : ''}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="NIF / DNI" required>
              <input
                type="text"
                value={form.compradorNif}
                onChange={e => onChange('compradorNif', e.target.value)}
                placeholder="12345678A"
                className={errors.compradorNif ? styles.inputError : ''}
              />
            </Field>
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.compradorTel}
                onChange={e => onChange('compradorTel', e.target.value)}
                placeholder="600 000 000"
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="💼" title="Agente que realizó la visita">
        <div className={styles.grid2}>
          <Field label="Nombre del agente" required>
            <input
              type="text"
              value={form.agenteVisitaNombre}
              onChange={e => onChange('agenteVisitaNombre', e.target.value)}
              placeholder="Nombre completo"
              className={errors.agenteVisitaNombre ? styles.inputError : ''}
            />
          </Field>
          <Field label="DNI del agente">
            <input
              type="text"
              value={form.agenteVisitaDni}
              onChange={e => onChange('agenteVisitaDni', e.target.value)}
              placeholder="DNI del agente"
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}
