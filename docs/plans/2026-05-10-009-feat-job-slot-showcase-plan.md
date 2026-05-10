---
title: "feat: Job Slot System — Custom Showcase Identity"
type: feat
status: active
date: 2026-05-10
origin: docs/brainstorms/job-slot-showcase-requirements.md
---

# feat: Job Slot System — Custom Showcase Identity

## Summary

Menambahkan sistem slot ke showcase export: user mengkonfigurasi hingga 3 "anchor slot" (masing-masing berisi satu job utama + pilihan sub-jobs), lalu slot config tersebut dibaca oleh `generateShowcaseHTML()` untuk menampilkan anchor card secara prominent dan standalone card untuk job yang tidak masuk slot. Semua perubahan di `index.html` saja — storage layer, slot editor UI modal, dan showcase generator.

---

## Problem Frame

Showcase saat ini menampilkan semua job dengan progress sebagai card setara tanpa hierarki atau narasi identitas. Tidak ada cara untuk menyatakan "ini identitas utama saya" atau menunjukkan bahwa satu skill adalah bagian dari konteks yang lebih besar. Job Slot System memberi user kontrol editorial atas bagaimana showcase mereka dibaca — siapa mereka, bukan hanya apa yang mereka bisa.

---

## Requirements

- R1. User dapat membuat hingga 3 anchor slot; setiap slot berisi tepat 1 job anchor
- R2. Job anchor bisa job dari tier berapa saja yang punya progress (minimal 1 skill level > 0)
- R3. Di dalam setiap anchor, user dapat memilih job lain yang punya progress sebagai sub-skill — tidak ada batasan jumlah sub per slot
- R4. Sub-skill boleh di-share antar anchor: job yang sama bisa muncul sebagai sub di lebih dari satu slot
- R5. Konfigurasi slot (anchor + sub per slot) disimpan di localStorage key baru dan dipertahankan antar sesi
- R6. Di showcase, anchor card ditampilkan prominently; job tanpa slot tampil sebagai standalone card
- R7. Membuka anchor card menampilkan panel/modal yang berisi detail skill job anchor + breakdown sub-skill beserta progress masing-masing, semua dalam satu scroll tanpa tab switching
- R8. Sub yang shared antar slot tampil di kedua panel anchor masing-masing — tidak ada konflik
- R9. Sistem tidak enforce logika profesi — user bebas memilih kombinasi apapun
- R10. Hanya job dengan progress (minimal 1 skill level > 0) yang bisa dipilih sebagai anchor atau sub

**Origin actors:** A1 (User ulong RPG — konfigurasi slot), A2 (Viewer showcase — membaca hasil)
**Origin flows:** F1 (Konfigurasi Job Slot), F2 (Viewer melihat showcase)
**Origin acceptance examples:** AE1 (covers R3, R4 — shared sub), AE2 (covers R6, R7 — anchor+standalone layout), AE3 (covers R9 — no enforcement), AE4 (covers R10 — progress gate), AE5 (covers R2 — T1 job bisa jadi anchor)

---

## Scope Boundaries

- Tidak mengubah progress tracking, skill toggle, quest system, atau jobs array
- Tidak ada perubahan tampilan di main app — slot hanya mempengaruhi showcase output
- Tidak ada enforcement logika profesi (R9 — user bebas)
- Tidak ada localization (EN strings) untuk slot editor di v1 ini
- Tidak ada visualisasi graph/tree antar job
- Slot editor tidak accessible dari main header — hanya dari export modal flow

### Deferred to Follow-Up Work

- EN strings untuk slot editor UI: ditambahkan saat localization feature (plan 006) diimplementasi
- Reorder/drag slot: user mengatur urutan tampil anchor card di showcase — bisa jadi follow-up setelah v1

---

## Context & Research

### Relevant Code and Patterns

- `index.html:2222–2226` — storage constants (`STORAGE_KEY`, `LINKS_KEY`, `PROFILE_KEY`, `AUTO_KEY`, `GDRIVE_SYNC_KEY`); pattern untuk key baru: `const SLOTS_KEY = "itjt_slots_v1"`
- `index.html:2228–2263` — `loadProgress()`, `saveProgress()`, dan sibling helpers — pattern untuk `loadSlots()` / `saveSlots()`
- `index.html:2689–2694` — `openSync()` / `closeSync()` — 3-line pattern untuk semua modal open/close
- `index.html:990–1055` — CSS sync modal (`.sync-modal-overlay`, `.sync-modal`) — template untuk `.slot-modal-overlay` / `.slot-modal` di z-index 650
- `index.html:1511–1590` — HTML sync modal — template untuk slot editor HTML structure
- `index.html:3085–3097` — `buildExportHTML()` — partisi `filteredJobs` dan pemanggilan `generateShowcaseHTML()` — titik injeksi slot config
- `index.html:3219–3574` — `generateShowcaseHTML(prof, filteredJobs, snap, snapLinks)` — generator showcase; perlu menerima `slots` sebagai parameter tambahan
- `index.html:2457` — `renderCards()` — canonical predicate "hasProgress": `skills.split(", ").some(s => skillLevel(title, s) >= 1)` — reuse untuk job picker di slot editor
- `index.html:2297` — `getSkillProgress(title, skills)` — dipakai untuk progress bar di sub-skill breakdown panel
- `index.html:2402` — `sprite()` — reuse untuk anchor card dan sub-skill panel di showcase

### Institutional Learnings

- **Dual CSS sync invariant:** setiap CSS rule baru untuk card/panel harus ditulis di dua tempat — main `<style>` block (~line 444) DAN inline `<style>` di dalam `generateShowcaseHTML()` (~line 3288). Ini risiko tertinggi di codebase ini.
- **localStorage one-key-per-concern:** tambah `itjt_slots_v1` sebagai key baru, jangan append ke key yang sudah ada.
- **Modal pattern:** overlay `opacity:0 / pointer-events:none` → `.open` class → `opacity:1 / pointer-events:all`. Semua modal tutup saat klik backdrop (`e.target === e.currentTarget`).
- **`getQuestProgress()` null-guard:** selalu null-check sebelum akses `.done` — fungsi ini return `null` untuk job tanpa quests, bukan `{done:0}`.
- **Export self-contained:** showcase HTML harus bisa dibuka offline — tidak ada CDN link, semua CSS inline, skill levels baked sebagai CSS classes.

---

## Key Technical Decisions

- **`SLOTS_KEY = "itjt_slots_v1"`, format `[{primary, subs:[]}, null, null]`:** Array 3 elemen, `null` = slot kosong. Konsisten dengan konvensi key `itjt_*_v1`. Format array posisi-tetap memudahkan akses slot 1/2/3 tanpa iteration.
- **Slot editor sebagai modal overlay terpisah (z-index 650):** Mengikuti established pattern — tidak menciptakan mekanisme baru. Z-index 650 duduk di antara sync (600) dan export (700).
- **Slot editor diakses dari export modal:** Slot config adalah konfigurasi showcase, bukan app state — natural entry point adalah export flow. Export step 1 bisa menampilkan tombol "Atur Slot" yang membuka slot editor.
- **Panel sub-skill di showcase sebagai overlay modal baru (bukan inline expand):** Sub-skills bisa banyak; inline expand bisa merusak grid layout. Overlay modal dengan scroll konsisten dengan semua panel interaktif yang ada. Pattern yang sama dipakai baik di main app maupun dalam generated showcase HTML.
- **`generateShowcaseHTML()` menerima `slots` sebagai parameter tambahan:** Signature menjadi `generateShowcaseHTML(prof, filteredJobs, snap, snapLinks, slots)`. `buildExportHTML()` bertanggung jawab membaca `loadSlots()` dan mem-pass-nya. Ini membuat `generateShowcaseHTML()` tetap pure (tidak akses storage langsung) — konsisten dengan behavior saat ini.
- **Di showcase, anchor card lebih lebar / beda visual dari standalone card:** Anchor perlu visually distinct. Opsi implementasi: full-width card (1 kolom penuh di grid), atau card dengan border treatment berbeda (warna lebih tebal, badge "anchor"). Pilihan final di implementasi setelah lihat grid behavior.

---

## High-Level Technical Design

> *Ini illustrasi intended approach — directional guidance untuk review, bukan implementation specification.*

```
localStorage
  itjt_slots_v1  →  [ {primary:"Fullstack", subs:["Frontend","Backend"]},
                       {primary:"AI Engineer", subs:["Data Scientist","Data Analyst"]},
                       null ]

Export flow:
  openExport()
    → user klik "Atur Slot" → openSlotEditor()
      → user pilih anchor + subs per slot → saveSlots()
    → user klik "Generate" → buildExportHTML()
        → loadSlots()
        → loadProgress(), loadProfile(), loadLinks()
        → filteredJobs = jobs yang punya progress
        → generateShowcaseHTML(prof, filteredJobs, snap, snapLinks, slots)
            → partisi: anchorJobs (masuk slot) vs standaloneJobs (tidak masuk slot)
            → render anchor cards (prominent/wide)
            → render standalone cards (normal)
            → tiap anchor card punya onclick → openAnchorPanel(slotIdx)
                → panel scroll: anchor skills + setiap sub dengan skills + level

Main app: tidak berubah sama sekali
```

---

## Implementation Units

- U1. **Tambah `SLOTS_KEY` dan storage helpers**

**Goal:** Fondasi storage untuk slot config — key constant, load, save, default value.

**Requirements:** R5

**Dependencies:** None

**Files:**
- Modify: `index.html` (storage constants ~line 2222, load/save helpers ~line 2228)

**Approach:**
- Tambah `const SLOTS_KEY = "itjt_slots_v1"` setelah `AUTO_KEY`
- Tambah `loadSlots()` → parse JSON, default ke `[null, null, null]`
- Tambah `saveSlots(slots)` → `localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))`
- Tambah `let slots = loadSlots()` sebagai in-memory mirror (setelah `let progress = loadProgress()`)

**Patterns to follow:**
- `index.html:2228–2244` — `loadProgress()` / `loadLinks()` pattern (parse + default)

**Test scenarios:**
- Happy path: `loadSlots()` pada localStorage kosong → return `[null, null, null]`
- Happy path: `saveSlots([{primary:"X", subs:[]}, null, null])` → `loadSlots()` return value yang sama
- Edge case: localStorage berisi JSON invalid untuk slots key → `loadSlots()` return `[null, null, null]` (tidak throw)

**Verification:**
- `localStorage.getItem("itjt_slots_v1")` setelah `saveSlots()` berisi JSON yang expected
- `loadSlots()` tanpa data sebelumnya tidak throw error

---

- U2. **Slot editor UI — HTML dan CSS**

**Goal:** Tambah overlay modal slot editor (HTML structure + CSS) mengikuti sync modal pattern. Belum ada event handler — hanya markup dan styling.

**Requirements:** R1, R3, R9

**Dependencies:** U1

**Files:**
- Modify: `index.html` (HTML modal ~line 1590 area, CSS ~line 1100 area)

**Approach:**
- Tambah `<div id="slot-modal-overlay" class="slot-modal-overlay">` setelah export modal HTML
- Inner `.slot-modal` berisi: title "Atur Slot Showcase", subtitle, 3 slot sections
- Tiap slot section: dropdown/select untuk anchor job + list checkbox sub-jobs
- CSS `.slot-modal-overlay` mengikuti `.sync-modal-overlay` pattern, z-index 650, width `min(560px, 100%)`
- Tombol "Simpan" dan close button (`×`)
- Slot section bisa collapsed jika slot masih kosong (anchor belum dipilih)

**Patterns to follow:**
- `index.html:990–1055` — CSS sync modal overlay
- `index.html:1511–1590` — HTML sync modal structure

**Test scenarios:**
- Test expectation: none — unit ini hanya markup dan CSS, tidak ada behavior. Visual verification di browser.

**Verification:**
- Modal HTML ada di DOM; CSS `.slot-modal-overlay` defined dengan z-index 650
- Tidak ada visual regression pada sync modal atau export modal yang ada

---

- U3. **Slot editor logic — open/close, populate, save**

**Goal:** Implementasi `openSlotEditor()`, `closeSlotEditor()`, populate dropdown dari jobs yang punya progress, save on "Simpan".

**Requirements:** R1, R2, R3, R4, R9, R10

**Dependencies:** U1, U2

**Files:**
- Modify: `index.html` (script block ~line 2688 area, setelah sync modal functions)

**Approach:**
- `openSlotEditor()`: add `.open` ke `#slot-modal-overlay`, populate setiap slot section dari `slots` in-memory + jobs yang punya progress
- Jobs yang qualify sebagai anchor atau sub: `jobs.filter(j => j[3].split(", ").some(s => skillLevel(j[1], s) >= 1))` — reuse predicate dari `renderCards()`
- Tiap slot: anchor picker (select element, options = qualified jobs + placeholder "— Tidak dipakai —"), sub picker (checkboxes dari qualified jobs minus anchor yang dipilih di slot ini)
- Sub picker update saat anchor berubah (exclude selected anchor dari sub options, tapi tidak exclude job yang jadi anchor di slot lain)
- Save: kumpul state dari 3 slot sections → `saveSlots(newSlots)` → `slots = newSlots` → `closeSlotEditor()`
- `closeSlotEditor()`: remove `.open`

**Patterns to follow:**
- `index.html:2689–2694` — `openSync()` / `closeSync()` open/close pattern
- `index.html:2284` — `skillLevel()` untuk check progress

**Test scenarios:**
- Happy path: job dengan 1+ skill level > 0 muncul di anchor picker; job tanpa progress tidak muncul (AE4)
- Happy path: IT Novice (T0 / tier 0) muncul di anchor picker jika punya progress (AE5 — tier tidak dibatasi)
- Happy path: pilih anchor di slot 1, lalu cek sub picker slot 2 — anchor slot 1 masih bisa dipilih sebagai sub di slot 2 (R4 — shared sub)
- Happy path: klik Simpan → `loadSlots()` return konfigurasi yang baru disimpan
- Edge case: semua 3 slot dikosongkan (anchor = placeholder) → `saveSlots([null, null, null])`
- Edge case: user pilih anchor tapi tidak pilih sub → slot tersimpan sebagai `{primary:"X", subs:[]}`

**Verification:**
- Buka slot editor → semua job dengan progress tampil di picker; job tanpa progress tidak tampil
- Pilih anchor + subs → klik Simpan → buka slot editor lagi → konfigurasi tetap tersimpan (persisted ke localStorage)

---

- U4. **Integrasi slot editor ke export modal**

**Goal:** Tambah entry point ke slot editor dari export modal (tombol "Atur Slot" di step pertama), dan pastikan `closeSlotEditor()` kembali ke export modal (bukan menutup semuanya).

**Requirements:** R1, R5

**Dependencies:** U2, U3

**Files:**
- Modify: `index.html` (export modal HTML ~line 1592, `openExport()` ~line 3050)

**Approach:**
- Di export modal step 1 (profil), tambah tombol/link "Atur Slot Showcase →" yang memanggil `openSlotEditor()`
- `openSlotEditor()` tidak menutup export modal — overlay slot (z-index 650) tampil di atas export modal (z-index 700)... koreksi: slot editor perlu z-index > export (700), jadi gunakan z-index 750
- `closeSlotEditor()` hanya remove `.open` dari slot overlay — export modal tetap terbuka di belakang
- Preview slot config saat ini di export modal: misal "3 slot dikonfigurasi" atau "Belum ada slot"

**Patterns to follow:**
- `index.html:3050–3064` — `openExport()` / `closeExport()` pattern
- Overlay stacking: quest 500 → sync 600 → export 700 → slot 750

**Test scenarios:**
- Happy path: klik "Atur Slot" di export modal → slot editor terbuka di atas export modal; export modal masih visible di belakang
- Happy path: klik × di slot editor → slot editor tutup, export modal tetap terbuka
- Edge case: buka slot editor dari export modal, simpan, kembali ke export modal → status "N slot dikonfigurasi" terupdate

**Verification:**
- Slot editor tidak menutup export modal saat dibuka atau ditutup
- Z-index stacking benar: slot editor tampil di atas export modal

---

- U5. **Update `generateShowcaseHTML()` — anchor card vs standalone card**

**Goal:** Showcase HTML yang di-generate membaca slot config dan menampilkan anchor card (prominent) + standalone card (normal), serta panel sub-skill saat anchor card diklik.

**Requirements:** R6, R7, R8

**Dependencies:** U1, U3, U4

**Files:**
- Modify: `index.html` (fungsi `buildExportHTML()` ~line 3085, `generateShowcaseHTML()` ~line 3219)

**Approach:**
- `buildExportHTML()`: tambah `const slotsSnap = loadSlots()` dan pass ke `generateShowcaseHTML()` sebagai parameter kelima
- `generateShowcaseHTML(prof, filteredJobs, snap, snapLinks, slots)`: partisi jobs:
  - `anchorJobs`: array 3 elemen (mirror `slots`), setiap elemen adalah tuple job dari `filteredJobs` yang match `slot.primary`, atau `null` jika slot kosong / job tidak punya progress
  - `standaloneJobs`: `filteredJobs` yang tidak menjadi primary di manapun di `slots`
- Render section "Identitas Utama" berisi anchor cards (lebih wide, border lebih tebal, badge "▲ Anchor")
- Render section "Skill Lainnya" berisi standalone cards (tampilan normal seperti sekarang)
- Jika tidak ada slot yang dikonfigurasi (`slots === [null,null,null]`): tampilkan semua job sebagai standalone (backward compatible)
- Tiap anchor card punya `onclick` yang membuka panel overlay inline di dalam generated HTML (pure JS, no framework)
- Panel berisi: sprite anchor job + semua skill anchor + divider + tiap sub-job dengan nama, sprite, dan skills + levelnya
- Panel overlay di generated HTML: `position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100` dengan inner scroll box
- **Dual CSS sync:** semua CSS baru untuk anchor card, standalone badge, panel overlay harus ditulis di BOTH main `<style>` (jika relevan untuk main app) dan inline `<style>` di dalam `generateShowcaseHTML()`

**Patterns to follow:**
- `index.html:3219–3574` — existing `generateShowcaseHTML()` card rendering loop
- `index.html:3085–3097` — `buildExportHTML()` untuk penambahan parameter
- `index.html:2402` — `sprite()` untuk anchor card sprite rendering
- `index.html:2297` — `getSkillProgress()` untuk progress bar sub-skill

**Test scenarios:**
- Happy path: 2 anchor slot dikonfigurasi, 3 job standalone → showcase menampilkan 2 anchor card + 3 standalone card (Covers AE2)
- Happy path: klik anchor card → panel terbuka, scroll ke bawah → semua sub-skill visible tanpa tab (Covers AE2, F2)
- Happy path: Data Analyst di-share sebagai sub di anchor "Data Engineer" dan anchor "AI Engineer" → Data Analyst muncul di kedua panel (Covers AE1, R8)
- Happy path: slot config `[null,null,null]` (tidak ada konfigurasi) → semua jobs tampil sebagai standalone, tidak ada error (backward compat)
- Happy path: showcase dibuka offline (no network) → semua card, anchor panel, dan sub-skill tampil dengan benar
- Edge case: anchor job yang dikonfigurasi ternyata tidak punya progress di snapshot saat export (user hapus progress setelah konfigurasi slot) → slot tersebut di-skip, tidak error
- Edge case: semua 3 slot terisi tapi 0 standalone jobs → section "Skill Lainnya" tidak ditampilkan
- Integration: generated HTML dibuka di browser → klik anchor card → panel overlay muncul → klik backdrop → panel tutup (self-contained JS dalam generated HTML)

**Verification:**
- Export dengan slot config → buka generated HTML → anchor cards tampil beda dari standalone cards
- Panel sub-skill scroll tanpa tab switching
- Shared sub muncul di kedua panel anchor yang relevan
- Generated HTML bisa dibuka offline

---

## System-Wide Impact

- **Interaction graph:** `buildExportHTML()` → `loadSlots()` (baru) → `generateShowcaseHTML()` (extended). Slot editor modal: `openSlotEditor()` → read `jobs` + call `skillLevel()` untuk qualify jobs. Tidak ada callback atau observer baru.
- **Error propagation:** `loadSlots()` dengan invalid JSON → silent default ke `[null,null,null]`, tidak throw. Anchor job yang tidak ada di progress → di-skip saat generate, tidak error.
- **State lifecycle risks:** Slot config bisa stale jika user hapus progress suatu job setelah mengkonfigurasinya sebagai anchor — mitigasi: saat generate, re-validate setiap anchor terhadap snapshot progress saat itu.
- **API surface parity:** `generateShowcaseHTML()` signature berubah (tambah parameter `slots`). Satu-satunya caller adalah `buildExportHTML()` — tidak ada caller lain. Aman.
- **Dual CSS sync:** CSS baru untuk anchor card treatment di showcase HARUS ditulis di inline `<style>` di dalam `generateShowcaseHTML()`. Karena anchor card hanya muncul di showcase (bukan main app), tidak ada kebutuhan duplicate di main `<style>` — kecuali styling yang juga dipakai di slot editor modal.
- **Unchanged invariants:** progress storage (`itjt_progress_v1`), skill toggle behavior, quest system, main app card rendering, Google Drive sync — tidak ada yang berubah. `generateShowcaseHTML()` tetap backward compatible (slot `null` → tampilkan semua sebagai standalone).

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Dual CSS drift — CSS anchor card di showcase tidak match dengan preview di app | Unit U5 wajib update inline CSS di `generateShowcaseHTML()`. Verify dengan open generated HTML setelah implementasi |
| Stale slot config — anchor job di-config tapi progress dihapus sebelum export | U5 re-validate anchor terhadap progress snapshot saat `buildExportHTML()` dipanggil — skip slot yang invalid |
| Panel sub-skill di generated HTML tidak self-contained (depend on app JS) | Panel JS harus ditulis sebagai inline `<script>` dalam generated HTML, tidak ada reference ke fungsi app |
| Z-index stacking conflict — slot modal di atas export modal | U4 menggunakan z-index 750 untuk slot modal (di atas export 700). Verifikasi saat integrasi |
| Sub-job picker di slot editor membingungkan jika 37 job semua punya progress | Pertimbangkan grouping by `group` field di dropdown — bisa diimplementasi di U3 jika terasa perlu |

---

## Sources & References

- **Origin document:** [docs/brainstorms/job-slot-showcase-requirements.md](docs/brainstorms/job-slot-showcase-requirements.md)
- Related code: `index.html` — `buildExportHTML()` (~line 3085), `generateShowcaseHTML()` (~line 3219), storage constants (~line 2222), sync modal pattern (~line 2689)
- Related plans: `docs/plans/2026-05-10-001-feat-ulong-export-showcase-plan.md` (export flow reference)
