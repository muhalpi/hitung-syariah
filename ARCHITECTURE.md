# ARCHITECTURE.md — Hitung Syariah

Dokumen ini menjelaskan arsitektur internal, model data, dan algoritma engine
secara detail. Untuk aturan kontribusi/pengembangan lihat [`AGENTS.md`](AGENTS.md).

---

## 1. Prinsip arsitektur

- **Local-first**: tidak ada backend; data di `localStorage` (siap pindah IndexedDB).
- **Separation of concerns**: engine (logika hukum) terpisah total dari UI.
- **Deterministik & teruji**: engine berupa pure functions, dapat dijalankan di Node tanpa browser.
- **Akurat secara pecahan**: seluruh bagian waris memakai pecahan rasional eksak.
- **Transparan**: setiap hasil membawa jejak hukum (pasal KHI + dalil).

### Diagram modul

```
index.html
  └─ <script> urutan: fraction → knowledge-base → engine → storage → app
        fraction.js  (HS.Fraction)
            ▲
        knowledge-base.js (HS.KB)  ──► dipakai engine untuk referensi
            ▲
        engine.js  (HS.engine.calculateInheritance)  ◄── PURE, no DOM
            ▲
        storage.js (HS.storage)  ── localStorage + JSON import/export
            ▲
        app.js     (HS.app)  ── wizard, render, hanya memanggil engine
```

---

## 2. Model data

### Input — `InheritanceCaseInput`
```ts
mode: 'khi' | 'faraidh'
estate: {
  grossAssets, jointPropertyTotal?, deceasedShareOfJointProperty?,
  funeralCost, medicalCostBeforeDeath?, debts,
  wills: { desc, amount }[], grants: any[],
  willsApprovedByAllHeirs?: boolean, notes?: string
}
heirs: {
  id, name?, relation: HeirRelation, gender: 'male'|'female',
  count: number, religionStatus: 'muslim'|'non_muslim'|'unknown',
  isAliveAtDeath: boolean, isLegallyBlocked?: boolean,
  blockReason?: 'murder'|'attempted_murder'|'serious_abuse'|'false_accusation'|'different_religion',
  isMinor?, substituteFor?
}[]
special: { hasSubstitute?, isPolygamy?, hasIllegitimateChild?,
           hasDifferentReligionHeir?, hasMinorHeir?, farmlandUnder2ha?, hasUncertainStatus? }
```

`HeirRelation` (lihat `HEIR_META` di `engine.js`): `husband, wife, father, mother,
son, daughter, grandson_from_son, granddaughter_from_son, grandchild_substitute,
full_brother, full_sister, paternal_brother, paternal_sister, maternal_brother,
maternal_sister, grandfather, grandmother, uncle, adopted_child, adoptive_parent, other`.

### Output — `InheritanceCalculationResult`
```ts
estateSummary: { personalAssets, deceasedJointShare, tirkah, funeral, medical,
                 debts, deductions, afterDebts, willsTotal, maxWasiat,
                 effectiveWasiat, wasiatCapped, netEstate, jointNote }
eligibleHeirs:  { relation, label, count, name }[]
excludedHeirs:  { relation, label, count, name, excludedReason, reason }[]
shares:         ShareResult[]
adjustments:    { type:'aul'|'rad', description, basis }[]
legalSteps:     LegalExplanationStep[]
warnings:       { type, severity:'low'|'medium'|'high', message }[]
recommendations:{ title, text }[]
metadata:       { mode, appVersion, schemaVersion, calculatedAt,
                  totalFractionCheck, isComplete }
```

### `ShareResult`
```ts
{ relation, label, count, type:'fixed'|'ashabah'|'fixed+ashabah'|'fixed+rad',
  totalFraction: Fraction, perHeadFraction: Fraction,
  totalFractionStr, perHeadFractionStr,
  totalRupiah, perHeadRupiah,
  basis: string[]   // id pasal KHI
  dalil: string[]   // id dalil
  note, confidence:'high'|'medium'|'requires_review' }
```

### `LegalExplanationStep`
```ts
{ id, title, inputContext, result, calculation?,
  legalBasis: LegalBasisReference[], dalil?: DalilReference[],
  explanation, confidence }
```

---

## 3. Algoritma engine (rinci)

`calculateInheritance(caseInput)`:

1. **Estate** — `calculateEstate(estate)`:
   - `tirkah = personalAssets + deceasedJointShare` (default share = ½ harta bersama bila tak diisi).
   - `afterDebts = tirkah − funeral − medical − debts`.
   - `effectiveWasiat = min(Σwills, afterDebts/3)` kecuali `willsApprovedByAllHeirs` → tanpa cap. Set `wasiatCapped`.
   - `netEstate = afterDebts − effectiveWasiat`.

2. **Eligibility** — `determineEligibility(heirs, mode)`:
   - Keluarkan: `isLegallyBlocked` (Pasal 173), `isAliveAtDeath=false` (kecuali pengganti), `religionStatus='non_muslim'` (mode KHI).

3. **Flags** — hitung jumlah per relation; tentukan `hasDescendant`, `hasMaleDescendant`, `hasFemaleDescendantOnly`, `siblingsTotal`, `isKalalah`, `gharrawain`.

4. **Hajb** — `blockGroup(relation, reason)` memindahkan ahli waris terhalang ke `excludedHeirs (reason='hajb')`. Aturan utama:
   - Anak laki-laki → menghalangi cucu & semua saudara.
   - Keturunan/ayah/kakek → menghalangi saudara seibu.
   - Anak/cucu laki-laki atau ayah → menghalangi saudara kandung & seayah.
   - Saudara laki-laki kandung → menghalangi saudara seayah.
   - Ayah → menghalangi kakek; ibu → menghalangi nenek.

5. **Dzawil furudh** — hitung pecahan tetap: suami (½/¼), istri (¼/⅛, dibagi antar istri), ibu (⅓/⅙ atau ⅓-sisa pada gharrawain), ayah (⅙ dan/atau ashabah), nenek (⅙), anak perempuan (½/⅔ atau ashabah dengan anak laki-laki), cucu perempuan (½/⅔/⅙ takmilah), saudara (kalalah: seibu ⅙/⅓; kandung/seayah ½/⅔ atau ashabah).

6. **Ashabah** — `ashabahGroup` ditentukan per prioritas; `distributeAshabah` membagi sisa dengan rasio laki-laki:perempuan = 2:1.

7. **Aul** — bila `Σfixed > 1`: setiap bagian dibagi dengan total (proporsional), `ashabahGroup` dibatalkan, catat `adjustments`.

8. **Rad** — bila ada sisa & tanpa ashabah: dikembalikan ke dzawil furudh selain suami/istri, proporsional. **Mode KHI**: bila hanya ada suami/istri, sisa diberikan ke pasangan (radd, praktik PA). **Mode faraidh**: tidak ada radd untuk pasangan → warning Baitul Mal.

9. **Nominal** — `fracToRupiah(fraction, netEstate)` (pembulatan hanya di sini). Selisih pembulatan dilaporkan sebagai warning `low`.

10. **Penjelasan** — bangun `legalSteps` (dengan `legalBasis`/`dalil` dari `HS.KB`), `applyComplexCaseNotes` menambah warning & rekomendasi.

---

## 4. Knowledge base (`knowledge-base.js`)

Tiga peta: `KHI_ARTICLES`, `QURAN_DALIL`, `HADITH_DALIL`. Diakses via
`HS.KB.khi(id)`, `HS.KB.quran(id)`, `HS.KB.hadith(id)`. Setiap entri punya
`verificationStatus: 'verified' | 'needs_review'`. Engine mengubahnya menjadi
`LegalBasisReference` / `DalilReference` lewat `refKHI(id)` / `refDalil(id)`.

**Aturan:** seluruh teks hukum hanya di sini. Jangan menulis teks pasal/ayat di
engine atau UI.

---

## 5. Storage (`storage.js`)

`HS.storage`: `listCases, getCase, saveCase, renameCase, duplicateCase,
deleteCase, clearAll, exportCase, exportAll, importJSON`. Key
`hitung-syariah:cases:v1`. Import divalidasi (`validateImport`) — wajib
`schemaVersion` + array `cases` + setiap kasus punya `input`. Tidak pernah
mengeksekusi konten file.

**Migrasi ke IndexedDB**: pertahankan signature publik `HS.storage`; ganti
implementasi internal `load/persist` ke Dexie.

---

## 6. Titik ekstensi (extension points)

| Ingin… | Ubah |
|---|---|
| Menambah jenis ahli waris | `HEIR_META` + logika share/hajb di `engine.js` + `REL_GROUPS` di `app.js` |
| Menambah pasal/dalil | `knowledge-base.js` |
| Menambah kasus khusus (warning) | `applyComplexCaseNotes` di `engine.js` + toggle di `stepSpecial` (`app.js`) |
| Menambah langkah wizard | `STEPS` + `step*()` + `collectStep()` di `app.js` |
| PDF export | modul baru `js/pdf.js`; konsumsi `InheritanceCalculationResult` |
| Modul Zakat | modul `features/zakat` dengan pola engine/data/test sama |
