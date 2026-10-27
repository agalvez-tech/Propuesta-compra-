export const CAPTADORES = [
  { name: 'Alejandro García',   channel: 'C0AAJF80U07',  initials: 'AG' },
  { name: 'Almudena Gálvez',    channel: 'DIRECT',        initials: 'AL' },
  { name: 'Amparo Orts',        channel: 'C0AAGQKHU4X',  initials: 'AO' },
  { name: 'Asunción Marco',     channel: 'C0AAZVD8UUA',  initials: 'AS' },
  { name: 'Clara Ordoñez',      channel: 'C0AAGR9Q2S3',  initials: 'CO' },
  { name: 'Claudia Stelling',   channel: 'C0AAYB1QT8A',  initials: 'CS' },
  { name: 'Desiree López',      channel: 'C0ABB99MV5F',  initials: 'DL' },
  { name: 'Eva Vallés',         channel: 'C0AAJS3F0A3',  initials: 'EV' },
  { name: 'Fede Carbonell',     channel: 'C0ABB13HW1F',  initials: 'FC' },
  { name: 'Fran Estelles',      channel: 'C0AAUMPTSGM',  initials: 'FE' },
  { name: 'Javi Palanca',       channel: 'U0A7S63DRQS',  initials: 'JP' }, // sin canal de dinamización: DM a su usuario
  { name: 'Jose Giménez',       channel: 'C0ABSMNFDCY',  initials: 'JG' },
  { name: 'Jose Miguel Palanca', channel: 'U0A7ANNJ3E3', initials: 'JM' }, // sin canal de dinamización: DM a su usuario
  { name: 'Lorena Lull',        channel: 'C0AAS26GAKD',  initials: 'LL' },
  { name: 'Maria Jose Ordoñez', channel: 'C0AAJGP9K0F',  initials: 'MJ' },
  { name: 'Mavi Castillo',      channel: 'C0ABT3HLT1N',  initials: 'MC' },
  { name: 'Mª Luisa Bellver',   channel: 'C0AAXU0MC4W',  initials: 'ML' },
  { name: 'Natalia Sanfélix',   channel: 'C0AAWH6HJ3X',  initials: 'NS' },
  { name: 'Nuria',              channel: 'PENDING',       initials: 'NU' },
  { name: 'Rosa Doménech',      channel: 'C0AAW8EEW94',  initials: 'RD' },
  { name: 'Sefa Gallent',       channel: 'C0AB1TRTQ04',  initials: 'SG' },
  { name: 'Virginia Corral',    channel: 'C0AB3HP8VBN',  initials: 'VC' },
  { name: 'Yvonne Vidal',       channel: 'C0B6D3ZR1FA',  initials: 'YV' },
];

export const PREGUNTAS = [
  '¿Se te ha informado de que esta oferta está sujeta a la aprobación por parte del propietario?',
  '¿Se te ha informado de que esto puede ser así aunque la oferta sea en precio?',
  '¿Se te ha informado de que, si se traslada una oferta por debajo del precio publicado, ésta debe ser aceptada por parte del propietario?',
  '¿Se te ha informado de que la agencia inmobiliaria solo tiene autorización para reservar la vivienda cuando tenga una propuesta aceptada por el propietario?',
  '¿Se te ha informado de que la agencia inmobiliaria no puede dar de baja el inmueble de los portales sin una aceptación por parte del propietario, y por tanto, mientras eso suceda, pueden haber más visitas / ofertas?',
  '¿Necesita financiación?',
  '¿La tenéis aprobada en alguna entidad bancaria?',
  '¿Necesitas una tasación y la tienes ya en estudio?',
  '¿Sabéis que tendréis que firmar las arras en el tiempo estipulado en la propuesta de compra que se está firmando?',
  '¿Se te ha informado con carácter previo a realizar la oferta que para la tramitación y gestión de ésta deberá abonar, en caso de realizarse la compraventa, honorarios a RK PALANCA FONTESTAD?',
  '¿Se le ha informado de que si quiere pactar otras condiciones adicionales debe plantearlo al firmar el documento de oferta, no una vez éste haya sido aceptado?',
  '¿Se le ha informado de que si se traslada una oferta por parte del comprador, se acepta, y luego no se firman las arras, perderá la señal entregada como reserva?',
];

export const STEPS = [
  { label: 'Inmueble' },
  { label: 'Comprador' },
  { label: 'Oferta' },
  { label: 'Cuestionario' },
  { label: 'Generar' },
  { label: 'Firmar' },
];

// Agente comprador (el que hizo la visita): su usuario de Slack recibe por privado
// la propuesta firmada. Mismos IDs que PERFIL-COMPRADOR (AGENTS_SLACK).
export const AGENTES = [
  { name: 'Alejandro García',    slackId: 'U0A8F8S4PV1' },
  { name: 'Almudena Gálvez',     slackId: 'U0A7KM0FREX' },
  { name: 'Amparo Orts',         slackId: 'U0A9G0NM3CY' },
  { name: 'Asunción Marco',      slackId: 'U0A8F4ATGM9' },
  { name: 'Clara Ordoñez',       slackId: 'U0A8KKYSVFY' },
  { name: 'Claudia Stelling',    slackId: 'U0A8J7BJ9CM' },
  { name: 'Desiree López',       slackId: 'U0A867VKVTR' },
  { name: 'Eva Vallés',          slackId: 'U0A8KK02Z6J' },
  { name: 'Fede Carbonell',      slackId: 'U0A90DLPULR' },
  { name: 'Fran Estelles',       slackId: 'U0A8J7808AH' },
  { name: 'Javi Palanca',        slackId: 'U0A7S63DRQS' },
  { name: 'Jose Giménez',        slackId: 'U0A865TURHD' },
  { name: 'Jose Miguel Palanca', slackId: 'U0A7ANNJ3E3' },
  { name: 'Lorena Lull',         slackId: 'U0A8KK0TG94' },
  { name: 'Maria Jose Lluch',    slackId: 'U0C5L0Q4E2K' },
  { name: 'Maria Jose Ordoñez',  slackId: 'U0AAFGXHKV2' },
  { name: 'Mavi Castillo',       slackId: 'U0A8MLSNHV0' },
  { name: 'Mª Luisa Bellver',    slackId: 'U0A8KL3AYPQ' },
  { name: 'Natalia Sanfélix',    slackId: 'U0A8J79MECV' },
  { name: 'Nuria',               slackId: 'U0B2HH7UXHU' },
  { name: 'Rosa Doménech',       slackId: 'U0A8R8ZQSBW' },
  { name: 'Sefa Gallent',        slackId: 'U0A8F9QGQTD' },
  { name: 'Virginia Corral',     slackId: 'U0A8KL4AC94' },
  { name: 'Yvonne Vidal',        slackId: 'U0B2G5FG337' },
];

// Firma digital (Documenso, servicio pdf-informe-slack). La clave solo frena el
// uso anónimo del endpoint (va a la vista en el JS, como el PIN de los formularios).
export const FIRMA_URL = 'https://pdf-informe-slack-522842131600.europe-west1.run.app/propuesta/enviar-firma';
export const FIRMA_KEY = 'rkprop-5045-firma';
