---
date: 2026-05-13
topic: card-actions-rework
---

# Card Actions Rework — Quest/Equip/Talent/Achievement Tabs + Profile Header + Guild

## Summary

Rework tombol aksi di card job dari satu tombol "Qualification" menjadi 4 tombol ikon di body card: Quest, Daily, Equip, Talent, Achievement — masing-masing membuka satu modal bertab dan langsung aktif di tab yang sesuai. Mission diundur ke fase berikutnya. Bersamaan, profil user dan guild (tempat kerja) ditampilkan secara permanen di header, dan Find Guild dipindah menjadi satu tombol global.

---

## Problem Frame

Saat ini semua konten pembelajaran (checklist belajar, equipment, achievement, job hunting) disatukan dalam satu modal flat bernama "Qualification". Struktur ini tidak memberi user navigasi yang jelas ke bagian yang mereka butuhkan. Selain itu, profil user (nama, nick, github) hanya muncul saat modal Export dibuka — tidak ada identitas yang selalu terlihat di app. Guild (tempat kerja saat ini) sama sekali belum ada sebagai konsep.

---

## Actors

- A1. User ulong RPG — melihat progress, mengelola profil, guild, dan konten per job

---

## Key Flows

- F1. **Buka tab aksi dari card job**
  - **Trigger:** User klik salah satu dari 5 tombol di card (Quest, Equip, Talent, Achievement, Mission)
  - **Actors:** A1
  - **Steps:** Tombol diklik → modal terbuka dengan tab yang sesuai aktif → user berinteraksi dengan konten tab → tutup modal
  - **Outcome:** User melihat konten yang relevan tanpa harus scroll melalui konten lain
  - **Covered by:** R1, R2, R3

- F2. **Edit profil dari header**
  - **Trigger:** User klik chip profil di header
  - **Actors:** A1
  - **Steps:** Klik `[👤 ulong]` → popover/modal edit terbuka → user ubah nama/nick/github/guild → auto-save
  - **Outcome:** Perubahan tersimpan dan tercermin di header
  - **Covered by:** R4, R5, R6

- F3. **Find Guild**
  - **Trigger:** User klik tombol Find Guild di header
  - **Actors:** A1
  - **Steps:** Modal terbuka → user pilih job yang dicari → tampil link Glints/Indeed/LinkedIn untuk job tersebut
  - **Outcome:** User mendapat link pencarian lowongan yang relevan dengan job yang dipilih
  - **Covered by:** R7

---

## Requirements

**Tombol aksi di card**

- R1. Tombol "📋 Qualification" di card job dihapus dan footer card hanya menyisakan tombol Job Change
- R2. Di body card (antara skills dan footer) ditambahkan row ikon kecil: Quest · Daily · Equip · Talent · Achievement
- R3. Kelima tombol membuka **satu modal bertab** — tab yang diklik langsung aktif saat modal terbuka; user bisa pindah antar tab tanpa menutup modal
- R4. Mission diundur — tidak termasuk dalam implementasi ini
- R5. Konten tiap tab diload dari file eksternal (bukan hardcoded di index.html) — pemetaan file ke job/tab ditentukan saat planning
- R6. Tab yang tidak memiliki konten untuk job tersebut tetap bisa diklik tetapi menampilkan pesan kosong (bukan disembunyikan)
- R7. Modal Equipment dan Talent hanya menampilkan item yang relevan untuk job yang bersangkutan, difilter berdasarkan field `tags` di `data/equipment.json` dan `data/talents.json`

**Profil di header**

- R5. Profil user ditampilkan permanen di header sebagai chip ringkas: nama/nick yang sudah diisi, atau placeholder jika belum diisi
- R6. Klik chip profil membuka edit modal/popover dengan field: nama lengkap, nickname, github
- R7. Perubahan profil auto-save (tidak perlu tombol simpan terpisah)

**Guild (tempat kerja)**

- R8. Guild ditampilkan di header di samping chip profil: nama perusahaan + job title di sana
- R9. Data guild yang dicatat: nama perusahaan, job title, tanggal mulai, history guild sebelumnya
- R10. Hanya nama perusahaan dan job title yang ditampilkan di header; tanggal mulai dan history tersimpan tapi tidak ditampilkan di header
- R11. Edit guild dilakukan dari modal/popover yang sama dengan edit profil
- R12. History guild (perusahaan sebelumnya + periodenya) dapat dilihat dan diedit dari modal profil — tidak ditampilkan di header

**Find Guild (global)**

- R13. Tombol Find Guild dipindah dari dalam card ke header sebagai tombol global
- R14. Modal Find Guild berisi dropdown pilih job → menampilkan link pencarian lowongan (Glints, Indeed, LinkedIn) untuk job tersebut
- R15. Link yang ditampilkan adalah link yang sudah ada di data jobQuests (Find Your Guild + Vendor Quest per job) — bukan pencarian real-time ke API eksternal

**Konten tab (deferred)**

- R16. Konten Quest, Equip, Talent, Achievement, Mission tidak ditulis ulang dalam rework ini — struktur tab + UI diimplementasikan dulu dengan konten yang sudah ada sebagai placeholder
- R17. Talent mewakili framework, library, stack, atau spesialisasi teknis yang bukan app/executable/system kerja langsung; contoh Frontend Developer: React, Vue, Svelte, Angular
- R18. Skills yang tampil di setiap job harus mewakili teknik, kompetensi, atau kegiatan kerja yang bisa dilakukan job tersebut; tool, executable, app, system, framework, library, vendor platform, dan nama job/role lain harus dipindahkan atau diganti sesuai definisinya
- R19. Skill list tetap berada di `index.html`; Talent dipindah ke file eksternal karena jumlah talent bisa tumbuh tidak terbatas
- R20. Skill untuk job tier 2/3/4 harus lebih sulit dan lebih spesifik daripada tier 1. Skill tier tinggi tidak perlu mengulang skill dari job tier bawah yang menjadi prasyarat karena job tier tinggi dianggap sudah mewarisi skill bawahnya
- R21. Skill progress bersifat shared lintas job berdasarkan nama skill. Jika skill yang sama muncul di beberapa job, perubahan level di satu tempat harus tercermin di semua tempat yang memakai skill tersebut

---

## Acceptance Examples

- AE1. **Covers R2, R3.** Diberikan card Frontend Developer, ketika user klik ikon Equip di body card, modal terbuka langsung di tab Equip — bukan di tab Quest.
- AE2. **Covers R3.** Diberikan modal sudah terbuka di tab Quest, ketika user klik tab Equip di dalam modal, konten berganti tanpa menutup dan membuka ulang modal.
- AE3. **Covers R6.** Diberikan card yang tidak memiliki konten Achievement, ketika user klik ikon Achievement, modal terbuka di tab Achievement dengan pesan "Belum ada konten" — tab tidak hilang.
- AE4. **Covers R7.** Diberikan card Data Analyst, tab Equip hanya menampilkan equipment yang memiliki tag "Data Analyst" di `data/equipment.json`.
- AE3. **Covers R5, R8.** Diberikan user belum mengisi profil, header menampilkan placeholder (misal `[👤 Hero]`) bukan error atau kosong.
- AE4. **Covers R8, R10.** Diberikan user mengisi guild PT Maju Jaya sebagai Backend Developer, header menampilkan `[👤 ulong | PT Maju Jaya · Backend Developer]`.
- AE5. **Covers R13, R14, R15.** Diberikan user klik Find Guild di header dan pilih "Data Analyst", modal menampilkan link Glints/Indeed/LinkedIn spesifik untuk Data Analyst dari data yang sudah ada.

---

## Success Criteria

- User dapat langsung navigasi ke Quest, Daily, Equip, Talent, atau Achievement tanpa scroll melalui konten lain
- Identitas user (nama/nick + guild) selalu terlihat di header tanpa harus membuka modal Export
- Find Guild dapat diakses dari mana saja tanpa harus scroll ke card job tertentu
- Konten per tab dapat diupdate tanpa menyentuh index.html (file eksternal)

---

## Scope Boundaries

- Konten Quest/Equip/Talent/Achievement/Mission tidak ditulis ulang — hanya struktur tab yang diimplementasikan
- Normalisasi penuh semua skills lama ke Skill/Equip/Talent boleh dilakukan bertahap; rework ini harus menjaga definisi targetnya agar konten baru tidak makin mencampur kategori
- Talent dipisah ke file eksternal, tetapi skill job tetap inline di `index.html` sampai ada kebutuhan arsitektur lain
- Find Guild tidak menggunakan API real-time Glints/Indeed — hanya link statis dari data yang sudah ada
- Profil tidak disimpan ke server/cloud — tetap localStorage
- History guild tidak ditampilkan di header, hanya tersedia di modal edit
- Integrasi Perguruan Ulong ke dalam tab Quest dibahas di brainstorm terpisah
- Fitur rename "Qualification" ke nama lain (Training, Mastery, dll) dibahas di brainstorm terpisah

---

## Key Decisions

- **5 ikon di body card, bukan 1 tombol dengan submenu:** Memberi akses langsung ke tab yang diinginkan tanpa step tambahan; Qualification dihapus sepenuhnya
- **Modal bertab, bukan modal terpisah per kategori:** Satu modal lebih ringan dari sisi UI; user bisa pindah antar tab bebas setelah modal terbuka tanpa klik tombol card lagi
- **Mission diundur:** Konten Mission belum siap — tab disiapkan strukturnya saja jika memang perlu, tapi tombol di card tidak dimunculkan dulu
- **Equipment dan Talent difilter per job:** Modal hanya menampilkan item relevan (match tags) — tidak dump semua isi file
- **Find Guild di header (global), bukan per card:** User sering mencari lowongan lintas job — satu pintu lebih efisien
- **Talent terpisah dari Equip:** Equip berarti app/executable/system kerja nyata seperti VS Code, Git, DevTools, atau vendor console. Talent berarti framework/library/stack/spesialisasi seperti React, Vue, Svelte, Angular, atau padanan di job lain.
- **Skills berarti teknik/kegiatan kerja:** Skills di card job tidak boleh menjadi daftar tools atau nama role. Contoh yang benar: routing, debugging, API design, incident response, usability testing. Contoh yang harus pindah kategori: VS Code/Git ke Equip; React/Vue/Docker/Kubernetes/Power BI ke Talent atau Equip tergantung apakah ia framework/stack atau app/system kerja. Contoh yang harus diganti karena nama role/domain terlalu besar: UI, UX, Frontend, Backend.
- **Tier tinggi mewarisi skill tier bawah:** Job tier 2/3/4 tidak mengulang skill dari job prasyaratnya. Skill di tier tinggi harus menggambarkan pekerjaan yang lebih sulit, koordinatif, atau sistemik.
- **Skill identity shared by name:** Skill seperti version control boleh muncul di beberapa job; progress-nya satu identitas global, bukan per-job. Tool spesifik seperti Git tetap Equip, sedangkan skill-nya adalah version control.
- **Konten dari file eksternal:** Memungkinkan konten Quest/Equip/Talent/Achievement/Mission diupdate tanpa deploy ulang index.html
- **Guild tampil di header bersama profil:** Identitas = siapa kamu + di mana kamu sekarang — keduanya penting untuk showcase

---

## Outstanding Questions

### Resolve Before Planning

- [Affects R3][User decision] Format file konten eksternal — JSON per job? JSON per tab? Folder per job dengan file tab di dalamnya? User belum menjelaskan konsep kontennya (terpotong sebelum dijelaskan)
- [Affects R3][User decision] Apakah konten tab sama untuk semua user (kurikulum tetap) atau bisa dikustomisasi per user?

### Deferred to Planning

- [Affects R3][Technical] Cara load file eksternal yang kompatibel dengan GitHub Pages dan file:// — kemungkinan perlu bundler atau fallback inline data
- [Affects R2][Technical] Struktur data modal bertab — apakah extend jobQuests yang ada atau struktur baru terpisah
- [Affects R13][Technical] Cara menarik link Find Guild dari jobQuests yang sudah ada tanpa duplikasi data
