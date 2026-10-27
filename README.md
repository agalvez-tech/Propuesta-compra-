# RK Propuesta Contrato

App interna de RK Palanca Fontestad para redactar y descargar propuestas de compra en Word.

## Flujo (6 pasos)
1. **Inmueble** — dirección, ref. comercial, captador
2. **Comprador** — datos personales y email (obligatorio: le llega la propuesta para firmar), agente que hizo la visita
3. **Oferta** — precio, reserva, arras, plazos, condicionantes
4. **Cuestionario** — 12 preguntas SÍ/NO de control
5. **Generar** — genera el .docx de siempre (logo, cláusulas legales completas y datos fiscales)
6. **Firmar** — el documento se abre en la web para revisarlo y editarlo a mano (o descargar el Word).
   *Enviar para firmar* lo manda a firmar digitalmente (Documenso) a los compradores por email y SMS;
   la firma de RK va estampada. Cuando firman todos, el PDF firmado llega por privado en Slack al
   agente que hizo la visita (no al canal de la vivienda).

La firma la hace el servicio `pdf-informe-slack` (Cloud Run, proyecto contratos-498808),
endpoint `/propuesta/enviar-firma` (ver `FIRMA_URL` / `FIRMA_KEY` en `src/data/index.js`).

## Deploy en Vercel
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/agalvez-tech/rk-propuesta-contrato.git
git push -u origin main
```
Vercel detecta Vite automáticamente. Sin variables de entorno.

## Desarrollo local
```bash
npm install && npm run dev
```
