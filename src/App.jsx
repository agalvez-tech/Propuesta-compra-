import { useRef, useState } from 'react';
import AppHeader from './components/AppHeader';
import Stepper from './components/Stepper';
import BottomBar from './components/BottomBar';
import SuccessScreen from './components/SuccessScreen';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5Final from './steps/Step6';
import StepFirmar from './steps/StepFirmar';
import { PREGUNTAS, FIRMA_URL, FIRMA_KEY } from './data';
import { generateDocx, downloadDocx } from './utils/docx';
import { docxAHtmlEditable, htmlParaFirmar, firmasPresentes } from './utils/editor';
import styles from './App.module.css';

const EMPTY_COMPRADOR = { nombre: '', nif: '', tel: '', email: '' };

const INITIAL_FORM = {
  viviendaDir: '',
  viviendaRef: '',
  lugarFirma: 'Foios',
  agenteVisitaNombre: '',
  agenteVisitaDni: '',
  agenteVisitaSlackId: '',
  precioTotal: '',
  importeReserva: '',
  importeArras: '',
  plazoArras: '5',
  plazoVigencia: '7',
  fechaEscritura: '',
  observaciones: '',
};

const TOTAL_STEPS = 6;   // 5 = generar, 6 = revisar/editar y enviar a firmar

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [compradores, setCompradores] = useState([{ ...EMPTY_COMPRADOR }]);
  const [captador, setCaptador] = useState(null);
  const [answers, setAnswers] = useState(Array(PREGUNTAS.length).fill(null));
  const [errors, setErrors] = useState({});
  const [qError, setQError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [docx, setDocx] = useState(null);           // Word generado (paso 5)
  const [htmlDoc, setHtmlDoc] = useState('');       // ese Word en HTML editable (paso 6)
  const [editado, setEditado] = useState(false);
  const [firmando, setFirmando] = useState(false);
  const [enviadoA, setEnviadoA] = useState([]);
  const editorRef = useRef(null);

  function handleFormChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  }

  function handleCompradorChange(i, field, value) {
    setCompradores(prev => {
      const next = prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
      return next;
    });
    const errKey = `comprador${field.charAt(0).toUpperCase() + field.slice(1)}_${i}`;
    if (errors[errKey]) setErrors(prev => ({ ...prev, [errKey]: false }));
  }

  function addComprador() {
    setCompradores(prev => [...prev, { ...EMPTY_COMPRADOR }]);
  }

  function removeComprador(i) {
    setCompradores(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleAnswer(i, ans) {
    setAnswers(prev => { const n = [...prev]; n[i] = ans; return n; });
    setQError(false);
  }

  function validate() {
    if (step === 1) {
      const errs = {};
      if (!form.viviendaDir.trim()) errs.viviendaDir = true;
      if (!form.viviendaRef.trim()) errs.viviendaRef = true;
      if (!captador) errs.captador = true;
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (step === 2) {
      const errs = {};
      compradores.forEach((c, i) => {
        if (!c.nombre.trim()) errs[`compradorNombre_${i}`] = true;
        if (!c.nif.trim()) errs[`compradorNif_${i}`] = true;
        if (!/^\S+@\S+\.\S+$/.test((c.email || '').trim())) errs[`compradorEmail_${i}`] = true;
      });
      if (!form.agenteVisitaNombre.trim()) errs.agenteVisitaNombre = true;
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (step === 3) {
      const errs = {};
      if (!form.precioTotal) errs.precioTotal = true;
      if (!form.importeReserva) errs.importeReserva = true;
      if (!form.importeArras) errs.importeArras = true;
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (step === 4) {
      const ok = answers.every(a => a !== null);
      setQError(!ok);
      return ok;
    }
    return true;
  }

  function nextStep() {
    if (!validate()) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }

  function prevStep() {
    if (step === 6 && editado && !window.confirm(
      'Si vuelves atrás para cambiar campos, el documento se generará de nuevo y se perderán los cambios que hayas escrito a mano. ¿Seguir?'
    )) return;
    if (step > 1) { setStep(s => s - 1); window.scrollTo(0, 0); }
  }

  function nombreWord() {
    const today = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    return `propuesta-${form.viviendaRef || 'compra'}-${today}.docx`;
  }

  // Paso 5: genera el Word de siempre y lo abre en el paso 6 para revisarlo/editarlo.
  async function handleGenerate() {
    setGenerating(true);
    try {
      const blob = await generateDocx(
        { ...form, compradores },
        { questions: PREGUNTAS, answers }
      );
      setDocx(blob);
      setHtmlDoc(await docxAHtmlEditable(blob));
      setEditado(false);
      setStep(6);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      alert('Error al generar el documento: ' + e.message);
    }
    setGenerating(false);
  }

  // Paso 6: manda el documento (con lo que hayan editado) a firmar a los compradores.
  async function handleFirmar() {
    const html = editorRef.current?.innerHTML || htmlDoc;
    const presentes = firmasPresentes(html);
    const faltan = compradores.map((c, i) => ({ c, q: `C${i + 1}` })).filter(x => !presentes.includes(x.q));
    if (faltan.length && !window.confirm(
      `Has borrado la etiqueta de firma de ${faltan.map(x => x.c.nombre).join(', ')}. ` +
      'Su firma irá al pie de cada hoja. ¿Enviar igualmente?'
    )) return;
    const nombres = compradores.map(c => `${c.nombre} (${c.email})`).join('\n');
    if (!window.confirm(`Se va a enviar la propuesta a firmar a:\n${nombres}\n\n¿Enviar?`)) return;

    setFirmando(true);
    try {
      const r = await fetch(FIRMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Propuesta-Key': FIRMA_KEY },
        body: JSON.stringify({
          html: htmlParaFirmar(html),
          ref: form.viviendaRef.trim(),
          direccion: form.viviendaDir.trim(),
          compradores: compradores.map(c => ({ nombre: c.nombre.trim(), email: (c.email || '').trim(), tel: c.tel })),
          agente: { nombre: form.agenteVisitaNombre, slack_id: form.agenteVisitaSlackId },
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setEnviadoA(j.firmantes || compradores.map(c => c.nombre));
      setDone(true);
    } catch (e) {
      console.error(e);
      alert('⚠️ No se ha podido enviar a firmar: ' + e.message);
    }
    setFirmando(false);
  }

  function reset() {
    setStep(1);
    setForm(INITIAL_FORM);
    setCompradores([{ ...EMPTY_COMPRADOR }]);
    setCaptador(null);
    setAnswers(Array(PREGUNTAS.length).fill(null));
    setErrors({});
    setQError(false);
    setDone(false);
    setDocx(null);
    setHtmlDoc('');
    setEditado(false);
    setEnviadoA([]);
    window.scrollTo(0, 0);
  }

  if (done) {
    return (
      <>
        <AppHeader />
        <SuccessScreen
          isDownload={true}
          onReset={reset}
          customTitle="¡Enviada a firmar!"
          customDesc={`La propuesta de compra se ha enviado a firmar a ${enviadoA.join(' y ')} (email y SMS). Cuando firmen, llegará al canal de la vivienda y a ${form.agenteVisitaNombre || 'el agente'} por Slack.`}
        />
      </>
    );
  }

  return (
    <>
      <AppHeader step={step} totalSteps={TOTAL_STEPS} />
      <Stepper current={step} />
      <main className={styles.main}>
        {step === 1 && <Step1 form={form} onChange={handleFormChange} captador={captador} onCaptador={setCaptador} errors={errors} />}
        {step === 2 && (
          <Step2
            compradores={compradores}
            onCompradorChange={handleCompradorChange}
            onAddComprador={addComprador}
            onRemoveComprador={removeComprador}
            agenteVisitaNombre={form.agenteVisitaNombre}
            agenteVisitaDni={form.agenteVisitaDni}
            onAgenteChange={handleFormChange}
            errors={errors}
          />
        )}
        {step === 3 && <Step3 form={form} onChange={handleFormChange} errors={errors} />}
        {step === 4 && <Step4 answers={answers} onAnswer={handleAnswer} error={qError} />}
        {step === 5 && <Step5Final form={form} compradores={compradores} captador={captador} answers={answers} />}
        {step === 6 && (
          <StepFirmar
            html={htmlDoc}
            editorRef={editorRef}
            onCambio={() => setEditado(true)}
            onDescargarWord={() => docx && downloadDocx(docx, nombreWord())}
          />
        )}
      </main>
      <BottomBar
        tab="propuesta"
        step={step}
        totalSteps={TOTAL_STEPS}
        onBack={prevStep}
        onNext={nextStep}
        onGenerate={handleGenerate}
        generating={generating}
        onFirmar={handleFirmar}
        firmando={firmando}
      />
    </>
  );
}
