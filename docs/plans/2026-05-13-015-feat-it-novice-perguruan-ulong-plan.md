---
title: "feat: IT Novice — Perguruan Ulong Quest Tab"
type: feat
status: completed
date: 2026-05-13
origin: docs/brainstorms/it-novice-perguruan-ulong-requirements.md
---

# feat: IT Novice — Perguruan Ulong Quest Tab

## Summary

Ganti Quest tab IT Novice (tier 0) dengan 123 artikel harian Perguruan Ulong — dikelompokkan per bulan, tiap artikel menjadi satu quest dengan link ke Medium dan input Discord answer link sebagai bukti penyelesaian. Tab Daily Quest, Equip, dan Talent disembunyikan untuk IT Novice. Job card menampilkan progress "X / 123 hari" sebagai ganti progress bar skill biasa.

---

## Problem Frame

IT Novice saat ini memakai sistem quest/equip/talent yang sama seperti job lain, tapi tidak punya skill yang bisa di-level-up maupun equip/talent yang relevan — semua tab praktis kosong. Perguruan Ulong adalah kurikulum C# harian 123 hari (Sep 2022–Jan 2023) yang sudah didesain sebagai sequential learning path — menampilkannya sebagai quest mengisi kekosongan ini tanpa menambah tab baru. (Lihat origin doc untuk problem frame lengkap.)

---

## Requirements

- R1. Main Quest IT Novice berisi 123 quest dari Perguruan Ulong, diurut Sep → Jan
- R2. Quest dikelompokkan per bulan: Sep (30), Okt (31), Nov (30), Des (31), Jan (1)
- R3. Tiap quest item menampilkan nomor hari, tanggal, judul artikel, dan link ke artikel Medium
- R4. URL artikel Medium di-hardcode dari slug yang diketahui
- R5. Player menyelesaikan quest dengan paste Discord answer link lalu submit
- R6. Validasi: input harus dimulai dengan `https://discord.com/` sebelum submit aktif
- R7. Setelah submit, quest ter-tandai selesai (visual done)
- R8. Status selesai disimpan di localStorage key terpisah, persisten antar sesi
- R9. Quest yang sudah selesai tidak bisa di-undo dari UI
- R10. Tab Daily Quest tidak ditampilkan untuk IT Novice
- R11. Tab Equip tidak ditampilkan untuk IT Novice
- R12. Tab Talent tidak ditampilkan untuk IT Novice
- R13. Tab yang tampil: Quest dan Achievement saja
- R14. Job card IT Novice menampilkan progress "X / 123 hari"

**Origin flows:** F1 (player views Perguruan Ulong as Main Quest), F2 (player completes one quest), F3 (player sees progress summary on job card)

**Origin acceptance examples:** AE1 (covers R1, R3, R10–R12), AE2 (covers R5–R6, R7–R8), AE3 (covers R6), AE4 (covers R14)

---

## Scope Boundaries

- Tidak ada Discord link validation bahwa link milik player tersebut
- Tidak ada sync ke Discord — link tersimpan di localStorage saja
- Konten artikel tidak di-embed — player tetap buka Medium
- Quest IT Novice tidak berkontribusi ke Learning Days achievement
- Tidak ada auto-suggest Discord link
- Export /ulong: tidak di-scope dalam plan ini

### Deferred to Follow-Up Work

- Export /ulong integration untuk Perguruan Ulong progress — separate follow-up plan
- Artikel hari 21–30 September, hari 21 Oktober, hari 21–30 November, hari 21–31 Desember: slug belum diketahui, perlu di-fetch saat implementasi (91 dari 123 slug sudah ada di requirements doc)

---

## Context & Research

### Relevant Code and Patterns

- `index.html` — satu-satunya file yang dimodifikasi
- Tab buttons: hardcoded HTML lines ~2061–2064 (4 static buttons); tidak ada tab config array — hiding dilakukan dengan toggle `display:none` di `openDetailModal()`
- `openDetailModal(jobTitle, roleColor, activeTab)` di line ~4899 — entry point tab visibility; tier perlu di-lookup dari `jobs.find(([,t]) => t === currentDetailJob)?.[8]`
- `loadDetailTabContent(tab)` di line ~4935 — dispatch ke masing-masing render function; branch IT Novice ditambah di sini sebelum check `if (tab === "quest")`
- `renderDetailQuestTab(pane)` di line ~4327 — tidak dimodifikasi; `renderUlongQuestTab(pane)` adalah fungsi baru terpisah
- `renderDetailEquipTab` (~line 4658) dan `renderDetailTalentTab` (~line 4669) — tidak dimodifikasi; tabnya di-hide via CSS
- `activateDetailTab(tab)` di line ~4922 — tidak dimodifikasi; tab hiding cukup di `openDetailModal`
- `renderCards()` di line ~3789 — loop jobs; IT Novice perlu branch untuk progress counter "X / 123 hari"
- `questProgress.daily[jobTitle]` — tidak dipakai untuk Ulong; storage terpisah
- `loadJobChange` / `saveJobChange` di line ~3281 — pola load/save yang diikuti untuk key baru
- Portfolio links pattern di `renderDetailAchievementTab` (~line 4771) — referensi untuk list-with-link item rendering
- `escapeHtml()`, `todayKey()` — helper yang dipakai
- `detailRenderedTabs` cache — perlu di-invalidate untuk tab "quest" saat quest di-submit agar progress reflect

### Institutional Learnings

- Tidak ada `docs/solutions/` entry yang relevan

### External References

- Tidak diperlukan — pola rendering sudah well-established di codebase

---

## Key Technical Decisions

- **Storage key baru:** `ULONG_PROGRESS_KEY = "itjt_ulong_progress_v1"` dengan shape `{ [dayIndex]: { discordUrl, completedAt } }` — `dayIndex` adalah 0-based integer (0 = 01 Sep, 122 = 01 Jan). Terpisah dari `QUEST_PROGRESS_KEY` untuk zero collision risk.
- **Tab hiding di `openDetailModal`:** Query `[data-tab="equip"]` dan `[data-tab="talent"]` button + pane, set `style.display` berdasarkan apakah job adalah IT Novice (tier 0). Harus di-reset ke `""` saat modal dibuka untuk job lain — satu tempat, tidak ada spread ke render functions.
- **Render function terpisah:** `renderUlongQuestTab(pane)` baru, bukan modifikasi `renderDetailQuestTab`. Branching di `loadDetailTabContent` — bersih, tidak ada nested if di fungsi yang sudah kompleks.
- **Article data hardcoded:** Array JS dari 123 objek `{ day, date, title, slug }` — digenerate dari data di requirements doc. URL = `"https://medium.com/@isecreal/" + slug`. Slug yang belum diketahui (32 artikel) perlu di-fetch dari Medium list pages saat implementasi.
- **Progress counter di card:** Branch di `renderCards()` untuk IT Novice (tier 0): hitung `Object.keys(ulongProgress).length` / 123 sebagai angka "X / 123 hari" — tidak pakai `getSkillProgress()`.
- **Completion UX:** Quest item yang belum selesai menampilkan Discord input field dan submit button. Quest yang sudah selesai menampilkan tanda centang + `completedAt` date. Tidak ada textarea summary — hanya Discord URL input.

---

## Open Questions

### Resolved During Planning

- **Tab hiding mechanism:** `openDetailModal` adalah satu-satunya entry point untuk modal; hiding di sini lebih bersih daripada di setiap render function. Harus re-show saat modal menutup atau dibuka kembali untuk job lain.
- **Storage key:** Terpisah dari `questProgress` untuk menghindari collision dan mempermudah export di masa depan.
- **Slug yang hilang:** 32 artikel belum diketahui slugnya (Medium membatasi list page di 20 artikel). Akan di-fetch saat implementasi via pendekatan berbeda (RSS, direct URL trial, atau cek git history Medium).

### Deferred to Implementation

- Exact slug untuk artikel yang belum diketahui (32 artikel dari Sep 21–30, Okt 21, Nov 21–30, Des 21–31) — fetch saat implementasi
- Apakah `detailRenderedTabs["quest"]` cukup di-invalidate setelah submit, atau perlu full tab re-render — tentukan saat melihat behavior aktual

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
openDetailModal("IT Novice", ...)
  ├─► lookup tier from jobs array → tier === 0
  ├─► hide [data-tab="equip"] button + pane (display:none)
  ├─► hide [data-tab="talent"] button + pane (display:none)
  └─► activateDetailTab("quest") → loadDetailTabContent("quest")
        └─► if currentDetailJob === "IT Novice"
              └─► renderUlongQuestTab(pane)
                    ├─► load ulongProgress from localStorage
                    ├─► group ULONG_ARTICLES by month (5 groups)
                    └─► for each group:
                          ├─► month header (e.g. "September 2022 · 30 hari")
                          └─► for each article:
                                if done: show ✓ + completedAt date
                                if not done: show link + discord input + submit btn

submit click handler (event delegation on pane)
  ├─► validate discordUrl starts with "https://discord.com/"
  ├─► write ulongProgress[dayIndex] = { discordUrl, completedAt: todayKey() }
  ├─► saveUlongProgress(ulongProgress)
  ├─► invalidate detailRenderedTabs["quest"]
  └─► re-render tab

renderCards() — IT Novice branch
  └─► tier === 0: count = Object.keys(ulongProgress).length
        render "X / 123 hari" instead of skill XP bar
```

---

## Implementation Units

- U1. **ULONG_PROGRESS_KEY constant, load/save helpers, article data array**

**Goal:** Establish storage key, load/save functions, in-memory variable, dan hardcode array 123 artikel Perguruan Ulong sebagai data source untuk semua unit lain.

**Requirements:** R1, R2, R3, R4, R8

**Dependencies:** None

**Files:**
- Modify: `index.html` (konstanta key di ~line 3267, load/save functions di ~line 3281 area, variable declaration di blok let declarations, article data array sebagai JS const)

**Approach:**
- Tambah `ULONG_PROGRESS_KEY = "itjt_ulong_progress_v1"` bersama key constants lain
- Tambah `loadUlongProgress()` dan `saveUlongProgress(data)` mengikuti pola `loadJobChange`/`saveJobChange` (try/catch, JSON.parse/stringify, default `{}`)
- Declare `let ulongProgress = loadUlongProgress()` di blok variable declarations
- Definisikan `const ULONG_ARTICLES` sebagai array 123 objek `{ day, date, title, slug, monthLabel }` — semua 123 artikel dengan slug lengkap (32 slug yang belum diketahui perlu di-fetch dulu)
- Day index = posisi dalam array (0-based); month grouping via `monthLabel` field

**Patterns to follow:**
- `loadJobChange` / `saveJobChange` di ~line 3281 — same try/catch localStorage pattern
- `ACHIEVEMENT_KEY` / `loadAchievements` sebagai reference untuk storage shape

**Test scenarios:**
- Happy path: `loadUlongProgress()` returns `{}` saat localStorage kosong
- Happy path: save `{ 0: { discordUrl, completedAt } }` → load kembali utuh
- Edge case: localStorage corrupted → returns `{}` tanpa throw
- Happy path: `ULONG_ARTICLES.length === 123`
- Happy path: `ULONG_ARTICLES[0]` adalah artikel 01 September 2022; `ULONG_ARTICLES[122]` adalah artikel 01 Januari 2023

**Verification:**
- `ulongProgress` tersedia di global scope; `ULONG_ARTICLES` berisi 123 entri dalam urutan chronological

---

- U2. **Tab hiding logic di `openDetailModal` untuk IT Novice**

**Goal:** Sembunyikan tab Equip dan Talent (button + pane) ketika modal dibuka untuk IT Novice, dan restore saat dibuka untuk job lain.

**Requirements:** R10, R11, R12, R13

**Dependencies:** U1 (butuh kemampuan lookup tier, tapi tidak butuh artikel data)

**Files:**
- Modify: `index.html` (`openDetailModal` di ~line 4899)

**Approach:**
- Di awal `openDetailModal`, lookup tier: `const _tier = (jobs.find(([,t]) => t === jobTitle) || [])[8] ?? -1;`
- Set display berdasarkan tier: `["equip","talent"].forEach(tab => { document.querySelector(\`.detail-tab-btn[data-tab="${tab}"]\`).style.display = _tier === 0 ? "none" : ""; document.getElementById(\`detail-content-${tab}\`).style.display = _tier === 0 ? "none" : ""; });`
- Saat IT Novice: jika activeTab default ke "equip" atau "talent", force ke "quest" instead
- Reset tab buttons dan pane visibility dilakukan di sini (tidak perlu closeDetailModal hook — modal HTML di-reset setiap buka)

**Patterns to follow:**
- Existing tier check di `renderCards()` line ~3857 `tier >= 2` untuk Job Change button
- `activateDetailTab` pattern untuk tab state

**Test scenarios:**
- Happy path: buka IT Novice modal → equip dan talent tab button tidak visible; Quest dan Achievement visible
- Happy path: buka IT Novice → tutup → buka Frontend Developer → equip dan talent tab kembali visible
- Edge case: buka IT Novice dengan activeTab="equip" → aktif ke "quest" sebagai fallback

**Verification:**
- IT Novice detail modal menampilkan 2 tab (Quest, Achievement); job lain menampilkan 4 tab

---

- U3. **`renderUlongQuestTab(pane)` — render dan submit handler**

**Goal:** Render Quest tab IT Novice dengan 123 quest Perguruan Ulong dikelompokkan per bulan, dengan Discord input untuk tiap quest yang belum selesai, dan submit handler yang menyimpan completion.

**Requirements:** R1, R2, R3, R5, R6, R7, R8, R9 (F1, F2)

**Dependencies:** U1, U2

**Files:**
- Modify: `index.html` (fungsi baru `renderUlongQuestTab` di area setelah `renderDetailQuestTab` ~line 4520; branch di `loadDetailTabContent` ~line 4935; CSS baru di style section)

**Approach:**
- `renderUlongQuestTab(pane)`: group `ULONG_ARTICLES` by `monthLabel` → render 5 month sections; tiap artikel: jika `ulongProgress[dayIndex]` ada → show done state (✓ + tanggal); jika belum → show quest item dengan link + discord input + submit button
- Quest item structure per artikel: `<div class="ulong-quest-item [done]">` dengan `<a>` link ke Medium (target blank), `<input class="ulong-discord-input">` + `<button class="ulong-submit-btn">` untuk yang belum selesai
- Event delegation di pane untuk `.ulong-submit-btn` click: read `dayIndex` dari `dataset`, read input value, validate prefix `https://discord.com/`, save, re-render pane
- Branch di `loadDetailTabContent`: `if (tab === "quest" && currentDetailJob === "IT Novice") { renderUlongQuestTab(pane); return; }` — sebelum check quest yang sudah ada
- Submit tidak mengubah `questProgress` atau `achievements.learnedDays` — storage terpisah
- CSS: `.ulong-month-header`, `.ulong-quest-item`, `.ulong-quest-item.done`, `.ulong-discord-input`, `.ulong-submit-btn`, `.ulong-done-stamp`

**Patterns to follow:**
- Month section header: mirip `<div class="quest-phase-title">` pattern di `renderDetailQuestTab`
- Quest item link: mirip `<a class="quest-item-label" href="..." target="_blank">` di `renderSubQuest`
- Portfolio links rendering di `renderDetailAchievementTab` untuk list item structure
- Event delegation pattern: mirip listener yang sudah ada di `renderDetailQuestTab` untuk quest submit

**Test scenarios:**
- Covers AE1. Happy path: render IT Novice Quest tab → 5 month headers muncul; artikel "01 September 2022 — Install Chocolatey" ada sebagai quest pertama dengan link ke Medium yang benar
- Covers AE2. Happy path: paste valid Discord URL → klik submit → quest item tampil sebagai done; refresh (re-render) → masih done
- Covers AE3. Error path: paste non-Discord URL (misal `https://github.com/...`) → submit button disabled atau error state muncul; tidak tersimpan
- Happy path: quest yang sudah done tidak menampilkan input field; menampilkan tanggal completion
- Edge case: semua 123 quest sudah selesai → semua tampil done, tidak ada input yang muncul
- Edge case: `ulongProgress` kosong (fresh) → semua quest tampil dengan input kosong, submit disabled sampai URL diisi
- Integration: submit quest → `ulongProgress[dayIndex]` tersimpan di localStorage `itjt_ulong_progress_v1`

**Verification:**
- Tab Quest IT Novice menampilkan 123 artikel dalam 5 bulan; submit Discord URL mengubah quest ke done state; state persisten setelah reload

---

- U4. **Progress counter IT Novice di job card**

**Goal:** Job card IT Novice menampilkan "X / 123 hari" sebagai progress indicator, menggantikan skill XP bar biasa.

**Requirements:** R14 (F3)

**Dependencies:** U1

**Files:**
- Modify: `index.html` (`renderCards()` di ~line 3789; CSS untuk progress display jika perlu)

**Approach:**
- Di dalam `renderCards()` loop, di bagian yang render XP bar / skill progress: tambah branch `if (tier === 0)` → `const ulongDone = Object.keys(ulongProgress).length; return \`<div class="card-ulong-progress">${ulongDone} / 123 hari</div>\`` sebagai ganti XP bar
- Letakkan di posisi yang sama dengan XP bar supaya layout card tidak bergeser

**Patterns to follow:**
- Existing `tier >= 2` branch di `renderCards()` line ~3857 untuk pola tier-based card rendering
- `.card-xp` dan `.card-xp-bar` CSS classes untuk reference posisi

**Test scenarios:**
- Covers AE4. Happy path: player dengan 42 quest selesai → IT Novice card menampilkan "42 / 123 hari"
- Happy path: fresh player (0 quest) → menampilkan "0 / 123 hari"
- Happy path: semua selesai → menampilkan "123 / 123 hari"
- Edge case: job lain (tier > 0) tetap menampilkan XP bar normal — tidak terpengaruh

**Verification:**
- IT Novice card di pyramid view menampilkan counter "X / 123 hari"; job lain tidak berubah

---

## System-Wide Impact

- **Interaction graph:** `openDetailModal` dimodifikasi — semua job yang membuka modal akan melewati tier check; rendering tab equip/talent tetap sama, hanya visibility berubah untuk IT Novice
- **Error propagation:** jika `saveUlongProgress` gagal (quota), error di-catch gracefully; submission tetap in-memory untuk sesi ini
- **State lifecycle risks:** `detailRenderedTabs["quest"]` perlu di-invalidate setelah submit agar re-render menampilkan done state; pola ini sudah ada untuk quest tab lain
- **API surface parity:** Export /ulong tidak terpengaruh dalam plan ini (deferred); `ulongProgress` storage siap dibaca oleh export plan masa depan
- **Integration coverage:** End-to-end flow: buka IT Novice modal → lihat quest → paste Discord URL → submit → quest done → tutup modal → lihat card dengan counter updated
- **Unchanged invariants:** `renderDetailQuestTab`, `renderDetailEquipTab`, `renderDetailTalentTab` tidak dimodifikasi sama sekali; semua job lain tidak terpengaruh; `questProgress` dan `achievements.learnedDays` tidak disentuh oleh Perguruan Ulong flow

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| 32 slug artikel belum diketahui | Fetch dari Medium list pages saat implementasi; lihat teknik alternatif (cek page 2 via URL params, atau cek author's Medium sitemap) |
| Tab hiding di `openDetailModal` mempengaruhi semua job | Hanya 2 baris per tab (button + pane); reset ke `""` setiap modal dibuka — tidak ada state yang bocor |
| `detailRenderedTabs["quest"]` cache menyebabkan done state tidak muncul setelah submit | Invalidate cache key setelah save, lalu panggil `loadDetailTabContent("quest")` ulang |
| 123 quest items = DOM berat jika semua di-render sekaligus | Performa perlu di-test; jika lambat, pertimbangkan collapse per bulan (only expand current month) |

---

## Sources & References

- **Origin document:** [docs/brainstorms/it-novice-perguruan-ulong-requirements.md](docs/brainstorms/it-novice-perguruan-ulong-requirements.md)
- Related code: `openDetailModal` ~line 4899, `loadDetailTabContent` ~line 4935, `renderDetailQuestTab` ~line 4327, `renderCards` ~line 3789, `loadJobChange`/`saveJobChange` ~line 3281
- Related data: `data/quests/it-novice.json` (legacy, tidak dihapus)
- Related plans: `docs/plans/2026-05-13-014-feat-self-achievement-system-plan.md` (achievement system yang sudah complete)
