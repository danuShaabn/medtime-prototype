# MedTime — prototip frontend

Proiect React/Vite cu ecrane individuale pentru un prototip MedTime mobile-first. Datele sunt fictive și nu există backend. Site-ul folosește fluxurile Doctolib ca referință de experiență, nu ca design de copiat.

**Prototip live:** https://medtime-prototype.vercel.app/ (deploy Vercel, interfață demonstrativă fără backend).

## Pornire

```powershell
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 3000 --strictPort
```

Rutele și titlurile ecranelor sunt în `public/manus-routes.json`. Pagina mobilă de referință este 390×844 px; toate rutele au și layout responsive la 1440 px.

## Publicare pe Vercel

Proiectul este configurat pentru Vercel prin `vercel.json`:

- Framework: Vite
- Comandă de build: `npm run build`
- Director publicat: `dist`
- Rutele React Router sunt redirecționate către aplicația SPA, inclusiv la reîncărcarea paginilor interne.

Pentru publicare prin GitHub, adaugă fișierele proiectului în rădăcina repository-ului și include `package.json`, `package-lock.json`, `vite.config.js`, `vercel.json`, `index.html`, `src/` și `public/`. Nu încărca `node_modules/`, `dist/` sau `.git/`. După commit și push pe branch-ul conectat la Vercel, deploy-ul pornește automat. La conectarea manuală a repository-ului, lasă Root Directory ca `./`; setările de build și output sunt deja declarate în `vercel.json`.

## Rute

`/onboarding`, `/autentificare`, `/acasa`, `/medici`, `/medici/ana-popescu`, `/calendar`, `/confirmare`, `/succes`, `/programari`, `/profil`, `/medic`, `/medic/blocare`, `/admin`, `/admin/rapoarte`, `/admin/recenzii`, `/eroare/fara-conexiune`, `/eroare/ora-indisponibila`, `/eroare/serviciu-indisponibil`.

## Import în Figma

Deschide fiecare rută în Chrome și captureaz-o cu extensia html.to.design; fila Web a pluginului este pentru URL-uri publice, iar extensia este ruta recomandată pentru Preview-ul local. Trimite captura direct la plugin sau descarc-o ca `.h2d` și import-o prin fila File. Setează viewportul la 390×844 px pentru mobil sau 1440×900 px pentru desktop. Proiectul oferă HTML/CSS frontend inspectabil și nu este un fișier `.fig` nativ.

## Identitate vizuală

Culori principale: turcoaz `#1B9AAA`, albastru `#153B56`, coral `#F2795B`, fundal deschis `#F5FAFC` și alb `#FFFFFF`. Font: Inter, cu fallback sans-serif. Iconițe: Lucide.
