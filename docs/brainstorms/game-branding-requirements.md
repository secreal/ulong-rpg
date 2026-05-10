---
date: 2026-05-10
topic: game-branding
---

# Game Branding — Logo Banner + IT Background

## Summary

Mengganti hero header dari deskripsi teks biasa menjadi logo/banner bergaya game, dan menambahkan background full-page berisi emoji IT items tersebar — sehingga keseluruhan halaman terasa seperti halaman game RPG, bukan landing page biasa.

---

## Requirements

- R1. Header utama diganti menjadi `ulong RPG` dalam ukuran besar dengan style logo game: Cinzel font, gold gradient fill, text-stroke, drop shadow berlapis (referensi: Ragnarok Online, Seven Knights)
- R2. Tagline di bawah logo: `ur long role playing game` — huruf kecil semua, letter-spacing lebar, warna muted
- R3. Intro paragraph lama ("Setiap role punya senjata...") dihapus — tidak digantikan teks panjang
- R4. Background full-page berisi flat emoji IT items (💻 🖥️ ⌨️ 🐛 🔌 💾 ⚙️ 🖱️ 📡 🐍 🔧 💿 📟 dll) tersebar di seluruh halaman, opacity ~15–20%, fixed position
- R5. Emoji background tidak mengganggu interaksi — `pointer-events: none`, z-index di bawah konten
- R6. Posisi emoji di-hardcode (bukan random JS setiap load) agar deterministik dan tidak bergeser antar refresh
- R7. Zero external assets baru — semua pure CSS + HTML emoji

---

## Scope Boundaries

- Tidak ada animasi atau floating effect pada emoji background
- Tidak ada custom font eksternal baru — gunakan Cinzel yang sudah di-import
- Konsep RPG di dalam card (class badge, tier pill, sprite, weapon) tidak berubah
- Tidak ada perubahan sidebar, pyramid, atau card content

---

## Key Decisions

- **Cinzel untuk logo**: sudah di-import, paling dekat dengan referensi Ragnarok/Seven Knights style
- **Gold gradient + text-stroke + drop shadow berlapis**: dicapai pure CSS, zero image asset
- **Emoji HTML div untuk background**: lebih mudah dari SVG pattern, deterministik, ringan
- **Posisi hardcoded**: ~30–40 emoji dengan top/left/rotation value tetap — cukup untuk kesan scattered tanpa random JS

---

## Sources & References

- Referensi visual: Ragnarok Origin, Seven Knights Re:Birth, Solo Leveling Arise, Valorant, Haunted Room
- File: `index.html` (h1, intro paragraph, body background layers)
