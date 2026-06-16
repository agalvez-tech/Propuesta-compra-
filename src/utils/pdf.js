import { jsPDF } from 'jspdf';

export function fmtEuros(n) {
  if (!n) return '……………………………';
  return parseFloat(n).toLocaleString('es-ES') + ' €';
}

export function generatePDF(formData, questionData, firmaData) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });

  const W = 210, ml = 18, mr = 18;
  const cw = W - ml - mr;
  let y = 20;

  const orange = [207, 115, 27];
  const black = [26, 26, 26];
  const gray = [90, 88, 85];

  // Header bar
  doc.setFillColor(...orange);
  doc.rect(0, 0, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'RK PALANCA FONTESTAD  ·  C/ Dr. Millán, 33 · 46134 · FOIOS (VALENCIA)  ·  961 49 01 35',
    105, 7.5, { align: 'center' }
  );

  y = 22;
  doc.setTextColor(...black);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPUESTA DE COMPRA', 105, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(...orange);
  doc.setLineWidth(0.5);
  doc.line(ml, y, W - mr, y);
  y += 8;

  const {
    viviendaDir = '', viviendaRef = '', lugarFirma = 'Foios',
    compradorNombre = '', compradorNif = '',
    agenteVisitaNombre = '', agenteVisitaDni = '',
    precioTotal, importeReserva, importeArras,
    plazoArras = 5, plazoVigencia = 7,
    fechaEscritura = '', observaciones = '',
    agenteRemitente = '',
  } = formData;

  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  function checkPage() {
    if (y > 265) { doc.addPage(); y = 20; }
  }

  function sectionTitle(t) {
    checkPage();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...orange);
    doc.text(t, ml, y);
    doc.setDrawColor(...orange);
    doc.setLineWidth(0.3);
    doc.line(ml, y + 1.5, W - mr, y + 1.5);
    y += 7;
    doc.setTextColor(...black);
  }

  function bodyText(t) {
    checkPage();
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    const lines = doc.splitTextToSize(t, cw);
    doc.text(lines, ml, y);
    y += lines.length * 5 + 2;
  }

  bodyText(
    `Dª ${compradorNombre} con NIF/DNI ${compradorNif}, en adelante el COMPRADOR, realiza la presente ` +
    `propuesta de compra para la adquisición de la vivienda sita en ${viviendaDir}  Ref. comercial: ${viviendaRef}.`
  );
  bodyText('Dicha oferta se realiza a través de RK PALANCA FONTESTAD.');
  y += 3;

  sectionTitle('PRECIO DE COMPRA');
  bodyText(`El precio ofrecido por el comprador para la compra del inmueble es de ${fmtEuros(precioTotal)}.`);

  sectionTitle('FORMA DE PAGO');
  bodyText(
    `A) En el presente acto, en concepto de reserva: ${fmtEuros(importeReserva)}. ` +
    'Sujeto al régimen del art. 1454 del Código Civil.'
  );
  bodyText(
    `B) Contrato privado de arras en el plazo de ${plazoArras} DÍAS HÁBILES desde la aceptación. ` +
    `Importe de arras: ${fmtEuros(importeArras)}.`
  );
  bodyText('C) El resto del precio en el momento de formalización en Escritura Pública.');

  sectionTitle('CONDICIONANTES');
  bodyText('CARGAS: El inmueble se transmitirá libre de toda clase de cargas, gravámenes e inquilinos.');
  bodyText(`FECHA ESCRITURA: ${fechaEscritura || '……………………………'}, ante el Notario que designe la parte compradora.`);
  bodyText('GASTOS E IMPUESTOS: Con arreglo a Ley.');
  bodyText(`VIGENCIA: Esta oferta será irrevocable durante ${plazoVigencia} días. Sujeta a aceptación del propietario.`);
  if (observaciones) bodyText(`OBSERVACIONES: ${observaciones}`);
  y += 3;

  // Cuestionario
  if (y > 210) { doc.addPage(); y = 20; }
  sectionTitle('CUESTIONARIO DE CONTROL — INFORMACIÓN RECIBIDA');

  const { questions, answers } = questionData;
  answers.forEach((ans, i) => {
    checkPage();
    const color = ans === 'SI' ? [22, 163, 74] : ans === 'NO' ? [220, 38, 38] : gray;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(`${i + 1}. ${ans || '—'}`, ml, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    const lines = doc.splitTextToSize(questions[i], cw - 20);
    doc.text(lines, ml + 14, y);
    y += lines.length * 4.5 + 1;
  });

  // Reconocimiento honorarios
  y += 4;
  if (y > 240) { doc.addPage(); y = 20; }
  sectionTitle('RECONOCIMIENTO DE HONORARIOS A RK PALANCA FONTESTAD');
  bodyText(
    `Dª ${compradorNombre} con NIF/DNI ${compradorNif}, declara haber visto la vivienda sita en ${viviendaDir} ` +
    `Ref. comercial: ${viviendaRef}, por mediación de RK PALANCA FONTESTAD, a través del agente ` +
    `${agenteVisitaNombre}${agenteVisitaDni ? ' con DNI ' + agenteVisitaDni : ''}. ` +
    'Ha sido informado de que de adquirir el inmueble deberá abonar a RK PALANCA FONTESTAD honorarios del 3% + IVA (21%), ' +
    'con un mínimo de 3.000 € + IVA.'
  );

  // Firmas
  y += 8;
  if (y > 250) { doc.addPage(); y = 20; }

  if (firmaData) {
    try {
      doc.addImage(firmaData, 'PNG', ml, y - 24, 70, 22);
    } catch (e) { /* skip */ }
  }

  doc.setDrawColor(...black);
  doc.setLineWidth(0.3);
  doc.line(ml, y, ml + 70, y);
  doc.line(W - mr - 70, y, W - mr, y);
  y += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...black);
  doc.text('EL COMPRADOR', ml + 35, y, { align: 'center' });
  doc.text('RK PALANCA FONTESTAD', W - mr - 35, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text(compradorNombre, ml + 35, y, { align: 'center' });
  y += 8;
  doc.text(`Firmado en ${lugarFirma}, a ${today}`, 105, y, { align: 'center' });

  // Footer
  doc.setFillColor(...orange);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(
    'CIF: B-56935190  ·  www.inmobiliariapalanca.com  ·  Realmark Inmobiliaria',
    105, 293, { align: 'center' }
  );

  return doc.output('datauristring').split(',')[1];
}

export async function sendToSlack(token, channelId, formData, pdfB64) {
  const { viviendaDir, viviendaRef, compradorNombre, precioTotal, agenteRemitente } = formData;
  const today = new Date().toLocaleDateString('es-ES');

  const text =
    `📋 *Nueva Propuesta de Compra*\n\n` +
    `🏠 *Inmueble:* ${viviendaDir} (${viviendaRef})\n` +
    `👤 *Comprador:* ${compradorNombre}\n` +
    `💶 *Precio ofertado:* ${fmtEuros(precioTotal)}\n` +
    `📅 *Fecha:* ${today}\n` +
    (agenteRemitente ? `✉️ *Enviado por:* ${agenteRemitente}\n` : '') +
    `\n_La propuesta firmada se adjunta como PDF._`;

  const msgRes = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel: channelId, text }),
  });
  const msgJson = await msgRes.json();
  if (!msgJson.ok) throw new Error(msgJson.error || 'Error al enviar mensaje Slack');

  if (pdfB64) {
    const bytes = Uint8Array.from(atob(pdfB64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const fd = new FormData();
    fd.append('token', token);
    fd.append('channels', channelId);
    fd.append('file', blob, `propuesta-compra-${viviendaRef}.pdf`);
    fd.append('title', `Propuesta de Compra — ${viviendaDir}`);
    await fetch('https://slack.com/api/files.upload', { method: 'POST', body: fd });
  }
}

export function downloadPDF(b64, filename) {
  const link = document.createElement('a');
  link.href = 'data:application/pdf;base64,' + b64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
