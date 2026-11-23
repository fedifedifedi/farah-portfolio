// Génère le portfolio PDF (français et anglais) à partir de scripts/print.html :
//   node scripts/portfolio-pdf.mjs
// À relancer après chaque modification des projets ou des textes.
// Nécessite Google Chrome (chemin modifiable avec la variable CHROME).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 3999;
const OUT = { fr: 'images/portfolio-farah.pdf', en: 'images/portfolio-farah-en.pdf' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Petit serveur local (le même que npm run dev)
const server = spawn(process.execPath, [join(ROOT, 'scripts/dev.mjs')], { env: { ...process.env, PORT: String(PORT) } });
const profile = mkdtempSync(join(tmpdir(), 'pdf-'));
const debugPort = 9500 + Math.floor(Math.random() * 300);
const chrome = spawn(CHROME, ['--headless=new', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${debugPort}`, 'about:blank']);

try {
  let targets;
  for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json(); break; } catch { await sleep(250); } }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.result?.value;

  for (const [lang, out] of Object.entries(OUT)) {
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/scripts/print.html?lang=${lang}` });
    for (let i = 0; i < 120 && (await evalJs('window.ready === true')) !== true; i++) await sleep(500);
    const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 });
    writeFileSync(join(ROOT, out), Buffer.from(pdf.result.data, 'base64'));
    console.log(`${out} : ${(Buffer.byteLength(pdf.result.data, 'base64') / 1e6).toFixed(1)} Mo`);
  }
  ws.close();
} finally {
  chrome.kill();
  server.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
process.exit(0);
