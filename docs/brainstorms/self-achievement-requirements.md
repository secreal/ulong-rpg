---
date: 2026-05-13
topic: self-achievement
---

# Self-Achievement System

## Summary

Menambahkan sistem achievement yang di-generate otomatis dari aktivitas player sendiri di dalam app — quest completion, skill mastery, Job Change milestone, dan konsistensi belajar — ditampilkan sebagai sub-section baru di dalam tab Achievement yang sudah ada, dengan tiga mode view, tier Bronze/Silver/Gold, dan tanggal earned. Achievement ini bisa di-screenshot untuk keperluan HR dan masuk ke dalam export `/ulong`.

---

## Problem Frame

Tab Achievement saat ini hanya menampung portfolio links eksternal yang diisi manual oleh player. Tidak ada bukti yang di-generate oleh sistem sendiri — artinya player yang sudah belajar konsisten, menyelesaikan banyak quest, atau naik tier tidak punya "receipt" digital yang bisa mereka tunjukkan. HR yang melihat profil player tidak bisa membedakan antara player yang beneran sudah kerja keras dengan yang baru buka app kemarin.

Self-achievement mengisi celah ini: bukti yang lahir dari aktivitas nyata di dalam app, bukan klaim manual.

---

## Key Flows

- F1. **Achievement di-trigger saat progress berubah**
  - **Trigger:** Player menyelesaikan quest, menaikkan skill, atau melakukan Job Change
  - **Actors:** Player (pasif — tidak ada aksi khusus)
  - **Steps:** Sistem evaluasi kondisi achievement setelah setiap perubahan progress → jika kondisi terpenuhi dan achievement belum diraih → achievement di-unlock dengan timestamp sekarang → badge/angka di tab Achievement diperbarui
  - **Outcome:** Achievement muncul di list dengan tanggal earned, badge diperbarui
  - **Covered by:** R1, R2, R3, R6

- F2. **Player melihat achievement list untuk screenshot HR**
  - **Trigger:** Player membuka tab Achievement di detail job card
  - **Actors:** Player
  - **Steps:** Sub-section self-achievement muncul di atas portfolio links → player bisa berpindah antara view badge+angka dan list view → list menampilkan semua achievement dengan nama, tier, dan tanggal → player screenshot tampilan list
  - **Outcome:** Player mendapat bukti visual yang siap ditunjukkan ke HR
  - **Covered by:** R7, R8, R9, R10

- F3. **Achievement masuk ke export /ulong**
  - **Trigger:** Player menjalankan export /ulong
  - **Actors:** Player
  - **Steps:** Export membaca self-achievements dari localStorage per job → achievements dirender di bagian Achievement halaman showcase, di atas portfolio links
  - **Outcome:** Halaman showcase /ulong memuat self-achievements dengan tier dan tanggal
  - **Covered by:** R11

---

## Requirements

**Trigger dan evaluasi achievement**

- R1. Sistem mengevaluasi kondisi achievement setiap kali ada perubahan progress (skill toggle, quest complete, job change confirm)
- R2. Achievement di-unlock otomatis — tidak perlu aksi manual dari player
- R3. Setiap achievement menyimpan timestamp (tanggal earned) saat pertama di-unlock
- R4. Achievement yang sudah diraih tidak di-unlock ulang atau timestamp-nya tidak berubah jika kondisi terpenuhi lagi

**Definisi achievement dan tier**

- R5. Empat kategori achievement, masing-masing dengan tier Bronze/Silver/Gold:

  | Kategori | Bronze | Silver | Gold |
  |---|---|---|---|
  | Quest Completion | 25% quest satu job selesai | 50% | 100% |
  | Skill Mastery | 25% skill satu job di-level-up | 50% | 100% |
  | Job Change | Melakukan Job Change pertama | Job Change ke T2 | Job Change ke T3 |
  | Learning Days | 10 total hari quest pernah diselesaikan | 30 hari | 100 hari |

- R6. Learning Days dihitung sebagai total hari unik yang pernah ada daily quest selesai — tidak pernah reset, bukan streak klasik

**Tampilan — tiga view mode dalam sub-section**

- R7. Sub-section self-achievement tampil di atas portfolio links dalam tab Achievement, dipisahkan dengan header label (contoh: "Achievements")
- R8. **View 1 — Badge + Angka:** satu badge representatif per kategori (badge tertinggi yang sudah diraih), plus angka-angka statistik ringkas (misal: "42 learning days", "8/12 quest selesai")
- R9. **View 2 — List:** daftar semua achievement yang sudah diraih, tiap item menampilkan nama achievement, tier (Bronze/Silver/Gold), dan tanggal earned; layout ini dirancang untuk di-screenshot
- R10. **View 3 — Detail:** klik satu item di list membuka detail achievement — deskripsi achievement, kondisi yang harus dipenuhi, dan tanggal earned
- R11. Ketiga view hanya untuk self-achievements; portfolio links eksternal tetap terpisah di bawahnya dan behavior-nya tidak berubah

**Export dan bukti eksternal**

- R12. Self-achievements ikut ter-export ke halaman showcase `/ulong` — tampil di bagian Achievement dengan tier dan tanggal, di atas portfolio links

**Visual badge**

- R13. Tiap tier punya visual yang berbeda: Bronze = warna coklat/tembaga, Silver = abu-abu metalik, Gold = kuning emas
- R14. Badge menggunakan icon yang berbeda per kategori achievement (quest, mastery, job change, learning days)

---

## Acceptance Examples

- AE1. **Covers R1, R2, R3.** Diberikan player yang baru menyelesaikan quest ke-3 dari 12 quest total untuk job "Frontend Developer" (25%), ketika quest di-submit, achievement "Quest Completion — Bronze" untuk job itu langsung muncul di sub-section self-achievement dengan tanggal hari ini.

- AE2. **Covers R4.** Diberikan player yang sudah punya "Quest Completion — Bronze" sejak Maret, ketika player menyelesaikan lebih banyak quest tapi belum mencapai 50%, achievement Bronze tetap ada dengan tanggal Maret — tidak ada perubahan.

- AE3. **Covers R5, R6.** Diberikan player yang sudah menyelesaikan daily quest selama 35 hari unik berbeda (tidak berurutan), sistem menghitung 35 hari dan meng-unlock "Learning Days — Silver" (threshold 30 hari).

- AE4. **Covers R8, R9.** Diberikan player yang membuka tab Achievement untuk job "Backend Developer", sub-section menampilkan badge Gold untuk Skill Mastery (semua skill sudah di-level-up) dan badge Bronze untuk Quest Completion (baru 25%); ketika player berpindah ke List view, semua achievement yang sudah diraih tampil dengan nama, tier, dan tanggal dalam satu list yang bisa di-screenshot.

- AE5. **Covers R12.** Diberikan player yang menjalankan export `/ulong`, halaman showcase yang dihasilkan memuat section Achievement per job yang menampilkan self-achievements (nama, tier, tanggal) di atas portfolio links.

---

## Success Criteria

- Player bisa menunjukkan achievement list ke HR sebagai bukti learning journey — ada nama achievement, tier, dan tanggal yang konkret
- Achievement muncul tanpa aksi manual — player yang aktif belajar langsung mendapat achievements tanpa perlu tahu ada sistem ini
- Achievement masuk ke export `/ulong` dan konsisten dengan tampilan di app
- Tidak ada achievement yang bisa di-manipulasi dengan gampang lewat edit manual localStorage tanpa merusak integrity data lain

---

## Scope Boundaries

- Tidak ada enkripsi localStorage untuk achievement data — tanggal earned sudah cukup sebagai sinyal integritas untuk konteks HR informal
- Tidak ada achievement lintas-job (misalnya "raih 5 job sekaligus") — semua achievement scoped per job
- Tidak ada share langsung ke social media dari dalam app
- Tidak ada leaderboard atau perbandingan antar player
- Learning Days dihitung global (lintas semua job), bukan per job — satu angka untuk keseluruhan aktivitas player
- Streak klasik (reset jika skip) tidak digunakan — hanya total hari unik

---

## Key Decisions

- **Learning Days sebagai cumulative, bukan streak:** Player memilih ini — streak klasik dianggap terlalu punishing dan tidak mencerminkan journey belajar yang realistis
- **Tier Bronze/Silver/Gold:** Memberikan milestone lebih awal (25%, 50%) agar player mendapat reward bahkan sebelum menyelesaikan 100%, mendorong progress bertahap
- **Sub-section dalam tab Achievement yang sudah ada:** Menghindari nambah tab baru di detail modal; self-achievements dan portfolio links tetap satu konteks tapi terpisah secara visual
- **Badge tertinggi yang diraih sebagai representasi di View 1:** Menyederhanakan tampilan ringkas — player langsung lihat pencapaian terbaik mereka per kategori

---

## Dependencies / Assumptions

- Sistem daily quest sudah ada dan menyimpan data tanggal di `questProgress.daily` — Learning Days membaca dari sini
- Export `/ulong` sudah ada (`docs/brainstorms/ulong-export-requirements.md`) — self-achievements perlu diintegrasikan ke dalamnya sebagai extension
- `questProgress` dan `progress` di localStorage sudah cukup untuk menghitung semua trigger achievement — tidak perlu storage baru, hanya storage achievement hasil evaluasi

---

## Outstanding Questions

### Deferred to Planning

- [Affects R5][Needs research] Bagaimana threshold Quest Completion 25%/50%/100% dihitung — berdasarkan total quest yang tersedia di `data/target-quests/` untuk job itu, atau berdasarkan quest yang sudah ter-author oleh Codex? Jika belum semua ter-author, denominator bisa misleading
- [Affects R8][Technical] View switching (Badge+Angka ↔ List ↔ Detail) — apakah pakai tab mini dalam sub-section, atau klik untuk expand/collapse?
- [Affects R14][Technical] Icon per kategori achievement — apakah menggunakan Lucide icons yang sudah di-load untuk tab lain, atau icon baru?
