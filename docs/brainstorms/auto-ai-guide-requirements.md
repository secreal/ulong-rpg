---
date: 2026-05-10
topic: auto-ai-guide
---

# AUTO — AI Quest Guide

## Summary

Menambahkan fitur "AUTO" di kanan atas ulong RPG: user memilih AI CLI mereka, lalu meng-copy prompt siap pakai yang berisi progress mereka dan instruksi untuk AI agar membuka ulong RPG dan menjadi quest guide mereka.

---

## Problem Frame

Player ulong RPG tahu skill apa yang harus di-level-up, tapi tidak selalu tahu *bagaimana* menyelesaikannya — quest-nya konkret (build project, buat dokumentasi, daftar freelance) tapi butuh guidance langkah demi langkah. Sementara itu, AI CLI lokal (Claude, Codex, dll) sudah sangat capable untuk jadi mentor teknis, tapi tidak tahu konteks progress player.

Jembatan antara keduanya belum ada: player harus secara manual menjelaskan posisi mereka ke AI setiap kali ingin minta bantuan, dan AI tidak tahu quest mana yang relevan untuk dilakukan selanjutnya.

---

## Actors

- A1. **Player** — developer yang menggunakan ulong RPG dan ingin dibantu AI menyelesaikan quest
- A2. **AI CLI** — Claude, Codex, Gemini, Copilot, atau Other; dijalankan secara lokal oleh player

---

## Key Flows

- F1. **Setup dan Copy Prompt**
  - **Trigger:** Player menekan tombol AUTO di kanan atas
  - **Actors:** A1
  - **Steps:**
    1. Panel AUTO terbuka — menampilkan pilihan AI CLI (Claude, Codex, Gemini, Copilot, Other)
    2. Player memilih AI CLI yang mereka gunakan
    3. Player menekan tombol "Copy to [AI CLI]"
    4. Prompt siap pakai di-copy ke clipboard
    5. Tombol menampilkan feedback "Copied!" sementara
  - **Outcome:** Player memiliki prompt lengkap di clipboard, siap di-paste ke AI CLI mereka
  - **Covered by:** R1, R2, R3, R4, R5

- F2. **AI Guide Sesi**
  - **Trigger:** Player paste prompt ke AI CLI lokal mereka
  - **Actors:** A1, A2
  - **Steps:**
    1. AI CLI menerima prompt berisi progress player dan instruksi
    2. AI membuka `https://secreal.github.io/ulong-rpg/` untuk memeriksa quest yang tersedia
    3. AI mencocokkan quest yang belum selesai dengan progress player
    4. AI memandu player step by step sesuai instruksi yang diberikan player ke AI-nya
  - **Outcome:** Player mendapat guidance konkret untuk menyelesaikan quest berikutnya
  - **Covered by:** R3, R6

---

## Requirements

**Panel AUTO**
- R1. Ada elemen "AUTO" di kanan atas halaman, terlihat jelas dan konsisten dengan estetika game ulong RPG
- R2. Panel AUTO menampilkan pilihan AI CLI: Claude, Codex, Gemini, Copilot, dan Other
- R3. Ada tombol copy yang men-copy prompt siap pakai ke clipboard
- R4. Setelah copy berhasil, tombol menampilkan feedback visual sementara (misalnya teks berubah jadi "Copied!")
- R5. Pilihan AI CLI yang dipilih dipertahankan di localStorage sehingga tidak perlu dipilih ulang setiap sesi

**Prompt yang di-copy**
- R6. Prompt yang di-copy adalah fully-formed — berisi progress player saat ini (skill levels dan quest completion) dan instruksi untuk AI agar membuka `https://secreal.github.io/ulong-rpg/`, memeriksa quest yang relevan, dan memandu player
- R7. Prompt ditulis dalam bahasa Inggris agar kompatibel dengan semua AI CLI
- R8. Konten prompt identik antar semua pilihan AI CLI — pilihan CLI tidak mengubah isi prompt secara substansial

---

## Acceptance Examples

- AE1. **Covers R6.** Diberikan player dengan Frontend Developer skill HTML di level 2 dan quest fe-1 sudah selesai, prompt yang di-copy menyertakan informasi tersebut secara akurat sehingga AI tidak perlu bertanya ulang tentang progress.
- AE2. **Covers R4.** Ketika tombol copy ditekan, teks tombol berubah menjadi "Copied!" selama ~2 detik lalu kembali ke semula — bahkan jika player menekannya berulang kali.
- AE3. **Covers R5.** Player memilih "Claude" pada sesi pertama; saat membuka ulong RPG keesokan harinya, pilihan "Claude" masih terpilih tanpa perlu memilih ulang.

---

## Success Criteria

- Player dapat paste prompt ke AI CLI mereka dan AI langsung mengerti konteks tanpa player perlu menjelaskan ulang posisi mereka
- Prompt yang di-copy akurat mencerminkan state progress terkini di localStorage pada saat tombol ditekan
- Fitur AUTO terasa native dalam estetika ulong RPG, bukan seperti widget yang ditempelkan

---

## Scope Boundaries

- ulong RPG tidak tahu apakah AI berhasil membantu atau tidak — tidak ada feedback loop dari AI kembali ke ulong RPG
- Tidak ada integrasi API ke AI CLI manapun — murni copy-paste manual oleh player
- Pilihan "Other" tidak meminta user mengetik nama AI — cukup sebagai fallback generik
- Tidak ada auto-update progress dari hasil sesi AI ke ulong RPG
- Konten prompt tidak disesuaikan per AI CLI (formatting khusus per CLI tidak termasuk scope ini)

---

## Key Decisions

- **Prompt fully-formed:** Dipilih karena player tidak boleh harus tahu cara "ngomong ke AI" — value-nya adalah zero-friction, langsung paste dan AI sudah paham
- **Pilihan CLI tersimpan di localStorage:** Low-cost, high-convenience — player biasanya pakai satu CLI yang sama terus
- **Bahasa Inggris untuk prompt:** AI CLI lebih reliable dalam bahasa Inggris; konten ulong RPG bisa tetap bahasa Indonesia tapi prompt ke AI dalam bahasa Inggris

---

## Dependencies / Assumptions

- URL `https://secreal.github.io/ulong-rpg/` harus live dan accessible — prompt mengarahkan AI ke URL ini
- AI CLI yang dipilih player harus support web browsing / URL fetching agar bisa membuka website ulong RPG; jika tidak, AI hanya bisa berdasarkan progress yang di-copy saja
- Progress yang digunakan adalah state localStorage pada saat tombol copy ditekan

---

## Outstanding Questions

### Deferred to Planning

- [Affects R6][Technical] Format exact prompt — seberapa panjang, apakah progress di-serialize sebagai JSON atau deskripsi natural language, dan apakah ada batasan panjang yang perlu dipertimbangkan untuk CLI tertentu
- [Affects R1][Technical] Apakah panel AUTO adalah dropdown/popover, panel geser, atau modal kecil — perlu disesuaikan dengan layout header yang sudah ada
