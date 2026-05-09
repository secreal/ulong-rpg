---
date: 2026-05-10
topic: visual-theme
---

# Visual Theme Overhaul — Ornate Frames, Grid Background, Favicon, Weapon Sprites

## Summary

Mengubah tampilan ulong RPG dari dark UI modern menjadi dark fantasy RPG yang lebih game-like: latar grid blueprint tipis, frame card ornate bergaya Genshin Impact dengan corner decoration, favicon dan app icon yang berkarakter, dan CSS sprite weapon unik per job yang mencerminkan profesi masing-masing — dengan progressi weapon di dalam satu career path.

---

## Problem Frame

ulong RPG sudah punya nama dan karakter RPG yang kuat, tapi tampilannya masih terasa seperti dark UI dashboard biasa. Untuk player yang menseriuskan proyek ini, tampilan perlu terasa seperti game betulan — bukan sekadar website dengan warna gelap.

Tiga area yang perlu diubah:
1. **Background** — sekarang hanya radial gradient, tidak ada texture atau pola yang memberi kesan "dunia game"
2. **Card frame** — border tipis standard, tidak ada corner ornament atau frame dekoratif yang khas RPG
3. **Karakter** — semua job pakai sprite yang sama (`bow`, `wand`, `sword`, dll) tanpa ciri khas per job; untuk job satu jalur pun tidak ada progressi visual senjata

---

## Visual References

Dari referensi gambar yang diberikan user:
- **Pixel text bar**: font/style retro, pixel feeling pada UI elements
- **Genshin Impact frame (teal)**: rounded frame tebal, background teal gelap, ornament sisi dan sudut dekoratif
- **Genshin Impact character panel**: dark navy, ornate corner decoration geometris, garis grid blueprint tipis memancar dari tengah
- **Final Fantasy dialogue box**: rounded blue frame bergaya RPG klasik

**Palet target:**
- Base: dark navy (`#0d1117` yang sudah ada) + teal accent
- Gold: `#f0bb4e` yang sudah ada — pertahankan
- Frame accent: teal/gold corner ornament

---

## Requirements

**Background (R1–R2)**
- R1. Background memiliki subtle grid pattern — garis horizontal dan vertikal tipis, seperti blueprint atau peta dungeon. Opacity sangat rendah agar tidak mengganggu konten.
- R2. Grid pattern di-implement pure CSS, tidak ada image asset — tetap performa tinggi.

**Ornate Card Frames (R3–R5)**
- R3. Setiap card memiliki corner decorations geometris — empat sudut card punya ornament kecil yang terbuat dari pure CSS (border segmen, clip-path, atau pseudo-element).
- R4. Corner decorations menggunakan warna `--role` per card — tetap konsisten dengan sistem theming yang sudah ada.
- R5. Tampilan corner decorations tidak mengganggu konten card dan tidak overflow ke luar card.

**Favicon & App Icon (R6–R7)**
- R6. Favicon diganti dari default browser menjadi icon custom yang mencerminkan karakter ulong RPG — berbentuk pixel-art atau geometric, palet gold/dark.
- R7. Icon adalah SVG inline di `<head>` sebagai `data:` URI pada `<link rel="icon">` — tidak butuh file asset terpisah.

**Weapon Sprites per Job (R8–R11)**
- R8. Setiap job memiliki weapon CSS yang mencerminkan pekerjaannya — bukan hanya pembagian generic (`bow`, `wand`, `sword`).
- R9. Job dalam satu career path memiliki weapon yang related secara visual — contoh: Frontend (brush kecil) → Senior Frontend (paintbrush besar) → Tech Lead (blueprint/scroll). Progressi weapon terasa natural.
- R10. Weapon baru tetap dibuat dari pure CSS shapes — tidak ada SVG atau image asset. Boleh menggunakan `clip-path`, pseudo-element, dan CSS transform.
- R11. Job yang sudah punya weapon icon tepat (seperti Security dengan `shield`, Data Scientist dengan `wand`) bisa dipertahankan atau diperbaiki — tidak harus semuanya diganti jika sudah sesuai.

---

## Weapon Design Ideas per Job Path

Ini adalah ideas, bukan requirement final — implementer bebas adjust:

| Job | Weapon Konsep |
|-----|---------------|
| IT Novice | scroll/book — parchment pemula |
| Frontend Developer | paintbrush — CSS/desain visual |
| Backend Developer | key — kunci API/auth |
| Mobile Developer | stylus — pena touchscreen |
| Fullstack Developer | paintbrush + key (combined) |
| Tech Lead | blueprint scroll |
| Manual QA | magnifying glass |
| QA Automation | trap/snare (bug trap) |
| Performance Tester | speedometer/gauge |
| Data Analyst | abacus/calculator |
| BI Developer | bar chart stack |
| Data Engineer | pipe wrench |
| Data Scientist | beaker/flask |
| AI Engineer | circuit wand |
| System Administrator | wrench |
| Network Engineer | chain link |
| Cloud Engineer | cloud staff |
| DevOps Engineer | gear + wrench combo |
| Database Admin | cylindrical database |
| SRE | shield + hourglass |
| SOC Analyst | radar/eye |
| Security Engineer | fortress wall segment |
| Pentester | dagger/lockpick |
| GRC Specialist | law book/scroll |
| AppSec Engineer | rune tablet |
| Business Analyst | quill pen |
| Product Owner | checklist tablet |
| Project Manager | compass |
| Product Manager | sword of direction |
| UI Designer | palette brush |
| UX Designer | wireframe grid |
| Product Designer | full palette |
| Helpdesk | headset |
| Technical Support | wrench + chat bubble |
| Application Support | shield tablet |
| Engineering Manager | banner/flag |
| CTO | crown staff |
| CISO | crown shield |

---

## Scope Boundaries

- Tidak ada perubahan layout, grid system, atau HTML structure — hanya visual CSS
- Tidak ada animasi berat — hanya subtle transitions yang sudah ada
- Font Cinzel dan Inter dipertahankan — bukan bagian dari overhaul ini
- Tidak ada image atau SVG file eksternal — semua pure CSS dan inline SVG/data URI
- Sidebar, modal, header structure tidak berubah
- Skill chip, progress bar, level system tidak berubah — hanya weapon sprite dan card frame

---

## Success Criteria

- Membuka ulong RPG terasa seperti membuka interface game RPG, bukan dashboard gelap biasa
- Corner decorations per card memberikan kesan "frame" tanpa mengganggu readability konten
- Setiap job terasa punya identitas visual dari weapon-nya — player bisa menerka profesi job hanya dari bentuk weapon
- Grid background terlihat subtle — menambah texture tanpa menjadi distraksi

---

## Dependencies / Assumptions

- Semua perubahan di `index.html` saja — single-file app
- `--role` dan `--hair` CSS variables per card sudah ada dan akan dimanfaatkan
- Tool class (`bow`, `wand`, `sword`, dll) di `jobs` array akan diubah atau ditambah class baru per job
- Grid background bisa menggunakan `body::after` yang sudah ada (sekarang ada grid tipis), hanya perlu diperkuat atau diganti dengan pola yang lebih "dungeon map"

---

## Outstanding Questions

### Deferred to Planning

- [Affects R9][Technical] Format weapon baru: apakah menggunakan class baru per job (`.brush`, `.key`, `.flask`, dll) atau CSS custom property `--weapon` yang di-set inline per card
- [Affects R3][Technical] Corner decoration: apakah clip-path atau pseudo-element yang lebih clean di CSS — bergantung pada seberapa detail ornament yang diinginkan
- [Affects R6][Technical] Format favicon: inline `<svg>` di data URI atau SVG string langsung — perlu cek browser support untuk favicon SVG
