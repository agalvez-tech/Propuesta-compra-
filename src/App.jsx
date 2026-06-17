import { useState } from 'react';
import AppHeader from './components/AppHeader';
import Stepper from './components/Stepper';
import BottomBar from './components/BottomBar';
import SuccessScreen from './components/SuccessScreen';
import SettingsModal from './components/SettingsModal';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5Final from './steps/Step6';   // paso 5 del flujo = Step6.jsx (Generar)
import PerfilComprador from './tabs/PerfilComprador';
import { PREGUNTAS } from './data';
import { generateDocx, downloadDocx } from './utils/docx';
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

const TOTAL_STEPS = 5; // Inmueble · Comprador · Oferta · Cuestionario · Generar

export default function App() {
  const [activeTab, setActiveTab] = useState('propuesta');

  // Propuesta state
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [captador, setCaptador] = useState(null);
  const [answers, setAnswers] = useState(Array(PREGUNTAS.length).fill(null));
  const [errors, setErrors] = useState({});
  const [qError, setQError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [propuestaDone, setPropuestaDone] = useState(false);

  // Perfil state
  const [perfilDone, setPerfilDone] = useState(false);
  const [perfilCaptador, setPerfilCaptador] = useState(null);

  // Shared
  const [slackToken, setSlackToken] = useState(() => localStorage.getItem('rk_slack_token') || '');
  const [agenteRemitente, setAgenteRemitente] = useState(() => localStorage.getItem('rk_agente_remitente') || '');
  const [showSettings, setShowSettings] = useState(false);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setPropuestaDone(false);
    setPerfilDone(false);
  }

  // ── PROPUESTA ──────────────────────────────────────────
  function handleFormChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
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
        { ...form, agenteRemitente },
        { questions: PREGUNTAS, answers }
      );
      downloadDocx(blob, filename);
      setPropuestaDone(true);
    } catch (e) {
      console.error(e);
      alert('Error al generar el documento: ' + e.message);
    }
    setGenerating(false);
  }

  function resetPropuesta() {
    setStep(1);
    setForm(INITIAL_FORM);
    setCaptador(null);
    setAnswers(Array(PREGUNTAS.length).fill(null));
    setErrors({});
    setQError(false);
    setPropuestaDone(false);
    window.scrollTo(0, 0);
  }

  function resetPerfil() {
    setPerfilDone(false);
    setPerfilCaptador(null);
  }

  return (
    <>
      <AppHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSettings={() => setShowSettings(true)}
      />

      {showSettings && (
        <SettingsModal
          slackToken={slackToken}
          onTokenChange={setSlackToken}
          agenteRemitente={agenteRemitente}
          onRemitenteChange={setAgenteRemitente}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ── TAB PROPUESTA ── */}
      {activeTab === 'propuesta' && (
        propuestaDone ? (
          <SuccessScreen
            isDownload={true}
            onReset={resetPropuesta}
            customTitle="¡Documento generado!"
            customDesc="La propuesta de compra se ha descargado como Word (.docx) con todas las cláusulas legales. Puedes abrirlo y editarlo desde Word.."
          />
        ) : (
          <>
            <Stepper current={step} />
            <main className={styles.main}>
              {step === 1 && <Step1 form={form} onChange={handleFormChange} captador={captador} onCaptador={setCaptador} errors={errors} />}
              {step === 2 && <Step2 form={form} onChange={handleFormChange} errors={errors} />}
              {step === 3 && <Step3 form={form} onChange={handleFormChange} errors={errors} />}
              {step === 4 && <Step4 answers={answers} onAnswer={handleAnswer} error={qError} />}
              {step === 5 && <Step5Final form={form} captador={captador} answers={answers} />}
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
        )
      )}

      {/* ── TAB PERFIL ── */}
      {activeTab === 'perfil' && (
        perfilDone ? (
          <SuccessScreen
            captador={perfilCaptador}
            isDownload={false}
            onReset={resetPerfil}
            customTitle="¡Perfil enviado!"
            customDesc="El perfil del comprador y los documentos han sido enviados al captador por Slack."
          />
        ) : (
          <main className={styles.main}>
            <p className="step-title">Perfil del Comprador</p>
            <p className="step-desc">
              Rellena el perfil y el checklist. Al pulsar enviar, el captador recibirá toda la información y los documentos por Slack.
            </p>
            <PerfilComprador
              slackToken={slackToken}
              agenteRemitente={agenteRemitente}
              onSuccess={(cap) => { setPerfilCaptador(cap); setPerfilDone(true); }}
            />
          </main>
        )
      )}
    </>
  );
}
