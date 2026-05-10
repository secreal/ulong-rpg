---
title: "feat: ulong Export — Personal GitHub Showcase"
type: feat
status: completed
date: 2026-05-10
origin: docs/brainstorms/ulong-export-requirements.md
---

# feat: ulong Export — Personal GitHub Showcase

## Summary

Implementasi dilakukan seluruhnya di `index.html` dalam tiga unit berurutan: achievement links (prerequisite), profile form, dan export modal + HTML generator. Unit-unit ini extend pola localStorage, modal, dan blob download yang sudah ada — tidak ada abstraksi baru.

---

## Problem Frame

Progress ulong RPG terkunci di localStorage masing-masing browser — tidak ada cara untuk menunjukkannya ke recruiter atau komunitas. Fitur ini menjembatani progress lokal ke halaman showcase publik di repo GitHub player masing-masing.

Lihat motivasi lengkap di origin: `docs/brainstorms/ulong-export-requirements.md`.

---

## Requirements

- R1. User dapat mengisi dan menyimpan profil: nama lengkap, nick, GitHub username
- R2. Profil disimpan di localStorage (key terpisah dari progress) dan dipertahankan antar sesi
- R3. Ada tombol export yang jelas di ulong RPG
- R4. Export menghasilkan file HTML self-contained — tidak butuh asset eksternal, dapat dibuka offline
- R5. HTML yang di-generate hanya menampilkan job yang punya minimal 1 skill level > 0
- R6. HTML menyertakan nama dan nick dari profil user sebagai identitas showcase
- R7. Setelah export, guide singkat ditampilkan dan `github.com/<username>/ulong` dibuka di tab baru
- R8. HTML mencerminkan skill level (Lv 1/2/3) tiap skill yang sudah dinaikkan
- R9. Link portofolio per job (dari fitur achievement-links) ikut ter-export jika ada

**Origin actors:** A1 (Player/user ulong RPG), A2 (Recruiter/viewer)
**Origin flows:** F1 (Setup Profil), F2 (Export Progress ke GitHub), F3 (Viewer Melihat Showcase)
**Origin acceptance examples:** AE1 (covers R5), AE2 (covers R7), AE3 (covers R4)

---

## Scope Boundaries

- Tidak ada GitHub OAuth atau API integration
- Tidak ada auto-push ke GitHub dari ulong RPG
- Tidak ada sinkronisasi dua arah (import dari repo `/ulong` kembali ke ulong RPG)
- Setup GitHub Pages bukan tanggung jawab ulong RPG — hanya di-guide
- Clipboard API copy tidak diimplementasikan — download saja
- Fitur social (lihat progress orang lain dari dalam ulong RPG) di luar scope

### Deferred to Follow-Up Work

- R9 portfolio links dalam export bergantung pada U1 (achievement-links) selesai terlebih dahulu — jika U1 ditunda, R9 dikosongkan dari generated HTML tanpa memblokir U2/U3

---

## Context & Research

### Relevant Code and Patterns

- `STORAGE_KEY = "itjt_progress_v1"` (baris 1286) — pola localStorage yang diikuti; profile menggunakan key terpisah `itjt_profile_v1`
- `loadProgress()` / `saveProgress()` (baris 1288–1295) — pola simpan/load JSON; profile mengikuti pola yang sama
- `skillKey(title, skill)` → `"JobTitle::SkillName"` (baris 1298) — format key skill level
- `skillLevel(title, skill)` (baris 1314) — fungsi baca level dengan backward compat `true → 1`
- `jobs` array (baris 1025) — tuple `[group, title, desc, skills, salary, role, hair, tool, tier]`; skills adalah string comma-separated, split pada `", "`
- Blob download pattern (baris 1622–1629) — `new Blob([content], {type})` → `URL.createObjectURL` → `<a download>` → click → revoke; U3 mengikuti persis pola ini dengan type `"text/html"` dan filename `"index.html"`
- Sync modal pattern (baris 1613–1620, HTML baris 931–1016) — overlay + `.open` class toggle; export modal mengikuti pola ini
- `.sync-btn` component (baris 750–758) — icon + dua baris label; digunakan ulang untuk tombol-tombol di export modal
- Sprite CSS (baris 352–376) — pure CSS, harus di-inline ke generated HTML untuk preserve tampilan card

### Institutional Learnings

- Tidak ada `docs/solutions/` — proyek baru, belum ada learnings yang terdokumentasi

### External References

- Tidak diperlukan — semua pola sudah ada di codebase

---

## Key Technical Decisions

- **Profile key terpisah (`itjt_profile_v1`):** Memisahkan concern profil dari progress — konsisten dengan pola satu key per concern yang sudah ada; memudahkan reset progress tanpa kehilangan profil
- **HTML generated adalah read-only static:** Skill levels di-bake sebagai CSS classes langsung di markup, tidak ada JS click handler — memenuhi R4 (self-contained) dan lebih sederhana dari approach yang meng-copy seluruh `index.html`
- **Google Fonts `@import` di-drop dari generated HTML:** Diganti `system-ui, sans-serif` fallback (sudah ada di font stack) — satu-satunya external dependency yang ada, harus dihilangkan untuk R4
- **Sprite CSS di-inline penuh:** Pure CSS, tidak ada gambar — aman di-inline tanpa ukuran besar; wajib untuk visual card yang benar di generated HTML
- **Achievement links sebagai U1 (prerequisite):** R9 bergantung pada data yang belum ada di localStorage; harus diimplementasikan dulu sebelum export bisa menyertakannya. Jika di-skip, R9 cukup dikosongkan

---

## Open Questions

### Resolved During Planning

- **R9 portfolio links:** Semula defer di brainstorm, sekarang aktif — prerequisite fitur achievement-links (U1) diimplementasikan dalam plan yang sama, berurutan sebelum export
- **Mekanisme download:** `<a download>` (pola yang sudah ada) — tidak perlu clipboard API
- **Form profil:** Ada di dalam export modal (inline form), bukan modal terpisah — satu entry point untuk semua yang berkaitan dengan export

### Deferred to Implementation

- **Format exact achievement link key di localStorage:** Gunakan `"links::JobTitle"` → array JSON `[{url, label}]` sebagai default wajar, tapi implementer bebas adjust berdasarkan apa yang paling clean setelah melihat kode
- **Panjang exact prompt HTML generator:** Seberapa banyak CSS yang di-strip vs di-include penuh — keputusan saat implementasi setelah melihat ukuran output

---

## High-Level Technical Design

> *Ini adalah gambaran pendekatan yang dimaksud — directional guidance untuk review, bukan implementation specification.*

```
localStorage
  itjt_progress_v1  →  { "JobTitle::Skill": 1|2|3, "quest::id": true }
  itjt_profile_v1   →  { name, nick, github }        [BARU - U2]
  itjt_links_v1     →  { "JobTitle": [{url, label}] } [BARU - U1]

Flow export (U3):
  1. Baca profile + progress + links dari localStorage
  2. Filter jobs → hanya yang ada skillLevel > 0
  3. Generate HTML string:
     - <style> inline (stripped, ganti @import dengan system font)
     - Sprite CSS inline
     - Header dengan nama/nick dari profile
     - Cards hanya untuk filtered jobs, skill level di-bake sebagai .lv1/.lv2/.lv3 class
     - Portfolio links sebagai daftar di bawah tiap card
     - © secreal 2026 di footer
  4. Blob download → "index.html"
  5. Buka github.com/<username>/ulong di tab baru
  6. Tampilkan guide steps
```

---

## Implementation Units

- U1. **Achievement Links — Add/Delete Portfolio Links per Job**

**Goal:** Menambahkan kemampuan player untuk menyimpan link portofolio di section Achievement tiap job card, tersimpan di localStorage

**Requirements:** R9 (prerequisite), lihat juga `docs/brainstorms/achievement-links-requirements.md`

**Dependencies:** None

**Files:**
- Modify: `index.html` (CSS untuk link input area, HTML template achievement section, JS add/delete/save links)

**Approach:**
- Storage key: `itjt_links_v1` → object keyed by job title, value array of `{url, label}`
- Di section Achievement tiap card: tampilkan link yang sudah tersimpan + input field untuk tambah link baru
- Add: validasi minimal (harus http/https), simpan ke localStorage, render ulang list
- Delete: hapus entry dari array, simpan, render ulang
- Ikuti pola `saveProgress`/`loadProgress` untuk storage; ikuti pola render card untuk DOM update

**Patterns to follow:**
- `saveProgress` / `loadProgress` pattern (baris 1288–1295) untuk `saveLinks` / `loadLinks`
- Card rendering di `renderCards()` (baris 1462) untuk placement di dalam card
- CSS achievement section yang sudah ada untuk visual context

**Test scenarios:**
- Happy path: user menambah URL valid → muncul di daftar link job tersebut → refresh halaman → masih ada
- Happy path: user menghapus link → hilang dari daftar → refresh → tetap hilang
- Edge case: input kosong → tombol add tidak melakukan apa-apa (tidak error, tidak simpan)
- Edge case: URL tanpa `http://` atau `https://` → ditolak, tidak disimpan
- Edge case: menambah 5+ link di satu job → semua tersimpan dan tampil
- Edge case: job berbeda → link mereka independen, tidak saling menimpa

**Verification:**
- Link yang ditambah tersimpan di `localStorage.getItem("itjt_links_v1")` dan muncul setelah reload
- Menghapus link menghilangkannya dari localStorage dan dari tampilan

---

- U2. **Profile Form — Nama, Nick, GitHub Username**

**Goal:** Menambahkan form profil sederhana yang tersimpan di localStorage, sebagai identitas showcase saat export

**Requirements:** R1, R2

**Dependencies:** None (dapat dikerjakan paralel dengan U1, tapi keduanya harus selesai sebelum U3)

**Files:**
- Modify: `index.html` (CSS form profil, HTML di dalam export modal, JS save/load profil)

**Approach:**
- Storage key: `itjt_profile_v1` → `{ name, nick, github }`
- Form ditaruh di bagian atas export modal (bukan modal terpisah)
- Auto-save ke localStorage saat field berubah (onInput) — tidak perlu tombol "Save" terpisah
- Saat export modal dibuka, form di-populate dari localStorage jika ada

**Patterns to follow:**
- `loadProgress` / `saveProgress` (baris 1288–1295) untuk load/save profil
- Sync modal form style untuk visual consistency

**Test scenarios:**
- Happy path: user mengisi nama + nick + github → reload → nilai masih ada di form
- Happy path: export modal dibuka pertama kali tanpa data → form kosong, placeholder visible
- Edge case: user mengosongkan field yang sudah diisi → nilai kosong tersimpan (bukan null/undefined)
- Edge case: github username dengan karakter valid (@, dash, angka) → tersimpan benar

**Verification:**
- `localStorage.getItem("itjt_profile_v1")` berisi JSON dengan field name/nick/github setelah diisi
- Form ter-populate dengan benar saat modal dibuka ulang

---

- U3. **Export Modal + HTML Generator**

**Goal:** Modal export dengan tombol download yang men-generate file HTML self-contained, lengkap dengan guide dan redirect ke GitHub

**Requirements:** R3, R4, R5, R6, R7, R8, R9

**Dependencies:** U1, U2

**Files:**
- Modify: `index.html` (CSS export modal, HTML modal markup, JS generator + modal open/close + guide)

**Approach:**
- Export modal: ikuti pola sync modal (overlay + `.open` class, z-index di atas sync modal)
- Tombol export di header area (dekat tombol sync yang sudah ada)
- Generator steps:
  1. Baca `itjt_profile_v1`, `itjt_progress_v1`, `itjt_links_v1` dari localStorage
  2. Filter `jobs` array: hanya job yang punya minimal 1 skill dengan level > 0
  3. Build HTML string: style inline (ganti `@import` fonts dengan system font), sprite CSS inline, header dengan nama/nick, cards dengan `.lv1`/`.lv2`/`.lv3` classes baked in, portfolio links per job, footer `© secreal 2026`
  4. Blob download: ikuti pattern baris 1622–1629, filename `"index.html"`, type `"text/html"`
  5. Buka `github.com/<username>/ulong` di tab baru (`window.open`)
  6. Tampilkan guide steps di dalam modal: buat repo `ulong`, upload `index.html`, aktifkan GitHub Pages

**Patterns to follow:**
- Sync modal open/close (baris 1613–1620)
- Blob download (baris 1622–1629)
- `.sync-btn` component untuk tombol-tombol di modal
- Card CSS classes (`.lv1`, `.lv2`, `.lv3`, `.skill`, `.card`) untuk generated HTML

**Test scenarios:**
- Happy path — Covers AE1: job dengan progress muncul, job tanpa progress tidak muncul di generated HTML
- Happy path — Covers AE3: generated HTML dapat dibuka offline di browser tanpa error (tidak ada request ke CDN/server)
- Happy path — Covers AE2: setelah download, tab baru terbuka ke `github.com/<username>/ulong`
- Happy path: skill level Lv 2 di ulong RPG → elemen skill di generated HTML memiliki class `.lv2`
- Happy path: portfolio links tersimpan → muncul di generated HTML di bawah job yang sesuai
- Edge case: profil kosong (belum diisi) → export tetap berjalan, header menampilkan placeholder atau kosong
- Edge case: tidak ada job yang punya progress → generated HTML kosong / menampilkan pesan "no progress yet"
- Edge case: github username kosong → `window.open` tidak dipanggil dengan URL yang malformed
- Edge case: job punya skills tapi semua level 0 → job tidak muncul di generated HTML

**Verification:**
- Generated `index.html` dapat dibuka di browser tanpa internet dan menampilkan card job dengan benar
- Hanya job dengan progress yang muncul
- Skill level visual (warna/badge) sesuai dengan level yang tersimpan di localStorage

---

## System-Wide Impact

- **Interaction graph:** Tidak ada callback atau observer yang terpengaruh — fitur ini sepenuhnya additive. Tombol export baru di header tidak mengganggu tombol sync yang sudah ada.
- **State lifecycle risks:** Generated HTML adalah snapshot satu waktu — tidak ada state yang bisa jadi stale. localStorage `itjt_links_v1` dan `itjt_profile_v1` adalah keys baru, tidak ada risiko collision dengan `itjt_progress_v1`.
- **Unchanged invariants:** Skill level system, quest modal, sync modal, sidebar filter, dan semua fitur yang sudah ada tidak disentuh oleh plan ini.
- **API surface parity:** Tidak ada API surface — single-file app.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Generated HTML terlalu besar karena CSS di-inline penuh | Strip CSS yang tidak relevan untuk read-only view (hover states, animation JS-triggered, dll) saat implementasi |
| `window.open` diblokir popup blocker | Panggil `window.open` hanya dalam event handler click (bukan async) — browser mengizinkan ini |
| U1 memakan waktu lebih lama dari ekspektasi | U2 dapat dikerjakan paralel dengan U1; U3 tetap depend keduanya selesai |

---

## Sources & References

- **Origin document:** [docs/brainstorms/ulong-export-requirements.md](docs/brainstorms/ulong-export-requirements.md)
- **Achievement links:** [docs/brainstorms/achievement-links-requirements.md](docs/brainstorms/achievement-links-requirements.md)
- Blob download pattern: `index.html` baris 1622–1629
- Sync modal pattern: `index.html` baris 1613–1620 dan baris 931–1016
- localStorage pattern: `index.html` baris 1286–1295
