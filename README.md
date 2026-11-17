# PINDAS – PINTAR CERDAS
**Slogan:** *Ilmu Membina Masa Depan.*

Aplikasi permainan minda interaktif yang ceria dan selamat untuk kanak-kanak serta remaja berumur **4–17 tahun**.

## Struktur Fail Projek
- `index.html` – Struktur utama antaramuka pengguna (mobile-first).
- `styles.css` – Penggayaan responsif mesra iPhone (Safari) dan Android.
- `data.js` – Bank soalan lengkap merentasi 5 kategori umur dan lencana pencapaian.
- `app.js` – Enjin permainan, pengiraan markah, tahap, bintang, rekod, had masa, dan kawalan ibu bapa ber-PIN.
- `manifest.json` – Konfigurasi pemasangan Progressive Web App (PWA).
- `sw.js` – Service Worker untuk sokongan luar talian (offline).
- `icons/icon.svg` – Ikon vektor aplikasi PINDAS.

## Cara Menjalankan Aplikasi
1. Ekstrak fail ZIP ini ke mana-mana folder.
2. Untuk menguji terus, buka `index.html` menggunakan pelayar web moden (Safari, Chrome, Edge, Firefox).
3. Untuk mengaktifkan **Service Worker (PWA)** sepenuhnya pada telefon atau komputer, jalankan melalui pelayan web tempatan (contoh: `npx serve .` atau `python -m http.server 8080`) dan buka `http://localhost:8080`.
