# Sydney Maxing — Cómo ponerlo en tu teléfono 📱

Esta es tu app de verdad: una **PWA** (web app installable). Una vez deployada,
la abres en Safari/Chrome, la agregas a tu pantalla de inicio, y queda como
cualquier otra app — con el botón **Ask** funcionando con IA y búsqueda en vivo.

Todo se hace **desde el navegador**, sin instalar nada en tu compu. ~15 minutos.

---

## Lo que necesitas (3 cuentas gratis)

1. **GitHub** — para guardar los archivos. https://github.com/signup
2. **Vercel** — para poner la app online gratis. https://vercel.com/signup
3. **Anthropic** — la API key que hace funcionar el botón Ask. https://console.anthropic.com

---

## Paso 1 — Sube los archivos a GitHub

1. Entra a https://github.com/new
2. Repository name: `sydney-maxing` → **Create repository**.
3. En la página del repo, haz click en **"uploading an existing file"**.
4. Arrastra **TODO lo que está dentro de la carpeta `sydney-maxing-app`**:
   - `index.html`, `app.js`, `data.js`, `manifest.webmanifest`, `sw.js`,
     `package.json`, `vercel.json`
   - la carpeta `icons/` (con los 4 PNG)
   - la carpeta `api/` (con `ask.js`)  ← **muy importante, es el cerebro de la IA**
5. **Commit changes**.

> Tip: para mantener las carpetas `icons/` y `api/`, arrástralas tal cual.
> Si GitHub no deja arrastrar carpetas, crea los archivos con
> "Add file → Create new file" y escribe el nombre `api/ask.js` (la barra `/`
> crea la carpeta sola).

---

## Paso 2 — Consigue tu API key de Anthropic

1. Entra a https://console.anthropic.com → **API Keys** → **Create Key**.
2. Cópiala (empieza con `sk-ant-...`). **Guárdala, no la vuelves a ver.**
3. Necesitas un poco de crédito: **Settings → Billing** y agrega $5.
   El modelo es Haiku (baratísimo) — cada pregunta cuesta centavos.

⚠️ **Nunca** pongas esta key dentro de los archivos ni la subas a GitHub.
Solo va en Vercel (paso 3), donde queda escondida en el servidor.

---

## Paso 3 — Deploy en Vercel

1. Entra a https://vercel.com/new
2. **Import** tu repo `sydney-maxing` de GitHub.
3. Antes de darle Deploy, abre **Environment Variables** y agrega:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu `sk-ant-...`
   - **Add**
4. **Deploy**. En ~1 minuto te da una URL tipo
   `https://sydney-maxing.vercel.app`.

---

## Paso 4 — Instálala en tu teléfono

1. Abre esa URL en el teléfono (Safari en iPhone, Chrome en Android).
2. **iPhone:** botón Compartir → **Add to Home Screen**.
   **Android:** menú ⋮ → **Install app / Add to Home screen**.
3. Listo — ya tienes el ícono en tu pantalla. Ábrela y prueba el botón **Ask**
   abajo a la derecha: pregúntale *"What's on this weekend?"* y te busca en vivo
   con links reales.

---

## Cómo actualizar la app después

Cambia cualquier archivo en GitHub (editar online o subir de nuevo) → Vercel
re-deploya solo en segundos. Para refrescar eventos, edita `data.js`.

## Si el botón Ask falla
- "isn't connected to an AI key" → falta `ANTHROPIC_API_KEY` en Vercel (paso 3).
- Error de crédito → agrega saldo en console.anthropic.com → Billing.
- Offline → la búsqueda en vivo solo corre con internet; las listas sí funcionan offline.

---

### Costo
- GitHub, Vercel, instalar la PWA → **gratis**.
- Anthropic → pagas solo lo que uses (Haiku ≈ unos centavos por pregunta).
