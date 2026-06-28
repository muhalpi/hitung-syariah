# Changelog

Semua perubahan penting pada Hitung Syariah didokumentasikan di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/),
dan proyek ini memakai [Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-06-28

### Added — Waris MVP
- Wizard 6 langkah: pengantar → harta → kewajiban/wasiat → ahli waris → kasus khusus → tinjau → hasil.
- Engine faraidh + KHI (`js/engine.js`): dzawil furudh, ashabah (2:1), **aul**, **rad**, **hajb** (rule table), kalalah, kasus **gharrawain/umariyyatain**.
- Pecahan rasional eksak (`js/fraction.js`) — tanpa floating point untuk bagian waris.
- Knowledge base terstruktur (`js/knowledge-base.js`): pasal KHI + dalil Al-Qur'an/Hadis dengan `verificationStatus`.
- Estate: harta pribadi & bersama, biaya jenazah/sakit, hutang, wasiat (cap 1/3).
- Dua mode: **KHI** (default) & **Faraidh klasik**, dengan perbedaan nyata pada ahli waris pengganti, wasiat wajibah, dan radd untuk suami/istri.
- Kasus kompleks (warning + rekomendasi): penghalang waris (Pasal 173), beda agama, ahli waris pengganti (Pasal 185), anak/ortu angkat → wasiat wajibah (Pasal 209), anak luar perkawinan, poligami, lahan < 2 ha.
- Hasil: ringkasan harta bersih, tabel bagian (pecahan + rupiah + per orang), ahli waris terhalang, penyesuaian aul/rad, langkah perhitungan dengan pasal KHI & dalil, warning, rekomendasi.
- Riwayat lokal (`js/storage.js`): simpan, ubah nama, duplikat, hapus, hapus semua, ekspor/impor JSON tervalidasi.
- 35 unit test deterministik (`js/engine.test.js`).
- Tema calm/edukatif + dark mode (`styles.css`), responsif mobile-first.

### Notes
- `SCHEMA_VERSION = '1'` (engine & storage).
- Sebagian entri knowledge base masih `needs_review` (mis. Pasal 177 & catatan SEMA, ahli waris pengganti) — perlu verifikasi ahli sebelum publikasi luas.

[0.1.0]: https://github.com/
