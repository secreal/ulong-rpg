---
title: "feat: Job Progression — Skill-Gated Unlock & Job Change Modal"
type: feat
status: completed
date: 2026-05-10
origin: docs/brainstorms/job-progression-requirements.md
---

# feat: Job Progression — Skill-Gated Unlock & Job Change Modal

## Summary

Menambahkan sistem progression berbasis skill ke ulong RPG. Job T2/T3 disembunyikan sampai user memiliki ≥2 skill aktif di job T1 group yang sama. Setelah terbuka, user bisa melakukan **Job Change** — modal baru yang memungkinkan user naik tier dan opsional meng-include job T1 lain sebagai sub-skill. State Job Change menggantikan slot showcase yang ada (`itjt_slots_v1`) dan fitur "Atur Slot" dihapus — Job Change adalah satu-satunya cara konfigurasi slot. Tombol quest yang sekarang bernama "Job Change" diganti menjadi "Qualification".

---

## Problem Frame

Saat ini semua 37 job tampil sekaligus tanpa konteks progression. User yang baru mulai kebanjiran pilihan; user yang sudah berpengalaman tidak punya cara untuk menyatakan "aku sudah di posisi Fullstack". Tidak ada mekanisme yang menghubungkan skill progress dengan visibilitas job. (See origin: docs/brainstorms/job-progression-requirements.md)

---

## Requirements

- **R1.** Hanya job T0 dan T1 yang tampil pada awal (tanpa skill apapun)
- **R2.** Job T2 suatu group muncul ketika ada ≥2 skill aktif (level ≥1) di minimal satu job T1 dalam group yang sama
- **R3.** Job T3 suatu group muncul ketika ada ≥2 skill aktif di job T2 dalam group yang sama
- **R4.** Leadership (Eng Manager, CTO, CISO — tier 3/4) muncul ketika ada ≥2 skill aktif di job T2 atau T3 dari group manapun
- **R5.** Tombol "Job Change" (baru) muncul hanya di card job T2/T3 yang sudah unlocked
- **R6.** Modal Job Change menampilkan job tujuan dan daftar job T1 yang eligible di-include (minimal 1 skill aktif)
- **R7.** Include bersifat opsional — Job Change bisa dilakukan tanpa include manapun
- **R8.** Setelah Job Change: job T1 asal melebur jadi sub di panel T2 (tidak tampil terpisah), job T1 yang di-include juga jadi sub, job T1 yang tidak di-include tetap standalone
- **R9.** State Job Change disimpan di `itjt_jobchange_v1` localStorage
- **R10.** Tombol quest yang sekarang bernama "Job Change" diganti menjadi "Qualification"
- **R11.** Fitur "Atur Slot" dihapus sepenuhnya — CSS, HTML, JS, dan event listener
- **R12.** `generateShowcaseHTML()` menggunakan Job Change state (bukan slot state) untuk render anchor vs standalone
- **R13.** User yang sudah punya skill progress sebelum fitur ini bisa langsung unlock job T2/T3 jika threshold terpenuhi

**Origin actors:** A1 (User ulong RPG), A2 (Viewer showcase)
**Origin flows:** F1 (unlock tier), F2 (Job Change modal), F3 (Qualification rename)
**Origin acceptance examples:** AE1 (R1-R2), AE2 (R2, R5), AE3 (R6-R8), AE4 (R13), AE5 (R10)

---

## Scope Boundaries

- Tidak ada "undo Job Change" — sekali Job Change dilakukan, state baru berlaku
- Tidak ada notifikasi/achievement saat Job Change
- Quest modal (Qualification) tidak berubah fungsionalitasnya
- IT Novice (T0) tidak menjadi gate ke T1 — T1 selalu tampil dari awal
- Include di luar group yang sama diizinkan selama ada skill aktif di job tersebut (sistem percaya user)
- Quest data (`jobQuests`) tidak berubah — saat ini hanya Frontend Developer dan Manual QA punya data quest

---

## Context & Research

### Relevant Code and Patterns

- `index.html:1753` — jobs array, format `[group, title, desc, skills, salary, role, hair, tool, tier, charStyle, accClass]`, tier di index 8
- `index.html:2584` — `renderCards(group)` — satu-satunya tempat card grid dirender; ini yang perlu ditambah tier-gate
- `index.html:2603` — destructuring jobs tuple dalam `renderCards`, termasuk `tier`
- `index.html:2641–2643` — template literal untuk tombol "Job Change" (→ ganti jadi "Qualification")
- `index.html:3224–3228` — delegated event listener untuk `.btn-job-change` (→ tetap trigger `openQuest`)
- `index.html:2728–2811` — `openQuest()`, `renderQuestContent()`, `closeQuest()` — tidak berubah
- `index.html:2338–2343` — localStorage key constants; `SLOTS_KEY` di line 2343 → hapus, tambah `JOB_CHANGE_KEY`
- `index.html:2382–2389` — `loadSlots()` / `saveSlots()` → hapus, ganti dengan `loadJobChange()` / `saveJobChange()`
- `index.html:2392` — `let slots = loadSlots()` → hapus
- `index.html:2829–2938` — seluruh Slot Editor Modal JS block → hapus
- `index.html:1222–1310` — CSS slot modal dan slot-row → hapus
- `index.html:1707–1710` — HTML `<div class="slot-row">` di export modal → hapus
- `index.html:1729–1745` — HTML slot modal overlay → hapus
- `index.html:3313–3314` — `btn-open-slot` event listener + `updateSlotStatusLabel()` call → hapus
- `index.html:3333` — `loadSlots()` di `buildExportHTML()` → ganti `loadJobChange()`
- `index.html:3342` — `generateShowcaseHTML(..., snapSlots)` → ganti dengan `snapJobChange`
- `index.html:3464` — `generateShowcaseHTML(prof, filteredJobs, snap, snapLinks, snapSlots)` → update signature
- `index.html:3472–3480` — `validSlots` / `anchorTitles` / `standaloneTitles` logic → update untuk Job Change state
- Modal pattern yang sudah ada: overlay `opacity:0/pointer-events:none` → `.open` class (lihat `#quest-overlay`, `#sync-overlay`)

### Institutional Learnings

- Tidak ada `docs/solutions/` yang relevan ditemukan

### Career Path Map (data prerequisite)

Prerequisite yang perlu di-encode sebagai struktur data:

| Group | T1 jobs | Unlocks T2 | T2 jobs | Unlocks T3 |
|-------|---------|------------|---------|------------|
| Software | Frontend, Backend, Mobile | ≥2 skill di salah satu T1 | Fullstack | ≥2 skill di Fullstack |
| Software T3 | | | | Tech Lead (butuh Fullstack) |
| QA | Manual QA | ≥2 skill di Manual QA | QA Automation, Performance Tester | — |
| Data | Data Analyst | ≥2 skill di Data Analyst | BI Developer, Data Engineer, Data Scientist | ≥2 skill di salah satu T2 Data |
| Data T3 | | | | AI Engineer |
| Infra | SysAdmin, Network Eng | ≥2 skill di salah satu T1 | Cloud Eng, DevOps, DBA | ≥2 skill di salah satu T2 Infra |
| Infra T3 | | | | SRE |
| Security | SOC Analyst | ≥2 skill di SOC Analyst | Security Eng, Pentester, GRC, AppSec | ≥2 skill di salah satu T2 Security |
| Security T3 | | | | AppSec Eng |
| Product | Business Analyst | ≥2 skill di BA | Product Owner, Project Manager | ≥2 skill di salah satu T2 Product |
| Product T3 | | | | Product Manager |
| Design | UI Designer | ≥2 skill di UI Designer | UX Designer | ≥2 skill di UX Designer |
| Design T3 | | | | Product Designer |
| Support | Helpdesk | ≥2 skill di Helpdesk | Technical Support, App Support | — |
| Leadership | (lintas group) | ≥2 skill di job T2/T3 manapun | Eng Manager, CTO, CISO | — |

---

## Key Technical Decisions

- **`jobProgressionTree` sebagai constant di JS:** Prerequisite map disimpan sebagai object JS di dekat jobs array. Format: setiap entry memetakan job title ke `{ unlockedBy: string[] }` — list job yang perlu punya ≥2 skill aktif (OR logic: cukup satu). Ini cukup untuk semua kasus termasuk Leadership. Didefinisikan satu kali, dibaca di `renderCards()` dan di modal Job Change.

- **Unlock check inline di `renderCards()`:** Satu fungsi `isJobUnlocked(jobTitle, tier)` — return true jika tier ≤ 1 (selalu tampil), atau jika prerequisite tree-nya terpenuhi. Dipanggil per job saat render. Tidak ada caching yang diperlukan (37 job, overhead negligible).

- **Job Change state format:** `itjt_jobchange_v1` menyimpan objek: `{ primary: "Fullstack Developer", subs: ["Backend Developer"] }` — satu active job saja (bukan array 3 slot). User hanya punya satu "active identity" sekarang. Menggunakan field yang sama (`primary`, `subs`) agar `generateShowcaseHTML()` logic minimal berubah.

- **Modal Job Change baru (bukan overlay terpisah):** Menggunakan pattern modal yang sudah ada (quest overlay pattern). Satu modal dengan ID `#jobchange-overlay`. CSS mengikuti pola `.modal-overlay` yang ada.

- **Job T1 "asal" saat Job Change:** Yang dimaksud "asal" adalah job T1 yang paling banyak memenuhi prerequisite unlock — dalam praktiknya, job T1 yang paling banyak skill aktifnya di group yang sama. Di modal, user hanya memilih job T1 mana yang mau di-include sebagai sub. Job T1 yang **tidak dipilih** sebagai sub tidak hilang dari grid — tetap tampil standalone. Job T1 yang **dipilih** sebagai sub tampil di panel anchor T2. Tidak ada "diserap hilang total" — semuanya melebur jadi sub atau tetap standalone. Ini lebih simpel dari requirements awal dan tidak butuh tracking "primary T1".

- **`generateShowcaseHTML()` tetap backward compatible:** Signature diubah dari `snapSlots` ke `snapJobChange`. Null-safe: jika `snapJobChange` null/empty, semua job tampil sebagai standalone (sama seperti sebelum ada Job Change).

- **Hapus slot system sepenuhnya:** `itjt_slots_v1` tidak lagi dibaca atau ditulis. User yang sebelumnya punya slot config akan kehilangan config tersebut — ini acceptable karena fitur Job Change menggantikannya dengan UX yang lebih intuitif.

---

## Open Questions

### Resolved During Planning

- **Tampilan card T1 yang "diserap":** Melebur jadi sub di panel T2, tidak hilang total dari app. Sub tampil di panel ketika anchor T2 diklik.
- **T0 sebagai gate ke T1:** T1 selalu tampil — T0 tidak menjadi gate.
- **Leadership prerequisite:** Butuh ≥2 skill di job T2/T3 dari group manapun.
- **State coexistence:** Job Change menggantikan slot showcase, Atur Slot dihapus.
- **"Primary T1":** Tidak perlu tracking job T1 asal — semua T1 yang di-include jadi sub, yang tidak di-include tetap standalone. Tidak ada yang "hilang total".

### Deferred to Implementation

- **Exact pixel values untuk Job Change modal:** Disesuaikan saat implementasi mengikuti pola modal yang ada.
- **String exact untuk teks modal Job Change:** "Naik ke [Job]?", "Job mana yang mau kamu bawa?" — copywriting final saat implementasi.
- **`unlockedBy` untuk edge case:** Fullstack bisa datang dari Frontend, Backend, atau Mobile — di `jobProgressionTree` ini direpresentasikan sebagai OR. Jika satu user punya 2+ skill di Frontend saja, itu sudah cukup. Implementor perlu pastikan logic ini.

---

## High-Level Technical Design

> *Ini adalah directional guidance, bukan implementation specification.*

```
// Data structure (JS constant near jobs array)
const jobProgressionTree = {
  "Fullstack Developer":    { unlockedBy: ["Frontend Developer", "Backend Developer", "Mobile Developer"] },
  "Tech Lead":              { unlockedBy: ["Fullstack Developer"] },
  "QA Automation":          { unlockedBy: ["Manual QA"] },
  "Performance Tester":     { unlockedBy: ["Manual QA"] },
  "BI Developer":           { unlockedBy: ["Data Analyst"] },
  "Data Engineer":          { unlockedBy: ["Data Analyst"] },
  "Data Scientist":         { unlockedBy: ["Data Analyst"] },
  "AI Engineer":            { unlockedBy: ["BI Developer", "Data Engineer", "Data Scientist"] },
  "Cloud Engineer":         { unlockedBy: ["System Administrator", "Network Engineer"] },
  "DevOps":                 { unlockedBy: ["System Administrator", "Network Engineer"] },
  "DBA":                    { unlockedBy: ["System Administrator", "Network Engineer"] },
  "SRE":                    { unlockedBy: ["Cloud Engineer", "DevOps", "DBA"] },
  "Security Engineer":      { unlockedBy: ["SOC Analyst"] },
  "Pentester":              { unlockedBy: ["SOC Analyst"] },
  "GRC":                    { unlockedBy: ["SOC Analyst"] },
  "AppSec":                 { unlockedBy: ["SOC Analyst"] },
  "AppSec Engineer":        { unlockedBy: ["Security Engineer", "Pentester", "GRC", "AppSec"] },
  "Product Owner":          { unlockedBy: ["Business Analyst"] },
  "Project Manager":        { unlockedBy: ["Business Analyst"] },
  "Product Manager":        { unlockedBy: ["Product Owner", "Project Manager"] },
  "UX Designer":            { unlockedBy: ["UI Designer"] },
  "Product Designer":       { unlockedBy: ["UX Designer"] },
  "Technical Support":      { unlockedBy: ["Helpdesk"] },
  "App Support":            { unlockedBy: ["Helpdesk"] },
  "Engineering Manager":    { unlockedBy: ["__any_t2_t3__"] },  // special case
  "CTO":                    { unlockedBy: ["__any_t2_t3__"] },
  "CISO":                   { unlockedBy: ["__any_t2_t3__"] },
};

// Unlock check function
function isJobUnlocked(jobTitle, tier) {
  if (tier <= 1) return true;  // T0 dan T1 selalu tampil
  const node = jobProgressionTree[jobTitle];
  if (!node) return true;  // tidak terdaftar = selalu tampil
  if (node.unlockedBy.includes("__any_t2_t3__")) {
    // Leadership: ada ≥2 skill aktif di job T2 atau T3 manapun
    return jobs.some(([,,, skills, ,,,, t]) =>
      t >= 2 && skills.split(", ").filter(s => skillLevel(jobTitle_dari_jobs, s) >= 1).length >= 2
    );
  }
  return node.unlockedBy.some(prereqTitle => {
    const prereqJob = jobs.find(([, t]) => t === prereqTitle);
    if (!prereqJob) return false;
    const [,, , skills] = prereqJob;
    const activeCount = skills.split(", ").filter(s => skillLevel(prereqTitle, s) >= 1).length;
    return activeCount >= 2;
  });
}

// Job Change state format
{
  primary: "Fullstack Developer",
  subs: ["Backend Developer"]  // job T1 yang di-include
}
```

---

## Implementation Units

- U1. **Hapus slot showcase system sepenuhnya**

**Goal:** Bersihkan semua kode yang berkaitan dengan slot system (`itjt_slots_v1`, Atur Slot modal, CSS slot, HTML slot) agar tidak ada dead code sebelum fitur baru dibangun.

**Requirements:** R11

**Dependencies:** None

**Files:**
- Modify: `index.html`

**Approach:**
- Hapus CSS lines 1222–1310 (slot modal + slot-row styles)
- Hapus HTML div `slot-row` (lines 1707–1710) dari export modal
- Hapus HTML slot modal overlay (lines 1729–1745)
- Hapus `SLOTS_KEY` constant (line 2343)
- Hapus `loadSlots()` dan `saveSlots()` functions (lines 2382–2389)
- Hapus `let slots = loadSlots()` (line 2392)
- Hapus seluruh Slot Editor Modal JS section (lines 2829–2938): semua fungsi `jobHasProgress`, `buildSlotSection`, `openSlotEditor`, `closeSlotEditor`, `saveSlotEditor`, `updateSlotStatusLabel` dan event listenernya
- Hapus `btn-open-slot` event listener dan `updateSlotStatusLabel()` call (lines 3313–3314)
- Di `buildExportHTML()`: hapus `const snapSlots = loadSlots()` (line 3333) dan hapus parameter `snapSlots` dari call ke `generateShowcaseHTML` (line 3342)
- Di `generateShowcaseHTML()` signature: hapus parameter `snapSlots` dan semua logic yang menggunakannya (validSlots, anchorTitles, standaloneTitles, anchorHTML, standaloneHTML) — kembalikan ke render semua job sebagai flat cards (seperti sebelum fitur slot ditambahkan)
- Hapus showcase CSS `anchor-card`, `anchor-panel`, `sub-card*`, `standalone-section-label`, `anchor-section-label` dari inline style di generated HTML

**Patterns to follow:**
- Setelah delete, `generateShowcaseHTML()` harus kembali ke versi flat yang render semua job sebagai `<article class="card">` biasa

**Test scenarios:**
- Happy path: export showcase setelah cleanup menghasilkan HTML valid dengan semua job sebagai flat cards, tanpa error JS
- Happy path: halaman utama app tidak ada error console setelah cleanup (elemen yang dihapus tidak direferensikan lagi)
- Edge case: user yang punya `itjt_slots_v1` di localStorage — tidak menyebabkan error saat app diload (key yang tidak diread tidak berbahaya)

**Verification:**
- Tidak ada referensi ke `SLOTS_KEY`, `loadSlots`, `saveSlots`, `openSlotEditor`, `updateSlotStatusLabel`, `btn-open-slot`, `slot-overlay`, `slot-sections` di index.html
- Export modal tidak menampilkan tombol "Atur Slot"
- Showcase yang di-generate adalah flat grid tanpa anchor/standalone splitting

---

- U2. **Tambah `jobProgressionTree` dan `isJobUnlocked()` helper**

**Goal:** Data struktur prerequisite dan fungsi unlock check yang dipakai oleh rendering dan modal.

**Requirements:** R1, R2, R3, R4, R13

**Dependencies:** U1

**Files:**
- Modify: `index.html` (JS section, dekat jobs array atau setelah jobs array)

**Approach:**
- Tambahkan `const jobProgressionTree = { ... }` sesuai career path map di Key Technical Decisions
- Tambahkan `function isJobUnlocked(jobTitle, tier)` yang mengimplementasikan:
  - tier ≤ 1 → return true (T0 dan T1 selalu tampil)
  - Leadership special case (`__any_t2_t3__`) → cek apakah ada job T2/T3 manapun dengan ≥2 skill aktif
  - General case → cek apakah ada satu job di `unlockedBy` yang punya ≥2 skill aktif
- Tambahkan `JOB_CHANGE_KEY = "itjt_jobchange_v1"` ke blok constants
- Tambahkan `function loadJobChange()` dan `function saveJobChange(data)` mengikuti pola `loadLinks()` / `saveLinks()` yang sudah ada
- Tambahkan `let jobChangeState = loadJobChange()` ke inisialisasi state (dekat `let slots = loadSlots()` yang sudah dihapus)

**Patterns to follow:**
- `index.html:2338–2343` — format constant localStorage keys
- `index.html:2345–2380` — pola `loadLinks()` dengan try/catch

**Test scenarios:**
- Happy path: `isJobUnlocked("IT Novice", 0)` → true
- Happy path: `isJobUnlocked("Frontend Developer", 1)` → true (tier 1 selalu true)
- Happy path: `isJobUnlocked("Fullstack Developer", 2)` tanpa skill apapun → false
- Happy path: setelah user punya 2 skill di Frontend Developer → `isJobUnlocked("Fullstack Developer", 2)` → true
- Happy path: `isJobUnlocked("Engineering Manager", 3)` tanpa T2 skill → false
- Happy path: setelah user punya 2 skill di Fullstack Developer → `isJobUnlocked("Engineering Manager", 3)` → true
- Edge case: job tidak ada di `jobProgressionTree` → return true (graceful default)
- Edge case: `loadJobChange()` dengan localStorage null/corrupt → return null tanpa throw

**Verification:**
- `jobProgressionTree` mencakup semua job T2/T3/T4 dari jobs array (tidak ada yang terlewat)
- `isJobUnlocked` bisa dipanggil dari console browser tanpa error untuk semua 37 job titles

---

- U3. **Tier-gate visibility di `renderCards()`**

**Goal:** Card T2/T3 hanya muncul di grid jika `isJobUnlocked()` return true.

**Requirements:** R1, R2, R3, R4

**Dependencies:** U2

**Files:**
- Modify: `index.html` (fungsi `renderCards`, line ~2584)

**Approach:**
- Di dalam `renderCards()`, setelah filter `group` dan `activeMyProgress`, tambahkan filter `isJobUnlocked(title, tier)`
- Jobs yang tidak unlocked tidak masuk ke rendered HTML sama sekali (tidak ada "locked card" placeholder)
- `renderCards()` sudah dipanggil setiap kali skill berubah (via `refreshCards()`) — unlock state otomatis re-evaluated setiap render

**Patterns to follow:**
- `index.html:2586–2598` — pola filter chain yang sudah ada di `renderCards()`

**Test scenarios:**
- Covers AE1: grid baru (tanpa skill) hanya menampilkan IT Novice + semua T1 jobs (Frontend, Backend, Manual QA, Data Analyst, dll)
- Covers AE2: setelah tambah 2 skill di Frontend Developer, Fullstack Developer muncul di grid
- Happy path: setelah tambah 2 skill di Fullstack Developer, Tech Lead muncul di grid
- Happy path: setelah tambah 2 skill di job T2 manapun, Engineering Manager muncul
- Edge case: user punya 1 skill di Frontend dan 1 skill di Backend (total 2 tapi di job yang berbeda) → Fullstack belum muncul (threshold per job, bukan aggregate)
- Edge case: sidebar filter "Software" aktif + Fullstack belum unlock → tidak ada Fullstack yang terselip
- Integration: skill toggle → `refreshCards()` → `renderCards()` → unlock state terupdate tanpa page reload

**Verification:**
- Covers AE1: buka app tanpa skill, hanya T0+T1 tampil (hitung card: IT Novice + 8 group T1 = sekitar 9 card awal vs 37 sebelumnya)
- Covers AE4: isi 2+ skill di Frontend Developer langsung → Fullstack muncul tanpa reload

---

- U4. **Rename tombol "Job Change" → "Qualification"**

**Goal:** Tombol yang membuka quest modal berganti nama — tidak ada perubahan fungsional.

**Requirements:** R10

**Dependencies:** U3

**Files:**
- Modify: `index.html` (template literal di `renderCards`, line ~2641; CSS class jika perlu, dan string teks)

**Approach:**
- Ganti string `"⚔ Job Change"` menjadi `"📋 Qualification"` (atau emoji yang sesuai) di template literal line 2641
- CSS class `.btn-job-change` bisa tetap (hanya nama class internal, tidak terlihat user) — atau diganti `.btn-qualification` jika ingin konsisten. Jika diganti, update semua referensi: CSS definition, template literal, dan event listener
- Event listener dan `openQuest()` tidak berubah

**Patterns to follow:**
- `index.html:2641–2643` — template literal tombol yang perlu diubah teksnya

**Test scenarios:**
- Covers AE5: card Frontend Developer menampilkan tombol bertuliskan "Qualification", bukan "Job Change"
- Happy path: klik tombol "Qualification" → quest modal terbuka seperti biasa
- Happy path: progress bar di tombol masih tampil jika ada quest progress (format ` · N%` masih berfungsi)

**Verification:**
- String "⚔ Job Change" tidak ada lagi di tombol yang membuka quest modal
- Quest modal masih bisa dibuka via tombol yang sudah diubah namanya

---

- U5. **Job Change modal — HTML, CSS, dan JS**

**Goal:** Modal baru yang muncul ketika user klik "Job Change" di card T2/T3 yang sudah unlocked — menampilkan job tujuan dan pilihan include job T1.

**Requirements:** R5, R6, R7, R8, R9

**Dependencies:** U3, U4

**Files:**
- Modify: `index.html` (CSS, HTML modal, JS functions, event listeners)

**Approach:**

**HTML:** Tambahkan modal overlay baru `#jobchange-overlay` sebelum `<input type="file">`. Struktur: close button, judul "⚔ Job Change", subjudul dengan nama job tujuan, section include picker (list checkbox), footer dengan tombol "Batal" dan "Konfirmasi Job Change".

**CSS:** Tambahkan `.jobchange-modal-overlay`, `.jobchange-modal` mengikuti pola `.slot-modal-overlay` yang sudah dihapus. Z-index 750 (sama seperti slot sebelumnya, di atas export modal 700). Tambahkan styling untuk tombol "Job Change" baru di card T2/T3 (berbeda visual dari "Qualification" — lebih prominent).

**JS fungsi:**
- `openJobChangeModal(jobTitle, roleColor)` — mengisi konten modal berdasarkan job T2/T3 yang dipilih:
  - Set judul job tujuan
  - Cari job T1 eligible: job dengan minimal 1 skill aktif (`jobHasProgress`) di group yang sama ATAU group lain
  - Render checkbox per eligible T1 job (pre-check jika sebelumnya sudah jadi sub di state yang ada)
- `closeJobChangeModal()` — remove `.open` dari overlay
- `confirmJobChange()` — baca DOM state checkbox → buat objek `{ primary: jobTitle, subs: [...checked] }` → `saveJobChange()` → update `jobChangeState` → `refreshCards()` → `closeJobChangeModal()`
- `jobHasProgress(title, skillsStr)` — re-implement (sudah dihapus di U1), atau gunakan inline check

**Tombol di card T2/T3:** Di dalam `renderCards()`, untuk job yang unlocked (tier ≥ 2), tambahkan tombol "⚔ Job Change" dengan class `.btn-do-jobchange` (berbeda dari `.btn-job-change` yang sekarang jadi Qualification). Data attribute: `data-job="${title}"` dan `data-role="${role}"`.

**Event listener:** Delegated di `#jobs` container, tangkap `.btn-do-jobchange` click → `openJobChangeModal(btn.dataset.job, btn.dataset.role)`.

**Patterns to follow:**
- `index.html:2728–2811` — pola `openQuest()` untuk populate modal content
- `index.html:2804–2810` — pola `closeSync()` untuk close modal
- Modal overlay click-to-close pattern yang ada di sync overlay

**Test scenarios:**
- Covers AE2: card Fullstack Developer yang sudah unlocked menampilkan tombol "⚔ Job Change"
- Happy path: klik "Job Change" di Fullstack Developer → modal muncul dengan job tujuan "Fullstack Developer" dan daftar T1 eligible
- Covers AE3: pilih include Backend Developer → konfirmasi → `jobChangeState` tersimpan dengan `{ primary: "Fullstack Developer", subs: ["Backend Developer"] }`
- Happy path: konfirmasi tanpa pilih include apapun → `jobChangeState` tersimpan dengan `subs: []`
- Happy path: modal close button dan backdrop click → modal tertutup tanpa save
- Edge case: tidak ada T1 job dengan skill aktif → modal masih bisa dibuka, section include menampilkan pesan kosong
- Edge case: user lakukan Job Change kedua kalinya (ganti dari Fullstack ke AI Engineer) → state terbaru menimpa state lama, showcase update
- Integration: setelah konfirmasi Job Change → `refreshCards()` dipanggil → card grid terupdate

**Verification:**
- Covers AE3: setelah Job Change ke Fullstack dengan include Backend, `loadJobChange()` return `{ primary: "Fullstack Developer", subs: ["Backend Developer"] }`
- State tersimpan di localStorage dan masih ada setelah browser reload

---

- U6. **Update `generateShowcaseHTML()` untuk Job Change state**

**Goal:** Showcase yang di-export mencerminkan Job Change state — job T2/T3 muncul sebagai anchor card, job yang di-include muncul sebagai sub, job lain sebagai standalone.

**Requirements:** R8, R12

**Dependencies:** U5

**Files:**
- Modify: `index.html` (`buildExportHTML()` dan `generateShowcaseHTML()`)

**Approach:**
- Di `buildExportHTML()`: ganti `loadSlots()` → `loadJobChange()`, rename variable dari `snapSlots` ke `snapJobChange`
- Di `generateShowcaseHTML(prof, filteredJobs, snap, snapLinks, snapJobChange)`: update signature
- Partisi jobs: jika `snapJobChange` ada (tidak null):
  - `primaryTitle = snapJobChange.primary`
  - `subTitles = new Set(snapJobChange.subs)`
  - `absentTitles = Set dari T1 jobs yang menjadi "asal" (T1 yang tidak di-include dan group yang sama)` → tetap standalone
  - Anchor card: hanya `primaryTitle`
  - Sub cards: job T1 yang ada di `subTitles` → tampil di panel anchor
  - Standalone: semua job yang ada progress tapi bukan `primaryTitle` dan bukan di `subTitles`
- Jika `snapJobChange` null → semua job tampil sebagai flat cards (backward compatible)
- Re-use CSS anchor card classes yang sudah ada di generated HTML, atau simplifikasi — satu anchor card + panel untuk satu Job Change state

**Patterns to follow:**
- `generateShowcaseHTML` sebelum slot system ditambahkan (flat render) sebagai baseline
- Anchor card pattern dari slot implementation yang baru dihapus — logic-nya tetap valid, hanya data source-nya berbeda

**Test scenarios:**
- Happy path: `snapJobChange = null` → semua job tampil sebagai flat grid (backward compatible)
- Happy path: `snapJobChange = { primary: "Fullstack Developer", subs: ["Backend Developer"] }` → Fullstack tampil sebagai anchor dengan panel berisi Backend Developer sub-card
- Covers AE3: Mobile Developer (ada skill tapi tidak di-include) tampil sebagai standalone card di bawah
- Edge case: `snapJobChange.primary` tidak ada di `filteredJobs` (job T2 yang tidak punya progress) → fallback ke flat render

**Verification:**
- Generate showcase dengan Job Change state → HTML valid, anchor card muncul dengan panel sub-skills
- Generate showcase tanpa Job Change state → flat grid seperti sebelumnya

---

## System-Wide Impact

- **Interaction graph:** `renderCards()` dipanggil dari `refreshCards()` yang dipanggil setiap skill toggle — unlock state auto-evaluated. `confirmJobChange()` memanggil `refreshCards()` setelah save.
- **Error propagation:** `isJobUnlocked()` dengan job tidak dikenal return true (graceful fallback). `loadJobChange()` dengan data corrupt return null.
- **State lifecycle risks:** User yang punya `itjt_slots_v1` di localStorage tidak akan error — key lama tidak dibaca lagi. Job Change state tersimpan terpisah di `itjt_jobchange_v1`.
- **API surface parity:** `generateShowcaseHTML()` signature berubah — `snapSlots` → `snapJobChange`. Hanya dipanggil dari `buildExportHTML()` dan fallback download.
- **Integration coverage:** Skill toggle → renderCards re-run → unlock state fresh. Job Change → refreshCards → showcase reflects new state.
- **Unchanged invariants:** `skillLevel()`, `skillKey()`, `loadProgress()`, quest system, sync system, export flow tidak berubah. Sidebar filter dan "My Progress" filter tetap bekerja di atas unlock filter.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| User yang sudah punya slot config lama (`itjt_slots_v1`) kehilangan config mereka | Acceptable — fitur slot baru saja diluncurkan, belum ada user production yang bergantung padanya |
| `isJobUnlocked()` dipanggil per-job per-render (37 × skill check) — performa | 37 job, tiap check O(n skills per prereq job) ≈ 37×4 skill checks = trivial. Tidak perlu caching. |
| Leadership unlock `__any_t2_t3__` butuh scan semua jobs setiap render | Sama seperti di atas — max 37 job × 4 skill = 148 checks. Negligible. |
| T1 job yang di-include tapi progress-nya nol — sub-card kosong di showcase | `buildSkillBadges()` di showcase untuk job tanpa skill akan render badge kosong. Bisa diterima — user yang include job tersebut sadar kondisinya. |
| Job titles di `jobProgressionTree` harus persis sama dengan jobs array titles | Verifikasi manual saat implementasi. Typo akan menyebabkan job tidak pernah unlock. |

---

## Sources & References

- **Origin document:** [docs/brainstorms/job-progression-requirements.md](docs/brainstorms/job-progression-requirements.md)
- Related code: `index.html` — `renderCards()` line 2584, `openQuest()` line 2728, jobs array line 1753
- Previous plan: `docs/plans/2026-05-10-009-feat-job-slot-showcase-plan.md` (slot system yang digantikan oleh plan ini)
