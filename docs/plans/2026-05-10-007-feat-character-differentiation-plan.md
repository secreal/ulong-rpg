---
date: 2026-05-10
feature: character-differentiation
status: completed
origin: docs/brainstorms/character-differentiation-requirements.md
---

# Character Differentiation — Unique Face, Body & Pose per Job with Career Path Inheritance

## Problem Frame

Semua 37 karakter sprite saat ini terlihat identik kecuali warna rambut (`--hair`), warna badan (`--role`), dan class weapon (`.tool`). Wajah, proporsi badan, dan pose persis sama untuk semua job. Tujuan: setiap job punya identitas visual unik — head shape, eye expression, hair style, body proportions, arm pose — dan job dalam career path yang sama memiliki kontinuitas visual antar tier (seperti Pokémon evolution).

Origin: `docs/brainstorms/character-differentiation-requirements.md`

---

## Scope Boundaries

**In scope:**
- Variasi wajah per job: head shape, eye size/spacing, hair shape (R1–R4)
- Variasi badan & pose per job: body proportions, arm rotation, leg offset (R5–R7)
- Aksesori signature pure CSS untuk job terpilih (R8–R10)
- Career path inheritance: tier atas mewarisi 1–2 elemen visual dari tier bawah (R11–R14)
- Update `generateShowcaseHTML()` bersamaan — dual CSS sync wajib (R15)
- Single file `index.html` saja (R16)

**Out of scope:**
- Animasi atau sprite bergerak
- Variasi skin tone per job
- Aset gambar atau SVG eksternal
- Perbedaan karakter berdasarkan progress user
- Perubahan localStorage

---

## Key Technical Decisions

### KD1: CSS custom properties per job untuk face/body/pose

Pendekatan: tambah CSS custom properties baru pada `--` per job yang di-set inline di `style=""` pada `<article class="card">`. Base CSS mendefinisikan properti default; per-job style override hanya property yang berbeda dari default.

Properties baru yang ditambahkan:
```
--head-rx: 45% 45% 40% 40%    /* head border-radius */
--head-w: 42px                  /* head width */
--head-h: 38px                  /* head height */
--eye-size: 5px                 /* eye width & height */
--eye-gap: 14px                 /* gap antara kedua mata (left eye selalu di 51px, right = left + gap) */
--hair-rx: 50% 50% 30% 30%     /* hair border-radius */
--hair-w: 52px                  /* hair width */
--hair-h: 28px                  /* hair height */
--body-w: 54px                  /* body width */
--body-h: 52px                  /* body height */
--body-rx: 10px 10px 8px 8px   /* body border-radius */
--arm-l-rot: 18deg              /* left arm rotation */
--arm-r-rot: -18deg             /* right arm rotation */
--leg-l-off: 35px               /* leg left offset */
--leg-r-off: 35px               /* leg right offset */
```

CSS baseline diupdate untuk memakai var() dengan fallback ke nilai saat ini. Contoh:
```css
.head { border-radius: var(--head-rx, 45% 45% 40% 40%); width: var(--head-w, 42px); height: var(--head-h, 38px); }
```

Alasan: mekanisme ini sudah ada dan berjalan untuk `--hair` dan `--role`. Tidak perlu tambah data attributes atau CSS classes baru pada sprite container. Perubahan terlokalisir pada CSS baseline + `style` per job di render JS.

### KD2: HTML element untuk aksesori signature

Aksesori yang tidak bisa dicapai lewat property override (kacamata, headset, badge) diimplementasikan sebagai `<div class="acc acc-NAMACLASS"></div>` di dalam `.sprite`. Accessory CSS memakai `::before`/`::after` mengikuti pola weapon CSS yang sudah ada.

Catatan: `sprite()` function (line 2398) dan showcase card builder perlu menerima data aksesori. Paling sederhana: tambah field baru di index ke-9 pada `jobs` array (`acc` class string atau `""` jika tidak ada aksesori).

### KD3: Dual CSS sync — main style block + generateShowcaseHTML inline style

Setiap property CSS baru dan aksesori class CSS **harus** ditulis di dua tempat:
1. Main `<style>` block (lines ~444–623)
2. Inline `<style>` di dalam `generateShowcaseHTML()` (lines ~3128–3247)

Ini adalah risiko tertinggi. Implementasi per unit harus mencakup update keduanya sebelum dianggap selesai.

### KD4: Per-job style ditulis sebagai data, bukan CSS rules

Per-job face/body/pose data disimpan di `jobs` array (atau parallel lookup object) sebagai value string yang langsung masuk ke `style=""` attribute. Tidak menggunakan per-job CSS class rules (`.card[data-job="..."] .head { ... }`), karena itu membutuhkan 37 selector dan sulit di-sync dengan showcase generator.

Alternatif yang ditolak: per-job CSS class rules — terlalu verbose (37 × N rules), sulit di-sync dual.

---

## Per-Job Visual Design Specification

Tabel editorial ini adalah keputusan desain yang harus diimplementasikan. Nilai adalah override dari baseline; blank = pakai default.

**Legend:**
- head-rx: border-radius shorthand untuk `.head`
- eye-size: ukuran bulatan `.eye` (px)
- eye-gap: jarak antar mata (px, dari left eye left ke right eye left; default 14)
- hair-rx: border-radius shorthand untuk `.hair`
- hair-w/h: width/height `.hair`
- body-w/h: width/height `.body`
- arm-l/r: rotate deg `.arm.left` / `.arm.right`
- acc: CSS class aksesori (string, atau "" jika tidak ada)

### Base (T0)

| Job | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc |
|-----|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|
| IT Novice | `45% 45% 40% 40%` | 5 | 14 | `50% 50% 30% 30%` | 52 | 28 | 54 | 52 | 18 | -18 | — |

IT Novice adalah baseline paling polos — semua nilai sama dengan default. Tidak ada aksesori.

### Software (T1–T3)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| Frontend Developer | T1 | `40% 40% 38% 38%` | 5 | 12 | `60% 40% 35% 35%` | 54 | 26 | 54 | 50 | 25 | -10 | — | Baseline Software |
| Backend Developer | T1 | `35% 45% 40% 40%` | 4 | 16 | `40% 60% 25% 25%` | 50 | 30 | 56 | 52 | 10 | -25 | — | Beda dari Frontend |
| Mobile Developer | T1 | `45% 40% 38% 42%` | 5 | 13 | `50% 50% 40% 30%` | 52 | 25 | 54 | 52 | 20 | -20 | — | Simetris |
| Fullstack Developer | T2 | `40% 40% 38% 38%` | 5 | 12 | `60% 40% 35% 35%` | 56 | 28 | 58 | 54 | 25 | -12 | — | Warisi hair Frontend + badan lebih lebar |
| Tech Lead | T3 | `38% 38% 35% 35%` | 6 | 11 | `60% 40% 35% 35%` | 58 | 30 | 62 | 56 | 30 | -8 | `badge` | Warisi hair shape Frontend, badan jauh lebih lebar, badge epaulette |

### QA (T1–T2)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| Manual QA | T1 | `48% 42% 40% 40%` | 5 | 15 | `45% 55% 28% 32%` | 50 | 28 | 52 | 50 | 22 | -22 | — | Baseline QA |
| QA Automation | T2 | `48% 42% 40% 40%` | 5 | 15 | `45% 55% 28% 32%` | 52 | 30 | 54 | 52 | 28 | -15 | — | Warisi head shape Manual QA, arm lebih aktif |
| Performance Tester | T2 | `42% 48% 38% 38%` | 6 | 13 | `50% 50% 32% 28%` | 52 | 26 | 56 | 54 | 15 | -30 | — | Kepala sedikit beda, arm miring berat |

### Data (T1–T3)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| Data Analyst | T1 | `45% 45% 42% 42%` | 4 | 16 | `50% 50% 35% 35%` | 50 | 26 | 52 | 52 | 12 | -28 | — | Baseline Data |
| BI Developer | T2 | `45% 45% 42% 42%` | 4 | 16 | `50% 50% 35% 35%` | 52 | 28 | 54 | 54 | 12 | -28 | — | Warisi Data Analyst, sedikit lebih lebar |
| Data Engineer | T2 | `40% 40% 38% 38%` | 5 | 14 | `45% 55% 30% 30%` | 54 | 30 | 56 | 52 | 20 | -20 | — | Beda dari BI Developer |
| Data Scientist | T2 | `45% 45% 42% 42%` | 4 | 18 | `50% 50% 35% 35%` | 50 | 26 | 54 | 52 | 10 | -30 | `glasses` | Warisi Data Analyst head + glasses signature |
| AI Engineer | T3 | `42% 42% 40% 40%` | 5 | 16 | `50% 50% 35% 35%` | 54 | 28 | 60 | 56 | 15 | -25 | `glasses` | Warisi Data Scientist glasses, badan lebih besar |

### Infra (T1–T3)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| System Administrator | T1 | `40% 40% 35% 35%` | 5 | 13 | `45% 45% 25% 25%` | 54 | 30 | 56 | 52 | 20 | -15 | — | Baseline Infra |
| Network Engineer | T1 | `35% 35% 38% 38%` | 5 | 13 | `40% 40% 28% 28%` | 52 | 28 | 54 | 52 | 15 | -20 | — | Kepala lebih kotak |
| Cloud Engineer | T2 | `40% 40% 35% 35%` | 5 | 13 | `45% 45% 25% 25%` | 56 | 32 | 58 | 54 | 22 | -15 | — | Warisi SysAdmin, lebih lebar |
| DevOps Engineer | T2 | `38% 38% 35% 35%` | 6 | 12 | `45% 45% 25% 25%` | 56 | 30 | 58 | 54 | 25 | -18 | — | Pose lebih dinamis |
| Database Admin | T2 | `45% 45% 40% 40%` | 4 | 15 | `50% 50% 30% 30%` | 54 | 28 | 56 | 56 | 10 | -10 | — | Pose lebih santai |
| SRE | T3 | `40% 40% 35% 35%` | 6 | 12 | `45% 45% 25% 25%` | 58 | 32 | 62 | 58 | 28 | -12 | `badge` | Warisi Infra hair pattern, badan paling lebar, badge |

### Security (T1–T3)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| SOC Analyst | T1 | `42% 42% 38% 38%` | 5 | 13 | `42% 58% 28% 28%` | 52 | 28 | 52 | 52 | 18 | -25 | `headset` | Baseline Security + headset signature |
| Security Engineer | T2 | `40% 40% 36% 36%` | 5 | 12 | `42% 58% 28% 28%` | 54 | 30 | 56 | 54 | 20 | -25 | — | Warisi hair SOC Analyst, badan lebih lebar |
| Pentester | T2 | `38% 38% 42% 42%` | 6 | 11 | `55% 45% 30% 30%` | 52 | 26 | 54 | 52 | 30 | -30 | — | Pose agresif, kepala berbeda |
| GRC Specialist | T2 | `45% 45% 42% 42%` | 4 | 16 | `50% 50% 35% 35%` | 50 | 28 | 52 | 52 | 8 | -8 | — | Pose formal, kepala bulat |
| AppSec Engineer | T3 | `40% 40% 36% 36%` | 6 | 12 | `42% 58% 28% 28%` | 56 | 30 | 60 | 56 | 22 | -22 | `rune-acc` | Warisi hair Security Engineer, badan lebih lebar, rune aksesori |

### Product (T1–T3)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| Business Analyst | T1 | `45% 45% 40% 40%` | 4 | 16 | `48% 52% 32% 32%` | 50 | 26 | 52 | 50 | 10 | -10 | — | Baseline Product |
| Product Owner | T2 | `45% 45% 40% 40%` | 4 | 16 | `48% 52% 32% 32%` | 52 | 28 | 54 | 52 | 12 | -12 | — | Warisi BA hair |
| Project Manager | T2 | `42% 42% 38% 38%` | 5 | 15 | `45% 55% 30% 30%` | 54 | 28 | 56 | 52 | 20 | -18 | — | Pose lebih aktif |
| Product Manager | T3 | `42% 42% 38% 38%` | 5 | 14 | `48% 52% 32% 32%` | 56 | 30 | 60 | 56 | 25 | -10 | `badge` | Warisi hair BA/PO + badge, badan lebih lebar |

### Design (T1–T3)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| UI Designer | T1 | `50% 50% 44% 44%` | 5 | 13 | `58% 42% 35% 35%` | 54 | 26 | 52 | 50 | 28 | -8 | — | Baseline Design, kepala lebih bulat |
| UX Designer | T2 | `50% 50% 44% 44%` | 5 | 14 | `58% 42% 35% 35%` | 54 | 28 | 54 | 52 | 22 | -12 | — | Warisi head/hair UI Designer |
| Product Designer | T3 | `50% 50% 44% 44%` | 6 | 13 | `58% 42% 35% 35%` | 56 | 30 | 58 | 54 | 25 | -10 | — | Warisi UI→UX chain, badan lebih lebar, eye lebih besar |

### Support (T1–T2)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| Helpdesk | T1 | `45% 45% 40% 40%` | 5 | 15 | `48% 52% 30% 30%` | 52 | 28 | 52 | 50 | 15 | -22 | — | Baseline Support |
| Technical Support | T2 | `45% 45% 40% 40%` | 5 | 15 | `48% 52% 30% 30%` | 52 | 30 | 54 | 52 | 18 | -22 | — | Warisi Helpdesk hair |
| Application Support | T2 | `42% 48% 38% 38%` | 5 | 14 | `45% 55% 28% 32%` | 52 | 28 | 54 | 52 | 12 | -28 | — | Kepala sedikit beda |

### Leadership (T3–T4)

| Job | Tier | head-rx | eye-size | eye-gap | hair-rx | hair-w | hair-h | body-w | body-h | arm-l | arm-r | acc | Inheritance note |
|-----|------|---------|----------|---------|---------|--------|--------|--------|--------|-------|-------|-----|------------------|
| Engineering Manager | T3 | `38% 38% 34% 34%` | 6 | 11 | `48% 48% 26% 26%` | 58 | 32 | 62 | 56 | 28 | -8 | `badge` | Senior look, badge epaulette |
| CTO | T4 | `36% 36% 32% 32%` | 7 | 10 | `48% 48% 26% 26%` | 60 | 34 | 66 | 60 | 30 | -6 | `crown-acc` | Warisi EM hair pattern, badan paling besar, crown aksesori |
| CISO | T4 | `38% 38% 34% 34%` | 6 | 11 | `44% 44% 24% 24%` | 60 | 34 | 66 | 60 | 25 | -10 | `badge` | Warisi EM silhouette, badan sama lebar, badge |

---

## Aksesori Specification

Berikut 5 aksesori yang perlu didefinisikan sebagai CSS class:

### `.acc-glasses`
Kacamata kecil: dua lingkaran kecil di area mata, posisi sedikit di depan `.head`. Memakai `::before` + `::after` + `box-shadow` untuk second lens.
- Dipakai oleh: Data Scientist, AI Engineer
- Posisi: `top: 30px; left: 43px` dalam `.sprite`
- Warna: `#1d2430` (same as eye)

### `.acc-headset`
Arc kecil di atas kepala + dot speaker di samping kiri. Memakai `::before` (arc) + `::after` (speaker dot).
- Dipakai oleh: SOC Analyst
- Posisi: `top: 5px; left: 38px` dalam `.sprite`
- Warna: `#6a3d2b` (border color)

### `.acc-badge`
Epaulette/rank badge di bahu kiri: kotak kecil dengan garis horizontal dari `box-shadow`.
- Dipakai oleh: Tech Lead, SRE, Product Manager, Engineering Manager, CISO
- Posisi: `top: 58px; left: 18px` dalam `.sprite`
- Warna: `var(--role)`

### `.acc-rune-acc`
Glowing rune mark kecil di dada: hexagon outline menggunakan `clip-path` atau `border-radius` trick.
- Dipakai oleh: AppSec Engineer
- Posisi: `top: 66px; left: 46px` dalam `.sprite`
- Warna: `var(--role)`

### `.acc-crown-acc`
Crown kecil di atas kepala (di luar rambut): tiga "points" kecil menggunakan `::before` (base) + `::after` (point kanan) + `box-shadow` (points tambahan).
- Dipakai oleh: CTO
- Posisi: `top: 1px; left: 41px` dalam `.sprite`
- Warna: `#f2c35b` (gold)

---

## Implementation Units

### U1: Update CSS baseline — tambah CSS custom property vars

**Goal:** Update `.head`, `.hair`, `.eye`, `.body`, `.arm`, `.leg` rules di main `<style>` block untuk memakai `var()` dengan fallback ke nilai default saat ini. Tidak ada perubahan visual di tahap ini — semua karakter masih identik.

**Files:**
- Modify: `index.html` (main `<style>` block, lines ~444–455)

**Approach:**
Ganti fixed values di 6 rules tersebut dengan `var(--prop, fallback)`. Contoh:
```css
.head { left:38px; top:16px; width:var(--head-w,42px); height:var(--head-h,38px); border-radius:var(--head-rx,45% 45% 40% 40%); ... }
.hair { left:33px; top:7px; width:var(--hair-w,52px); height:var(--hair-h,28px); border-radius:var(--hair-rx,50% 50% 30% 30%); ... }
.eye { top:35px; width:var(--eye-size,5px); height:var(--eye-size,5px); ... }
.eye.left { left:var(--eye-l,51px); }
.eye.right { left:var(--eye-r,65px); }  /* computed from --eye-gap di JS */
.body { width:var(--body-w,54px); height:var(--body-h,52px); border-radius:var(--body-rx,10px 10px 8px 8px); ... }
.arm.left { transform:rotate(var(--arm-l-rot,18deg)); }
.arm.right { transform:rotate(var(--arm-r-rot,-18deg)); }
.leg.left { left:var(--leg-l-off,35px); }
.leg.right { right:var(--leg-r-off,35px); }
```

Catatan: `--eye-r` (posisi right eye) = 51px + `--eye-gap` — tapi CSS tidak bisa kalkulasi ini langsung. Gunakan dua variables terpisah `--eye-l` dan `--eye-r` yang dihitung di JS render saat inject style string.

**Verification:**
- Semua 37 karakter masih render identik dengan sebelum (visual regression check manual)
- DevTools menunjukkan computed value sesuai fallback

---

### U2: Update CSS baseline di generateShowcaseHTML()

**Goal:** Mirror perubahan U1 ke inline `<style>` di dalam `generateShowcaseHTML()`. Wajib dilakukan bersamaan dengan U1.

**Files:**
- Modify: `index.html` (inline CSS di dalam `generateShowcaseHTML()`, lines ~3128–3160)

**Approach:**
Copy persis CSS rules yang sama dengan U1, diterapkan ke block sprite CSS di `generateShowcaseHTML()`. Tidak ada logika baru — murni sync copy.

**Verification:**
- Export showcase dari browser → karakter masih render identik dengan sebelumnya
- No visual regression

---

### U3: Tambah per-job style data ke jobs array

**Goal:** Menambah string style override untuk setiap dari 37 jobs di `jobs` array (index ke-9) yang meng-encode per-job CSS custom properties dari design spec tabel di atas.

**Files:**
- Modify: `index.html` (const jobs array, lines 1635–1674)

**Approach:**
Tambah field ke-10 (index 9) pada setiap baris jobs array. Field ini adalah object atau string yang berisi CSS custom property overrides per job. Format paling sederhana: inline style string yang langsung bisa di-concat ke `style=""` attribute.

Contoh untuk IT Novice (default, tidak perlu override):
```js
["Base", "IT Novice", ..., 0, ""]
```

Contoh untuk Tech Lead:
```js
["Software", "Tech Lead", ..., 3, "--head-rx:38% 38% 35% 35%;--eye-size:6px;--eye-l:50px;--eye-r:61px;--hair-rx:60% 40% 35% 35%;--hair-w:58px;--hair-h:30px;--body-w:62px;--body-h:56px;--arm-l-rot:30deg;--arm-r-rot:-8deg"]
```

Update destructuring di seluruh codebase yang memakai `jobs` array — search untuk pattern `([grp, title, desc, skills, salary, role, hair, tool, tier])` dan tambah `charStyle` (atau `style`) sebagai destructured field ke-10.

**Verification:**
- Console log `jobs[0][9]` returns `""`, `jobs[4][9]` (Tech Lead) returns style string
- Tidak ada crash di render functions

---

### U4: Apply per-job style ke sprite render (main app)

**Goal:** Inject `charStyle` dari jobs array ke `style=""` attribute di card render function.

**Files:**
- Modify: `index.html` (render/card generation JS, around line 2480)

**Approach:**
Saat ini card render menulis:
```js
style="--role:${role};--hair:${hair}"
```

Update menjadi:
```js
style="--role:${role};--hair:${hair};${charStyle}"
```

Perhatikan: `charStyle` sudah encode semicolon di akhir setiap property jika diformat konsisten. Pastikan tidak ada double semicolon.

Juga update `sprite()` function jika ia perlu inject aksesori element — tapi ini dihandle di U5.

**Verification:**
- IT Novice masih tampak sama
- Tech Lead menampilkan kepala lebih kecil/squarish, badan lebih lebar, arm rotation berbeda
- Frontend Developer dan Tech Lead dalam group Software terlihat "satu keluarga" tapi berbeda tier

---

### U5: Implementasi aksesori CSS + HTML injection

**Goal:** Definisikan 5 aksesori CSS class dan inject aksesori `<div>` element ke sprite untuk job yang memilikinya.

**Files:**
- Modify: `index.html` (CSS aksesori classes di main style block; `sprite()` JS function; card render JS; inline CSS di `generateShowcaseHTML()`)

**Approach:**

1. **CSS aksesori** — Tambah 5 class definitions setelah weapon CSS rules (~line 623+):
   ```css
   .acc { position:absolute; }
   .acc-glasses { top:30px; left:43px; width:8px; height:5px; border:2px solid #1d2430; border-radius:50%; box-shadow:12px 0 0 0 #1d2430, 12px -1px 0 0 #1d2430; }
   .acc-headset { top:5px; left:38px; width:40px; height:14px; border:2px solid #6a3d2b; border-radius:50% 50% 0 0; border-bottom:none; }
   .acc-headset::after { content:""; position:absolute; left:-2px; top:8px; width:5px; height:8px; background:#6a3d2b; border-radius:3px; }
   .acc-badge { top:58px; left:18px; width:12px; height:6px; background:var(--role); border:1px solid #1f2634; box-shadow:0 3px 0 var(--role), 0 6px 0 var(--role); }
   .acc-rune-acc { top:66px; left:46px; width:8px; height:8px; border:1px solid var(--role); transform:rotate(45deg); }
   .acc-crown-acc { top:1px; left:41px; width:4px; height:8px; background:#f2c35b; box-shadow:7px 2px 0 #f2c35b, 14px 0 0 #f2c35b; }
   ```
   Nilai di atas adalah starting point — fine-tune saat test visual.

2. **Jobs array field ke-10** — Tambah `acc` field (index 10) berisi string CSS class atau `""`. Ini terpisah dari `charStyle` (index 9) agar lebih readable. Atau gabungkan ke index 9 sebagai bagian dari object. Keputusan implementasi: gabungkan sebagai dua field terpisah untuk clarity:
   - Index 9: `charStyle` string (CSS custom property overrides)
   - Index 10: `accClass` string (nama CSS class aksesori, atau `""`)

3. **`sprite()` function (line 2398)** — Tambah parameter `accClass`. Inject `<i class="acc ${accClass}"></i>` (atau `<div>`) di dalam sprite HTML jika `accClass` tidak kosong.

4. **Showcase card builder** — Mirror logic yang sama untuk aksesori di `generateShowcaseHTML()`.

5. **Tambah aksesori CSS** juga ke inline style block di `generateShowcaseHTML()`.

**Verification:**
- Data Scientist menampilkan kacamata kecil di area mata
- SOC Analyst menampilkan headset di atas kepala
- Tech Lead / SRE / EM menampilkan badge di bahu
- AppSec Engineer menampilkan rune mark di dada
- CTO menampilkan crown
- Job tanpa aksesori tidak menampilkan elemen aksesori

---

### U6: Apply per-job style ke generateShowcaseHTML()

**Goal:** Inject `charStyle` dan aksesori ke card HTML di dalam `generateShowcaseHTML()` — mirror dari U4 untuk showcase output.

**Files:**
- Modify: `index.html` (`generateShowcaseHTML()` function, lines ~3044–3080)

**Approach:**
Saat ini showcase cardHTML menulis:
```js
style="--role:${role};--hair:${hair}"
```

Update menjadi:
```js
style="--role:${role};--hair:${hair};${charStyle}"
```

Dan tambahkan aksesori element di sprite HTML showcase jika `accClass` tidak kosong.

Destructuring di showcase map juga perlu menyertakan `charStyle` dan `accClass` (index 9 dan 10).

**Verification:**
- Generate showcase dari browser → karakter menampilkan differensiasi visual yang sama dengan main app
- Data Scientist di showcase juga punya kacamata
- Tech Lead di showcase juga punya badan lebih lebar

---

## Dependencies & Sequencing

```
U1 → U2 (CSS baseline harus sync sebelum lanjut)
U1, U2 → U3 (vars harus ready sebelum per-job data diapply)
U3 → U4 (data harus ada sebelum render apply)
U3 → U5 (acc field harus ada sebelum inject)
U4 → U6 (main app pattern established sebelum mirror ke showcase)
U5 → U6 (acc logic established sebelum mirror ke showcase)
```

Urutan eksekusi: U1 + U2 (parallel) → U3 → U4 + U5 (parallel) → U6

---

## Test Scenarios

### U1/U2 — CSS var baseline
- TS1.1: Semua 37 karakter masih render identik setelah perubahan (visual regression)
- TS1.2: Override satu property secara manual di DevTools (`--head-w: 70px`) → head melebar
- TS1.3: Showcase export setelah U2 menampilkan karakter identik dengan sebelumnya

### U3 — Jobs data
- TS3.1: `jobs[0][9]` (IT Novice charStyle) === `""` dan `jobs[0][10]` (accClass) === `""`
- TS3.2: `jobs[4][9]` (Tech Lead charStyle) mengandung `--body-w`, `--arm-l-rot`
- TS3.3: Semua 37 baris punya tepat 11 field
- TS3.4: Tidak ada crash di page load

### U4 — Main app render
- TS4.1: IT Novice, Frontend Developer, Tech Lead terlihat berbeda satu sama lain
- TS4.2: Frontend Developer dan Tech Lead masih terlihat "satu keluarga" (hair shape serupa)
- TS4.3: Data Scientist terlihat berbeda dari Data Analyst (mata lebih lebar, ada glasses di U5)
- TS4.4: Leadership jobs (EM, CTO, CISO) tampak paling imposing (badan terlebar)

### U5 — Aksesori
- TS5.1: Data Scientist muncul aksesori kacamata, job lain dalam Data group tidak
- TS5.2: SOC Analyst muncul headset, Security Engineer tidak
- TS5.3: Tech Lead, SRE, Product Manager, Engineering Manager, CISO muncul badge
- TS5.4: AppSec Engineer muncul rune mark
- TS5.5: CTO muncul crown
- TS5.6: IT Novice tidak muncul aksesori apapun
- TS5.7: Aksesori tidak overflow keluar `.sprite` container (tidak terpotong)

### U6 — Showcase sync
- TS6.1: Export showcase → karakter menampilkan semua differensiasi visual, bukan template sama
- TS6.2: Data Scientist di showcase punya kacamata
- TS6.3: Tech Lead di showcase punya badan lebih lebar dari Frontend Developer

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Showcase CSS tidak di-sync | High | Medium | U1+U2 wajib parallel; U6 selalu setelah U4+U5 |
| Aksesori overflow `.card` karena `overflow:hidden` | Medium | Low | Test TS5.7; adjust posisi jika perlu |
| CSS var inheritance tidak bekerja di nested elements | Low | High | Test di U1 sebelum commit |
| 37 baris jobs array edit typo | Medium | Low | TS3.3 cek field count |
| Eye position kiri/kanan tidak simetris jika menggunakan `--eye-l`/`--eye-r` terpisah | Medium | Low | Kalkulasi keduanya di JS dari `--eye-gap` value |

---

## Deferred to Implementation

- Nilai exact CSS per aksesori (posisi pixel, ukuran shape) — fine-tune saat visual test
- Apakah eye position cukup pakai `--eye-l` + `--eye-r` independent atau perlu kalkulasi JS dari `--eye-gap` — keduanya valid, implementer pilih yang lebih clean
- Apakah `charStyle` dan `accClass` sebagai dua field terpisah (index 9 + 10) atau satu field object — implementer pilih; update destructuring konsisten
