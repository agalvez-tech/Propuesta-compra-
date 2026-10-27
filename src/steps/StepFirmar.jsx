import { useEffect, useRef } from 'react';
import s from './StepFirmar.module.css';

// Paso 6: la propuesta generada (el mismo Word del paso 5) abierta para editar
// como en Word. Las etiquetas "✍ Firma comprador N" / "Sello RK" marcan dónde
// firmará cada uno: no se pueden escribir, pero sí borrar (ver firmasPresentes).
const ACCIONES = [
  { cmd: 'bold', label: <b>N</b>, title: 'Negrita' },
  { cmd: 'italic', label: <i>C</i>, title: 'Cursiva' },
  { cmd: 'underline', label: <u>S</u>, title: 'Subrayado' },
  { cmd: 'insertUnorderedList', label: '• Lista', title: 'Lista' },
  { cmd: 'undo', label: '↶', title: 'Deshacer' },
  { cmd: 'redo', label: '↷', title: 'Rehacer' },
];

export default function StepFirmar({ html, onCambio, editorRef, onDescargarWord }) {
  const ref = useRef(null);

  // El HTML se pone una sola vez: si React lo re-renderizara se perderían las ediciones.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
    if (editorRef) editorRef.current = ref.current;
  }, [html, editorRef]);

  function aplicar(cmd) {
    ref.current?.focus();
    document.execCommand(cmd, false, null);
    onCambio?.();
  }

  return (
    <div>
      <p className="step-title">Revisar y enviar a firmar</p>
      <p className="step-desc">
        Este es el documento que se va a firmar. Puedes <strong>escribir directamente en él</strong> para
        cambiar lo que quieras. Las etiquetas <span className={s.chipDemo}>✍ Firma comprador</span> marcan
        dónde firmará cada comprador: déjalas donde están.
      </p>

      <div className={s.toolbar}>
        {ACCIONES.map(a => (
          <button key={a.cmd} type="button" title={a.title} className={s.tool}
            onMouseDown={e => { e.preventDefault(); aplicar(a.cmd); }}>
            {a.label}
          </button>
        ))}
        <span className={s.sep} />
        <button type="button" className={s.tool} onClick={onDescargarWord} title="Descargar el Word original">
          ⬇ Word
        </button>
      </div>

      <div className={s.hoja}>
        <img src="/logo-rk.png" alt="RK Palanca Fontestad" className={s.logo} />
        <div
          ref={ref}
          className={s.doc}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={() => onCambio?.()}
        />
        <div className={s.pie}>
          C/ DR. MILLÁN, 33 · 46134 · FOIOS (VALENCIA) · TEL 961 49 01 35 · WWW.INMOBILIARIAPALANCA.COM
        </div>
      </div>
    </div>
  );
}
