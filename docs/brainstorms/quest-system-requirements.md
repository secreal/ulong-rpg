---
date: 2026-05-13
topic: quest-system
---

# Quest System — Item-Embedded Quest Model

## Summary

Quest tidak lagi terikat ke job, melainkan embedded di tiap item (skill, equip, talent). Setiap item punya 9 quest (3 per level × 3 level) untuk main quest, dan 1 quest pengenalan untuk daily quest. Main quest player dihasilkan dari item yang belum Lv3, diurutkan skill → equip → talent. Daily quest mengaktifkan item baru dari Lv0 ke Lv1 dengan menyelesaikan quest pengenalannya.

**Pembagian kerja:**
- **Codex** — authoring data quest per item (isi quest, link, schema), migrasi skill dari CSV inline ke struktur data per skill
- **Claude** — implementasi UI quest tab di modal: rendering quest card, flow Accept → Submit, state progress, daily picker

---

## Problem Frame

Model authored-chain per job tidak skalabel dan tidak mencerminkan progress player nyata. Quest bisa tidak relevan jika item sudah Lv3 atau belum aktif. Dengan quest embedded di item, setiap skill/equip/talent membawa jalur belajarnya sendiri — sehingga quest selalu relevan, authoring bisa dilakukan per item secara independen, dan sistem tidak perlu tahu tentang job untuk menentukan quest apa yang aktif.

---

## Requirements

**Struktur quest per item** *(data — Codex)*

- R1. Setiap skill, equip, dan talent memiliki quest yang embedded langsung di data item tersebut — bukan di file quest per job.
- R2. Setiap item memiliki tepat 3 quest untuk naik ke Lv1, 3 quest untuk naik ke Lv2, dan 3 quest untuk naik ke Lv3 (total 9 quest per item untuk main progression).
- R3. Setiap item memiliki tepat 1 quest pengenalan yang digunakan untuk daily quest (quest yang mengaktifkan item dari Lv0 ke Lv1).
- R4. Quest di setiap level menggambarkan cara belajar atau praktik yang relevan untuk item tersebut di kedalaman level itu — Lv1 untuk dasar, Lv2 untuk praktik terapan, Lv3 untuk mahir/proyek nyata.
- R5. Setiap quest memiliki: judul singkat, deskripsi tugas, dan satu atau lebih link sumber.

**Skill data migration** *(data — Codex)*

- R6. Skill per job saat ini tersimpan sebagai CSV inline di `index.html` — perlu dipindahkan ke struktur data terpisah yang bisa menyimpan quest per skill per level.
- R7. Hasil migrasi skill harus tetap kompatibel dengan cara `index.html` merender skill list dan skill progress di localStorage (`skill::name`).

**Main quest — progress-driven** *(UI — Claude)*

- R8. Main quest dihasilkan otomatis dari progress player — tidak ada authored chain di level job.
- R9. Untuk naik dari Lv-N ke Lv-(N+1), player harus menyelesaikan semua 3 quest di level N tersebut.
- R10. Quest dalam satu level bisa dikerjakan dalam urutan bebas — tidak harus berurutan.
- R11. Urutan antar item mengikuti tiga fase: (1) semua skill job yang belum Lv3, (2) semua equip relevan yang belum Lv3, (3) semua talent relevan yang belum Lv3.
- R12. Dalam satu fase, item dengan level terendah diprioritaskan; item level sama diurutkan alfabetis.
- R13. Setelah semua item tiga fase mencapai Lv3, main quest masuk fase konfirmasi — menampilkan pencapaian, bukan tugas baru.
- R14. Menyelesaikan satu quest memerlukan: klik Accept Quest → tulis summary → Submit Quest.

**Daily quest — aktivasi item baru** *(UI — Claude)*

- R15. Daily quest bertugas mengaktifkan satu item dari Lv0 ke Lv1 dengan menyelesaikan 1 quest pengenalannya.
- R16. Quest pengenalan adalah satu quest khusus per item yang dirancang untuk perkenalan pertama — lebih ringan dari 3 quest Lv1 main progression.
- R17. Player memilih sendiri item mana yang ingin diaktifkan hari ini dari daftar item Lv0 yang tersedia.
- R18. Setelah quest pengenalan selesai, item naik ke Lv1 dan otomatis masuk antrian main quest.
- R19. Hanya satu daily quest per job per hari — setelah selesai, cooldown sampai hari berikutnya.
- R20. Jika tidak ada item Lv0 tersisa, daily quest menampilkan pesan kosong.

**Scope item per job** *(UI — Claude)*

- R21. Item yang relevan untuk suatu job difilter berdasarkan `tags` yang sudah ada di equipment.json dan talents.json — tidak ada daftar item baru per job.
- R22. Skill quest hanya muncul di quest tab job yang bersangkutan.

**Fallback** *(UI — Claude)*

- R23. Jika item belum memiliki quest data (field belum diisi Codex), quest card tetap ditampilkan dengan nama item + description yang ada, tanpa link — tidak error.

---

## Acceptance Examples

- AE1. **Covers R2, R9, R10.** Diberikan player sedang mengerjakan "API design" Lv1, tiga quest tersedia (boleh dikerjakan urutan apapun). Setelah ketiga selesai dengan summary, item naik ke Lv2 dan tiga quest berikutnya terbuka.

- AE2. **Covers R15, R16, R17, R18.** Diberikan item "Docker" masih Lv0, player buka daily quest dan pilih Docker. Quest pengenalan muncul, player selesaikan dan tulis summary. Docker naik ke Lv1 dan muncul di antrian main quest fase equip.

- AE3. **Covers R11, R12.** Diberikan job Backend Developer, skill "access control" Lv1 dan "API design" Lv0 aktif, main quest aktif adalah "access control" (Lv1 lebih rendah dari Lv3 target, dan skill fase duluan). "API design" Lv0 tidak masuk main quest sampai diaktifkan via daily.

- AE4. **Covers R13.** Diberikan semua skill, equip, talent job sudah Lv3, main quest masuk fase konfirmasi menampilkan daftar pencapaian dengan opsi tulis refleksi.

- AE5. **Covers R23.** Diberikan equip "Vercel" belum ada quest data-nya (Codex belum isi), quest card tetap tampil dengan nama dan description yang ada — tidak blank error.

---

## Success Criteria

- Quest selalu relevan — tidak pernah menampilkan quest untuk item yang sudah Lv3 atau belum diaktifkan.
- Authoring quest (Codex) tidak memerlukan koordinasi antar job — cukup isi data di item yang bersangkutan.
- Daily quest memberi aksi konkret setiap hari: pilih satu item baru, kenalkan, naik ke Lv1.
- Claude bisa implementasi UI quest rendering segera setelah schema data disepakati, tanpa menunggu semua quest selesai di-author.

---

## Scope Boundaries

- File quest per job (`data/quests/*.json`) dengan authored chain tidak digunakan lagi — diarsipkan setelah migrasi.
- Perguruan Ulong (IT Novice main quest) tetap di luar sistem ini — IT Novice tidak dapat main quest dari model baru, daily quest tetap berlaku.
- Sistem tidak menghasilkan quest atau link secara otomatis — semua authored oleh Codex.
- Mission tab di luar scope.
- Achievement tidak dipengaruhi perubahan ini.

---

## Key Decisions

- **Quest embedded di item, bukan per job:** Satu item seperti "Git" punya quest yang sama apapun job yang memakainya — tidak perlu duplikasi authoring per job.
- **3 quest wajib per level:** Tiga quest memberi variasi sudut pandang (teori, praktik, proyek nyata) tanpa terlalu berat. Semua wajib agar level naik bermakna.
- **1 quest pengenalan per item untuk daily:** Daily quest bukan kursus — cukup satu tugas ringan untuk memperkenalkan item sebelum player komitmen ke 9 quest main progression-nya.
- **Player pilih sendiri daily quest-nya:** Memberi agency — player tahu mana yang paling relevan untuk konteks kerja mereka hari ini.
- **Urutan skill → equip → talent:** Skill adalah kompetensi inti, equip adalah alat, talent adalah spesialisasi. Urutan ini mencerminkan prioritas belajar yang logis.
- **Claude implementasi UI, Codex isi data:** Keduanya bisa berjalan paralel setelah schema disepakati — Claude tidak perlu menunggu semua data selesai, cukup fallback R23 untuk item yang belum diisi.

---

## Dependencies / Assumptions

- `data/equipment.json` dan `data/talents.json` sudah ada — Codex menambahkan field quest ke struktur yang ada.
- Skill per job saat ini inline sebagai CSV di `index.html` — Codex memindahkan ke struktur data per skill dengan field quest sebagai prerequisite.
- Progress item (level) sudah di localStorage dengan key `skill::name`, `equip::id`, `talent::id` — Claude memakai ini sebagai input quest generation tanpa perubahan.
- Filter equip/talent per job sudah berdasarkan `tags` — Claude ikut filter yang sama untuk scope quest per job.
- Schema field quest di item (struktur `lv1`, `lv2`, `lv3`, `intro`) disepakati Codex dan Claude sebelum implementasi dimulai.

---

## Outstanding Questions

### Resolve Before Planning

- [Affects R2, R3, R6][Codex + Claude] Schema field quest di item perlu disepakati dulu sebelum Codex mulai authoring dan Claude mulai rendering — apakah `quests: { lv1: [...], lv2: [...], lv3: [...], intro: {...} }` atau bentuk lain?

### Deferred to Planning

- [Affects R9, R14][Claude — Technical] State "quest mana yang sudah selesai" per item per level disimpan di mana di localStorage — key format dan struktur ditentukan saat planning Claude.
- [Affects R17][Claude — UX] Bagaimana player memilih item daily quest — list scrollable, search, atau difilter by kategori.
- [Affects R7][Codex — Technical] Cara pindahkan skill dari CSV inline ke struktur data per skill tanpa merusak rendering dan localStorage yang sudah ada.
