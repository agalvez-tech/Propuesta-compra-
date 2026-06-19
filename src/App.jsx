import { useState } from 'react';
import AppHeader from './components/AppHeader';
import Stepper from './components/Stepper';
import BottomBar from './components/BottomBar';
import SuccessScreen from './components/SuccessScreen';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5Final from './steps/Step6';
import { PREGUNTAS } from './data';
import { generateDocx, downloadDocx } from './utils/docx';
import styles from './App.module.css';

const EMPTY_COMPRADOR = { nombre: '', nif: '', tel: '' };

const INITIAL_FORM = {
  viviendaDir: '',
  viviendaRef: '',
  lugarFirma: 'Foios',
  agenteVisitaNombre: '',
  agenteVisitaDni: '',
  precioTotal: '',
  importeReserva: '',
  importeArras: '',
  plazoArras: '5',
  plazoVigencia: '7',
  fechaEscritura: '',
  observaciones: '',
};

const TOTAL_STEPS = 5;

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
    if (step > 1) { setStep(s => s - 1); window.scrollTo(0, 0); }
  }

  async function handleGenerate() {
    setGenerating(true);
    const today = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    const filename = `propuesta-${form.viviendaRef || 'compra'}-${today}.docx`;
    try {
      const blob = await generateDocx(
        { ...form, compradores },
        { questions: PREGUNTAS, answers }
      );
      downloadDocx(blob, filename);
      setDone(true);
    } catch (e) {
      console.error(e);
      alert('Error al generar el documento: ' + e.message);
    }
    setGenerating(false);
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
    window.scrollTo(0, 0);
  }

  if (done) {
    return (
      <>
        <AppHeader />
        <SuccessScreen
          isDownload={true}
          onReset={reset}
          customTitle="¡Documento generado!"
          customDesc="La propuesta de compra se ha descargado como Word (.docx) con todas las cláusulas legales."
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
      </main>
      <BottomBar
        tab="propuesta"
        step={step}
        totalSteps={TOTAL_STEPS}
        onBack={prevStep}
        onNext={nextStep}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </>
  );
}
