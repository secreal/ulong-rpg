---
title: "feat: README with Contributor Hall of Fame"
type: feat
status: completed
date: 2026-05-10
---

# feat: README with Contributor Hall of Fame

## Summary

Membuat `README.md` untuk repo `secreal/ulong-rpg` yang berfungsi sebagai landing page GitHub sekaligus hall of fame — menjelaskan apa itu ulong RPG, cara memakainya, dan menyediakan tabel contributor dimana developer Indonesia bisa mencantumkan profil GitHub dan link showcase `/ulong` mereka untuk dipamerkan ke dunia.

---

## Requirements

- R1. README menjelaskan ulong RPG secara singkat — apa itu, untuk siapa, cara pakai
- R2. Ada section "Hall of Fame" / "Contributors" berisi tabel contributor: nama/GitHub handle, link profil GitHub, link showcase `/ulong` milik mereka
- R3. Ada instruksi jelas bagaimana cara contributor menambahkan diri ke tabel (via PR)
- R4. README menyertakan link ke live demo di `secreal.github.io/ulong-rpg/`
- R5. README ditulis dalam dua bahasa — Bahasa Indonesia (utama) dan English ringkas — karena target audience campuran lokal dan internasional

---

## Scope Boundaries

- Tidak ada CI/CD otomasi untuk validasi contributor list
- Tidak ada form submission atau bot — contributor menambah diri via PR manual
- Tidak ada screenshot atau GIF di scope ini — bisa ditambah later
- Format tabel contributor: Markdown table biasa, bukan JSON atau file terpisah
- Tidak ada persyaratan ketat untuk format link — contributor bebas isi link apa yang relevan

---

## Key Technical Decisions

- **Satu README.md di root repo**: GitHub otomatis menampilkannya di halaman repo. Tidak perlu file terpisah.
- **Bahasa Indonesia sebagai primary, English sebagai secondary**: Target audience utama developer Indonesia, tapi judul + tagline juga dalam English agar recruiter internasional bisa menangkap inti.
- **Contributor table via PR**: Paling simple, tidak perlu infra tambahan. Instruksi PR ditulis eksplisit — fork → edit README → tambah baris → PR ke main.
- **Format tabel contributor**: `| Nama | GitHub | Showcase |` — tiga kolom cukup. Badge tambahan (tier, class) bisa ditambahkan secara opsional oleh contributor itu sendiri.
- **secreal sebagai row pertama**: Contoh sekaligus founder entry, menunjukkan format yang diharapkan.

---

## Implementation Units

- U1. **README.md**

**Goal:** Membuat file `README.md` di root repo dengan konten lengkap — intro ulong RPG, cara pakai, tabel contributor, dan instruksi PR.

**Requirements:** R1, R2, R3, R4, R5

**Dependencies:** None

**Files:**
- Create: `README.md`

**Approach:**
- Section order: Badge/header → About (ID + EN ringkas) → Live Demo link → Cara Pakai → Hall of Fame tabel → Cara Berkontribusi (instruksi PR) → License/footer
- Header: nama proyek + tagline dalam dua bahasa
- About: 2–3 kalimat Bahasa Indonesia + 1 kalimat English subtitle
- Live Demo: link langsung ke `https://secreal.github.io/ulong-rpg/`
- Cara Pakai: bullet singkat — buka link, pilih job, level-up skill, export showcase
- Hall of Fame tabel: kolom `| No | Nama | GitHub | Showcase /ulong |` — contoh baris untuk `secreal`
- Instruksi PR: numbered steps — fork → edit README.md → tambah baris di tabel → buat PR ke `main` dengan title "chore: add [nama] to Hall of Fame"
- Footer: MIT license mention + credit

**Patterns to follow:**
- Gaya README open source Indonesia yang community-friendly — casual tapi informatif
- Badge GitHub Pages (opsional tapi bagus): `![GitHub Pages](https://img.shields.io/badge/Live-secreal.github.io%2Fulong--rpg-gold)`

**Test scenarios:**
- Test expectation: none -- README adalah static document, tidak ada behavior yang bisa ditest secara programatik. Verifikasi dilakukan manual.

**Verification:**
- `README.md` ada di root repo
- Render preview di GitHub (buka repo di browser) menampilkan section yang benar: intro, live demo link clickable, tabel contributor dengan baris secreal, instruksi PR
- Link ke `https://secreal.github.io/ulong-rpg/` dapat diklik dan mengarah ke halaman yang benar

---

## Sources & References

- Live app: `https://secreal.github.io/ulong-rpg/`
- Repo: `https://github.com/secreal/ulong-rpg`
- GitHub repo README docs: rendered automatically from `README.md` at repo root
