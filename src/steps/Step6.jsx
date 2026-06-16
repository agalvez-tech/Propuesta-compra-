import { PREGUNTAS } from '../data';
import { fmtEuros } from '../utils/pdf';
import styles from './StepShared.module.css';
import s6 from './Step6.module.css';
import SectionCard from '../components/SectionCard';

export default function Step6({ form, captador, answers }) {
  const rows = [
    ['Inmueble', form.viviendaDir],
    ['Ref. comercial', form.viviendaRef],
    ['Captador', captador?.name],
    ['Comprador', form.compradorNombre],
    ['NIF', form.compradorNif],
    ['Precio ofertado', fmtEuros(form.precioTotal)],
    ['Reserva', fmtEuros(form.importeReserva)],
    ['Arras', fmtEuros(form.importeArras)],
    ['Plazo arras', (form.plazoArras || 5) + ' días hábiles'],
    ['Vigencia oferta', (form.plazoVigencia || 7) + ' días'],
  ];

  return (
    <div>
      <p className="step-title">Generar documento</p>
      <p className="step-desc">
        Revisa el resumen y pulsa <strong>Generar PDF</strong> para descargar la propuesta con todas las cláusulas legales.
      </p>

      <SectionCard icon="📋" title="Resumen de la propuesta">
        {rows.map(([k, v]) => (
          <div key={k} className={styles.resumenRow}>
            <span className={styles.resumenKey}>{k}</span>
            <span className={styles.resumenVal}>{v || '—'}</span>
          </div>
        ))}
        <div className={styles.qSubtitle}>Cuestionario</div>
        {PREGUNTAS.map((q, i) => {
          const ans = answers[i];
          const color = ans === 'SI' ? '#16a34a' : ans === 'NO' ? '#dc2626' : '#9ca3af';
          return (
            <div key={i} className={s6.qRow}>
              <span style={{ color, fontWeight: 700, minWidth: 24 }}>{ans || '—'}</span>
              <span className={s6.qText}>{i + 1}. {q.substring(0, 75)}{q.length > 75 ? '…' : ''}</span>
            </div>
          );
        })}
      </SectionCard>
    </div>
  );
}
