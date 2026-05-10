---
title: "refactor: Organic sprite shapes — round body, layered hair instead of helmet"
type: refactor
status: completed
date: 2026-05-10
---

# refactor: Organic Sprite Shapes — Round Body & Layered Hair

## Summary

Sprite karakter saat ini terlihat kaku: badan kotak dengan `border-radius` kecil, dan rambut berbentuk satu blok datar di atas kepala yang menyerupai helm. Refactor ini mengubah dua hal:

1. **Badan** — bentuk lebih organik/bulat menggunakan `border-radius` besar atau oval pada `.body` dan `.cape`
2. **Rambut** — dari satu blok flat menjadi komposisi berlapis yang lebih menyerupai rambut sungguhan, menggunakan `::before` dan/atau `::after` untuk fringe (poni) / sisi / volume

Tidak ada struktur HTML yang berubah, tidak ada fitur baru — murni penyesuaian CSS pada elemen yang sudah ada.

---

## Problem Frame

Setelah mata diperbaiki menjadi frontal, masalah visual berikutnya adalah:
- `.body` dengan `border-radius:10px` terlihat seperti kotak berlabel, bukan tubuh karakter
- `.hair` satu blok persegi panjang terlihat seperti helm/topi datar, bukan rambut

Keduanya mengurangi kesan "karakter" dan memperkuat kesan "chip UI".

---

## Requirements

- R1. `.body` dan `.cape` memiliki bentuk lebih organik — rounded di bahu (atas) lebih besar, sedikit mengecil/melebar di pinggul (bawah)
- R2. `.hair` menggunakan `::before` dan/atau `::after` untuk menambahkan lapisan rambut (fringe/poni di depan, volume di sisi) sehingga tidak tampak seperti blok datar
- R3. Perubahan tetap menggunakan CSS custom properties (`var()`) agar per-job masih bisa override via `charStyle`
- R4. Semua aksesori yang sudah ada (`acc-glasses`, `acc-headset`, `acc-badge`, `acc-rune-acc`, `acc-crown-acc`) tetap terpasisi dengan benar setelah perubahan
- R5. Showcase inline CSS di `generateShowcaseHTML()` harus diupdate bersamaan — tidak boleh ada drift antara main CSS dan showcase CSS
- R6. Tidak ada perubahan pada HTML element, JS logic, atau localStorage

---

## Scope Boundaries

- Tidak mengubah ukuran `.sprite` container (116px × 138px)
- Tidak menambah HTML element baru ke dalam `sprite()` function
- Tidak mengubah posisi atau logika weapon (`.tool`)
- Tidak menyentuh per-job `charStyle` strings — default baru cukup, override tetap bisa via charStyle jika diperlukan
- Tidak mengubah warna — semua `background`, `border`, `color` tetap sama
- Tidak ada animasi

---

## Context & Research

### Relevant Code and Patterns

- `index.html:444` — `.sprite` container (116px × 138px, `position:relative`)
- `index.html:446` — `.head` (left:38px, top:16px, 42×38px)
- `index.html:447` — `.hair` (left:33px, top:7px, 52×28px, `border-radius` via `--hair-rx`)
- `index.html:451` — `.body` (left:32px, top:54px, 54×52px, `border-radius:10px 10px 8px 8px`)
- `index.html:452` — `.cape` (left:24px, top:54px, 70×70px, `border-radius:10px 10px 28px 28px`)
- `index.html:457–463` — aksesori (`.acc-glasses`, `.acc-headset`, `.acc-badge`, dll)
- `index.html:~3311–3325` — showcase inline CSS (harus diupdate bersamaan)
- Per-job `charStyle` di jobs array menggunakan `--body-rx`, `--hair-rx`, `--hair-w`, `--hair-h` untuk override

### Institutional Learnings

- `::before`/`::after` sudah dipakai di weapon sprites dan aksesori — pattern yang sudah established di codebase ini
- Showcase CSS adalah string literal di dalam `generateShowcaseHTML()`, harus di-edit manual bersamaan dengan main CSS
- Dua mata sudah ditambah `::after` untuk highlight — pattern pseudoelement sudah ada di `.eye`

---

## Key Technical Decisions

- **`.body` shape via `border-radius` besar, bukan SVG/clip-path:** Cukup ekspresif untuk efek "bulat" tanpa menambah complexity. CSS custom property `--body-rx` sudah ada — tinggal ubah default-nya ke nilai yang lebih organik (misal: `30% 30% 40% 40% / 20% 20% 30% 30%` untuk efek bahu membulat).
- **`.hair` fringe via `::before`:** `::before` dipakai untuk fringe/poni di bagian depan-bawah rambut (overlap sedikit ke dahi), `::after` saat ini sudah dihapus (dipakai dulu untuk side-flap yang menimbulkan side-view confusion). Karena `::after` kini kosong, bisa dipakai untuk volume sisi kiri rambut.
- **Tidak menambah custom property baru untuk `::before`/`::after` rambut:** Fringe dan volume sisi cukup dengan `inherit` warna dari `var(--hair)` yang sudah ada — tidak perlu `--fringe-color` baru.
- **Default baru menggantikan default lama, per-job override tetap berjalan:** Job yang punya `--hair-rx` custom di `charStyle` sudah akan override default baru secara otomatis.

---

## Implementation Units

- U1. **Update `.body` dan `.cape` ke bentuk organik**

**Goal:** Badan terlihat lebih rounded/organik — bahu lebih bulat, tidak seperti kotak.

**Requirements:** R1, R3

**Dependencies:** None

**Files:**
- Modify: `index.html` (main CSS block ~line 451–452, showcase CSS ~line 3319–3320)

**Approach:**
- Ubah default `border-radius` pada `.body` dari `10px 10px 8px 8px` ke nilai yang lebih organik, contoh `28% 28% 35% 35% / 18% 18% 24% 24%` — ini membentuk oval bahu atas yang membulat dan sedikit melebar di pinggul
- `--body-rx` custom property tetap ada sehingga per-job masih bisa override
- `.cape` juga disesuaikan agar tidak terasa kotak — `border-radius` atas lebih besar agar menyatu dengan lekukan badan, contoh `40% 40% 50% 50% / 20% 20% 40% 40%`
- Tidak perlu `::before`/`::after` untuk cape — bentuk satu blok sudah cukup
- Update showcase CSS dengan nilai yang sama persis

**Patterns to follow:**
- `index.html:458` — `.acc-glasses` memakai border-radius untuk efek organik
- `index.html:472` — `.shield` memakai `border-radius:8px 8px 16px 16px` untuk asimetri atas-bawah

**Test scenarios:**
- Happy path: semua 37 karakter ditampilkan, badan terlihat rounded bukan kotak
- Edge case: job dengan `--body-rx` custom di `charStyle` (tidak ada saat ini, tapi field tersedia) — override harus tetap bekerja
- Integration: aksesori `.acc-badge` (posisi `top:58px left:16px`) masih terpasisi di area badan yang benar setelah border-radius berubah — badge tidak "mengambang" di luar outline badan

**Verification:**
- Buka halaman di browser, semua card tampil dengan badan oval/rounded
- Aksesori badge pada Tech Lead, SRE, Eng Manager terlihat menempel di badan, bukan melayang
- Tidak ada regression pada weapon positioning

---

- U2. **Update `.hair` dengan fringe `::before` untuk lapisan rambut**

**Goal:** Rambut tidak lagi tampak seperti helm — ada fringe (poni) yang overlap ke dahi menggunakan `::before`.

**Requirements:** R2, R3

**Dependencies:** U1 (koordinat `::before` relatif ke `.hair`, perlu tahu final head layout)

**Files:**
- Modify: `index.html` (main CSS block ~line 447, showcase CSS ~line 3315)

**Approach:**
- Tambahkan `::before` pada `.hair` untuk fringe/poni: posisi absolute di bagian bawah blok rambut, overlap ~6–8px ke bawah ke area dahi, lebar lebih sempit dari rambut utama (~60–70%), border-radius bawah lebih besar untuk kesan helai rambut yang jatuh
- Warna fringe = `var(--hair)` (sama dengan rambut), border = `2px solid #33202a` (warna outline rambut yang sudah ada)
- `::after` bisa dipakai untuk volume sisi kiri (strand yang menonjol ke kiri dari blok rambut utama) — kecil, ~8–10px lebar, lekukan ke bawah
- Custom property `--hair-rx`, `--hair-w`, `--hair-h` tetap berfungsi untuk blok rambut utama; `::before` dan `::after` mengikuti dimensi relatif (tidak perlu custom property baru)
- Update showcase CSS dengan rule yang sama persis

**Patterns to follow:**
- `index.html:453` — `.arm` menggunakan `border-radius:9px` untuk kesan organik
- `index.html:469` — `.wand::before` untuk elemen pseudo yang overlap dengan parent

**Test scenarios:**
- Happy path: semua karakter tampil dengan fringe visible di bawah batas rambut, jelas berbeda dari blok helm
- Happy path: karakter yang rambutnya lebih pendek (--hair-h kecil) fringe tetap proporsional karena posisi relatif
- Edge case: job dengan `--hair-rx` yang sangat ekstrem (misal `20% 80% 10% 10%`) — fringe `::before` tidak menonjol ke luar area yang wajar
- Edge case: `acc-crown-acc` (CTO) — crown berada di `top:0px left:40px`, harus tidak bertabrakan visual dengan fringe/volume rambut
- Integration: `acc-headset` (SOC Analyst) di `top:4px left:36px` — headset arc harus tetap terlihat di atas rambut (z-index headset = 8, z-index hair = 5, ✓)

**Verification:**
- Rambut pada IT Novice (default, tanpa charStyle) terlihat berlapis — ada blok atas dan fringe bawah
- Rambut pada CTO (panjang, `--hair-h:34px`) terlihat berbeda proporsi dari IT Novice — lebih bervolume
- Tidak ada elemen rambut yang overlap ke area mata secara tidak wajar

---

## System-Wide Impact

- **Interaction graph:** Hanya CSS — tidak ada callback atau JS yang dipicu
- **Error propagation:** N/A — CSS-only change
- **State lifecycle risks:** Tidak ada — tidak ada localStorage, tidak ada state
- **API surface parity:** Showcase HTML (`generateShowcaseHTML()`) menyertakan inline CSS yang identik — harus diupdate bersamaan (R5). Drift antara main CSS dan showcase CSS adalah satu-satunya risiko nyata
- **Unchanged invariants:** HTML sprite structure (`<div class="sprite"><i class="hair"></i><i class="head"></i>...`) tidak berubah. Per-job `charStyle` override tetap berfungsi. Weapon z-index (8) dan aksesori z-index (8) tetap di atas semua elemen badan/rambut

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Showcase CSS drift (main CSS diupdate tapi showcase tidak, atau sebaliknya) | Kedua blok CSS di-edit dalam satu commit; verifikasi manual dengan generate showcase setelah implementasi |
| Aksesori badge bergeser secara visual karena border-radius badan berubah | Badge posisinya `absolute` dari `.sprite`, bukan dari `.body` — pergeseran visual minimal. Cek di browser setelah U1 |
| Fringe `::before` overlap ke mata pada karakter dengan rambut panjang | Kontrol dengan `z-index`: hair z-index 5, eye z-index 7 — mata selalu di atas rambut |
| `::before` pada `.hair` mengganggu `::before` yang sudah ada pada weapon via `.tool::before` | Tidak konflik — `.hair::before` dan `.tool::before` adalah pseudo-elements dari elemen berbeda |

---

## Sources & References

- Relevant code: `index.html` (CSS block ~line 436–464, showcase CSS ~line 3311–3325)
- Previous commits: `ddec9f2` (remove hair::after side-flap), `3b32969` (frontal eyes), `0c9c655` (sync UX)
