---
title: "feat: Localization — Bahasa Indonesia & English"
type: feat
status: active
date: 2026-05-10
origin: docs/brainstorms/localization-requirements.md
---

# feat: Localization — Bahasa Indonesia & English

## Summary

Menambahkan toggle `ID | EN` di header yang mengganti semua konten teks app (deskripsi job, tooltip skill, quest labels, salary) secara instan tanpa reload. Semua localStorage key tidak berubah — hanya teks yang ditampilkan yang berganti. Showcase yang di-export juga menyertakan switcher dan kedua set teks sehingga viewer bisa memilih bahasa.

---

## Requirements

- R1. Tombol language switcher `ID | EN` di `header-actions`
- R2. Dua pilihan: `ID` (Bahasa Indonesia, default) dan `EN` (English)
- R3. Pilihan bahasa tersimpan di localStorage (`itjt_lang_v1`), dipertahankan antar sesi
- R4. Bahasa default `id` jika belum pernah dipilih
- R5. UI labels diterjemahkan: section headers, tombol, tooltips, sidebar title, modal labels
- R6. Job descriptions (37 job) tersedia dalam English
- R7. Skill tooltips (~74 entri dari `skillDescriptions`) tersedia dalam English
- R8. Quest phase titles, item labels, sub-labels tersedia dalam English
- R9. Salary di mode `en` menampilkan global market rate dalam USD
- R10. Data salary `en` adalah data tersendiri (bukan konversi otomatis)
- R11. Di mode `en`, salary card menampilkan keterangan kecil bahwa rate Indonesia berbeda
- R12. Semua localStorage key tidak berubah: `"JobTitle::SkillName"` dan `"quest::id"` tetap Inggris
- R13. Skill chip yang sudah di-level-up tidak terpengaruh oleh pergantian bahasa
- R14. Showcase HTML yang di-export menyertakan language switcher `ID | EN`
- R15. Showcase HTML menyertakan kedua set teks dan JS switcher minimal
- R16. Default bahasa showcase adalah `en`

**Origin acceptance examples:** AE1 (covers R12, R13), AE2 (covers R9, R11), AE3 (covers R14, R15)

---

## Scope Boundaries

- Tidak ada bahasa ketiga
- Tidak ada auto-detect browser language — app default `id`, showcase default `en`
- Semua terjemahan dalam `index.html` — tidak ada file eksternal
- Salary USD adalah data statis, bukan konversi real-time
- AUTO AI Guide prompt tetap English (sudah English, tidak berubah)
- Format currency Rupiah (`Rp`) hanya muncul di mode `id`

---

## Context & Research

### Relevant Code and Patterns

- `jobs` array: `index.html` ~line 1473. Positional: `[0]=group, [1]=title, [2]=desc, [3]=skills, [4]=salary, [5]=role, [6]=hair, [7]=tool, [8]=tier`. Title (`[1]`) adalah namespace localStorage key — tidak boleh berubah antar locale.
- `renderCards()`: ~line 1964. `desc` di-inject langsung sebagai `<p class="desc">${desc}</p>`. `salary` di-inject sebagai `<strong class="salary">${salary}</strong>`. Label "Salary Range" hardcoded di line ~2005.
- `renderSkills()`: ~line 1930. Skill name `s` dipakai sebagai display text DAN sebagai `data-skill` attribute (yang jadi localStorage key). Di mode `en`, display text perlu dipisah dari `data-skill`.
- `skillDescriptions`: ~line 1515–1639. 74 entri, semua value Indonesian prose, English keys.
- `jobQuests`: ~line 1642–1730. Object keyed by English job title. Phase `title`, item `label`, item `sub` perlu terjemahan. `item.id` adalah localStorage key fragment — tidak boleh berubah.
- `generateShowcaseHTML()`: ~line 2459. Sama seperti `renderCards()`, inject `desc` dan `salary` langsung. Saat ini zero JS di body — akan perlu inline `<script>` switcher.
- `header-actions` div: ~line 1239. Existing buttons: auto-wrapper, btn-myprogress, btn-export-showcase-header, btn-sync. Tambah `.btn-lang` sebagai sibling.
- localStorage pattern: `STORAGE_KEY = "itjt_progress_v1"` dll. New key: `LANG_KEY = "itjt_lang_v1"`, nilai plain string `"id"` atau `"en"`.
- Module-level state pattern: `let activeFilter = "All"`, `let activeMyProgress = false` — ikuti pola ini dengan `let currentLang = "id"`.

### Institutional Learnings

- Tidak ada `docs/solutions/` — proyek baru.

### External References

- Salary USD data (researched 2026-05-10, sources: Glassdoor, PayScale, ZipRecruiter, Robert Half, Levels.fyi, Kore1, MarsDevs):
  - IT Novice: `$25,000–$45,000/yr`
  - Frontend Developer: `$45,000–$115,000/yr`
  - Backend Developer: `$50,000–$125,000/yr`
  - Mobile Developer: `$50,000–$120,000/yr`
  - Fullstack Developer: `$48,000–$120,000/yr`
  - Tech Lead: `$90,000–$160,000/yr`
  - Manual QA: `$35,000–$85,000/yr`
  - QA Automation: `$50,000–$100,000/yr`
  - Performance Tester: `$55,000–$105,000/yr`
  - Data Analyst: `$45,000–$100,000/yr`
  - BI Developer: `$55,000–$115,000/yr`
  - Data Engineer: `$65,000–$130,000/yr`
  - Data Scientist: `$70,000–$140,000/yr`
  - AI Engineer: `$90,000–$180,000/yr`
  - System Administrator: `$40,000–$85,000/yr`
  - Network Engineer: `$45,000–$100,000/yr`
  - Cloud Engineer: `$70,000–$140,000/yr`
  - DevOps Engineer: `$65,000–$140,000/yr`
  - Database Admin: `$50,000–$108,000/yr`
  - SRE: `$70,000–$145,000/yr`
  - SOC Analyst: `$45,000–$110,000/yr`
  - Security Engineer: `$75,000–$135,000/yr`
  - Pentester: `$60,000–$130,000/yr`
  - GRC Specialist: `$55,000–$110,000/yr`
  - AppSec Engineer: `$85,000–$165,000/yr`
  - Business Analyst: `$50,000–$110,000/yr`
  - Product Owner: `$65,000–$140,000/yr`
  - Project Manager: `$55,000–$115,000/yr`
  - Product Manager: `$65,000–$155,000/yr`
  - UI Designer: `$40,000–$95,000/yr`
  - UX Designer: `$50,000–$110,000/yr`
  - Product Designer: `$55,000–$120,000/yr`
  - Helpdesk: `$28,000–$65,000/yr`
  - IT Support: `$32,000–$70,000/yr`
  - Technical Support: `$38,000–$80,000/yr`
  - IT Manager: `$80,000–$150,000/yr`
  - CTO / VP Engineering: `$150,000–$300,000/yr`
  - CISO: `$130,000–$280,000/yr`

---

## Key Technical Decisions

- **Parallel lookup objects, bukan kolom tambahan di `jobs` array**: `jobs` adalah positional array yang di-destructure by index di banyak tempat. Menambah kolom `desc_en` ke index ke-9 akan menggeser `tier` dan merusak semua destructuring. Lebih aman: buat object terpisah `jobDescs_en`, `salaries_en` yang di-lookup by job title saat render. Sama untuk `skillDescs_en`, `questData_en`.
- **`currentLang` module-level variable**: Ikuti pola `activeFilter` dan `activeMyProgress`. Switch bahasa → update `currentLang` → panggil `renderCards(activeFilter)` + `renderSidebar()` + update static UI strings. Quest modal di-re-render saat dibuka (sudah pakai `renderQuestContent()` on open), jadi tidak perlu special handling.
- **`data-skill` tetap English, display text dari lookup**: `renderSkills()` saat ini pakai `s` untuk keduanya. Di mode `en`, display text diganti dari lookup object `skillNames_en[s]` (atau fallback ke `s` jika tidak ada), tapi `data-skill="${s}"` tetap English. Ini jaga invariant R12/R13 — `skillLevel(title, s)` tetap pakai English key.
- **Format catatan salary Indonesia**: Inline teks kecil `<small>` di bawah angka salary (bukan tooltip, bukan footnote terpisah). Paling sederhana, tidak perlu hover/JS tambahan. Text: `"Note: Indonesian rates differ significantly."` (see origin: docs/brainstorms/localization-requirements.md)
- **Showcase: `data-` attributes + inline `<script>` toggler**: Setiap elemen yang perlu terjemahan di showcase mendapat `data-id="..."` dan `data-en="..."`. JS inline minimal (~20 baris) toggle `textContent` saat switcher diklik. Ini lebih ringan dari duplicate card visibility toggle dan tidak melipatgandakan DOM size. (see origin: docs/brainstorms/localization-requirements.md)
- **Static HTML strings update on lang switch**: Beberapa string ada di HTML static (modal title `"⚔ Job Change Quest"`, sidebar section headers). Update via `querySelectorAll("[data-i18n]")` dengan lookup table string UI saat switch. Tidak perlu setAttribute/template engine — textContent replacement cukup.

---

## Open Questions

### Resolved During Planning

- **Struktur data terjemahan**: Parallel lookup objects (`jobDescs_en`, `salaries_en`, `skillDescs_en`, `questData_en`) — bukan kolom baru di `jobs` array (akan merusak destructuring).
- **Format catatan salary**: Inline `<small>` di bawah angka, bukan tooltip atau footnote.
- **Showcase dual-language**: `data-id`/`data-en` attributes + JS inline toggler, bukan duplicate cards.
- **Data salary USD**: Tersedia dari research (tercantum di External References di atas).

### Deferred to Implementation

- **Terjemahan job descriptions (37 job)** dan **skill tooltips (74 entri)** dan **quest labels**: Konten panjang — implementer menulis langsung sebagai object literal saat coding. Kualitas terjemahan adalah editorial judgment, bukan keputusan arsitektur.
- **`skillNames_en` untuk display di chip**: Mayoritas skill sudah English (`"HTML"`, `"CSS"`, `"React/Vue"`, `"Docker"`, dll). Implementer cukup buat mapping untuk yang masih Indonesian (jika ada).

---

## Implementation Units

- U1. **Language State + Switcher Button**

**Goal:** Tambah module-level `currentLang`, `LANG_KEY` localStorage, dan tombol `ID | EN` di header yang toggle bahasa dan trigger re-render.

**Requirements:** R1, R2, R3, R4

**Dependencies:** None

**Files:**
- Modify: `index.html`
  - CSS: tambah `.btn-lang` style setelah blok `.btn-sync` (sekitar line 127)
  - HTML: tambah `<div class="btn-lang" id="btn-lang"><button class="lang-opt" data-lang="id">ID</button><button class="lang-opt" data-lang="en">EN</button></div>` di `header-actions` (line ~1239)
  - JS: tambah `const LANG_KEY = "itjt_lang_v1"`, `let currentLang = localStorage.getItem(LANG_KEY) || "id"`, init active state saat load, click handler per `.lang-opt`

**Approach:**
- Styling: dua tombol berdampingan dengan separator visual, active state highlight gold untuk yang dipilih, muted untuk yang tidak aktif. Mirip pola `.btn-sync` tapi lebih compact (dua segmen).
- Click handler: set `currentLang`, simpan ke `localStorage.setItem(LANG_KEY, currentLang)`, update active state classes, panggil `renderCards(activeFilter)` + `renderSidebar()` + `updateStaticStrings()`.
- `updateStaticStrings()`: fungsi baru yang update semua `[data-i18n]` elements di static HTML (modal title, sidebar headers, dll) via lookup table kecil.

**Patterns to follow:**
- `let activeMyProgress = false` + click handler pattern (`index.html` ~line 1844, 2030)
- `.btn-sync` CSS style block (~line 113)

**Test scenarios:**
- Happy path: Klik `EN` → `currentLang === "en"`, `localStorage.getItem("itjt_lang_v1") === "en"`, tombol EN aktif, reload halaman → tetap EN
- Happy path: Klik `ID` → kembali ke Indonesian, tombol ID aktif
- Edge case: Pertama kali buka (tidak ada key di localStorage) → default `id`, tombol ID aktif

**Verification:**
- Tombol muncul di header dengan visual distinct (dua segmen aktif/nonaktif)
- Klik toggle mengubah `currentLang` dan visual active state
- Nilai tersimpan di localStorage dan dipertahankan setelah reload

---

- U2. **Translation Data Objects**

**Goal:** Buat semua object lookup terjemahan English sebagai module-level constants: `jobDescs_en`, `salaries_en`, `skillDescs_en`, `questData_en`, dan `UI_STRINGS`.

**Requirements:** R6, R7, R8, R9, R10

**Dependencies:** None (data-only, tidak ada behavior)

**Files:**
- Modify: `index.html`
  - JS: tambah 5 object constants setelah `skillDescriptions` block (~line 1639), sebelum `jobQuests`

**Approach:**

`jobDescs_en` — object keyed by job title English string (same as `jobs[1]`):
```
{ "IT Novice": "Fresh graduate entering the IT world...", "Frontend Developer": "...", ... }
```
37 entries.

`salaries_en` — object keyed by job title, nilai salary string USD dari External References:
```
{ "IT Novice": "$25,000–$45,000/yr", "Frontend Developer": "$45,000–$115,000/yr", ... }
```
37 entries. Semua sudah tersedia di External References section.

`skillDescs_en` — object keyed by skill name (same keys as `skillDescriptions`):
```
{ "HTML": "Standard markup language for web pages...", "CSS": "...", ... }
```
~74 entries.

`questData_en` — object keyed by job title, struktur paralel dengan `jobQuests`:
```
{
  "Frontend Developer": {
    phases: [
      { title: "Web Foundations", items: [{ id: "fe-1", label: "...", sub: "..." }, ...] },
      ...
    ]
  }
}
```
Hanya job yang punya quest data (saat ini: `"Frontend Developer"`, `"Manual QA"`). `item.id` identik dengan `jobQuests` — tidak boleh berubah.

`UI_STRINGS` — object dua-level `{ id: {...}, en: {...} }` untuk static HTML strings:
```
{ id: { questTitle: "⚔ Job Change Quest", salaryLabel: "Salary Range", emptyState: "Belum ada progress.", ... },
  en: { questTitle: "⚔ Job Change Quest", salaryLabel: "Salary Range", emptyState: "No progress yet.", ... } }
```

**Patterns to follow:**
- `skillDescriptions` object format (~line 1515) — ikuti struktur yang sama
- `jobQuests` structure (~line 1642) untuk `questData_en`

**Test scenarios:**
- Test expectation: none — data-only constants, tidak ada behavior yang bisa ditest secara programatik. Verifikasi: semua 37 job titles ada di `jobDescs_en` dan `salaries_en`; semua keys di `skillDescriptions` ada di `skillDescs_en`; `questData_en` punya semua job titles yang ada di `jobQuests`.

**Verification:**
- Object constants terdefinisi tanpa syntax error
- `Object.keys(jobDescs_en).length === 37`
- `Object.keys(salaries_en).length === 37`
- Keys `skillDescs_en` adalah superset dari keys yang dipakai di `skillDescriptions`

---

- U3. **Localized `renderCards()` and `renderSkills()`**

**Goal:** Modifikasi `renderCards()` dan `renderSkills()` untuk membaca `currentLang` dan menampilkan konten yang sesuai.

**Requirements:** R5, R6, R7, R9, R11, R12, R13

**Dependencies:** U1 (currentLang), U2 (translation objects)

**Files:**
- Modify: `index.html`
  - JS: modifikasi `renderCards()` (~line 1964) dan `renderSkills()` (~line 1930)

**Approach:**

Di `renderCards()`:
- `desc`: ganti `${desc}` dengan `${currentLang === "en" ? (jobDescs_en[title] || desc) : desc}`
- `salary`: untuk mode `en`, wrap dalam div: `<div><strong class="salary">${salaries_en[title] || salary}</strong><small class="salary-note">Note: Indonesian rates differ significantly.</small></div>`. Untuk mode `id`, tetap `<strong class="salary">${salary}</strong>`.
- Label "Salary Range": ganti jadi `${UI_STRINGS[currentLang].salaryLabel}`
- Empty state string `"Belum ada progress."`: ganti jadi `UI_STRINGS[currentLang].emptyState`

Di `renderSkills()`:
- Display text chip: ganti `${s}` (display only, bukan `data-skill`) dengan lookup. Karena mayoritas skill sudah English, cukup: `${currentLang === "en" ? s : s}` — ini no-op untuk skill yang sudah English. Jika ada skill Indonesian (misal tidak ada di codebase saat ini, tapi antisipasi), gunakan `skillNames_en[s] || s`.
- Tooltip `data-tip`: ganti `skillDescriptions[s]` dengan `(currentLang === "en" ? skillDescs_en[s] : skillDescriptions[s]) || fallback`
- Fallback tooltip string: ganti `"Skill praktis yang dipakai role ini."` dengan `UI_STRINGS[currentLang].skillFallback`
- `data-skill="${s}"` TIDAK berubah — tetap `s` (English key, invariant R12)

CSS baru: `.salary-note` — font-size 10px, color muted, display block, margin-top 2px.

**Patterns to follow:**
- `renderCards()` destructuring pattern (~line 1964)
- Existing conditional pattern: `currentLang === "en" ? ... : ...` (tidak ada yet, tapi pola ternary dipakai di seluruh codebase)

**Test scenarios:**
- Happy path — Covers AE1, R12, R13: Skill HTML Lv 2 di Frontend Developer → ganti ke EN → chip masih Lv 2, `data-skill="HTML"` tidak berubah
- Happy path — Covers R6: Mode EN → `renderCards()` menampilkan English description untuk semua 37 job
- Happy path — Covers AE2, R9, R11: Mode EN → Frontend Developer card menampilkan `$45,000–$115,000/yr` + keterangan kecil "Note: Indonesian rates differ significantly."
- Happy path — Covers R7: Mode EN → hover skill chip menampilkan English tooltip dari `skillDescs_en`
- Edge case: Job title tidak ada di `jobDescs_en` (misal saat data belum lengkap) → fallback ke `desc` (Indonesian), tidak error
- Edge case: Skill tidak ada di `skillDescs_en` → fallback ke `skillDescriptions[s]`, tidak error

**Verification:**
- Di mode EN, card menampilkan English desc dan USD salary
- Salary note muncul di mode EN, tidak muncul di mode ID
- `data-skill` attribute tetap English di kedua mode
- Tooltip bahasa berganti sesuai `currentLang`
- Level-up skill tetap berfungsi di kedua mode (click chip → level naik)

---

- U4. **Localized Quest Modal**

**Goal:** Quest modal menampilkan konten dalam bahasa yang aktif, termasuk phase titles, item labels, dan sub-descriptions.

**Requirements:** R5, R8

**Dependencies:** U1 (currentLang), U2 (questData_en)

**Files:**
- Modify: `index.html`
  - JS: modifikasi `renderQuestContent()` (~line 2073) untuk membaca `questData_en` saat `currentLang === "en"`
  - JS: modifikasi `updateStaticStrings()` (fungsi baru dari U1) untuk update modal static strings

**Approach:**

Di `renderQuestContent(title)`:
- Pilih source quest data: `const questSrc = (currentLang === "en" && questData_en[title]) ? questData_en[title] : jobQuests[title]`
- Gunakan `questSrc.phases[i].title` dan `questSrc.phases[i].items[j].label/sub` untuk render
- `item.id` tetap dari `jobQuests[title]` (tidak dari `questData_en`) untuk menjaga localStorage key invariant

Modal static strings (di HTML, bukan di JS template):
- `"⚔ Job Change Quest"` modal title → update via `updateStaticStrings()`
- `"Path to"` prefix → update via `updateStaticStrings()`
- Reset button label → update via `updateStaticStrings()`

**Patterns to follow:**
- `renderQuestContent()` pattern (~line 2073)
- `jobQuests[title]` lookup pattern

**Test scenarios:**
- Happy path — Covers R8: Mode EN → buka quest Frontend Developer → phase titles dalam English, item labels dalam English
- Happy path: Mode ID → quest dalam Bahasa Indonesia
- Happy path: Switch bahasa saat modal tertutup → buka modal → konten dalam bahasa baru
- Edge case: Job tidak punya `questData_en` entry (karena hanya 2 job punya quest saat ini) → fallback ke `jobQuests[title]` (Indonesian), tidak error
- Edge case: `questData_en[title].phases[i].items[j].id` harus identik dengan `jobQuests[title].phases[i].items[j].id` — localStorage key tidak berubah

**Verification:**
- Quest modal menampilkan konten dalam bahasa yang aktif
- Quest progress (centang) tidak ter-reset saat ganti bahasa
- Modal static strings (judul, prefix) berganti saat `updateStaticStrings()` dipanggil

---

- U5. **Localized Showcase Export**

**Goal:** `generateShowcaseHTML()` menghasilkan showcase yang menyertakan kedua set teks (id + en) dan JS switcher inline, dengan default display `en`.

**Requirements:** R14, R15, R16

**Dependencies:** U1, U2 (translation objects harus ada untuk di-embed)

**Files:**
- Modify: `index.html`
  - JS: modifikasi `generateShowcaseHTML()` (~line 2459)
  - CSS dalam generated HTML: tambah style untuk `.lang-switcher` dan `.salary-note`

**Approach:**

Untuk setiap card elemen yang perlu terjemahan, render dengan `data-id` dan `data-en` attributes:
```html
<p class="desc" data-id="${desc}" data-en="${jobDescs_en[title] || desc}">${jobDescs_en[title] || desc}</p>
```
Default content adalah English (R16). `data-id` menyimpan Indonesian untuk saat switcher diklik ke ID.

Salary di showcase:
```html
<strong class="salary" data-id="${salary}" data-en="${salaries_en[title] || salary}">${salaries_en[title] || salary}</strong>
<small class="salary-note" data-hide-on-id>Note: Indonesian rates differ significantly.</small>
```
`data-hide-on-id` attribute dipakai JS switcher untuk hide/show.

Language switcher HTML di dalam generated page (di `<header>` area showcase):
```html
<div class="lang-switcher">
  <button class="lang-opt active" data-lang="en">EN</button>
  <button class="lang-opt" data-lang="id">ID</button>
</div>
```

Inline `<script>` di generated HTML (~20 baris):
- Query semua `[data-id][data-en]` elements
- On switcher click: swap `textContent` dari `data-{lang}` attribute, update active state, hide/show `.salary-note` elements

**Patterns to follow:**
- `generateShowcaseHTML()` existing structure (~line 2459)
- `data-` attribute pattern sudah dipakai di `data-skill`, `data-tip` di main app

**Test scenarios:**
- Happy path — Covers AE3, R14, R15, R16: Buka showcase yang di-export → default English, switcher `EN | ID` muncul di header
- Happy path — Covers AE3: Klik `ID` di switcher showcase → konten berganti ke Bahasa Indonesia tanpa reload
- Happy path — Covers R9, R11: Mode EN di showcase → salary USD muncul + keterangan; klik ID → salary Rupiah muncul, keterangan hilang
- Edge case: Job tidak ada di `jobDescs_en` → `data-en` fallback ke Indonesian desc, tidak error
- Edge case: Showcase di-generate saat app dalam mode ID → tetap default EN di showcase (R16)

**Verification:**
- File HTML yang di-generate berisi `data-id` dan `data-en` attributes pada elemen yang diterjemahkan
- Switcher berfungsi tanpa JavaScript error di browser
- Salary USD dan note muncul di EN, Rupiah dan no-note di ID
- Showcase bekerja sebagai static file (tidak butuh server)

---

## System-Wide Impact

- **Interaction graph:** `renderCards()` dan `renderSkills()` dipanggil dari `refreshCards()` (dipanggil setelah skill click dan quest modal close) — otomatis menghormati `currentLang` karena module-level. `renderQuestContent()` dipanggil saat modal dibuka — otomatis menghormati `currentLang` saat itu. `generateShowcaseHTML()` dipanggil saat export — embed kedua bahasa sekaligus, tidak bergantung `currentLang`.
- **State lifecycle risks:** `currentLang` adalah string sederhana di module scope + localStorage. Tidak ada risk data loss. Pergantian bahasa tidak menulis ke `STORAGE_KEY` (progress key) — invariant terjaga.
- **API surface parity:** Tidak ada. Feature ini additive.
- **Integration coverage:** Showcase generated HTML harus berfungsi sebagai standalone static file — JS switcher inline tidak boleh depend pada external library.
- **Unchanged invariants:** `skillKey()`, `questKey()`, semua localStorage read/write, `skillLevel()`, `getQuestProgress()` — tidak ada yang berubah. Progress data sepenuhnya language-agnostic.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Terjemahan konten (~300+ entri) panjang dan rawan typo | Implementer menulis sebagai object literals; verifikasi via `Object.keys().length` check |
| `jobs` array destructuring tersebar di banyak tempat | Tidak ubah struktur array — gunakan parallel lookup objects, bukan tambah kolom |
| Showcase JS switcher mungkin conflict dengan existing CSS di beberapa browser | Test di Chrome/Firefox/Safari sebelum mark done; switcher minimal (<25 baris) lebih aman dari framework approach |
| `questData_en` harus jaga `item.id` identik dengan `jobQuests` | Implementer copy `item.id` dari `jobQuests`, hanya translate `label` dan `sub` |
| Salary note muncul di mode ID (jika logic salah) | Note hanya render saat `currentLang === "en"`, atau pakai `data-hide-on-id` attr yang di-hide oleh switcher |

---

## Sources & References

- **Origin document:** [docs/brainstorms/localization-requirements.md](docs/brainstorms/localization-requirements.md)
- Salary USD data: MarsDevs, Glassdoor, PayScale, ZipRecruiter, Robert Half, Kore1 (researched 2026-05-10)
- Related code: `index.html` — `jobs` array (~line 1473), `skillDescriptions` (~line 1515), `jobQuests` (~line 1642), `renderCards()` (~line 1964), `renderSkills()` (~line 1930), `generateShowcaseHTML()` (~line 2459)
