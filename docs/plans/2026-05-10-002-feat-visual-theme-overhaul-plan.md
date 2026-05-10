---
title: "feat: Visual Theme Overhaul — Ornate Frames, Grid Background, Favicon, Weapon Sprites"
type: feat
status: completed
date: 2026-05-10
origin: docs/brainstorms/visual-theme-requirements.md
---

# feat: Visual Theme Overhaul — Ornate Frames, Grid Background, Favicon, Weapon Sprites

## Summary

Mengubah tampilan visual ulong RPG dari dark UI modern menjadi dark fantasy RPG yang terasa seperti game betulan. Semua perubahan bersifat CSS-only di `index.html` — tidak ada file baru, tidak ada perubahan struktur HTML atau logic JS. Empat unit implementasi: grid background diperkuat, corner decorations ornate per card, favicon SVG custom, dan weapon CSS unik per job dengan progressi dalam career path.

---

## Problem Frame

Background grid yang ada sangat tipis dan hanya tampil di bagian atas halaman. Card frame masih standard border tipis tanpa ornament. Semua 37 job memakai class weapon generic yang sama (`bow`, `wand`, `sword`, dll) tanpa identitas visual per profesi. Tidak ada favicon custom — browser menampilkan default.

---

## Requirements

- R1. Background memiliki subtle grid pattern blueprint-style, opacity rendah, tidak mengganggu konten
- R2. Grid pattern pure CSS, tidak ada image asset
- R3. Setiap card memiliki corner decorations geometris pure CSS di 4 sudut
- R4. Corner decorations menggunakan `--role` per card
- R5. Corner decorations tidak overflow atau mengganggu konten card
- R6. Favicon diganti menjadi icon custom gold/dark yang mencerminkan ulong RPG
- R7. Favicon adalah SVG inline sebagai `data:` URI — tidak butuh file terpisah
- R8. Setiap job memiliki weapon CSS yang mencerminkan pekerjaannya
- R9. Job dalam satu career path memiliki weapon yang related secara visual (progressi)
- R10. Weapon baru pure CSS shapes — clip-path, pseudo-element, transform
- R11. Weapon yang sudah tepat (shield, wand untuk beberapa job) dipertahankan atau diperbaiki

---

## Scope Boundaries

- Tidak ada perubahan layout, grid system, atau HTML structure
- Tidak ada animasi berat — hanya subtle transitions yang sudah ada
- Font Cinzel dan Inter dipertahankan
- Tidak ada external image atau SVG file
- Sidebar, modal, header structure tidak berubah
- Skill chip, progress bar, level system tidak berubah

---

## Context & Research

### Relevant Code and Patterns

- `body::after` (baris 46–58) — grid pattern yang sudah ada, opacity 0.12, mask fade ke 50%. Akan diperkuat: opacity naik, mask diperluas atau diganti full-height.
- `body::before` (baris 35–44) — radial gradient gold + blue. Dipertahankan, tidak berubah.
- `.card` (baris 312–318) — `position: relative; overflow: hidden; border-radius: 12px`. Corner decoration bisa pakai pseudo-element `.card::before` dan `.card::after` tapi perlu hati-hati karena `.card-accent` sudah pakai elemen pertama di dalam card. Alternatif: 4 `<i>` element kosong di dalam card markup, atau pakai inner container.
- `sprite(tool)` fungsi (baris 1606–1613) — inject `<i class="tool ${tool}">`, tool adalah string class name dari `jobs[7]`.
- Existing weapon CSS (baris 365–376): `.sword`, `.wand`, `.bow`, `.shield`, `.book`, `.hammer`, `.laptop` — masing-masing menggunakan div `right/left/top` positioning + `::before`/`::after` untuk detail tambahan. Pattern ini diikuti untuk weapon baru.
- `jobs` array (baris 1179–1218) — index 7 adalah weapon class string. Update langsung di sini.
- `generateShowcaseHTML` (baris ~2080) — inline CSS di generated HTML juga menyertakan weapon classes. Weapon baru perlu disertakan ke sana juga.

### Institutional Learnings

- Tidak ada `docs/solutions/` — proyek baru, belum ada learnings.

### External References

- Tidak diperlukan — semua pattern sudah ada di codebase dan arahnya jelas.

---

## Key Technical Decisions

- **Grid background**: Perkuat `body::after` yang sudah ada — naikkan opacity dari .12 ke .22, ganti `mask-image` dari fade ke 50% menjadi full-height dengan opacity yang lebih merata. Tambahkan diagonal line tipis ketiga untuk feel dungeon map (45deg, opacity sangat rendah). Tidak perlu pseudo-element baru. (see origin: docs/brainstorms/visual-theme-requirements.md)
- **Corner decorations**: Gunakan 4 `<span class="card-corner">` atau pendekatan pseudo-element di `.card`. Karena `.card` sudah `overflow: hidden`, corner decoration harus menggunakan `position: absolute` di dalam card dan berukuran cukup kecil. Implementasi yang paling clean: tambahkan CSS `.card::before` sebagai overlay gradient subtle di tepi card, dan 4 corner marker menggunakan approach CSS box-shadow corner trick atau clip-path pada `.card` wrapper. **Keputusan implementer**: pilih pendekatan yang paling clean setelah melihat hasil visual — bisa juga menggunakan 4 `<i class="corner">` yang di-inject via `renderCards()`.
- **Favicon format**: `<link rel="icon" href="data:image/svg+xml,<svg...>">` — SVG favicon support di semua browser modern (Chrome, Firefox, Safari 12+, Edge). Icon: berlian emas dengan huruf "U" di tengah, konsisten dengan `.crest` yang sudah ada di header.
- **Weapon class format**: Class baru per weapon (`.brush`, `.key`, `.flask`, `.wrench`, dll), tidak menggunakan CSS custom property `--weapon`. Ini konsisten dengan pattern existing (`.bow`, `.wand`, dll) dan tidak mengubah `sprite()` function — hanya menambah CSS class definitions baru dan update string di `jobs` array. (see origin: docs/brainstorms/visual-theme-requirements.md)
- **Weapon dalam generateShowcaseHTML**: Weapon CSS classes perlu di-include di inline `<style>` generated HTML. Saat implementasi, tambahkan semua weapon class baru ke dalam CSS block di `generateShowcaseHTML`. Weapon lama yang masih dipakai juga tetap ada.

---

## Open Questions

### Resolved During Planning

- **Format weapon baru**: Class name string langsung (`.brush`, `.key`, dll) — konsisten dengan pattern `sprite(tool)` yang sudah ada
- **Corner decoration mechanism**: Keputusan dikembalikan ke implementer — `.card::before`/`::after` atau 4 injected `<i>` — pilih yang paling clean setelah melihat `overflow: hidden` constraint
- **Favicon format**: `data:image/svg+xml` URI — portable, tidak butuh file, browser support adequate

### Deferred to Implementation

- **Ukuran dan detail exact corner ornament**: Seberapa besar corner bracket, apakah ada gap/double border, apakah ada dot di sudut — diputuskan saat implementasi melihat hasil visual
- **Weapon CSS exact values**: Posisi, ukuran, dan warna exact tiap weapon baru — bisa di-tweak iteratif saat implementasi
- **Apakah `body::after` cukup atau perlu layer tambahan**: Dilihat saat implementasi apakah diperlukan pseudo-element terpisah di `body` atau cukup modifikasi yang ada

---

## High-Level Technical Design

> *Ini adalah gambaran pendekatan yang dimaksud — directional guidance untuk review, bukan implementation specification.*

```
CSS layers (dari bawah ke atas):
  body::before  → radial gradient gold/blue [tidak berubah]
  body::after   → grid lines diperkuat: opacity .22, mask full-height, optional diagonal
  .card         → corner ornaments via pseudo-element atau injected <i>
  .sprite       → weapon <i class="tool {weapon-class}">

jobs array update:
  [group, title, desc, skills, salary, role, hair, WEAPON_CLASS, tier]
  Setiap job: weapon class string diubah ke class yang lebih spesifik
  Career path progressi: brush(Fe) → code-brush(FullStack) → blueprint(TechLead)

Weapon CSS pattern (sama seperti .bow, .wand):
  .brush { ... }           /* Frontend Developer */
  .brush::before { ... }   /* handle detail */
  .key { ... }             /* Backend Developer */
  .key::before { ... }     /* bow detail */
  [dst untuk 37 jobs]

Favicon:
  <link rel="icon" href="data:image/svg+xml,{urlencoded SVG}">
  SVG: berlian emas (transform rotate 45deg) + "U" hitam di tengah
       konsisten dengan .crest di header
```

---

## Implementation Units

- U1. **Grid Background — Dungeon Blueprint Style**

**Goal:** Memperkuat grid pattern yang sudah ada di `body::after` agar terasa seperti peta dungeon/blueprint — lebih visible tapi tetap subtle, tidak fade ke invisible di tengah halaman.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Modify: `index.html` (CSS `body::after` di sekitar baris 46–58)

**Approach:**
- Naikkan opacity `body::after` dari `.12` ke `.22`
- Ganti `mask-image` dari `linear-gradient(to bottom, rgba(0,0,0,.8) 0%, transparent 50%)` menjadi full coverage — misalnya `linear-gradient(to bottom, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 100%)` sehingga grid masih ada di bawah tapi tidak menghilang
- Pertimbangkan menambah garis diagonal sangat tipis (45deg, opacity rendah) untuk feel dungeon map
- Grid size 24px dipertahankan atau dikurangi sedikit ke 20px untuk feel lebih detail

**Patterns to follow:**
- `body::before` dan `body::after` pattern (baris 35–58) — pure CSS pseudo-element
- Prinsip: additive, tidak mengubah radial gradient di `body::before`

**Test scenarios:**
- Happy path: Buka halaman → grid lines terlihat di seluruh halaman, dari atas sampai bawah, bukan hanya header area
- Happy path: Grid tidak mengganggu readability teks card title atau skill chips
- Edge case: Pada layar mobile (< 768px) grid tetap terlihat tapi tidak dominan

**Verification:**
- Grid terlihat subtle di seluruh viewport, termasuk bagian bawah halaman
- Konten card, teks, dan skill chips tetap mudah dibaca

---

- U2. **Ornate Card Corner Decorations**

**Goal:** Menambahkan corner ornament geometris di 4 sudut setiap card yang menggunakan `--role` color, memberi kesan frame RPG Genshin-style.

**Requirements:** R3, R4, R5

**Dependencies:** None (bisa paralel dengan U1, U3)

**Files:**
- Modify: `index.html` (CSS corner decoration, dan JS `renderCards()` jika menggunakan injected elements)

**Approach:**
- Pilihan A (pure CSS, recommended): Tambahkan CSS selector `.card` yang menggunakan `box-shadow` inner atau `outline` multiple untuk efek corner bracket. Alternatifnya: `.card::before` dengan `background: transparent; border: 2px solid var(--role); border-radius: sama dengan card; opacity rendah` sebagai ring dalam.
- Pilihan B (injected elements): Inject `<i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>` via `renderCards()`. CSS `.c` absolute positioned di 4 corner, `::before`/`::after` membentuk L-bracket menggunakan `--role` color.
- Implementer pilih yang paling clean. Syarat: tidak overflow, tidak menutupi konten, `overflow: hidden` di `.card` sudah ada jadi absolute-positioned elements aman.
- Ukuran corner bracket: sekitar 12–16px L-shape, line thickness 2px

**Patterns to follow:**
- `.class-badge::before` (baris 387–390) — pola pseudo-element dengan `--role` color
- `.card:hover` (baris 320–324) — sudah ada glow effect menggunakan `--role`, corner decoration harus konsisten

**Test scenarios:**
- Happy path: Setiap card punya 4 corner ornament di sudut — terlihat pada hover dan non-hover state
- Happy path: Card dengan `--role: #69a8f5` (Frontend, biru) punya corner berwarna biru; card Security (merah) punya corner merah
- Edge case: Card dengan teks panjang atau banyak skill chips — corner tidak menutupi konten
- Edge case: Zoom browser 150% — corner masih terlihat proporsional

**Verification:**
- Semua card (37 total) memiliki corner decorations yang visible dan menggunakan warna `--role` masing-masing
- Tidak ada overflow atau visual clipping yang tidak diinginkan

---

- U3. **Favicon SVG Custom**

**Goal:** Mengganti favicon default browser dengan icon custom SVG yang mencerminkan identitas ulong RPG — berlian emas dengan huruf "U".

**Requirements:** R6, R7

**Dependencies:** None (bisa paralel dengan U1, U2)

**Files:**
- Modify: `index.html` (tambah `<link rel="icon">` di `<head>`, sekitar baris 5–6)

**Approach:**
- Tambahkan `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">` di `<head>` sebelum `<style>`
- SVG design: persegi rotasi 45deg (diamond) berwarna gold gradient `#f0bb4e` → `#c8922a`, border/stroke gelap, huruf "U" berwarna `#1a0e00` di tengah — konsisten visual dengan `.crest` di header (baris 82–94)
- SVG viewBox 32×32, minimal shapes, tidak perlu animasi
- URL-encode SVG string untuk `href` — atau gunakan base64 jika lebih pendek

**Patterns to follow:**
- `.crest` CSS (baris 82–94) — berlian emas dengan huruf, ini referensi visual yang harus diikuti
- Pattern `data:` URI yang sudah dipakai di `generateShowcaseHTML` untuk self-contained export

**Test scenarios:**
- Happy path: Buka halaman di browser → tab menampilkan favicon gold diamond bukan default icon
- Happy path: Favicon terlihat jelas di background putih dan gelap (browser tabs bisa keduanya)
- Edge case: Firefox dan Chrome keduanya menampilkan favicon (keduanya support SVG favicon)

**Verification:**
- Tab browser menampilkan favicon custom (bukan default browser icon)
- Icon terlihat konsisten dengan `.crest` di header halaman

---

- U4. **Weapon CSS Sprites per Job**

**Goal:** Menambahkan CSS weapon class baru yang unik per profesi dan mengupdate `jobs` array agar setiap job memiliki weapon yang mencerminkan pekerjaannya, dengan progressi visual dalam career path.

**Requirements:** R8, R9, R10, R11

**Dependencies:** None (dapat dikerjakan setelah U1–U3 atau paralel, tapi paling besar scope-nya)

**Files:**
- Modify: `index.html`
  - CSS: weapon class definitions baru (sekitar baris 365–376, setelah existing weapon CSS)
  - JS: `jobs` array (baris 1179–1218) — update string index 7 tiap job ke class baru
  - JS: `generateShowcaseHTML` — tambahkan weapon CSS baru ke inline `<style>` block

**Approach:**
- Untuk setiap weapon baru, tulis CSS class mengikuti pola existing:
  - Class utama: ukuran, posisi, background/border
  - `::before`: detail shape pertama (misal handle, detail)
  - `::after`: detail shape kedua jika diperlukan
- Career path progressi (weapon harus terasa related):
  - **Software path**: `brush` (Frontend) → `code-brush` atau `brush` diperbesar (Fullstack) → `blueprint` (TechLead)
  - **QA path**: `magnifier` (Manual QA) → `trap` (QA Automation) → `gauge` (Performance Tester)
  - **Data path**: `abacus` (Data Analyst) → `chart` (BI Dev) → `pipe` (Data Eng) → `flask` (Data Sci) → `circuit-wand` (AI Eng)
  - **Infra path**: `wrench` (SysAdmin) → `chain` (Network) → `cloud-staff` (Cloud) → `gear` (DevOps) → `cylinder` (DBA) → `shield-hourglass` (SRE)
  - **Security path**: `radar` (SOC) → `fortress` (SecEng) → `lockpick` (Pentester) → `law-book` (GRC) → `rune` (AppSec)
  - **Product path**: `quill` (BA) → `checklist` (PO) → `compass` (PM) → `sword` dipertahankan (Product Manager)
  - **Design path**: `palette` (UI) → `wireframe` (UX) → `full-palette` atau `laptop` dipertahankan (Product Designer)
  - **Support path**: `headset` (Helpdesk) → `wrench-chat` (Tech Support) → `shield-tablet` (App Support)
  - **Leadership**: `banner` (Eng Manager) → `crown-staff` (CTO) → `crown-shield` (CISO)
- Weapon yang sudah tepat dan bisa dipertahankan: `shield` untuk beberapa Security/Infra job, `wand` untuk Backend/Data Sci, `book` untuk BA/GRC
- Implementer bebas adjust nama class atau visual detail selama progressi dalam path terasa natural

**Patterns to follow:**
- `.bow` (baris 369–370), `.wand` (367–368), `.sword` (365–366) — pattern 2–3 baris CSS per weapon
- `.hammer` (373–374) — contoh weapon dengan `::before` untuk head berbeda dari shaft
- `.laptop` (375–376) — contoh weapon menggunakan `::before` untuk detail screen

**Test scenarios:**
- Happy path: Buka halaman → setiap card menampilkan weapon yang berbeda, tidak ada yang sama kecuali jika memang mirip satu path
- Happy path: Frontend Developer menampilkan weapon brush/paintbrush (bukan bow generik)
- Happy path: Backend Developer menampilkan weapon key (berbeda dari wand generik)
- Happy path: Data Scientist tetap bisa memakai wand (jika dipertahankan) atau flask yang jelas berbeda dari wand Backend
- Happy path — Covers R9: Frontend → Fullstack → TechLead terlihat ada progressi weapon yang related (brush family atau blueprint)
- Happy path — Covers R9: QA Manual → QA Automation → Perf Tester terlihat ada progressi (magnifier → trap → gauge)
- Edge case: Weapon tidak overlap dengan body/head sprite — posisi `right`, `top`, `z-index` harus benar
- Edge case: Generated showcase HTML (`generateShowcaseHTML`) juga menampilkan weapon baru dengan benar — CSS weapon classes sudah diinclude di inline style

**Verification:**
- Semua 37 job menampilkan weapon CSS yang unik atau related-per-path
- `localStorage` dan `generateShowcaseHTML` output tetap tidak terpengaruh (hanya CSS + jobs array string yang berubah)
- Weapon baru muncul di generated showcase HTML dengan visual yang sama

---

## System-Wide Impact

- **Interaction graph:** Tidak ada callback atau observer yang terpengaruh. Perubahan CSS dan `jobs` array index 7 bersifat render-only — tidak ada event handler yang bergantung pada weapon class name.
- **State lifecycle risks:** Tidak ada. Perubahan ini purely presentational — tidak menyentuh localStorage, progress tracking, atau quest system.
- **API surface parity:** `generateShowcaseHTML` perlu update: weapon CSS baru harus dimasukkan ke inline `<style>` block di generated HTML (U4). Jika terlewat, showcase HTML akan menampilkan weapon tanpa styling.
- **Unchanged invariants:** Semua fitur yang sudah ada (skill level system, quest modal, sync modal, export modal, achievement links, sidebar filter, progress tracking) tidak tersentuh oleh plan ini.
- **Integration coverage:** Tidak ada cross-layer interaction. Visual-only changes.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Corner decorations terpotong oleh `overflow: hidden` pada `.card` | Test semua pendekatan (pseudo-element vs injected) dan pilih yang tidak terpotong; jika perlu, pertimbangkan wrapper element di luar `.card` |
| 37 weapon CSS classes membuat CSS section panjang | Weapon CSS compact (2–4 baris per weapon) dan dikelompokkan per path — total estimasi ~150 baris, masih manageable di single file |
| Weapon baru di showcase HTML terlewat | U4 verification explicitly mengecek `generateShowcaseHTML` output |
| SVG favicon tidak muncul di browser tertentu | Tambahkan fallback `<link rel="icon" type="image/png">` jika diperlukan, atau cukup tes di Chrome + Firefox yang support SVG favicon |

---

## Sources & References

- **Origin document:** [docs/brainstorms/visual-theme-requirements.md](docs/brainstorms/visual-theme-requirements.md)
- Existing weapon CSS: `index.html` baris 365–376
- `sprite()` function: `index.html` baris 1606–1613
- `jobs` array: `index.html` baris 1179–1218
- `body::after` grid: `index.html` baris 46–58
- `.crest` (visual reference favicon): `index.html` baris 82–94
- `generateShowcaseHTML`: `index.html` sekitar baris 2080+
