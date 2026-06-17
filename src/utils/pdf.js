import { jsPDF } from 'jspdf';

export function fmtEuros(n) {
  if (!n) return '………………………………';
  return parseFloat(n).toLocaleString('es-ES') + ' €';
}

function fmtEurosLetras(n) {
  if (!n) return '………………………………';
  return parseFloat(n).toLocaleString('es-ES') + ' €';
}

export function generatePDF(formData, questionData, _firmaData) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });

  const W = 210;
  const ml = 18, mr = 18;
  const cw = W - ml - mr;
  let y = 0;

  const orange  = [207, 115, 27];
  const black   = [26, 26, 26];
  const gray    = [90, 88, 85];
  const lgray   = [150, 148, 145];

  // ── Helpers ────────────────────────────────────────────
  function newPage() {
    doc.addPage();
    y = 20;
  }

  function checkY(need = 10) {
    if (y + need > 272) newPage();
  }

  function hRule(color = gray, width = 0.3) {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(ml, y, W - mr, y);
    y += 4;
  }

  function sectionTitle(t) {
    checkY(12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...orange);
    doc.text(t, ml, y);
    doc.setDrawColor(...orange);
    doc.setLineWidth(0.35);
    doc.line(ml, y + 1.5, W - mr, y + 1.5);
    y += 7;
    doc.setTextColor(...black);
  }

  function body(t, opts = {}) {
    const { bold = false, size = 9, indent = 0, spacing = 2, color = black } = opts;
    checkY(8);
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(t, cw - indent);
    lines.forEach(line => {
      checkY(5);
      doc.text(line, ml + indent, y);
      y += 4.8;
    });
    y += spacing;
  }

  function mixedLine(parts) {
    // parts: [{text, bold, size}]
    checkY(7);
    let x = ml;
    parts.forEach(({ text, bold = false, size = 9 }) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...black);
      doc.text(text, x, y);
      x += doc.getTextWidth(text);
    });
    y += 5.5;
  }

  // ── HEADER ─────────────────────────────────────────────
  doc.setFillColor(...orange);
  doc.rect(0, 0, W, 13, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'RK PALANCA FONTESTAD  ·  C/ Dr. Millán, 33 · 46134 · FOIOS (VALENCIA)  ·  Tel. 961 49 01 35  ·  Fax 961 49 80 54',
    W / 2, 8.5, { align: 'center' }
  );
  y = 20;

  // ── TITLE ──────────────────────────────────────────────
  doc.setTextColor(...black);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPUESTA DE COMPRA', W / 2, y, { align: 'center' });
  y += 10;
  hRule(orange, 0.6);

  // ── FORM VALUES ────────────────────────────────────────
  const {
    viviendaDir      = '',
    viviendaRef      = '',
    lugarFirma       = 'Foios',
    compradorNombre  = '',
    compradorNif     = '',
    agenteVisitaNombre = '',
    agenteVisitaDni  = '',
    precioTotal,
    importeReserva,
    importeArras,
    plazoArras       = '5',
    plazoVigencia    = '7',
    fechaEscritura   = '',
    observaciones    = '',
    agenteRemitente  = '',
  } = formData;

  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // ── INTRO PARAGRAPH ────────────────────────────────────
  body(
    `Dª ${compradorNombre || '…………………………………'} con N.I.F/D.N.I. ${compradorNif || '…………………………………'}, en adelante el COMPRADOR, ` +
    `por medio de este documento realiza la presente propuesta de compra en las condiciones en ella establecidas ` +
    `para la adquisición de la vivienda sita en ${viviendaDir || '…………………………………'}  Ref. comercial: ${viviendaRef || '……………………'}.`
  );
  body(
    `Dicha oferta de compra se realiza a través de RK PALANCA FONTESTAD, cuyos datos figuran al margen, ` +
    `quien tiene conferido el encargo de venta de dicho inmueble, y que gestionará la propuesta de compra ` +
    `a los solos efectos de intermediaria.`
  );
  y += 2;

  // ── CONDICIONES ────────────────────────────────────────
  sectionTitle('CONDICIONES DE LA OFERTA DE COMPRA');

  sectionTitle('PRECIO DE COMPRA');
  body(
    `El precio ofrecido por el comprador para la compra del inmueble es de: ${fmtEuros(precioTotal)}.`
  );

  sectionTitle('FORMA DE PAGO');

  body(
    `A) En el presente acto y para la compra del referido inmueble la cantidad de ` +
    `${fmtEuros(importeReserva)}, en concepto de reserva del mismo y que se sujetará al régimen previsto ` +
    `en el artículo 1454 del Código Civil, de tal modo que podrá rescindirse el contrato allanándose el ` +
    `comprador a perderlas o el vendedor a devolverlas duplicadas.`
  );
  body(
    `Este documento servirá como carta de pago y justificante suficiente de la entrega de la cantidad ` +
    `mencionada, la cual pasará a cuenta de honorarios una vez aceptada la oferta. La factura definitiva ` +
    `por el total de los servicios de intermediación inmobiliaria será emitida y entregada a la parte ` +
    `correspondiente en el momento del otorgamiento de la escritura pública de compraventa.`
  );
  body(
    `B) Una vez aceptada la presente propuesta de compra por el Propietario o su representante, se ` +
    `formalizará el acuerdo alcanzado mediante contrato privado de arras en el plazo de ${plazoArras} DÍAS HÁBILES ` +
    `a contar desde la fecha de aceptación por parte del propietario; entregándose en ese acto la cantidad ` +
    `de ${fmtEuros(importeArras)}, que tendrán el carácter de arras penitenciales conforme a lo dispuesto ` +
    `en el artículo 1454 del Código Civil, y que de consumarse la compraventa se considerarán parte del precio.`
  );
  body(
    `C) El resto de la cantidad pendiente del precio se abonará en el momento de formalización del ` +
    `contrato en Escritura Pública.`
  );

  sectionTitle('OTROS CONDICIONANTES DE LA PROPUESTA DE COMPRA');

  body(
    `CARGAS: El inmueble se transmitirá como cuerpo cierto, libre de toda clase de cargas, gravámenes, ` +
    `inquilinos u ocupantes y al corriente de pago de impuestos, arbitrios y gastos de comunidad. En caso ` +
    `contrario se deducirá del precio final de venta por el comprador, el importe necesario para la ` +
    `cancelación económica y registral de las cargas existentes en el momento de otorgarse la Escritura ` +
    `Pública de Compraventa.`, { bold: false }
  );
  body(
    `FECHA Y LUGAR DE LA ESCRITURA: ${fechaEscritura || '…………………………'}, se elevará a Escritura Pública ` +
    `el Contrato Privado de Compraventa, ante el Notario que designe la parte compradora.`
  );
  body(
    `GASTOS E IMPUESTOS DE LA TRANSMISIÓN: Todos los gastos, impuestos y arbitrios que se generen como ` +
    `consecuencia de la compra-venta serán CON ARREGLO A LEY.`
  );
  body(
    `CONDICIÓN SUSPENSIVA: La presente oferta está condicionada a la aceptación de la propiedad o su ` +
    `representante. Así de ser aceptada se considerará a todos los efectos perfeccionada la compraventa.`
  );
  body(
    `VIGENCIA DE LA PROPUESTA DE COMPRA: Esta oferta será irrevocable durante el plazo de ${plazoVigencia} días. ` +
    `Transcurrido dicho plazo sin que haya sido aceptada por el propietario o su representante, quedará ` +
    `anulada y sin efecto, viniendo RK PALANCA FONTESTAD obligada a devolver al ofertante las cantidades ` +
    `por éste entregadas y que tenía ésta en concepto de depósito.`
  );
  body(`Esta oferta queda condicionada a la aceptación del propietario.`);

  if (observaciones) {
    body(`OBSERVACIONES: ${observaciones}`);
  }
  y += 2;

  // ── FIRMA BLOQUE 1 ─────────────────────────────────────
  body(`Y en prueba de aceptación y conformidad, se firma el presente documento por duplicado en ` +
    `${lugarFirma}, a ${today}.`, { color: gray });
  y += 6;
  checkY(20);
  doc.setDrawColor(...black);
  doc.setLineWidth(0.3);
  doc.line(ml, y, ml + 72, y);
  doc.line(W - mr - 72, y, W - mr, y);
  y += 4;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text('EL COMPRADOR', ml + 36, y, { align: 'center' });
  doc.text('RK PALANCA FONTESTAD', W - mr - 36, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...lgray); doc.setFontSize(7.5);
  doc.text(compradorNombre, ml + 36, y, { align: 'center' });
  y += 10;

  // ── ACEPTACIÓN / NO ACEPTACIÓN VENDEDOR ───────────────
  checkY(30);
  hRule(orange, 0.4);

  function vendedorTable(titulo) {
    checkY(20);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
    doc.text(titulo, ml, y); y += 5;
    // Simple hand-drawn table
    const cols = [cw * 0.45, cw * 0.3, cw * 0.25];
    const headers = ['Nombre:', 'NIF:', 'Fecha:'];
    const rowH = 8;
    let x = ml;
    doc.setDrawColor(...gray); doc.setLineWidth(0.25);
    // header row
    headers.forEach((h, i) => {
      doc.rect(x, y, cols[i], rowH);
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...gray);
      doc.text(h, x + 2, y + 5.5);
      x += cols[i];
    });
    y += rowH;
    // data row (empty)
    x = ml;
    cols.forEach(w => { doc.rect(x, y, w, rowH); x += w; });
    y += rowH + 4;
  }

  vendedorTable('Aceptación por parte de la parte Vendedora');
  vendedorTable('No Aceptación por parte de la parte Vendedora');

  // ── CUESTIONARIO ───────────────────────────────────────
  newPage();
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text('CUESTIONARIO CONTROL — INFORMACIÓN RECIBIDA PROPUESTA DE COMPRA', W / 2, y, { align: 'center' });
  y += 3; hRule(orange, 0.5);

  const { questions, answers } = questionData;
  questions.forEach((q, i) => {
    checkY(9);
    const ans = answers[i] || '—';
    const ansColor = ans === 'SI' ? [22, 163, 74] : ans === 'NO' ? [220, 38, 38] : lgray;
    // checkbox square
    doc.setDrawColor(...gray); doc.setLineWidth(0.25);
    doc.rect(ml, y - 3.5, 3.5, 3.5);
    // answer badge
    doc.setFillColor(...ansColor);
    doc.roundedRect(W - mr - 10, y - 4, 10, 4.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text(ans, W - mr - 5, y - 0.8, { align: 'center' });
    // question text
    doc.setTextColor(...black); doc.setFontSize(8.2); doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(`${i + 1}. ${q}`, cw - 16);
    lines.forEach((line, li) => {
      checkY(5);
      doc.text(line, ml + 5, y + (li > 0 ? li * 4.6 : 0));
    });
    y += lines.length * 4.6 + 3;
  });

  // Firma cuestionario
  y += 4; checkY(20);
  doc.setDrawColor(...black); doc.setLineWidth(0.3);
  doc.line(ml, y, ml + 72, y);
  doc.line(W - mr - 72, y, W - mr, y);
  y += 4;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text('EL OFERTANTE', ml + 36, y, { align: 'center' });
  doc.text('RK PALANCA FONTESTAD', W - mr - 36, y, { align: 'center' });
  y += 5;

  // ── RECONOCIMIENTO HONORARIOS ──────────────────────────
  checkY(10);
  y += 4; hRule(orange, 0.5);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text('RECONOCIMIENTO DE HONORARIOS A RK PALANCA FONTESTAD', W / 2, y, { align: 'center' });
  y += 3; hRule(orange, 0.4);

  body(
    `Dª ${compradorNombre || '…………………………………'} con N.I.F/D.N.I nº ${compradorNif || '…………………………………'}, ` +
    `en adelante el OFERTANTE, declara haber aceptado la presentación de posibles propiedades por parte ` +
    `del Agente Dº ${agenteVisitaNombre || '…………………………………'} ` +
    `${agenteVisitaDni ? 'con DNI: ' + agenteVisitaDni : ''} ` +
    `que representa a RK PALANCA FONTESTAD, cuyos datos figuran al margen.`
  );
  body(
    `Además, declara haber visto la vivienda sita en ${viviendaDir || '…………………………………'}  ` +
    `Ref. comercial: ${viviendaRef || '……………………'}. Por mediación de RK PALANCA FONTESTAD, y que con ` +
    `carácter previo a realizar la misma ha sido informado de que de realizar la visita y acabar adquiriendo ` +
    `el inmueble deberá abonar a RK PALANCA FONTESTAD honorarios de gestión y asesoramiento.`
  );
  body(
    `El pago a RK PALANCA FONTESTAD por su intervención en la compra de dicha propiedad, si ésta llegase ` +
    `a buen fin, serán del 3% más el IVA (21%) correspondiente (con un mínimo de 3.000 € más IVA).`
  );
  body(
    `El pago de dichos honorarios será efectivo mediante cheque bancario, a más tardar, en el momento de ` +
    `firmar la escritura pública de compraventa.`
  );
  body(
    `Si se realizara vía transferencia, debería ser previo a la firma de la escritura pública de ` +
    `compraventa y en el caso de no llevarse ésta a cabo se devolvería en el plazo máximo de 7 días.`
  );
  y += 4;
  body(`Y para que así conste, se firma el presente documento en el lugar y fecha indicados en el presente documento.`, { color: gray });
  y += 6; checkY(24);

  doc.setDrawColor(...black); doc.setLineWidth(0.3);
  doc.line(ml, y, ml + 72, y);
  doc.line(W - mr - 72, y, W - mr, y);
  y += 4;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text('RK PALANCA FONTESTAD', ml + 36, y, { align: 'center' });
  doc.text(compradorNombre || '…………………………………', W - mr - 36, y, { align: 'center' });

  // ── FOOTER (all pages) ─────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...orange);
    doc.rect(0, 286, W, 11, 'F');
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 255, 255);
    doc.text(
      'CIF: B-56935190  ·  Inscrita en el Registro Mercantil de Valencia, Tomo 7726, Libro 5023, Folio 45, Sección 8, Hoja V-95182  ·  www.inmobiliariapalanca.com',
      W / 2, 293, { align: 'center' }
    );
  }

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
    `\n_La propuesta se adjunta como PDF._`;

  const msgRes = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel: channelId, text }),
  });
  const msgJson = await msgRes.json();
  if (!msgJson.ok) throw new Error(msgJson.error || 'Error al enviar mensaje Slack');

  if (pdfB64) {
    const bytes = Uint8Array.from(atob(pdfB64), c => c.charCodeAt(0));
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
