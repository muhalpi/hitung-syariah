/*
 * Hitung Syariah — Inheritance Engine (faraidh + KHI)
 * ----------------------------------------------------
 * Pure functions, tanpa global mutable state, tanpa DOM. (Guideline §21)
 * Default mode: KHI Indonesia; faraidh sebagai engine konseptual & penjelas.
 *
 * Output mengikuti InheritanceCalculationResult (Guideline §6):
 *   estateSummary, eligibleHeirs, excludedHeirs, shares, adjustments,
 *   legalSteps, warnings, recommendations, metadata.
 *
 * CATATAN PENTING: engine ini mengimplementasikan kasus-kasus utama secara
 * deterministik. Kasus yang kompleks/sensitif ditandai confidence
 * 'requires_review' beserta warning, sesuai aturan §28.15.
 */
(function (global) {
  'use strict';

  const HS = (global.HS = global.HS || {});
  const F = HS.Fraction;
  const KB = HS.KB;

  const APP_VERSION = '0.1.0';
  const SCHEMA_VERSION = '1';

  // Label ahli waris (Bahasa Indonesia)
  const HEIR_META = {
    husband: { label: 'Suami (Duda)', gender: 'male', group: 'spouse' },
    wife: { label: 'Istri (Janda)', gender: 'female', group: 'spouse' },
    father: { label: 'Ayah', gender: 'male', group: 'parent' },
    mother: { label: 'Ibu', gender: 'female', group: 'parent' },
    son: { label: 'Anak laki-laki', gender: 'male', group: 'descendant' },
    daughter: { label: 'Anak perempuan', gender: 'female', group: 'descendant' },
    grandson_from_son: { label: 'Cucu laki-laki (dari anak laki-laki)', gender: 'male', group: 'descendant' },
    granddaughter_from_son: { label: 'Cucu perempuan (dari anak laki-laki)', gender: 'female', group: 'descendant' },
    grandchild_substitute: { label: 'Cucu (ahli waris pengganti)', gender: 'male', group: 'descendant' },
    full_brother: { label: 'Saudara laki-laki kandung', gender: 'male', group: 'sibling' },
    full_sister: { label: 'Saudara perempuan kandung', gender: 'female', group: 'sibling' },
    paternal_brother: { label: 'Saudara laki-laki seayah', gender: 'male', group: 'sibling' },
    paternal_sister: { label: 'Saudara perempuan seayah', gender: 'female', group: 'sibling' },
    maternal_brother: { label: 'Saudara laki-laki seibu', gender: 'male', group: 'sibling' },
    maternal_sister: { label: 'Saudara perempuan seibu', gender: 'female', group: 'sibling' },
    grandfather: { label: 'Kakek', gender: 'male', group: 'ancestor' },
    grandmother: { label: 'Nenek', gender: 'female', group: 'ancestor' },
    uncle: { label: 'Paman', gender: 'male', group: 'other' },
    adopted_child: { label: 'Anak angkat', gender: 'any', group: 'special' },
    adoptive_parent: { label: 'Orang tua angkat', gender: 'any', group: 'special' },
    other: { label: 'Lainnya', gender: 'any', group: 'other' },
  };

  function label(rel) { return (HEIR_META[rel] && HEIR_META[rel].label) || rel; }

  // ---------------------------------------------------------------------------
  // ESTATE: hitung harta waris bersih (Guideline §8)
  // ---------------------------------------------------------------------------
  function calculateEstate(estate) {
    const num = (v) => (v == null || v === '' ? 0 : Math.max(0, Math.round(Number(v) || 0)));

    const personalAssets = num(estate.grossAssets);
    let deceasedJointShare = 0;
    let jointNote = null;
    if (estate.deceasedShareOfJointProperty != null && estate.deceasedShareOfJointProperty !== '') {
      deceasedJointShare = num(estate.deceasedShareOfJointProperty);
    } else if (estate.jointPropertyTotal != null && estate.jointPropertyTotal !== '') {
      // Default: bagian pewaris dari harta bersama = 1/2 (asumsi, dapat berbeda)
      deceasedJointShare = Math.round(num(estate.jointPropertyTotal) / 2);
      jointNote =
        'Bagian pewaris dari harta bersama diasumsikan 1/2 dari total harta bersama. Sesuaikan bila pembagian harta bersama berbeda.';
    }

    const tirkah = personalAssets + deceasedJointShare; // harta peninggalan milik pewaris
    const funeral = num(estate.funeralCost);
    const medical = num(estate.medicalCostBeforeDeath);
    const debts = num(estate.debts);
    const deductions = funeral + medical + debts;
    const afterDebts = Math.max(0, tirkah - deductions);

    // Wasiat: maksimal 1/3 kecuali disetujui semua ahli waris (KHI Pasal 194)
    const willsTotal = (estate.wills || []).reduce((s, w) => s + num(w.amount), 0);
    const maxWasiat = Math.floor(afterDebts / 3);
    const approvedAll = !!estate.willsApprovedByAllHeirs;
    let effectiveWasiat = willsTotal;
    let wasiatCapped = false;
    if (!approvedAll && willsTotal > maxWasiat) {
      effectiveWasiat = maxWasiat;
      wasiatCapped = true;
    }
    effectiveWasiat = Math.min(effectiveWasiat, afterDebts);

    const netEstate = Math.max(0, afterDebts - effectiveWasiat);

    return {
      personalAssets,
      deceasedJointShare,
      jointNote,
      tirkah,
      funeral,
      medical,
      debts,
      deductions,
      afterDebts,
      willsTotal,
      maxWasiat,
      effectiveWasiat,
      wasiatCapped,
      netEstate,
    };
  }

  // ---------------------------------------------------------------------------
  // ELIGIBILITY: tentukan ahli waris yang sah & yang terhalang (Guideline §9)
  // ---------------------------------------------------------------------------
  function determineEligibility(heirs, mode) {
    const eligible = [];
    const excluded = [];
    (heirs || []).forEach((h) => {
      const count = Math.max(0, Math.floor(Number(h.count) || 0));
      if (count <= 0) return;
      const entry = { ...h, count };

      // Penghalang hukum (KHI Pasal 173): membunuh, mencoba membunuh, menganiaya berat, memfitnah
      if (h.isLegallyBlocked) {
        excluded.push({ ...entry, excludedReason: 'legal_blocker', reason: blockerReason(h.blockReason) });
        return;
      }
      // Tidak hidup saat pewaris meninggal (kecuali ahli waris pengganti)
      if (h.isAliveAtDeath === false && h.relation !== 'grandchild_substitute' && !h.substituteFor) {
        excluded.push({ ...entry, excludedReason: 'not_alive', reason: 'Tidak hidup saat pewaris meninggal dunia.' });
        return;
      }
      // Beda agama (mode KHI default: non-Muslim tidak mewarisi — KHI Pasal 171/172)
      if (mode === 'khi' && h.religionStatus === 'non_muslim') {
        excluded.push({ ...entry, excludedReason: 'different_religion', reason: 'Beragama selain Islam (mode hukum Islam/KHI).' });
        return;
      }
      eligible.push(entry);
    });
    return { eligible, excluded };
  }

  function blockerReason(code) {
    return ({
      murder: 'Terbukti membunuh pewaris (KHI Pasal 173).',
      attempted_murder: 'Terbukti mencoba membunuh pewaris (KHI Pasal 173).',
      serious_abuse: 'Terbukti menganiaya berat pewaris (KHI Pasal 173).',
      false_accusation: 'Terbukti memfitnah pewaris dengan kejahatan berat (KHI Pasal 173).',
      different_religion: 'Beragama selain Islam.',
    }[code]) || 'Terhalang menjadi ahli waris (perlu dipastikan dengan putusan hukum).';
  }

  // helper: jumlah eligible per relation
  function countByRelation(eligible) {
    const c = {};
    eligible.forEach((h) => { c[h.relation] = (c[h.relation] || 0) + h.count; });
    return c;
  }

  // ---------------------------------------------------------------------------
  // ENGINE UTAMA
  // ---------------------------------------------------------------------------
  function calculateInheritance(caseInput) {
    const mode = caseInput.mode || 'khi';
    const estate = caseInput.estate || {};
    const heirs = caseInput.heirs || [];
    const special = caseInput.special || {};

    const warnings = [];
    const recommendations = [];
    const adjustments = [];
    const legalSteps = [];
    let stepId = 0;
    const step = (s) => { legalSteps.push({ id: 'step-' + ++stepId, ...s }); };

    const estateSummary = calculateEstate(estate);
    if (estateSummary.jointNote) {
      warnings.push({ type: 'joint_property_assumption', severity: 'medium', message: estateSummary.jointNote });
    }

    step({
      title: 'Menghitung harta waris bersih',
      inputContext: 'Harta peninggalan dikurangi biaya jenazah, biaya sakit, hutang, dan wasiat yang sah.',
      result:
        'Harta waris bersih = ' + fmtIDR(estateSummary.netEstate) +
        ' (peninggalan ' + fmtIDR(estateSummary.tirkah) + ' − biaya/hutang ' + fmtIDR(estateSummary.deductions) +
        ' − wasiat ' + fmtIDR(estateSummary.effectiveWasiat) + ').',
      calculation:
        estateSummary.tirkah + ' − ' + estateSummary.deductions + ' − ' + estateSummary.effectiveWasiat +
        ' = ' + estateSummary.netEstate,
      legalBasis: [refKHI('khi-171'), refKHI('khi-194')],
      explanation:
        'Sebelum dibagi, harta peninggalan dikurangi kewajiban pewaris. Wasiat dibatasi maksimal 1/3 kecuali disetujui semua ahli waris.',
      confidence: 'high',
    });

    if (estateSummary.wasiatCapped) {
      warnings.push({
        type: 'wasiat_exceeds_third', severity: 'high',
        message: 'Total wasiat melebihi 1/3 harta dan tidak ditandai disetujui semua ahli waris. Wasiat dijalankan hanya sampai 1/3 (KHI Pasal 194).',
      });
    }

    // Eligibility
    const { eligible, excluded } = determineEligibility(heirs, mode);
    const unsupportedExcluded = [];
    const initialCounts = countByRelation(eligible);

    function excludeEligibleRelation(relation, excludedReason, reason) {
      for (let i = eligible.length - 1; i >= 0; i--) {
        if (eligible[i].relation === relation) {
          unsupportedExcluded.push({ ...eligible[i], excludedReason, reason });
          eligible.splice(i, 1);
        }
      }
    }

    if (initialCounts.grandchild_substitute > 0) {
      excludeEligibleRelation('grandchild_substitute', 'unsupported_case',
        'Ahli waris pengganti belum dihitung otomatis oleh engine; bagian harus divalidasi manual sesuai KHI Pasal 185.');
      warnings.push({ type: 'unsupported_substitute_heir', severity: 'high',
        message: 'Terdapat ahli waris pengganti. Engine saat ini belum menghitung bagian ahli waris pengganti otomatis agar tidak memberi hasil hukum yang menyesatkan. Validasi manual diperlukan.' });
      recommendations.push({ title: 'Validasi ahli waris pengganti',
        text: 'Tentukan bagian ahli waris pengganti dengan Pengadilan Agama atau ahli faraidh/KHI sebelum pembagian nyata.' });
    }
    if (initialCounts.adopted_child > 0) {
      excludeEligibleRelation('adopted_child', 'wasiat_wajibah_not_inheritance',
        'Anak angkat tidak otomatis menjadi ahli waris nasab; pertimbangkan wasiat wajibah maksimal 1/3 dalam mode KHI.');
      warnings.push({ type: 'adopted_child', severity: 'medium',
        message: 'Terdapat anak angkat. Anak angkat tidak dimasukkan sebagai ahli waris nasab; pertimbangkan wasiat wajibah maksimal 1/3 sesuai KHI Pasal 209.' });
    }
    if (initialCounts.adoptive_parent > 0) {
      excludeEligibleRelation('adoptive_parent', 'wasiat_wajibah_not_inheritance',
        'Orang tua angkat tidak otomatis menjadi ahli waris nasab; pertimbangkan wasiat wajibah maksimal 1/3 dalam mode KHI.');
      warnings.push({ type: 'adoptive_parent', severity: 'medium',
        message: 'Terdapat orang tua angkat. Ia tidak dimasukkan sebagai ahli waris nasab; pertimbangkan wasiat wajibah maksimal 1/3 sesuai KHI Pasal 209.' });
    }
    if (initialCounts.uncle > 0) {
      excludeEligibleRelation('uncle', 'unsupported_case',
        'Bagian paman belum didukung oleh engine MVP dan perlu validasi manual.');
    }
    if (initialCounts.other > 0) {
      excludeEligibleRelation('other', 'unsupported_case',
        'Hubungan ahli waris lainnya belum didukung oleh engine MVP dan perlu validasi manual.');
    }

    if (heirs.some((h) => Math.max(0, Math.floor(Number(h.count) || 0)) > 0 && h.religionStatus === 'unknown')) {
      warnings.push({ type: 'unknown_religion_status', severity: 'medium',
        message: 'Ada ahli waris dengan status agama belum pasti. Dalam mode KHI, status agama dapat memengaruhi hak waris; pastikan data sebelum pembagian.' });
    }
    if (heirs.some((h) => Math.max(0, Math.floor(Number(h.count) || 0)) > 0 && h.isAliveAtDeath !== true && h.isAliveAtDeath !== false)) {
      warnings.push({ type: 'uncertain_life_status', severity: 'medium',
        message: 'Ada ahli waris dengan status hidup saat pewaris wafat yang belum pasti. Hasil dapat berubah bila status ini berbeda.' });
    }
    if (heirs.some((h) => Math.max(0, Math.floor(Number(h.count) || 0)) > 0 && h.isMinor)) {
      warnings.push({ type: 'minor_heir', severity: 'low',
        message: 'Terdapat ahli waris yang belum dewasa. Bagiannya tetap dihitung bila memenuhi syarat, namun haknya perlu diwakili/dijaga oleh wali sesuai ketentuan hukum.' });
    }

    const counts = countByRelation(eligible);

    // ---- Flags ----
    const n = (r) => counts[r] || 0;
    const numSons = n('son');
    const numDaughters = n('daughter');
    const numGrandsons = n('grandson_from_son');
    const numGranddaughters = n('granddaughter_from_son');
    const numSubstitute = n('grandchild_substitute');
    const hasFather = n('father') > 0;
    const hasMother = n('mother') > 0;
    const hasGrandfather = n('grandfather') > 0;
    const hasGrandmother = n('grandmother') > 0;
    const hasHusband = n('husband') > 0;
    const hasWife = n('wife') > 0;

    const numMaternalSibs = n('maternal_brother') + n('maternal_sister');
    const numFullSibs = n('full_brother') + n('full_sister');
    const numPaternalSibs = n('paternal_brother') + n('paternal_sister');
    const siblingsTotal = numMaternalSibs + numFullSibs + numPaternalSibs;

    const hasMaleDescendant = numSons > 0 || numGrandsons > 0 || numSubstitute > 0;
    const hasDescendant =
      numSons > 0 || numDaughters > 0 || numGrandsons > 0 || numGranddaughters > 0 || numSubstitute > 0;
    const hasFemaleDescendantOnly = hasDescendant && !hasMaleDescendant;

    // ---- HAJB: tandai ahli waris yang terhalang ahli waris lain (Guideline §10) ----
    const hajbExcluded = [];
    function blockGroup(relation, reason) {
      // pindahkan dari eligible ke excluded by-hajb
      for (let i = eligible.length - 1; i >= 0; i--) {
        if (eligible[i].relation === relation) {
          hajbExcluded.push({ ...eligible[i], excludedReason: 'hajb', reason });
          eligible.splice(i, 1);
        }
      }
    }

    // Cucu terhalang anak laki-laki
    if (numSons > 0) {
      if (numGrandsons > 0 || numGranddaughters > 0)
        blockGroup('grandson_from_son', 'Terhalang oleh anak laki-laki (hajb).');
      blockGroup('granddaughter_from_son', 'Terhalang oleh anak laki-laki (hajb).');
    }
    // Cucu perempuan terhalang oleh 2+ anak perempuan bila tidak ada cucu laki-laki
    if (numSons === 0 && numDaughters >= 2 && numGrandsons === 0) {
      blockGroup('granddaughter_from_son', 'Terhalang oleh dua anak perempuan atau lebih (tidak ada cucu laki-laki).');
    }
    // Saudara seibu terhalang oleh keturunan atau ayah/kakek
    if (hasDescendant || hasFather || hasGrandfather) {
      blockGroup('maternal_brother', 'Terhalang oleh keturunan atau ayah/kakek (hajb).');
      blockGroup('maternal_sister', 'Terhalang oleh keturunan atau ayah/kakek (hajb).');
    }
    // Saudara kandung & seayah terhalang oleh anak/cucu laki-laki atau ayah
    if (hasMaleDescendant || hasFather) {
      ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister'].forEach((r) =>
        blockGroup(r, 'Terhalang oleh anak/cucu laki-laki atau ayah (hajb).'));
    }
    // Saudara seayah terhalang oleh saudara laki-laki kandung
    if (n('full_brother') > 0) {
      blockGroup('paternal_brother', 'Terhalang oleh saudara laki-laki kandung (hajb).');
      blockGroup('paternal_sister', 'Terhalang oleh saudara laki-laki kandung (hajb).');
    }
    // Kakek terhalang oleh ayah
    if (hasFather) blockGroup('grandfather', 'Terhalang oleh ayah (hajb).');
    // Nenek terhalang oleh ibu
    if (hasMother) blockGroup('grandmother', 'Terhalang oleh ibu (hajb).');

    // recompute counts after hajb
    const c2 = countByRelation(eligible);
    const m = (r) => c2[r] || 0;

    // ---- FIXED SHARES (dzawil furudh) ----
    // entries: {relation, type, fraction(group), note, basis, dalil, confidence}
    const fixed = [];
    let ashabahGroup = null; // {relations:[...], note, basis, dalil, confidence}

    const isKalalah = !hasDescendant && !hasFather && !hasGrandfather;

    // Special "gharrawain / umariyyatain": spouse + ayah + ibu, tanpa keturunan & <2 saudara
    const gharrawain =
      (hasHusband || hasWife) && hasFather && hasMother && !hasDescendant && siblingsTotal < 2 &&
      m('son') === 0 && m('daughter') === 0;

    // 1) Suami
    if (hasHusband) {
      const fr = hasDescendant ? new F(1, 4) : new F(1, 2);
      fixed.push(mkFixed('husband', m('husband'), fr,
        hasDescendant ? 'Pewaris meninggalkan anak/keturunan → suami 1/4.' : 'Tidak ada anak/keturunan → suami 1/2.',
        ['khi-179'], ['quran-an-nisa-4-12'], 'high'));
    }
    // 2) Istri
    if (hasWife) {
      const fr = hasDescendant ? new F(1, 8) : new F(1, 4);
      fixed.push(mkFixed('wife', m('wife'), fr,
        (hasDescendant ? 'Pewaris meninggalkan anak/keturunan → istri 1/8.' : 'Tidak ada anak/keturunan → istri 1/4.') +
        (m('wife') > 1 ? ' Dibagi rata di antara ' + m('wife') + ' istri.' : ''),
        ['khi-180'], ['quran-an-nisa-4-12'], 'high'));
    }
    // 3) Ibu
    if (hasMother) {
      if (gharrawain) {
        // 1/3 dari sisa setelah suami/istri
        const spouseFr = hasHusband ? (hasDescendant ? new F(1, 4) : new F(1, 2))
          : hasWife ? (hasDescendant ? new F(1, 8) : new F(1, 4)) : new F(0);
        const remainder = new F(1).sub(spouseFr);
        const motherFr = remainder.mul(new F(1, 3));
        fixed.push(mkFixed('mother', 1, motherFr,
          'Kasus khusus (gharrawain): ibu mendapat 1/3 dari sisa setelah bagian suami/istri.',
          ['khi-178', 'sema-177'], ['quran-an-nisa-4-11'], 'requires_review'));
        warnings.push({ type: 'gharrawain', severity: 'medium',
          message: 'Kasus gharrawain/umariyyatain (suami/istri + ayah + ibu tanpa anak). Bagian ibu 1/3 dari sisa dan ayah sebagai ashabah. Penafsiran dapat berbeda — perlu validasi.' });
      } else {
        const motherSixth = hasDescendant || siblingsTotal >= 2;
        const fr = motherSixth ? new F(1, 6) : new F(1, 3);
        fixed.push(mkFixed('mother', 1, fr,
          motherSixth
            ? 'Ada anak/keturunan atau dua saudara atau lebih → ibu 1/6.'
            : 'Tidak ada anak/keturunan dan kurang dari dua saudara → ibu 1/3.',
          ['khi-178'], ['quran-an-nisa-4-11'], 'high'));
      }
    }
    // 4) Ayah
    if (hasFather) {
      if (hasMaleDescendant) {
        fixed.push(mkFixed('father', 1, new F(1, 6),
          'Ada anak/cucu laki-laki → ayah mendapat 1/6 (tetap, tanpa sisa).',
          ['khi-177'], ['quran-an-nisa-4-11'], 'high'));
      } else if (hasFemaleDescendantOnly) {
        // 1/6 tetap + ashabah atas sisa
        fixed.push(mkFixed('father', 1, new F(1, 6),
          'Hanya ada keturunan perempuan → ayah mendapat 1/6 tetap dan sisa sebagai ashabah.',
          ['khi-177', 'khi-ashabah'], ['quran-an-nisa-4-11'], 'requires_review'));
        ashabahGroup = { relations: ['father'], basis: ['khi-177', 'khi-ashabah'], dalil: ['hadith-bukhari-6732'],
          note: 'Ayah mengambil sisa (ashabah) setelah keturunan perempuan menerima bagian tetap.', confidence: 'requires_review' };
      } else {
        // tidak ada keturunan → ayah ashabah (sisa)
        ashabahGroup = { relations: ['father'], basis: ['khi-177', 'khi-ashabah'], dalil: ['hadith-bukhari-6732'],
          note: 'Tidak ada keturunan → ayah menjadi ashabah (menerima sisa).', confidence: gharrawain ? 'requires_review' : 'medium' };
      }
    }
    // 5) Kakek (bila tidak ada ayah)
    if (!hasFather && hasGrandfather) {
      if (hasMaleDescendant) {
        fixed.push(mkFixed('grandfather', m('grandfather'), new F(1, 6),
          'Ada anak/cucu laki-laki dan tidak ada ayah → kakek 1/6.',
          ['khi-177'], ['quran-an-nisa-4-11'], 'requires_review'));
      } else if (!ashabahGroup) {
        if (hasFemaleDescendantOnly) {
          fixed.push(mkFixed('grandfather', m('grandfather'), new F(1, 6),
            'Hanya keturunan perempuan & tidak ada ayah → kakek 1/6 + sisa (ashabah).',
            ['khi-177'], ['quran-an-nisa-4-11'], 'requires_review'));
        }
        ashabahGroup = { relations: ['grandfather'], basis: ['khi-177', 'khi-ashabah'], dalil: ['hadith-bukhari-6732'],
          note: 'Kakek menggantikan kedudukan ayah sebagai ashabah (perlu validasi karena terdapat perbedaan pendapat).', confidence: 'requires_review' };
      }
      warnings.push({ type: 'grandfather_case', severity: 'medium',
        message: 'Perhitungan bagian kakek (terutama bersama saudara) memiliki perbedaan pendapat fikih. Perlu validasi.' });
    }
    // 6) Nenek
    if (hasGrandmother && m('grandmother') > 0) {
      fixed.push(mkFixed('grandmother', m('grandmother'), new F(1, 6),
        'Nenek mendapat 1/6 (dibagi bila lebih dari satu nenek yang berhak).',
        ['khi-178'], ['quran-an-nisa-4-11'], 'medium'));
    }

    // 7) Anak (descendant utama)
    if (numSons > 0) {
      // anak laki-laki + perempuan = ashabah 2:1
      const rels = ['son'];
      if (numDaughters > 0) rels.push('daughter');
      ashabahGroup = { relations: rels, basis: ['khi-176', 'khi-ashabah'], dalil: ['quran-an-nisa-4-11', 'hadith-bukhari-6732'],
        note: numDaughters > 0
          ? 'Anak laki-laki dan perempuan menjadi ashabah; laki-laki dua berbanding satu dengan perempuan.'
          : 'Anak laki-laki menjadi ashabah (menerima sisa).', confidence: 'high' };
    } else if (numDaughters > 0) {
      const fr = numDaughters === 1 ? new F(1, 2) : new F(2, 3);
      fixed.push(mkFixed('daughter', numDaughters, fr,
        numDaughters === 1 ? 'Seorang anak perempuan tanpa anak laki-laki → 1/2.'
          : 'Dua anak perempuan atau lebih tanpa anak laki-laki → bersama 2/3.',
        ['khi-176'], ['quran-an-nisa-4-11'], 'high'));
    }

    // 8) Cucu (bila tidak ada anak laki-laki, dan tidak terhalang)
    if (numSons === 0 && (m('grandson_from_son') > 0 || m('granddaughter_from_son') > 0)) {
      if (m('grandson_from_son') > 0) {
        const rels = ['grandson_from_son'];
        if (m('granddaughter_from_son') > 0) rels.push('granddaughter_from_son');
        if (!ashabahGroup) {
          ashabahGroup = { relations: rels, basis: ['khi-176', 'khi-ashabah'], dalil: ['hadith-bukhari-6732'],
            note: 'Cucu laki-laki (dan cucu perempuan bersamanya) menjadi ashabah menerima sisa.', confidence: 'medium' };
        }
      } else {
        // hanya cucu perempuan
        if (numDaughters === 1) {
          fixed.push(mkFixed('granddaughter_from_son', m('granddaughter_from_son'), new F(1, 6),
            'Bersama seorang anak perempuan → cucu perempuan mendapat 1/6 (takmilah/penyempurna 2/3).',
            ['khi-176'], ['quran-an-nisa-4-11'], 'medium'));
        } else if (numDaughters === 0) {
          const fr = m('granddaughter_from_son') === 1 ? new F(1, 2) : new F(2, 3);
          fixed.push(mkFixed('granddaughter_from_son', m('granddaughter_from_son'), fr,
            'Tidak ada anak → cucu perempuan menggantikan kedudukan anak perempuan (1/2 atau 2/3).',
            ['khi-176'], ['quran-an-nisa-4-11'], 'medium'));
        }
      }
    }

    // 9) Saudara seibu (kalalah)
    if (isKalalah && numMaternalSibs > 0 && (m('maternal_brother') + m('maternal_sister')) > 0) {
      const cnt = m('maternal_brother') + m('maternal_sister');
      const fr = cnt === 1 ? new F(1, 6) : new F(1, 3);
      // dibagi rata tanpa membedakan gender
      fixed.push(mkFixed('maternal_sibling', cnt, fr,
        cnt === 1 ? 'Kalalah: seorang saudara seibu → 1/6.' : 'Kalalah: dua saudara seibu atau lebih → bersama 1/3 (dibagi rata).',
        ['khi-181'], ['quran-an-nisa-4-12'], 'high',
        { displayRelations: ['maternal_brother', 'maternal_sister'] }));
    }

    // 10) Saudara kandung (kalalah)
    if (isKalalah && (m('full_brother') > 0 || m('full_sister') > 0)) {
      if (m('full_brother') > 0) {
        const rels = ['full_brother'];
        if (m('full_sister') > 0) rels.push('full_sister');
        if (!ashabahGroup) {
          ashabahGroup = { relations: rels, basis: ['khi-182', 'khi-ashabah'], dalil: ['quran-an-nisa-4-176', 'hadith-bukhari-6732'],
            note: 'Saudara kandung menjadi ashabah; laki-laki dua berbanding satu dengan perempuan.', confidence: 'medium' };
        }
      } else {
        // hanya saudari kandung
        if (hasFemaleDescendantOnly) {
          // ashabah ma'al ghair (tetapi ini hanya bila ada keturunan perempuan — di kalalah tdk ada keturunan, jadi skip)
        }
        const fr = m('full_sister') === 1 ? new F(1, 2) : new F(2, 3);
        fixed.push(mkFixed('full_sister', m('full_sister'), fr,
          m('full_sister') === 1 ? 'Kalalah: seorang saudari kandung → 1/2.' : 'Kalalah: dua saudari kandung atau lebih → bersama 2/3.',
          ['khi-182'], ['quran-an-nisa-4-176'], 'medium'));
      }
    }

    // 11) Saudara seayah (kalalah, bila tidak ada saudara kandung laki-laki)
    if (isKalalah && (m('paternal_brother') > 0 || m('paternal_sister') > 0)) {
      const fullSisterTookHalf = m('full_brother') === 0 && m('full_sister') === 1;
      if (m('paternal_brother') > 0) {
        const rels = ['paternal_brother'];
        if (m('paternal_sister') > 0) rels.push('paternal_sister');
        if (!ashabahGroup) {
          ashabahGroup = { relations: rels, basis: ['khi-182', 'khi-ashabah'], dalil: ['quran-an-nisa-4-176'],
            note: 'Saudara seayah menjadi ashabah menerima sisa.', confidence: 'requires_review' };
        }
      } else if (fullSisterTookHalf) {
        fixed.push(mkFixed('paternal_sister', m('paternal_sister'), new F(1, 6),
          'Bersama seorang saudari kandung → saudari seayah mendapat 1/6 (penyempurna 2/3).',
          ['khi-182'], ['quran-an-nisa-4-176'], 'requires_review'));
      } else if (m('full_sister') === 0) {
        const fr = m('paternal_sister') === 1 ? new F(1, 2) : new F(2, 3);
        fixed.push(mkFixed('paternal_sister', m('paternal_sister'), fr,
          'Kalalah tanpa saudara kandung → saudari seayah 1/2 atau 2/3.',
          ['khi-182'], ['quran-an-nisa-4-176'], 'requires_review'));
      }
      warnings.push({ type: 'paternal_sibling_case', severity: 'low',
        message: 'Perhitungan saudara seayah memiliki banyak variasi kasus. Hasil perlu divalidasi.' });
    }

    // Ashabah ma'al ghair: saudari kandung/seayah bersama keturunan perempuan (di luar kalalah murni)
    if (!isKalalah && !hasMaleDescendant && !hasFather && hasFemaleDescendantOnly &&
        (m('full_sister') > 0 || m('full_brother') > 0) && !ashabahGroup) {
      const rels = [];
      if (m('full_brother') > 0) rels.push('full_brother');
      if (m('full_sister') > 0) rels.push('full_sister');
      if (rels.length) {
        ashabahGroup = { relations: rels, basis: ['khi-182', 'khi-ashabah'], dalil: ['quran-an-nisa-4-176'],
          note: 'Saudari kandung menjadi ashabah maal-ghair bersama keturunan perempuan (menerima sisa).', confidence: 'requires_review' };
      }
    }

    // ---- Jumlahkan fixed shares ----
    let fixedSum = new F(0);
    fixed.forEach((e) => { fixedSum = fixedSum.add(e.fraction); });

    // ---- AUL ----
    let aulApplied = false;
    if (fixedSum.compare(new F(1)) > 0) {
      aulApplied = true;
      const total = fixedSum;
      fixed.forEach((e) => { e.fraction = e.fraction.div(total); });
      if (ashabahGroup) {
        warnings.push({ type: 'aul_with_ashabah', severity: 'medium',
          message: 'Terjadi aul namun terdapat ahli waris ashabah. Periksa kembali komposisi ahli waris.' });
      }
      ashabahGroup = null;
      adjustments.push({ type: 'aul', description:
        'Aul diterapkan: total bagian dzawil furudh (' + total.toString() + ') melebihi 1, sehingga seluruh bagian dikurangi proporsional.',
        basis: ['khi-aul'] });
      step({
        title: 'Menerapkan Aul', inputContext: 'Total bagian dzawil furudh melebihi keseluruhan harta.',
        result: 'Seluruh bagian dikurangi secara proporsional (aul).', calculation: 'Total ' + total.toString() + ' > 1 → setiap bagian ÷ ' + total.toString(),
        legalBasis: [refKHI('khi-aul')], explanation: 'Aul menjaga keadilan ketika jumlah bagian melebihi harta.', confidence: 'high',
      });
      fixedSum = new F(1);
    }

    // ---- Residue & Ashabah / Rad ----
    const results = []; // ShareResult final
    let residue = new F(1).sub(fixedSum);
    if (residue.compare(new F(0)) < 0) residue = new F(0);

    // Bangun results dari fixed terlebih dahulu
    fixed.forEach((e) => pushShareEntries(results, e, estateSummary.netEstate));

    if (residue.isPositive() && ashabahGroup) {
      distributeAshabah(results, ashabahGroup, residue, m, estateSummary.netEstate, KB);
      step({
        title: 'Membagikan sisa kepada ashabah', inputContext: ashabahGroup.note,
        result: 'Sisa ' + residue.toString() + ' bagian diberikan kepada ' + ashabahGroup.relations.map(label).join(', ') + '.',
        legalBasis: ashabahGroup.basis.map(refKHI), dalil: (ashabahGroup.dalil || []).map(refDalil),
        explanation: 'Setelah dzawil furudh menerima bagian tetap, sisanya menjadi hak ahli waris ashabah.',
        confidence: ashabahGroup.confidence,
      });
    } else if (residue.isPositive() && !ashabahGroup) {
      // RAD (kecuali suami/istri)
      const radEligible = fixed.filter((e) => e.relation !== 'husband' && e.relation !== 'wife');
      if (radEligible.length > 0) {
        let radBase = new F(0);
        radEligible.forEach((e) => { radBase = radBase.add(e.fraction); });
        // tambahkan proporsi sisa ke masing-masing entry (update results)
        radEligible.forEach((e) => {
          const extra = residue.mul(e.fraction.div(radBase));
          addRadToResults(results, e, extra, estateSummary.netEstate);
        });
        adjustments.push({ type: 'rad', description:
          'Rad diterapkan: sisa ' + residue.toString() + ' dikembalikan kepada ahli waris dzawil furudh yang berhak (selain suami/istri) secara proporsional.',
          basis: ['khi-rad'] });
        step({
          title: 'Menerapkan Rad', inputContext: 'Ada sisa harta dan tidak ada ahli waris ashabah.',
          result: 'Sisa ' + residue.toString() + ' dikembalikan kepada ahli waris yang berhak (selain suami/istri).',
          legalBasis: [refKHI('khi-rad')], explanation: 'Rad mengembalikan sisa kepada dzawil furudh sesuai porsi haknya.', confidence: 'high',
        });
      } else {
        // hanya suami/istri sebagai ahli waris → di sinilah KHI dan faraidh klasik BERBEDA
        const spouseEntry = fixed.find((e) => e.relation === 'husband' || e.relation === 'wife');
        if (mode === 'khi' && spouseEntry) {
          // Praktik Peradilan Agama: sisa diberikan kepada suami/istri (radd)
          addRadToResults(results, spouseEntry, residue, estateSummary.netEstate);
          adjustments.push({ type: 'rad', description:
            'Mode KHI: karena hanya ada suami/istri sebagai ahli waris, sisa ' + residue.toString() +
            ' diberikan kepada ' + label(spouseEntry.relation) + ' (radd, mengikuti praktik Peradilan Agama).',
            basis: ['khi-rad'] });
          warnings.push({ type: 'radd_to_spouse', severity: 'medium',
            message: 'Sisa harta diberikan kepada suami/istri (radd) sesuai praktik Peradilan Agama dalam mode KHI. Dalam faraidh klasik mayoritas, suami/istri tidak menerima radd dan sisa diserahkan ke Baitul Mal. Hasil dapat berbeda menurut mode — perlu validasi.' });
          step({ title: 'Sisa untuk suami/istri (mode KHI)', inputContext: 'Hanya ada suami/istri sebagai ahli waris.',
            result: 'Sisa ' + residue.toString() + ' diberikan kepada ' + label(spouseEntry.relation) + ' (radd).',
            legalBasis: [refKHI('khi-rad')], explanation: 'Praktik Peradilan Agama memberikan sisa kepada pasangan ketika tidak ada ahli waris lain.', confidence: 'requires_review' });
        } else {
          warnings.push({ type: 'remainder_to_baitulmal', severity: 'medium',
            message: 'Mode faraidh klasik: suami/istri tidak menerima radd. Sisa harta (' + residue.toString() + ') diserahkan kepada Baitul Mal (atau kerabat dzawil arham bila ada), atas putusan yang berwenang. Dalam mode KHI, sisa ini umumnya diberikan kepada suami/istri.' });
          recommendations.push({ title: 'Penanganan sisa harta',
            text: 'Penanganan sisa ketika hanya ada suami/istri berbeda antara KHI dan faraidh klasik. Konsultasikan dengan Pengadilan Agama untuk kepastian.' });
        }
      }
    }

    // ---- Langkah penjelasan bagian tetap (ringkas) ----
    fixed.forEach((e) => {
      step({
        title: 'Bagian ' + (e.displayRelations ? 'saudara seibu' : label(e.relation)),
        inputContext: e.note,
        result: humanGroupLabel(e) + ' mendapat ' + e.fraction.toString() + ' bagian (' + fmtIDR(fracToRupiah(e.fraction, estateSummary.netEstate)) + ').',
        calculation: 'Bagian = ' + e.fraction.toString(),
        legalBasis: (e.basis || []).map(refKHI),
        dalil: (e.dalil || []).map(refDalil),
        explanation: e.note,
        confidence: e.confidence,
      });
    });

    // ---- Kasus kompleks → warnings & recommendations (Guideline §11) ----
    applyComplexCaseNotes({
      special, estate, counts: c2, warnings, recommendations, results, estateSummary, step, mode, excluded,
    });

    // Invariant: ahli waris yang masih eligible harus menerima share atau dipindahkan ke daftar tidak dihitung.
    const relationHasShare = (relation) => {
      if (relation === 'maternal_brother' || relation === 'maternal_sister') {
        return results.some((r) => r.relation === 'maternal_sibling');
      }
      return results.some((r) => r.relation === relation);
    };
    const invariantWarnings = new Set();
    for (let i = eligible.length - 1; i >= 0; i--) {
      const h = eligible[i];
      if (!relationHasShare(h.relation)) {
        unsupportedExcluded.push({ ...h, excludedReason: 'unsupported_case',
          reason: 'Engine belum dapat menentukan bagian untuk ' + label(h.relation) + ' dalam komposisi ini; perlu validasi manual.' });
        if (!invariantWarnings.has(h.relation)) {
          warnings.push({ type: 'unsupported_share_' + h.relation, severity: 'high',
            message: label(h.relation) + ' belum mendapat bagian dari engine pada komposisi ini. Hasil ditandai perlu ditinjau agar tidak ada ahli waris yang diam-diam terlewat.' });
          invariantWarnings.add(h.relation);
        }
        eligible.splice(i, 1);
      }
    }

    // ---- Tidak ada ahli waris ----
    if (results.length === 0 && unsupportedExcluded.length === 0) {
      warnings.push({ type: 'no_heirs', severity: 'high',
        message: 'Tidak ada ahli waris yang memenuhi syarat berdasarkan data. Menurut KHI Pasal 191, atas putusan Pengadilan Agama harta dapat diserahkan kepada Baitul Mal.' });
      recommendations.push({ title: 'Konsultasi Pengadilan Agama',
        text: 'Karena tidak ada ahli waris, penyerahan harta kepada Baitul Mal memerlukan putusan Pengadilan Agama.' });
      step({ title: 'Tidak ada ahli waris', inputContext: 'Data tidak menghasilkan ahli waris yang berhak.',
        result: 'Harta dapat diserahkan ke Baitul Mal atas putusan Pengadilan Agama.',
        legalBasis: [refKHI('khi-191')], explanation: 'KHI mengatur penyerahan harta tak berahli waris kepada Baitul Mal.', confidence: 'high' });
    }

    // ---- Rekomendasi umum ----
    recommendations.push({ title: 'Selesaikan kewajiban pewaris terlebih dahulu',
      text: 'Pastikan biaya jenazah, hutang, dan wasiat (maksimal 1/3) diselesaikan sebelum pembagian.' });
    recommendations.push({ title: 'Pastikan semua ahli waris memahami bagiannya',
      text: 'Berdasarkan KHI Pasal 183, perdamaian (tasaluh) boleh dilakukan setelah masing-masing mengetahui bagian hukumnya.' });

    // ---- Verifikasi total ----
    let totalCheck = new F(0);
    results.forEach((r) => { totalCheck = totalCheck.add(r.totalFraction); });
    const distributed = results.reduce((s, r) => s + r.totalRupiah, 0);
    const roundingRemainder = estateSummary.netEstate - distributed;
    if (totalCheck.equals(new F(1)) && Math.abs(roundingRemainder) > 0 && estateSummary.netEstate > 0) {
      warnings.push({ type: 'rounding_remainder', severity: 'low',
        message: 'Terdapat selisih pembulatan rupiah sebesar ' + fmtIDR(roundingRemainder) + '. Selisih ini muncul karena pembulatan di tampilan; bagian pecahan tetap akurat.' });
    }

    return {
      estateSummary,
      eligibleHeirs: eligible.map((h) => ({ relation: h.relation, label: label(h.relation), count: h.count, name: h.name })),
      excludedHeirs: excluded.concat(hajbExcluded, unsupportedExcluded).map((h) => ({
        relation: h.relation, label: label(h.relation), count: h.count, name: h.name,
        excludedReason: h.excludedReason, reason: h.reason,
      })),
      shares: results,
      adjustments,
      legalSteps,
      warnings,
      recommendations,
      metadata: {
        mode, appVersion: APP_VERSION, schemaVersion: SCHEMA_VERSION,
        calculatedAt: new Date().toISOString(),
        totalFractionCheck: totalCheck.toString(),
        isComplete: (totalCheck.equals(new F(1)) || results.length === 0) && unsupportedExcluded.length === 0,
      },
    };
  }

  // ---- helpers untuk membangun entries ----
  function mkFixed(relation, count, fraction, note, basis, dalil, confidence, extra) {
    return Object.assign({ relation, count, fraction, note, basis, dalil, confidence }, extra || {});
  }

  function humanGroupLabel(e) {
    if (e.displayRelations) return 'Saudara seibu (' + e.count + ' orang)';
    return label(e.relation) + (e.count > 1 ? ' (' + e.count + ' orang)' : '');
  }

  // Bagi group fraction ke per-relation entries dengan gender 2:1 bila perlu
  function pushShareEntries(results, e, netEstate) {
    if (e.displayRelations) {
      // saudara seibu: dibagi rata seluruh anggota (gender tidak dibedakan)
      const perHead = e.fraction.div(new F(e.count));
      results.push(makeResult('maternal_sibling', 'Saudara seibu', e.count, e.fraction, perHead, e, netEstate));
      return;
    }
    const perHead = e.fraction.div(new F(e.count));
    results.push(makeResult(e.relation, label(e.relation), e.count, e.fraction, perHead, e, netEstate));
  }

  function makeResult(relation, lbl, count, totalFraction, perHeadFraction, e, netEstate) {
    return {
      relation, label: lbl, count,
      type: e.type || 'fixed',
      totalFraction, perHeadFraction,
      totalFractionStr: totalFraction.toString(),
      perHeadFractionStr: perHeadFraction.toString(),
      totalRupiah: fracToRupiah(totalFraction, netEstate),
      perHeadRupiah: fracToRupiah(perHeadFraction, netEstate),
      basis: e.basis || [], dalil: e.dalil || [],
      note: e.note || '', confidence: e.confidence || 'medium',
    };
  }

  function addRadToResults(results, fixedEntry, extra, netEstate) {
    const rel = fixedEntry.displayRelations ? 'maternal_sibling' : fixedEntry.relation;
    const r = results.find((x) => x.relation === rel);
    if (!r) return;
    r.totalFraction = r.totalFraction.add(extra);
    r.perHeadFraction = r.totalFraction.div(new F(r.count));
    r.totalFractionStr = r.totalFraction.toString();
    r.perHeadFractionStr = r.perHeadFraction.toString();
    r.totalRupiah = fracToRupiah(r.totalFraction, netEstate);
    r.perHeadRupiah = fracToRupiah(r.perHeadFraction, netEstate);
    r.type = (r.type || 'fixed') + '+rad';
    if (!r.basis.includes('khi-rad')) r.basis = r.basis.concat('khi-rad');
  }

  function distributeAshabah(results, group, residue, m, netEstate, KB) {
    const rels = group.relations;
    // hitung total "unit": laki-laki=2, perempuan=1
    let units = 0;
    const relInfo = rels.map((rel) => {
      const cnt = m(rel) || 0;
      const isMale = HEIR_META[rel].gender === 'male';
      const u = cnt * (isMale ? 2 : 1);
      units += u;
      return { rel, cnt, isMale, u };
    });
    if (units === 0) return;
    relInfo.forEach((ri) => {
      if (ri.cnt === 0) return;
      const groupFr = residue.mul(new F(ri.u, units));
      const perHead = groupFr.div(new F(ri.cnt));
      // gabung bila relation sudah ada (mis. ayah 1/6 + ashabah)
      const existing = results.find((x) => x.relation === ri.rel);
      if (existing) {
        existing.totalFraction = existing.totalFraction.add(groupFr);
        existing.perHeadFraction = existing.totalFraction.div(new F(existing.count));
        existing.totalFractionStr = existing.totalFraction.toString();
        existing.perHeadFractionStr = existing.perHeadFraction.toString();
        existing.totalRupiah = fracToRupiah(existing.totalFraction, netEstate);
        existing.perHeadRupiah = fracToRupiah(existing.perHeadFraction, netEstate);
        existing.type = 'fixed+ashabah';
        (group.basis || []).forEach((b) => { if (!existing.basis.includes(b)) existing.basis.push(b); });
        (group.dalil || []).forEach((b) => { if (!existing.dalil.includes(b)) existing.dalil.push(b); });
      } else {
        results.push({
          relation: ri.rel, label: label(ri.rel), count: ri.cnt, type: 'ashabah',
          totalFraction: groupFr, perHeadFraction: perHead,
          totalFractionStr: groupFr.toString(), perHeadFractionStr: perHead.toString(),
          totalRupiah: fracToRupiah(groupFr, netEstate), perHeadRupiah: fracToRupiah(perHead, netEstate),
          basis: (group.basis || []).slice(), dalil: (group.dalil || []).slice(),
          note: group.note, confidence: group.confidence,
        });
      }
    });
  }

  // ---- kasus kompleks: catatan & rekomendasi (Guideline §11) ----
  function applyComplexCaseNotes(ctx) {
    const { special, estate, counts, warnings, recommendations, results, estateSummary, step, mode } = ctx;

    // Anak angkat → wasiat wajibah maks 1/3 (KHI Pasal 209) — institusi khas KHI
    if (counts['adopted_child'] > 0 || special.hasAdoptedChild) {
      if (mode === 'khi') {
        warnings.push({ type: 'adopted_child', severity: 'medium',
          message: 'Terdapat anak angkat. Anak angkat tidak otomatis menjadi ahli waris nasab; ia dapat menerima WASIAT WAJIBAH maksimal 1/3 harta (KHI Pasal 209), bukan bagian waris.' });
        recommendations.push({ title: 'Wasiat wajibah anak angkat',
          text: 'Jika anak angkat tidak menerima wasiat, pertimbangkan wasiat wajibah maksimal 1/3 sesuai KHI Pasal 209. Tetapkan nilainya bersama ahli waris dan/atau Pengadilan Agama.' });
        step({ title: 'Catatan anak angkat (wasiat wajibah)',
          inputContext: 'Terdapat anak angkat dalam data.', result: 'Diberi catatan wasiat wajibah maksimal 1/3, bukan bagian waris nasab.',
          legalBasis: [refKHI('khi-209')], explanation: 'KHI memberi anak angkat hak wasiat wajibah, terpisah dari waris nasab.', confidence: 'requires_review' });
      } else {
        warnings.push({ type: 'adopted_child_faraidh', severity: 'medium',
          message: 'Terdapat anak angkat. Dalam faraidh klasik, anak angkat tidak mewarisi dan tidak ada kewajiban wasiat wajibah; ketentuan wasiat wajibah (maks 1/3) adalah kekhususan KHI Pasal 209. Beralihlah ke mode KHI bila ingin memperhitungkannya.' });
      }
    }
    if (counts['adoptive_parent'] > 0 || special.hasAdoptiveParent) {
      warnings.push({ type: 'adoptive_parent', severity: 'medium',
        message: mode === 'khi'
          ? 'Terdapat orang tua angkat. Berlaku ketentuan wasiat wajibah maksimal 1/3 (KHI Pasal 209), bukan bagian waris nasab.'
          : 'Terdapat orang tua angkat. Dalam faraidh klasik tidak ada kewajiban wasiat wajibah; ketentuan ini khas KHI Pasal 209.' });
    }
    // Ahli waris pengganti — institusi khas KHI Pasal 185
    if (counts['grandchild_substitute'] > 0 || special.hasSubstitute) {
      warnings.push({ type: 'substitute_heir', severity: 'high',
        message: mode === 'khi'
          ? 'Terdapat ahli waris pengganti (KHI Pasal 185). Bagiannya tidak boleh melebihi bagian ahli waris sederajat dengan yang digantikan. Kasus ini sensitif secara hukum dan perlu validasi.'
          : 'Terdapat ahli waris pengganti. Institusi "ahli waris pengganti" hanya dikenal dalam KHI (Pasal 185), tidak dalam faraidh klasik. Dalam faraidh, cucu hanya mewarisi langsung bila tidak terhalang. Beralihlah ke mode KHI bila ingin menerapkannya.' });
    }
    // Anak luar perkawinan
    if (special.hasIllegitimateChild) {
      warnings.push({ type: 'illegitimate_child', severity: 'high',
        message: 'Terdapat anak luar perkawinan. Dalam mode KHI default, anak luar perkawinan hanya saling mewaris dengan ibu dan keluarga ibu. Jangan dihubungkan otomatis ke ayah biologis. Perlu validasi ahli.' });
    }
    // Ahli waris beda agama
    if (special.hasDifferentReligionHeir || ctx.excluded.some((e) => e.excludedReason === 'different_religion')) {
      warnings.push({ type: 'different_religion', severity: 'medium',
        message: 'Terdapat ahli waris beda agama. Dalam mode hukum Islam/KHI, ahli waris non-Muslim tidak dimasukkan. Hak wasiat wajibah beda agama tidak disimpulkan otomatis oleh engine.' });
    }
    // Ahli waris belum dewasa
    if (special.hasMinorHeir) {
      warnings.push({ type: 'minor_heir', severity: 'low',
        message: 'Terdapat ahli waris yang belum dewasa. Bagiannya tetap dihitung, namun haknya perlu diwakili/dijaga oleh wali sesuai ketentuan hukum.' });
      recommendations.push({ title: 'Perwalian ahli waris belum dewasa',
        text: 'Tunjuk wali yang sah untuk menjaga hak ahli waris yang belum dewasa hingga ia dewasa.' });
    }
    // Poligami / harta bersama
    if (special.isPolygamy || counts['wife'] > 1) {
      warnings.push({ type: 'polygamy', severity: 'medium',
        message: 'Pewaris memiliki lebih dari satu istri. Bagian harta bersama setiap perkawinan dapat berbeda dan sebaiknya dihitung terpisah sebelum waris.' });
    }
    if (estate && (estate.jointPropertyTotal || estate.deceasedShareOfJointProperty)) {
      recommendations.push({ title: 'Pisahkan harta bersama (gono-gini)',
        text: 'Pastikan bagian harta bersama pasangan dipisahkan terlebih dahulu; yang diwariskan hanya bagian pewaris.' });
    }
    // Hibah
    if (estate && estate.grants && estate.grants.length) {
      warnings.push({ type: 'grants', severity: 'medium',
        message: 'Terdapat hibah. Hibah berbeda dari waris dan wasiat. Hibah orang tua kepada anak dapat diperhitungkan sebagai warisan; hibah saat sakit dekat kematian perlu persetujuan ahli waris. Tetapkan statusnya: sah, diperhitungkan, atau disengketakan.' });
    }
    // Tanah pertanian < 2 ha
    if (special.farmlandUnder2ha) {
      recommendations.push({ title: 'Lahan pertanian < 2 hektar',
        text: 'Pertahankan kesatuan lahan bila memungkinkan; bila tidak, pertimbangkan kompensasi nilai antar ahli waris.' });
    }
    // Status belum pasti
    if (special.hasUncertainStatus) {
      warnings.push({ type: 'uncertain_status', severity: 'medium',
        message: 'Terdapat data agama atau status hidup ahli waris yang belum pasti. Hasil dapat berubah; pastikan data terlebih dahulu.' });
    }
  }

  // ---- referensi & format ----
  function refKHI(id) {
    const a = KB.khi(id);
    if (!a) return { source: 'OTHER', textSummary: id, verificationStatus: 'needs_review' };
    return { source: a.source, article: a.article, title: a.topic, textSummary: a.summary, verificationStatus: a.verificationStatus };
  }
  function refDalil(id) {
    const d = KB.quran(id) || KB.hadith(id);
    if (!d) return { source: 'OTHER', reference: id, translationSummary: id, sourceName: '', verificationStatus: 'needs_review' };
    return { source: d.source, reference: d.reference, translationSummary: d.translationSummary, sourceName: d.sourceName, verificationStatus: d.verificationStatus };
  }

  function fracToRupiah(fraction, netEstate) {
    // pembulatan hanya di sini (layer hasil); pecahan tetap sumber kebenaran
    return Math.round(fraction.toNumber() * netEstate);
  }
  function fmtIDR(v) {
    try {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0);
    } catch (e) { return 'Rp' + (v || 0); }
  }

  HS.engine = { calculateInheritance, calculateEstate, HEIR_META, label, fmtIDR, APP_VERSION, SCHEMA_VERSION };
})(typeof window !== 'undefined' ? window : globalThis);
