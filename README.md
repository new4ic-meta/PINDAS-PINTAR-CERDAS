# PINDAS + PIYDEN + AFIDAN — Edisi Fail Baharu

## Kandungan
- `index.html`, `styles.css`: UI responsif.
- `data.js`: bank 200 soalan (5 kumpulan umur × 4 subjek × 10 soalan, termasuk variasi kategori).
- `app.js`: kuiz tanpa pengulangan dalam satu kitaran, permainan NEON RUSH 45 saat, AFIDAN offline fallback dan sambungan API.
- `manifest.json`, `sw.js`, `icon.svg`: PWA dan cache asas.
- `api/assistant.js`: endpoint server pilihan untuk AI generatif.
- `vercel.json`, `package.json`: konfigurasi deploy pilihan.

## Jalankan
Boleh host sebagai laman statik melalui GitHub Pages. Untuk fungsi offline/PWA, gunakan HTTPS. Fail perlu dimuatkan sekurang-kurangnya sekali ketika online.

## AFIDAN ONLINE
Deploy ke platform yang menyokong fungsi serverless. Tetapkan `AI_API_KEY` sebagai environment variable rahsia. Pilihan: `AI_API_URL` dan `AI_MODEL`. Jangan masukkan API key ke fail frontend atau repositori awam.
Jika endpoint tidak tersedia, butang Jana Bantuan tetap memberi rangka bantuan asas OFFLINE; ia tidak mendakwa sebagai jawapan AI generatif.

## Pembayaran
Integrasi TNG Business/DuitNow belum diaktifkan. Jangan tandakan pembelian sebagai berjaya berdasarkan screenshot/QR atau teks pelanggan. Sambungkan penyedia pembayaran yang diluluskan dan sahkan transaksi di server sebelum memberikan akses premium. Jangan simpan nombor akaun, PIN, OTP, QR peribadi atau kunci rahsia dalam repositori.

## Ujian penerimaan sebelum pelancaran
1. PINDAS: pilih setiap umur/subjek, jawab semua soalan dalam kitaran dan pastikan ID soalan tidak berulang sehingga bank habis.
2. PIYDEN: mula permainan; pastikan orb kelihatan, kawalan sentuh dan papan kekunci bergerak, timer tamat pada 45 saat.
3. AFIDAN: cuba tanpa internet (rangka offline), kemudian deploy endpoint dan uji jawapan ONLINE.
4. Uji Safari iPhone dan Chrome Android sebenar. ZIP ini belum diuji pada akaun hosting atau peranti pengguna.
