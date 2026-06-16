# Propuesta de Compra · RK Palanca Fontestad

App interna para que los agentes generen y envíen propuestas de compra firmadas digitalmente.

## Stack
- React 18 + Vite
- jsPDF (generación de PDF corporativo)
- CSS Modules
- Slack Web API (envío al captador)

## Despliegue en Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "feat: propuesta de compra"
git remote add origin https://github.com/TU_USUARIO/propuesta-compra.git
git push -u origin main
```

### 2. Conectar en Vercel
1. vercel.com → Add New Project → importa el repo
2. Vercel detecta Vite automáticamente (build: `npm run build`, output: `dist`)
3. Deploy

### 3. Token Slack (una sola vez por dispositivo)
En el paso 6 introduce el token `xoxb-...`. Se guarda en localStorage.
Permisos necesarios: `chat:write`, `files:write`.

## Desarrollo local
```bash
npm install
npm run dev
```
