---
title: "feat: AUTO — AI Quest Guide Popover"
type: feat
status: completed
date: 2026-05-10
origin: docs/brainstorms/auto-ai-guide-requirements.md
---

# feat: AUTO — AI Quest Guide Popover

## Summary

Menambahkan tombol "AUTO" di `header-actions` yang membuka popover kecil berisi pilihan AI CLI (Claude, Codex, Gemini, Copilot, Other) dan tombol copy. Saat diklik, prompt fully-formed di-copy ke clipboard — berisi progress player dalam format JSON compact + instruksi Inggris untuk AI agar membuka ulong RPG dan menjadi quest guide. Pilihan CLI disimpan di localStorage. Dua implementation units: popover UI + localStorage, dan prompt generator.

---

## Problem Frame

Player tahu skill apa yang harus di-level-up, tapi butuh guidance konkret tentang *bagaimana* menyelesaikan quest (project, dokumentasi, lamaran kerja). AI CLI lokal sudah capable tapi tidak tahu konteks progress player — sehingga player harus menjelaskan ulang setiap sesi. AUTO menjembatani keduanya dengan satu tombol copy.

---

## Requirements

- R1. Ada tombol AUTO di kanan atas halaman, konsisten dengan estetika ulong RPG
- R2. Panel AUTO menampilkan pilihan AI CLI: Claude, Codex, Gemini, Copilot, Other
- R3. Ada tombol copy yang men-copy prompt ke clipboard
- R4. Setelah copy, tombol menampilkan "Copied!" selama ~2 detik lalu kembali ke semula
- R5. Pilihan CLI tersimpan di localStorage dan dipertahankan antar sesi
- R6. Prompt fully-formed: berisi progress (skill levels + quest completion) dan instruksi AI membuka `https://secreal.github.io/ulong-rpg/`
- R7. Prompt ditulis dalam bahasa Inggris
- R8. Konten prompt identik antar semua pilihan CLI

**Origin actors:** A1 (Player), A2 (AI CLI)
**Origin flows:** F1 (Setup dan Copy Prompt), F2 (AI Guide Sesi)
**Origin acceptance examples:** AE1 (covers R6), AE2 (covers R4), AE3 (covers R5)

---

## Scope Boundaries

- Tidak ada API integration ke AI CLI manapun — murni clipboard copy
- Pilihan "Other" tidak meminta user mengetik nama AI — generic fallback
- Konten prompt tidak disesuaikan per CLI (format khusus per CLI tidak termasuk)
- Tidak ada feedback loop dari AI kembali ke ulong RPG
- Tidak ada auto-update progress dari hasil sesi AI

---

## Context & Research

### Relevant Code and Patterns

- `header-actions` HTML (baris ~964): flex row berisi `btn-export-showcase-header` dan `btn-sync`. Tombol AUTO ditambahkan di sini sebagai sibling ketiga, `position: relative` wrapper.
- `.btn-sync` CSS (baris 111–127) — style referensi untuk tombol di header-actions; tombol AUTO mengikuti style ini.
- `.btn-export-showcase-header` CSS (baris 885–894) — button gold-accent di header; AUTO gunakan variant berbeda (teal/purple untuk membedakan)
- `STORAGE_KEY = "itjt_progress_v1"` (baris 1440), `LINKS_KEY`, `PROFILE_KEY` — pola key terpisah per concern; AUTO menggunakan `AUTO_KEY = "itjt_auto_v1"`
- `loadProgress()` / `saveProgress()` (baris 1444–1451) — pola load/save JSON; AUTO mengikuti pola yang sama
- `skillKey(title, skill)` → `"JobTitle::SkillName"` (baris 1474) — format key di progress object; prompt generator membaca object ini
- `questKey(itemId)` → `"quest::id"` (baris 1477) — format key quest di progress object; prompt generator memfilter prefix `"quest::"`
- `jobs` array (baris 1179) — digunakan untuk mengetahui skills per job title saat membangun snapshot progress
- Sync modal (baris ~1613+) — contoh overlay + `.open` class; popover AUTO lebih ringan (tidak perlu overlay backdrop)
- `export-modal` pattern (z-index 700) — popover AUTO perlu z-index lebih rendah dari modal tapi di atas konten (z-index: 200 cukup)

### Institutional Learnings

- Tidak ada `docs/solutions/` — proyek baru.

### External References

- `navigator.clipboard.writeText()` — Clipboard API modern, semua browser support. Harus dipanggil dalam event handler click (user gesture) agar tidak diblokir. Pattern yang sama cocok untuk "Copied!" feedback via `setTimeout`.

---

## Key Technical Decisions

- **Popover bukan modal**: Popover lebih ringan dari modal — tidak perlu overlay backdrop, tidak menghalangi halaman. Implementasi: wrapper `position: relative`, popover `position: absolute; top: 100%` di bawah tombol. Tutup dengan click-outside listener (`document.addEventListener("click", ...)` dengan check `!wrapper.contains(event.target)`). (see origin: docs/brainstorms/auto-ai-guide-requirements.md)
- **Prompt format JSON + instruksi**: Progress di-serialize sebagai JSON compact (bukan natural language) agar akurat dan tidak ada risiko salah baca. Instruksi dalam bahasa Inggris mengikuti keputusan di origin. Format: header instruksi → JSON progress snapshot → instruksi AI. (see origin: docs/brainstorms/auto-ai-guide-requirements.md)
- **Snapshot progress saat copy diklik**: Prompt dibuild on-demand saat tombol copy ditekan — bukan pre-built saat popover dibuka. Ini menjamin akurasi: prompt selalu mencerminkan state terkini localStorage saat itu. (see origin: docs/brainstorms/auto-ai-guide-requirements.md)
- **AUTO_KEY terpisah**: `"itjt_auto_v1"` → `{ cli: "Claude" }` — satu key, satu concern. Tidak mixed dengan progress atau profile. Pola mengikuti `LINKS_KEY` dan `PROFILE_KEY`.
- **Tombol AUTO styling**: Menggunakan warna teal/cyan (`color: #5dc9c9`) agar distinct dari tombol Export (gold) dan Sync (muted). Konsisten dengan `--role` color yang sudah ada di beberapa elemen.

---

## Open Questions

### Resolved During Planning

- **Format prompt**: JSON compact untuk progress data + instruksi natural language Inggris. Dipilih user.
- **Panel shape**: Popover/dropdown di bawah tombol AUTO. Tidak butuh modal overlay. Dipilih user.
- **Kapan prompt dibangun**: On-demand saat copy diklik — bukan saat popover dibuka.

### Deferred to Implementation

- **Exact posisi popover saat overflow kanan**: Jika tombol AUTO berada di ujung kanan header dan popover overflow keluar viewport, implementer bisa tambahkan `right: 0` pada popover agar align ke kanan.
- **Format JSON progress**: Seberapa verbose — apakah grouping per job title atau flat object. Keputusan implementer: pilih yang paling readable untuk AI. Rekomendasi: group per job title `{"Frontend Developer": {"HTML": 2, "CSS": 1}, "quests": {"fe-1": true}}`.

---

## High-Level Technical Design

> *Ini adalah gambaran pendekatan yang dimaksud — directional guidance untuk review, bukan implementation specification.*

```
HTML structure (di dalam header-actions):
  <div class="auto-wrapper">          ← position: relative
    <button class="btn-auto">AUTO</button>
    <div class="auto-popover">        ← position: absolute, top: 100%
      <div class="auto-cli-options">  ← 5 CLI buttons
        [Claude] [Codex] [Gemini] [Copilot] [Other]
      </div>
      <button class="auto-copy-btn">Copy to Claude</button>
    </div>
  </div>

Click outside close:
  document.addEventListener("click", e => {
    if (!wrapper.contains(e.target)) closePopover()
  })

Prompt build (on copy click):
  1. Baca progress dari localStorage
  2. Group skill entries per job title: {"JobTitle::Skill": N} → {"JobTitle": {"Skill": N}}
  3. Pisahkan quest entries: {"quest::id": true} → {"fe-1": true, ...}
  4. Build prompt string:
     - Header: "You are my quest guide for ulong RPG..."
     - JSON block: progress + quests
     - Instructions: "Open https://secreal.github.io/ulong-rpg/ ..."
  5. navigator.clipboard.writeText(prompt)
  6. Tombol: "Copied!" → setTimeout 2000 → kembali normal

localStorage:
  AUTO_KEY = "itjt_auto_v1" → { cli: "Claude" }
  Load saat init → pre-select CLI yang tersimpan
  Save saat user pilih CLI baru
```

---

## Implementation Units

- U1. **AUTO Popover UI + localStorage**

**Goal:** Menambahkan tombol AUTO di header dan popover berisi 5 CLI selector buttons, dengan state pilihan CLI tersimpan di localStorage.

**Requirements:** R1, R2, R5

**Dependencies:** None

**Files:**
- Modify: `index.html`
  - CSS: `.auto-wrapper`, `.btn-auto`, `.auto-popover`, `.auto-cli-option` (sekitar blok CSS header, setelah `.btn-export-showcase-header`)
  - HTML: wrapper + button + popover markup di dalam `div.header-actions` (baris ~964–978)
  - JS: `AUTO_KEY` const, `loadAuto`/`saveAuto` fungsi, init select state, click-outside handler

**Approach:**
- Wrapper `<div class="auto-wrapper">` di dalam `header-actions`, sebelum `btn-export-showcase-header`
- Tombol AUTO style: mirip `.btn-sync` tapi dengan accent teal — border teal, warna teal, background subtle
- Popover `position: absolute; top: calc(100% + 6px); right: 0` — muncul di bawah tombol, align kanan agar tidak overflow
- 5 CLI buttons dalam row: Claude, Codex, Gemini, Copilot, Other — style pill button, active state lebih terang
- Popover toggle via JS class `.open` (bukan CSS-only agar bisa close on outside click)
- Click outside: `document.addEventListener("click")` dengan `contains()` check

**Patterns to follow:**
- `.btn-sync` (baris 111–127) — button style reference
- `.btn-export-showcase-header` (baris 885–894) — header button pattern
- `loadProfile`/`saveProfile` (baris 1462–1468) — pola load/save localStorage per concern

**Test scenarios:**
- Happy path: Klik tombol AUTO → popover muncul dengan 5 opsi CLI
- Happy path — Covers AE3: Pilih "Claude" → reload halaman → popover dibuka lagi → "Claude" masih terpilih (active state)
- Happy path: Klik di luar popover → popover tutup
- Happy path: Klik AUTO lagi saat popover sudah terbuka → popover tutup (toggle)
- Edge case: Klik di dalam popover (bukan tombol close) → popover tidak tutup
- Edge case: Pilih CLI beda berkali-kali → hanya yang terakhir tersimpan di localStorage

**Verification:**
- `localStorage.getItem("itjt_auto_v1")` berisi `{"cli":"Claude"}` (atau CLI yang dipilih) setelah interaksi
- Popover tampil di bawah tombol, tidak overflow header area, tidak menutupi konten di bawahnya

---

- U2. **Prompt Generator + Copy + Feedback**

**Goal:** Menambahkan fungsi yang membangun prompt fully-formed dari progress localStorage dan meng-copy-nya ke clipboard, dengan feedback "Copied!" pada tombol.

**Requirements:** R3, R4, R6, R7, R8

**Dependencies:** U1 (tombol copy ada di dalam popover U1)

**Files:**
- Modify: `index.html`
  - HTML: tambah tombol copy di dalam popover (sudah ada placeholder dari U1)
  - JS: fungsi `buildAutoPrompt()`, copy handler, "Copied!" feedback logic

**Approach:**
- `buildAutoPrompt()`:
  1. Baca `progress` object (sudah loaded di memory, bisa langsung akses)
  2. Group: iterasi entries progress — jika key format `"JobTitle::Skill"`, masukkan ke `snapshot[jobTitle][skill] = level`; jika prefix `"quest::"`, masukkan ke `quests[id] = true`
  3. Filter: hanya masukkan job yang punya minimal satu skill > 0
  4. Build string:
     ```
     You are my quest guide for ulong RPG (https://secreal.github.io/ulong-rpg/).
     
     My current progress:
     {JSON.stringify({...snapshot, quests}, null, 2)}
     
     Please open the ulong RPG website, check the available quests for my jobs,
     find quests I haven't completed yet, and guide me step by step through
     the next relevant quest. Focus on practical, actionable steps.
     ```
- Copy handler: `navigator.clipboard.writeText(prompt).then(() => showCopied())`
- `showCopied()`: ubah teks tombol ke "Copied! ✓", set timeout 2000ms, kembalikan ke "Copy to [CLI]"
- Label tombol copy mengikuti CLI yang sedang aktif: "Copy to Claude", "Copy to Codex", dll

**Patterns to follow:**
- `skillLevel()` (baris 1490–1495) — cara baca skill level dari progress
- `questKey()` / `skillKey()` (baris 1474–1477) — format key di progress object; parsing balik dari key ke job title + skill name
- Export button click handler (di event listener yang sudah ada) — pola `navigator.clipboard` atau download blob

**Test scenarios:**
- Happy path — Covers AE1: Player punya Frontend Developer HTML=2, quest fe-1=true → prompt JSON block berisi `{"Frontend Developer":{"HTML":2},"quests":{"fe-1":true}}` — akurat
- Happy path — Covers AE2: Klik copy → teks tombol berubah "Copied!" → setelah 2 detik kembali ke "Copy to Claude"
- Happy path — Covers AE2: Klik copy berkali-kali cepat → setiap klik mereset timer, tombol selalu kembali ke normal ~2 detik setelah klik terakhir
- Happy path: Pilih "Codex" → klik copy → label tombol copy berubah ke "Copy to Codex"
- Happy path: Prompt berisi URL `https://secreal.github.io/ulong-rpg/` (R6)
- Happy path: Prompt ditulis dalam bahasa Inggris (R7)
- Edge case: Player belum punya progress sama sekali → prompt tetap terbuild, JSON block menampilkan `{}` atau pesan "No progress yet" — tidak error
- Edge case: Progress ada tapi semua skill level 0 → job tidak muncul di snapshot (hanya job dengan minimal 1 skill > 0 yang masuk)
- Edge case: `navigator.clipboard` tidak tersedia (HTTP tanpa HTTPS, browser lama) → tidak crash; bisa fallback ke `prompt()` dialog atau silent fail dengan user-friendly message

**Verification:**
- Prompt yang di-copy akurat mencerminkan state progress localStorage saat tombol ditekan
- Tombol kembali ke label normal setelah 2 detik
- Tidak ada JS error di console saat copy ditekan

---

## System-Wide Impact

- **Interaction graph:** Tidak ada callback atau observer yang terpengaruh. Tombol AUTO adalah additive — tidak memodifikasi event listeners yang sudah ada.
- **State lifecycle risks:** Tidak ada. Prompt dibangun dari snapshot read-only localStorage pada saat copy diklik — tidak ada write ke progress atau state lain.
- **API surface parity:** Tidak ada. Fitur ini sepenuhnya additive.
- **Unchanged invariants:** Semua fitur yang sudah ada (skill level system, quest modal, sync modal, export modal, achievement links, visual theme) tidak tersentuh.
- **Integration coverage:** `navigator.clipboard.writeText()` harus dipanggil di dalam user gesture handler (click) — bukan di async callback yang terpisah jauh dari gesture. Test ini tidak bisa dipastikan dengan unit test saja; perlu manual test di browser.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `navigator.clipboard` diblokir di HTTP (non-HTTPS) | Panggil hanya dalam event handler click (user gesture) — browser modern mengizinkan dari user gesture. Untuk fallback: silent fail atau `document.execCommand("copy")` legacy fallback |
| Popover overflow kanan viewport pada layar kecil | `right: 0` pada popover agar align kanan; tambah `max-width: min(320px, 90vw)` |
| Prompt terlalu panjang untuk AI CLI tertentu | Progress yang dimasukkan adalah snapshot terkini — untuk user dengan banyak job, JSON bisa panjang. Tidak ada truncation; dokumentasikan sebagai known characteristic |
| Click-outside handler memblokir event lain | Gunakan `e.stopPropagation()` dengan hati-hati; lebih baik cukup check `!wrapper.contains(e.target)` tanpa stop propagation |

---

## Sources & References

- **Origin document:** [docs/brainstorms/auto-ai-guide-requirements.md](docs/brainstorms/auto-ai-guide-requirements.md)
- `header-actions` HTML: `index.html` baris ~964–978
- `.btn-sync` CSS: `index.html` baris 111–127
- `STORAGE_KEY`, `loadProgress`, `saveProgress`: `index.html` baris 1438–1451
- `skillKey`, `questKey`: `index.html` baris 1474–1477
- `skillLevel()`: `index.html` baris 1490–1495
