---
date: 2026-05-10
topic: achievement-links
---

# Achievement Links — Portfolio per Job

## Summary

Menambahkan kemampuan bagi player untuk menyimpan link portofolio di bagian Achievement setiap job card — berapapun jumlahnya — yang tersimpan di localStorage dan ikut ter-export ke showcase `/ulong`.

---

## Requirements

- R1. Di setiap job card, section Achievement memiliki area untuk menambah link portofolio
- R2. Player dapat menambah link baru (URL + label opsional) dan menghapus link yang sudah ada
- R3. Semua link disimpan di localStorage per job — dipertahankan antar sesi
- R4. Tidak ada batasan jumlah link per job
- R5. Link yang tersimpan ikut ter-export ke dalam HTML showcase (output dari fitur ulong export)

---

## Scope Boundaries

- Tidak ada validasi URL yang kompleks — cukup basic (harus dimulai dengan http/https)
- Tidak ada preview atau thumbnail link — hanya URL dan label teks
- Tidak ada sorting atau reordering link

---

## Dependencies / Assumptions

- Fitur ini adalah prerequisite untuk R9 di `docs/brainstorms/ulong-export-requirements.md` — harus diimplementasikan sebelum export dapat menyertakan portfolio links
