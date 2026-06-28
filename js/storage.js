/*
 * Hitung Syariah — Local Storage (local-first, privasi) (Guideline §14, §24)
 * --------------------------------------------------------------------------
 * Data waris TIDAK dikirim ke server. Disimpan lokal di perangkat pengguna.
 * Menggunakan localStorage (cukup untuk MVP; arsitektur siap pindah ke IndexedDB).
 * Import JSON divalidasi sebelum dipercaya; tidak menjalankan script dari file.
 */
(function (global) {
  'use strict';
  const HS = (global.HS = global.HS || {});
  const KEY = 'hitung-syariah:cases:v1';
  const SCHEMA_VERSION = '1';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function persist(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
  }
  function uid() {
    return 'case-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function listCases() {
    return load().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }
  function getCase(id) { return load().find((c) => c.id === id) || null; }

  function saveCase(caseInput, result, title, existingId) {
    const list = load();
    const now = new Date().toISOString();
    if (existingId) {
      const idx = list.findIndex((c) => c.id === existingId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], title: title || list[idx].title, updatedAt: now, input: caseInput, result };
        persist(list);
        return list[idx];
      }
    }
    const rec = {
      id: uid(), title: title || ('Kasus ' + new Date().toLocaleString('id-ID')),
      createdAt: now, updatedAt: now,
      appVersion: (HS.engine && HS.engine.APP_VERSION) || '0.1.0', schemaVersion: SCHEMA_VERSION,
      input: caseInput, result,
    };
    list.push(rec);
    persist(list);
    return rec;
  }

  function renameCase(id, title) {
    const list = load();
    const c = list.find((x) => x.id === id);
    if (c) { c.title = title; c.updatedAt = new Date().toISOString(); persist(list); }
    return c;
  }
  function duplicateCase(id) {
    const c = getCase(id);
    if (!c) return null;
    const list = load();
    const now = new Date().toISOString();
    const copy = { ...c, id: uid(), title: c.title + ' (salinan)', createdAt: now, updatedAt: now };
    list.push(copy); persist(list); return copy;
  }
  function deleteCase(id) {
    persist(load().filter((c) => c.id !== id)); return true;
  }
  function clearAll() { persist([]); return true; }

  // ---- Export / Import JSON ----
  function exportCase(id) {
    const c = getCase(id);
    if (!c) return null;
    return JSON.stringify({ schemaVersion: SCHEMA_VERSION, app: 'hitung-syariah', exportedAt: new Date().toISOString(), cases: [c] }, null, 2);
  }
  function exportAll() {
    return JSON.stringify({ schemaVersion: SCHEMA_VERSION, app: 'hitung-syariah', exportedAt: new Date().toISOString(), cases: load() }, null, 2);
  }

  // Validasi sederhana (pengganti Zod untuk MVP vanilla). Tidak mengeksekusi apa pun.
  function validateImport(obj) {
    if (!obj || typeof obj !== 'object') return { ok: false, error: 'File bukan objek JSON yang valid.' };
    if (!obj.schemaVersion) return { ok: false, error: 'File tidak menyertakan schemaVersion.' };
    if (!Array.isArray(obj.cases)) return { ok: false, error: 'File tidak memuat daftar "cases".' };
    const cleaned = [];
    for (const c of obj.cases) {
      if (!c || typeof c !== 'object') continue;
      if (!c.input || typeof c.input !== 'object') return { ok: false, error: 'Salah satu kasus tidak memiliki data input yang valid.' };
      cleaned.push({
        id: typeof c.id === 'string' ? c.id : uid(),
        title: typeof c.title === 'string' ? c.title : 'Kasus diimpor',
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: c.appVersion || '0.1.0',
        schemaVersion: String(c.schemaVersion || obj.schemaVersion),
        input: c.input, result: c.result || null,
      });
    }
    const schemaOld = String(obj.schemaVersion) !== SCHEMA_VERSION;
    return { ok: true, cases: cleaned, schemaOld };
  }

  function importJSON(text) {
    let obj;
    try { obj = JSON.parse(text); }
    catch (e) { return { ok: false, error: 'File JSON tidak dapat dibaca (format rusak).' }; }
    const v = validateImport(obj);
    if (!v.ok) return v;
    const list = load();
    const existingIds = new Set(list.map((c) => c.id));
    let added = 0;
    v.cases.forEach((c) => { if (existingIds.has(c.id)) c.id = uid(); list.push(c); added++; });
    persist(list);
    return { ok: true, added, schemaOld: v.schemaOld };
  }

  HS.storage = {
    SCHEMA_VERSION, listCases, getCase, saveCase, renameCase, duplicateCase,
    deleteCase, clearAll, exportCase, exportAll, importJSON,
  };
})(typeof window !== 'undefined' ? window : globalThis);
