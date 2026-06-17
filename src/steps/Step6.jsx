import { PREGUNTAS } from '../data';
import { fmtEuros } from '../utils/pdf';
import styles from './StepShared.module.css';
import s6 from './Step6.module.css';
import SectionCard from '../components/SectionCard';

export default function Step5Final({ form, captador, answers }) {
  const rows = [
    ['Inmueble', form.viviendaDir],
    ['Ref. comercial', form.viviendaRef],
    ['Comprador', form.compradorNombre],
    ['NIF', form.compradorNif],
    ['Precio ofertado', fmtEuros(form.precioTotal)],
    ['Reserva', fmtEuros(form.importeReserva)],
    ['Arras', fmtEuros(form.importeArras)],
    ['Plazo arras', (form.plazoArras || 5) + ' días hábiles'],
    ['Vigencia oferta', (form.plazoVigencia || 7) + ' días'],
    ['Agente visita', form.agenteVisitaNombre],
  ];

  return (
    <div>
      <p className="step-title">Generar documento</p>
      <p className="step-desc">
        Revisa el resumen y pulsa <strong>Generar PDF</strong> para descargar la propuesta completa con todas las cláusulas legales.
      </p>

      <SectionCard icon="📋" title="Resumen de la propuesta">
        {rows.map(([k, v]) => (
          <div key={k} className={styles.resumenRow}>
            <span className={styles.resumenKey}>{k}</span>
            <span className={styles.resumenVal}>{v || '—'}</span>
          </div>
        ))}
        <div className={styles.qSubtitle}>Cuestionario de control</div>
        {PREGUNTAS.map((q, i) => {
          const ans = answers[i];
          const color = ans === 'SI' ? '#16a34a' : ans === 'NO' ? '#dc2626' : '#9ca3af';
          return (
            <div key={i} className={s6.qRow}>
              <span style={{ color, fontWeight: 700, minWidth: 24 }}>{ans || '—'}</span>
              <span className={s6.qText}>{i + 1}. {q.substring(0, 80)}{q.length > 80 ? '…' : ''}</span>
            </div>
          );
        })}
      </SectionCard>

      <div className={s6.pdfNote}>
        📄 El PDF incluirá el texto legal completo del documento original, las tablas de aceptación del vendedor, el cuestionario y el reconocimiento de honorarios.
      </div>
    </div>
  );
}
