import SectionCard from '../components/SectionCard';
import { AGENTES } from '../data';
import Field from '../components/Field';
import styles from './StepShared.module.css';
import s from './Step2.module.css';

export default function Step2({ compradores, onCompradorChange, onAddComprador, onRemoveComprador, agenteVisitaNombre, agenteVisitaDni, onAgenteChange, errors }) {
  function elegirAgente(nombre) {
    const a = AGENTES.find(x => x.name === nombre);
    onAgenteChange('agenteVisitaNombre', nombre);
    onAgenteChange('agenteVisitaSlackId', a ? a.slackId : '');
  }

  return (
    <div>
      <p className="step-title">Datos del comprador</p>
      <p className="step-desc">
        Si hay más de un comprador, pulsa <strong>+ Añadir comprador</strong> para incluirlo.
      </p>

      {compradores.map((c, i) => (
        <div key={i} className={s.compradorBlock}>
          <div className={s.compradorHeader}>
            <div className={s.compradorBadge}>
              <span className={s.compradorNum}>{i + 1}</span>
              <span className={s.compradorLabel}>
                {i === 0 ? 'Comprador principal' : `Comprador ${i + 1}`}
              </span>
            </div>
            {i > 0 && (
              <button
                type="button"
                className={s.btnRemove}
                onClick={() => onRemoveComprador(i)}
                title="Eliminar comprador"
              >
                ✕ Eliminar
              </button>
            )}
          </div>

          <div className={styles.grid}>
            <Field label="Nombre y apellidos" required>
              <input
                type="text"
                value={c.nombre}
                onChange={e => onCompradorChange(i, 'nombre', e.target.value)}
                placeholder="Nombre completo del comprador"
                className={errors[`compradorNombre_${i}`] ? styles.inputError : ''}
              />
            </Field>
            <div className={styles.grid2}>
              <Field label="NIF / DNI" required>
                <input
                  type="text"
                  value={c.nif}
                  onChange={e => onCompradorChange(i, 'nif', e.target.value)}
                  placeholder="12345678A"
                  className={errors[`compradorNif_${i}`] ? styles.inputError : ''}
                />
              </Field>
              <Field label="Teléfono">
                <input
                  type="tel"
                  value={c.tel}
                  onChange={e => onCompradorChange(i, 'tel', e.target.value)}
                  placeholder="600 000 000"
                />
              </Field>
            </div>
            <Field label="Email (le llega la propuesta para firmar)" required>
              <input
                type="email"
                value={c.email || ''}
                onChange={e => onCompradorChange(i, 'email', e.target.value)}
                placeholder="email@ejemplo.com"
                className={errors[`compradorEmail_${i}`] ? styles.inputError : ''}
              />
            </Field>
          </div>
        </div>
      ))}

      <button type="button" className={s.btnAdd} onClick={onAddComprador}>
        <span className={s.btnAddIcon}>+</span>
        Añadir comprador
      </button>

      <SectionCard icon="💼" title="Agente que realizó la visita">
        <div className={styles.grid2}>
          <Field label="Nombre del agente" required>
            <select
              value={agenteVisitaNombre}
              onChange={e => elegirAgente(e.target.value)}
              className={errors.agenteVisitaNombre ? styles.inputError : ''}
            >
              <option value="">Elige el agente…</option>
              {AGENTES.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="DNI del agente">
            <input
              type="text"
              value={agenteVisitaDni}
              onChange={e => onAgenteChange('agenteVisitaDni', e.target.value)}
              placeholder="DNI del agente"
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}
