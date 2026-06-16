import SectionCard from '../components/SectionCard';
import Field from '../components/Field';
import styles from './StepShared.module.css';

export default function Step3({ form, onChange, errors }) {
  return (
    <div>
      <p className="step-title">Condiciones de la oferta</p>
      <p className="step-desc">Precio y forma de pago propuesta por el comprador.</p>

      <SectionCard icon="💶" title="Precio ofertado">
        <div className={styles.grid2}>
          <Field label="Precio total" required>
            <div className={styles.amountWrap}>
              <input
                type="number"
                value={form.precioTotal}
                onChange={e => onChange('precioTotal', e.target.value)}
                placeholder="180000"
                min="0"
                className={errors.precioTotal ? styles.inputError : ''}
              />
              <span className={styles.amountSuffix}>€</span>
            </div>
          </Field>
          <Field label="Importe reserva" required>
            <div className={styles.amountWrap}>
              <input
                type="number"
                value={form.importeReserva}
                onChange={e => onChange('importeReserva', e.target.value)}
                placeholder="3000"
                min="0"
                className={errors.importeReserva ? styles.inputError : ''}
              />
              <span className={styles.amountSuffix}>€</span>
            </div>
          </Field>
          <Field label="Importe arras" required>
            <div className={styles.amountWrap}>
              <input
                type="number"
                value={form.importeArras}
                onChange={e => onChange('importeArras', e.target.value)}
                placeholder="9000"
                min="0"
                className={errors.importeArras ? styles.inputError : ''}
              />
              <span className={styles.amountSuffix}>€</span>
            </div>
          </Field>
          <Field label="Plazo firma arras (días hábiles)" hint="Por defecto: 5 días hábiles">
            <input
              type="number"
              value={form.plazoArras}
              onChange={e => onChange('plazoArras', e.target.value)}
              min="1"
              max="30"
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon="📅" title="Escritura pública">
        <div className={styles.grid2}>
          <Field label="Fecha prevista de escritura">
            <input
              type="text"
              value={form.fechaEscritura}
              onChange={e => onChange('fechaEscritura', e.target.value)}
              placeholder="Ej: 15 de septiembre de 2026"
            />
          </Field>
          <Field label="Vigencia de la oferta (días)">
            <input
              type="number"
              value={form.plazoVigencia}
              onChange={e => onChange('plazoVigencia', e.target.value)}
              min="1"
              max="30"
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon="📝" title="Condicionantes adicionales">
        <Field label="Observaciones / condiciones especiales">
          <textarea
            value={form.observaciones}
            onChange={e => onChange('observaciones', e.target.value)}
            placeholder="Condicionante a financiación, estado inmueble, mobiliario incluido..."
          />
        </Field>
      </SectionCard>
    </div>
  );
}
