# Hitung Syariah — Kalkulator Waris Islam (KHI + Faraidh)

> Aplikasi web **edukatif** untuk menyimulasikan pembagian waris Islam berdasarkan
> **Kompilasi Hukum Islam (KHI) Indonesia** dan kaidah **faraidh**, dengan langkah
> perhitungan transparan, dasar hukum (pasal KHI), dalil Al-Qur'an/Hadis, riwayat
> lokal, serta ekspor/impor JSON.

<p align="center"><i>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</i></p>

---

## ⚠️ Disclaimer

Hitung Syariah adalah **alat bantu edukatif, simulatif, dan dokumentatif**.
Hasil perhitungan **bukan** putusan Pengadilan Agama, fatwa, atau nasihat hukum
final. Untuk kasus nyata, sengketa, atau data yang belum pasti, konsultasikan
dengan Pengadilan Agama, ahli faraidh, notaris, atau penasihat hukum berwenang.

Aplikasi tidak berpura-pura menjadi hakim, mufti, advokat, atau otoritas final.
Aplikasi membantu **menghitung, menjelaskan, dan mendokumentasikan**.

---

## ✨ Fitur (Version 0.1 — Waris MVP)

- **Wizard 6 langkah**: pengantar → harta → kewajiban/wasiat → ahli waris → kasus khusus → tinjau → hasil.
- **Engine faraidh akurat**: bagian disimpan sebagai **pecahan rasional** (bukan floating point). Mendukung **aul**, **rad**, **ashabah** (2:1), **hajb** (rule table), **kalalah**, dan kasus **gharrawain/umariyyatain**.
- **Estate lengkap**: harta pribadi, harta bersama (gono-gini), biaya jenazah & sakit, hutang, **wasiat dibatasi 1/3** (kecuali disetujui semua ahli waris).
- **Dua mode hukum**: **KHI Indonesia** (default) dan **Faraidh klasik** — lihat [perbedaannya](#mode-khi-vs-faraidh-klasik).
- **Transparansi hukum**: setiap langkah hasil disertai **pasal KHI** dan **dalil Al-Qur'an/Hadis**, dengan tanda `perlu ditinjau` untuk kasus sensitif.
- **Kasus kompleks**: penghalang waris (KHI Pasal 173), beda agama, ahli waris pengganti (Pasal 185), anak/orang tua angkat → wasiat wajibah (Pasal 209), anak luar perkawinan, poligami, lahan < 2 ha.
- **Privasi (local-first)**: data **tidak dikirim ke server**. Riwayat disimpan di `localStorage` perangkat. Ekspor/impor JSON tervalidasi.

---

## 🚀 Menjalankan

Aplikasi murni **client-side** (HTML/CSS/JS vanilla), tanpa build step.

```bash
# 1) Klon repo
git clone https://github.com/<owner>/hitung-syariah.git
cd hitung-syariah

# 2) Buka langsung di browser, atau jalankan server statis sederhana:
python3 -m http.server 8080
# lalu buka http://localhost:8080
```

> Disarankan via server statis (bukan `file://`) agar font Google & fetch berjalan optimal.

---

## 🧪 Testing

Engine dapat diuji **tanpa browser** (pure functions). Test deterministik:

```bash
node js/engine.test.js
# Output: PASS: 35 FAIL: 0
```

Setiap rule waris **wajib** memiliki unit test. Lihat [`AGENTS.md`](AGENTS.md) §Testing.

---

## 🏗️ Arsitektur

Pemisahan ketat **engine ⟂ UI ⟂ data hukum ⟂ storage** (lihat [`ARCHITECTURE.md`](ARCHITECTURE.md)).

```
index.html              Shell aplikasi + disclaimer
styles.css              Tema (calm, edukatif) + dark mode
js/
  fraction.js           Pecahan rasional eksak (tanpa floating point)
  knowledge-base.js     Pasal KHI + dalil Al-Qur'an/Hadis terstruktur
  engine.js             Engine faraidh (pure functions): dzawil furudh, aul,
                        rad, ashabah, hajb, gharrawain, estate, kasus kompleks
  storage.js            Riwayat lokal + ekspor/impor JSON tervalidasi
  app.js                Wizard, render hasil, riwayat, ekspor/impor (UI saja)
  engine.test.js        Unit test deterministik (Node)
docs/
  PRODUCT-GUIDELINE.md  Guideline produk asli (sumber kebenaran)
AGENTS.md               Panduan untuk AI/developer melanjutkan pengembangan
ARCHITECTURE.md         Detail arsitektur & algoritma engine
CHANGELOG.md            Riwayat versi
```

**Aturan emas:** rule hukum **hanya** boleh berada di `js/engine.js` dan
`js/knowledge-base.js`. UI (`app.js`) hanya memanggil engine & menampilkan hasil.

---

## ⚖️ Mode KHI vs Faraidh klasik

Untuk **kasus dasar**, kedua mode memberi hasil **sama** (Pasal 176–182 KHI
mengadopsi faraidh). Perbedaan muncul pada institusi khusus:

| Hal | KHI Indonesia | Faraidh klasik |
|---|---|---|
| Ahli waris pengganti | Dikenal (Pasal 185) | Tidak dikenal |
| Wasiat wajibah anak/ortu angkat | Wajib, maks 1/3 (Pasal 209) | Tidak ada kewajiban |
| Sisa harta saat hanya ada suami/istri | Diberikan ke pasangan (radd, praktik PA) | Tidak ada radd → Baitul Mal |

---

## 🗺️ Roadmap

- **0.1 Waris MVP** ✅ — wizard, engine, KHI+dalil, hasil pecahan & nominal, riwayat lokal, ekspor/impor JSON, unit test.
- **0.2 Hardening** — tambah test case, mode edukasi istilah, validasi kasus tak lengkap, perbandingan KHI vs faraidh berdampingan.
- **0.3 PDF Export** — laporan keluarga terstruktur (judul, tanggal, disclaimer, ringkasan, tabel, langkah, dasar hukum, dalil).
- **0.4 Zakat** — zakat maal, penghasilan, perdagangan, emas/perak.
- **0.5 Syariah Toolkit** — wasiat simulator, hibah planner, wakaf guide.

---

## 📚 Sumber rujukan

Kompilasi Hukum Islam (KHI) Buku II Hukum Kewarisan; Al-Qur'an Surah An-Nisa
ayat 11, 12, 176; hadis tentang faraidh. Ringkasan hukum dalam aplikasi bersifat
**edukatif** dan perlu diverifikasi terhadap sumber resmi (lihat
[`docs/PRODUCT-GUIDELINE.md`](docs/PRODUCT-GUIDELINE.md) §32 Notes for Future Legal Review).

## 📄 Lisensi

[MIT](LICENSE).
