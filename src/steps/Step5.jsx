import { useRef, useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard';
import { fmtEuros } from '../utils/pdf';
import styles from './Step5.module.css';

export default function Step5({ form, captador, firmaData, onFirma, error }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [hasFirma, setHasFirma] = useState(!!firmaData);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Restore existing firma if present
    if (firmaData) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = firmaData;
    }
  }, []);

  function getPos(e, canvas) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * (canvas.width / r.width),
      y: (src.clientY - r.top) * (canvas.height / r.height),
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
  }

  function draw(e) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    const data = canvas.toDataURL('image/png');
    onFirma(data);
    setHasFirma(true);
  }

  function stopDraw() {
    isDrawing.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onFirma(null);
    setHasFirma(false);
  }

  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div>
      <p className="step-title">Firma del comprador</p>
      <p className="step-desc">El comprador debe firmar en el recuadro con el dedo o el ratón.</p>

      <SectionCard icon="✍️" title="Firma táctil">
        <div className={styles.firmaWrap}>
          {!hasFirma && (
            <span className={styles.placeholder}>Firme aquí</span>
          )}
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <div className={styles.firmaActions}>
            {hasFirma && (
              <span className={styles.signedBadge}>✅ Firma registrada</span>
            )}
            <button type="button" className={styles.btnClear} onClick={clearCanvas}>
              Borrar y repetir
            </button>
          </div>
        </div>
        {error && <p className={styles.error}>El comprador debe firmar antes de continuar.</p>}
      </SectionCard>

      {hasFirma && (
        <SectionCard icon="👁️" title="Vista previa del documento">
          <div className={styles.previewDoc}>
            <h2>PROPUESTA DE COMPRA</h2>
            <p>
              Dª <strong>{form.compradorNombre || '………………'}</strong> con NIF/DNI{' '}
              <strong>{form.compradorNif || '………………'}</strong>, realiza propuesta de compra para la vivienda{' '}
              <strong>{form.viviendaDir || '………………'}</strong> — Ref.{' '}
              <strong>{form.viviendaRef || '………………'}</strong>.
            </p>
            <div className={styles.sectionT}>Precio de compra</div>
            <p>Precio ofertado: <strong>{fmtEuros(form.precioTotal)}</strong></p>
            <div className={styles.sectionT}>Forma de pago</div>
            <p><strong>A)</strong> Reserva: <strong>{fmtEuros(form.importeReserva)}</strong></p>
            <p><strong>B)</strong> Arras ({form.plazoArras || 5} días hábiles): <strong>{fmtEuros(form.importeArras)}</strong></p>
            <p><strong>C)</strong> Resto en escritura pública.</p>
            <div className={styles.sectionT}>Vigencia</div>
            <p>Irrevocable durante <strong>{form.plazoVigencia || 7} días</strong>. Sujeta a aceptación del propietario.</p>
            <div className={styles.firmaRow}>
              <div className={styles.firmaBox}>
                {firmaData && (
                  <img src={firmaData} alt="Firma comprador" className={styles.firmaImg} />
                )}
                <div>EL COMPRADOR</div>
                <small>{form.compradorNombre}</small>
              </div>
              <div className={styles.firmaBox}>
                <div>RK PALANCA FONTESTAD</div>
                <small>Intermediaria</small>
              </div>
            </div>
            <p className={styles.lugarFecha}>
              Firmado en {form.lugarFirma || 'Foios'}, a {today}
            </p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
