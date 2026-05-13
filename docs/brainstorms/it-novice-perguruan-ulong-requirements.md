---
date: 2026-05-13
topic: it-novice-perguruan-ulong
---

# IT Novice — Perguruan Ulong Integration

## Summary

IT Novice (tier 0) tidak menggunakan sistem quest/equip/talent seperti tier lainnya. Sebagai gantinya, tab Main Quest-nya menampilkan 123 artikel harian Perguruan Ulong sebagai quest yang bisa diselesaikan satu per satu — masing-masing dengan link ke artikel Medium dan input untuk paste Discord answer link sebagai bukti penyelesaian. Tab Daily Quest, Equip, dan Talent disembunyikan untuk IT Novice.

---

## Problem Frame

IT Novice adalah tier entry-level yang ditujukan untuk player yang baru mengenal IT — mereka belum punya skill, equip, atau talent yang relevan untuk di-track. Perguruan Ulong adalah kurikulum C# harian selama ~4 bulan (September 2022 – Januari 2023) yang sudah didesain sebagai learning path berurutan. Menampilkan kurikulum ini sebagai quest secara alami menggantikan kebutuhan quest/equip system di tier ini, dan memberi player jalur belajar yang konkret dan terstruktur.

---

## Key Flows

- F1. **Player melihat Perguruan Ulong sebagai Main Quest**
  - **Trigger:** Player membuka detail modal job card IT Novice → tab Quest
  - **Steps:** Tab Quest menampilkan 123 quest dikelompokkan per bulan → tiap quest punya link ke artikel Medium → quest yang belum selesai bisa di-expand untuk paste Discord answer link → submit → quest ter-centang selesai
  - **Outcome:** Player melihat progress belajar mereka sampai hari ke berapa

- F2. **Player menyelesaikan satu quest**
  - **Trigger:** Player membuka quest, membaca artikel Medium, menjawab di Discord, lalu paste Discord link ke input field dan submit
  - **Steps:** Input menerima URL Discord → submit menyimpan status selesai ke localStorage → quest item tampil sebagai done (centang/dimmed) → progress counter naik
  - **Outcome:** Quest ter-tandai selesai, progress tersimpan antar sesi

- F3. **Player melihat ringkasan progress di job card**
  - **Trigger:** Player melihat daftar job cards (pyramid view)
  - **Steps:** Job card IT Novice menampilkan progress Perguruan Ulong — misal "42 / 123 hari"
  - **Outcome:** Progress terlihat dari luar tanpa harus buka detail modal

---

## Requirements

**Konten quest**

- R1. Main Quest IT Novice berisi 123 quest dari Perguruan Ulong, diurut berdasarkan tanggal (01 Sep → 31 Jan)
- R2. Quest dikelompokkan per bulan: September 2022 (30), Oktober 2022 (31), November 2022 (30), Desember 2022 (31), Januari 2023 (1)
- R3. Setiap quest item menampilkan: nomor hari, tanggal, judul artikel (dari nama artikel Medium), dan link ke artikel Medium
- R4. URL artikel Medium mengikuti pola `https://medium.com/@isecreal/<slug>` — slug hardcoded dari data artikel yang diketahui

**Penyelesaian quest**

- R5. Player menyelesaikan quest dengan paste Discord answer link ke input field lalu submit
- R6. Validasi dasar: input harus dimulai dengan `https://discord.com/` sebelum bisa submit
- R7. Setelah submit, quest ter-tandai selesai — tampil dengan visual done (centang / opacity berkurang)
- R8. Status selesai tiap quest disimpan di localStorage per job (IT Novice) — persisten antar sesi
- R9. Quest yang sudah selesai tidak bisa di-undo dari UI (tidak ada tombol uncheck)

**Tab visibility**

- R10. Tab Daily Quest tidak ditampilkan untuk IT Novice
- R11. Tab Equip tidak ditampilkan untuk IT Novice
- R12. Tab Talent tidak ditampilkan untuk IT Novice
- R13. Tab yang tampil untuk IT Novice: Quest dan Achievement saja

**Progress summary**

- R14. Job card IT Novice di pyramid view menampilkan progress "X / 123 hari" sebagai ganti progress skill/quest biasa

---

## Data — Artikel Perguruan Ulong

Artikel di-hardcode dalam app. URL Medium mengikuti pola yang konsisten dari fetch data aktual.

**September 2022 (30 artikel)**
- 01: Install Chocolatey — `01-september-2022-install-chocolatey-d5dbaaebaad7`
- 02: Install Git Extensions dan Kdiff3 dengan chocolatey — `02-september-2022-install-git-extensions-dan-kdiff3-dengan-chocolatey-efe2c3c1f0c9`
- 03: Buat akun di 4 repository gratis tis tis — `03-september-2022-buat-akun-di-4-repository-gratis-tis-tis-0d509335dfb3`
- 04: Generate ssh key untuk repository git online — `04-september-2022-generate-ssh-key-untuk-repository-git-online-8f1598b953ae`
- 05: Install visual studio 2022 community — `05-september-2022-install-visual-studio-2022-community-4ec2ddfcb25b`
- 06: Buat folder git — `06-september-2022-buat-folder-git-101364b5f9a1`
- 07: Buat aplikasi Console — `07-september-2022-buat-aplikasi-console-7e147167d8f1`
- 08: Git ignore dan commit — `08-september-2022-git-ignore-dan-commit-3b1809791d76`
- 09: Git push — `09-september-2022-git-push-e1d6dd3d8d19`
- 10: Git push lagi — `10-september-2022-git-push-lagi-7335039bab3a`
- 11: Git push lagi dan lagi — `11-september-2022-git-push-lagi-dan-lagi-a6a069a9612e`
- 12: Git push selamanya — `12-september-2022-git-push-selamanya-1914b34717e4`
- 13: Variabel dan tipe data — `13-september-2022-variabel-dan-tipe-data-926f9251d86e`
- 14: Tipe data integer — `14-september-2022-tipe-data-integer-c8aa291eab97`
- 15: Tipe data long — `15-september-2022-tipe-data-long-55cd33d55767`
- 16: Tipe data float — `16-september-2022-tipe-data-float-6ab70274d3c5`
- 17: Tipe data double — `17-september-2022-tipe-data-double-66e23a13a2e6`
- 18: Tipe data decimal — `18-september-2022-tipe-data-decimal-32c16c3cd360`
- 19: Tipe data bool atau boolean — `19-september-2022-tipe-data-bool-atau-boolean-c1ed0dc2f6fa`
- 20: Tipe data char — `20-september-2022-tipe-data-char-a9cd0788248e`
- 21–30: *(slug belum diketahui — Medium memotong list di 20 artikel; perlu teknik lain saat planning)*

**Oktober 2022 (31 artikel)** — 01–20 via list, 21–31 via RSS feed:
- 01: Array — `01-oktober-2022-array-39dc2c32f946`
- 02: Menggunakan array — `02-oktober-2022-menggunakan-array-f4e858ae2f63`
- 03: List — `03-oktober-2022-list-91960abb5fae`
- 04: List add — `04-oktober-2022-list-add-06f03808297b`
- 05: List remove — `05-oktober-2022-list-remove-1eb5c1954229`
- 06: Foreach list — `06-oktober-2022-foreach-list-2b41cc1c085b`
- 07: Conditional if — `07-oktober-2022-conditional-if-14c7b4ef69dc`
- 08: Conditional if, and (&&) else if, else — `08-oktober-2022-conditional-if-and-else-if-else-f94b0a835a10`
- 09: Conditional if or — `09-oktober-2022-conditional-if-or-1ea5dd9530d6`
- 10: Switch case break — `10-oktober-2022-switch-case-break-dc1ffe623b40`
- 11: Recursive method — `11-oktober-2022-recursive-method-39b0fc0dc432`
- 12: Static class — `12-oktober-2022-static-class-374528a4208d`
- 13: Static method — `13-oktober-2022-static-method-924fb8e96c0e`
- 14: Static variabel — `14-oktober-2022-static-variabel-84ba46916224`
- 15: Enum — `15-oktober-2022-enum-45460db67f93`
- 16: LINQ lambda FirstOrDefault — `16-oktober-2022-linq-lambda-firstordefault-f35847764b96`
- 17: LINQ lambda Where ToList — `17-oktober-2022-linq-lambda-where-tolist-85f3128cae57`
- 18: LINQ lambda where contains — `18-oktober-2022-linq-lambda-where-contains-7a6c049a5329`
- 19: LINQ lambda OrderBy — `19-oktober-2022-linq-lambda-orderby-a29bb5301051`
- 20: LINQ lambda OrderByDescending — `20-oktober-2022-linq-lambda-orderbydescending-8ce87d6af224`
- 21: *(slug belum diketahui)*
- 22: LINQ lambda list toQueryable — `22-oktober-2022-linq-lambda-list-toqueryable-74a7d326bfbc`
- 23: LINQ lambda Queryable to list — `23-oktober-2022-linq-lambda-queryable-to-list-0434b65398bf`
- 24: LINQ lambda toArray — `24-oktober-2022-linq-lambda-toarray-45aecf25179b`
- 25: LINQ lambda select new class — `25-oktober-2022-linq-lambda-select-new-class-65d1f31dcc53`
- 26: LINQ lambda select index — `26-oktober-2022-linq-lambda-select-index-c52e2d768369`
- 27: LINQ toList Take — `27-oktober-2022-linq-tolist-take-a68e3dffe1bc`
- 28: LINQ toList sum — `28-oktober-2022-linq-tolist-sum-9a340fc6ff75`
- 29: LINQ toList min — `29-oktober-2022-linq-tolist-min-22d361b67f6c`
- 30: LINQ toList max — `30-oktober-2022-linq-tolist-max-a3649113da60`
- 31: LINQ toList distinct — `31-oktober-2022-linq-tolist-distinct-259511d04d4a`

**November 2022 (30 artikel)** — 01–20 via list, 21–30 belum diketahui:
- 01: Directory (folder) — `01-november-2022-directory-folder-4c22856e9e94`
- 02: File write — `02-november-2022-file-write-c3868ab95b75`
- 03: File read — `03-november-2022-file-read-9de853b53ef1`
- 04: CRUD — `04-november-2022-crud-bfee41959ce8`
- 05: Create csv — `05-november-2022-create-csv-26e661b99751`
- 06: Read csv — `06-november-2022-read-csv-c6813c09d3f`
- 07: Update csv — `07-november-2022-update-csv-6b24874033b`
- 08: Delete csv — `08-november-2022-delete-csv-dceeada89028`
- 09: Install SQL Server — `09-november-2022-install-sql-server-7188405a6d5e`
- 10: Install SSMS (SQL Server Management Studio) — `10-november-2022-install-ssms-sql-server-management-studio-d3baa16403d2`
- 11: Install dbeaver — `11-november-2022-install-dbeaver-af8a90e5bd8b`
- 12: Buat database — `12-november-2022-buat-database-75eaf487db92`
- 13: Buat tabel — `13-november-2022-buat-tabel-2a3b06d51e14`
- 14: Primary Key — `14-november-2022-primary-key-a2f28e100790`
- 15: INSERT INTO — `15-november-2022-insert-into-5f8d785dbe8`
- 16: UPDATE QUERY — `16-november-2022-update-query-1ba7c90ec4f7`
- 17: Delete Query — `17-november-2022-delete-query-9e28db4017ee`
- 18: Select Query — `18-november-2022-select-query-522bed968852`
- 19: Where — `19-november-2022-where-f6c698c8cb5c`
- 20: Where And — `20-november-2022-where-and-2711a23b86a1`
- 21–30: *(slug belum diketahui)*

**Desember 2022 (31 artikel)** — 01–20 via list, 21–31 belum diketahui:
- 01: Merancang Tabel — `01-desember-2022-merancang-tabel-93dae80bc5ce`
- 02: Mengevaluasi hasil analisa — `02-desember-2022-mengevaluasi-hasil-analisa-db39eefeb2`
- 03: Mengevaluasi lagi hasil analisa — `03-desember-mengevaluasi-lagi-hasil-analisa-8155a8147bb3`
- 04: Memahami Maksud Pembuatan Tabel — `04-desember-2022-memahami-maksud-pembuatan-tabel-1838c28510d1`
- 05: Buat Project InvenTk menggunakan visual studio — `05-desember-2022-buat-project-inventk-menggunakan-visual-studio-474bff1a70be`
- 06: Simpan ke git — `06-desember-2022-simpan-ke-git-67cc59061f26`
- 07: Membuat Model — `07-desember-2022-membuat-model-8687e4f248c4`
- 08: Membuat BusinessLogic — `08-desember-2022-membuat-businesslogic-58b58bc26cbf`
- 09: Membuat Controller — `09-desember-2022-membuat-controller-83f5ee0ef2a9`
- 10: Membuat View — `10-desember-2022-membuat-view-132aca64f7e5`
- 11: Pasang Entity Framework — `11-desember-2022-pasang-entity-framework-f9d68f8d9c5`
- 12: Membuat DataContext — `12-desember-2022-membuat-datacontext-213b8c473df8`
- 13: Membuat Connection String — `13-desember-2022-membuat-connection-string-f2f71c828b34`
- 14: Memasang dan Menerapkan Migration — `14-desember-2022-memasang-dan-menerapkan-migration-27d5f355274f`
- 15: Menambahkan MVC di Project — `15-desember-2022-menambahkan-mvc-di-project-b077ffadb01f`
- 16: Commit dulu ke git biar aman — `16-desember-2022-commit-dulu-ke-git-biar-aman-ec5f8c4524ab`
- 17: Membuat Form HTML — `17-desember-2022-membuat-form-html-534c740bd0e1`
- 18: Mengenal Request — `18-desember-2022-mengenal-request-9804098f1e1e`
- 19: Mengenal Response — `19-desember-2022-mengenal-response-27e66c49a947`
- 20: Melanjutkan Form — `20-desember-2022-melanjutkan-form-b8a2cbccb8af`
- 21–31: *(slug belum diketahui)*

**Januari 2023 (1 artikel)**
- 01: Visual Studio Code (vscode) — `01-januari-2023-visual-studio-code-vscode-40e2f96f4e9e`

> **Note for planning:** Slug yang belum diketahui (Sep 21–30, Okt 21, Nov 21–30, Des 21–31) perlu di-fetch manual saat planning. Medium membatasi list page di 20 artikel. Cara alternatif: cek RSS feed Medium atau fetch halaman berikutnya dari list. Total slug sudah diketahui: 20 (Sep) + 30 (Okt) + 20 (Nov) + 20 (Des) + 1 (Jan) = 91 dari 123.

---

## Acceptance Examples

- AE1. **Covers R1, R3, R10–R12.** Player membuka detail modal IT Novice → hanya tab Quest dan Achievement yang tampil → Quest tab menampilkan artikel "01 September 2022 — Install Chocolatey" dengan link ke Medium sebagai quest pertama.

- AE2. **Covers R5, R6, R7, R8.** Player paste `https://discord.com/channels/1052855347586531338/1264437580980813884/1501064265715552407` ke input quest hari ke-01 → klik submit → quest tersebut tampil done → setelah refresh, status done masih tersimpan.

- AE3. **Covers R6.** Player mencoba paste URL yang bukan Discord (misal GitHub link) → submit tidak bisa diklik atau muncul pesan error validasi.

- AE4. **Covers R14.** Player melihat pyramid — job card IT Novice menampilkan "42 / 123 hari" setelah menyelesaikan 42 quest.

---

## Success Criteria

- Player IT Novice punya jalur belajar yang terstruktur dan jelas di dalam app
- Progress belajar tersimpan dan visible tanpa perlu keluar dari app
- Tab yang tidak relevan (Equip, Talent, Daily Quest) tidak mengacaukan UI IT Novice

---

## Scope Boundaries

- Tidak ada auto-suggest Discord link — player paste sendiri
- Tidak ada validasi bahwa Discord link memang milik player tersebut
- Tidak ada sync ke Discord — link disimpan di localStorage saja
- Konten artikel tidak di-embed di dalam app — player tetap harus buka Medium
- Tidak ada notifikasi atau reminder untuk quest berikutnya
- Quest IT Novice tidak berkontribusi ke Learning Days achievement (achievement system berbeda dari quest completion tier lain)

---

## Dependencies / Assumptions

- Semua slug artikel Medium perlu di-fetch dan di-hardcode sebelum implementasi — tidak ada API call runtime ke Medium
- localStorage key untuk Perguruan Ulong progress terpisah dari `questProgress` yang digunakan tier lain, untuk menghindari collision
- Job card IT Novice sudah diidentifikasi dengan `tier === 0` di codebase (`index.html`)
