/* Test deterministik engine waris (dijalankan dengan Node). */
const g = globalThis;
require('./fraction.js');
require('./knowledge-base.js');
require('./engine.js');
const { calculateInheritance } = g.HS.engine;

let pass = 0, fail = 0;
function approxFrac(results, relation) {
  const r = results.shares.find((x) => x.relation === relation);
  return r ? r.totalFractionStr : '(tidak ada)';
}
function eq(name, got, want) {
  if (got === want) { pass++; console.log('  ✓', name, '=', got); }
  else { fail++; console.log('  ✗', name, 'GOT', got, 'WANT', want); }
}
function heirs(...list) {
  return list.map((x, i) => ({
    id: 'h' + i, relation: x[0], count: x[1] || 1,
    gender: g.HS.engine.HEIR_META[x[0]].gender === 'female' ? 'female' : 'male',
    religionStatus: 'muslim', isAliveAtDeath: true,
  }));
}
function calc(hs, estate) {
  return calculateInheritance({ mode: 'khi', estate: estate || { grossAssets: 240000000, funeralCost: 0, debts: 0, wills: [] }, heirs: hs, special: {} });
}

console.log('TC1: Suami + anak (1 anak laki-laki)');
let r = calc(heirs(['husband'], ['son']));
eq('suami', approxFrac(r, 'husband'), '1/4');
eq('anak lk (ashabah sisa)', approxFrac(r, 'son'), '3/4');

console.log('TC2: Istri + anak');
r = calc(heirs(['wife'], ['son']));
eq('istri', approxFrac(r, 'wife'), '1/8');
eq('anak lk', approxFrac(r, 'son'), '7/8');

console.log('TC3: Ayah + Ibu + anak laki-laki');
r = calc(heirs(['father'], ['mother'], ['son']));
eq('ayah', approxFrac(r, 'father'), '1/6');
eq('ibu', approxFrac(r, 'mother'), '1/6');
eq('anak lk', approxFrac(r, 'son'), '4/6'.replace('4/6', '2/3'));

console.log('TC4: Anak laki-laki + anak perempuan (2:1)');
r = calc(heirs(['son', 1], ['daughter', 1]));
eq('anak lk', approxFrac(r, 'son'), '2/3');
eq('anak pr', approxFrac(r, 'daughter'), '1/3');

console.log('TC5: Satu anak perempuan saja');
r = calc(heirs(['daughter', 1]));
eq('anak pr 1/2 + rad', approxFrac(r, 'daughter'), '1'); // 1/2 lalu rad penuh

console.log('TC5b: Suami + satu anak perempuan (rad ke anak pr)');
r = calc(heirs(['husband'], ['daughter', 1]));
eq('suami', approxFrac(r, 'husband'), '1/4');
eq('anak pr (1/2 + rad)', approxFrac(r, 'daughter'), '3/4');

console.log('TC6: Dua anak perempuan');
r = calc(heirs(['daughter', 2]));
eq('2 anak pr (2/3 + rad = 1)', approxFrac(r, 'daughter'), '1');

console.log('TC7: Ibu dengan dua saudara (kalalah) → ibu 1/6');
r = calc(heirs(['mother'], ['full_brother', 2]));
eq('ibu', approxFrac(r, 'mother'), '1/6');

console.log('TC8: Saudara seibu kalalah (1 orang)');
r = calc(heirs(['maternal_brother', 1], ['full_brother', 1]));
eq('saudara seibu 1/6', approxFrac(r, 'maternal_sibling'), '1/6');

console.log('TC9: Saudari kandung kalalah (1) → 1/2 + rad');
r = calc(heirs(['full_sister', 1]));
eq('saudari kandung', approxFrac(r, 'full_sister'), '1');

console.log('TC10: Aul — suami + 2 saudari kandung');
r = calc(heirs(['husband'], ['full_sister', 2]));
// 1/2 + 2/3 = 7/6 → aul: suami 3/7, saudari 4/7
eq('suami (aul)', approxFrac(r, 'husband'), '3/7');
eq('saudari (aul)', approxFrac(r, 'full_sister'), '4/7');

console.log('TC11: Rad — ibu + anak perempuan');
r = calc(heirs(['mother'], ['daughter', 1]));
// ibu 1/6, anak pr 1/2, sisa 1/3 dibagi rad proporsional (1:3) → ibu 1/4, anak pr 3/4
eq('ibu (rad)', approxFrac(r, 'mother'), '1/4');
eq('anak pr (rad)', approxFrac(r, 'daughter'), '3/4');

console.log('TC12: Suami + istri tidak mungkin; uji istri ganda (poligami janda 1/8 dibagi)');
r = calc(heirs(['wife', 2], ['son']));
eq('istri (gabungan 1/8)', approxFrac(r, 'wife'), '1/8');

console.log('TC13: Gharrawain — suami + ayah + ibu');
r = calc(heirs(['husband'], ['father'], ['mother']));
// suami 1/2, sisa 1/2; ibu 1/3 sisa = 1/6, ayah ashabah = 1/3
eq('suami', approxFrac(r, 'husband'), '1/2');
eq('ibu (1/3 sisa)', approxFrac(r, 'mother'), '1/6');
eq('ayah (ashabah)', approxFrac(r, 'father'), '1/3');

console.log('TC14: Beda agama dikecualikan');
r = calculateInheritance({ mode: 'khi', estate: { grossAssets: 100000000, wills: [] },
  heirs: [{ id: 'a', relation: 'son', count: 1, gender: 'male', religionStatus: 'non_muslim', isAliveAtDeath: true },
          { id: 'b', relation: 'daughter', count: 1, gender: 'female', religionStatus: 'muslim', isAliveAtDeath: true }], special: {} });
eq('anak lk non-muslim dikecualikan', r.excludedHeirs.some((e) => e.relation === 'son' && e.excludedReason === 'different_religion'), true);
eq('anak pr muslim (1/2 + rad = 1)', approxFrac(r, 'daughter'), '1');

console.log('TC15: Penghalang membunuh');
r = calculateInheritance({ mode: 'khi', estate: { grossAssets: 100000000, wills: [] },
  heirs: [{ id: 'a', relation: 'son', count: 1, gender: 'male', religionStatus: 'muslim', isAliveAtDeath: true, isLegallyBlocked: true, blockReason: 'murder' },
          { id: 'b', relation: 'daughter', count: 1, gender: 'female', religionStatus: 'muslim', isAliveAtDeath: true }], special: {} });
eq('anak lk pembunuh dikecualikan', r.excludedHeirs.some((e) => e.relation === 'son' && e.excludedReason === 'legal_blocker'), true);

console.log('TC16: Estate — wasiat melebihi 1/3 dibatasi');
const est = calc(heirs(['son']), { grossAssets: 300000000, funeralCost: 0, debts: 0, wills: [{ amount: 200000000 }] });
eq('wasiat dibatasi 1/3 (100jt)', est.estateSummary.effectiveWasiat, 100000000);
eq('harta bersih 200jt', est.estateSummary.netEstate, 200000000);
eq('warning wasiat', est.warnings.some((w) => w.type === 'wasiat_exceeds_third'), true);

console.log('TC17: Nominal — suami+anak dari 240jt');
r = calc(heirs(['husband'], ['son']), { grossAssets: 240000000, funeralCost: 0, debts: 0, wills: [] });
const su = r.shares.find((x) => x.relation === 'husband');
eq('suami nominal 60jt', su.totalRupiah, 60000000);

console.log('TC18: Mode KHI — hanya istri (radd ke istri)');
r = calculateInheritance({ mode: 'khi', estate: { grossAssets: 100000000, wills: [] },
  heirs: [{ id: 'a', relation: 'wife', count: 1, gender: 'female', religionStatus: 'muslim', isAliveAtDeath: true }], special: {} });
eq('istri KHI dapat seluruh (radd)', approxFrac(r, 'wife'), '1');
eq('ada adjustment rad', r.adjustments.some((a) => a.type === 'rad'), true);

console.log('TC19: Mode Faraidh — hanya istri (tidak radd)');
r = calculateInheritance({ mode: 'faraidh', estate: { grossAssets: 100000000, wills: [] },
  heirs: [{ id: 'a', relation: 'wife', count: 1, gender: 'female', religionStatus: 'muslim', isAliveAtDeath: true }], special: {} });
eq('istri faraidh tetap 1/4', approxFrac(r, 'wife'), '1/4');
eq('warning sisa ke baitul mal', r.warnings.some((w) => w.type === 'remainder_to_baitulmal'), true);

console.log('\n================');
console.log('PASS:', pass, 'FAIL:', fail);
process.exit(fail ? 1 : 0);
