---
date: 2026-05-10
topic: job-slot-showcase
---

# Job Slot System — Custom Showcase Identity

## Summary

Menambahkan sistem **Job Slot** di ulong RPG: user dapat menyusun hingga 3 "anchor slot" yang masing-masing menampilkan satu job utama beserta job-job lain (dari tier manapun) yang user pilih sebagai sub-skill di dalamnya. Job yang tidak masuk slot manapun tetap tampil sebagai card mandiri. Hasil konfigurasi ini menjadi tampilan showcase yang di-export ke GitHub.

---

## Problem Frame

Saat ini showcase menampilkan semua job yang punya progress sebagai card setara — tidak ada cara untuk menyatakan "ini identitas utama saya" atau "skill ini adalah bagian dari identitas saya yang lebih besar." Seorang developer yang merupakan AI Engineer dengan background Data Science dan Data Analysis harus menampilkan tiga card terpisah yang tidak menunjukkan relasi di antara mereka.

Di dunia nyata, developer sering memiliki identitas yang berlapis: ada yang "Fullstack dengan background Mobile," ada yang "Tech Lead yang juga bisa Security," ada yang "Data Engineer yang juga handle Analytics." LinkedIn tidak bisa menunjukkan ini. ulong RPG bisa — tapi belum.

---

## Actors

- A1. **User ulong RPG** — developer yang menyusun slot dan sub-skill untuk showcase mereka
- A2. **Viewer showcase** — recruiter atau kolega yang membuka halaman showcase di GitHub

---

## Key Flows

- F1. **Konfigurasi Job Slot**
  - **Trigger:** User membuka pengaturan showcase / slot editor
  - **Actors:** A1
  - **Steps:**
    1. User melihat daftar job yang punya progress (hanya job dengan minimal 1 skill level > 0)
    2. User memilih hingga 3 job sebagai anchor slot (bisa job tier berapa saja)
    3. Untuk setiap anchor, user memilih job lain (yang punya progress) untuk dimasukkan sebagai sub-skill
    4. Job yang dipilih sebagai sub di satu slot tetap bisa dipilih sebagai sub di slot lain (shared sub)
    5. User menyimpan konfigurasi
  - **Outcome:** Konfigurasi slot tersimpan di localStorage; showcase preview terupdate
  - **Covered by:** R1, R2, R3, R4, R5

- F2. **Viewer melihat showcase**
  - **Trigger:** Seseorang membuka halaman showcase GitHub milik user
  - **Actors:** A2
  - **Steps:**
    1. Viewer melihat grid berisi anchor card (maksimal 3) dan standalone card (job tanpa slot)
    2. Viewer membuka satu anchor card → panel/modal muncul menampilkan detail job anchor + breakdown sub-skill di dalamnya
    3. Sub-skill ditampilkan dengan progress masing-masing (skill level yang sudah dinaikkan)
  - **Outcome:** Viewer memahami identitas utama user dan skill pendukungnya tanpa navigasi tambahan
  - **Covered by:** R6, R7, R8

---

## Requirements

**Slot configuration**
- R1. User dapat membuat hingga 3 anchor slot; setiap slot berisi tepat 1 job anchor
- R2. Job anchor bisa job dari tier berapa saja yang punya progress (minimal 1 skill level > 0)
- R3. Di dalam setiap anchor, user dapat memilih job lain (yang punya progress) sebagai sub-skill — tidak ada batasan jumlah sub per slot
- R4. Sub-skill boleh di-share antar anchor: job yang sama bisa muncul sebagai sub di lebih dari satu slot
- R5. Konfigurasi slot (anchor + sub per slot) disimpan di localStorage dan dipertahankan antar sesi

**Showcase display**
- R6. Di showcase, anchor card ditampilkan prominently; job tanpa slot tampil sebagai standalone card di bawah atau di sisi grid
- R7. Membuka anchor card menampilkan panel/modal yang berisi: detail skill job anchor + breakdown sub-skill beserta progress masing-masing, semua dalam satu scroll tanpa tab switching
- R8. Sub yang shared antar slot tetap tampil di kedua panel anchor masing-masing — tidak ada konflik atau deduplication antar panel

**Kebebasan dan validasi**
- R9. Sistem tidak enforce "logika profesi" — user bebas memasukkan job apa saja sebagai sub di anchor mana saja
- R10. Satu-satunya constraint: hanya job dengan progress (minimal 1 skill level > 0) yang bisa dipilih sebagai anchor atau sub

---

## Acceptance Examples

- AE1. **Covers R3, R4.** Diberikan user yang punya progress di Data Analyst, Data Engineer, dan AI Engineer: ketika user membuat slot AI Engineer dengan sub Data Scientist dan Data Analyst, DAN slot Data Engineer dengan sub Data Analyst — Data Analyst muncul di panel kedua slot saat viewer membuka masing-masing anchor card.

- AE2. **Covers R6, R7.** Diberikan user dengan 2 anchor slot (Fullstack, AI Engineer) dan 2 standalone (IoT, Business Analyst): showcase menampilkan 2 anchor card di atas dan 2 standalone card di bawah. Klik anchor Fullstack → panel muncul menampilkan skill Frontend, Backend, Mobile beserta level masing-masing dalam satu scroll.

- AE3. **Covers R9.** Diberikan user yang memasukkan QA Manual sebagai sub di anchor Fullstack: sistem menyimpan dan menampilkan konfigurasi ini tanpa peringatan atau validasi — pilihan editorial sepenuhnya milik user.

- AE4. **Covers R10.** Diberikan user yang punya progress di Frontend tapi nol progress di DBA: DBA tidak muncul sebagai pilihan anchor atau sub saat konfigurasi slot.

- AE5. **Covers R2.** Diberikan user dengan progress di Business Analyst (T1) tapi tidak punya progress di job T2/T3 manapun dari group Product: user tetap bisa menjadikan Business Analyst sebagai anchor slot — tidak ada batasan tier untuk anchor.

---

## Success Criteria

- User dapat menyusun slot dalam waktu < 2 menit tanpa instruksi tambahan
- Viewer yang membuka showcase dapat memahami identitas dan skill user hanya dari card anchor + panel-nya — tanpa perlu membaca dokumentasi
- Konfigurasi slot tidak hilang setelah browser ditutup dan dibuka kembali
- Showcase yang di-export ke GitHub mencerminkan konfigurasi slot yang sama persis dengan yang ada di app

---

## Scope Boundaries

- Sistem tidak membuat "nama label" otomatis untuk kombinasi slot — user tidak perlu (dan tidak bisa) memberi nama custom pada slot; anchor card sudah mewakili identitasnya
- Tidak ada enforcement urutan tier: anchor bisa T1, sub bisa T3 — sistem percaya user
- Tidak ada fitur "rekomendasi kombinasi" yang populer atau typical
- Tidak ada visualisasi graph/tree antar job — panel anchor cukup dengan list sub + progress
- Job yang tidak punya progress sama sekali tidak muncul di slot editor maupun showcase

---

## Key Decisions

- **Maksimal 3 slot:** Tiga slot cukup untuk representasi identitas yang kompleks tanpa membuat showcase terasa seperti resume dump. Angka ini bisa direvisi tapi perlu alasan kuat.
- **Sub bebas di-share antar slot:** Mencerminkan realita bahwa satu skill bisa relevan di beberapa konteks identitas yang berbeda. Tidak ada keuntungan dari membatasi ini.
- **Tidak ada nama custom per slot:** Anchor job sudah punya nama dan identitas sendiri — memberi nama custom layer di atasnya menambah friction tanpa nilai yang sepadan.
- **Panel scroll (bukan tab):** Viewer melihat semua sub sekaligus tanpa klik tambahan — sesuai goal "bisa lihat frontend dan backendnya tanpa perlu klik-klik tab lagi."

---

## Dependencies / Assumptions

- Fitur ini bergantung pada struktur jobs array dan localStorage progress yang sudah ada — tidak ada perubahan pada data model progress
- Showcase export (`generateShowcaseHTML()`) harus diupdate untuk membaca konfigurasi slot dari localStorage
- Konfigurasi slot disimpan sebagai key terpisah di localStorage (bukan dicampur dengan progress skill)

---

## Outstanding Questions

### Deferred to Planning

- [Affects R6][Design] Layout anchor card vs standalone card di grid showcase: apakah anchor card lebih besar/wide, atau sama ukurannya tapi diberi visual treatment berbeda (border, label)?
- [Affects R7][Design] Panel/modal anchor: inline expand di bawah card, atau overlay modal? Keduanya valid — perlu cek pattern yang sudah ada di codebase
- [Affects R5][Technical] Format localStorage untuk konfigurasi slot: perlu ditetapkan saat planning agar tidak ada collision dengan key yang sudah ada
- [Affects R1][Content] Apakah user bisa punya slot kosong (anchor tanpa sub)? Ini valid use case tapi perlu diputuskan agar panel anchor tidak terasa kosong
