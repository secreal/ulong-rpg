---
title: "feat: Card Actions — Tabbed Modal (Quest/Daily/Equip/Talent/Achievement)"
type: feat
status: active
date: 2026-05-13
origin: docs/brainstorms/card-actions-rework-requirements.md
---

# feat: Card Actions — Tabbed Modal (Quest/Daily/Equip/Talent/Achievement)

## Summary

Rework job card tombol aksi: hapus tombol "Qualification" di footer, ganti dengan row 5 ikon kecil di body card (Quest · Daily · Equip · Talent · Achievement). Kelima tombol membuka satu modal bertab; tab yang diklik langsung aktif, user bisa pindah antar tab bebas. Tab Equip dan Talent menampilkan item dari file JSON yang difilter berdasarkan tags yang match dengan job title. Tab Quest dan Daily menampilkan data yang sudah ada di `data/quests/`. Bersamaan, profil user dan guild ditampilkan sebagai chip di header, Find Guild dipindah ke header sebagai tombol global.

---

## Problem Frame

Tombol "Qualification" menggabungkan semua konten (quest, equipment, talent, achievement, job hunting) dalam satu modal flat — tidak ada navigasi per kategori. Profil user hanya muncul saat Export dibuka; guild belum ada sebagai konsep di app. Situasi ini diperbaiki dengan modal bertab dan header identity chip. (see origin: docs/brainstorms/card-actions-rework-requirements.md)

---

## Requirements

- R1. Tombol "📋 Qualification" di card job dihapus; footer card hanya menyisakan tombol Job Change
- R2. Di body card (antara skills dan footer) ditambahkan row ikon kecil: Quest · Daily · Equip · Talent · Achievement
- R3. Kelima tombol membuka satu modal bertab — tab yang diklik langsung aktif; user bisa pindah antar tab tanpa menutup modal
- R4. Mission diundur — tidak termasuk dalam implementasi ini
- R5. Konten Equip dan Talent difilter dari `data/equipment.json` dan `data/talents.json` menggunakan `tags.includes(jobTitle)` — tidak perlu file per-job baru
- R6. Tab yang tidak memiliki konten menampilkan pesan kosong — tab tidak disembunyikan
- R7. Quest dan Daily menggunakan data dari `data/quests/{slug}.json` yang sudah ada; main quest chained (satu aktif sebelum selesai), daily tampil satu per hari
- R8. Profil (nama/nick/github) ditampilkan permanen di header sebagai chip; klik buka edit popover; auto-save
- R9. Guild (nama perusahaan + job title) ditampilkan di samping chip profil; edit dari popover yang sama; history tersimpan tapi tidak ditampilkan di header
- R10. Find Guild dipindah ke header sebagai tombol global; modal berisi dropdown pilih job → link Glints/Indeed/LinkedIn dari data legacy `jobQuests`
- R11. (Bug fix) `questIndex.jobs` diubah ke `questIndex.quests` agar external quest files bisa load

**Origin actors:** A1 (User ulong RPG)

**Origin flows:** F1 (Buka tab aksi dari card), F2 (Edit profil dari header), F3 (Find Guild)

**Origin acceptance examples:**
- AE1 (Covers R2, R3): klik ikon Equip → modal terbuka di tab Equip
- AE2 (Covers R3): modal sudah terbuka → klik tab lain → konten berganti tanpa tutup modal
- AE3 (Covers R6): job tanpa konten Achievement → tab Achievement tetap tampil dengan pesan kosong
- AE4 (Covers R5, R7): card Data Analyst → tab Equip hanya item ber-tag "Data Analyst"

---

## Scope Boundaries

- Konten quest, achievement, dll tidak ditulis ulang di implementasi ini — struktur tab + UI diimplementasikan dengan konten yang sudah ada
- Mission tidak diimplementasikan (R4)
- Normalisasi skill lama (memindahkan tools ke Equip, framework ke Talent) di luar scope ini
- Find Guild hanya menggunakan link statis dari data `jobQuests` legacy — bukan real-time API
- Profil dan guild tersimpan di localStorage saja — tidak ke server/cloud
- History guild tidak ditampilkan di header, hanya di modal edit
- Integrasi Perguruan Ulong ke tab Quest dibahas di brainstorm terpisah
- Talent untuk Achievement (sistem berbasis achievement by system) belum ada — yang diimplementasikan hanya slot manual

### Deferred to Follow-Up Work

- Find Guild data ekstrak ke JSON per-job: saat ini tetap membaca dari inline `jobQuests`
- Skill normalisasi (tools → Equip, frameworks → Talent) per job: scope terpisah
- Achievement berbasis sistem (auto-detect dari progress): scope terpisah

---

## Context & Research

### Relevant Code and Patterns

- Card rendering: `renderCards()` di `index.html` sekitar baris 3158–3230
- Qualification button: `btn-job-change` class, rendered conditionally via `hasQuestForJob(title)` (baris 3181–3182, 3219–3221)
- Quest modal shell: `#quest-overlay / #quest-modal` (baris 1582–1602) — saat ini flat, belum bertab
- Modal open pattern: `openQuest()` (baris 3309–3338) — set `--modal-role`, add class `open`, fetch data, render
- Event delegation: `addEventListener("click")` on `#jobs` (baris 3905+)
- External data fetch pattern: `loadQuestFile()` — fetch → cache di module-level object
- Profile storage: `itjt_profile_v1` → `{ name, nick, github }` — auto-save on input (baris 4002)
- Quest progress storage: `itjt_quest_progress_v1`
- Class collision: `.btn-job-change` dipakai di Qualification card button DAN "Complete Quest" button dalam quest modal — harus dipisah saat rework
- Quest index bug: `questIndex.jobs` (baris 2869) seharusnya `questIndex.quests` sesuai struktur `data/quests/index.json`
- Header struktur: `.header-inner > .header-left + .header-actions` (baris 1489–1535)
- Tab pattern belum ada — harus dibuat dari nol, menggunakan class `.active` sesuai pola yang sudah ada di lang buttons dan My Progress

### Institutional Learnings

- App berjalan dari `file://` maupun GitHub Pages. `fetch()` gagal di `file://` — konten Equip/Talent tidak tampil saat lokal; ini behavior yang sudah ada dan acceptable (sama dengan quest yang juga tidak load di lokal)
- Semua JS inline di `index.html` — tidak ada module system. Fungsi-fungsi baru ditambahkan langsung sebagai named functions di blok `<script>`

### External References

- Tidak ada external research yang dibutuhkan — stack vanilla HTML/CSS/JS dengan pola yang sudah mapan di codebase

---

## Key Technical Decisions

- **Filter Equip/Talent via tags di runtime:** `equipment.filter(e => e.tags.includes(jobTitle))` — tidak perlu file per-job. Data sudah memiliki field `tags` dengan exact job title strings. (see origin: Key Decisions)
- **Satu modal bertab, bukan modal terpisah:** Satu `#detail-overlay` dengan tab nav HTML; JS toggle class `.active` pada tab pane. Lebih ringan, user bisa navigasi antar tab tanpa klik ulang card. (see origin: Key Decisions)
- **Modal baru, bukan reuse `#quest-overlay`:** Quest modal lama dipertahankan karena masih dipakai internal (history, reset), tetapi card button sekarang membuka modal baru `#detail-overlay`. Tab Quest/Daily di modal baru merender ulang konten yang sama via shared render functions.
- **Hapus `btn-job-change` dari card:** Class collision diselesaikan dengan rename class di card button → `btn-open-detail`. Quest modal complete button tetap `.quest-complete-btn`.
- **Fix `questIndex.jobs` → `.quests`:** Bug yang membuat external quest files tidak pernah load. Diperbaiki di U1 sebagai prerequisite unit.
- **Guild storage sebagai objek terpisah:** Key baru `itjt_guild_v1` → `{ company, jobTitle, since, history: [] }` — tidak menggabungkan ke profil untuk menghindari migration complexity.
- **Main quest: sequential scan, bukan graph walk:** Implementasi ikuti pola yang sudah ada di `renderExternalQuestContent()` — `main.find(item => !questCompleted(item.id))` mengembalikan quest pertama yang belum selesai. Ini mengasumsikan data bersifat strictly linear chain; field `unlocksAfter` dipertahankan di data tetapi tidak perlu divalidasi secara aktif karena semua data saat ini linear.
- **Daily quest: deterministic hash per hari per job:** Logic sudah ada di baris 2912 — ikuti pattern yang sama.
- **Scroll lock: gunakan counter, bukan flag boolean:** Beberapa modal bisa terbuka secara bersamaan (detail, profile, find guild). `body.style.overflow = "hidden"` dikelola via counter `openModalCount` — increment saat buka, decrement saat tutup, set `overflow` hanya ketika counter mencapai 0 (semua modal tutup). Ini mencegah scroll restore prematur ketika satu dari beberapa modal ditutup.

---

## Open Questions

### Resolved During Planning

- **Format file konten eksternal:** Pakai `tags` field yang sudah ada di `equipment.json` dan `talents.json` — tidak perlu file per-job baru
- **Konten tab kurikulum tetap atau customizable?** Kurikuler tetap — sama untuk semua user. Progress (selesai/belum) per-user di localStorage. Achievement saat ini hanya manual (link).
- **Apakah reuse `#quest-overlay`?** Tidak — buat modal baru `#detail-overlay` dengan tab system, agar quest modal lama tidak perlu direfactor sepenuhnya.

### Deferred to Implementation

- Urutan render tab content saat fetch concurrent (misal user klik dua tab cepat) — handle dengan flag `currentDetailJob` state; request yang selesai setelah job berubah diabaikan
- Achievement tab reuse `itjt_links_v1` — struktur sama dengan yang sudah ada, tidak perlu key baru
- Keputusan extend `itjt_profile_v1` vs biarkan terpisah dengan `itjt_guild_v1`: **pilih terpisah** (`itjt_guild_v1`) untuk menghindari migration existing users yang sudah punya profil tersimpan

---

## High-Level Technical Design

> *Ini adalah panduan arah untuk review, bukan spesifikasi implementasi. Agent implementor harus memperlakukannya sebagai konteks, bukan kode yang harus direproduksi persis.*

```
Card body (body card)
  [row ikon] .card-actions-row
    .btn-open-detail[data-job][data-role][data-tab="quest"]    → ★ Quest
    .btn-open-detail[data-job][data-role][data-tab="daily"]    → 🗓 Daily
    .btn-open-detail[data-job][data-role][data-tab="equip"]    → 🛡 Equip
    .btn-open-detail[data-job][data-role][data-tab="talent"]   → ✨ Talent
    .btn-open-detail[data-job][data-role][data-tab="achievement"] → 🏆 Achievement

Modal baru: #detail-overlay / #detail-modal
  .modal-chrome → judul job + close button
  .detail-tabs (nav)
    [Quest] [Daily] [Equip] [Talent] [Achievement]  ← satu class .active
  .detail-tab-content[data-tab="quest"]
  .detail-tab-content[data-tab="daily"]
  .detail-tab-content[data-tab="equip"]
  .detail-tab-content[data-tab="talent"]
  .detail-tab-content[data-tab="achievement"]

Header chip (baru)
  .header-profile-chip
    #header-profile-name  ← "Hero" jika belum isi
    | PT Company · Job Title  ← guild, jika ada
  → klik → #profile-overlay (popover/modal)
  .btn-find-guild → #find-guild-overlay
```

State flow: klik `.btn-open-detail` → `openDetailModal(jobTitle, role, tab)` → set `--modal-role` → show `#detail-overlay` → activate tab `[data-tab=tab]` → load content async (quest/equip/talent dari fetch cache)

---

## Implementation Units

- U1. **Fix quest index key bug + decouple btn-job-change class**

**Goal:** Perbaiki bug `questIndex.jobs` → `questIndex.quests` agar external quest files bisa load; hapus Qualification button dari card dan update event handler secara atomik agar tidak ada crash path setelah rename.

**Requirements:** R11

**Dependencies:** None

**Files:**
- Modify: `index.html`

**Approach:**
- Baris 2869: ganti `questIndex.jobs` → `questIndex.quests`
- Baris 2889 (fallback initialization di catch block): ganti `{ jobs: [] }` → `{ quests: [] }` — harus dilakukan bersamaan agar fallback path konsisten dengan success path
- Baris 3219–3221: hapus template literal Qualification button dari `renderCards()` sepenuhnya (U2 akan menambahkan `.btn-open-detail` sebagai pengganti)
- Baris 3905–3910: hapus atau update branch event handler yang handle `.btn-job-change` untuk card. **Penting:** handler ini sekarang hanya akan match `.quest-complete-btn` button di dalam quest modal (yang masih memiliki class `btn-job-change`). Complete button tidak memiliki `data-job` attribute, sehingga jika handler ini tidak dihapus/disesuaikan, klik Complete Quest akan memanggil `openQuest(undefined, undefined)` dan merusak quest state. Solusi: hapus branch `.btn-job-change` dari `#jobs` event delegation, ganti dengan branch baru untuk `.btn-open-detail` yang akan ditambahkan di U3.

**Test scenarios:**
- Happy path: `getQuestIndexEntry("IT Novice")` setelah fix mengembalikan entry dari index — bukan null
- Happy path: `getQuestIndexEntry("Frontend Developer")` returns entry dengan file `frontend-developer.json`
- Edge case: `getQuestIndexEntry("job-yang-tidak-ada")` tetap return `undefined` / `null` — tidak throw
- Error path: fetch `data/quests/index.json` gagal → fallback `{ quests: [] }` terpasang → `getQuestIndexEntry()` return `undefined` tanpa throw
- Integration: buka quest modal yang masih ada (`#quest-overlay`) → klik "Complete Quest" → quest selesai tersimpan, modal **tidak** mencoba re-open quest overlay dengan undefined job

**Verification:**
- DevTools Network: quest files terdaftar di index.json tidak menghasilkan 404
- Klik Complete Quest di quest modal lama berfungsi normal, tidak corrupt state
- Tidak ada `btn-job-change` card button yang tersisa (hanya Complete Quest button di dalam modal)

---

- U2. **Hapus Qualification button, tambah row ikon aksi di card body**

**Goal:** Hapus tombol "📋 Qualification" dari `.card-footer`, tambahkan `.card-actions-row` dengan 5 ikon kecil di body card.

**Requirements:** R1, R2, F1

**Dependencies:** U1

**Files:**
- Modify: `index.html` (HTML card rendering di `renderCards()`, CSS untuk `.card-actions-row` dan `.btn-open-detail`)

**Approach:**
- Dalam `renderCards()` (baris 3158–3230): hapus template literal yang render `btn-job-change` card button (baris 3219–3221)
- Tambah row baru di antara `.meta` div dan `.card-footer`: `.card-actions-row` berisi 5 tombol `.btn-open-detail` dengan `data-job`, `data-role`, `data-tab` attribute
- Tombol selalu dirender untuk semua card (tidak conditional seperti Qualification); tab yang tidak ada kontennya akan menampilkan pesan kosong di U4
- CSS: `.card-actions-row` sebagai flex row, ikon kecil, gap merata, konsisten dengan desain card yang ada (`--role` color accent)
- Tombol menggunakan ikon + label singkat: `★ Quest`, `🗓 Daily`, `🛡 Equip`, `✨ Talent`, `🏆 Achv`

**Patterns to follow:**
- `btn-do-jobchange` styling (baris 770–786) sebagai referensi ukuran/warna tombol
- CSS custom property `--role` untuk color theming

**Test scenarios:**
- Happy path (Covers AE1): card Frontend Developer memiliki row 5 tombol; tombol Equip memiliki `data-tab="equip"` dan `data-job="Frontend Developer"`
- Happy path: card tanpa quest (job yang tidak ada di quest index) tetap memiliki semua 5 tombol
- Edge case: tombol Qualification tidak muncul di card mana pun
- Edge case: tombol Job Change masih ada di footer, tidak terpengaruh

**Verification:**
- Semua card memiliki `.card-actions-row` dengan 5 tombol
- Footer hanya berisi xp bar + Job Change button
- Tidak ada `.btn-job-change` dengan data-job di card (hanya boleh ada di dalam quest modal)

---

- U3. **Buat modal detail bertab (`#detail-overlay`)**

**Goal:** Buat HTML shell modal baru dengan tab navigation (Quest · Daily · Equip · Talent · Achievement), CSS styling, dan JS untuk open/close/switch tab.

**Requirements:** R3, R6, F1

**Dependencies:** U2

**Files:**
- Modify: `index.html` (HTML modal template, CSS `.detail-*`, JS `openDetailModal()` + tab switch handler)

**Approach:**
- Tambah HTML modal shell `#detail-overlay / #detail-modal` di antara modal-modal yang ada (setelah `#quest-overlay`)
- Tab nav: `<div class="detail-tabs">` berisi 5 button `.detail-tab-btn[data-tab="..."]` dengan class `.active` pada tab yang aktif
- Tab pane: 5 `<div class="detail-tab-content" data-tab="...">` — satu visible (`.active`), sisanya `display: none`
- JS: `openDetailModal(jobTitle, role, activeTab)` — set `--modal-role`, set judul modal, show overlay, set active tab, trigger content load
- JS: event delegation untuk `.detail-tab-btn` klik → switch active tab + trigger content load jika belum di-render
- Event delegation baru pada `#jobs` dan `document` untuk `.btn-open-detail` klik → call `openDetailModal(job, role, tab)`
- Close button + backdrop click → hide overlay, clear `overflow: hidden`
- Tab dengan konten kosong tetap bisa diklik, hanya menampilkan placeholder text (Covers AE3)

**Patterns to follow:**
- `openQuest()` pattern (baris 3309–3338) untuk open/close modal
- Existing `.active` class toggle pattern (lang buttons, My Progress)
- `--modal-role` CSS variable untuk color theming

**Test scenarios:**
- Happy path (Covers AE1): klik tombol Equip di card → `#detail-overlay` memiliki class `open`; tab Equip memiliki class `active`, tab lain tidak
- Happy path (Covers AE2): modal terbuka di tab Quest; klik tab Equip → hanya tab Equip yang active, modal tidak tutup/buka ulang
- Happy path (Covers AE3): card tanpa data Achievement → tab Achievement tetap ada, tampil placeholder "Belum ada konten"
- Edge case: klik backdrop `#detail-overlay` → modal tutup, `body.overflow` kembali normal
- Edge case: tekan ESC → modal tutup (jika ada keydown handler untuk modal lain, ikuti pola yang sama)
- Edge case: buka modal job A, tutup, buka modal job B → judul modal dan konten tab terupdate ke job B

**Verification:**
- Modal tampil dengan tab navigation yang berfungsi
- Active tab state visible secara visual
- Modal dapat dibuka dan ditutup tanpa error console

---

- U4. **Render konten tab Quest dan Daily**

**Goal:** Render main quest (sequential scan, satu aktif) dan daily quest (satu per hari) dari data `data/quests/{slug}.json` ke dalam tab Quest dan Daily di modal detail.

**Requirements:** R7, R5 (load dari file eksternal)

**Dependencies:** U3

**Files:**
- Modify: `index.html` (JS functions `renderDetailQuestTab()`, `renderDetailDailyTab()`)

**Approach:**
- Reuse `loadQuestFile(jobTitle)` yang sudah ada untuk fetch + cache data per job. Caller harus wrap dalam try/catch karena `loadQuestFile()` tidak handle fetch error internal — hanya `openQuest()` yang sudah wrap; `renderDetailQuestTab()` perlu wrap sendiri.
- `renderDetailQuestTab(questData, jobTitle)`: ikuti pola `main.find(item => !questCompleted(item.id))` dari `renderExternalQuestContent()` — tampilkan quest pertama yang belum selesai (sequential scan). Jika semua selesai → pesan "All quests complete". Field `unlocksAfter` tidak perlu divalidasi secara aktif karena data saat ini strictly linear.
- `renderDetailDailyTab(questData, jobTitle)`: ambil daily quest untuk hari ini menggunakan logic hash yang sudah ada (baris 2912). Tampilkan satu item. Jika sudah dikerjakan hari ini → tampil info "Sudah selesai hari ini".
- Completion mechanic: form summary + tombol complete → update `itjt_quest_progress_v1` → re-render tab. Gunakan storage key yang **sama** dengan quest modal lama agar progress sync.
- Jika fetch gagal atau job tidak ada di index → tampil pesan "Quest belum tersedia"

**Patterns to follow:**
- `renderExternalQuestContent()` (baris 3349–3431) sebagai referensi render logic dan sequential scan
- `renderCompletableQuest()` untuk form summary + complete button
- Quest progress storage: `itjt_quest_progress_v1`

**Test scenarios:**
- Happy path: job dengan main quest `unlocksAfter: null` sebagai pertama → quest pertama tampil di tab Quest
- Happy path: quest pertama sudah complete → quest kedua (yang `unlocksAfter = id pertama`) tampil
- Happy path: tab Daily → satu quest tampil sesuai hari + job
- Edge case: semua main quest sudah selesai → pesan "All quests complete"
- Edge case: daily quest hari ini sudah dikerjakan → tampil info completed, bukan form
- Edge case: job tanpa data quest (tidak ada di index) → pesan "Quest belum tersedia" di kedua tab
- Integration: complete satu quest → re-render tab → quest berikutnya muncul tanpa reload halaman

**Verification:**
- Tab Quest menampilkan satu quest aktif sesuai progress
- Tab Daily menampilkan satu quest per hari; keesokan harinya quest berganti
- Completion tersimpan di localStorage dan terefleksi segera di UI

---

- U5. **Render konten tab Equip dan Talent**

**Goal:** Render daftar equipment dan talent yang relevan untuk job yang sedang dibuka, difilter dari JSON eksternal berdasarkan `tags`.

**Requirements:** R5, R7 (Covers AE4)

**Dependencies:** U3

**Files:**
- Modify: `index.html` (JS: `loadEquipmentData()`, `loadTalentData()`, `renderDetailEquipTab()`, `renderDetailTalentTab()`)

**Approach:**
- Load `data/equipment.json` dan `data/talents.json` via fetch — satu kali saja, cached di module-level variables (`let equipmentData`, `let talentData`)
- Filter: `equipmentData.equipment.filter(e => e.tags.includes(jobTitle))`
- Render tiap item: nama, kategori badge, deskripsi. Layout card-list atau chip grid sesuai jumlah item.
- Jika tidak ada item setelah filter → tampil pesan "Belum ada data untuk job ini"
- Fetch error (misal `file://` lokal) → tampil pesan "Konten tidak tersedia secara lokal"
- Tidak ada interaktivitas di fase ini (checklist progress Equip/Talent deferred)

**Patterns to follow:**
- `loadQuestFile()` fetch + cache pattern
- Graceful fallback error handling seperti `loadQuestIndex()` (try/catch dengan pesan fallback)

**Test scenarios:**
- Happy path (Covers AE4): job "Data Analyst" → tab Equip hanya menampilkan equipment dengan "Data Analyst" di tags array
- Happy path: job "Frontend Developer" → tab Talent menampilkan React, Vue, Svelte, dll (yang memiliki tag Frontend Developer)
- Edge case: job tanpa equipment ber-tag → pesan kosong (Covers R6/AE3 analogi untuk Equip)
- Edge case: fetch gagal (misal file:// environment) → pesan error graceful, bukan blank/crash
- Edge case: data sudah di-cache → fetch tidak dipanggil ulang saat buka modal job lain

**Verification:**
- Tab Equip hanya menampilkan item relevan, bukan semua equipment
- Tab Talent hanya menampilkan talent relevan
- Tidak ada console error saat fetch

---

- U6. **Render konten tab Achievement + hapus duplikasi dari card body**

**Goal:** Render tab Achievement berisi achievement links manual (`itjt_links_v1`); sekaligus hapus `renderAchievementLinks()` dari card body agar tidak ada duplikasi konten.

**Requirements:** R2, R6

**Dependencies:** U3

**Files:**
- Modify: `index.html` (JS: `renderDetailAchievementTab()`; hapus call `renderAchievementLinks(title)` dari `renderCards()` baris 3226)

**Approach:**
- Reuse data dari `itjt_links_v1[jobTitle]` (achievement links yang sudah ada per job)
- Render sebagai list link: label + URL, bisa diklik, buka di tab baru
- Tambah form inline kecil untuk add achievement link baru (konsisten dengan existing `renderAchievementLinks()`)
- Jika belum ada achievement → tampil pesan "Belum ada achievement" dengan form add
- **Hapus** call `${renderAchievementLinks(title)}` dari template literal `renderCards()` (baris 3226) — konten ini sekarang hanya ada di tab modal, bukan di card body. Ini mencegah duplikasi data yang sama di dua tempat.

**Patterns to follow:**
- `renderAchievementLinks()` function yang sudah ada di `index.html` sebagai referensi logic, tapi hasil rendernya dipindahkan ke dalam tab

**Test scenarios:**
- Happy path: job dengan existing achievement links → tampil sebagai clickable list di tab
- Happy path: user tambah achievement link baru dari form → tersimpan ke localStorage, tampil di list
- Edge case: job tanpa achievement → pesan "Belum ada achievement" + form add
- Edge case: URL kosong atau tidak valid → tidak tersimpan / validasi minimal
- Integration: achievement links section **tidak lagi tampil** di card body setelah unit ini selesai

**Verification:**
- Tab Achievement menampilkan links yang sebelumnya ada di card body
- Tambah link dari tab berfungsi dan tersimpan
- Card body tidak lagi menampilkan achievement links section

---

- U7. **Profile chip di header + edit popover**

**Goal:** Tampilkan chip profil permanen di header (nama/nick + guild) dan popover edit dengan auto-save untuk profil dan guild.

**Requirements:** R8, R9, F2

**Dependencies:** None (dapat dikerjakan paralel dengan U2–U6, tetapi karena semua unit memodifikasi `index.html` yang sama, sebaiknya dikerjakan secara sequential untuk menghindari conflict)

**Files:**
- Modify: `index.html` (HTML header chip, HTML popover `#profile-overlay`, CSS, JS `renderProfileChip()`, `openProfileEdit()`, profile/guild save logic)

**Approach:**
- Tambah `.header-profile-chip` di `.header-actions` (sebelum tombol lain): tampilkan `nick || name || "Hero"` + guild string jika ada
- Guild storage key baru: `itjt_guild_v1` → `{ company, jobTitle, since, history: [] }`
- Popover `#profile-overlay`: field nama, nick, github, nama perusahaan, job title di guild, tanggal mulai. History guild sebagai read-only list di bawah.
- Auto-save: event `input` pada setiap field → `saveProfile()` / `saveGuild()` → update chip di header
- `renderProfileChip()` dipanggil saat app init dan setiap kali profil/guild berubah

**Patterns to follow:**
- Profile auto-save pattern baris 4002
- Existing `itjt_profile_v1` storage (extend field jika perlu, atau biarkan terpisah)
- Modal open pattern (add class `open`, overflow hidden)

**Test scenarios:**
- Happy path: profil belum diisi → chip tampil "Hero" bukan error/kosong
- Happy path: profil nama diisi "Anto" → chip berubah ke "Anto" tanpa refresh
- Happy path: guild diisi "PT Maju Jaya · Backend Dev" → tampil di chip di samping nama
- Edge case: hanya guild diisi tanpa nama → chip tetap tampil placeholder name + guild info
- Edge case: guild history saat ganti perusahaan — history sebelumnya tersimpan, bukan overwrite
- Integration: buka popover → edit nick → tutup → chip terupdate

**Verification:**
- Header chip selalu terlihat dengan minimal placeholder
- Edit profil dan guild auto-save tanpa tombol submit
- History guild tersimpan di localStorage saat perusahaan diganti

---

- U8. **Find Guild di header (tombol global)**

**Goal:** Pindahkan akses Find Guild dari dalam card ke header sebagai tombol global; modal berisi dropdown job → link Glints/Indeed/LinkedIn.

**Requirements:** R10, F3

**Dependencies:** U7 (header structure)

**Files:**
- Modify: `index.html` (HTML tombol `.btn-find-guild` di header, HTML modal `#find-guild-overlay`, CSS, JS `openFindGuild()`, `renderFindGuildLinks()`)

**Approach:**
- Tambah tombol `Find Guild` di `.header-actions` (setelah profile chip)
- Modal `#find-guild-overlay`: dropdown `<select>` berisi semua job titles (dari `jobs` array); onChange → render links dari `jobQuests[selectedJob]` phases yang berisi Find Your Guild / Vendor Quest
- Fallback: jika job tidak punya data Find Guild di `jobQuests` → tampil pesan "Belum ada data"
- Link dibuka di tab baru

**Patterns to follow:**
- Dropdown job selection menggunakan job titles dari `jobs` array (sudah ada)
- Link render dari `jobQuests` legacy data (struktur fasenya sudah ada, tinggal extract items ber-type "link")

**Test scenarios:**
- Happy path (Covers F3/AE5): klik Find Guild → modal terbuka → pilih "Frontend Developer" → tampil link Glints/Indeed/LinkedIn dari data
- Happy path: pilih job lain → links berganti tanpa tutup/buka modal
- Edge case: job tanpa data Find Guild → pesan "Belum ada data untuk job ini"
- Edge case: modal Find Guild bisa ditutup via close button atau backdrop

**Verification:**
- Tombol Find Guild tampil di header
- Modal menampilkan link yang relevan per job yang dipilih
- Link terbuka di tab baru

---

## System-Wide Impact

- **Interaction graph:** Event delegation pada `#jobs` ditambah branch baru untuk `.btn-open-detail` (menggantikan branch `.btn-job-change` yang dihapus di U1). Modal baru `#detail-overlay` perlu masuk ke global ESC keydown handler jika ada — pastikan tidak clash dengan handler modal lain.
- **Scroll lock:** Sebelum rework ada 4+ modal yang masing-masing set `body.style.overflow = "hidden"` saat buka dan `""` saat tutup — tidak ada coordination. Dengan modal tambahan baru (detail, profile, find guild), risiko restore scroll prematur meningkat. Implementasi harus menggunakan counter `openModalCount` (increment saat modal buka, decrement saat tutup, restore overflow hanya saat counter = 0) atau setidaknya memastikan modal-modal baru tidak bisa terbuka bersamaan.
- **Error propagation:** `loadQuestFile()` tidak memiliki internal try/catch — fetch error akan throw ke caller. Semua caller baru (`renderDetailQuestTab()`, dll.) harus wrap dalam try/catch sendiri. Fetch `equipment.json` / `talents.json` juga harus graceful.
- **State lifecycle risks:** `openDetailModal()` harus reset `currentDetailJob` dan clear tab content saat dipanggil ulang untuk job yang berbeda, agar tidak tampil stale content. Content tab tidak perlu di-refresh saat `renderCards()` dipanggil (acceptable: modal dan card bisa sedikit out of sync setelah skill toggle).
- **API surface parity:** Quest completion di tab Quest/Daily pakai storage key yang **sama** (`itjt_quest_progress_v1`) dengan quest modal lama — tidak ada duplikasi storage. Guild storage menggunakan key terpisah `itjt_guild_v1` untuk menghindari migration `itjt_profile_v1` yang sudah ada.
- **Integration coverage:** Completion quest di tab Detail → `saveQuestProgress()` → re-render tab Quest/Daily; progress bar card ter-update hanya jika `renderCards()` dipanggil setelahnya.
- **Unchanged invariants:** Quest modal lama (`#quest-overlay`) tetap berfungsi — tidak dihapus, hanya tidak lagi dipanggil dari card button. Showcase export card tidak terpengaruh (`buildCardInner` terpisah dari `renderCards()`).

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Fetch `equipment.json` / `talents.json` gagal di `file://` lokal | Graceful fallback dengan pesan "Konten tidak tersedia secara lokal" — konsisten dengan pola quest |
| Klik Complete Quest di quest modal lama crash setelah `.btn-job-change` handler dihapus | Diselesaikan atomik di U1: hapus card button DAN update event handler bersamaan; verifikasi Complete Quest masih berfungsi |
| `questIndex.jobs` fallback tidak konsisten setelah fix baris 2869 | Diselesaikan di U1: ganti juga fallback di baris 2889 dari `{ jobs: [] }` ke `{ quests: [] }` |
| `loadQuestFile()` throw tidak tertangkap di caller baru | Setiap fungsi yang call `loadQuestFile()` di luar `openQuest()` harus wrap dalam try/catch sendiri |
| Scroll lock restore prematur saat lebih dari satu modal terbuka | Implementasi counter `openModalCount` untuk semua modal baru; modal lama perlu diaudit |
| Modal state stale jika dibuka rapid untuk job berbeda | Reset `currentDetailJob` dan clear tab content saat `openDetailModal()` dipanggil ulang |
| Achievement links muncul dua kali (card body + tab) jika U6 lupa hapus dari `renderCards()` | U6 Approach secara eksplisit mewajibkan hapus call `renderAchievementLinks()` dari baris 3226 |
| Profile chip layout pecah di layar sempit | Verifikasi flex-wrap `.header-actions` sudah bekerja di mobile viewport |

---

## Sources & References

- **Origin document:** [docs/brainstorms/card-actions-rework-requirements.md](docs/brainstorms/card-actions-rework-requirements.md)
- Card rendering: `index.html` baris 3158–3230
- Quest modal: `index.html` baris 1582–1602, 3309–3488
- Quest index bug: `index.html` baris 2869 (`questIndex.jobs` → `questIndex.quests`)
- Equipment data: `data/equipment.json` (field `tags`)
- Talent data: `data/talents.json` (field `tags`)
- Quest data: `data/quests/index.json`, `data/quests/{slug}.json`
- Profile storage: `itjt_profile_v1`, auto-save baris 4002
- Header HTML: `index.html` baris 1489–1535
