---
date: 2026-05-10
topic: ulong-export
---

# ulong Export — Personal GitHub Showcase

## Summary

Menambahkan fitur export ke ulong RPG: user mengisi profil singkat (nama, nick, GitHub username), lalu men-generate halaman HTML personal yang hanya menampilkan job tree yang mereka punya progress, siap di-paste ke repo GitHub publik mereka sendiri (`/ulong`). Tidak ada OAuth atau API call — murni client-side generate dengan guide manual.

---

## Problem Frame

ulong RPG menyimpan seluruh progress user (skill levels, link portofolio) di localStorage mereka sendiri — tidak ada cara untuk menunjukkan progress itu ke orang lain (recruiter, komunitas, teman). Progress bersifat pribadi dan terkunci di browser.

Sementara itu, setiap developer sudah punya GitHub. Repo publik adalah natural showcase surface yang sudah familiar. Yang kurang adalah jembatan antara progress di ulong RPG dan halaman yang bisa dibuka siapa saja.

---

## Actors

- A1. **User ulong RPG** — developer yang sudah punya progress skill dan ingin mempublikasikannya
- A2. **Recruiter / viewer** — orang yang mengunjungi `github.com/<username>/ulong` dan melihat showcase

---

## Key Flows

- F1. **Setup Profil**
  - **Trigger:** User membuka ulong RPG untuk pertama kali, atau menekan tombol edit profil
  - **Actors:** A1
  - **Steps:** User mengisi nama lengkap, nick/display name, dan GitHub username di form profil; form disimpan ke localStorage
  - **Outcome:** Profil tersedia untuk digunakan saat export
  - **Covered by:** R1, R2

- F2. **Export Progress ke GitHub**
  - **Trigger:** User menekan tombol export di ulong RPG
  - **Actors:** A1
  - **Steps:**
    1. ulong RPG membaca profil dan progress dari localStorage
    2. Men-generate file HTML self-contained yang berisi hanya job tree yang ada progress-nya
    3. Menyediakan file untuk di-copy atau di-download
    4. Menampilkan guide singkat: buat repo `ulong` dulu (jika belum ada), upload/paste `index.html`, aktifkan GitHub Pages
    5. Membuka URL `github.com/<username>/ulong` di tab baru sebagai referensi
  - **Outcome:** User memiliki file HTML siap upload dan tahu langkah selanjutnya
  - **Covered by:** R3, R4, R5, R6, R7

- F3. **Viewer Melihat Showcase**
  - **Trigger:** Seseorang membuka `github.com/<username>/ulong` atau GitHub Pages-nya
  - **Actors:** A2
  - **Steps:** Viewer membuka halaman HTML yang menampilkan job tree dengan progress si user
  - **Outcome:** Viewer dapat melihat skill level dan job yang sudah dicapai user
  - **Covered by:** R5

---

## Requirements

**Profil user**
- R1. User dapat mengisi dan menyimpan profil: nama lengkap, nick/display name, dan GitHub username
- R2. Profil disimpan di localStorage bersama progress dan dipertahankan antar sesi

**Export**
- R3. Ada tombol export yang jelas di ulong RPG
- R4. Tombol export men-generate file HTML self-contained yang tidak membutuhkan asset eksternal dari ulong-rpg
- R5. HTML yang di-generate hanya menampilkan job yang memiliki minimal 1 skill dengan level > 0 — job tanpa progress tidak muncul
- R6. HTML yang di-generate menyertakan informasi profil user (nama, nick) sebagai identitas showcase
- R7. Setelah generate, user ditampilkan guide singkat langkah-langkah setup repo `/ulong` di GitHub dan cara upload file-nya; URL `github.com/<username>/ulong` dibuka di tab baru sebagai referensi

**Konten yang di-export**
- R8. HTML yang di-generate mencerminkan skill level (Lv 1/2/3) masing-masing skill yang sudah dinaikkan
- R9. Link portofolio yang tersimpan di localStorage diikutsertakan dalam output jika ada

---

## Acceptance Examples

- AE1. **Covers R5.** Diberikan user yang punya progress di Frontend Developer (3 skill) tapi nol progress di Manual QA, ketika export, HTML yang di-generate hanya menampilkan card Frontend Developer — card Manual QA tidak muncul sama sekali.
- AE2. **Covers R7.** Diberikan GitHub username "secreal", ketika export selesai, tab baru terbuka ke `github.com/secreal/ulong` dan guide tampil menjelaskan langkah setup.
- AE3. **Covers R4.** HTML yang di-generate dapat dibuka offline di browser tanpa koneksi ke server ulong-rpg dan tampil dengan benar.

---

## Success Criteria

- User yang baru pertama kali menggunakan fitur bisa berhasil mempublikasikan progress mereka ke GitHub tanpa bantuan tambahan, hanya mengikuti guide yang tersedia
- Halaman showcase di repo `/ulong` dapat dibuka oleh siapa saja (recruiter, teman) dan menampilkan progress yang akurat sesuai localStorage user
- Tidak ada data progress yang hilang atau salah antara ulong RPG dan HTML yang di-export

---

## Scope Boundaries

- Tidak ada GitHub OAuth atau API integration — semua manual oleh user
- Tidak ada auto-push ke GitHub dari dalam ulong RPG
- Tidak ada sinkronisasi dua arah — export saja, tidak ada import dari repo `/ulong` kembali ke ulong RPG
- Setup GitHub Pages bukan tanggung jawab ulong RPG — hanya di-guide, tidak diotomasi
- Fitur social (lihat progress orang lain dari dalam ulong RPG) di luar scope ini

---

## Key Decisions

- **Tidak ada OAuth:** Redirect manual + guide dipilih karena menghindari kompleksitas token management, CORS, dan GitHub API rate limits — cukup untuk v1
- **HTML self-contained:** Output harus bisa berdiri sendiri tanpa CDN atau asset dari ulong-rpg, agar tetap berfungsi jika ulong-rpg berubah atau offline
- **Filter job by progress:** Job tanpa progress tidak ditampilkan sama sekali — showcase harus relevan, bukan template kosong

---

## Dependencies / Assumptions

- User sudah punya akun GitHub
- Repo `/ulong` harus dibuat manual oleh user sebelum upload — ulong RPG hanya memberi guide, tidak membuat repo
- Progress yang valid untuk di-export adalah yang tersimpan di localStorage pada saat tombol export ditekan

---

## Outstanding Questions

### Deferred to Planning

- [Affects R4][Technical] Apakah HTML yang di-generate merupakan versi mini/stripped dari `index.html` yang ada, atau file terpisah yang dibangun dari scratch? Implikasinya pada maintenance ketika ulong-rpg berubah
- [Affects R3][Technical] Mekanisme copy/download file: clipboard API, `<a download>`, atau keduanya? Perlu cek browser compatibility yang relevan
- [Affects R9][Needs research] Format link portofolio di localStorage saat ini — perlu dicek strukturnya sebelum bisa di-serialize ke output HTML
