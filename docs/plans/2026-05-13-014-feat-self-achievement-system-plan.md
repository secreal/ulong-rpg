---
title: "feat: Self-Achievement System"
type: feat
status: completed
date: 2026-05-13
origin: docs/brainstorms/self-achievement-requirements.md
---

# feat: Self-Achievement System

## Summary

Menambahkan achievement storage key baru, empat kategori achievement dengan tier Bronze/Silver/Gold, evaluasi otomatis di tiga hook progress yang sudah ada (skill toggle, quest submit, job change confirm), dan memperluas `renderDetailAchievementTab` dengan sub-section baru di atas portfolio links — dua view mode (Badge+Stats dan List) dengan inline detail expand.

---

## Problem Frame

Tab Achievement saat ini hanya menampung portfolio links manual. Tidak ada bukti yang lahir dari aktivitas nyata di app — player yang belajar konsisten tidak punya "receipt" digital untuk ditunjukkan ke HR. (Lihat origin doc untuk problem frame lengkap.)

---

## Requirements

- R1. Sistem mengevaluasi kondisi achievement setiap kali ada perubahan progress
- R2. Achievement di-unlock otomatis tanpa aksi manual
- R3. Setiap achievement menyimpan timestamp saat pertama di-unlock
- R4. Achievement yang sudah diraih tidak di-overwrite atau timestamp-nya tidak berubah
- R5. Empat kategori achievement dengan tier Bronze/Silver/Gold (Quest Completion 25/50/100%, Skill Mastery 25/50/100%, Job Change T1/T2/T3, Learning Days 10/30/100)
- R6. Learning Days = total hari unik yang pernah ada daily quest selesai (cumulative, tidak pernah reset)
- R7. Sub-section self-achievement tampil di atas portfolio links dalam tab Achievement
- R8. View 1 — Badge+Stats: badge tertinggi per kategori + angka statistik ringkas
- R9. View 2 — List: semua achievement yang diraih dengan nama, tier, tanggal earned (screenshot-friendly)
- R10. View 3 — Detail: klik list item membuka detail inline (deskripsi + kondisi + tanggal)
- R11. Portfolio links behavior tidak berubah
- R12. Self-achievements ikut ter-export ke /ulong di atas portfolio links

**Origin flows:** F1 (achievement trigger on progress change), F2 (player views list for HR screenshot), F3 (achievement in /ulong export)

**Origin acceptance examples:** AE1 (covers R1–R3), AE2 (covers R4), AE3 (covers R5–R6), AE4 (covers R8–R9), AE5 (covers R12)

---

## Scope Boundaries

- Export /ulong integration (R12) deferred — ulong export plan (`docs/plans/2026-05-10-001-feat-ulong-export-showcase-plan.md`) sudah complete, integrasi butuh follow-up plan terpisah
- Tidak ada achievement lintas-job (global achievements)
- Tidak ada enkripsi localStorage
- Tidak ada share ke social media
- Learning Days dihitung global, bukan per job

### Deferred to Follow-Up Work

- R12 (/ulong export integration): separate follow-up setelah plan ini complete — export plan butuh dibuka ulang

---

## Context & Research

### Relevant Code and Patterns

- `index.html` — satu-satunya file yang dimodifikasi; semua logic, CSS, dan HTML ada di sini
- `ACHIEVEMENT_KEY` belum ada — perlu ditambahkan di blok konstanta sekitar line 3235–3242 bersama key lain
- `loadProgress` / `saveProgress` di line ~3244 — pola load/save localStorage yang harus diikuti untuk key baru
- `detailRenderedTabs` (line ~4650) — cache tab renders; perlu di-invalidate setelah achievement di-unlock agar sub-section reflect state terbaru
- `renderDetailAchievementTab` (line ~4554) — fungsi yang perlu diperluas; saat ini hanya render portfolio links
- `questProgress.daily` — hanya menyimpan slot *terakhir* per job (date overwrite), bukan akumulasi history; Learning Days tidak bisa dihitung dari sini — butuh storage terpisah
- `questRecordsForJob(jobTitle)` (line ~3372) — menghitung quest yang sudah completed per job
- `getSkillProgress(title, skills)` (line ~3501) — menghitung `{done, total}` skill per job
- `jobs` array tuple index 8 = tier number — dipakai untuk Job Change tier check
- `targetQuestCache` — cache async dari `loadTargetQuestData`; digunakan untuk denominator Quest Completion
- `activateDetailTab` pattern — model untuk mini-toggle view switching (toggle `active` class pada dua button + dua div)
- Skill toggle hook: `document.getElementById("jobs").addEventListener("click", ...)` line ~5069
- Quest submit hook: quest complete button handler line ~4386 area
- Job change confirm: `confirmJobChange()` line ~4792

### Institutional Learnings

- Tidak ada `docs/solutions/` entries yang relevan untuk achievement system

### External References

- Tidak diperlukan — pola localStorage dan rendering sudah well-established di codebase

---

## Key Technical Decisions

- **Achievement storage shape:** `ACHIEVEMENT_KEY = "itjt_achievements_v1"` menyimpan `{ jobs: { [jobTitle]: { [achievementId]: { tier, earnedAt } } }, learnedDays: string[] }` — `learnedDays` adalah array global string `YYYY-MM-DD` unik yang di-append setiap kali daily quest selesai; tidak pernah di-reset
- **Quest Completion denominator:** total quest items dari `targetQuestCache` untuk job itu (skip equip/talent intro quests, hitung intro + level quests per skill); fallback ke `questRecordsForJob(jobTitle).length` jika cache belum loaded (artinya achievement evaluation untuk kategori ini gracefully skipped jika data belum ready)
- **View switching:** dua-button mini-toggle row (`active` class) di dalam sub-section, mirroring pola `activateDetailTab` — tidak butuh UI primitive baru; Detail view (View 3) bukan state toggle terpisah tapi inline expand di bawah list item yang di-klik
- **Achievement evaluation timing:** synchronous, terjadi setelah setiap progress save; jika quest cache belum loaded, Quest Completion evaluation di-skip (tidak block)
- **Icon per kategori:** empat const SVG string baru (inline, tanpa library) — satu per kategori achievement; dipakai di badge dan list item
- **Badge warna tier:** CSS custom property atau inline style — Bronze = `#cd7f32`, Silver = `#a8a9ad`, Gold = `var(--gold)` (sudah ada di app)

---

## Open Questions

### Resolved During Planning

- **`questProgress.daily` tidak akumulatif:** Daily hanya menyimpan slot terakhir — Learning Days butuh storage sendiri (`learnedDays` array di achievement storage). Setiap kali daily quest di-submit, append date ke array jika belum ada.
- **Quest Completion denominator async:** `targetQuestCache` perlu diload dulu; evaluation gracefully skips jika cache null — tidak block UX.
- **View 3 (Detail) sebagai inline expand:** lebih simpel daripada third toggle state; cukup toggle CSS class pada clicked list item.

### Deferred to Implementation

- Exact denominator counting logic untuk Quest Completion (berapa item per job di `targetQuestCache`) — perlu diverifikasi saat implementasi dengan data aktual
- Apakah `detailRenderedTabs["achievement"]` perlu di-invalidate saat achievement unlock, atau cukup render ulang sub-section saja tanpa invalidate seluruh tab

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
Progress change event (skill toggle / quest submit / job change)
  └─► evaluateAchievements(jobTitle)
        ├─► checkQuestCompletion(jobTitle)   → unlockIfNew("quest-completion", tier, jobTitle)
        ├─► checkSkillMastery(jobTitle)      → unlockIfNew("skill-mastery", tier, jobTitle)
        ├─► checkJobChange(jobTitle)         → unlockIfNew("job-change", tier, jobTitle)
        └─► checkLearningDays()             → unlockIfNew("learning-days", tier, null)  [global]

unlockIfNew(id, tier, jobTitle)
  └─► load achievements from storage
        if already has tier >= new tier → skip (R4)
        else → save { tier, earnedAt: today } and persist

renderDetailAchievementTab(pane)
  ├─► [sub-section] render mini-toggle: [Badge+Stats] [List]
  ├─► [view: badge] render 4 badge slots, each showing highest earned tier
  ├─► [view: list]  render earned achievements sorted by earnedAt desc
  │     each item: icon + name + tier chip + date + expand button
  │     clicked item: inline detail expand (description + condition text)
  └─► [existing] portfolio links section (unchanged)
```

---

## Implementation Units

- U1. **Achievement storage — key constant, load/save helpers, data shape**

**Goal:** Establish the localStorage key, load/save functions, and in-memory variable for achievement data so all other units have a stable read/write API.

**Requirements:** R3, R4, R6

**Dependencies:** None

**Files:**
- Modify: `index.html` (konstanta key ~line 3235, load/save functions ~line 3244, variable declaration ~line 3312)

**Approach:**
- Tambah `ACHIEVEMENT_KEY = "itjt_achievements_v1"` bersama key constants lain
- Tambah `loadAchievements()` dan `saveAchievements(data)` mengikuti pola `loadProgress`/`saveProgress` yang sudah ada
- Declare `let achievements = loadAchievements()` di blok variable declarations bersama `let progress`, `let links`, dst.
- Shape: `{ jobs: {}, learnedDays: [] }` sebagai default kosong

**Patterns to follow:**
- `loadJobChange` / `saveJobChange` di line ~3281–3288 — same try/catch pattern, same localStorage API

**Test scenarios:**
- Happy path: `loadAchievements()` returns `{ jobs: {}, learnedDays: [] }` ketika localStorage kosong
- Happy path: data yang disimpan via `saveAchievements` bisa di-load kembali utuh
- Edge case: localStorage corrupted (invalid JSON) → `loadAchievements` returns default shape tanpa throw

**Verification:**
- `achievements` variable tersedia di scope global script, berisi shape yang benar saat app load
- `saveAchievements` menulis ke `localStorage.getItem("itjt_achievements_v1")` yang bisa di-parse kembali

---

- U2. **Achievement evaluation logic — unlock helpers dan empat kategori**

**Goal:** Implementasi fungsi evaluasi untuk keempat kategori achievement, dengan unlock logic yang idempotent (tidak overwrite yang sudah ada).

**Requirements:** R1, R2, R3, R4, R5, R6

**Dependencies:** U1

**Files:**
- Modify: `index.html` (fungsi baru di blok helpers, setelah `getSkillProgress` ~line 3501)

**Approach:**
- `unlockAchievement(category, tier, jobTitle)` — cek apakah tier yang ada sudah >= tier baru; jika belum, simpan `{ tier, earnedAt: todayKey() }`; call `saveAchievements(achievements)`
- `evaluateAchievements(jobTitle)` — memanggil keempat checker; fungsi ini yang di-call dari setiap progress hook
- **Quest Completion:** hitung `questRecordsForJob(jobTitle).length` sebagai numerator; denominator dari `targetQuestCache` (jika loaded); hitung pct → tier (25%=Bronze, 50%=Silver, 100%=Gold); skip evaluation jika denominator 0
- **Skill Mastery:** gunakan `getSkillProgress(jobTitle, skills)` — `skills` string dari `jobs.find(j => j[1] === jobTitle)[3]`; hitung pct → tier
- **Job Change:** cek `jobChangeState.primary` — jika sama dengan `jobTitle`, cek tier dari `jobs` array; T1=Bronze, T2=Silver, T3+=Gold
- **Learning Days:** `achievements.learnedDays.length` → tier (10=Bronze, 30=Silver, 100=Gold); bukan per-job

**Patterns to follow:**
- `todayKey()` di line ~3353 untuk date string
- `jobChangeState` pattern dari line ~3313

**Test scenarios:**
- Happy path: player dengan 3/12 quest selesai (25%) → Quest Completion Bronze di-unlock
- Happy path: player dengan 6/12 quest selesai (50%) setelah punya Bronze → Quest Completion Silver; Bronze tidak hilang (tier diupgrade bukan diganti)
- Edge case: `evaluateAchievements` dipanggil dua kali berturut-turut → achievement tidak di-duplicate, `earnedAt` tidak berubah (Covers AE2)
- Edge case: `targetQuestCache` belum loaded → Quest Completion evaluation skip, tidak throw
- Edge case: job tidak ada di `jobs` array → fungsi return gracefully
- Happy path: Learning Days dihitung global, bukan per job — player dengan 10 hari → Bronze muncul untuk semua job (Covers AE3)
- Happy path: Job Change ke T2 job → Job Change Silver di-unlock (Covers AE1)
- Integration: setelah `unlockAchievement` dipanggil, `achievements` in-memory dan localStorage konsisten

**Verification:**
- Setelah quest ke-N di-submit yang melewati threshold 25%, achievement tersimpan di `achievements.jobs[jobTitle]`
- `evaluateAchievements` idempotent — panggil berkali-kali, hasil sama, `earnedAt` tidak berubah

---

- U3. **Hook evaluateAchievements ke tiga progress change points**

**Goal:** Pastikan achievement evaluation terpanggil otomatis setiap kali skill di-toggle, quest di-submit, atau job change di-confirm.

**Requirements:** R1, R2 (F1)

**Dependencies:** U2

**Files:**
- Modify: `index.html` (tiga lokasi berbeda: skill toggle handler ~line 5069, quest complete handler ~line 4386, `confirmJobChange` ~line 4792)

**Approach:**
- Di skill toggle handler: setelah `toggleSkill(...)` dan DOM update, tambah `evaluateAchievements(skill.dataset.title)`
- Di quest complete handler: setelah `saveQuestProgress(questProgress)`, tambah `evaluateAchievements(currentQuestJob)` — juga append tanggal ke `achievements.learnedDays` jika quest type adalah daily dan tanggal belum ada
- Di `confirmJobChange()`: setelah `saveJobChange(jobChangeState)`, tambah `evaluateAchievements(_jobchangeTarget)`

**Patterns to follow:**
- Pola yang sudah ada untuk re-render setelah progress change (lihat `renderCards(activeFilter)` calls di hook yang sama)

**Test scenarios:**
- Integration: toggle skill yang membawa Skill Mastery ke 25% → `achievements.jobs[jobTitle]["skill-mastery"]` muncul dengan tier "bronze" (Covers AE1 partially)
- Integration: submit daily quest → `achievements.learnedDays` bertambah satu entry untuk hari ini (jika belum ada)
- Integration: submit daily quest di hari yang sama dua kali → `learnedDays` tidak duplicate
- Integration: confirm Job Change ke T2 job → Job Change Silver di-unlock

**Verification:**
- Buka DevTools → Application → localStorage → `itjt_achievements_v1` berisi achievement baru setelah setiap progress change yang melewati threshold

---

- U4. **renderDetailAchievementTab — sub-section self-achievement dengan dua view**

**Goal:** Render sub-section self-achievement di atas portfolio links, dengan mini-toggle antara Badge+Stats view dan List view, serta inline detail expand.

**Requirements:** R7, R8, R9, R10, R11, R13, R14 (F2)

**Dependencies:** U1, U2, U3

**Files:**
- Modify: `index.html` (fungsi `renderDetailAchievementTab` ~line 4554, CSS baru di style section)

**Approach:**
- Ganti `renderDetailAchievementTab` untuk render: header "Achievements" → mini-toggle row → view container → divider → existing portfolio links (tidak diubah)
- **Mini-toggle:** dua button `[Badge+Stats]` `[List]` dengan click handler yang toggle `active` class dan show/hide dua div (mengikuti `activateDetailTab` pattern)
- **Badge+Stats view:** empat kolom (Quest, Mastery, Job Change, Learning Days) — tiap kolom: SVG icon, tier badge (Bronze/Silver/Gold chip dengan warna tier), angka statistik kecil (misal "3/12 quest" atau "35 days")
- **List view:** `<div class="self-achievement-list">` berisi satu item per achievement yang diraih, sorted by `earnedAt` descending; tiap item: icon kategori + nama achievement + tier chip + tanggal; klik item toggle inline detail expand (deskripsi + kondisi threshold)
- Achievement yang belum diraih tidak muncul di List; di Badge+Stats muncul sebagai slot kosong (abu-abu, tier "-")
- CSS baru: `.self-achievement-toggle`, `.self-achievement-badge-grid`, `.self-achievement-list`, `.sa-item`, `.sa-tier-chip` (bronze/silver/gold color variants), `.sa-detail-expand`

**Patterns to follow:**
- `activateDetailTab` pattern untuk toggle logic
- Existing `.detail-panel-header` / `.detail-panel-title` CSS untuk header styling
- TAB_ICONS SVG pattern untuk icon constants

**Test scenarios:**
- Happy path: player dengan Quest Completion Bronze → Badge+Stats view menampilkan badge bronze di kolom Quest dengan angka "3/12" (Covers AE4 partially)
- Happy path: player dengan Skill Mastery Gold → badge gold muncul di kolom Mastery
- Happy path: switch ke List view → semua achievement yang diraih muncul dengan nama + tier + tanggal (Covers AE4)
- Happy path: klik list item → inline detail expand muncul dengan deskripsi dan kondisi; klik lagi → collapse
- Edge case: player tanpa achievement apapun → Badge+Stats menampilkan empat slot kosong; List menampilkan empty state "Belum ada achievement"
- Edge case: portfolio links tetap muncul di bawah divider, tidak terpengaruh oleh view toggle (Covers R11)
- Integration: setelah achievement di-unlock (U3), re-open tab Achievement → achievement muncul di sub-section

**Verification:**
- Tab Achievement menampilkan sub-section self-achievement di atas portfolio links section
- Mini-toggle berfungsi — switch antara dua view tanpa reload modal
- List view layak di-screenshot: achievement items rapi dengan nama, tier chip berwarna, dan tanggal

---

- U5. **SVG icon constants untuk empat kategori achievement**

**Goal:** Deklarasi empat inline SVG string constants untuk icon per kategori achievement (Quest Completion, Skill Mastery, Job Change, Learning Days) yang dipakai di Badge+Stats dan List view.

**Requirements:** R14

**Dependencies:** None (bisa dikerjakan paralel dengan U1)

**Files:**
- Modify: `index.html` (konstanta SVG baru di area dekat `TAB_ICONS` ~line 3339)

**Approach:**
- Empat const: `_SVG_ACH_QUEST`, `_SVG_ACH_MASTERY`, `_SVG_ACH_JOBCHANGE`, `_SVG_ACH_LEARNINGDAYS`
- Icon pilihan: Quest = checkmark/flag, Mastery = book/graduation, Job Change = arrow-up-right/level, Learning Days = calendar/clock
- Semua menggunakan `viewBox="0 0 24 24"` dan stroke-based paths (konsisten dengan existing icons)
- Ukuran rendering dikontrol lewat CSS class, bukan width/height attribute

**Patterns to follow:**
- `_SVG_FILE_BADGE` konstanta di line ~3339 — same inline SVG pattern
- `TAB_ICONS` object sebagai referensi style/format

**Test scenarios:**
- Test expectation: none — unit ini hanya deklarasi konstanta SVG; correctness diverifikasi secara visual saat U4 dirender

**Verification:**
- Keempat SVG string valid dan tidak throw parse error saat diinsert ke innerHTML
- Icon muncul dengan ukuran yang sesuai dalam Badge+Stats dan List view

---

## System-Wide Impact

- **Interaction graph:** `evaluateAchievements` dipanggil dari tiga handler terpisah — skill toggle, quest submit, job change confirm; tidak ada observer pattern, panggilan langsung
- **Error propagation:** jika `saveAchievements` gagal (quota exceeded?), error di-catch secara graceful — achievement tetap ada di-memory untuk sesi ini, hilang saat refresh; sama dengan behavior `saveProgress`
- **State lifecycle risks:** `achievements` in-memory harus selalu sync dengan localStorage setelah setiap `unlockAchievement` call; tidak ada eventual-consistency concern karena single-threaded JS
- **API surface parity:** R12 (export /ulong) di-defer — saat export diimplementasikan, perlu baca dari `ACHIEVEMENT_KEY` yang sudah ada
- **Integration coverage:** `evaluateAchievements` + `renderDetailAchievementTab` perlu diverifikasi end-to-end: unlock → render → tampil benar di UI
- **Unchanged invariants:** Tab Achievement existing portfolio links behavior (add/delete link, load from `LINKS_KEY`) tidak berubah sama sekali

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Quest Completion denominator tidak akurat jika `targetQuestCache` belum loaded | Gracefully skip evaluation; tidak block; user masih bisa mendapat achievement saat tab dibuka ulang |
| Learning Days array tumbuh besar seiring waktu (100+ entries) | String `YYYY-MM-DD` per entry = ~10 bytes; 1000 hari ≈ 10KB — tidak significant |
| `detailRenderedTabs["achievement"]` cached sehingga achievement baru tidak terlihat sampai modal ditutup/dibuka | Setelah `unlockAchievement`, invalidate `detailRenderedTabs["achievement"]` dan re-render jika tab aktif — sama dengan pola yang sudah dilakukan untuk quest tab |
| Export /ulong tidak include self-achievements (deferred) | Documented explicitly di Scope Boundaries; R12 bukan bagian dari plan ini |

---

## Sources & References

- **Origin document:** [docs/brainstorms/self-achievement-requirements.md](docs/brainstorms/self-achievement-requirements.md)
- Related code: `renderDetailAchievementTab` ~line 4554, `questRecordsForJob` ~line 3372, `getSkillProgress` ~line 3501, `loadProgress`/`saveProgress` ~line 3244, `activateDetailTab` ~line 4670, `detailRenderedTabs` ~line 4650, `TAB_ICONS` ~line 3340
- Related plans: `docs/plans/2026-05-10-001-feat-ulong-export-showcase-plan.md` (export integration, deferred)
