---
date: 2026-05-10
topic: job-progression
---

# Job Progression System — Skill-Gated Unlock & Job Change

## Summary

Menambahkan sistem **progression berbasis skill** di ulong RPG: job tier lebih tinggi hanya muncul dan bisa dipilih setelah prerequisite skill di tier bawahnya terpenuhi. Aksi **Job Change** menjadi momen formal ketika user beralih ke job baru yang lebih tinggi — termasuk pilihan untuk meng-include job asal sebagai sub-skill. Tombol "Job Change" yang sekarang ada di card diganti namanya menjadi "Qualification".

---

## Problem Frame

Ada dua tipe user di ulong RPG:

- **User A (fresh):** mulai dari awal, butuh panduan "apa yang harus dimiliki untuk mencapai job yang diinginkan."
- **User B (sudah di posisi):** datang sebagai Fullstack / Data Engineer yang sudah berpengalaman. Sistem yang hanya bisa diisi dari bawah secara linear tidak merepresentasikan realita mereka — mereka tidak mulai dari IT Novice.

Saat ini tidak ada mekanisme yang membedakan kedua user ini. Semua job tersedia langsung, tidak ada konteks "kamu sudah di tahap mana", dan tidak ada cara untuk declare "aku ini Fullstack yang datang dari Frontend + Backend."

---

## Actors

- **A1. User ulong RPG** — developer yang mengisi skill dan melakukan Job Change
- **A2. Viewer showcase** — pihak yang melihat hasil showcase di GitHub (tidak berinteraksi dengan progression)

---

## Key Flows

### F1. Unlock job tier lebih tinggi

- **Trigger:** User menaikkan skill di job T1
- **Steps:**
  1. Awalnya hanya job T0 (IT Novice) dan semua job T1 yang terlihat di card grid
  2. Ketika user memiliki ≥2 skill aktif (level ≥1) di job T1 tertentu, job T2 yang relevan mulai muncul (dari tersembunyi/locked menjadi visible)
  3. Untuk T3: butuh ≥2 skill aktif di job T2 yang relevan
- **Outcome:** User melihat jalur progressi mereka terbuka secara organik seiring skill diisi
- **Covered by:** R1, R2, R3, R4

### F2. Melakukan Job Change

- **Trigger:** User merasa siap beralih ke job T2/T3 yang sudah terbuka
- **Steps:**
  1. Di card job T2/T3 yang sudah unlocked, ada tombol **"Job Change"**
  2. Klik Job Change → muncul panel/modal yang menampilkan:
     - Job tujuan (sudah jelas dari card mana yang diklik)
     - Daftar job T1 yang eligible untuk di-include (yang punya minimal 1 skill aktif)
     - User memilih job mana yang mau di-include (opsional, bisa kosong)
  3. User konfirmasi → Job Change selesai
  4. Efek pada tampilan:
     - Job T1 **asal** (yang memenuhi prerequisite utama) diserap ke dalam job T2 — tidak tampil sebagai card terpisah
     - Job T1 yang **di-include** menjadi sub-skill dari job T2 (masuk ke slot showcase)
     - Job T1 yang **tidak di-include** tetap tampil sebagai standalone card
- **Outcome:** Showcase mencerminkan identitas user dengan hierarki yang jelas
- **Covered by:** R5, R6, R7, R8, R9

### F3. Melihat Qualification (sebelumnya "Job Change")

- **Trigger:** User ingin tahu SOP/standar yang harus dimiliki di sebuah job
- **Steps:**
  1. Di card manapun (termasuk T1), ada tombol **"Qualification"**
  2. Klik → muncul quest modal (sistem quest yang sudah ada)
- **Outcome:** User tahu roadmap skill apa yang dianggap standar untuk job tersebut
- **Covered by:** R10

---

## Requirements

### Unlock & Visibility

- **R1.** Pada awal, hanya job T0 dan semua job T1 yang tampil di card grid
- **R2.** Job T2 suatu group muncul (dari locked/hidden) ketika user memiliki ≥2 skill aktif (level ≥1) di minimal satu job T1 dalam group yang sama
- **R3.** Job T3 muncul ketika user memiliki ≥2 skill aktif di job T2 yang relevan dalam group yang sama
- **R4.** Threshold ≥2 skill diterapkan per group/career path — skill di group yang berbeda tidak cross-count (kecuali job yang memang lintas group, perlu didefinisikan saat planning)

### Job Change

- **R5.** Tombol "Job Change" hanya muncul di card job T2/T3 yang sudah unlocked (visible)
- **R6.** Panel Job Change menampilkan daftar job T1 yang eligible untuk di-include: job yang punya minimal 1 skill aktif dan berada di group yang sama atau adjacent
- **R7.** User boleh tidak memilih include manapun — Job Change tetap bisa dilakukan
- **R8.** Setelah Job Change dikonfirmasi:
  - Job T1 "asal" (yang paling memenuhi prerequisite) tidak lagi tampil sebagai card terpisah — posisinya diserap ke dalam card T2
  - Job T1 yang di-include tampil sebagai sub-skill di dalam card T2 (menggunakan slot showcase yang sudah ada)
  - Job T1 yang tidak di-include tetap tampil sebagai standalone card
- **R9.** State Job Change disimpan di localStorage (terpisah dari progress skill) — setelah browser ditutup, posisi job tetap dipertahankan

### Qualification (rename)

- **R10.** Tombol yang sekarang bernama "Job Change" di card (yang membuka quest modal) diganti namanya menjadi **"Qualification"** — fungsionalitas quest tidak berubah

### Backward Compatibility

- **R11.** User yang sudah punya skill progress sebelum fitur ini ditambahkan tetap bisa melanjutkan — unlock dihitung dari skill yang sudah ada
- **R12.** User yang sudah ada di posisi T2/T3 di dunia nyata bisa langsung mengisi skill di job T2/T3 (karena job T1 akan terbuka dulu, dan dengan 2+ skill di T1 maka T2 langsung terbuka)

---

## Career Path Map (Prerequisite Reference)

Relasi T1→T2→T3 per group (untuk mendefinisikan "group yang sama"):

| Group | T1 | T2 | T3 |
|-------|----|----|-----|
| Software | Frontend, Backend, Mobile | Fullstack | Tech Lead |
| QA | Manual QA | QA Automation, Performance Tester | — |
| Data | Data Analyst | BI Developer, Data Engineer, Data Scientist | AI Engineer |
| Infra | SysAdmin, Network Eng | Cloud Eng, DevOps, DBA | SRE |
| Security | SOC Analyst | Security Eng, Pentester, GRC, AppSec | AppSec Eng |
| Product | Business Analyst | Product Owner, Project Manager | Product Manager |
| Design | UI Designer | UX Designer | Product Designer |
| Support | Helpdesk | Technical Support, App Support | — |
| Leadership | — | — | Eng Manager, CTO, CISO |

Leadership group perlu keputusan terpisah saat planning — prerequisite-nya lintas group (misalnya Eng Manager butuh Tech Lead atau SRE, bukan job T1 yang sederhana).

---

## Acceptance Examples

- **AE1. Covers R1, R2.** User baru buka app dan belum punya skill apapun: hanya T0 dan T1 yang tampil. Fullstack, Tech Lead, AI Engineer tidak terlihat.

- **AE2. Covers R2, R5.** User sudah punya HTML Lv1 dan CSS Lv1 di Frontend Developer (2 skill aktif): card Fullstack muncul dengan tombol Job Change. Card Tech Lead belum muncul (butuh T2 dulu).

- **AE3. Covers R6, R7, R8.** User klik Job Change ke Fullstack, memilih include Backend Developer (yang punya 1 skill aktif). Setelah konfirmasi: Frontend Developer diserap (tidak tampil terpisah), Backend Developer tampil sebagai sub di card Fullstack. Mobile Developer (tidak di-include, tapi punya skill) tetap tampil standalone.

- **AE4. Covers R11, R12.** User B yang sudah berpengalaman langsung isi 2+ skill di Frontend → Fullstack terbuka → bisa langsung Job Change tanpa harus mulai dari IT Novice.

- **AE5. Covers R10.** Tombol di card Frontend Developer sekarang bertuliskan "Qualification", bukan "Job Change". Klik → quest modal terbuka seperti biasa.

---

## Success Criteria

- User A yang mulai dari awal bisa melihat jalur progressi mereka terbuka secara organik — tanpa perlu membaca dokumentasi
- User B yang datang dengan pengalaman bisa "claim" posisi mereka dalam ≤5 menit dengan mengisi skill yang sudah dimiliki
- Showcase setelah Job Change secara visual mencerminkan hierarki identitas user (job utama + sub-skill dari job asal)
- State Job Change tidak hilang setelah browser ditutup

---

## Scope Boundaries

- Tidak ada validasi lintas group yang ketat untuk include — user boleh include job dari group lain selama ada skill aktif di sana (sistem percaya user)
- Leadership group prerequisite-nya khusus — perlu keputusan tersendiri saat planning
- Tidak ada "undo Job Change" di scope ini — sekali Job Change dilakukan, state baru berlaku (bisa dibahas sebagai fitur terpisah)
- Tidak ada notifikasi/achievement khusus saat Job Change — murni state change dan tampilan
- Quest modal (Qualification) tidak berubah fungsionalitasnya sama sekali

---

## Key Decisions

- **≥2 skill sebagai threshold unlock:** Cukup konkret untuk dirasakan "ada usaha" tapi tidak terlalu tinggi untuk User B. Bisa direvisi saat planning jika dirasa terlalu mudah/sulit.
- **Job T1 "asal" diserap (tidak tampil terpisah):** Konsisten dengan intuisi karir — kalau kamu sudah jadi Fullstack, kamu tidak lagi "Frontend Developer". Identitasmu sudah naik tier.
- **Include opsional:** User tidak dipaksa declare origin — tapi kalau mereka mau, itu langsung terlihat di showcase sebagai sub-skill.
- **Rename "Job Change" → "Qualification":** Membebaskan nama "Job Change" untuk aksi yang lebih tepat secara semantik — evolusi ke tier lebih tinggi.
- **Relasi ke slot showcase:** Job Change dengan include = otomatis mengisi slot showcase. Tidak perlu UI "Atur Slot" terpisah lagi — Job Change adalah cara alami untuk mengkonfigurasi slot.

---

## Dependencies / Assumptions

- Data relasi T1→T2→T3 per group perlu direpresentasikan sebagai struktur data baru di `index.html` (sekarang belum ada prerequisite map)
- Slot showcase yang sudah dibangun (key `itjt_slots_v1`) bisa digunakan atau diintegrasikan dengan state Job Change — perlu diselaraskan saat planning
- Job Change state perlu localStorage key baru (misal `itjt_jobchange_v1`) — format perlu ditetapkan saat planning

---

## Outstanding Questions

### Deferred to Planning

- [Affects R4][Technical] Format data prerequisite map T1→T2: array of objects? map by group? perlu ditetapkan agar tidak collision dengan data yang ada
- [Affects R8][Design] Tampilan card yang "diserap" — apakah card T1 hilang total, atau tetap ada tapi dengan visual "archived/merged"?
- [Affects R9][Technical] Apakah state Job Change menggantikan slot showcase yang sudah ada, atau keduanya coexist?
- [Affects Leadership][Content] Prerequisite untuk Eng Manager, CTO, CISO — perlu keputusan editorial sebelum implementasi
- [Affects R2][Content] Apakah IT Novice (T0) juga berfungsi sebagai prerequisite untuk T1, atau T1 selalu langsung terbuka?
