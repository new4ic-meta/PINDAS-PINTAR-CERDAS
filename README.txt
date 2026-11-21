# PINDAS — Pakej Modul Pembaikan Kuiz Rawak

## Kandungan
- `pindas-quiz-randomizer.js`: enjin pemilihan soalan rawak, pilihan jawapan rawak, dan pencegahan pengulangan dalam satu sesi.
- `README.txt`: nota integrasi dan perkara yang masih perlu dipadankan.

## Perilaku yang disediakan
1. Menyokong kumpulan umur `4-6`, `7-9`, `10-12`, `13-15`, `16-17`.
2. Set soalan baharu dipilih secara rawak apabila `createSession()` dipanggil.
3. Soalan tidak berulang dalam satu sesi sehingga bank soalan kumpulan umur itu habis.
4. Pilihan jawapan diacak tetapi jawapan betul dipadankan melalui `correctOptionId`, bukan kedudukan A/B/C/D.
5. Fungsi `markAnswered()` hanya bergerak ke soalan seterusnya selepas soalan aktif ditandakan dijawab.

## Format data yang diperlukan
Setiap soalan perlu dipetakan kepada format berikut:

{
  id: "unik-001",
  ageGroup: "7-9",
  question: "Soalan...",
  options: [
    { id: "a", text: "Pilihan A" },
    { id: "b", text: "Pilihan B" },
    { id: "c", text: "Pilihan C" },
    { id: "d", text: "Pilihan D" }
  ],
  correctOptionId: "b",
  difficulty: "mudah",
  hint: "Petunjuk pilihan"
}

## PENTING — status integrasi
Fail struktur `index(9).html` yang ditemui memanggil `data.js` dan `app.js`, tetapi kandungan penuh kedua-dua fail tersebut tidak tersedia dalam bahan projek yang boleh dicapai semasa menyediakan pakej ini. Oleh itu modul ini **belum disambungkan** kepada fungsi `startGame()` / `nextQuestion()` PINDAS dan belum boleh dianggap sebagai pembaikan produksi siap pasang.

Untuk integrasi yang betul, pembangun perlu:
- membaca struktur sebenar bank soalan dalam `data.js`;
- memetakan objek soalan kepada format di atas;
- memanggil `createSession()` ketika kuiz bermula / Main Semula;
- memaparkan `currentQuestion(session)`;
- memanggil `markAnswered(session, current.id)` selepas jawapan disahkan;
- memastikan mod permainan selain kuiz dan lapan permainan asal tidak berubah.

Jangan gantikan `app.js` atau `data.js` sedia ada dengan fail ini. Ia ialah modul enjin pembaikan untuk digabungkan selepas pemadanan kod sebenar dan ujian regresi.
