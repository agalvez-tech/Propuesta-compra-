import { useState } from 'react';
import AppHeader from './components/AppHeader';
import Stepper from './components/Stepper';
import BottomBar from './components/BottomBar';
import SuccessScreen from './components/SuccessScreen';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';
import { PREGUNTAS } from './data';
import { generatePDF, sendToSlack, downloadPDF } from './utils/pdf';
import styles from './App.module.css';

const INITIAL_FORM = {
  viviendaDir: '',
  viviendaRef: '',
  lugarFirma: 'Foios',
  compradorNombre: '',
  compradorNif: '',
  compradorTel: '',
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

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [captador, setCaptador] = useState(null);
  const [answers, setAnswers] = useState(Array(PREGUNTAS.length).fill(null));
  const [firmaData, setFirmaData] = useState(null);
  const [slackToken, setSlackToken] = useState(() => localStorage.getItem('rk_slack_token') || '');
  const [agenteRemitente, setAgenteRemitente] = useState(() => localStorage.getItem('rk_agente_remitente') || '');
  const [errors, setErrors] = useState({});
  const [qError, setQError] = useState(false);
  const [firmaError, setFirmaError] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [wasDownload, setWasDownload] = useState(false);

  function handleFormChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  }

  function handleAnswer(i, ans) {
    setAnswers(prev => {
      const next = [...prev];
      next[i] = ans;
      return next;
    });
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
      if (!form.compradorNombre.trim()) errs.compradorNombre = true;
      if (!form.compradorNif.trim()) errs.compradorNif = true;
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
      const allAnswered = answers.every(a => a !== null);
      setQError(!allAnswered);
      return allAnswered;
    }
    if (step === 5) {
      setFirmaError(!firmaData);
      return !!firmaData;
    }
    return true;
  }

  function nextStep() {
    if (!validate()) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }

  function prevStep() {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  }

  async function handleSend() {
    setSending(true);

    if (slackToken) localStorage.setItem('rk_slack_token', slackToken);
    if (agenteRemitente) localStorage.setItem('rk_agente_remitente', agenteRemitente);

    const today = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    const filename = `propuesta-${form.viviendaRef || 'compra'}-${today}.pdf`;

    let pdfB64 = null;
    try {
      pdfB64 = generatePDF(
        { ...form, agenteRemitente },
        { questions: PREGUNTAS, answers },
        firmaData
      );
    } catch (e) {
      console.error('PDF error:', e);
    }

    if (slackToken && captador) {
      try {
        await sendToSlack(slackToken, captador.channel, { ...form, agenteRemitente }, pdfB64);
        setWasDownload(false);
        setDone(true);
      } catch (err) {
        console.error('Slack error:', err);
        if (pdfB64) downloadPDF(pdfB64, filename);
        alert('⚠️ No se pudo enviar por Slack. El PDF se ha descargado.\n\nError: ' + err.message);
        setWasDownload(true);
        setDone(true);
      }
    } else {
      if (pdfB64) downloadPDF(pdfB64, filename);
      setWasDownload(true);
      setDone(true);
    }

    setSending(false);
  }

  function resetApp() {
    setStep(1);
    setForm(INITIAL_FORM);
    setCaptador(null);
    setAnswers(Array(PREGUNTAS.length).fill(null));
    setFirmaData(null);
    setErrors({});
    setQError(false);
    setFirmaError(false);
    setDone(false);
    setWasDownload(false);
    window.scrollTo(0, 0);
  }

  if (done) {
    return (
      <>
        <AppHeader captadorName={captador?.name} />
        <SuccessScreen captador={captador} isDownload={wasDownload} onReset={resetApp} />
      </>
    );
  }

  return (
    <>
      <AppHeader captadorName={captador?.name} />
      <Stepper current={step} />

      <main className={styles.main}>
        {step === 1 && (
          <Step1
            form={form}
            onChange={handleFormChange}
            captador={captador}
            onCaptador={setCaptador}
            errors={errors}
          />
        )}
        {step === 2 && (
          <Step2 form={form} onChange={handleFormChange} errors={errors} />
        )}
        {step === 3 && (
          <Step3 form={form} onChange={handleFormChange} errors={errors} />
        )}
        {step === 4 && (
          <Step4 answers={answers} onAnswer={handleAnswer} error={qError} />
        )}
        {step === 5 && (
          <Step5
            form={form}
            captador={captador}
            firmaData={firmaData}
            onFirma={setFirmaData}
            error={firmaError}
          />
        )}
        {step === 6 && (
          <Step6
            form={form}
            captador={captador}
            answers={answers}
            slackToken={slackToken}
            onTokenChange={setSlackToken}
            agenteRemitente={agenteRemitente}
            onRemitenteChange={setAgenteRemitente}
          />
        )}
      </main>

      <BottomBar
        step={step}
        onBack={prevStep}
        onNext={nextStep}
        onSend={handleSend}
        sending={sending}
      />
    </>
  );
}
