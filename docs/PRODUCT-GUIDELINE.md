# Hitung Syariah — AI Coding Guideline

> Guideline ini dipakai sebagai instruksi utama untuk AI coding agent ketika membangun aplikasi **Hitung Syariah**.
>
> Fokus awal aplikasi adalah kalkulator waris Islam berbasis **Kompilasi Hukum Islam Indonesia (KHI) + faraidh**, dengan dasar hukum, dalil Al-Qur'an/Hadis, riwayat lokal, serta arsitektur yang siap dikembangkan ke modul syariah lain seperti zakat, wasiat, hibah, dan wakaf.

---

## 1. Project Identity

### Nama aplikasi
**Hitung Syariah**

### Deskripsi singkat
Hitung Syariah adalah aplikasi web edukatif untuk membantu pengguna menghitung pembagian waris Islam berdasarkan KHI Indonesia dan kaidah faraidh, disertai penjelasan langkah demi langkah, dasar hukum, dalil, catatan kasus khusus, dan riwayat perhitungan yang disimpan secara lokal di perangkat pengguna.

### Positioning
Aplikasi ini bukan pengganti putusan Pengadilan Agama, fatwa ulama, notaris, advokat, atau ahli waris yang berwenang. Aplikasi ini adalah alat bantu edukatif, simulatif, dan dokumentatif.

### Prinsip utama produk
1. Akurat secara hitung.
2. Transparan secara dasar hukum.
3. Hati-hati secara bahasa hukum.
4. Ramah untuk pengguna awam.
5. Aman secara privasi.
6. Modular agar bisa dikembangkan ke zakat dan modul syariah lain.

---

## 2. Legal and Religious Scope

### Scope hukum utama
Aplikasi menggunakan dua lapisan rujukan:

1. **KHI Indonesia** sebagai acuan hukum positif utama untuk pengguna Muslim di Indonesia.
2. **Faraidh klasik** sebagai engine konseptual, penjelasan syar'i, dan pelengkap pada bagian-bagian yang membutuhkan dasar ilmu waris Islam.

### Prinsip prioritas sumber
Ketika terjadi perbedaan antara implementasi KHI dan pendapat fikih/faraidh klasik:

1. Default mode aplikasi adalah **KHI Indonesia**.
2. Faraidh digunakan sebagai **penjelas dan pembanding**, bukan untuk meniadakan KHI.
3. Jika ada kasus yang berpotensi sengketa atau multi-tafsir, aplikasi harus menampilkan catatan:
   > Kasus ini memiliki kemungkinan penafsiran hukum atau praktik peradilan yang berbeda. Hasil ini bersifat simulatif dan perlu divalidasi oleh ahli waris, ahli faraidh, Pengadilan Agama, advokat, notaris, atau pihak berwenang.

### Disclaimer wajib
Setiap halaman hasil, export, dan halaman edukasi hukum harus memiliki disclaimer:

> Hasil perhitungan ini bersifat edukatif dan simulatif. Untuk pembagian resmi, sengketa, atau kondisi keluarga yang kompleks, konsultasikan dengan Pengadilan Agama, ahli faraidh, advokat, notaris, atau pihak berwenang.

### Jangan lakukan
AI coding agent tidak boleh:

- Menampilkan hasil sebagai putusan hukum final.
- Menulis “pasti sah”, “pasti benar”, atau “wajib diikuti” untuk kasus yang berpotensi sengketa.
- Mengubah ketentuan waris tanpa sumber dan test case.
- Menghapus disclaimer.
- Menggunakan sumber hukum yang tidak terverifikasi untuk logika kalkulasi.

---

## 3. Source Baseline

### KHI — Buku II Hukum Kewarisan
Gunakan Buku II KHI Pasal 171–214 sebagai baseline hukum waris Indonesia.

Topik utama:

- Pasal 171: definisi hukum kewarisan, pewaris, ahli waris, harta peninggalan, harta waris, wasiat, hibah, anak angkat, Baitul Mal.
- Pasal 172: penentuan agama Islam ahli waris.
- Pasal 173: penghalang waris karena membunuh/mencoba membunuh/menganiaya berat pewaris atau memfitnah pewaris.
- Pasal 174: kelompok ahli waris.
- Pasal 175: kewajiban ahli waris terhadap pewaris.
- Pasal 176–182: bagian ahli waris utama.
- Pasal 183: perdamaian para ahli waris setelah mengetahui bagian masing-masing.
- Pasal 184: wali untuk ahli waris belum dewasa/tidak mampu.
- Pasal 185: ahli waris pengganti.
- Pasal 186: anak luar perkawinan.
- Pasal 187–188: pelaksanaan dan permintaan pembagian waris.
- Pasal 189: lahan pertanian kurang dari 2 hektar.
- Pasal 190: pewaris beristri lebih dari satu.
- Pasal 191: tidak ada ahli waris atau ahli waris tidak diketahui.
- Pasal 192: aul.
- Pasal 193: rad.
- Pasal 194–209: wasiat dan wasiat wajibah.
- Pasal 210–214: hibah.

### Dalil Al-Qur'an minimal
Knowledge base dalil minimal harus mendukung:

- QS. An-Nisa 4:7 — hak bagian laki-laki dan perempuan dari peninggalan orang tua/kerabat.
- QS. An-Nisa 4:11 — bagian anak, orang tua, dan prinsip 2:1 anak laki-laki terhadap anak perempuan.
- QS. An-Nisa 4:12 — bagian suami, istri, dan saudara seibu.
- QS. An-Nisa 4:176 — kalalah dan saudara kandung/seayah.

### Dalil Hadis minimal
Knowledge base hadis minimal harus mendukung:

- Sahih al-Bukhari 6732 / Sahih Muslim 1615: berikan bagian faraidh kepada yang berhak, sisanya untuk kerabat laki-laki terdekat.
- Sahih al-Bukhari 6764: Muslim tidak mewarisi non-Muslim dan non-Muslim tidak mewarisi Muslim.
- Sunan Abi Dawud 2870 dan/atau riwayat sejenis: tidak ada wasiat untuk ahli waris, kecuali dalam konteks yang sesuai dengan ketentuan persetujuan ahli waris.

### Aturan penggunaan dalil
1. Dalil tidak boleh ditempel acak di UI.
2. Dalil harus terhubung dengan rule tertentu.
3. Jika dalil belum diverifikasi, tampilkan sebagai “perlu verifikasi” dan jangan gunakan sebagai rule kalkulasi.
4. Kutipan panjang ayat/hadis tidak wajib ditampilkan penuh. Cukup tampilkan rujukan, ringkasan makna, dan sumber.
5. Untuk teks terjemahan Al-Qur'an, gunakan sumber resmi/tepercaya seperti Qur'an Kemenag.
6. Untuk hadis, gunakan kitab, nomor hadis, status, dan sumber tepercaya.

---

## 4. Tech Stack

### Framework
- Next.js App Router
- TypeScript
- React

### Styling dan UI
- Tailwind CSS
- shadcn/ui
- lucide-react untuk icon
- Framer Motion optional, hanya bila tidak mengganggu performa

### Validasi dan form
- Zod
- React Hook Form

### Perhitungan pecahan
Gunakan library pecahan, bukan floating point biasa.

Rekomendasi:
- `fraction.js` untuk kalkulasi bagian waris.
- `decimal.js` untuk nominal rupiah jika diperlukan.

Aturan:
- Jangan gunakan `number` floating point untuk pembagian waris final.
- Semua bagian hukum harus disimpan sebagai pecahan rasional.
- Nominal rupiah boleh dibulatkan hanya di layer presentasi, bukan di engine.

### Penyimpanan lokal
- IndexedDB via Dexie atau localForage.
- localStorage hanya untuk preferensi ringan.

### Testing
- Vitest
- React Testing Library
- Playwright optional untuk end-to-end

### Deployment
- Vercel

### Backend
Versi awal tidak membutuhkan backend.

Gunakan backend hanya jika nanti ada kebutuhan eksplisit seperti akun, sinkronisasi multi-device, atau database publik. Default-nya: **local-first**.

---

## 5. Architecture Rules

### Struktur folder utama

```txt
/src
  /app
    /(marketing)
    /(calculator)
    /waris
    /zakat
    /layout.tsx
    /page.tsx

  /components
    /ui
    /layout
    /shared

  /features
    /inheritance
      /components
      /engine
      /schemas
      /data
      /hooks
      /types
      /tests

    /zakat
      /components
      /engine
      /schemas
      /data
      /hooks
      /types
      /tests

  /lib
    /fractions
    /format
    /validation
    /constants

  /storage
    /db
    /repositories
    /import-export

  /types
```

### Rule penting
1. Jangan campur engine kalkulasi dengan UI.
2. Jangan letakkan rule hukum di komponen React.
3. Semua rule hukum harus berada di `/features/inheritance/engine` atau `/features/inheritance/data`.
4. Semua teks dasar hukum harus berada di knowledge base terstruktur.
5. UI hanya memanggil engine dan menampilkan hasil.
6. Engine harus bisa dites tanpa browser.

---

## 6. Domain Model

### Core entities
Gunakan tipe eksplisit.

```ts
export type Gender = 'male' | 'female';

export type ReligionStatus = 'muslim' | 'non_muslim' | 'unknown';

export type MarriageStatus =
  | 'never_married'
  | 'married'
  | 'divorced'
  | 'widowed'
  | 'polygamy';

export type HeirRelation =
  | 'husband'
  | 'wife'
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'grandson_from_son'
  | 'granddaughter_from_son'
  | 'grandchild_substitute'
  | 'full_brother'
  | 'full_sister'
  | 'paternal_brother'
  | 'paternal_sister'
  | 'maternal_brother'
  | 'maternal_sister'
  | 'grandfather'
  | 'grandmother'
  | 'uncle'
  | 'adopted_child'
  | 'adoptive_parent'
  | 'other';
```

### Estate input

```ts
export interface EstateInput {
  grossAssets: MoneyAmount;
  jointPropertyTotal?: MoneyAmount;
  deceasedShareOfJointProperty?: MoneyAmount;
  funeralCost: MoneyAmount;
  debts: MoneyAmount;
  medicalCostBeforeDeath?: MoneyAmount;
  wills: WillInput[];
  grants: GrantInput[];
  notes?: string;
}
```

### Heir input

```ts
export interface HeirInput {
  id: string;
  name?: string;
  relation: HeirRelation;
  gender: Gender;
  count: number;
  religionStatus: ReligionStatus;
  isAliveAtDeath: boolean;
  isLegallyBlocked?: boolean;
  blockReason?: 'murder' | 'attempted_murder' | 'serious_abuse' | 'false_accusation' | 'different_religion' | 'unknown';
  isMinor?: boolean;
  isDisabledOrLegallyIncompetent?: boolean;
  substituteFor?: string;
}
```

### Calculation result

```ts
export interface InheritanceCalculationResult {
  estateSummary: EstateSummary;
  eligibleHeirs: EligibleHeirResult[];
  excludedHeirs: ExcludedHeirResult[];
  shares: ShareResult[];
  adjustments: AdjustmentResult[];
  legalSteps: LegalExplanationStep[];
  warnings: CalculationWarning[];
  recommendations: Recommendation[];
  metadata: CalculationMetadata;
}
```

---

## 7. Calculation Flow

Engine harus mengikuti alur ini:

1. Validasi input.
2. Tentukan harta peninggalan.
3. Tentukan harta waris bersih.
4. Validasi biaya jenazah, hutang, wasiat, dan hibah.
5. Identifikasi ahli waris yang memenuhi syarat.
6. Identifikasi ahli waris yang terhalang.
7. Tentukan ahli waris pengganti bila ada.
8. Hitung bagian dzawil furudh.
9. Tentukan ashabah.
10. Terapkan hajb/terhalang oleh ahli waris lain.
11. Terapkan aul bila pembilang lebih besar dari penyebut.
12. Terapkan rad bila ada sisa dan tidak ada ashabah.
13. Terapkan aturan khusus KHI seperti wasiat wajibah, ahli waris pengganti, anak angkat, harta bersama, dan poligami.
14. Hasilkan output pecahan dan nominal.
15. Hasilkan langkah perhitungan dengan dasar hukum dan dalil.
16. Hasilkan warning dan rekomendasi.

---

## 8. Estate Calculation Rules

### Harta waris bersih
Harta waris bersih dihitung setelah memperhatikan:

1. Harta bawaan pewaris.
2. Bagian pewaris dari harta bersama.
3. Biaya sakit sampai meninggal.
4. Biaya pengurusan jenazah.
5. Hutang pewaris.
6. Wasiat yang sah.
7. Kewajiban lain yang sah.

### Harta bersama
Untuk kasus pasangan:

- Pisahkan dulu harta bersama/gono-gini.
- Bagian pasangan yang masih hidup bukan bagian waris, melainkan hak atas harta bersama.
- Yang menjadi objek waris adalah bagian pewaris dari harta bersama + harta pribadi pewaris.

### Poligami
Untuk pewaris laki-laki yang memiliki lebih dari satu istri:

- Masing-masing istri berhak atas bagian harta bersama dari rumah tangganya masing-masing.
- Bagian waris istri sebagai janda dibagi bersama sesuai ketentuan bagian janda.
- Engine harus menampilkan catatan bahwa perhitungan harta bersama setiap perkawinan dapat berbeda dan perlu input terpisah.

---

## 9. Heir Eligibility Rules

Ahli waris harus memenuhi syarat:

1. Memiliki hubungan darah atau hubungan perkawinan dengan pewaris.
2. Beragama Islam sesuai ketentuan KHI.
3. Hidup pada saat pewaris meninggal, kecuali kasus ahli waris pengganti.
4. Tidak terhalang secara hukum.

### Penghalang waris
Ahli waris harus dikeluarkan dari pembagian bila:

- Terbukti membunuh pewaris.
- Terbukti mencoba membunuh pewaris.
- Terbukti menganiaya berat pewaris.
- Terbukti memfitnah pewaris dengan tuduhan kejahatan berat.
- Berbeda agama, dalam mode hukum Islam default.
- Tidak memenuhi syarat hidup pada saat pewaris meninggal, kecuali ahli waris pengganti.

Jika status penghalang belum pasti, tampilkan warning dan jangan otomatis menghapus ahli waris kecuali user memilih status tersebut secara eksplisit.

---

## 10. Share Rules — KHI and Faraidh

### Anak
- Satu anak perempuan tanpa anak laki-laki: 1/2.
- Dua atau lebih anak perempuan tanpa anak laki-laki: bersama-sama 2/3.
- Anak laki-laki bersama anak perempuan: anak laki-laki mendapat dua kali bagian anak perempuan.

### Ayah
- Bila ada anak: 1/6.
- Bila tidak ada anak: sesuai ketentuan KHI dan konteks ahli waris lain.
- Untuk kasus ayah + ibu + suami/istri tanpa anak, engine harus memperhatikan catatan SEMA terkait interpretasi Pasal 177 bila digunakan dalam mode KHI.

### Ibu
- 1/6 bila ada anak atau ada dua saudara atau lebih.
- 1/3 bila tidak ada anak dan tidak ada dua saudara atau lebih.
- 1/3 dari sisa setelah bagian suami/istri bila bersama ayah dalam kasus tertentu.

### Suami
- 1/2 bila pewaris tidak meninggalkan anak.
- 1/4 bila pewaris meninggalkan anak.

### Istri/Janda
- 1/4 bila pewaris tidak meninggalkan anak.
- 1/8 bila pewaris meninggalkan anak.
- Jika istri lebih dari satu, bagian 1/4 atau 1/8 tersebut dibagi bersama di antara para istri.

### Saudara seibu
- Jika pewaris tidak meninggalkan anak dan ayah, satu saudara seibu mendapat 1/6.
- Jika dua atau lebih, bersama-sama mendapat 1/3.

### Saudara kandung/seayah
- Jika pewaris tidak meninggalkan anak dan ayah, satu saudara perempuan kandung/seayah mendapat 1/2.
- Dua atau lebih saudara perempuan kandung/seayah mendapat 2/3.
- Jika bersama saudara laki-laki kandung/seayah, laki-laki mendapat dua kali bagian perempuan.

### Aul
Jika total bagian dzawil furudh melebihi 1, gunakan aul.

### Rad
Jika total bagian dzawil furudh kurang dari 1 dan tidak ada ashabah, gunakan rad sesuai hak masing-masing ahli waris yang berhak menerima rad.

### Ashabah
Gunakan prinsip faraidh:

- Ashabah menerima sisa setelah dzawil furudh.
- Anak laki-laki dapat menjadi ashabah bersama anak perempuan.
- Saudara laki-laki dapat menjadi ashabah dalam kasus kalalah sesuai syarat.
- Implementasikan hajb sebelum memberikan sisa.

### Hajb
Engine harus memiliki sistem hajb untuk menentukan ahli waris yang tertutup oleh ahli waris yang lebih dekat.

Jangan implementasikan hajb secara ad hoc di UI. Buat rule table.

---

## 11. Complex Case Rules

### Ahli waris pengganti
Dukung ahli waris pengganti sesuai KHI.

Aturan umum:

- Jika ahli waris meninggal lebih dahulu daripada pewaris, kedudukannya dapat digantikan oleh anaknya.
- Bagian ahli waris pengganti tidak boleh melebihi bagian ahli waris sederajat dengan yang diganti.
- Engine harus meminta input siapa yang digantikan.
- Engine harus menampilkan catatan khusus karena ahli waris pengganti dapat menjadi area praktik hukum yang sensitif.

### Anak angkat
Anak angkat tidak otomatis menjadi ahli waris nasab.

Aturan:

- Jika anak angkat menerima wasiat, proses sesuai wasiat.
- Jika tidak menerima wasiat, pertimbangkan wasiat wajibah maksimal 1/3 sesuai KHI.
- Tampilkan bahwa ini adalah wasiat wajibah, bukan bagian waris nasab.

### Orang tua angkat
Orang tua angkat tidak otomatis menjadi ahli waris nasab.

Aturan:

- Jika tidak menerima wasiat dari anak angkat, pertimbangkan wasiat wajibah maksimal 1/3 sesuai KHI.

### Wasiat
Aturan:

- Wasiat maksimal 1/3 harta warisan kecuali semua ahli waris menyetujui.
- Wasiat kepada ahli waris berlaku bila disetujui semua ahli waris.
- Jika melebihi 1/3 dan tidak disetujui semua ahli waris, hanya jalankan sampai 1/3.
- Tampilkan warning jika penerima wasiat adalah ahli waris.

### Hibah
Aturan:

- Hibah harus dibedakan dari waris dan wasiat.
- Hibah orang tua kepada anak dapat diperhitungkan sebagai warisan.
- Hibah saat pemberi hibah sakit dekat kematian harus mendapat persetujuan ahli waris.
- Jika user memasukkan hibah, tampilkan sebagai catatan dan minta status: sudah sah, perlu diperhitungkan, atau disengketakan.

### Anak luar perkawinan
Aturan default KHI:

- Anak yang lahir di luar perkawinan hanya memiliki hubungan saling mewaris dengan ibu dan keluarga pihak ibu.
- Jangan hubungkan otomatis ke ayah biologis dalam mode KHI default.
- Tampilkan catatan hukum sensitif dan rekomendasikan validasi ahli.

### Ahli waris beda agama
Aturan default:

- Ahli waris non-Muslim tidak dimasukkan sebagai ahli waris dalam mode hukum Islam.
- Tampilkan catatan dalil dan KHI.
- Jangan membuat kesimpulan tentang hak wasiat wajibah beda agama kecuali modul yurisprudensi sudah ditambahkan secara eksplisit.

### Ahli waris belum dewasa
Aturan:

- Hitung bagiannya normal bila memenuhi syarat ahli waris.
- Tambahkan rekomendasi bahwa haknya perlu diwakili/dijaga oleh wali sesuai ketentuan hukum.

### Tidak ada ahli waris
Aturan:

- Jika tidak ada ahli waris atau ahli waris tidak diketahui, tampilkan catatan bahwa berdasarkan KHI harta dapat diserahkan kepada Baitul Mal atas putusan Pengadilan Agama.
- Jangan langsung mengarahkan harta ke penerima tertentu tanpa putusan.

### Tanah pertanian kurang dari 2 hektar
Aturan:

- Jika aset berupa lahan pertanian dan luasnya kurang dari 2 hektar, tampilkan rekomendasi agar kesatuannya dipertahankan bila memungkinkan.
- Bila tidak memungkinkan, tampilkan opsi kompensasi nilai antar ahli waris.

### Kesepakatan damai ahli waris
Aturan:

- Aplikasi boleh menyediakan mode “pembagian berdasarkan kesepakatan”.
- Namun, mode ini hanya boleh aktif setelah aplikasi menampilkan bagian hukum masing-masing.
- Tampilkan catatan bahwa perdamaian dilakukan setelah masing-masing mengetahui bagiannya.

---

## 12. Legal Explanation System

Setiap langkah hitung harus menghasilkan objek penjelasan.

```ts
export interface LegalExplanationStep {
  id: string;
  title: string;
  inputContext: string;
  result: string;
  calculation?: string;
  legalBasis: LegalBasisReference[];
  dalil?: DalilReference[];
  explanation: string;
  confidence: 'high' | 'medium' | 'requires_review';
}
```

### Format legal basis

```ts
export interface LegalBasisReference {
  source: 'KHI' | 'SEMA' | 'FARAIDH' | 'OTHER';
  article?: string;
  title?: string;
  textSummary: string;
  exactText?: string;
  verificationStatus: 'verified' | 'needs_review';
}
```

### Format dalil

```ts
export interface DalilReference {
  source: 'QURAN' | 'HADITH';
  reference: string;
  arabicText?: string;
  translationSummary: string;
  sourceName: string;
  verificationStatus: 'verified' | 'needs_review';
}
```

### Contoh step

```ts
{
  id: 'widow-with-children-share',
  title: 'Menentukan bagian janda karena pewaris memiliki anak',
  inputContext: 'Pewaris meninggalkan janda dan anak.',
  result: 'Janda mendapat 1/8 bagian dari harta waris bersih.',
  calculation: 'Bagian janda = 1/8',
  legalBasis: [
    {
      source: 'KHI',
      article: 'Pasal 180',
      textSummary: 'Janda mendapat 1/4 bila pewaris tidak meninggalkan anak dan 1/8 bila pewaris meninggalkan anak.',
      verificationStatus: 'verified'
    }
  ],
  dalil: [
    {
      source: 'QURAN',
      reference: 'QS. An-Nisa 4:12',
      translationSummary: 'Ayat ini memuat bagian pasangan dalam waris, termasuk bagian istri ketika pewaris memiliki anak.',
      sourceName: 'Qur\'an Kemenag',
      verificationStatus: 'verified'
    }
  ],
  explanation: 'Karena pewaris memiliki anak, bagian janda mengikuti bagian 1/8.',
  confidence: 'high'
}
```

---

## 13. UI/UX Guidelines

### Tone
Gunakan tone:

- Ramah.
- Edukatif.
- Tenang.
- Tidak menghakimi.
- Tidak terlalu kaku.
- Tetap hati-hati secara hukum.

### Jangan gunakan tone
- Menggurui.
- Menakut-nakuti.
- Terlalu teknis tanpa penjelasan.
- Memberi kesan sebagai pengadilan atau fatwa final.

### Alur utama UI
Gunakan wizard bertahap:

1. Selamat datang dan disclaimer.
2. Data pewaris.
3. Data harta.
4. Biaya, hutang, wasiat, hibah.
5. Data ahli waris.
6. Kasus khusus.
7. Review input.
8. Hasil pembagian.
9. Dasar hukum dan dalil.
10. Rekomendasi dan simpan/export.

### Tampilan hasil
Halaman hasil minimal memiliki:

1. Ringkasan harta waris bersih.
2. Tabel ahli waris dan bagian.
3. Pecahan bagian.
4. Nominal bagian.
5. Ahli waris yang terhalang dan alasannya.
6. Penyesuaian aul/rad bila ada.
7. Langkah perhitungan.
8. Dasar hukum KHI per langkah.
9. Dalil Al-Qur'an/Hadis per langkah bila relevan.
10. Warning dan rekomendasi.
11. Tombol simpan lokal.
12. Tombol export JSON.
13. Tombol import JSON.
14. Placeholder export PDF untuk versi berikutnya.

### UX untuk kasus belum didukung
Jika kasus belum didukung engine:

- Jangan berikan hasil palsu.
- Tampilkan:
  > Kasus ini belum didukung penuh oleh engine Hitung Syariah. Data Anda tetap dapat disimpan, tetapi hasil perhitungan perlu divalidasi secara manual.

---

## 14. Local Storage and Privacy

### Prinsip privasi
Data waris adalah data keluarga yang sangat sensitif.

Default aplikasi:

- Tidak ada akun.
- Tidak ada server database.
- Tidak mengirim data waris ke server.
- Riwayat disimpan lokal di perangkat pengguna.
- User bisa export/import JSON sendiri.

### IndexedDB schema

```ts
interface SavedCalculation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
  schemaVersion: string;
  input: InheritanceCaseInput;
  result?: InheritanceCalculationResult;
  tags?: string[];
}
```

### Fitur lokal wajib
1. Simpan kasus.
2. Edit nama kasus.
3. Duplikasi kasus.
4. Hapus kasus.
5. Hapus semua data lokal.
6. Export satu kasus ke JSON.
7. Export semua kasus ke JSON.
8. Import JSON.
9. Validasi schema saat import.
10. Tampilkan warning jika schema lama.

### Import/export JSON
Aturan:

- JSON harus menyertakan `schemaVersion`.
- Import harus divalidasi dengan Zod.
- Jangan langsung percaya file import.
- Jika import gagal, tampilkan error ramah.
- Jangan menjalankan script dari file import.

---

## 15. Future PDF Export

Export PDF bukan fitur wajib versi awal, tetapi arsitektur harus siap.

Ketika nanti dibuat, PDF harus berisi:

1. Judul kasus.
2. Tanggal perhitungan.
3. Disclaimer.
4. Ringkasan input.
5. Ringkasan harta waris.
6. Tabel bagian ahli waris.
7. Langkah perhitungan.
8. Dasar hukum.
9. Dalil.
10. Warning dan rekomendasi.

Jangan membuat PDF sebagai screenshot kasar bila hasilnya tidak rapi. Gunakan renderer terstruktur.

---

## 16. Testing Rules

### Semua rule waris wajib punya test
Setiap rule hukum/kalkulasi harus memiliki unit test.

### Minimal test cases
Buat test minimal untuk:

1. Suami + anak.
2. Istri + anak.
3. Ayah + ibu + anak.
4. Anak laki-laki + anak perempuan.
5. Satu anak perempuan tanpa anak laki-laki.
6. Dua anak perempuan tanpa anak laki-laki.
7. Ibu dengan dua saudara atau lebih.
8. Saudara seibu dalam kasus kalalah.
9. Saudara kandung/seayah dalam kasus kalalah.
10. Kasus aul.
11. Kasus rad.
12. Ahli waris pengganti.
13. Anak angkat dan wasiat wajibah.
14. Orang tua angkat dan wasiat wajibah.
15. Wasiat lebih dari 1/3.
16. Wasiat kepada ahli waris tanpa persetujuan semua ahli waris.
17. Hibah orang tua kepada anak.
18. Anak luar perkawinan.
19. Ahli waris beda agama.
20. Ahli waris terhalang karena membunuh pewaris.
21. Pewaris beristri lebih dari satu.
22. Harta bersama sebelum harta waris.
23. Tidak ada ahli waris.
24. Tanah pertanian kurang dari 2 hektar.

### Test output
Setiap test harus memeriksa:

- Pecahan bagian.
- Nominal jika ada.
- Ahli waris yang dikecualikan.
- Adjustment aul/rad.
- Legal explanation step.
- Warning yang muncul.

### Snapshot caution
Jangan hanya mengandalkan snapshot UI. Logika waris harus dites secara deterministik di engine.

---

## 17. Calculation Precision Rules

### Pecahan
Simpan bagian sebagai pecahan:

```ts
interface FractionValue {
  numerator: number;
  denominator: number;
}
```

atau gunakan wrapper dari `fraction.js`.

### Nominal uang
- Input uang boleh number/string, tetapi parsing harus aman.
- Simpan nominal internal sebagai integer rupiah bila memungkinkan.
- Jangan simpan nominal uang sebagai floating decimal.
- Pembulatan nominal hanya di display.
- Jika ada sisa pembulatan rupiah, tampilkan catatan.

### Formatting rupiah
Gunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`.

---

## 18. Component Guidelines

### Komponen utama

- `InheritanceWizard`
- `EstateInputStep`
- `HeirInputStep`
- `SpecialCasesStep`
- `ReviewInputStep`
- `CalculationResultView`
- `LegalStepsAccordion`
- `DalilCard`
- `WarningPanel`
- `RecommendationsPanel`
- `SavedCasesList`
- `JsonImportExportPanel`

### UI rules
1. Gunakan form step-by-step.
2. Jangan menampilkan terlalu banyak istilah teknis sekaligus.
3. Beri tooltip untuk istilah seperti tirkah, ashabah, aul, rad, hajb, dzawil furudh, wasiat wajibah.
4. Beri mode “penjelasan sederhana” dan “detail hukum”.
5. Gunakan empty state yang ramah.
6. Gunakan warning visual untuk kasus sensitif.
7. Jangan gunakan warna merah berlebihan kecuali error.

---

## 19. Content and Copywriting Guidelines

### Contoh disclaimer pendek
> Hitung Syariah membantu membuat simulasi pembagian waris. Hasil ini bukan putusan hukum final.

### Contoh warning kasus kompleks
> Kasus ini melibatkan ahli waris pengganti. Dalam praktik hukum, kasus seperti ini dapat memerlukan validasi lebih lanjut.

### Contoh rekomendasi setelah hasil
> Sebelum melakukan pembagian, pastikan seluruh ahli waris memahami bagian masing-masing, hutang pewaris telah diselesaikan, dan wasiat telah diperiksa sesuai batas yang berlaku.

### Jangan gunakan istilah finalistik
Hindari:

- “Inilah pembagian yang pasti benar.”
- “Keluarga wajib mengikuti hasil ini.”
- “Tidak perlu konsultasi lagi.”

Gunakan:

- “Berdasarkan data yang dimasukkan...”
- “Dalam mode KHI Indonesia...”
- “Simulasi menunjukkan...”
- “Perlu validasi bila ada sengketa atau data belum pasti.”

---

## 20. Knowledge Base Structure

Buat file seperti:

```txt
/features/inheritance/data
  khi-articles.ts
  quran-dalil.ts
  hadith-dalil.ts
  faraidh-rules.ts
  legal-topic-map.ts
```

### Contoh KHI article

```ts
export const KHI_ARTICLES = [
  {
    id: 'khi-180',
    source: 'KHI',
    article: 'Pasal 180',
    topic: 'Bagian janda',
    summary: 'Janda mendapat 1/4 bila pewaris tidak meninggalkan anak dan 1/8 bila pewaris meninggalkan anak.',
    appliesTo: ['wife', 'widow', 'has_children', 'no_children'],
    verificationStatus: 'verified'
  }
] as const;
```

### Contoh dalil Quran

```ts
export const QURAN_DALIL = [
  {
    id: 'quran-an-nisa-4-11',
    source: 'QURAN',
    reference: 'QS. An-Nisa 4:11',
    topic: 'Bagian anak dan orang tua',
    summary: 'Ayat ini memuat ketentuan bagian anak laki-laki, anak perempuan, ayah, dan ibu dalam waris.',
    sourceName: 'Qur\'an Kemenag',
    verificationStatus: 'verified'
  }
] as const;
```

### Contoh dalil hadis

```ts
export const HADITH_DALIL = [
  {
    id: 'hadith-bukhari-6732',
    source: 'HADITH',
    reference: 'Sahih al-Bukhari 6732',
    topic: 'Ashabah dan sisa waris',
    summary: 'Bagian faraidh diberikan kepada yang berhak, lalu sisanya diberikan kepada kerabat laki-laki terdekat.',
    sourceName: 'Sahih al-Bukhari',
    verificationStatus: 'verified'
  }
] as const;
```

---

## 21. Engine Design

### Main API

```ts
export function calculateInheritance(input: InheritanceCaseInput): InheritanceCalculationResult {
  // 1. validate
  // 2. normalize
  // 3. calculate estate
  // 4. determine eligible heirs
  // 5. apply blockers
  // 6. apply hajb
  // 7. calculate fixed shares
  // 8. calculate ashabah
  // 9. apply aul/rad
  // 10. apply KHI complex rules
  // 11. build explanations
  // 12. return result
}
```

### Submodules

```txt
/engine
  calculate-inheritance.ts
  normalize-input.ts
  validate-case.ts
  estate.ts
  eligibility.ts
  blockers.ts
  hajb.ts
  fixed-shares.ts
  ashabah.ts
  aul.ts
  rad.ts
  substitute-heirs.ts
  wajibah.ts
  explanations.ts
  warnings.ts
```

### Rule style
Gunakan pure functions.

Jangan gunakan global mutable state untuk kalkulasi.

---

## 22. Error Handling

### Input error
Contoh:

- Harta tidak boleh negatif.
- Jumlah ahli waris tidak boleh negatif.
- Relation wajib dipilih.
- Jika ada cucu pengganti, wajib memilih siapa yang digantikan.
- Wasiat melebihi harta.
- Hutang melebihi harta.

### Calculation warning
Warning bukan error. Contoh:

- Wasiat lebih dari 1/3.
- Penerima wasiat adalah ahli waris.
- Ada ahli waris beda agama.
- Ada anak angkat.
- Ada ahli waris pengganti.
- Ada harta bersama.
- Ada poligami.
- Ada ahli waris belum dewasa.
- Ada data agama/status hidup yang belum pasti.

### Unsupported case
Jika engine belum mendukung kasus:

```ts
{
  type: 'unsupported_case',
  severity: 'high',
  message: 'Kasus ini belum didukung penuh oleh engine.',
  recommendation: 'Simpan data dan validasikan secara manual dengan ahli faraidh atau pihak berwenang.'
}
```

---

## 23. Accessibility and Responsiveness

1. Mobile-first.
2. Form harus nyaman di layar kecil.
3. Gunakan label jelas pada input.
4. Jangan hanya mengandalkan warna untuk error.
5. Semua button punya teks jelas.
6. Accordion legal basis harus bisa dibuka dengan keyboard.
7. Tabel hasil harus responsive.
8. Sediakan ringkasan sebelum detail panjang.

---

## 24. Security Rules

1. Jangan upload data waris ke server.
2. Jangan simpan data sensitif di analytics.
3. Jangan aktifkan telemetry yang mengirim input kasus.
4. Jangan gunakan third-party script yang tidak perlu.
5. Import JSON harus divalidasi.
6. Escape semua input user saat ditampilkan.
7. Jangan render HTML mentah dari file import.

---

## 25. Performance Rules

1. Kalkulasi harus cepat dan berjalan client-side.
2. Knowledge base hukum boleh di-bundle lokal.
3. Gunakan dynamic import jika modul menjadi besar.
4. Hindari dependency berat tanpa alasan.
5. Optimalkan halaman awal agar cepat di Vercel.

---

## 26. SEO and Marketing Pages

Buat halaman marketing sederhana:

- Home
- Tentang Hitung Syariah
- Kalkulator Waris
- Edukasi Waris Islam
- Disclaimer
- Privacy

Tone home page:

> Hitung waris Islam dengan lebih transparan, disertai langkah perhitungan, dasar hukum KHI, dan dalil syar'i.

Jangan membuat klaim berlebihan seperti:

- “100% pasti sesuai hukum.”
- “Menggantikan ahli faraidh.”
- “Hasil resmi pengadilan.”

---

## 27. Roadmap

### Version 0.1 — Waris MVP
- Wizard input.
- Engine waris dasar + kasus kompleks prioritas.
- KHI + dalil Quran/Hadis terstruktur.
- Hasil pecahan dan nominal.
- Langkah perhitungan.
- Riwayat lokal.
- Export/import JSON.
- Unit test utama.

### Version 0.2 — Hardening
- Tambah lebih banyak test case.
- Tambah mode edukasi istilah faraidh.
- Tambah validasi kasus tidak lengkap.
- Tambah mode perbandingan KHI vs faraidh bila aman.

### Version 0.3 — PDF Export
- Export hasil ke PDF.
- Template laporan keluarga.
- Ringkasan legal basis.

### Version 0.4 — Zakat
- Zakat maal.
- Zakat penghasilan/profesi.
- Zakat perdagangan.
- Zakat emas/perak.
- Riwayat zakat lokal.

### Version 0.5 — Syariah Toolkit
- Wasiat simulator.
- Hibah planner.
- Wakaf basic guide.
- Template musyawarah keluarga.

---

## 28. AI Coding Agent Rules

Saat membangun aplikasi ini, AI coding agent wajib:

1. Membaca guideline ini sebelum menulis kode.
2. Membuat rencana singkat sebelum perubahan besar.
3. Memisahkan engine, UI, data hukum, dan storage.
4. Menulis TypeScript strict.
5. Menulis test untuk setiap logic waris.
6. Menggunakan pecahan untuk bagian waris.
7. Menyertakan legal explanation di setiap hasil.
8. Tidak membuat asumsi hukum tanpa sumber.
9. Tidak menghapus disclaimer.
10. Tidak mengirim data user ke server.
11. Tidak menambahkan backend tanpa alasan kuat.
12. Tidak membuat fitur PDF sebelum struktur hasil stabil.
13. Tidak mengubah struktur schema tanpa migration note.
14. Tidak memasukkan data palsu sebagai sumber hukum.
15. Jika ragu, beri warning di UI dan tandai rule `requires_review`.

---

## 29. Definition of Done

Sebuah fitur dianggap selesai bila:

1. UI berjalan di mobile dan desktop.
2. Input tervalidasi dengan Zod.
3. Engine dapat dites tanpa UI.
4. Unit test lulus.
5. Hasil menggunakan pecahan akurat.
6. Nominal rupiah diformat dengan benar.
7. Setiap hasil memiliki dasar hukum.
8. Dalil ditampilkan bila relevan.
9. Warning muncul untuk kasus sensitif.
10. Data tersimpan lokal bila user memilih simpan.
11. Export/import JSON tervalidasi.
12. Tidak ada data waris yang dikirim ke server.
13. Disclaimer tampil di halaman terkait.
14. Tidak ada klaim hukum final.
15. Build Next.js berhasil untuk deployment Vercel.

---

## 30. Suggested First Development Order

1. Setup Next.js + TypeScript + Tailwind + shadcn/ui.
2. Buat struktur folder.
3. Buat domain types.
4. Buat knowledge base KHI, Quran, dan Hadis minimal.
5. Buat fraction utility.
6. Buat estate calculation.
7. Buat eligibility dan blocker.
8. Buat fixed share rules.
9. Buat aul/rad.
10. Buat ashabah dan hajb.
11. Buat complex cases.
12. Buat explanation builder.
13. Buat warning builder.
14. Buat unit tests.
15. Buat wizard UI.
16. Buat result UI.
17. Buat local storage.
18. Buat export/import JSON.
19. Polish UX.
20. Deploy ke Vercel.

---

## 31. Initial Prompt for AI Coding Agent

Gunakan prompt berikut saat memulai coding:

```md
You are an expert TypeScript, Next.js, Islamic inheritance, and legal-tech coding assistant.

Build an app named Hitung Syariah.

The first module is an Islamic inheritance calculator for Indonesian users. It must use KHI Indonesia as the default legal mode and faraidh as the religious calculation/explanation layer. The app must show transparent step-by-step calculations, legal basis, Quran/Hadith references, warnings, and recommendations.

Use:
- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Zod
- React Hook Form
- fraction.js
- IndexedDB via Dexie or localForage
- Vitest

Core rules:
- Do not mix calculation engine with UI.
- Do not use floating point for inheritance shares.
- Do not store user inheritance data on a server.
- Store history locally.
- Support export/import JSON.
- Always attach legal explanations to results.
- Always show disclaimer.
- Mark uncertain or unsupported cases clearly.
- Write tests for every calculation rule.

Start by creating the architecture, domain types, legal knowledge base structure, and tested calculation engine before polishing UI.
```

---

## 32. Notes for Future Legal Review

Sebelum aplikasi dipublikasikan luas, lakukan review terhadap:

1. Implementasi Pasal 177 dan catatan SEMA.
2. Ahli waris pengganti.
3. Wasiat wajibah anak angkat/orang tua angkat.
4. Potensi wasiat wajibah untuk ahli waris beda agama jika ingin ditambahkan sebagai mode yurisprudensi.
5. Penanganan hibah yang disengketakan.
6. Penanganan harta bersama dalam perkawinan poligami.
7. Kasus anak luar perkawinan dan perkembangan putusan hukum terkait.
8. Bahasa disclaimer agar tidak dianggap layanan hukum resmi.

---

## 33. Final Product Principle

Hitung Syariah harus membantu keluarga memahami hak waris dengan lebih tenang, transparan, dan bertanggung jawab.

Aplikasi boleh membantu menghitung, menjelaskan, dan mendokumentasikan.

Aplikasi tidak boleh berpura-pura menjadi hakim, mufti, advokat, atau otoritas final.
