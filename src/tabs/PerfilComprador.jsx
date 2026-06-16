import { useState } from 'react';
import SectionCard from '../components/SectionCard';
import Field from '../components/Field';
import { CAPTADORES } from '../data';
import styles from './PerfilComprador.module.css';
import shared from '../steps/StepShared.module.css';

const INITIAL = {
  compradorNombre: '',
  compradorTel: '',
  compradorEmail: '',
  viviendaDir: '',
  viviendaRef: '',
  precioOferta: '',
  cuestionarioRelleno: null,
  honorariosTres: null,
  honorariosAutorizado: null,
  necesitaHipoteca: null,
  porcentajeHipoteca: '',
  sujetaTaskacion: null,
  vendeParaComprar: null,
  vendeExplicacion: '',
  sabePierde1000: null,
  sabeArrasNoHipoteca: null,
};

function Toggle({ value, onChange, id }) {
  return (
    <div className={styles.toggleGroup}>
      <button
        type="button"
        className={`${styles.toggleBtn} ${value === 'SI' ? styles.activeSi : ''}`}
        onClick={() => onChange(id, value === 'SI' ? null : 'SI')}
      >SÍ</button>
      <button
        type="button"
        className={`${styles.toggleBtn} ${value === 'NO' ? styles.activeNo : ''}`}
        onClick={() => onChange(id, value === 'NO' ? null : 'NO')}
      >NO</button>
    </div>
  );
}

function QuestionRow({ label, fieldKey, form, onChange, hasError, children }) {
  return (
    <div className={styles.qRow}>
      <div className={styles.qMain}>
        <span className={`${styles.qLabel} ${hasError ? styles.qLabelError : ''}`}>{label}</span>
        <Toggle value={form[fieldKey]} onChange={onChange} id={fieldKey} />
      </div>
      {hasError && <p className={styles.fieldError}>Campo obligatorio</p>}
      {children}
    </div>
  );
}

export default function PerfilComprador({ slackToken, agenteRemitente, onSuccess }) {
  const [form, setForm] = useState(INITIAL);
  const [captador, setCaptador] = useState(null);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  }

  function validate() {
    const errs = {};
    if (!form.compradorNombre.trim()) errs.compradorNombre = true;
    if (!form.viviendaDir.trim()) errs.viviendaDir = true;
    if (!captador) errs.captador = true;
    if (!form.cuestionarioRelleno) errs.cuestionarioRelleno = true;
    if (!form.honorariosTres) errs.honorariosTres = true;
    if (form.honorariosTres === 'NO' && !form.honorariosAutorizado) errs.honorariosAutorizado = true;
    if (!form.necesitaHipoteca) errs.necesitaHipoteca = true;
    if (!form.vendeParaComprar) errs.vendeParaComprar = true;
    if (!form.sabePierde1000) errs.sabePierde1000 = true;
    if (!form.sabeArrasNoHipoteca) errs.sabeArrasNoHipoteca = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function buildSlackMessage() {
    const honorariosLine = form.honorariosTres === 'NO'
      ? `NO _(autorización gerencia: ${form.honorariosAutorizado || '—'})_`
      : 'SÍ (3% + IVA)';

    let hipotecaLine = form.necesitaHipoteca === 'SI'
      ? `SÍ${form.porcentajeHipoteca ? ' — ' + form.porcentajeHipoteca + '%' : ''}`
      : 'NO';
    if (form.necesitaHipoteca === 'SI' && form.sujetaTaskacion) {
      hipotecaLine += form.sujetaTaskacion === 'SI' ? ' — Sujeta a tasación' : ' — No sujeta a tasación';
    }

    const vendeLine = form.vendeParaComprar === 'NO' ? 'NO'
      : `SÍ${form.vendeExplicacion ? '\n   > ' + form.vendeExplicacion : ''}`;

    const today = new Date().toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    return [
      `👤 *Perfil del Comprador — ${form.compradorNombre}*`,
      ``,
      `🏠 *Inmueble:* ${form.viviendaDir}${form.viviendaRef ? ' (' + form.viviendaRef + ')' : ''}`,
      form.precioOferta ? `💶 *Precio oferta:* ${parseFloat(form.precioOferta).toLocaleString('es-ES')} €` : null,
      form.compradorTel ? `📞 *Teléfono:* ${form.compradorTel}` : null,
      form.compradorEmail ? `📧 *Email:* ${form.compradorEmail}` : null,
      ``,
      `*─── Checklist ───*`,
      ``,
      `📋 *Cuestionario rellenado con el cliente:* ${form.cuestionarioRelleno}`,
      `💶 *Honorarios 3%:* ${honorariosLine}`,
      `🏦 *Necesita hipoteca:* ${hipotecaLine}`,
      `🔄 *Vende para comprar:* ${vendeLine}`,
      `⚠️ *Sabe que puede perder los 1.000 € si el vendedor acepta y se echan atrás:* ${form.sabePierde1000}`,
      `📝 *Sabe que las arras no se condicionan a hipoteca:* ${form.sabeArrasNoHipoteca}`,
      ``,
      `_Enviado por ${agenteRemitente || 'agente'} · ${today}_`,
    ].filter(l => l !== null).join('\n');
  }

  async function handleSend() {
    if (!validate()) {
      window.scrollTo(0, 0);
      return;
    }
    setSending(true);

    const msg = buildSlackMessage();

    if (!slackToken) {
      alert('⚠️ Introduce el token Slack en Ajustes (⚙️) para poder enviar.');
      setSending(false);
      return;
    }

    if (captador?.channel === 'PENDING') {
      alert('⚠️ El canal de ' + captador.name + ' está pendiente de confirmar. Contacta con Almudena.');
      setSending(false);
      return;
    }

    if (captador?.channel === 'DIRECT') {
      alert('ℹ️ Este agente no tiene canal de dinamización asignado. Envía el perfil manualmente.');
      setSending(false);
      return;
    }

    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: captador.channel, text: msg }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      onSuccess(captador);
    } catch (err) {
      alert('⚠️ No se pudo enviar por Slack.\n\nError: ' + err.message);
    }

    setSending(false);
  }

  const errCount = Object.keys(errors).length;

  return (
    <div>
      {errCount > 0 && (
        <div className={styles.errorBanner}>
          ⚠️ Hay {errCount} campo{errCount > 1 ? 's' : ''} sin rellenar. Revisa los elementos marcados.
        </div>
      )}

      <SectionCard icon="👤" title="Datos del comprador">
        <div className={shared.grid}>
          <Field label="Nombre y apellidos" required>
            <input
              type="text"
              value={form.compradorNombre}
              onChange={e => handleChange('compradorNombre', e.target.value)}
              placeholder="Nombre completo del comprador"
              className={errors.compradorNombre ? styles.inputError : ''}
            />
          </Field>
          <div className={shared.grid2}>
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.compradorTel}
                onChange={e => handleChange('compradorTel', e.target.value)}
                placeholder="600 000 000"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.compradorEmail}
                onChange={e => handleChange('compradorEmail', e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="🏠" title="Inmueble de interés">
        <div className={shared.grid}>
          <Field label="Dirección" required>
            <input
              type="text"
              value={form.viviendaDir}
              onChange={e => handleChange('viviendaDir', e.target.value)}
              placeholder="C/ Mayor, 12, 3º B, Foios"
              className={errors.viviendaDir ? styles.inputError : ''}
            />
          </Field>
          <div className={shared.grid2}>
            <Field label="Ref. comercial">
              <input
                type="text"
                value={form.viviendaRef}
                onChange={e => handleChange('viviendaRef', e.target.value)}
                placeholder="FOI-1234"
              />
            </Field>
            <Field label="Precio de la oferta">
              <div className={shared.amountWrap}>
                <input
                  type="number"
                  value={form.precioOferta}
                  onChange={e => handleChange('precioOferta', e.target.value)}
                  placeholder="180000"
                  min="0"
                />
                <span className={shared.amountSuffix}>€</span>
              </div>
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="🎯" title="Captador de la vivienda">
        <p style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 14 }}>
          Selecciona el captador para que reciba el perfil por Slack.
        </p>
        <div className={styles.captadorGrid}>
          {CAPTADORES.map((c, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.captadorCard} ${captador?.channel === c.channel ? styles.selected : ''}`}
              onClick={() => { setCaptador(c); setErrors(p => ({ ...p, captador: false })); }}
            >
              <div className={styles.avatar}>{c.initials}</div>
              <span className={styles.captadorName}>{c.name}</span>
            </button>
          ))}
        </div>
        {errors.captador && <p className={styles.fieldError} style={{ marginTop: 10 }}>Selecciona un captador para continuar.</p>}
      </SectionCard>

      <SectionCard icon="📋" title="Checklist del comprador">
        <QuestionRow
          label="¿Se ha rellenado el cuestionario junto con el cliente?"
          fieldKey="cuestionarioRelleno"
          form={form}
          onChange={handleChange}
          hasError={!!errors.cuestionarioRelleno}
        />

        <QuestionRow
          label="¿Los honorarios son del 3%?"
          fieldKey="honorariosTres"
          form={form}
          onChange={handleChange}
          hasError={!!errors.honorariosTres}
        >
          {form.honorariosTres === 'NO' && (
            <div className={styles.subQuestion}>
              <div className={styles.subRow}>
                <span className={`${styles.subLabel} ${errors.honorariosAutorizado ? styles.qLabelError : ''}`}>
                  ⚠️ ¿Está autorizado por gerencia?
                </span>
                <Toggle value={form.honorariosAutorizado} onChange={handleChange} id="honorariosAutorizado" />
              </div>
              {errors.honorariosAutorizado && <p className={styles.fieldError}>Indica si hay autorización de gerencia</p>}
            </div>
          )}
        </QuestionRow>

        <QuestionRow
          label="¿Necesita hacer hipoteca?"
          fieldKey="necesitaHipoteca"
          form={form}
          onChange={handleChange}
          hasError={!!errors.necesitaHipoteca}
        >
          {form.necesitaHipoteca === 'SI' && (
            <div className={styles.subQuestion}>
              <div className={shared.grid2} style={{ marginBottom: 12 }}>
                <Field label="¿Qué porcentaje?">
                  <div className={shared.amountWrap}>
                    <input
                      type="number"
                      value={form.porcentajeHipoteca}
                      onChange={e => handleChange('porcentajeHipoteca', e.target.value)}
                      placeholder="80"
                      min="0"
                      max="100"
                    />
                    <span className={shared.amountSuffix}>%</span>
                  </div>
                </Field>
                <div>
                  <div className={styles.subLabel}>¿Sujeta a la tasación?</div>
                  <Toggle value={form.sujetaTaskacion} onChange={handleChange} id="sujetaTaskacion" />
                </div>
              </div>
            </div>
          )}
        </QuestionRow>

        <QuestionRow
          label="¿Vende para comprar?"
          fieldKey="vendeParaComprar"
          form={form}
          onChange={handleChange}
          hasError={!!errors.vendeParaComprar}
        >
          {form.vendeParaComprar === 'SI' && (
            <div className={styles.subQuestion}>
              <Field label="Explica la operación">
                <textarea
                  value={form.vendeExplicacion}
                  onChange={e => handleChange('vendeExplicacion', e.target.value)}
                  placeholder="Describe la situación: qué vende, estado de la venta, plazos estimados..."
                  style={{ minHeight: 72 }}
                />
              </Field>
            </div>
          )}
        </QuestionRow>

        <QuestionRow
          label="¿Sabe que puede perder los 1.000 € si el vendedor acepta y luego se echan atrás?"
          fieldKey="sabePierde1000"
          form={form}
          onChange={handleChange}
          hasError={!!errors.sabePierde1000}
        />

        <QuestionRow
          label="¿Sabe que las arras no se condicionan a la concesión de la hipoteca?"
          fieldKey="sabeArrasNoHipoteca"
          form={form}
          onChange={handleChange}
          hasError={!!errors.sabeArrasNoHipoteca}
        />
      </SectionCard>

      <div className={styles.sendWrap}>
        <button
          type="button"
          className={styles.btnSend}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? '⏳ Enviando…' : '📤 Enviar perfil al captador'}
        </button>
      </div>
    </div>
  );
}
