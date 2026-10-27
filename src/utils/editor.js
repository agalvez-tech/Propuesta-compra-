// Word -> HTML editable (paso "Revisar y firmar") y vuelta a HTML final para firmar.
//
// El .docx que genera docx.js se convierte con mammoth. mammoth no conserva la
// alineación ni los colores, así que se recuperan por la forma del párrafo:
//   - centrado            -> título (.c)
//   - alineado a la izq. y todo en negrita -> encabezado de sección (.h)
//   - salto de página      -> <hr class="pb">
// Las marcas [[FIRMA:C1]] / [[FIRMA:RK]] (ver marcaFirma en docx.js) se muestran
// como etiquetas no editables y el servidor las cambia por la firma digital.
import mammoth from 'mammoth';

const MARCA = /\[\[FIRMA:(C\d+|RK)\]\]/g;

function transformar(doc) {
  const visitar = (el) => {
    if (el.type === 'paragraph') {
      const texto = [];
      let todoNegrita = true;
      const runs = (el.children || []).filter(c => c.type === 'run');
      runs.forEach(r => (r.children || []).forEach(t => {
        if (t.type === 'text' && t.value.trim()) { texto.push(t.value); if (!r.isBold) todoNegrita = false; }
      }));
      if (el.alignment === 'center') return { ...el, styleName: 'rk-centro' };
      if (el.alignment === 'left' && todoNegrita && texto.length) return { ...el, styleName: 'rk-encabezado' };
      return el;
    }
    if (el.children) return { ...el, children: el.children.map(visitar) };
    return el;
  };
  return visitar(doc);
}

export function etiqueta(quien) {
  const txt = quien === 'RK' ? 'Sello RK Palanca' : `Firma comprador ${quien.slice(1)}`;
  return `<span class="firma-chip ${quien === 'RK' ? 'rk' : 'cli'}" contenteditable="false" data-firma="${quien}">✍ ${txt}</span>`;
}

export async function docxAHtmlEditable(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  // en el navegador mammoth lee arrayBuffer; en node (pruebas) un Buffer
  const entrada = typeof window === 'undefined' ? { buffer: globalThis.Buffer.from(arrayBuffer) } : { arrayBuffer };
  const { value } = await mammoth.convertToHtml(entrada, {
    transformDocument: transformar,
    styleMap: [
      "p[style-name='rk-centro'] => p.c:fresh",
      "p[style-name='rk-encabezado'] => p.h:fresh",
      "br[type='page'] => hr.pb",
    ],
  });
  return value
    // la marca va sola en un párrafo dentro de la celda de firma
    .replace(/<p>\s*(\[\[FIRMA:(C\d+|RK)\]\])\s*<\/p>/g, (_, m, q) => `<p class="firma">${etiqueta(q)}</p>`)
    .replace(MARCA, (_, q) => etiqueta(q))
    // tabla de firma = la que lleva etiquetas de firma
    .replace(/<table>(?=(?:(?!<\/table>).)*firma-chip)/gs, '<table class="tfirma">');
}

/** HTML del editor -> HTML que se manda a firmar (etiquetas -> marcas de texto). */
export function htmlParaFirmar(htmlEditor) {
  return htmlEditor.replace(
    /<span[^>]*data-firma="(C\d+|RK)"[^>]*>.*?<\/span>/g,
    (_, q) => `[[FIRMA:${q}]]`,
  );
}

/** Firmas que siguen en el documento (por si borran alguna al editar). */
export function firmasPresentes(htmlEditor) {
  return [...htmlEditor.matchAll(/data-firma="(C\d+|RK)"/g)].map(m => m[1]);
}
