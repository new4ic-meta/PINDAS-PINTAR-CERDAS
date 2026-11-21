PINDAS – QUIZ SESSION FIX

Fail ini ialah patch tambahan, BUKAN pengganti app.js atau data.js.

Apa yang dibaiki:
1. Set soalan diacak semula setiap kali permainan bermula.
2. Soalan pendua dalam set yang sama ditapis berdasarkan teks soalan/perkataan.
3. Pilihan jawapan A/B/C/D diacak dengan indeks jawapan betul dikekalkan.
4. Mod Kepantasan tidak lagi memasukkan semula bank soalan yang sama apabila bank habis.
5. Callback pemasa lama tidak boleh mengganggu sesi permainan baharu.

CARA INTEGRASI:
Dalam index.html, pastikan susunan skrip di bahagian bawah ialah:

<script src="./data.js"></script>
<script src="./app.js"></script>
<script src="./pindas-quiz-session-fix.js"></script>

Letakkan skrip patch selepas app.js. Jangan padam atau gantikan fail asal.

BATASAN:
Bank data asal mempunyai 5 soalan bagi setiap kategori umur dan bidang.
Patch ini mengelakkan pengulangan dalam satu sesi, tetapi tidak menambah bilangan
soalan unik untuk sesi-sesi akan datang. Untuk variasi lebih besar, QUESTION_BANK
perlu ditambah dengan soalan baharu.

Ujian:
Selepas integrasi, buka PINDAS, mainkan beberapa sesi bagi setiap umur, dan uji
mod Kepantasan. Pastikan konsol pelayar menunjukkan:
[PINDAS] Quiz session fix berjaya dimuatkan.

Patch ini belum dianggap live/terpasang sehingga index.html diubah dan diterbitkan.
