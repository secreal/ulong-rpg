---
title: "feat: Shared Split — Equipment, Talent & Skills"
type: feat
status: completed
date: 2026-05-14
---

# feat: Shared Split — Equipment, Talent & Skills

## Summary

Tambah visual "shared split" di modal detail dan card body: item Equipment/Talent yang dipakai di 2+ job yang user sudah progress ditampilkan terpisah di kolom kanan dengan label "Shared", item unik tetap di kiri. Skills di card body diubah dari inline flat tags ke alpha layout (grouped by huruf pertama) dengan split yang sama. Berlaku di semua job.

---

## Problem Frame

Saat user membuka dua job yang punya banyak Equipment/Talent sama (misal Frontend Developer dan Mobile Developer), daftarnya terlihat identik — sulit membedakan mana yang unik per job dan mana yang memang universal. Hal serupa berlaku untuk Skills di card body yang ditampilkan flat tanpa struktur.

---

## Requirements

- R1. Item Equipment yang muncul di tag 2+ job ber-progress ditampilkan di kanan panel dengan header "Shared"
- R2. Item Talent yang muncul di tag 2+ job ber-progress ditampilkan di kanan panel dengan header "Shared"
- R3. Skills di card body diubah ke alpha layout (grouped by huruf pertama)
- R4. Skills di card body mengikuti shared split yang sama: skill yang ada di 2+ job ber-progress tampil di kanan
- R5. Threshold "ber-progress": job yang punya minimal 1 skill ter-unlock (`skillLevel >= 1`)
- R6. Jika tidak ada item shared (semua unik, atau hanya 1 job ber-progress), kolom kanan tidak muncul — panel tampil normal
- R7. Shared split tidak masuk ke export showcase

---

## Scope Boundaries

- Export showcase tidak diubah
- localStorage structure tidak berubah
- Threshold hanya berbasis skill progress (`skillLevel >= 1`), bukan equip/talent progress
- Tidak ada toggle user untuk menyembunyikan/menampilkan shared — selalu tampil bila ada
- Search box di equip/talent tab tetap filter kedua kolom sekaligus

---

## Context & Research

### Relevant Code and Patterns

- `buildAlphaGroupsHtml(items, kind)` — `index.html` ~line 4867: grouping by huruf pertama, output HTML string. Pattern ini di-reuse untuk split
- `renderItemPanel(pane, items, kind)` — `index.html` ~line 4882: render search + count + alpha groups. Ini yang diextend untuk shared split
- `renderDetailEquipTab(pane)` — `index.html` ~line 5016: filter by `currentDetailJob` tag, panggil `renderItemPanel`
- `renderDetailTalentTab(pane)` — `index.html` ~line 5027: sama seperti equip
- `renderSkills(title, skills)` — `index.html` ~line 4000: inline flat tags di card body. Ini yang diubah ke alpha layout
- `jobHasProgress(title, skillsStr)` — `index.html` ~line 5372: cek apakah ada skill `skillLevel >= 1`. Reuse untuk compute progress jobs
- `jobs` array — `index.html` ~line 2382: setiap entry `[group, title, desc, skillsStr, ...]`. `skillsStr` = comma-separated skills per job
- CSS: `.alpha-group`, `.alpha-group-header`, `.alpha-group-pills`, `.skill`, `.skill-lv-badge` — sudah ada, perlu tambah CSS untuk layout split

### Institutional Learnings

- Tidak ada `docs/solutions/` yang relevan langsung untuk fitur ini

---

## Key Technical Decisions

- **Compute "progressed jobs" secara runtime, bukan cache**: Daftar job ber-progress dihitung saat tab dibuka dari `jobs` array + localStorage. Tidak perlu key localStorage baru — data sudah ada
- **Shared = item.tags overlap dengan 2+ progressed jobs**: Untuk equip/talent, cek `item.tags` berapa job ber-progress yang include tag tersebut. Untuk skills, cek berapa job ber-progress yang punya skill string tersebut di `skillsStr`
- **Layout dua kolom CSS flex/grid**: Panel dibagi `unique-col` (kiri, flex: 1) dan `shared-col` (kanan, lebar fixed ~45%). Jika tidak ada item shared, `shared-col` tidak dirender sama sekali — bukan disembunyikan — agar tidak ada kolom kosong
- **Skills: alpha layout menggantikan flat**, bukan ditambah di sebelahnya. Struktur mengikuti `buildAlphaGroupsHtml` tapi untuk `data-title`/`data-skill` bukan `data-item-id`
- **Search di equip/talent tetap filter kedua kolom**: Event listener search sudah pada level `.alpha-group`, cukup diperluas ke dalam `.shared-col` juga

---

## Open Questions

### Resolved During Planning

- **Apakah skills di modal detail perlu diubah?**: Tidak — skills hanya ada di card body, bukan modal. Modal punya tab Quest/Equip/Talent/Achievement terpisah
- **Threshold "progress" untuk equip/talent shared**: Berbasis job yang punya `skillLevel >= 1` (bukan equip/talent progress) — konsisten dengan `jobHasProgress`

### Deferred to Implementation

- Apakah search di equip/talent perlu label/count terpisah untuk unique vs shared? Biarkan implementer putuskan — bisa cukup satu count gabungan

---

## High-Level Technical Design

> *Directional guidance, not implementation specification.*

```
getProgressedJobs():
  jobs.filter(j => jobHasProgress(j.title, j.skillsStr))
  → [{ title, skillsStr }]

isSharedEquip(item, progressedJobs):
  item.tags.filter(t => progressedJobs.some(j => j.title === t)).length >= 2

isSharedSkill(skillName, progressedJobs):
  progressedJobs.filter(j => j.skillsStr.split(", ").includes(skillName)).length >= 2

renderItemPanelWithSplit(pane, items, kind):
  progressedJobs = getProgressedJobs()
  uniqueItems = items.filter(i => !isSharedEquip(i, progressedJobs))
  sharedItems = items.filter(i => isSharedEquip(i, progressedJobs))
  render: [unique-col | shared-col (jika sharedItems.length > 0)]

renderSkillsAlpha(title, skillsStr):
  progressedJobs = getProgressedJobs()
  skills = skillsStr.split(", ")
  uniqueSkills = skills.filter(s => !isSharedSkill(s, progressedJobs))
  sharedSkills = skills.filter(s => isSharedSkill(s, progressedJobs))
  render alpha groups per kolom
```

Layout panel:
```
┌─────────────────────────────────────────────┐
│ EQUIPMENT                        Shared      │
│ ─────────────────────────────────────────── │
│ [unique-col]          │  [shared-col]        │
│  A                    │   C                  │
│  AngularJS Lv1        │   Cloudflare Lv1     │
│  B                    │   D                  │
│  BackboneJS Lv1       │   Docker Lv1         │
└─────────────────────────────────────────────┘
```

---

## Implementation Units

- U1. **Helper `getProgressedJobs` dan `isShared*` functions**

**Goal:** Fungsi-fungsi utility untuk menghitung job ber-progress dan menentukan apakah item/skill termasuk shared

**Requirements:** R1, R2, R4, R5, R6

**Dependencies:** None

**Files:**
- Modify: `index.html` (JS section, dekat `jobHasProgress` ~line 5372)

**Approach:**
- `getProgressedJobs()` — iterate `jobs` array, filter dengan `jobHasProgress(title, skillsStr)`, return array `{ title, skillsStr }`
- `isSharedEquip(item, progressedJobs)` — count berapa `item.tags` match ke `progressedJobs` titles, return `count >= 2`
- `isSharedSkill(skillName, progressedJobs)` — count berapa progressedJobs yang `skillsStr.split(", ").includes(skillName)`, return `count >= 2`

**Patterns to follow:**
- `jobHasProgress` di ~line 5372 — pola yang sama untuk iterate jobs

**Test scenarios:**
- Happy path: 2 job ber-progress, equip dengan tags keduanya → `isSharedEquip` = true
- Happy path: equip dengan tag hanya 1 progressed job → false
- Edge case: 0 job ber-progress → `getProgressedJobs` return `[]`, semua item jadi unique
- Edge case: 1 job ber-progress → tidak ada yang shared (perlu 2+)
- Edge case: skill ada di 3 progressed jobs → `isSharedSkill` = true
- Edge case: skill typo / tidak match → false, tidak error

**Verification:**
- `getProgressedJobs()` return hanya job yang ada skill ter-unlock
- `isSharedEquip` dan `isSharedSkill` return boolean yang konsisten dengan threshold 2+

---

- U2. **CSS untuk layout shared split panel**

**Goal:** Tambah CSS untuk dua kolom (unique kiri, shared kanan) di dalam panel equip/talent dan skill-list card

**Requirements:** R1, R2, R3, R4, R6

**Dependencies:** None (bisa paralel dengan U1)

**Files:**
- Modify: `index.html` (CSS section, dekat `.alpha-group` ~line 1533)

**Approach:**
- `.panel-split` — flex row container, gap antara kolom
- `.panel-split-unique` — flex: 1, kolom kiri
- `.panel-split-shared` — width ~42%, kolom kanan, ada border-left tipis
- `.panel-split-shared-header` — label "Shared" di atas kolom kanan, style muted/subtle, sejajar dengan section header (EQUIPMENT/TALENT)
- `.skill-list-alpha` — container untuk alpha layout di card body (menggantikan `.skill-list` flat)
- Responsive: di layar sempit (<480px), kolom kanan drop ke bawah (flex-direction: column)

**Patterns to follow:**
- `.alpha-group` CSS di ~line 1533 untuk spacing dan warna
- `--modal-role` CSS var untuk tinting

**Test scenarios:**
- Test expectation: none — pure styling, verifikasi visual

**Verification:**
- Panel equip/talent dengan shared items tampil dua kolom
- Panel tanpa shared items tampil satu kolom normal
- Di mobile (<480px) kolom kanan tidak overflow

---

- U3. **Extend `renderItemPanel` dengan shared split**

**Goal:** Ubah `renderItemPanel` agar split items menjadi unique (kiri) dan shared (kanan) menggunakan helper dari U1

**Requirements:** R1, R2, R6

**Dependencies:** U1, U2

**Files:**
- Modify: `index.html` (fungsi `renderItemPanel` ~line 4882)

**Approach:**
- Panggil `getProgressedJobs()` di awal
- Split `items` menjadi `uniqueItems` dan `sharedItems` via `isSharedEquip`
- Jika `sharedItems.length === 0`: render seperti sekarang (satu kolom, tanpa perubahan visual)
- Jika ada shared: render `.panel-split` dengan dua `.panel-split-unique` dan `.panel-split-shared`
- Masing-masing kolom pakai `buildAlphaGroupsHtml(items, kind)`
- Search event listener diperluas: filter `.alpha-group` di kedua kolom

**Patterns to follow:**
- `buildAlphaGroupsHtml` di ~line 4867
- Search filter pattern di `renderItemPanel` yang sudah ada

**Test scenarios:**
- Happy path: equip tab dengan 2+ progressed jobs, ada shared items → split muncul
- Happy path: equip tab hanya 1 job ber-progress → tidak ada split, tampil normal
- Edge case: semua items shared → unique-col kosong, hanya shared-col berisi
- Edge case: tidak ada items sama sekali → `detailEmptyHtml` seperti sekarang
- Integration: search filter setelah split muncul → filter di kedua kolom sekaligus

**Verification:**
- Equip dan talent tab menampilkan split saat kondisi terpenuhi
- Kolom kiri dan kanan keduanya ter-filter oleh search input

---

- U4. **Ubah `renderSkills` ke alpha layout dengan shared split di card body**

**Goal:** Ganti inline flat tags di card body dengan alpha groups, dengan split unique/shared

**Requirements:** R3, R4, R5, R6

**Dependencies:** U1, U2

**Files:**
- Modify: `index.html` (fungsi `renderSkills` ~line 4000, dan pemanggilan di ~line 4081)

**Approach:**
- Ubah `renderSkills(title, skills)` agar output alpha groups bukan flat tags
- Split skills ke `uniqueSkills` dan `sharedSkills` via `isSharedSkill`
- Jika tidak ada shared: render satu `.skill-list-alpha` dengan alpha groups
- Jika ada shared: render `.panel-split` dengan dua kolom
- Setiap skill tetap pakai `<span class="skill ...">` yang sama (level badge, tooltip, click handler)
- `data-title` dan `data-skill` attrs tetap ada untuk event delegation yang sudah ada

**Patterns to follow:**
- `buildAlphaGroupsHtml` structure untuk grouping
- `renderSkills` yang ada untuk per-skill `<span>` output

**Test scenarios:**
- Happy path: job dengan skills, ada 2+ progressed jobs → shared skills muncul di kanan
- Happy path: job pertama di-progress (belum ada job kedua) → alpha layout tanpa split
- Edge case: semua skills unique → hanya kolom kiri
- Edge case: skill dengan huruf yang sama di unique dan shared → alpha group muncul di kedua kolom secara terpisah
- Integration: click skill di card body → level-up overlay masih berfungsi

**Verification:**
- Skills di card body tampil sebagai alpha groups bukan flat tags
- Shared split muncul/tidak muncul sesuai kondisi
- Level-up interaction (click skill) tetap berfungsi

---

## System-Wide Impact

- **Interaction graph:** `renderSkills` dipanggil dari `renderCards` — perubahan otomatis berlaku saat cards di-re-render (filter, progress update, dll.)
- **Error propagation:** `getProgressedJobs` tidak async, tidak bisa throw — aman
- **State lifecycle risks:** `getProgressedJobs` membaca localStorage setiap kali dipanggil, tidak di-cache — konsisten tapi sedikit lebih berat saat banyak cards. Jumlah jobs terbatas (~30), dampak minimal
- **API surface parity:** Export showcase tidak perlu diubah (R7)
- **Unchanged invariants:** Level-up click handler di card body yang listen ke `.skill[data-title][data-skill]` tetap berfungsi — attribute names tidak berubah, hanya container HTML yang berubah

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `renderSkills` di-re-render saat toggle bahasa | Cek apakah alpha groups juga perlu lang-aware — skill names tidak berubah per bahasa, aman |
| Search di equip/talent tidak filter kolom shared | Pastikan event listener cakup `.panel-split-shared .alpha-group` |
| Layout pecah di card body yang sempit | Test `.skill-list-alpha` dengan `overflow-wrap` dan max-width yang sesuai |
| `getProgressedJobs` terlalu sering dipanggil | Dapat di-cache per render cycle jika ada perf issue — defer ke implementasi |

---

## Sources & References

- Related code: `index.html` — `renderItemPanel`, `buildAlphaGroupsHtml`, `renderSkills`, `jobHasProgress`
