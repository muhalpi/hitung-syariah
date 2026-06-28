/*
 * Hitung Syariah — Knowledge Base hukum terstruktur
 * --------------------------------------------------
 * Semua teks dasar hukum berada di knowledge base ini (Guideline §5, §20).
 * verificationStatus menandai apakah ringkasan sudah ditinjau ('verified')
 * atau masih perlu ditinjau ahli ('needs_review').
 *
 * CATATAN: Ringkasan di sini bersifat edukatif. Teks pasal/ayat/hadis tetap
 * perlu diverifikasi terhadap sumber resmi sebelum publikasi luas.
 */
(function (global) {
  'use strict';

  // ---- KHI: Kompilasi Hukum Islam, Buku II Hukum Kewarisan ----
  const KHI_ARTICLES = {
    'khi-171': {
      source: 'KHI', article: 'Pasal 171',
      topic: 'Definisi pewaris, ahli waris, harta waris',
      summary:
        'Menjelaskan pengertian pewaris, ahli waris (orang yang beragama Islam dan berhak mewarisi), harta peninggalan, dan harta warisan setelah dikurangi biaya jenazah, hutang, dan wasiat.',
      verificationStatus: 'verified',
    },
    'khi-172': {
      source: 'KHI', article: 'Pasal 172',
      topic: 'Syarat ahli waris beragama Islam',
      summary:
        'Ahli waris dipandang beragama Islam apabila diketahui dari kartu identitas atau pengakuan, amalan, atau kesaksian; sedangkan bagi bayi atau yang belum dewasa mengikuti agama ayah atau lingkungannya.',
      verificationStatus: 'verified',
    },
    'khi-173': {
      source: 'KHI', article: 'Pasal 173',
      topic: 'Penghalang waris',
      summary:
        'Seseorang terhalang menjadi ahli waris apabila dengan putusan hakim yang berkekuatan hukum tetap dihukum karena membunuh atau mencoba membunuh atau menganiaya berat pewaris, atau memfitnah pewaris telah melakukan kejahatan yang diancam hukuman 5 tahun atau lebih.',
      verificationStatus: 'verified',
    },
    'khi-174': {
      source: 'KHI', article: 'Pasal 174',
      topic: 'Kelompok ahli waris',
      summary:
        'Kelompok ahli waris terdiri atas hubungan darah (ayah, ibu, anak, saudara, kakek, nenek) dan hubungan perkawinan (duda atau janda). Bila semua ada, yang berhak adalah anak, ayah, ibu, janda atau duda.',
      verificationStatus: 'verified',
    },
    'khi-176': {
      source: 'KHI', article: 'Pasal 176',
      topic: 'Bagian anak',
      summary:
        'Anak perempuan bila seorang mendapat 1/2, bila dua orang atau lebih bersama-sama mendapat 2/3. Bila ada anak laki-laki dan perempuan, bagian anak laki-laki dua berbanding satu dengan anak perempuan.',
      verificationStatus: 'verified',
    },
    'khi-177': {
      source: 'KHI', article: 'Pasal 177',
      topic: 'Bagian ayah',
      summary:
        'Ayah mendapat 1/3 bagian bila pewaris tidak meninggalkan anak; bila ada anak, ayah mendapat 1/6 bagian. (Catatan: terdapat SEMA yang menafsirkan bagian ayah dalam kondisi tertentu sebagai sisa/ashabah — lihat catatan engine.)',
      verificationStatus: 'needs_review',
    },
    'khi-178': {
      source: 'KHI', article: 'Pasal 178',
      topic: 'Bagian ibu',
      summary:
        'Ibu mendapat 1/6 bila ada anak atau dua saudara atau lebih; mendapat 1/3 bila tidak ada anak atau hanya satu saudara. Ibu mendapat 1/3 dari sisa sesudah diambil janda/duda bila bersama ayah.',
      verificationStatus: 'verified',
    },
    'khi-179': {
      source: 'KHI', article: 'Pasal 179',
      topic: 'Bagian duda (suami)',
      summary:
        'Duda mendapat 1/2 bagian bila pewaris tidak meninggalkan anak, dan 1/4 bagian bila pewaris meninggalkan anak.',
      verificationStatus: 'verified',
    },
    'khi-180': {
      source: 'KHI', article: 'Pasal 180',
      topic: 'Bagian janda (istri)',
      summary:
        'Janda mendapat 1/4 bagian bila pewaris tidak meninggalkan anak, dan 1/8 bagian bila pewaris meninggalkan anak. Bila istri lebih dari satu, bagian dibagi rata di antara mereka.',
      verificationStatus: 'verified',
    },
    'khi-181': {
      source: 'KHI', article: 'Pasal 181',
      topic: 'Saudara seibu (kalalah)',
      summary:
        'Bila seseorang meninggal tanpa anak dan ayah, maka saudara laki-laki dan perempuan seibu masing-masing mendapat 1/6; bila mereka dua orang atau lebih, bersama-sama mendapat 1/3.',
      verificationStatus: 'verified',
    },
    'khi-182': {
      source: 'KHI', article: 'Pasal 182',
      topic: 'Saudara kandung/seayah (kalalah)',
      summary:
        'Bila tidak ada anak dan ayah, saudara perempuan kandung/seayah seorang mendapat 1/2, dua orang atau lebih 2/3. Bila bersama saudara laki-laki, bagian laki-laki dua berbanding satu dengan perempuan.',
      verificationStatus: 'verified',
    },
    'khi-183': {
      source: 'KHI', article: 'Pasal 183',
      topic: 'Perdamaian pembagian (tasaluh)',
      summary:
        'Para ahli waris dapat bersepakat melakukan perdamaian dalam pembagian harta warisan setelah masing-masing menyadari bagiannya.',
      verificationStatus: 'verified',
    },
    'khi-185': {
      source: 'KHI', article: 'Pasal 185',
      topic: 'Ahli waris pengganti',
      summary:
        'Ahli waris yang meninggal lebih dahulu daripada pewaris dapat digantikan kedudukannya oleh anaknya. Bagian ahli waris pengganti tidak boleh melebihi bagian ahli waris yang sederajat dengan yang diganti.',
      verificationStatus: 'needs_review',
    },
    'khi-191': {
      source: 'KHI', article: 'Pasal 191',
      topic: 'Tidak ada ahli waris (Baitul Mal)',
      summary:
        'Bila pewaris tidak meninggalkan ahli waris sama sekali atau ahli warisnya tidak diketahui, harta warisan atas putusan Pengadilan Agama diserahkan kepada Baitul Mal untuk kepentingan agama Islam dan kesejahteraan umum.',
      verificationStatus: 'verified',
    },
    'khi-194': {
      source: 'KHI', article: 'Pasal 194-195',
      topic: 'Wasiat',
      summary:
        'Wasiat hanya diperbolehkan sebanyak-banyaknya 1/3 dari harta warisan kecuali apabila semua ahli waris menyetujui. Wasiat kepada ahli waris berlaku bila disetujui semua ahli waris.',
      verificationStatus: 'verified',
    },
    'khi-209': {
      source: 'KHI', article: 'Pasal 209',
      topic: 'Wasiat wajibah anak/orang tua angkat',
      summary:
        'Anak angkat yang tidak menerima wasiat berhak atas wasiat wajibah sebanyak-banyaknya 1/3 dari harta warisan orang tua angkatnya, demikian pula sebaliknya orang tua angkat terhadap anak angkatnya.',
      verificationStatus: 'verified',
    },
    'khi-aul': {
      source: 'FARAIDH', article: 'Kaidah Aul',
      topic: 'Aul (penyebut diperbesar)',
      summary:
        'Bila jumlah bagian dzawil furudh melebihi keseluruhan harta (lebih dari 1), penyebut dinaikkan (aul) sehingga seluruh ahli waris berkurang secara proporsional.',
      verificationStatus: 'verified',
    },
    'khi-rad': {
      source: 'FARAIDH', article: 'Kaidah Rad',
      topic: 'Rad (sisa dikembalikan)',
      summary:
        'Bila ada sisa harta setelah bagian dzawil furudh dan tidak ada ahli waris ashabah, sisa dikembalikan (rad) kepada ahli waris dzawil furudh yang berhak secara proporsional, kecuali suami/istri.',
      verificationStatus: 'verified',
    },
    'khi-ashabah': {
      source: 'FARAIDH', article: 'Kaidah Ashabah',
      topic: 'Ashabah (penerima sisa)',
      summary:
        'Ashabah adalah ahli waris yang menerima seluruh sisa harta setelah dzawil furudh menerima bagiannya. Anak laki-laki, ayah (dalam kondisi tertentu), dan saudara laki-laki dapat menjadi ashabah.',
      verificationStatus: 'verified',
    },
    'khi-hajb': {
      source: 'FARAIDH', article: 'Kaidah Hajb',
      topic: 'Hajb (terhalang ahli waris lain)',
      summary:
        'Sebagian ahli waris dapat terhalang (hajb) oleh ahli waris yang lebih dekat. Misalnya cucu terhalang oleh anak laki-laki, dan saudara terhalang oleh anak laki-laki atau ayah.',
      verificationStatus: 'verified',
    },
    'sema-177': {
      source: 'SEMA', article: 'Catatan SEMA / Yurisprudensi',
      topic: 'Penafsiran bagian ayah & kasus gharrawain',
      summary:
        'Dalam kasus tertentu (mis. ahli waris hanya suami/istri + ibu + ayah), praktik peradilan agama dapat menafsirkan bagian ibu sebagai 1/3 dari sisa dan ayah sebagai ashabah. Perlu validasi pada kasus konkret.',
      verificationStatus: 'needs_review',
    },
  };

  // ---- Dalil Al-Qur'an ----
  const QURAN_DALIL = {
    'quran-an-nisa-4-11': {
      source: 'QURAN', reference: 'QS. An-Nisa 4:11',
      topic: 'Bagian anak dan orang tua',
      translationSummary:
        'Allah mensyariatkan bagimu tentang (pembagian warisan untuk) anak-anakmu, bagian seorang anak laki-laki sama dengan bagian dua anak perempuan… dan untuk dua orang ibu-bapak, bagi masing-masingnya seperenam dari harta yang ditinggalkan jika yang meninggal mempunyai anak.',
      sourceName: "Qur'an Kemenag",
      verificationStatus: 'verified',
    },
    'quran-an-nisa-4-12': {
      source: 'QURAN', reference: 'QS. An-Nisa 4:12',
      topic: 'Bagian suami, istri, dan saudara seibu',
      translationSummary:
        'Bagimu (suami) seperdua dari harta yang ditinggalkan istrimu jika mereka tidak mempunyai anak… Para istri memperoleh seperempat harta yang kamu tinggalkan jika kamu tidak mempunyai anak, jika kamu mempunyai anak maka mereka memperoleh seperdelapan.',
      sourceName: "Qur'an Kemenag",
      verificationStatus: 'verified',
    },
    'quran-an-nisa-4-176': {
      source: 'QURAN', reference: 'QS. An-Nisa 4:176',
      topic: 'Kalalah — saudara kandung/seayah',
      translationSummary:
        'Jika seseorang meninggal dunia dan ia tidak mempunyai anak dan mempunyai saudara perempuan, maka bagi saudaranya yang perempuan itu seperdua dari harta yang ditinggalkan…',
      sourceName: "Qur'an Kemenag",
      verificationStatus: 'verified',
    },
  };

  // ---- Dalil Hadis ----
  const HADITH_DALIL = {
    'hadith-bukhari-6732': {
      source: 'HADITH', reference: 'Sahih al-Bukhari 6732 / Muslim 1615',
      topic: 'Ashabah dan sisa waris',
      translationSummary:
        'Berikanlah bagian-bagian waris (faraidh) kepada yang berhak, dan sisanya untuk kerabat laki-laki yang terdekat (ashabah).',
      sourceName: 'Muttafaq alaih',
      verificationStatus: 'verified',
    },
  };

  // Peta topik -> referensi, untuk membangun penjelasan per langkah
  const HS = (global.HS = global.HS || {});
  HS.KB = {
    KHI_ARTICLES,
    QURAN_DALIL,
    HADITH_DALIL,
    khi(id) { return KHI_ARTICLES[id]; },
    quran(id) { return QURAN_DALIL[id]; },
    hadith(id) { return HADITH_DALIL[id]; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
