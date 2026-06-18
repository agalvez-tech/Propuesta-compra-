# RK Propuesta Contrato

App interna de RK Palanca Fontestad para redactar y descargar propuestas de compra en Word.

## Flujo (5 pasos)
1. **Inmueble** — dirección, ref. comercial, captador
2. **Comprador** — datos personales, agente que hizo la visita
3. **Oferta** — precio, reserva, arras, plazos, condicionantes
4. **Cuestionario** — 12 preguntas SÍ/NO de control
5. **Generar** — descarga el .docx con logo, cláusulas legales completas y datos fiscales

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
