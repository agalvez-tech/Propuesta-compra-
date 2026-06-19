import SectionCard from '../components/SectionCard';
import Field from '../components/Field';
import styles from './StepShared.module.css';
import s from './Step2.module.css';

export default function Step2({ compradores, onCompradorChange, onAddComprador, onRemoveComprador, agenteVisitaNombre, agenteVisitaDni, onAgenteChange, errors }) {
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
            <input
              type="text"
              value={agenteVisitaNombre}
              onChange={e => onAgenteChange('agenteVisitaNombre', e.target.value)}
              placeholder="Nombre completo"
              className={errors.agenteVisitaNombre ? styles.inputError : ''}
            />
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
