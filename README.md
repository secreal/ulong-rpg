# ⚔ ulong RPG — MMORPG Edition

> *Dunia IT sebagai Kelas Petualang. Pilih job-mu, level-up skill-mu, dan pamerkan progress-mu ke dunia.*
>
> *The IT world as an Adventurer's Guild. Pick your job class, level up your skills, and showcase your progress.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-secreal.github.io%2Fulong--rpg-f0bb4e?style=flat-square&logo=github)](https://secreal.github.io/ulong-rpg/)
[![Made with](https://img.shields.io/badge/Made%20with-Vanilla%20JS-blue?style=flat-square)](index.html)

---

## Apa itu ulong RPG?

ulong RPG adalah web app gamifikasi karier IT — kamu bisa memilih job class (Frontend Developer, Backend, Data Scientist, dll), melacak skill yang sudah kamu kuasai, dan menyelesaikan quest untuk naik level.

Dibuat oleh **[Perguruan Ulong](https://medium.com/@isecreal/selamat-datang-di-perguruan-ulong-a9546b8dc13a)** — sekolah coding gratis untuk developer Indonesia.

**For international readers:** ulong RPG is a gamified IT career tracker. Choose your job class from 37 options, level up skills, complete quests, and export your progress as a shareable showcase page.

---

## 🎮 Cara Pakai

1. **Buka** → [secreal.github.io/ulong-rpg](https://secreal.github.io/ulong-rpg/)
2. **Pilih job class** dari sidebar — Software, Data, Infra, Security, Product, Design, Support, atau Leadership
3. **Level-up skill** dengan klik chip skill di card job-mu (Lv 0 → Lv 1 → Lv 2 → Lv 3)
4. **Selesaikan quest** via tombol ⚔ Job Change di card
5. **Export showcase** via tombol "Export /ulong" → upload ke GitHub Pages kamu sebagai halaman profil
6. **Gunakan AUTO** untuk copy prompt ke AI CLI kamu dan dapatkan panduan quest personal

---

## 🏆 Hall of Fame

Developer Indonesia (dan global) yang sudah membangun career path mereka dengan ulong RPG:

| # | Nama | GitHub | Showcase `/ulong` |
|---|------|--------|-------------------|
| 1 | secreal (Hendry) | [@secreal](https://github.com/secreal) | [secreal.github.io/ulong](https://secreal.github.io/ulong) |

*Ingin namamu ada di sini? Lihat bagian **Berkontribusi** di bawah.*

---

## 🤝 Berkontribusi ke Hall of Fame

Tambahkan dirimu ke tabel Hall of Fame dengan langkah berikut:

1. **Fork** repo ini di GitHub
2. **Edit** file `README.md` — tambahkan baris baru di tabel Hall of Fame:
   ```
   | N | Nama Kamu | [@username](https://github.com/username) | [username.github.io/ulong](https://username.github.io/ulong) |
   ```
3. **Buat Pull Request** ke branch `main` dengan judul:
   ```
   chore: add [nama kamu] to Hall of Fame
   ```
4. Setelah di-merge, namamu akan tampil di halaman ini untuk selama-lamanya ✨

> Tidak perlu punya showcase `/ulong` dulu untuk masuk ke tabel — bisa diisi `-` dan diupdate nanti.

---

## 📁 Struktur Proyek

```
ulong-rpg/
├── data/              # Equipment, talent, dan quest catalog
├── index.html         # Seluruh app (single-file — HTML + CSS + JS)
├── scripts/           # Validator dan data-health tooling
├── docs/
│   ├── brainstorms/  # Requirements documents
│   ├── plans/        # Implementation plans
│   └── reports/      # Generated data-health reports
└── README.md
```

### Target Quest Data Health

Jalankan validator keras dan health report sebelum mengubah data target quest:

```powershell
node scripts/validate-target-quests.mjs
node scripts/report-target-quest-health.mjs
```

Health report menganggap schema atau referensi rusak sebagai `error`, sedangkan konsentrasi learning source dan masalah maintainability lain sebagai `warning`. Output juga bisa dipakai automation atau disimpan sebagai snapshot Markdown:

```powershell
node scripts/report-target-quest-health.mjs --format json --fail-on error
node scripts/report-target-quest-health.mjs --format markdown --output docs/reports/target-quest-health.md
```

Gunakan `--fail-on warning` untuk mode ketat, atau `--fail-on none` untuk inspeksi tanpa exit code gagal.

---

## 📄 Lisensi

MIT — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/secreal">secreal</a> &nbsp;·&nbsp;
  <a href="https://medium.com/@isecreal">Perguruan Ulong</a>
</p>
