---
date: 2026-05-10
topic: character-differentiation
---

# Character Differentiation — Unique Face, Body & Pose per Job with Career Path Inheritance

## Summary

Setiap job card memiliki karakter sprite yang benar-benar unik: bentuk kepala, ekspresi mata, gaya rambut, proporsi badan, dan pose berbeda per job. Di dalam satu career path (grup yang sama), job tier lebih tinggi mewarisi elemen visual dari tier di bawahnya — seperti evolusi Pokémon — sehingga ada kesinambungan yang bisa dikenali antar tier.

---

## Problem Frame

Saat ini semua 37 karakter sprite terlihat identik kecuali warna rambut (`--hair`), warna badan (`--role`), dan jenis weapon (`tool`). Wajah, proporsi badan, dan pose persis sama untuk semua job. Ini membuat karakter terasa seperti template yang di-reskin, bukan karakter yang punya identitas sendiri.

---

## Requirements

**Variasi Wajah**
- R1. Setiap job memiliki bentuk kepala yang berbeda: variasi pada `border-radius`, lebar, dan tinggi elemen `.head`
- R2. Setiap job memiliki ekspresi mata yang berbeda: variasi pada ukuran, spacing, dan bentuk elemen `.eye`
- R3. Setiap job memiliki gaya rambut yang berbeda: variasi pada shape, ukuran, dan elemen `::after` pada `.hair` — bukan hanya warna
- R4. Variasi wajah (R1–R3) dicapai via CSS properties unik per job, tanpa aset gambar eksternal

**Variasi Badan & Pose**
- R5. Setiap job memiliki proporsi badan yang berbeda: variasi pada ukuran dan border-radius elemen `.body`
- R6. Setiap job memiliki pose yang berbeda: variasi pada `transform: rotate()` elemen `.arm` (kiri/kanan) dan posisi offset `.leg`
- R7. Variasi badan dan pose (R5–R6) dicapai via CSS properties unik per job

**Aksesori Signature**
- R8. Beberapa job memiliki aksesori signature khas profesi sebagai HTML element tambahan di dalam `.sprite`: contoh kacamata untuk Data Scientist, headset untuk SOC Analyst, badge/epaulette untuk Leadership
- R9. Aksesori adalah pure CSS (::before/::after atau div kecil), tidak ada aset gambar atau emoji
- R10. Aksesori bersifat opsional per job — tidak semua job perlu aksesori, cukup yang punya "ciri profesi" yang kuat

**Career Path Inheritance (Evolusi)**
- R11. Job dalam grup yang sama (Software, QA, Data, Infra, Security, Product, Design, Support, Leadership) memiliki kesinambungan visual yang bisa dikenali
- R12. Tier lebih tinggi mewarisi 1–2 elemen visual khas dari tier di bawahnya, lalu menambahkan atau memperkuatnya — bukan mengganti sepenuhnya
- R13. Contoh konkret: Frontend Developer (T1) pakai brush + rambut pendek spiked; Tech Lead (T3) masih ada trace gaya rambut serupa tapi proporsi lebih besar, badan lebih lebar, dan tambahan armor/badge
- R14. IT Novice (T0, Base) adalah titik awal paling netral — desain paling polos, menjadi referensi sebelum evolusi pertama

**Konsistensi dengan Fitur yang Ada**
- R15. Showcase HTML yang di-generate via export juga mencerminkan perubahan ini — CSS sprite karakter ada di dalam generated HTML, jadi harus diupdate juga
- R16. Semua perubahan tetap di dalam `index.html` saja — tidak ada file baru
- R17. Progress localStorage (skill level, quest) tidak terpengaruh

---

## Scope Boundaries

- Tidak ada animasi atau sprite yang bergerak
- Tidak ada variasi skin tone per job — warna kulit tetap uniform
- Tidak ada aset gambar atau SVG eksternal — pure CSS + HTML element sederhana
- Tidak ada perbedaan karakter berdasarkan progress user — tampilan karakter adalah identitas job, bukan state player
- Perubahan per-job adalah editorial content yang harus didefinisikan untuk semua 37 job

---

## Career Path Map (untuk referensi implementasi)

| Grup | T0 | T1 | T2 | T3 | T4 |
|------|----|----|----|----|-----|
| Base | IT Novice | — | — | — | — |
| Software | — | Frontend, Backend, Mobile | Fullstack | Tech Lead | — |
| QA | — | Manual QA | QA Automation, Performance Tester | — | — |
| Data | — | Data Analyst | BI Developer, Data Engineer, Data Scientist | AI Engineer | — |
| Infra | — | SysAdmin, Network Eng | Cloud Eng, DevOps, DBA | SRE | — |
| Security | — | SOC Analyst | Security Eng, Pentester, GRC, AppSec | AppSec Eng | — |
| Product | — | Business Analyst | Product Owner, Project Manager | Product Manager | — |
| Design | — | UI Designer | UX Designer | Product Designer | — |
| Support | — | Helpdesk | Technical Support, App Support | — | — |
| Leadership | — | — | — | Eng Manager | CTO, CISO |

---

## Acceptance Examples

- AE1. **Covers R1–R3, R11–R12.** Frontend Developer (T1) dan Tech Lead (T3) terlihat "satu keluarga" — ada elemen rambut atau facial yang mirip, tapi Tech Lead terlihat lebih imposing (badan lebih lebar, pose lebih tegap, tambahan detail)
- AE2. **Covers R8–R9.** Data Scientist memiliki elemen kacamata kecil pure CSS yang tidak muncul di job lain
- AE3. **Covers R15.** Export showcase menampilkan karakter dengan semua variasi unik, bukan karakter template yang sama
- AE4. **Covers R14.** IT Novice (T0) tampak paling "polos" — rambut sederhana, pose netral, tanpa aksesori — sebagai starting point evolusi semua grup

---

## Key Decisions

- **CSS properties per job untuk baseline, HTML element untuk aksesori:** CSS properties (border-radius variasi, arm rotation, eye offset) cukup untuk face/body/pose differentiation. Element tambahan (kacamata, headset, badge) lebih ekspresif untuk signature aksesori dan diwarisi/dikembangkan di tier atas.
- **Inheritance via elemen yang diwarisi, bukan direplikasi:** Tier atas tidak copy-paste desain tier bawah — mereka mewarisi 1–2 elemen khas (rambut shape, accessories) lalu menambah detail baru (badan lebih lebar, badge lebih besar)
- **37 job perlu didesain satu per satu:** Ini adalah keputusan editorial — tidak ada "generate otomatis". Planning perlu menetapkan spesifikasi visual per job sebelum implementasi CSS

---

## Dependencies / Assumptions

- Spesifikasi visual per-job (head shape, eye style, hair style, pose, aksesori) harus ditetapkan selama perencanaan implementasi — bukan di-generate dari data yang ada
- Showcase export HTML sudah ada (`generateShowcaseHTML()` di `index.html`) dan menyertakan CSS sprite — perlu diupdate bersamaan
- Visual theme overhaul (corner ornaments, weapons per job) sudah selesai — fitur ini additive di atasnya

---

## Sources & References

- File: `index.html` — CSS sprite (`.head`, `.hair`, `.eye`, `.body`, `.cape`, `.arm`, `.leg`, `.tool`) dan jobs data array (line 1635)
- Brainstorm referensi: `docs/brainstorms/visual-theme-requirements.md` (weapon per job sudah diimplementasi)
