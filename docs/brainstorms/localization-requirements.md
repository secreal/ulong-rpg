---
date: 2026-05-10
topic: localization
---

# Localization — Bahasa Indonesia & English

## Summary

Menambahkan dua locale di ulong RPG: `id` (Bahasa Indonesia, default — kondisi saat ini) dan `en` (English penuh untuk audiens internasional). Language switcher berupa tombol kecil `ID | EN` di header. Progress localStorage tidak berubah — semua key tetap English. Salary di mode English menampilkan global market rate dalam USD (bukan konversi Rupiah), plus catatan konteks bahwa rate Indonesia jauh berbeda. Showcase HTML yang di-export juga menyertakan language switcher sehingga viewer bisa memilih bahasa.

---

## Problem Frame

ulong RPG saat ini hanya tersedia dalam Bahasa Indonesia (dengan nama-nama game dalam Inggris). Untuk membuka diri ke audiens internasional — recruiter luar, developer dari komunitas global — seluruh konten perlu tersedia dalam English penuh. Yang lebih penting: terjemahan ini tidak boleh mengganggu progress tracking yang sudah ada, karena semua localStorage key sudah dalam format English.

---

## Actors

- A1. **Player Indonesia** — developer lokal yang nyaman dengan Bahasa Indonesia, menggunakan `id` mode (default)
- A2. **Player Internasional** — developer atau recruiter dari luar Indonesia yang menggunakan `en` mode
- A3. **Viewer Showcase** — orang yang membuka halaman `/ulong` GitHub milik player; bisa pilih bahasa di showcase

---

## Requirements

**Language Switcher**
- R1. Ada tombol language switcher di `header-actions`, di sebelah tombol AUTO/Export/Sync yang sudah ada
- R2. Switcher menampilkan dua pilihan: `ID` (Bahasa Indonesia) dan `EN` (English)
- R3. Pilihan bahasa tersimpan di localStorage dan dipertahankan antar sesi
- R4. Bahasa default adalah `id` jika belum pernah dipilih

**Konten yang Diterjemahkan (en)**
- R5. UI labels diterjemahkan: judul halaman, section headers, tombol, tooltips, sidebar title, modal labels
- R6. Job descriptions (37 job) diterjemahkan ke English
- R7. Skill descriptions (~60+ entri) diterjemahkan ke English
- R8. Quest phase titles, quest item labels, dan quest sub-labels (~200+ entri) diterjemahkan ke English

**Salary di Mode English**
- R9. Salary di mode `en` menampilkan global market rate dalam USD (bukan konversi Rupiah)
- R10. Setiap entry salary en memiliki data tersendiri — bukan hasil konversi otomatis
- R11. Di dekat salary display (mode `en`) terdapat keterangan kecil bahwa rate Indonesia berbeda jauh dari angka ini

**Progress Invariance**
- R12. Semua localStorage key tidak berubah: `"JobTitle::SkillName"` dan `"quest::id"` tetap Inggris di kedua bahasa
- R13. Skill chip yang sudah di-level-up tidak terpengaruh oleh pergantian bahasa

**Showcase Export**
- R14. HTML yang di-generate via fitur export juga menyertakan language switcher `ID | EN`
- R15. Showcase HTML menyertakan kedua set teks (id dan en) dan JavaScript switcher minimal
- R16. Default bahasa showcase adalah `en` (karena target audiens recruiter internasional)

---

## Scope Boundaries

- Tidak ada bahasa ketiga dalam scope ini
- Tidak ada auto-detect browser language — selalu default `id` di app, `en` di showcase
- Tidak ada file eksternal untuk terjemahan — semua dalam `index.html`
- Salary USD bukan konversi real-time — data statis yang ditulis manual
- AUTO AI Guide prompt tetap dalam bahasa Inggris (sudah English, tidak berubah)
- Format currency Rupiah (`Rp`) hanya muncul di mode `id`

---

## Acceptance Examples

- AE1. **Covers R12, R13.** Player sudah level-up HTML ke Lv 2 di Frontend Developer. Saat ganti ke `en` mode, chip HTML masih menampilkan `Lv 2` — tidak ada data yang hilang atau reset.
- AE2. **Covers R9, R11.** Di `en` mode, Frontend Developer menampilkan salary dalam format `$X,000–$Y,000/yr` (atau `/mo`) dengan keterangan kecil seperti "Note: Indonesian market rates differ significantly."
- AE3. **Covers R14, R15.** Viewer yang membuka showcase `/ulong` milik player melihat konten dalam English (default), dan bisa klik switcher untuk beralih ke Bahasa Indonesia.

---

## Success Criteria

- Player yang tidak mengerti Bahasa Indonesia bisa menggunakan ulong RPG sepenuhnya dalam English
- Pergantian bahasa instan — tidak ada reload halaman
- Progress tidak terganggu sama sekali oleh pergantian bahasa
- Salary USD memberikan konteks yang bermakna untuk developer di luar Indonesia, bukan sekadar konversi kurs

---

## Dependencies / Assumptions

- Data salary USD harus ditulis/disetujui oleh user (secreal) sebelum implementasi — ini adalah editorial content, bukan hasil kalkulasi
- Terjemahan konten (~300+ entri) harus tersedia sebelum implementasi; bisa dilakukan dalam sesi terpisah atau sebagai bagian dari planning
- Semua perubahan di `index.html` saja — single-file app

---

## Outstanding Questions

### Deferred to Planning

- [Affects R5–R8][Technical] Struktur data terjemahan: satu object `TRANSLATIONS` besar yang di-lookup saat render, atau inline per data point (jobs array punya kolom `desc_en`, `desc_id`)?
- [Affects R11][Design] Format catatan salary Indonesia vs global: tooltip kecil (hover), teks inline di bawah angka, atau footnote di bawah card?
- [Affects R9][Content] Data salary USD per job — perlu disiapkan sebelum implementasi
- [Affects R15][Technical] Bagaimana showcase generated HTML menyertakan kedua bahasa: embed dua set data + JS switcher minimal, atau duplicate card per bahasa dan toggle visibility?
