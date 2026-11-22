# PINDAS + PIYDEN + AFIDAN

Edisi gabungan web/PWA mesra telefon.

## Kandungan
- `index.html` — halaman utama dan tiga modul.
- `styles.css` — reka bentuk responsif.
- `data.js` — bank soalan PINDAS mengikut umur dan bidang.
- `app.js` — navigasi, kuiz, PIYDEN NEON RUSH dan alat asas AFIDAN.
- `manifest.json` — tetapan PWA.
- `sw.js` — cache aset teras untuk kegunaan luar talian selepas lawatan pertama yang berjaya.
- `icon.svg` — ikon edisi gabungan.

## Pasang pada GitHub Pages
1. Muat turun dan ekstrak ZIP.
2. Buka repositori GitHub Pages yang hendak digunakan.
3. Gantikan fail laman lama dengan semua fail di dalam folder ini.
4. Pastikan `index.html` berada di root repositori, bukan di dalam subfolder tambahan.
5. Commit perubahan dan tunggu GitHub Pages selesai diterbitkan.
6. Buka laman sekali ketika internet tersedia. Selepas cache selesai, cuba mod kapal terbang untuk menguji aset dan kandungan yang dicache.

## Nota penting
- Kuiz menyusun soalan secara rawak dan tidak mengulang soalan dalam satu pusingan bagi bidang yang dipilih. Selepas semua soalan habis, tekan "Ulang bidang" untuk pusingan baharu.
- Bank soalan ini ialah kandungan asas contoh dan perlu disemak guru sebelum digunakan sebagai bahan kurikulum rasmi.
- PIYDEN menyimpan rekod terbaik pada peranti melalui localStorage.
- AFIDAN dalam pakej ini ialah alat templat setempat/offline, bukan sambungan kepada model AI awan. Tiada API key atau caj API digunakan.
- Offline PWA tidak boleh dijamin sebelum lawatan pertama berjaya memuat turun dan menyimpan cache. Kandungan luaran dan fungsi dalam talian tidak akan tersedia tanpa internet.
- Pakej ini tidak menyertakan pangkalan data pengguna, akaun, pembayaran, atau backend.
