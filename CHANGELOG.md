# Changelog

Semua perubahan penting pada Hitung Syariah didokumentasikan di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/),
dan proyek ini memakai [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- Import JSON diperketat: input dinormalisasi, relation tidak dikenal ditolak, ID dari file impor diganti dengan ID lokal baru, dan `result` dari file impor dibuang agar hasil dihitung ulang dari `input`.
- Ahli waris pengganti (`grandchild_substitute`) kini ditandai eksplisit sebagai `unsupported_case` dan tidak memengaruhi pembagian otomatis sampai rule KHI Pasal 185 diimplementasikan penuh.
- Anak/orang tua angkat dikeluarkan dari ahli waris nasab dan ditandai sebagai konteks wasiat wajibah, bukan penerima bagian waris otomatis.
- Engine menegakkan invariant: ahli waris yang masih eligible harus menerima share, atau dipindahkan ke daftar tidak dihitung dengan warning `unsupported_case`.
- Warning otomatis ditambahkan untuk status agama belum pasti, status hidup belum pasti, dan ahli waris belum dewasa.
- Handler riwayat kasus tidak lagi memakai inline `onclick` dengan ID dinamis.

### Tests
- Unit test deterministik diperluas dari 35 menjadi 52 assertion, termasuk edge case import JSON, ahli waris pengganti, anak angkat, status belum pasti, dan invariant eligible-tanpa-share.

## [0.1.0] — 2026-06-28

### Added — Waris MVP
- Wizard 6 langkah: pengantar → harta → kewajiban/wasiat → ahli waris → kasus khusus → tinjau → hasil.
- Engine faraidh + KHI (`js/engine.js`): dzawil furudh, ashabah (2:1), **aul**, **rad**, **hajb** (rule table), kalalah, kasus **gharrawain/umariyyatain**.
- Pecahan rasional eksak (`js/fraction.js`) — tanpa floating point untuk bagian waris.
- Knowledge base terstruktur (`js/knowledge-base.js`): pasal KHI + dalil Al-Qur'an/Hadis dengan `verificationStatus`.
- Estate: harta pribadi & bersama, biaya jenazah/sakit, hutang, wasiat (cap 1/3).
- Dua mode: **KHI** (default) & **Faraidh klasik**, dengan catatan khusus pada ahli waris pengganti, wasiat wajibah, dan radd untuk suami/istri.
- Kasus kompleks (warning + rekomendasi): penghalang waris (Pasal 173), beda agama, ahli waris pengganti (Pasal 185 — belum dihitung otomatis), anak/ortu angkat → wasiat wajibah (Pasal 209), anak luar perkawinan, poligami, lahan < 2 ha.
- Hasil: ringkasan harta bersih, tabel bagian (pecahan + rupiah + per orang), ahli waris terhalang, penyesuaian aul/rad, langkah perhitungan dengan pasal KHI & dalil, warning, rekomendasi.
- Riwayat lokal (`js/storage.js`): simpan, ubah nama, duplikat, hapus, hapus semua, ekspor/impor JSON tervalidasi.
- 35 unit test deterministik (`js/engine.test.js`).
- Tema calm/edukatif + dark mode (`styles.css`), responsif mobile-first.

### Notes
- `SCHEMA_VERSION = '1'` (engine & storage).
- Sebagian entri knowledge base masih `needs_review` (mis. Pasal 177 & catatan SEMA, ahli waris pengganti) — perlu verifikasi ahli sebelum publikasi luas.

[0.1.0]: https://github.com/
