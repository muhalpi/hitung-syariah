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
  const RELATIONS = Object.keys((HS.engine && HS.engine.HEIR_META) || {
    husband: 1, wife: 1, father: 1, mother: 1, son: 1, daughter: 1,
    grandson_from_son: 1, granddaughter_from_son: 1, grandchild_substitute: 1,
    full_brother: 1, full_sister: 1, paternal_brother: 1, paternal_sister: 1,
    maternal_brother: 1, maternal_sister: 1, grandfather: 1, grandmother: 1,
    uncle: 1, adopted_child: 1, adoptive_parent: 1, other: 1,
  });
  const REL_SET = new Set(RELATIONS);
  const GENDER_SET = new Set(['male', 'female']);
  const RELIGION_SET = new Set(['muslim', 'non_muslim', 'unknown']);
  const BLOCKER_SET = new Set(['murder', 'attempted_murder', 'serious_abuse', 'false_accusation', 'different_religion', 'unknown']);
  const SPECIAL_KEYS = [
    'hasSubstitute', 'isPolygamy', 'hasIllegitimateChild', 'hasDifferentReligionHeir',
    'hasMinorHeir', 'farmlandUnder2ha', 'hasUncertainStatus', 'hasAdoptedChild', 'hasAdoptiveParent',
  ];

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

  function cleanText(v, fallback, max) {
    if (typeof v !== 'string') return fallback;
    return v.slice(0, max || 200);
  }
  function cleanMoney(v, field) {
    if (v == null || v === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) throw new Error(field + ' harus berupa angka tidak negatif.');
    return Math.round(n);
  }
  function cleanBool(v) { return v === true; }
  function deriveGender(relation, gender) {
    const meta = HS.engine && HS.engine.HEIR_META && HS.engine.HEIR_META[relation];
    if (meta && (meta.gender === 'male' || meta.gender === 'female')) return meta.gender;
    return GENDER_SET.has(gender) ? gender : 'male';
  }
  function cleanInput(input) {
    if (!input || typeof input !== 'object') throw new Error('Data input tidak valid.');
    const mode = input.mode == null ? 'khi' : input.mode;
    if (mode !== 'khi' && mode !== 'faraidh') throw new Error('Mode hukum tidak dikenal.');
    const estate = input.estate || {};
    if (!estate || typeof estate !== 'object') throw new Error('Data harta tidak valid.');
    const wills = Array.isArray(estate.wills) ? estate.wills : [];
    const grants = Array.isArray(estate.grants) ? estate.grants : [];
    if (!Array.isArray(input.heirs)) throw new Error('Daftar ahli waris tidak valid.');
    const heirs = input.heirs;
    const special = input.special && typeof input.special === 'object' ? input.special : {};

    const cleaned = {
      mode,
      estate: {
        grossAssets: cleanMoney(estate.grossAssets, 'Harta pribadi'),
        jointPropertyTotal: cleanMoney(estate.jointPropertyTotal, 'Harta bersama'),
        deceasedShareOfJointProperty: cleanMoney(estate.deceasedShareOfJointProperty, 'Bagian pewaris dari harta bersama'),
        funeralCost: cleanMoney(estate.funeralCost, 'Biaya jenazah'),
        medicalCostBeforeDeath: cleanMoney(estate.medicalCostBeforeDeath, 'Biaya sakit'),
        debts: cleanMoney(estate.debts, 'Hutang'),
        wills: wills.map((w, i) => {
          if (!w || typeof w !== 'object') throw new Error('Wasiat ke-' + (i + 1) + ' tidak valid.');
          return { desc: cleanText(w.desc, '', 200), amount: cleanMoney(w.amount, 'Nilai wasiat') };
        }),
        grants: grants.map((g) => ({
          desc: cleanText(g && g.desc, '', 200),
          status: cleanText(g && g.status, 'review', 40),
        })),
        willsApprovedByAllHeirs: cleanBool(estate.willsApprovedByAllHeirs),
        notes: cleanText(estate.notes, '', 1000),
      },
      heirs: heirs.map((h, i) => {
        if (!h || typeof h !== 'object') throw new Error('Ahli waris ke-' + (i + 1) + ' tidak valid.');
        if (!REL_SET.has(h.relation)) throw new Error('Hubungan ahli waris tidak dikenal: ' + String(h.relation || '(kosong)'));
        const count = Number(h.count);
        if (!Number.isInteger(count) || count <= 0) throw new Error('Jumlah ahli waris harus bilangan bulat positif.');
        const religionStatus = RELIGION_SET.has(h.religionStatus) ? h.religionStatus : 'unknown';
        const blockReason = BLOCKER_SET.has(h.blockReason) ? h.blockReason : undefined;
        return {
          id: uid(),
          name: cleanText(h.name, '', 120),
          relation: h.relation,
          gender: deriveGender(h.relation, h.gender),
          count,
          religionStatus,
          isAliveAtDeath: typeof h.isAliveAtDeath === 'boolean' ? h.isAliveAtDeath : undefined,
          isLegallyBlocked: cleanBool(h.isLegallyBlocked),
          blockReason,
          isMinor: cleanBool(h.isMinor),
          substituteFor: cleanText(h.substituteFor, '', 80),
        };
      }),
      special: {},
    };
    SPECIAL_KEYS.forEach((k) => { cleaned.special[k] = cleanBool(special[k]); });
    if (cleaned.heirs.some((h) => h.religionStatus === 'unknown' || h.isAliveAtDeath == null)) {
      cleaned.special.hasUncertainStatus = true;
    }
    if (cleaned.heirs.some((h) => h.isMinor)) cleaned.special.hasMinorHeir = true;
    return cleaned;
  }

  // Validasi ketat (pengganti Zod untuk MVP vanilla). Tidak mengeksekusi apa pun.
  function validateImport(obj) {
    if (!obj || typeof obj !== 'object') return { ok: false, error: 'File bukan objek JSON yang valid.' };
    if (!obj.schemaVersion) return { ok: false, error: 'File tidak menyertakan schemaVersion.' };
    if (!Array.isArray(obj.cases)) return { ok: false, error: 'File tidak memuat daftar "cases".' };
    const cleaned = [];
    let discardedResults = 0;
    try {
      for (const c of obj.cases) {
        if (!c || typeof c !== 'object') continue;
        if (!c.input || typeof c.input !== 'object') return { ok: false, error: 'Salah satu kasus tidak memiliki data input yang valid.' };
        if (c.result) discardedResults++;
        cleaned.push({
          id: uid(),
          title: cleanText(c.title, 'Kasus diimpor', 160),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          appVersion: '0.1.0',
          schemaVersion: String(c.schemaVersion || obj.schemaVersion),
          input: cleanInput(c.input),
          result: null,
        });
      }
    } catch (e) {
      return { ok: false, error: e.message || 'Data import tidak sesuai skema.' };
    }
    const schemaOld = String(obj.schemaVersion) !== SCHEMA_VERSION;
    return { ok: true, cases: cleaned, schemaOld, discardedResults };
  }

  function saveImportedCase(c) {
    return {
      ...c,
      id: uid(),
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      result: null,
    };
  }

  function importJSON(text) {
    let obj;
    try { obj = JSON.parse(text); }
    catch (e) { return { ok: false, error: 'File JSON tidak dapat dibaca (format rusak).' }; }
    const v = validateImport(obj);
    if (!v.ok) return v;
    const list = load();
    let added = 0;
    v.cases.forEach((c) => { list.push(saveImportedCase(c)); added++; });
    persist(list);
    return { ok: true, added, schemaOld: v.schemaOld, discardedResults: v.discardedResults };
  }

  HS.storage = {
    SCHEMA_VERSION, listCases, getCase, saveCase, renameCase, duplicateCase,
    deleteCase, clearAll, exportCase, exportAll, importJSON,
  };
})(typeof window !== 'undefined' ? window : globalThis);
