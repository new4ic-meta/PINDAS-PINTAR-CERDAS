# PINDAS – PINTAR CERDAS
**Slogan:** *Ilmu Membina Masa Depan.*

Aplikasi permainan minda interaktif yang ceria dan selamat untuk kanak-kanak serta remaja berumur **4–17 tahun**.

## Struktur Fail Projek
- `index.html` – Struktur utama antaramuka pengguna (mobile-first) dengan KAMPUS PINDAS sebagai konsep sekolah kedua digital.
- `styles.css` – Penggayaan responsif mesra iPhone (Safari) dan Android.
- `data.js` – Bank soalan lengkap merentasi 5 kategori umur dan lencana pencapaian.
- `app.js` – Enjin permainan, soalan dan pilihan jawapan rawak, pengiraan markah, tahap, bintang, rekod, had masa, dan kawalan ibu bapa ber-PIN.
- `pindas-revenue.html` / `pindas-revenue.css` – Halaman sokongan sukarela dan maklumat penajaan untuk orang dewasa.
- `manifest.json` – Konfigurasi pemasangan Progressive Web App (PWA).
- `sw.js` – Service Worker untuk sokongan luar talian (offline).
- `icons/icon.svg` – Ikon vektor aplikasi PINDAS.

## Cara Menjalankan Aplikasi
1. Ekstrak fail ZIP ini ke mana-mana folder.
2. Untuk menguji terus, buka `index.html` menggunakan pelayar web moden (Safari, Chrome, Edge, Firefox).
3. Untuk mengaktifkan **Service Worker (PWA)** sepenuhnya pada telefon atau komputer, jalankan melalui pelayan web tempatan (contoh: `npx serve .` atau `python -m http.server 8080`) dan buka `http://localhost:8080`.


## Status Pakej
- Versi pakej: **Kampus Sekolah Kedua V1.1**.
- Cache PWA dinaik taraf kepada `pindas-cache-v1.3.0` supaya pelayar memuatkan aset versi baharu.

## Penambahbaikan Pakej Ini
- KAMPUS PINDAS memperkenalkan pengalaman seperti sekolah kedua: pintasan Sains & Dunia, Matematik, Bahasa, serta Logik & Minda.
- Set soalan diacak setiap kali permainan bermula; pilihan jawapan turut diacak sambil indeks jawapan betul dikekalkan.
- Cabaran harian memilih satu soalan rawak daripada setiap bidang campuran.
- Halaman sokongan dan penajaan dipisahkan daripada permainan. Permainan asas kekal percuma; sebarang urusan kewangan ditujukan kepada orang dewasa/penjaga dan memerlukan saluran rasmi yang disahkan.
- PIYDEN ARCADE V2.0 dikekalkan sebagai modul berasingan.
