/*
 * Hitung Syariah — UI (vanilla). UI hanya memanggil engine & menampilkan hasil. (§5)
 */
(function (global) {
  'use strict';
  const HS = (global.HS = global.HS || {});
  const E = HS.engine, S = HS.storage, KB = HS.KB;
  const fmt = E.fmtIDR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---- icons (inline SVG, lucide-style) ----
  const I = {
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    warn: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    scale: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
    book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    lock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    calc: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    caret: '<svg class="caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    users: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7H7v7M7 3v4h8"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
    pdf: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  };

  // ---- relations grouped for select ----
  const REL_GROUPS = [
    ['Pasangan', ['husband', 'wife']],
    ['Orang tua & leluhur', ['father', 'mother', 'grandfather', 'grandmother']],
    ['Keturunan', ['son', 'daughter', 'grandson_from_son', 'granddaughter_from_son', 'grandchild_substitute']],
    ['Saudara', ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister']],
    ['Khusus', ['adopted_child', 'adoptive_parent']],
  ];

  const TIPS = {
    tirkah: 'Tirkah: seluruh harta peninggalan pewaris setelah dipisahkan dari hak orang lain.',
    ashabah: 'Ashabah: ahli waris yang menerima sisa harta setelah bagian tetap (dzawil furudh) dibagikan.',
    aul: 'Aul: penyebut dinaikkan ketika jumlah bagian melebihi harta, sehingga semua bagian berkurang proporsional.',
    rad: 'Rad: sisa harta dikembalikan kepada ahli waris dzawil furudh (selain suami/istri) bila tidak ada ashabah.',
    hajb: 'Hajb: ahli waris tertentu terhalang oleh ahli waris yang lebih dekat.',
    dzawil: 'Dzawil furudh: ahli waris yang bagiannya telah ditentukan secara pasti dalam Al-Qur\u2019an/KHI.',
    wasiat: 'Wasiat wajibah: pemberian wajib (maks 1/3) untuk pihak tertentu seperti anak angkat menurut KHI.',
  };

  // ---- state ----
  const blank = () => ({
    mode: 'khi',
    estate: { grossAssets: '', jointPropertyTotal: '', deceasedShareOfJointProperty: '', funeralCost: '', medicalCostBeforeDeath: '', debts: '', wills: [], grants: [], willsApprovedByAllHeirs: false, notes: '' },
    heirs: [],
    special: {},
  });
  let st = { ci: blank(), step: 0, editingId: null, result: null, caseTitle: '' };

  const STEPS = ['Pengantar', 'Harta', 'Kewajiban', 'Ahli Waris', 'Kasus Khusus', 'Tinjau'];

  // ---- utilities ----
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function tip(text, label) { return '<span class="tip" title="' + esc(text) + '">' + esc(label) + '</span>'; }

  // =========================================================================
  // NAV
  // =========================================================================
  function go(view) {
    $$('.view').forEach((v) => v.classList.remove('active'));
    $$('#nav button').forEach((b) => b.classList.remove('active'));
    const map = { home: 'home', wizard: 'wizard', result: 'result', history: 'history', about: 'about' };
    const v = $('#view-' + (map[view] || 'home'));
    if (v) v.classList.add('active');
    const navBtn = $('#nav button[data-view="' + (view === 'result' ? 'wizard' : view) + '"]');
    if (navBtn) navBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'home') renderHome();
    if (view === 'wizard') renderWizard();
    if (view === 'history') renderHistory();
    if (view === 'about') renderAbout();
  }

  // =========================================================================
  // HOME
  // =========================================================================
  function renderHome() {
    $('#view-home').innerHTML = `
      <div class="hero">
        <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <span class="kicker">${I.scale} KHI Indonesia + Faraidh</span>
        <h1>Hitung waris dengan <span class="accent">tenang</span> dan transparan</h1>
        <p>Hitung Syariah membantu Anda menyimulasikan pembagian waris Islam berdasarkan Kompilasi Hukum Islam (KHI) Indonesia dan kaidah faraidh — lengkap dengan langkah perhitungan, dasar hukum, dan dalil.</p>
        <div class="actions" style="justify-content:center;margin-top:24px;">
          <button class="btn btn-primary" onclick="HS.app.startNew()">${I.calc} Mulai hitung waris</button>
          <button class="btn btn-ghost" onclick="HS.app.go('about')">Pelajari dulu</button>
        </div>
      </div>

      <div class="card">
        <div class="disclaimer">
          <span class="ico">${I.info}</span>
          <p><b>Alat bantu edukatif, bukan putusan hukum.</b> Hasil dari Hitung Syariah adalah simulasi untuk membantu memahami hak waris. Ini bukan pengganti putusan Pengadilan Agama, fatwa, atau nasihat hukum. Perlu validasi untuk kasus nyata atau sengketa.</p>
        </div>
        <div class="feat">
          <div class="f"><span class="ico">${I.scale}</span><div><b>Akurat secara hitung</b><small>Bagian disimpan sebagai pecahan rasional, bukan floating point. Mendukung aul & rad.</small></div></div>
          <div class="f"><span class="ico">${I.book}</span><div><b>Transparan secara hukum</b><small>Setiap langkah disertai pasal KHI dan dalil Al-Qur\u2019an/Hadis.</small></div></div>
          <div class="f"><span class="ico">${I.lock}</span><div><b>Privasi terjaga</b><small>Data disimpan lokal di perangkat Anda. Tidak dikirim ke server.</small></div></div>
          <div class="f"><span class="ico">${I.users}</span><div><b>Ramah untuk awam</b><small>Wizard bertahap, penjelasan sederhana, dan tooltip istilah faraidh.</small></div></div>
        </div>
      </div>`;
  }

  function startNew() { st = { ci: blank(), step: 0, editingId: null, result: null, caseTitle: '' }; go('wizard'); }

  // =========================================================================
  // WIZARD
  // =========================================================================
  function progressBar() {
    return '<div class="progress">' + STEPS.map((_, i) =>
      `<div class="dot ${i < st.step ? 'done' : ''} ${i === st.step ? 'cur' : ''}"></div>`).join('') + '</div>';
  }
  function money(name, val, ph) {
    return `<div class="money-input"><input type="number" min="0" step="any" id="${name}" value="${val === '' || val == null ? '' : esc(val)}" placeholder="${ph || '0'}" /></div>`;
  }

  function renderWizard() {
    const v = $('#view-wizard');
    let body = '';
    if (st.step === 0) body = stepIntro();
    else if (st.step === 1) body = stepEstate();
    else if (st.step === 2) body = stepLiabilities();
    else if (st.step === 3) body = stepHeirs();
    else if (st.step === 4) body = stepSpecial();
    else if (st.step === 5) body = stepReview();
    v.innerHTML = progressBar() + body;
    if (st.step === 3) bindHeirEvents();
  }

  function navButtons(opts) {
    opts = opts || {};
    const next = opts.nextLabel || 'Lanjut';
    const nextFn = opts.nextFn || 'HS.app.next()';
    return `<div class="actions">
      ${st.step > 0 ? `<button class="btn btn-ghost" onclick="HS.app.prev()">Kembali</button>` : ''}
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="${nextFn}">${next}</button>
    </div>`;
  }

  function stepIntro() {
    return `<div class="card">
      <div class="card-head"><span class="step-tag">Langkah 1 dari 6</span></div>
      <h2>Selamat datang</h2>
      <p class="lead">Kita akan mengisi data secara bertahap. Anda dapat kembali kapan saja untuk mengubah data.</p>
      <div class="disclaimer" style="margin-top:16px;">
        <span class="ico">${I.warn}</span>
        <p><b>Sebelum mulai:</b> hasil perhitungan ini bersifat simulasi edukatif berdasarkan data yang Anda masukkan. Untuk pembagian nyata, sengketa, atau kasus kompleks, mohon validasi dengan Pengadilan Agama atau ahli yang berwenang.</p>
      </div>
      <hr class="divider" />
      <div class="field">
        <label>Mode dasar hukum</label>
        <div class="mode-pill">
          <button class="${st.ci.mode === 'khi' ? 'on' : ''}" onclick="HS.app.setMode('khi')">KHI Indonesia</button>
          <button class="${st.ci.mode === 'faraidh' ? 'on' : ''}" onclick="HS.app.setMode('faraidh')">Faraidh klasik</button>
        </div>
        <div class="hint">Default adalah <b>KHI Indonesia</b>. Faraidh digunakan sebagai penjelas dan pembanding. Bila berbeda, KHI diutamakan.</div>
        <div class="disclaimer" style="margin-top:10px;"><span class="ico">${I.info}</span><p>Untuk kasus dasar, kedua mode <b>memberi hasil sama</b>. Perbedaan muncul pada: <b>ahli waris pengganti</b> & <b>wasiat wajibah</b> (hanya KHI), serta <b>sisa harta ketika hanya ada suami/istri</b> — di KHI sisa diberikan kepada pasangan, di faraidh klasik tidak (ke Baitul Mal).</p></div>
      </div>
      ${navButtons({ nextLabel: 'Mulai isi data' })}
    </div>`;
  }

  function stepEstate() {
    const e = st.ci.estate;
    return `<div class="card">
      <div class="card-head"><span class="step-tag">Langkah 2 dari 6</span></div>
      <h2>Harta peninggalan</h2>
      <p class="lead">Masukkan harta pribadi pewaris dan, bila ada, harta bersama (gono-gini).</p>
      <div class="field">
        <label>Harta pribadi pewaris</label>
        ${money('grossAssets', e.grossAssets, 'mis. 200000000')}
        <div class="hint">Harta bawaan/pribadi milik pewaris (di luar harta bersama).</div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Total harta bersama (opsional)</label>
          ${money('jointPropertyTotal', e.jointPropertyTotal)}
          <div class="hint">Harta yang diperoleh selama perkawinan.</div>
        </div>
        <div class="field">
          <label>Bagian pewaris dari harta bersama (opsional)</label>
          ${money('deceasedShareOfJointProperty', e.deceasedShareOfJointProperty)}
          <div class="hint">Kosongkan untuk asumsi 1/2 dari harta bersama.</div>
        </div>
      </div>
      <div class="disclaimer">
        <span class="ico">${I.info}</span>
        <p>Bagian pasangan atas harta bersama <b>bukan</b> bagian waris, melainkan haknya sendiri. Yang diwariskan hanya harta pribadi pewaris + bagian pewaris atas harta bersama.</p>
      </div>
      ${navButtons()}
    </div>`;
  }

  function stepLiabilities() {
    const e = st.ci.estate;
    const willsHtml = (e.wills || []).map((w, i) => `
      <div class="heir-row" style="grid-template-columns:1.4fr 1fr auto;">
        <div class="field full"><label>Penerima / keterangan wasiat</label><input type="text" data-will="desc" data-i="${i}" value="${esc(w.desc || '')}" placeholder="mis. yayasan / anak angkat"/></div>
        <div class="field"><label>Nilai</label><div class="money-input"><input type="number" min="0" data-will="amount" data-i="${i}" value="${w.amount == null ? '' : esc(w.amount)}"/></div></div>
        <button class="del" title="Hapus" onclick="HS.app.removeWill(${i})">${I.trash}</button>
      </div>`).join('');
    return `<div class="card">
      <div class="card-head"><span class="step-tag">Langkah 3 dari 6</span></div>
      <h2>Kewajiban & wasiat</h2>
      <p class="lead">Kewajiban pewaris diselesaikan sebelum harta dibagi.</p>
      <div class="field-row">
        <div class="field"><label>Biaya pengurusan jenazah</label>${money('funeralCost', e.funeralCost)}</div>
        <div class="field"><label>Biaya sakit sebelum wafat</label>${money('medicalCostBeforeDeath', e.medicalCostBeforeDeath)}</div>
      </div>
      <div class="field"><label>Hutang pewaris</label>${money('debts', e.debts)}</div>
      <hr class="divider" />
      <div class="field"><label>${tip(TIPS.wasiat, 'Wasiat')} (maksimal 1/3 harta)</label>
        <div id="wills-list">${willsHtml || '<div class="empty" style="padding:18px;">Belum ada wasiat.</div>'}</div>
        <button class="btn btn-soft btn-sm" style="margin-top:8px;" onclick="HS.app.addWill()">${I.plus} Tambah wasiat</button>
      </div>
      <label class="check"><input type="checkbox" id="willsApproved" ${e.willsApprovedByAllHeirs ? 'checked' : ''}/>
        <div><div class="t">Wasiat melebihi 1/3 disetujui semua ahli waris</div><div class="d">Centang hanya bila benar-benar disetujui semua ahli waris (KHI Pasal 194).</div></div></label>
      <label class="check"><input type="checkbox" id="hasGrants" ${(e.grants && e.grants.length) ? 'checked' : ''}/>
        <div><div class="t">Ada hibah yang perlu dicatat</div><div class="d">Hibah berbeda dari waris/wasiat dan akan ditandai sebagai catatan untuk ditinjau.</div></div></label>
      ${navButtons()}
    </div>`;
  }

  function stepHeirs() {
    return `<div class="card">
      <div class="card-head"><span class="step-tag">Langkah 4 dari 6</span></div>
      <h2>Ahli waris</h2>
      <p class="lead">Tambahkan setiap kelompok ahli waris beserta jumlahnya.</p>
      <div id="heirs-list">${renderHeirRows()}</div>
      <button class="btn btn-soft btn-sm" style="margin-top:6px;" onclick="HS.app.addHeir()">${I.plus} Tambah ahli waris</button>
      <div class="disclaimer" style="margin-top:16px;">
        <span class="ico">${I.info}</span>
        <p>Jenis kelamin ditentukan otomatis dari jenis hubungan. Untuk ahli waris pengganti (cucu menggantikan), pilih hubungan <b>Cucu (ahli waris pengganti)</b> dan tandai pada langkah berikutnya.</p>
      </div>
      ${navButtons()}
    </div>`;
  }

  function renderHeirRows() {
    if (!st.ci.heirs.length) return `<div class="empty">${I.users}<div>Belum ada ahli waris ditambahkan.</div></div>`;
    return st.ci.heirs.map((h, i) => {
      const opts = REL_GROUPS.map(([g, rels]) =>
        `<optgroup label="${g}">` + rels.map((r) => `<option value="${r}" ${h.relation === r ? 'selected' : ''}>${esc(E.HEIR_META[r].label)}</option>`).join('') + '</optgroup>').join('');
      return `<div class="heir-row" data-i="${i}">
        <div class="field"><label>Hubungan</label><select data-f="relation" data-i="${i}">${opts}</select></div>
        <div class="field"><label>Jumlah</label><input type="number" min="1" data-f="count" data-i="${i}" value="${h.count || 1}"/></div>
        <div class="field"><label>Status</label><select data-f="status" data-i="${i}">
          <option value="ok" ${heirStatus(h) === 'ok' ? 'selected' : ''}>Berhak (Muslim, hidup)</option>
          <option value="non_muslim" ${heirStatus(h) === 'non_muslim' ? 'selected' : ''}>Beda agama</option>
          <option value="deceased" ${heirStatus(h) === 'deceased' ? 'selected' : ''}>Wafat sebelum pewaris</option>
          <option value="blocked" ${heirStatus(h) === 'blocked' ? 'selected' : ''}>Terhalang (mis. membunuh)</option>
          <option value="unknown" ${heirStatus(h) === 'unknown' ? 'selected' : ''}>Belum pasti</option>
        </select></div>
        <button class="del" title="Hapus" onclick="HS.app.removeHeir(${i})">${I.trash}</button>
      </div>`;
    }).join('');
  }
  function heirStatus(h) {
    if (h.isLegallyBlocked) return 'blocked';
    if (h.religionStatus === 'non_muslim') return 'non_muslim';
    if (h.isAliveAtDeath === false) return 'deceased';
    if (h.religionStatus === 'unknown') return 'unknown';
    return 'ok';
  }
  function bindHeirEvents() {
    $$('#heirs-list [data-f]').forEach((el) => {
      el.addEventListener('change', (ev) => {
        const i = +ev.target.dataset.i, f = ev.target.dataset.f, h = st.ci.heirs[i];
        if (f === 'relation') { h.relation = ev.target.value; h.gender = E.HEIR_META[h.relation].gender === 'female' ? 'female' : 'male'; }
        else if (f === 'count') h.count = Math.max(1, +ev.target.value || 1);
        else if (f === 'status') {
          h.isLegallyBlocked = false; h.blockReason = undefined; h.religionStatus = 'muslim'; h.isAliveAtDeath = true;
          const s = ev.target.value;
          if (s === 'non_muslim') h.religionStatus = 'non_muslim';
          else if (s === 'deceased') h.isAliveAtDeath = false;
          else if (s === 'blocked') { h.isLegallyBlocked = true; h.blockReason = 'murder'; }
          else if (s === 'unknown') h.religionStatus = 'unknown';
        }
      });
    });
  }

  function stepSpecial() {
    const s = st.ci.special;
    const toggles = [
      ['hasSubstitute', 'Ada ahli waris pengganti', 'Cucu/keturunan menggantikan ahli waris yang wafat lebih dulu (KHI Pasal 185).'],
      ['isPolygamy', 'Pewaris memiliki lebih dari satu istri', 'Harta bersama tiap perkawinan dapat berbeda dan perlu dihitung terpisah.'],
      ['hasIllegitimateChild', 'Ada anak luar perkawinan', 'Default KHI: hanya saling mewaris dengan ibu dan keluarga ibu.'],
      ['hasDifferentReligionHeir', 'Ada ahli waris beda agama', 'Dalam mode KHI, ahli waris non-Muslim tidak dimasukkan.'],
      ['hasMinorHeir', 'Ada ahli waris belum dewasa', 'Bagiannya dihitung, namun perlu diwakili wali yang sah.'],
      ['farmlandUnder2ha', 'Aset berupa lahan pertanian < 2 hektar', 'Dianjurkan mempertahankan kesatuan lahan bila memungkinkan.'],
      ['hasUncertainStatus', 'Ada data agama/status hidup yang belum pasti', 'Hasil dapat berubah; pastikan data terlebih dahulu.'],
    ];
    return `<div class="card">
      <div class="card-head"><span class="step-tag">Langkah 5 dari 6</span></div>
      <h2>Kasus khusus</h2>
      <p class="lead">Tandai bila ada. Engine akan menambahkan catatan, peringatan, dan rekomendasi yang sesuai.</p>
      ${toggles.map(([k, t, d]) => `<label class="check"><input type="checkbox" data-sp="${k}" ${s[k] ? 'checked' : ''}/><div><div class="t">${t}</div><div class="d">${d}</div></div></label>`).join('')}
      <div class="disclaimer" style="margin-top:8px;"><span class="ico">${I.info}</span><p>Kasus-kasus ini sering sensitif secara hukum. Hitung Syariah akan menandainya sebagai <b>perlu ditinjau</b> agar Anda berhati-hati.</p></div>
      ${navButtons()}
    </div>`;
  }

  function stepReview() {
    const c = st.ci, e = c.estate;
    const heirList = c.heirs.length
      ? c.heirs.map((h) => `<div class="chip">${esc(E.HEIR_META[h.relation].label)} × ${h.count}${heirStatus(h) !== 'ok' ? ' · ' + heirStatus(h) : ''}</div>`).join(' ')
      : '<span class="muted">Belum ada ahli waris.</span>';
    const specials = Object.keys(c.special).filter((k) => c.special[k]);
    return `<div class="card">
      <div class="card-head"><span class="step-tag">Langkah 6 dari 6</span></div>
      <h2>Tinjau data</h2>
      <p class="lead">Periksa ringkasan sebelum menghitung.</p>
      <div class="data-list">
        <div class="row"><span class="k">Mode dasar hukum</span><div>${c.mode === 'khi' ? 'KHI Indonesia' : 'Faraidh klasik'}</div></div>
        <div class="row"><span class="k">Harta pribadi pewaris</span><div>${fmt(num(e.grossAssets))}</div></div>
        ${e.jointPropertyTotal ? `<div class="row"><span class="k">Harta bersama</span><div>${fmt(num(e.jointPropertyTotal))}${e.deceasedShareOfJointProperty ? ' · bagian pewaris ' + fmt(num(e.deceasedShareOfJointProperty)) : ' · bagian pewaris diasumsikan 1/2'}</div></div>` : ''}
        <div class="row"><span class="k">Biaya jenazah</span><div>${fmt(num(e.funeralCost))}</div></div>
        <div class="row"><span class="k">Biaya sakit</span><div>${fmt(num(e.medicalCostBeforeDeath))}</div></div>
        <div class="row"><span class="k">Hutang pewaris</span><div>${fmt(num(e.debts))}</div></div>
        <div class="row"><span class="k">Wasiat</span><div>${(e.wills || []).length ? (e.wills || []).map((w) => esc(w.desc || 'Wasiat') + ': ' + fmt(num(w.amount))).join('<br/>') + (e.willsApprovedByAllHeirs ? '<br/><span class="muted">disetujui semua ahli waris</span>' : '') : '<span class="muted">Tidak ada</span>'}</div></div>
        ${e.grants && e.grants.length ? `<div class="row"><span class="k">Hibah</span><div><span class="chip review">ada — perlu ditinjau</span></div></div>` : ''}
        <div class="row"><span class="k">Ahli waris (${c.heirs.length})</span><div>${heirList}</div></div>
        <div class="row"><span class="k">Kasus khusus</span><div>${specials.length ? specials.map((s) => '<span class="chip review">' + specialLabel(s) + '</span>').join(' ') : '<span class="muted">Tidak ada</span>'}</div></div>
      </div>
      ${navButtons({ nextLabel: 'Hitung pembagian waris', nextFn: 'HS.app.compute()' })}
    </div>`;
  }

  // ---- collect inputs from current step before navigating ----
  function collectStep() {
    const e = st.ci.estate;
    if (st.step === 1) {
      e.grossAssets = valNum('grossAssets'); e.jointPropertyTotal = valNum('jointPropertyTotal');
      e.deceasedShareOfJointProperty = valNum('deceasedShareOfJointProperty');
    } else if (st.step === 2) {
      e.funeralCost = valNum('funeralCost'); e.medicalCostBeforeDeath = valNum('medicalCostBeforeDeath'); e.debts = valNum('debts');
      collectWills();
      const ap = $('#willsApproved'); if (ap) e.willsApprovedByAllHeirs = ap.checked;
      const hg = $('#hasGrants'); if (hg) e.grants = hg.checked ? [{ status: 'review' }] : [];
    } else if (st.step === 4) {
      $$('[data-sp]').forEach((el) => { st.ci.special[el.dataset.sp] = el.checked; });
    }
  }
  function collectWills() {
    $$('#wills-list [data-will]').forEach((el) => {
      const i = +el.dataset.i, k = el.dataset.will;
      if (!st.ci.estate.wills[i]) return;
      st.ci.estate.wills[i][k] = k === 'amount' ? valNum2(el.value) : el.value;
    });
  }
  function valNum(id) { const el = $('#' + id); return el ? (el.value === '' ? '' : Number(el.value)) : ''; }
  function valNum2(v) { return v === '' ? '' : Number(v); }
  function num(v) { return v == null || v === '' ? 0 : Number(v) || 0; }
  function specialLabel(k) {
    return ({ hasSubstitute: 'Ahli waris pengganti', isPolygamy: 'Poligami', hasIllegitimateChild: 'Anak luar perkawinan',
      hasDifferentReligionHeir: 'Ahli waris beda agama', hasMinorHeir: 'Ahli waris belum dewasa',
      farmlandUnder2ha: 'Lahan pertanian < 2 ha', hasUncertainStatus: 'Status belum pasti' }[k]) || k;
  }

  function next() { collectStep(); if (st.step < 5) { st.step++; renderWizard(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  function prev() { collectStep(); if (st.step > 0) { st.step--; renderWizard(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  function setMode(m) { st.ci.mode = m; renderWizard(); }

  function addHeir() { collectStep(); st.ci.heirs.push({ id: 'h' + Date.now(), relation: 'son', gender: 'male', count: 1, religionStatus: 'muslim', isAliveAtDeath: true }); $('#heirs-list').innerHTML = renderHeirRows(); bindHeirEvents(); }
  function removeHeir(i) { collectStep(); st.ci.heirs.splice(i, 1); $('#heirs-list').innerHTML = renderHeirRows(); bindHeirEvents(); }
  function addWill() { collectStep(); st.ci.estate.wills.push({ desc: '', amount: '' }); renderWizard(); }
  function removeWill(i) { collectStep(); st.ci.estate.wills.splice(i, 1); renderWizard(); }

  // =========================================================================
  // COMPUTE & RESULT
  // =========================================================================
  function compute() {
    collectStep();
    if (!st.ci.heirs.length) { toast('Tambahkan minimal satu ahli waris.'); return; }
    if (num(st.ci.estate.grossAssets) <= 0 && num(st.ci.estate.jointPropertyTotal) <= 0) {
      toast('Masukkan nilai harta terlebih dahulu.'); return;
    }
    try {
      st.result = E.calculateInheritance(st.ci);
      renderResult();
      go('result');
    } catch (err) {
      console.error(err); toast('Terjadi kesalahan saat menghitung. Periksa kembali data.');
    }
  }

  function refKHIcard(b) {
    return `<div class="basis"><div class="src">${esc(b.source)}${b.article ? ' · ' + esc(b.article) : ''} ${b.verificationStatus === 'needs_review' ? '<span class="chip review" style="margin-left:6px;">perlu ditinjau</span>' : ''}</div><div class="txt">${esc(b.textSummary)}</div></div>`;
  }
  function dalilCard(d) {
    return `<div class="dalil"><div class="src">${esc(d.source)} · ${esc(d.reference)}</div><div class="txt">${esc(d.translationSummary)}${d.sourceName ? ' <span class="muted">(' + esc(d.sourceName) + ')</span>' : ''}</div></div>`;
  }

  function renderResult() {
    const r = st.result; const es = r.estateSummary;
    const sharesRows = r.shares.length ? r.shares.map((s) => `
      <tr>
        <td><b>${esc(s.label)}</b>${s.count > 1 ? ` <span class="sub">× ${s.count}</span>` : ''}<div class="sub">${badgeType(s.type)} ${confChip(s.confidence)}</div></td>
        <td class="frac">${esc(s.totalFractionStr)}</td>
        <td class="amt">${fmt(s.totalRupiah)}</td>
        <td class="amt sub">${s.count > 1 ? fmt(s.perHeadRupiah) + ' /org' : '—'}</td>
      </tr>`).join('') : `<tr><td colspan="4" class="muted tac" style="padding:20px;">Tidak ada ahli waris yang menerima bagian.</td></tr>`;

    const excluded = r.excludedHeirs.length ? `<div class="card"><div class="card-head"><h2>Ahli waris yang tidak menerima</h2></div>
      ${r.excludedHeirs.map((h) => `<div class="excl"><span class="ico" style="color:var(--muted)">${I.info}</span><span class="nm">${esc(h.label)}${h.count > 1 ? ' ×' + h.count : ''}</span><span class="rs">— ${esc(h.reason)}</span></div>`).join('')}</div>` : '';

    const adjustments = r.adjustments.length ? `<div class="card"><div class="card-head"><h2>Penyesuaian</h2></div>
      ${r.adjustments.map((a) => `<div class="note low"><span class="ico">${I.scale}</span><div><b>${a.type === 'aul' ? tip(TIPS.aul, 'Aul') : tip(TIPS.rad, 'Rad')}</b> — ${esc(a.description)}</div></div>`).join('')}</div>` : '';

    const steps = `<div class="card"><div class="card-head">${I.book}<h2>Langkah perhitungan & dasar hukum</h2></div>
      <p class="lead">Klik tiap langkah untuk melihat dasar hukum (KHI) dan dalil.</p>
      ${r.legalSteps.map((s, i) => `
        <div class="acc-item" id="acc-${i}">
          <button class="acc-head" onclick="HS.app.toggleAcc(${i})"><span class="num">${i + 1}</span><span class="ttl">${esc(s.title)}</span>${confChip(s.confidence)}${I.caret}</button>
          <div class="acc-body">
            <div class="row"><span class="k">Konteks</span><div>${esc(s.inputContext)}</div></div>
            <div class="row"><span class="k">Hasil</span><div>${esc(s.result)}</div></div>
            ${s.calculation ? `<div class="row"><span class="k">Perhitungan</span><div><span class="calc-box">${esc(s.calculation)}</span></div></div>` : ''}
            <div class="row"><span class="k">Penjelasan</span><div>${esc(s.explanation)}</div></div>
            ${(s.legalBasis || []).map(refKHIcard).join('')}
            ${(s.dalil || []).map(dalilCard).join('')}
          </div>
        </div>`).join('')}</div>`;

    const warnings = r.warnings.length ? `<div class="card"><div class="card-head"><h2>Peringatan & catatan</h2></div>
      ${r.warnings.map((w) => `<div class="note ${w.severity}"><span class="ico">${I.warn}</span><div>${esc(w.message)}</div></div>`).join('')}</div>` : '';

    const recs = r.recommendations.length ? `<div class="card"><div class="card-head"><h2>Rekomendasi</h2></div>
      ${r.recommendations.map((rc) => `<div class="rec"><span class="ico">${I.check}</span><div><div class="t">${esc(rc.title)}</div><div class="d">${esc(rc.text)}</div></div></div>`).join('')}</div>` : '';

    $('#view-result').innerHTML = `
      <div class="card">
        <div class="card-head"><span class="step-tag">Hasil simulasi · mode ${r.metadata.mode === 'khi' ? 'KHI' : 'Faraidh'}</span></div>
        <h2>Ringkasan pembagian</h2>
        <div class="disclaimer" style="margin:10px 0 16px;"><span class="ico">${I.info}</span><p>Berdasarkan data yang dimasukkan, dalam mode ${r.metadata.mode === 'khi' ? 'KHI Indonesia' : 'faraidh'}, simulasi menunjukkan pembagian berikut. Ini <b>bukan</b> putusan final dan perlu validasi bila ada sengketa atau data belum pasti.</p></div>
        <div class="summary-grid">
          <div class="stat"><div class="l">${tip(TIPS.tirkah, 'Harta peninggalan')}</div><div class="v">${fmt(es.tirkah)}</div></div>
          <div class="stat"><div class="l">Biaya & hutang</div><div class="v">${fmt(es.deductions)}</div></div>
          <div class="stat"><div class="l">Wasiat efektif</div><div class="v">${fmt(es.effectiveWasiat)}</div></div>
          <div class="stat hl"><div class="l">Harta waris bersih</div><div class="v">${fmt(es.netEstate)}</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Bagian ahli waris</h2></div>
        <div class="table-wrapper"><table class="res-table">
          <thead><tr><th>Ahli waris</th><th>Bagian</th><th>Nominal</th><th>Per orang</th></tr></thead>
          <tbody>${sharesRows}</tbody>
        </table></div>
        <p class="hint" style="margin-top:10px;">Total bagian: <b>${esc(r.metadata.totalFractionCheck)}</b> ${r.metadata.isComplete ? '<span class="chip verified">' + I.check + ' lengkap</span>' : '<span class="chip review">perlu ditinjau</span>'}</p>
      </div>

      ${adjustments}
      ${excluded}
      ${steps}
      ${warnings}
      ${recs}

      <div class="card">
        <div class="card-head"><h2>Simpan & ekspor</h2></div>
        <div class="field"><label>Nama kasus</label><input type="text" id="case-title" value="${esc(st.caseTitle || ('Kasus ' + new Date().toLocaleDateString('id-ID')))}" placeholder="mis. Warisan Bapak Fulan"/></div>
        <div class="actions" style="margin-top:6px;">
          <button class="btn btn-primary" onclick="HS.app.saveCurrent()">${I.save} Simpan ke perangkat</button>
          <button class="btn btn-soft" onclick="HS.app.exportCurrent()">${I.download} Ekspor JSON</button>
          <button class="btn btn-ghost" onclick="HS.app.triggerImport()">${I.upload} Impor JSON</button>
          <button class="btn btn-ghost" disabled title="Tersedia pada versi berikutnya">${I.pdf} Ekspor PDF (segera)</button>
        </div>
        <div class="actions" style="margin-top:4px;"><button class="btn btn-ghost btn-sm" onclick="HS.app.go('wizard')">Ubah data</button><button class="btn btn-ghost btn-sm" onclick="HS.app.startNew()">Hitung kasus baru</button></div>
      </div>`;
  }

  function badgeType(t) {
    const map = { fixed: 'Bagian tetap', ashabah: 'Ashabah (sisa)', 'fixed+ashabah': 'Tetap + ashabah', 'fixed+rad': 'Tetap + rad' };
    return `<span class="chip">${map[t] || t}</span>`;
  }
  function confChip(c) {
    if (c === 'requires_review') return '<span class="chip review">perlu ditinjau</span>';
    if (c === 'high') return '<span class="chip verified">' + I.check + ' tinggi</span>';
    return '<span class="chip">cukup yakin</span>';
  }
  function toggleAcc(i) { $('#acc-' + i).classList.toggle('open'); }

  // =========================================================================
  // SAVE / EXPORT / IMPORT
  // =========================================================================
  function saveCurrent() {
    const title = ($('#case-title') && $('#case-title').value) || 'Kasus tanpa nama';
    st.caseTitle = title;
    const rec = S.saveCase(st.ci, st.result, title, st.editingId);
    st.editingId = rec.id;
    toast('Kasus tersimpan di perangkat ini.');
  }
  function exportCurrent() {
    const title = ($('#case-title') && $('#case-title').value) || 'kasus';
    const data = JSON.stringify({ schemaVersion: S.SCHEMA_VERSION, app: 'hitung-syariah', exportedAt: new Date().toISOString(), cases: [{ id: st.editingId || 'tmp', title, input: st.ci, result: st.result, schemaVersion: S.SCHEMA_VERSION }] }, null, 2);
    downloadFile(slug(title) + '.json', data);
    toast('File JSON diunduh.');
  }
  function downloadFile(name, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kasus'; }
  function triggerImport() { $('#import-file').click(); }

  // =========================================================================
  // HISTORY
  // =========================================================================
  function renderHistory() {
    const cases = S.listCases();
    const list = cases.length ? cases.map((c) => `
      <div class="saved">
        <div class="info"><b>${esc(c.title)}</b><small>Diperbarui ${new Date(c.updatedAt).toLocaleString('id-ID')} · ${(c.input.heirs || []).length} ahli waris${c.result ? ' · ' + fmt(c.result.estateSummary.netEstate) : ''}</small></div>
        <div class="ops">
          <button class="btn btn-soft btn-sm" data-history-action="open" data-case-id="${esc(c.id)}">Buka</button>
          <button class="btn btn-ghost btn-sm" data-history-action="rename" data-case-id="${esc(c.id)}">Ubah nama</button>
          <button class="btn btn-ghost btn-sm" data-history-action="duplicate" data-case-id="${esc(c.id)}">Duplikat</button>
          <button class="btn btn-ghost btn-sm" data-history-action="export" data-case-id="${esc(c.id)}">${I.download}</button>
          <button class="btn btn-danger btn-sm" data-history-action="delete" data-case-id="${esc(c.id)}">${I.trash}</button>
        </div>
      </div>`).join('') : `<div class="empty">${I.book}<div>Belum ada kasus tersimpan.</div><div class="hint" style="margin-top:6px;">Kasus yang Anda simpan akan muncul di sini, tersimpan lokal di perangkat ini.</div></div>`;
    $('#view-history').innerHTML = `
      <div class="card">
        <div class="card-head"><h2>Riwayat perhitungan</h2></div>
        <p class="lead">Semua kasus tersimpan secara lokal di perangkat ini. Tidak ada data yang dikirim ke server.</p>
        <div class="actions" style="margin:4px 0 16px;">
          <button class="btn btn-primary btn-sm" data-history-action="new">${I.plus} Kasus baru</button>
          <button class="btn btn-soft btn-sm" data-history-action="import">${I.upload} Impor JSON</button>
          ${cases.length ? `<button class="btn btn-ghost btn-sm" data-history-action="export-all">${I.download} Ekspor semua</button><div class="spacer"></div><button class="btn btn-danger btn-sm" data-history-action="clear-all">${I.trash} Hapus semua data</button>` : ''}
        </div>
        ${list}
      </div>`;
    bindHistoryEvents();
  }
  function bindHistoryEvents() {
    $$('#view-history [data-history-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.caseId;
        const action = btn.dataset.historyAction;
        if (action === 'new') return startNew();
        if (action === 'import') return triggerImport();
        if (action === 'export-all') return exportAll();
        if (action === 'clear-all') return clearAll();
        if (action === 'open') return openCase(id);
        if (action === 'rename') return renameCasePrompt(id);
        if (action === 'duplicate') return dupCase(id);
        if (action === 'export') return exportCase(id);
        if (action === 'delete') return delCase(id);
      });
    });
  }
  function openCase(id) {
    const c = S.getCase(id); if (!c) return;
    st.ci = mergeBlank(c.input); st.editingId = id; st.caseTitle = c.title;
    if (c.result) { st.result = c.result; renderResult(); go('result'); }
    else {
      try {
        st.result = E.calculateInheritance(st.ci);
        renderResult();
        go('result');
      } catch (e) {
        st.step = 5;
        go('wizard');
        toast('Kasus dibuka. Hitung ulang setelah meninjau data.');
      }
    }
  }
  function mergeBlank(input) { const b = blank(); return Object.assign(b, input, { estate: Object.assign(b.estate, input.estate || {}), special: Object.assign({}, input.special || {}) }); }
  function renameCasePrompt(id) { const c = S.getCase(id); const n = prompt('Nama kasus:', c ? c.title : ''); if (n) { S.renameCase(id, n); renderHistory(); toast('Nama kasus diperbarui.'); } }
  function dupCase(id) { S.duplicateCase(id); renderHistory(); toast('Kasus diduplikasi.'); }
  function delCase(id) { if (confirm('Hapus kasus ini? Tindakan ini tidak dapat dibatalkan.')) { S.deleteCase(id); renderHistory(); toast('Kasus dihapus.'); } }
  function clearAll() { if (confirm('Hapus SEMUA data lokal Hitung Syariah? Tindakan ini tidak dapat dibatalkan.')) { S.clearAll(); renderHistory(); toast('Semua data lokal dihapus.'); } }
  function exportCase(id) { const data = S.exportCase(id); const c = S.getCase(id); if (data) { downloadFile(slug(c.title) + '.json', data); toast('File JSON diunduh.'); } }
  function exportAll() { downloadFile('hitung-syariah-semua-kasus.json', S.exportAll()); toast('Semua kasus diunduh.'); }

  // =========================================================================
  // ABOUT
  // =========================================================================
  function renderAbout() {
    $('#view-about').innerHTML = `
      <div class="card">
        <div class="card-head"><h2>Tentang Hitung Syariah</h2></div>
        <p class="lead">Aplikasi web edukatif untuk menyimulasikan pembagian waris Islam berdasarkan <b>KHI Indonesia</b> dan kaidah <b>faraidh</b>, disertai penjelasan langkah demi langkah, dasar hukum, dalil, dan riwayat yang tersimpan lokal.</p>
        <hr class="divider"/>
        <h3 style="font-size:17px;margin-bottom:8px;">Prinsip produk</h3>
        <div class="feat">
          <div class="f"><span class="ico">${I.scale}</span><div><b>Akurat secara hitung</b><small>Pecahan rasional, aul & rad.</small></div></div>
          <div class="f"><span class="ico">${I.book}</span><div><b>Transparan secara hukum</b><small>Pasal KHI & dalil per langkah.</small></div></div>
          <div class="f"><span class="ico">${I.warn}</span><div><b>Hati-hati secara bahasa</b><small>Menghindari klaim final.</small></div></div>
          <div class="f"><span class="ico">${I.lock}</span><div><b>Aman secara privasi</b><small>Local-first, tanpa server.</small></div></div>
        </div>
        <hr class="divider"/>
        <h3 style="font-size:17px;margin-bottom:8px;">Istilah faraidh</h3>
        <div class="data-list">
          ${Object.entries({ 'Tirkah': TIPS.tirkah, 'Dzawil furudh': TIPS.dzawil, 'Ashabah': TIPS.ashabah, 'Aul': TIPS.aul, 'Rad': TIPS.rad, 'Hajb': TIPS.hajb, 'Wasiat wajibah': TIPS.wasiat }).map(([k, v]) => `<div class="row"><span class="k">${k}</span><div>${esc(v)}</div></div>`).join('')}
        </div>
        <hr class="divider"/>
        <h3 style="font-size:17px;margin-bottom:8px;">Mode KHI vs Faraidh klasik</h3>
        <p class="lead" style="font-size:14px;">Untuk kasus dasar, keduanya memberi hasil sama. Perbedaan muncul pada institusi khusus:</p>
        <div class="data-list">
          <div class="row"><span class="k">Ahli waris pengganti</span><div>KHI: dikenal (Pasal 185), namun MVP saat ini menandainya perlu validasi manual dan belum menghitung otomatis. Faraidh klasik: tidak dikenal.</div></div>
          <div class="row"><span class="k">Wasiat wajibah anak/ortu angkat</span><div>KHI: wajib maks 1/3 (Pasal 209). Faraidh klasik: tidak ada kewajiban.</div></div>
          <div class="row"><span class="k">Sisa harta saat hanya suami/istri</span><div>KHI (praktik PA): diberikan kepada suami/istri (radd). Faraidh klasik: tidak ada radd untuk suami/istri → ke Baitul Mal.</div></div>
        </div>
        <hr class="divider"/>
        <h3 style="font-size:17px;margin-bottom:8px;">Sumber rujukan</h3>
        <p class="lead" style="font-size:14px;">Kompilasi Hukum Islam (KHI) Buku II Hukum Kewarisan; Al-Qur\u2019an Surah An-Nisa ayat 11, 12, 176; serta hadis tentang faraidh. Ringkasan hukum dalam aplikasi bersifat edukatif dan tetap perlu diverifikasi terhadap sumber resmi.</p>
        <div class="disclaimer"><span class="ico">${I.warn}</span><p><b>Catatan keamanan & hukum:</b> Hitung Syariah tidak berpura-pura menjadi hakim, mufti, advokat, atau otoritas final. Aplikasi membantu menghitung, menjelaskan, dan mendokumentasikan — keputusan akhir tetap pada keluarga dan otoritas yang berwenang.</p></div>
        <div class="actions"><button class="btn btn-primary" onclick="HS.app.startNew()">${I.calc} Mulai hitung waris</button></div>
      </div>`;
  }

  // =========================================================================
  // INIT
  // =========================================================================
  function init() {
    $$('#nav button').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
    $('#import-file').addEventListener('change', (ev) => {
      const f = ev.target.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const res = S.importJSON(String(reader.result));
        if (res.ok) {
          const note = res.discardedResults ? ' Hasil lama diabaikan dan akan dihitung ulang.' : '';
          toast(res.added + ' kasus diimpor' + (res.schemaOld ? ' (schema lama)' : '') + '.' + note);
          go('history');
        }
        else toast('Impor gagal: ' + res.error);
        ev.target.value = '';
      };
      reader.readAsText(f);
    });
    go('home');
  }

  HS.app = {
    go, startNew, next, prev, setMode, addHeir, removeHeir, addWill, removeWill, compute,
    toggleAcc, saveCurrent, exportCurrent, triggerImport, openCase, renameCasePrompt, dupCase,
    delCase, clearAll, exportCase, exportAll,
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
