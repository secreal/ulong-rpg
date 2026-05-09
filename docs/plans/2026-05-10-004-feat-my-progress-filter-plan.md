---
title: "feat: My Progress Filter"
type: feat
status: active
date: 2026-05-10
---

# feat: My Progress Filter

## Summary

Menambahkan toggle filter "My Progress" di `header-actions` yang menyaring card grid hanya menampilkan job yang sudah pernah disentuh player — minimal satu skill di-level-up (skill level ≥ 1) atau minimal satu quest sudah dicentang. Toggle bersifat additive di atas filter kategori yang sudah ada: player bisa aktifkan "My Progress" sambil tetap berada di filter grup "Software" misalnya, sehingga hanya job Software yang sudah di-progress yang muncul.

---

## Problem Frame

Player yang sudah main lama punya puluhan job dengan progress tersebar. Melihat seluruh grid 37 job sekaligus membuat sulit fokus — tidak ada cara cepat untuk menjawab "job apa saja yang sudah aku kerjakan?". Filter "My Progress" menjawab pertanyaan ini dengan satu klik.

---

## Requirements

- R1. Ada toggle button "My Progress" di `header-actions`, konsisten dengan tombol lain di area yang sama
- R2. Saat aktif, grid hanya menampilkan job yang punya ≥1 skill level-up ATAU ≥1 quest selesai
- R3. Filter "My Progress" bekerja secara additive dengan filter kategori yang sudah ada (`activeFilter` grup)
- R4. State toggle tidak perlu disimpan ke localStorage — reset ke off saat reload adalah perilaku yang wajar
- R5. Saat "My Progress" aktif dan hasilnya kosong (player belum ada progress sama sekali), tampilkan pesan empty-state yang informatif
- R6. `refreshCards()` yang dipanggil setelah skill click atau quest modal close tetap menghormati state toggle ini secara otomatis

---

## Scope Boundaries

- Tidak ada perubahan pada `renderPyramid()` — pyramid adalah section visual terpisah, bukan bagian dari card grid filter
- Tidak ada perubahan pada `generateShowcaseHTML()` — showcase sudah punya filter independen sendiri
- Tidak ada persistensi ke localStorage — state filter hilang saat reload (by design)
- Tidak ada filter teks/search — hanya toggle binary "semua" vs "yang sudah di-progress"
- Sidebar tree tidak berubah — navigasi grup tetap berjalan independen

---

## Context & Research

### Relevant Code and Patterns

- `let activeFilter = "All"` (line 1634) — module-level filter state; pola yang sama diikuti untuk `activeMyProgress`
- `function renderCards(group)` (line 1751) — full innerHTML replace pada `#jobs`; filter baru ditambahkan sebagai langkah kedua setelah line 1753
- `function refreshCards()` (line 1798) — calls `renderCards(activeFilter)` + `renderSidebar()`; akan otomatis menghormati `activeMyProgress` tanpa perubahan karena `activeMyProgress` adalah module-level
- `function applyFilter(group)` (line 1806) — tidak perlu diubah
- `function skillLevel(title, skill)` (line 1583) — returns `0` jika tidak ada progress, `1–3` jika ada; predicate utama filter ini
- `function getQuestProgress(title)` (line 1602) — returns `{ done, total, pct }` atau `null` jika job tidak punya quest; digunakan untuk cek quest completion
- `skills` di `jobs[3]` adalah comma-separated string — perlu `split(", ")` untuk iterasi per skill
- `.btn-sync` CSS (line 111–127) — base style untuk tombol baru; `.btn-auto.active` pattern (line 910) — template untuk active state visual
- `<div class="header-actions">` (line 1031) — tempat tombol baru disisipkan, setelah auto-wrapper
- `getQuestProgress()` mengembalikan `null` untuk job tanpa quest — harus diguard

### Institutional Learnings

- Tidak ada `docs/solutions/` — proyek baru.

### External References

- Tidak diperlukan — semua pattern sudah solid di codebase.

---

## Key Technical Decisions

- **Module-level boolean flag, bukan modifikasi `activeFilter`**: `activeFilter` adalah string grup kategori; menambahkan "MyProgress" ke string itu mengharuskan setiap consumer mengenal nilai baru ini. Boolean terpisah `activeMyProgress` lebih bersih — tidak menyentuh call sites `applyFilter()` yang sudah ada.
- **Filter sebagai langkah kedua di `renderCards()`**: Konsisten dengan pola existing — data filter → `innerHTML` replace. Tidak perlu introduce CSS show/hide class baru. `refreshCards()` otomatis mendapat benefit karena ia memanggil `renderCards(activeFilter)`.
- **Tidak persist ke localStorage**: Toggle ini adalah view preference sementara, bukan progress data. Reset saat reload tidak mengejutkan user dan menghindari edge case "kenapa card-ku hilang?"
- **Empty state di dalam `renderCards()`**: Jika `filtered.length === 0` dan `activeMyProgress === true`, inject pesan informatif ke `#jobs` daripada membiarkan grid kosong tanpa penjelasan.

---

## Open Questions

### Resolved During Planning

- **Apakah filter pyramid juga perlu diupdate?** Tidak — pyramid adalah summary visual terpisah di atas grid. Biarkan pyramid tetap menampilkan semua job di grup aktif untuk mempertahankan navigasi konteks.
- **Apakah state perlu di-persist?** Tidak — lihat Key Technical Decisions.

### Deferred to Implementation

- **Exact teks empty state**: Implementer bisa pilih antara "No progress yet — start leveling a skill!" atau yang serupa. Tidak kritis untuk plan.
- **Posisi tombol dalam `header-actions`**: Rekomendasi di antara auto-wrapper dan btn-export, tapi implementer bisa adjust jika ada alasan visual.

---

## Implementation Units

- U1. **My Progress Toggle Button + State Flag**

**Goal:** Menambahkan tombol toggle "My Progress" di header dan module-level boolean `activeMyProgress` yang diperbarui saat tombol diklik.

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Modify: `index.html`
  - CSS: tambah `.btn-myprogress` dan `.btn-myprogress.active` setelah blok `.btn-sync` CSS (sekitar line 127)
  - HTML: tambah `<button class="btn-myprogress" id="btn-myprogress">My Progress</button>` di dalam `<div class="header-actions">` (line 1031), setelah `auto-wrapper` div
  - JS: tambah `let activeMyProgress = false;` setelah `let activeFilter = "All"` (line 1634); tambah click handler untuk `btn-myprogress` yang toggle flag dan update button class `.active`

**Approach:**
- Tombol style: mengikuti `.btn-sync` (line 111–127) sebagai base — border tipis, warna muted; saat `.active` gunakan accent warna berbeda dari teal (AUTO) dan gold (Export). Warna hijau muda atau amber (kuning-oranye) cocok untuk membedakan
- Click handler: toggle `activeMyProgress = !activeMyProgress`, toggle class `.active` pada tombol, lalu panggil `renderCards(activeFilter)` dan `renderSidebar()`
- Tidak perlu panggil `renderPyramid()` — pyramid tidak terpengaruh

**Patterns to follow:**
- `.btn-sync` (line 111–127) — base button style
- `.btn-auto` dan `.btn-auto.active` / `.btn-auto.open` (sekitar line 900–916) — active state idiom
- Click handler AUTO (initAuto IIFE) — pola toggle + re-render

**Test scenarios:**
- Happy path: Klik "My Progress" → tombol menampilkan active state; grid hanya menampilkan card yang punya progress
- Happy path: Klik "My Progress" lagi → tombol kembali normal; grid menampilkan semua card sesuai `activeFilter` grup saat itu
- Happy path: Player di filter "Software" → aktifkan "My Progress" → hanya card Software dengan progress yang muncul (filter kombinasi)
- Happy path: Ganti grup di sidebar saat "My Progress" aktif → grid otomatis menyaring dari grup baru dengan predicate progress
- Happy path: Skill di-level-up saat "My Progress" aktif → `refreshCards()` dipanggil → card baru (yang baru dapat progress) muncul otomatis di grid

**Verification:**
- Tombol muncul di `header-actions` dengan visual yang distinct dari tombol lain
- Click toggle mengubah class `.active` pada tombol dengan benar
- Grid re-render setelah click tanpa error di console

---

- U2. **Progress Filter Predicate di `renderCards()`**

**Goal:** Menambahkan langkah filter kedua di `renderCards()` yang menyaring job berdasarkan `activeMyProgress` flag, plus empty-state message ketika tidak ada hasil.

**Requirements:** R2, R3, R5, R6

**Dependencies:** U1 (flag `activeMyProgress` harus ada)

**Files:**
- Modify: `index.html`
  - JS: modifikasi `renderCards()` (line 1751–1796) — tambah filter step setelah line 1753 dan tambah empty-state handling sebelum `jobsEl.innerHTML = ...`

**Approach:**
- Setelah baris `const filtered = group === "All" ? jobs : jobs.filter(j => j[0] === group);` (line 1753), tambahkan conditional filter block:
  ```
  if (activeMyProgress) {
    filtered = filtered.filter(([, title,, skills]) => {
      const hasSkill = skills.split(", ").some(s => skillLevel(title, s) >= 1);
      const qp = getQuestProgress(title);
      const hasQuest = qp !== null && qp.done > 0;
      return hasSkill || hasQuest;
    });
  }
  ```
- Catatan: `filtered` di line 1753 dideklarasikan dengan `const` — perlu diubah ke `let` agar dapat di-reassign. Atau gunakan variabel baru `let displayed = filtered; if (activeMyProgress) displayed = displayed.filter(...)` dan gunakan `displayed` untuk render loop.
- Empty state: setelah filter, jika `filtered.length === 0 && activeMyProgress`, set `jobsEl.innerHTML` ke markup pesan informatif (div terpusat dengan teks, misalnya "Belum ada progress. Mulai level-up skill pertamamu!") dan return early sebelum map/join.
- `refreshCards()` (line 1798) tidak perlu diubah — ia memanggil `renderCards(activeFilter)` yang akan otomatis membaca `activeMyProgress` dari module scope.

**Patterns to follow:**
- Line 1753 — filter pattern existing yang diikuti
- Line 1753 destructuring `([grp, title, desc, skills, ...])` — format destruktur yang sama digunakan di filter predicate
- `skillLevel(title, skill)` (line 1583) — cara baca progress
- `getQuestProgress(title)` (line 1602) — cara baca quest progress; ingat null check

**Test scenarios:**
- Happy path — Covers R2: Job dengan satu skill Lv 1 → muncul di "My Progress" mode
- Happy path — Covers R2: Job dengan nol skill progress tapi satu quest selesai → muncul di "My Progress" mode
- Happy path — Covers R2: Job dengan nol skill dan nol quest → tidak muncul di "My Progress" mode
- Happy path — Covers R3: Filter grup "QA" aktif + "My Progress" aktif → hanya QA job dengan progress yang muncul (bukan semua job dengan progress)
- Happy path — Covers R6: Skill di-level-up (refreshCards dipanggil) → grid otomatis merefleksikan perubahan berdasarkan activeMyProgress state saat itu
- Edge case — Covers R5: Player baru (nol progress) → aktifkan "My Progress" → empty-state message muncul, tidak ada crash
- Edge case: Job tanpa entry di `jobQuests` (job yang tidak punya quest) → `getQuestProgress` returns null → tidak error, hanya fallback ke `hasSkill` check
- Edge case: Job punya skill level 0 di semua skill (key ada di progress tapi nilainya 0) → tidak dihitung sebagai "has progress" → tidak muncul di filter

**Verification:**
- Grid menampilkan subset job yang benar saat "My Progress" aktif
- Filter kombinasi grup + My Progress bekerja benar
- Empty state muncul saat tidak ada job yang memenuhi syarat, bukan grid kosong tanpa pesan
- Tidak ada JS error di console saat toggle

---

## System-Wide Impact

- **Interaction graph:** `refreshCards()` (dipanggil dari skill click handler di line 1996 dan quest modal close) akan otomatis menghormati `activeMyProgress` tanpa perubahan — ini adalah behavior yang diinginkan (R6).
- **State lifecycle risks:** Tidak ada. `activeMyProgress` adalah boolean sederhana di module scope, tidak ditulis ke localStorage, tidak mempengaruhi progress data.
- **API surface parity:** Tidak ada. Feature ini sepenuhnya additive — tidak ada interface lain yang perlu perubahan paralel.
- **Integration coverage:** `generateShowcaseHTML()` tidak terpengaruh — ia punya filter logic sendiri yang independen dari `activeMyProgress`.
- **Unchanged invariants:** `applyFilter()`, `renderPyramid()`, sidebar tree, modal system, skill level system, quest system — semua tidak berubah.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `const filtered` di line 1753 tidak bisa di-reassign | Gunakan variabel baru `let displayed` setelah filter pertama, atau ubah deklarasi ke `let filtered` — cek actual code sebelum implementasi |
| `getQuestProgress(title)` returns `null` untuk job tanpa quest | Guard `qp !== null` sebelum akses `qp.done` — sudah di-handle di predicate approach di atas |
| Empty string dari `skills.split(", ")` jika format berubah | Defensive: tambahkan `.filter(Boolean)` setelah split jika ragu |

---

## Sources & References

- `let activeFilter = "All"`: `index.html` line 1634
- `function renderCards()`: `index.html` line 1751–1796
- `function refreshCards()`: `index.html` line 1798–1801
- `function skillLevel()`: `index.html` line 1583–1588
- `function getQuestProgress()`: `index.html` line 1602–1608
- `<div class="header-actions">`: `index.html` line 1031
- `.btn-sync` CSS: `index.html` line 111–127
