# AGENTS.md — Panduan AI untuk Melanjutkan Pengembangan Hitung Syariah

> File ini adalah **instruksi utama** bagi AI coding agent (atau developer) yang
> melanjutkan pengembangan **Hitung Syariah**. Baca seluruhnya sebelum menulis kode.
> Sumber kebenaran produk yang lebih lengkap ada di [`docs/PRODUCT-GUIDELINE.md`](docs/PRODUCT-GUIDELINE.md).

---

## 0. TL;DR — 12 aturan yang tidak boleh dilanggar

1. **Jangan campur engine kalkulasi dengan UI.** Rule hukum hanya di `js/engine.js` & `js/knowledge-base.js`.
2. **Jangan gunakan floating point** untuk bagian waris. Selalu pakai `HS.Fraction` (pecahan rasional).
3. **Jangan kirim data waris ke server.** Aplikasi `local-first`. Tidak ada backend tanpa alasan kuat.
4. **Setiap hasil wajib menyertakan dasar hukum** (pasal KHI) dan dalil bila relevan.
5. **Setiap rule waris wajib punya unit test** di `js/engine.test.js`.
6. **Jangan menghapus disclaimer** dan jangan membuat klaim hukum final.
7. **Jangan memasukkan data palsu sebagai sumber hukum.** Tandai yang belum dipastikan dengan `verificationStatus: 'needs_review'` / `confidence: 'requires_review'`.
8. **Engine = pure functions.** Tanpa global mutable state, tanpa akses DOM, bisa dites di Node.
9. **KHI adalah mode default.** Faraidh = penjelas/pembanding. Jika berbeda, KHI diutamakan.
10. **Nominal rupiah** hanya dibulatkan di layer presentasi (`fracToRupiah`/`fmtIDR`), bukan di engine.
11. **Import JSON harus divalidasi** dan tidak boleh mengeksekusi apa pun dari file.
12. **Jika ragu**, tampilkan warning di UI dan tandai rule `requires_review` — jangan menebak hukum.

---

## 1. Peta arsitektur (di mana menaruh apa)

| Kebutuhan | File | Catatan |
|---|---|---|
| Matematika pecahan | `js/fraction.js` | `HS.Fraction`: add/sub/mul/div/compare/toString. Tambah method di sini bila perlu. |
| Teks pasal KHI / dalil | `js/knowledge-base.js` | `HS.KB.KHI_ARTICLES`, `QURAN_DALIL`, `HADITH_DALIL`. **Semua teks hukum di sini.** |
| Logika pembagian waris | `js/engine.js` | `HS.engine.calculateInheritance(caseInput)`. Pure functions. |
| Penyimpanan & JSON | `js/storage.js` | `HS.storage`. localStorage; siap dipindah ke IndexedDB (Dexie). |
| UI / wizard / render | `js/app.js` | `HS.app`. **Hanya** memanggil engine & menampilkan hasil. Tidak ada rule hukum. |
| Tampilan | `styles.css` | CSS variables + dark mode. |
| Test | `js/engine.test.js` | Jalankan `node js/engine.test.js`. |

Semua modul memakai pola IIFE yang menempel ke `window.HS` (urutan `<script>` di
`index.html` penting: fraction → knowledge-base → engine → storage → app).

---

## 2. Kontrak engine (jangan ubah bentuk output tanpa migration note)

```
HS.engine.calculateInheritance(caseInput) -> InheritanceCalculationResult
```

**Input** (`caseInput`):
```js
{
  mode: 'khi' | 'faraidh',
  estate: { grossAssets, jointPropertyTotal?, deceasedShareOfJointProperty?,
            funeralCost, medicalCostBeforeDeath?, debts, wills:[{desc,amount}],
            grants:[], willsApprovedByAllHeirs?, notes? },
  heirs: [{ id, name?, relation, gender, count, religionStatus,
            isAliveAtDeath, isLegallyBlocked?, blockReason?, isMinor?, substituteFor? }],
  special: { hasSubstitute?, isPolygamy?, hasIllegitimateChild?,
             hasDifferentReligionHeir?, hasMinorHeir?, farmlandUnder2ha?, hasUncertainStatus? }
}
```

**Output** (`InheritanceCalculationResult`): `estateSummary`, `eligibleHeirs`,
`excludedHeirs`, `shares`, `adjustments`, `legalSteps`, `warnings`,
`recommendations`, `metadata`. Lihat `ARCHITECTURE.md` untuk field lengkap.

Mengubah struktur ini = **breaking change**. Naikkan `SCHEMA_VERSION` di
`engine.js` & `storage.js` dan tulis catatan migrasi di `CHANGELOG.md`.

---

## 3. Alur perhitungan engine (urutan wajib)

1. Validasi input.
2. Hitung harta waris bersih (`calculateEstate`): tirkah − biaya/hutang − wasiat (maks 1/3).
3. Tentukan ahli waris yang berhak (`determineEligibility`): saring penghalang (Pasal 173), non-Muslim (mode KHI), tidak hidup saat wafat.
4. Terapkan **hajb** (rule table `blockGroup`) — ahli waris terhalang ahli waris lebih dekat.
5. Hitung bagian **dzawil furudh** (bagian tetap) sebagai pecahan.
6. Tentukan **ashabah** (penerima sisa) berdasarkan prioritas.
7. Terapkan **aul** bila total > 1; **rad** bila ada sisa & tidak ada ashabah (kecuali suami/istri — kecuali mode KHI saat hanya pasangan).
8. Hitung nominal rupiah (`fracToRupiah`) — pembulatan hanya di sini.
9. Bangun `legalSteps` (dengan `legalBasis` + `dalil`), `warnings`, `recommendations`.

---

## 4. Cara menambah / mengubah rule waris (resep)

**Contoh: menambah penanganan kakek bersama saudara (jadd wal-ikhwah).**

1. **Tambah/lengkapi referensi hukum** di `js/knowledge-base.js`
   (`KHI_ARTICLES` atau `FARAIDH` entry) dengan `verificationStatus` yang jujur.
2. **Implementasikan logika** di `js/engine.js` di bagian yang tepat (mis. blok
   "Kakek" atau `applyComplexCaseNotes`). Gunakan `HS.Fraction`. Tandai
   `confidence: 'requires_review'` jika ada khilaf fikih.
3. **Tambahkan warning** bila kasus sensitif (`warnings.push({type, severity, message})`).
4. **Tulis unit test** di `js/engine.test.js` yang mengecek: pecahan bagian,
   ahli waris yang dikecualikan, adjustment (aul/rad), dan warning yang muncul.
5. Jalankan `node js/engine.test.js` sampai **semua hijau**.
6. UI biasanya tidak perlu diubah (otomatis merender `shares`/`legalSteps`/`warnings`).

**Jangan** menaruh logika hukum baru di `app.js`. **Jangan** membuat tabel hajb
ad-hoc di UI — perluas `blockGroup`/rule table di engine.

---

## 5. Aturan Testing (Definition of Done untuk logika)

Minimal kategori test (lihat PRODUCT-GUIDELINE §16). Setiap PR yang menyentuh
engine harus menambah/memperbarui test untuk kasus yang disentuh. Test wajib
memeriksa: **pecahan**, **nominal** (bila ada), **ahli waris dikecualikan**,
**adjustment aul/rad**, **legal step**, dan **warning**.

Jangan hanya snapshot UI — logika waris harus dites deterministik di engine.

---

## 6. Konvensi kode

- Bahasa UI & pesan: **Bahasa Indonesia**. Komentar kode boleh ID/EN.
- Vanilla JS (tanpa framework saat ini). Bila migrasi ke Next.js + TypeScript
  (lihat PRODUCT-GUIDELINE §4), pertahankan pemisahan modul yang sama dan
  port `engine.js`/`knowledge-base.js` lebih dulu beserta test-nya.
- Escape semua input user saat dirender (`esc()` di `app.js`). Jangan render HTML
  mentah dari file import.
- Money: integer rupiah secara internal; format dengan `Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'})`.

---

## 7. Bahasa & tone (copywriting)

- Tone: ramah, edukatif, tenang, tidak menghakimi, tetap hati-hati secara hukum.
- **Hindari** istilah finalistik: "pasti benar", "wajib diikuti", "tidak perlu konsultasi lagi".
- **Gunakan**: "Berdasarkan data yang dimasukkan…", "Dalam mode KHI Indonesia…", "Simulasi menunjukkan…", "Perlu validasi bila ada sengketa".

---

## 8. Backlog prioritas berikutnya (untuk AI penerus)

1. **PDF export** (roadmap 0.3): renderer terstruktur (bukan screenshot). Sertakan judul, tanggal, disclaimer, ringkasan input/harta, tabel bagian, langkah, dasar hukum, dalil, warning. Arsitektur hasil sudah stabil → aman dibuat.
2. **Mode perbandingan berdampingan** KHI vs faraidh dalam satu tampilan hasil.
3. **Pindah storage ke IndexedDB (Dexie)** untuk kapasitas lebih besar; pertahankan API `HS.storage`.
4. **Lengkapi kasus saudara seayah & jadd wal-ikhwah** (saat ini banyak `requires_review`).
5. **Validasi import dengan skema ketat** (port ke Zod bila pindah ke TS).
6. **Verifikasi knowledge base**: ubah `needs_review` → `verified` hanya setelah dicek ke teks resmi KHI/mushaf (lihat PRODUCT-GUIDELINE §32).
7. **Modul Zakat** (roadmap 0.4) sebagai `features/zakat` dengan pola engine/data/test yang sama.

---

## 9. Catatan hukum yang harus selalu dijaga

- Anak luar perkawinan: default KHI hanya mewaris dengan ibu & keluarga ibu — jangan auto-hubungkan ke ayah biologis.
- Ahli waris beda agama: dalam mode Islam/KHI tidak dimasukkan; jangan menyimpulkan hak wasiat wajibah beda agama tanpa modul yurisprudensi eksplisit.
- Tidak ada ahli waris → Baitul Mal **atas putusan Pengadilan Agama** (Pasal 191); jangan mengarahkan ke penerima tertentu tanpa putusan.
- Wasiat > 1/3 hanya sah bila disetujui semua ahli waris.

> Bila menambah kapabilitas hukum baru, perbarui juga README, ARCHITECTURE, dan CHANGELOG.
