import { useState, useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import Field from '../components/Field';
import { PREGUNTAS } from '../data';
import { fmtEuros } from '../utils/pdf';
import styles from './StepShared.module.css';
import s6 from './Step6.module.css';

export default function Step6({ form, captador, answers, onFormChange, slackToken, onTokenChange, agenteRemitente, onRemitenteChange }) {
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
      <p className="step-title">Revisar y enviar</p>
      <p className="step-desc">
        El documento se enviará al captador por Slack. Revisa los datos antes de enviar.
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

      <SectionCard icon="🔑" title="Configuración Slack">
        <div className={s6.configBanner}>
          ⚙️ El token se guarda en este dispositivo. Solo es necesario introducirlo una vez.
          Si no tienes token, la propuesta se descargará como PDF.
        </div>
        <div className={styles.grid2}>
          <Field label="Token Slack Bot">
            <input
              type="password"
              value={slackToken}
              onChange={e => onTokenChange(e.target.value)}
              placeholder="xoxb-..."
              autoComplete="off"
            />
          </Field>
          <Field label="Tu nombre (quién envía)">
            <input
              type="text"
              value={agenteRemitente}
              onChange={e => onRemitenteChange(e.target.value)}
              placeholder="Ej: Almudena Gálvez"
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}
