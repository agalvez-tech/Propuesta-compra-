import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, BorderStyle, WidthType,
  ShadingType, PageBreak, UnderlineType,
} from 'docx';

export function fmtEuros(n) {
  if (!n) return '………………………………';
  return parseFloat(n).toLocaleString('es-ES') + ' €';
}

// ── STYLE CONSTANTS ──────────────────────────────────────────────────────────
const FONT   = 'Calibri';
const ORANGE = 'CF731B';
const BLACK  = '1A1A1A';
const GRAY   = '5A5855';
const LGRAY  = 'A0A0A0';

const SZ_BODY   = 22;   // 11pt
const SZ_SMALL  = 18;   // 9pt
const SZ_TITLE  = 26;   // 13pt
const SZ_FOOT   = 17;   // 8.5pt

const MARGIN = { top: 1134, right: 1134, bottom: 851, left: 1134, header: 567, footer: 567 };
// A4 content width DXA with these margins: 11906 - 1134 - 1134 = 9638
const CONTENT_W = 9638;

// ── HELPERS ──────────────────────────────────────────────────────────────────
function run(text, opts = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: opts.size || SZ_BODY,
    bold: opts.bold || false,
    color: opts.color || BLACK,
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
    italics: opts.italics || false,
  });
}

function para(children, opts = {}) {
  const runs = Array.isArray(children) ? children : [run(children, opts)];
  return new Paragraph({
    children: runs,
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { before: opts.before ?? 80, after: opts.after ?? 80, line: opts.line ?? 276, lineRule: 'auto' },
    keepLines: opts.keepLines ?? false,
    keepNext: opts.keepNext ?? false,
    border: opts.borderBottom ? {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 }
    } : undefined,
    indent: opts.indent ? { left: opts.indent } : undefined,
  });
}

function sectionHeading(text, keepNext = true) {
  return para(
    [run(text, { bold: true, color: ORANGE, size: SZ_BODY })],
    { borderBottom: true, before: 160, after: 60, align: AlignmentType.LEFT, keepNext, keepLines: true }
  );
}

function blank(before = 60, after = 60) {
  return para([run('')], { before, after });
}

function signatureLine(leftLabel, rightLabel, leftSub = '', rightSub = '') {
  const border = { style: BorderStyle.SINGLE, size: 4, color: BLACK };
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const cell = (label, sub) => new TableCell({
    width: { size: CONTENT_W / 2, type: WidthType.DXA },
    borders: { top: border, bottom: noBorder, left: noBorder, right: noBorder },
    margins: { top: 120, bottom: 60, left: 0, right: 0 },
    children: [
      para([run(label, { bold: true, size: SZ_SMALL })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
      ...(sub ? [para([run(sub, { size: SZ_SMALL, color: LGRAY })], { align: AlignmentType.CENTER, before: 0, after: 0 })] : []),
    ],
  });
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W / 2, CONTENT_W / 2],
    rows: [new TableRow({ children: [cell(leftLabel, leftSub), cell(rightLabel, '')] })],
    margins: { top: 240, bottom: 120 },
  });
}

function simpleTable(headers, emptyRows = 1) {
  const colW = Math.floor(CONTENT_W / headers.length);
  const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
  const borders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };

  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      width: { size: colW, type: WidthType.DXA },
      borders,
      shading: { fill: 'F0EDE8', type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [para([run(h, { bold: true, size: SZ_SMALL })], { before: 0, after: 0 })],
    })),
  });
  const dataRows = Array.from({ length: emptyRows }, () =>
    new TableRow({
      children: headers.map(() => new TableCell({
        width: { size: colW, type: WidthType.DXA },
        borders,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [para([run(' ')], { before: 0, after: 0 })],
      })),
    })
  );
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: Array(headers.length).fill(colW),
    rows: [headerRow, ...dataRows],
  });
}

function checkbox(text, answer) {
  const ansColor = answer === 'SI' ? '16A34A' : answer === 'NO' ? 'DC2626' : LGRAY;
  return para(
    [
      run('☐  ', { size: SZ_BODY }),
      run(text + '   ', { size: SZ_BODY }),
      run(answer || '—', { bold: true, color: ansColor, size: SZ_BODY }),
    ],
    { before: 60, after: 40, keepLines: true }
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export async function generateDocx(formData, questionData) {
  const {
    viviendaDir = '', viviendaRef = '', lugarFirma = 'Foios',
    compradores = [],
    agenteVisitaNombre = '', agenteVisitaDni = '',
    precioTotal, importeReserva, importeArras,
    plazoArras = '5', plazoVigencia = '7',
    fechaEscritura = '', observaciones = '',
  } = formData;

  // Build comprador helpers
  const compradoresList = compradores.length > 0
    ? compradores
    : [{ nombre: formData.compradorNombre || '', nif: formData.compradorNif || '', tel: '' }];
  const compradorPrincipal = compradoresList[0];
  const compradorNombre = compradorPrincipal.nombre || '…………………………………';
  const compradorNif = compradorPrincipal.nif || '…………………………………';
  const esPlural = compradoresList.length > 1;
  const nombresFormateados = compradoresList.map(c => c.nombre || '…………………………………').join(' y ');
  const nifsFormateados = compradoresList.map(c => c.nif || '…………………………………').join(' y ');

  const { questions, answers } = questionData;
  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  // Load logo
  let logoBuffer = null;
  try {
    const resp = await fetch('/logo-rk.png');
    const ab = await resp.arrayBuffer();
    logoBuffer = new Uint8Array(ab);
  } catch (e) {
    console.warn('Logo no disponible', e);
  }

  // ── HEADER ────────────────────────────────────────────────────────────────
  const headerChildren = [];
  if (logoBuffer) {
    headerChildren.push(new Paragraph({
      children: [new ImageRun({
        data: logoBuffer,
        type: 'png',
        transformation: { width: 155, height: 31 },   // ~155mm × 31mm
      })],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 120 },
    }));
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footerChildren = [
    para(
      [run('C/ DR. MILLÁN, 33 · 46134 · FOIOS (VALENCIA) · TEL 961 49 01 35 · FAX 961 49 80 54 · WWW.INMOBILIARIAPALANCA.COM',
        { bold: true, size: SZ_FOOT, color: GRAY })],
      { align: AlignmentType.CENTER, before: 60, after: 0 }
    ),
    para(
      [run('CIF: B-56935190 - INSCRITA EN EL REGISTRO MERCANTIL DE VALENCIA TOMO 7726 LIBRO 5023 FOLIO 45 SECCIÓN 8 HOJA V-95182 INSCRIPCIÓN 1ª',
        { size: 14, color: GRAY })],
      { align: AlignmentType.CENTER, before: 0, after: 0 }
    ),
  ];

  // ── BODY ──────────────────────────────────────────────────────────────────
  const body = [];

  // Title
  body.push(para(
    [run('PROPUESTA DE COMPRA', { bold: true, size: SZ_TITLE })],
    { align: AlignmentType.CENTER, before: 0, after: 120, keepNext: true }
  ));

  // Intro — adapts for single or multiple compradores
  body.push(para(
    [
      run(nombresFormateados, { bold: true, size: SZ_BODY }),
      run(' con N.I.F/D.N.I ', { size: SZ_BODY }),
      run(nifsFormateados, { bold: true, size: SZ_BODY }),
      run(esPlural ? ', en adelante los COMPRADORES,' : ', en adelante el COMPRADOR,', { size: SZ_BODY }),
      run(' por medio de este documento realizan la presente propuesta de compra en las condiciones en ella establecidas para la adquisición de la vivienda sita en ', { size: SZ_BODY }),
      run(viviendaDir || '…………………………………', { bold: true, size: SZ_BODY }),
      run('  Ref. comercial: ', { size: SZ_BODY }),
      run(viviendaRef || '………………………', { bold: true, size: SZ_BODY }),
    ],
    { before: 80, after: 80 }
  ));

  body.push(para(
    [
      run('Dicha oferta de compra se realiza a través de ', { size: SZ_BODY }),
      run('RK PALANCA FONTESTAD', { bold: true, size: SZ_BODY }),
      run(', cuyos datos figuran al margen, quien tiene conferido el encargo de venta de dicho inmueble, y que gestionará la propuesta de compra a los solos efectos de intermediaria.', { size: SZ_BODY }),
    ],
    { before: 60, after: 120 }
  ));

  // ── CONDICIONES ───────────────────────────────────────────────────────────
  body.push(sectionHeading('CONDICIONES DE LA OFERTA DE COMPRA'));

  body.push(sectionHeading('PRECIO DE COMPRA', true));
  body.push(para(
    [
      run('El precio ofrecido por el comprador para la compra del inmueble es de:  ', { size: SZ_BODY }),
      run(fmtEuros(precioTotal), { bold: true, size: SZ_BODY }),
      run('.', { size: SZ_BODY }),
    ],
    { before: 60, after: 80 }
  ));

  body.push(sectionHeading('FORMA DE PAGO', true));

  body.push(para(
    [
      run('A) ', { bold: true, size: SZ_BODY }),
      run('En el presente acto y para la compra del referido inmueble la cantidad de ', { size: SZ_BODY }),
      run(fmtEuros(importeReserva), { bold: true, size: SZ_BODY }),
      run(', en concepto de reserva del mismo y que se sujetará al régimen previsto en el artículo 1454 del Código Civil, de tal modo que podrá rescindirse el contrato allanándose el comprador a perderlas o el vendedor a devolverlas duplicadas.', { size: SZ_BODY }),
    ],
    { before: 60, after: 60, keepLines: true }
  ));

  body.push(para(
    [run('Este documento servirá como ', { size: SZ_BODY }),
     run('carta de pago y justificante suficiente', { bold: true, size: SZ_BODY }),
     run(' de la entrega de la cantidad mencionada, la cual pasará a cuenta de honorarios una vez aceptada la oferta. La ', { size: SZ_BODY }),
     run('factura definitiva', { bold: true, size: SZ_BODY }),
     run(' por el total de los servicios de intermediación inmobiliaria será emitida y entregada a la parte correspondiente en el momento del otorgamiento de la escritura pública de compraventa.', { size: SZ_BODY }),
    ],
    { before: 60, after: 60 }
  ));

  body.push(para(
    [
      run('B) ', { bold: true, size: SZ_BODY }),
      run('Una vez aceptada la presente propuesta de compra por el Propietario o su representante, se formalizará el acuerdo alcanzado mediante contrato privado de arras en el plazo de ', { size: SZ_BODY }),
      run(`${plazoArras} DÍAS HÁBILES`, { bold: true, size: SZ_BODY }),
      run(' a contar desde la fecha de aceptación por parte del propietario; entregándose en ese acto la cantidad de ', { size: SZ_BODY }),
      run(fmtEuros(importeArras), { bold: true, size: SZ_BODY }),
      run(', que tendrán el carácter de ', { size: SZ_BODY }),
      run('arras penitenciales', { bold: true, size: SZ_BODY }),
      run(' conforme a lo dispuesto en el artículo 1454 del Código Civil, y que de consumarse la compraventa se considerarán parte del precio.', { size: SZ_BODY }),
    ],
    { before: 60, after: 60, keepLines: true }
  ));

  body.push(para(
    [
      run('C) ', { bold: true, size: SZ_BODY }),
      run('El resto de la cantidad pendiente del precio se abonará en el momento de formalización del contrato en ', { size: SZ_BODY }),
      run('Escritura Pública', { bold: true, size: SZ_BODY }),
      run('.', { size: SZ_BODY }),
    ],
    { before: 60, after: 120 }
  ));

  // ── OTROS CONDICIONANTES ──────────────────────────────────────────────────
  body.push(sectionHeading('OTROS CONDICIONANTES DE LA PROPUESTA DE COMPRA', true));

  const condicionantes = [
    {
      label: 'CARGAS:',
      text: 'El inmueble se transmitirá como cuerpo cierto, libre de toda clase de cargas, gravámenes, inquilinos u ocupantes y al corriente de pago de impuestos, arbitrios y gastos de comunidad. En caso contrario se deducirá del precio final de venta por el comprador, el importe necesario para la cancelación económica y registral de las cargas existentes en el momento de otorgarse la Escritura Pública de Compraventa.',
    },
    {
      label: 'FECHA Y LUGAR DE LA ESCRITURA:',
      text: ` ${fechaEscritura || '…………………………'}, se elevará a Escritura Pública el Contrato Privado de Compraventa, ante el Notario que designe la parte compradora.`,
    },
    {
      label: 'GASTOS E IMPUESTOS DE LA TRANSMISIÓN:',
      text: ' Todos los gastos, impuestos y arbitrios que se generen como consecuencia de la compra-venta serán CON ARREGLO A LEY.',
    },
    {
      label: 'CONDICIÓN SUSPENSIVA:',
      text: ' La presente oferta está condicionada a la aceptación de la propiedad o su representante. Así de ser aceptada se considerará a todos los efectos perfeccionada la compraventa.',
    },
    {
      label: 'VIGENCIA DE LA PROPUESTA DE COMPRA:',
      text: ` Esta oferta será irrevocable durante el plazo de ${plazoVigencia} días. Transcurrido dicho plazo sin que haya sido aceptada por el propietario o su representante, quedará anulada y sin efecto, viniendo `,
      suffix: 'RK PALANCA FONTESTAD',
      suffix2: ' obligada a devolver al ofertante las cantidades por éste entregadas y que tenía ésta en concepto de depósito.',
    },
  ];

  condicionantes.forEach(({ label, text, suffix, suffix2 }, i) => {
    body.push(para(
      [
        run(label + ' ', { bold: true, size: SZ_BODY }),
        run(text, { size: SZ_BODY }),
        ...(suffix ? [run(suffix, { bold: true, size: SZ_BODY })] : []),
        ...(suffix2 ? [run(suffix2, { size: SZ_BODY })] : []),
      ],
      { before: 60, after: 60, keepLines: true, keepNext: i < condicionantes.length - 1 }
    ));
  });

  body.push(para(
    [run('Esta oferta queda condicionada a la aceptación del propietario.', { size: SZ_BODY })],
    { before: 60, after: 60 }
  ));

  if (observaciones) {
    body.push(para(
      [
        run('OBSERVACIONES: ', { bold: true, size: SZ_BODY }),
        run(observaciones, { size: SZ_BODY }),
      ],
      { before: 60, after: 60 }
    ));
  }

  // Firma bloque 1
  body.push(para(
    [run(`Y en prueba de aceptación y conformidad, se firma el presente documento por duplicado en ${lugarFirma} a ___ de ____ de 2026.`, { size: SZ_BODY, color: GRAY })],
    { before: 120, after: 200 }
  ));

  body.push(signatureLine('EL COMPRADOR', 'RK PALANCA FONTESTAD', compradorNombre));
  body.push(blank(200, 100));

  // Tablas aceptación/no aceptación vendedor
  body.push(para(
    [run('Aceptación por parte de la parte Vendedora', { bold: true, size: SZ_BODY })],
    { before: 120, after: 60, keepNext: true }
  ));
  body.push(simpleTable(['Nombre:', 'NIF:', 'Fecha:']));
  body.push(blank(80, 60));

  body.push(para(
    [run('No Aceptación por parte de la parte Vendedora', { bold: true, size: SZ_BODY })],
    { before: 80, after: 60, keepNext: true }
  ));
  body.push(simpleTable(['Nombre:', 'NIF:', 'Fecha:']));

  // ── PAGE BREAK → CUESTIONARIO ──────────────────────────────────────────────
  body.push(new Paragraph({ children: [new PageBreak()] }));

  body.push(para(
    [run('CUESTIONARIO CONTROL — INFORMACIÓN RECIBIDA PROPUESTA DE COMPRA', { bold: true, size: SZ_TITLE })],
    { align: AlignmentType.CENTER, before: 0, after: 60, borderBottom: true, keepNext: true }
  ));

  questions.forEach((q, i) => {
    body.push(checkbox(q, answers[i]));
  });

  body.push(blank(120, 100));
  // Signature lines for cuestionario — one per comprador if multiple
  if (esPlural) {
    compradoresList.forEach(c => {
      body.push(signatureLine('EL OFERTANTE', 'RK PALANCA FONTESTAD', c.nombre || ''));
      body.push(blank(40, 40));
    });
  } else {
    body.push(signatureLine('EL OFERTANTE', 'RK PALANCA FONTESTAD', compradorNombre));
  }

  // ── PAGE BREAK → HONORARIOS ────────────────────────────────────────────────
  body.push(new Paragraph({ children: [new PageBreak()] }));

  body.push(para(
    [run('RECONOCIMIENTO DE HONORARIOS A RK PALANCA FONTESTAD', { bold: true, size: SZ_TITLE })],
    { align: AlignmentType.CENTER, before: 0, after: 60, borderBottom: true, keepNext: true }
  ));

  body.push(para(
    [
      run(nombresFormateados, { bold: true }),
      run(' con N.I.F/D.N.I nº ', {}),
      run(nifsFormateados, { bold: true }),
      run(esPlural ? ', en adelante los OFERTANTES, declaran' : ', en adelante el OFERTANTE, declara', {}),
      run(' haber aceptado la presentación de posibles propiedades por parte del Agente Dº ', {}),
      run(agenteVisitaNombre || '…………………………………', { bold: true }),
      run(agenteVisitaDni ? ' con DNI: ' + agenteVisitaDni : '', {}),
      run(' que representa a ', {}),
      run('RK PALANCA FONTESTAD', { bold: true }),
      run(', cuyos datos figuran al margen.', {}),
    ],
    { before: 80, after: 80, keepLines: true }
  ));

  body.push(para(
    [
      run('Además, declara haber visto la vivienda sita en ', {}),
      run(viviendaDir || '…………………………………', { bold: true }),
      run('  Ref. comercial: ', {}),
      run(viviendaRef || '………………………', { bold: true }),
      run('. Por mediación de '),
      run('RK PALANCA FONTESTAD', { bold: true }),
      run(', y que con carácter previo a realizar la misma ha sido informado de que de realizar la visita y acabar adquiriendo el inmueble deberá abonar a '),
      run('RK PALANCA FONTESTAD honorarios de gestión y asesoramiento.', { bold: true }),
    ],
    { before: 60, after: 80 }
  ));

  body.push(para(
    [
      run('El pago a '),
      run('RK PALANCA FONTESTAD', { bold: true }),
      run(' por su intervención en la compra de dicha propiedad, si ésta llegase a buen fin, serán del '),
      run('3% más el IVA (21%) correspondiente (con un mínimo de 3.000 € más IVA).', { bold: true }),
    ],
    { before: 60, after: 60 }
  ));

  body.push(para(
    [run('El pago de dichos honorarios será efectivo mediante cheque bancario, a más tardar, en el momento de firmar la escritura pública de compraventa.')],
    { before: 60, after: 60 }
  ));

  body.push(para(
    [run('Si se realizara vía transferencia, debería ser previo a la firma de la escritura pública de compraventa y en el caso de no llevarse ésta a cabo se devolvería en el plazo máximo de 7 días.')],
    { before: 60, after: 120 }
  ));

  body.push(para(
    [run('Y para que así conste, se firma el presente documento en el lugar y fecha indicados en el presente documento.', { color: GRAY })],
    { before: 60, after: 200 }
  ));

  // Final signatures — one per comprador if multiple
  if (esPlural) {
    compradoresList.forEach(c => {
      body.push(signatureLine('RK PALANCA FONTESTAD', c.nombre || '…………………………………'));
      body.push(blank(40, 40));
    });
  } else {
    body.push(signatureLine('RK PALANCA FONTESTAD', compradorNombre));
  }

  // ── ASSEMBLE DOCUMENT ─────────────────────────────────────────────────────
  const docObj = new Document({
    styles: {
      default: {
        document: { run: { font: FONT, size: SZ_BODY } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },  // A4
          margin: MARGIN,
        },
      },
      headers: {
        default: new Header({ children: headerChildren }),
      },
      footers: {
        default: new Footer({ children: footerChildren }),
      },
      children: body,
    }],
  });

  // Packer.toBlob() is browser-safe (no Node Buffer needed)
  const blob = await Packer.toBlob(docObj);
  return blob;
}

export function downloadDocx(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
