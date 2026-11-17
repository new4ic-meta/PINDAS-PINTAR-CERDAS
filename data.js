/* PINDAS – PINTAR CERDAS | Bank Soalan & Data Permainan (Umur 4–17 Tahun) */

const AGE_GROUPS = [
  { id: '4-6', label: '4–6 Tahun' },
  { id: '7-9', label: '7–9 Tahun' },
  { id: '10-12', label: '10–12 Tahun' },
  { id: '13-15', label: '13–15 Tahun' },
  { id: '16-17', label: '16–17 Tahun' }
];

const GAMES_CATALOG = [
  { id: 'pengetahuan', title: 'Kuiz Pengetahuan Am', desc: 'Terokai fakta dunia, sains dan alam sekitar.', icon: '🌍', bg: '#DBEAFE', type: 'mcq' },
  { id: 'matematik', title: 'Cabaran Matematik', desc: 'Asah kemahiran mengira dan nombor pantas.', icon: '🧮', bg: '#DCFCE7', type: 'mcq' },
  { id: 'perkataan', title: 'Teka Perkataan', desc: 'Susun huruf menjadi perkataan yang tepat.', icon: '🔤', bg: '#FEF3C7', type: 'word' },
  { id: 'logik', title: 'Permainan Logik', desc: 'Selesaikan corak, urutan dan penaakulan.', icon: '🧩', bg: '#F3E8FF', type: 'mcq' },
  { id: 'kepantasan', title: 'Cabaran Kepantasan', desc: 'Jawab seberapa banyak soalan dalam 45 saat!', icon: '⚡', bg: '#FFEDD5', type: 'speed' },
  { id: 'harian', title: 'Cabaran Harian', desc: 'Misi istimewa hari ini dengan ganjaran bonus.', icon: '📅', bg: '#FCE7F3', type: 'daily' },
  { id: 'gambar', title: 'Teka Gambar', desc: 'Kenal pasti objek dan simbol melalui petunjuk.', icon: '🖼️', bg: '#E0F2FE', type: 'picture' },
  { id: 'tekateki', title: 'Teka-Teki', desc: 'Uji kreativiti minda dengan teka-teki santai.', icon: '💡', bg: '#FEF9C3', type: 'mcq' }
];

const BADGES_DATA = [
  { id: 'first_win', name: 'Langkah Pertama', req: 'Selesaikan 1 permainan', icon: '🌱' },
  { id: 'star_10', name: 'Pengumpul Bintang', req: 'Kumpul 10 bintang', icon: '⭐' },
  { id: 'star_30', name: 'Bintang Cemerlang', req: 'Kumpul 30 bintang', icon: '🌟' },
  { id: 'score_500', name: 'Minda Aktif', req: 'Capai 500 jumlah mata', icon: '🧠' },
  { id: 'score_1500', name: 'Juara Pintar', req: 'Capai 1,500 jumlah mata', icon: '🏆' },
  { id: 'level_5', name: 'Peneroka Tahap 5', req: 'Capai Tahap 5', icon: '🚀' },
  { id: 'daily_hero', name: 'Wira Harian', req: 'Lengkapkan Cabaran Harian', icon: '🔥' },
  { id: 'all_rounder', name: 'Serba Boleh', req: 'Main 5 jenis permainan berbeza', icon: '👑' }
];

const QUESTION_BANK = {
  pengetahuan: {
    '4-6': [
      { q: 'Apakah warna langit pada waktu siang yang cerah?', opts: ['Biru', 'Hijau', 'Ungu', 'Hitam'], ans: 0, exp: 'Langit kelihatan biru pada waktu siang apabila matahari bersinar.' },
      { q: 'Haiwan manakah yang mengeluarkan bunyi "Meow"?', opts: ['Anjing', 'Kucing', 'Lembu', 'Itik'], ans: 1, exp: 'Kucing mengeluarkan bunyi meow.' },
      { q: 'Berapakah bilangan tayar pada sebuah basikal biasa?', opts: ['Satu', 'Dua', 'Empat', 'Enam'], ans: 1, exp: 'Basikal mempunyai dua tayar, di hadapan dan di belakang.' },
      { q: 'Apakah warna buah pisang yang sudah masak?', opts: ['Biru', 'Kuning', 'Merah jambu', 'Kelabu'], ans: 1, exp: 'Pisang yang masak berwarna kuning dan manis rasanya.' },
      { q: 'Di manakah ikan hidup?', opts: ['Di atas pokok', 'Di dalam air', 'Di dalam pasir', 'Di awan'], ans: 1, exp: 'Ikan bernafas menggunakan insang dan hidup di dalam air.' }
    ],
    '7-9': [
      { q: 'Apakah ibu negara Malaysia?', opts: ['Johor Bahru', 'Kuala Lumpur', 'Kuching', 'Ipoh'], ans: 1, exp: 'Kuala Lumpur ialah ibu negara Malaysia.' },
      { q: 'Planet manakah yang paling dekat dengan Matahari?', opts: ['Bumi', 'Utarid', 'Marikh', 'Zuhal'], ans: 1, exp: 'Utarid ialah planet pertama dan paling hampir dengan Matahari.' },
      { q: 'Apakah nama bunga kebangsaan Malaysia?', opts: ['Bunga Mawar', 'Bunga Raya', 'Bunga Melur', 'Bunga Orkid'], ans: 1, exp: 'Bunga Raya (Hibiscus rosa-sinensis) ialah bunga kebangsaan Malaysia.' },
      { q: 'Berapakah hari dalam seminggu?', opts: ['5 hari', '6 hari', '7 hari', '8 hari'], ans: 2, exp: 'Terdapat 7 hari dalam satu minggu.' },
      { q: 'Organ manakah yang mengepam darah ke seluruh badan?', opts: ['Paru-paru', 'Jantung', 'Perut', 'Hati'], ans: 1, exp: 'Jantung mengepam darah yang membawa oksigen ke seluruh tubuh.' }
    ],
    '10-12': [
      { q: 'Apakah gas yang diperlukan oleh tumbuhan untuk proses fotosintesis?', opts: ['Oksigen', 'Karbon dioksida', 'Nitrogen', 'Helium'], ans: 1, exp: 'Tumbuhan menyerap karbon dioksida dan cahaya matahari untuk menghasilkan makanan.' },
      { q: 'Banjaran gunung terpanjang di Semenanjung Malaysia ialah...', opts: ['Banjaran Crocker', 'Banjaran Titiwangsa', 'Banjaran Bintang', 'Banjaran Kapuas'], ans: 1, exp: 'Banjaran Titiwangsa menjadi tulang belakang Semenanjung Malaysia.' },
      { q: 'Apakah unit ukuran bagi arus elektrik?', opts: ['Volt', 'Ampere', 'Watt', 'Ohm'], ans: 1, exp: 'Ampere (A) ialah unit piawai untuk mengukur arus elektrik.' },
      { q: 'Berapakah bilangan negeri di Malaysia?', opts: ['11', '12', '13', '14'], ans: 2, exp: 'Malaysia mempunyai 13 buah negeri dan 3 Wilayah Persekutuan.' },
      { q: 'Haiwan mamalia manakah yang boleh terbang?', opts: ['Burung helang', 'Kelawar', 'Tupai terbang', 'Rama-rama'], ans: 1, exp: 'Kelawar ialah satu-satunya mamalia yang mampu terbang secara aktif.' }
    ],
    '13-15': [
      { q: 'Apakah simbol kimia bagi unsur Emas dalam Jadual Berkala?', opts: ['Ag', 'Au', 'Fe', 'Gd'], ans: 1, exp: 'Au berasal daripada perkataan Latin "Aurum" yang bermaksud emas.' },
      { q: 'Siapakah yang merumuskan Hukum Graviti Semesta?', opts: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'], ans: 1, exp: 'Sir Isaac Newton mengemukakan hukum graviti semesta pada abad ke-17.' },
      { q: 'Selat manakah yang memisahkan Semenanjung Malaysia dan Pulau Sumatera?', opts: ['Selat Tebrau', 'Selat Melaka', 'Selat Sunda', 'Selat Lombok'], ans: 1, exp: 'Selat Melaka merupakan laluan perkapalan antarabangsa yang penting.' },
      { q: 'Apakah lapisan atmosfera bumi yang melindungi kita daripada sinaran UV?', opts: ['Troposfera', 'Lapisan Ozon', 'Termosfera', 'Eksosfera'], ans: 1, exp: 'Lapisan ozon di stratosfera menyerap sebahagian besar sinaran ultraungu matahari.' },
      { q: 'Dalam tubuh manusia, di manakah terletaknya tulang paling kecil?', opts: ['Jari kelingking', 'Telinga tengah', 'Hidung', 'Pergelangan kaki'], ans: 1, exp: 'Tulang stapes di dalam telinga tengah ialah tulang terkecil manusia.' }
    ],
    '16-17': [
      { q: 'Apakah fenomena pembengkokan cahaya apabila bergerak dari satu medium ke medium lain?', opts: ['Pantulan', 'Pembiasan', 'Belauan', 'Serakan'], ans: 1, exp: 'Pembiasan berlaku kerana perubahan halaju cahaya merentasi medium berbeza ketumpatan.' },
      { q: 'Organel sel manakah yang berfungsi menjana tenaga ATP melalui respirasi sel?', opts: ['Ribosom', 'Mitokondria', 'Lisosom', 'Jasad Golgi'], ans: 1, exp: 'Mitokondria dikenali sebagai pusat janakuasa sel eukariot.' },
      { q: 'Apakah perjanjian yang membawa kepada pembentukan Malaysia pada tahun 1963?', opts: ['Perjanjian Pangkor', 'Perjanjian Malaysia 1963 (MA63)', 'Perjanjian London 1956', 'Perjanjian Bangkok'], ans: 1, exp: 'MA63 ditandatangani pada 9 Julai 1963 di London.' },
      { q: 'Dalam ekonomi, apakah maksud inflasi?', opts: ['Penurunan harga umum', 'Kenaikan tingkat harga umum secara berterusan', 'Lebihan eksport negara', 'Kadar faedah sifar'], ans: 1, exp: 'Inflasi mengurangkan kuasa beli mata wang apabila harga barang meningkat secara menyeluruh.' },
      { q: 'Apakah nama galaksi yang menempatkan Sistem Suria kita?', opts: ['Andromeda', 'Bima Sakti', 'Triangulum', 'Sombrero'], ans: 1, exp: 'Sistem Suria terletak di lengan Orion dalam galaksi Bima Sakti.' }
    ]
  },
  matematik: {
    '4-6': [
      { q: '2 + 3 = ?', opts: ['4', '5', '6', '7'], ans: 1, exp: '2 ditambah dengan 3 bersamaan 5.' },
      { q: '5 - 2 = ?', opts: ['2', '3', '4', '1'], ans: 1, exp: 'Jika ada 5 epal dan dimakan 2, tinggal 3 epal.' },
      { q: 'Nombor manakah yang paling besar?', opts: ['3', '8', '5', '1'], ans: 1, exp: '8 lebih besar daripada 1, 3, dan 5.' },
      { q: '4 + 4 = ?', opts: ['6', '7', '8', '9'], ans: 2, exp: '4 + 4 = 8.' },
      { q: '10 - 5 = ?', opts: ['4', '5', '6', '3'], ans: 1, exp: 'Separuh daripada 10 ialah 5.' }
    ],
    '7-9': [
      { q: '14 + 19 = ?', opts: ['31', '33', '35', '23'], ans: 1, exp: '14 + 19 = 33.' },
      { q: '6 × 4 = ?', opts: ['20', '24', '28', '18'], ans: 1, exp: '6 darab 4 bersamaan 24.' },
      { q: '45 - 18 = ?', opts: ['27', '37', '23', '29'], ans: 0, exp: '45 tolak 18 bersamaan 27.' },
      { q: '36 ÷ 6 = ?', opts: ['5', '6', '7', '8'], ans: 1, exp: '36 bahagi 6 ialah 6.' },
      { q: 'Berapakah minit dalam 1 jam setengah?', opts: ['60 minit', '75 minit', '90 minit', '100 minit'], ans: 2, exp: '60 minit + 30 minit = 90 minit.' }
    ],
    '10-12': [
      { q: 'Apakah nilai 25% daripada 200?', opts: ['25', '40', '50', '75'], ans: 2, exp: '25% ialah suku (1/4). 200 ÷ 4 = 50.' },
      { q: '12 × 12 = ?', opts: ['124', '144', '132', '148'], ans: 1, exp: '12 kuasa dua ialah 144.' },
      { q: 'Sebuah segi empat tepat mempunyai panjang 8 cm dan lebar 5 cm. Berapakah luasnya?', opts: ['13 cm²', '26 cm²', '40 cm²', '45 cm²'], ans: 2, exp: 'Luas = panjang × lebar = 8 × 5 = 40 cm².' },
      { q: 'Tukarkan 3/4 kepada nombor perpuluhan.', opts: ['0.25', '0.50', '0.75', '0.80'], ans: 2, exp: '3 bahagi 4 bersamaan 0.75.' },
      { q: 'Jika 3x = 27, apakah nilai x?', opts: ['7', '8', '9', '6'], ans: 2, exp: 'x = 27 ÷ 3 = 9.' }
    ],
    '13-15': [
      { q: 'Selesaikan: -8 + 15 - 4 = ?', opts: ['-3', '3', '11', '-11'], ans: 1, exp: '-8 + 15 = 7; kemudian 7 - 4 = 3.' },
      { q: 'Apakah nilai √169 + √25?', opts: ['16', '18', '20', '14'], ans: 1, exp: '√169 = 13 dan √25 = 5. 13 + 5 = 18.' },
      { q: 'Sebuah segi tiga bersudut tegak mempunyai sisi 6 cm dan 8 cm. Berapakah panjang hipotenusnya?', opts: ['9 cm', '10 cm', '12 cm', '14 cm'], ans: 1, exp: 'Teorem Pythagoras: √(6² + 8²) = √(36 + 64) = √100 = 10 cm.' },
      { q: 'Kembangkan: 3(2x - 4)', opts: ['6x - 4', '6x - 12', '5x - 12', '6x + 12'], ans: 1, exp: '3 × 2x = 6x dan 3 × (-4) = -12.' },
      { q: 'Apakah kebarangkalian mendapat nombor genap apabila sebiji dadu adil dilambung?', opts: ['1/6', '1/3', '1/2', '2/3'], ans: 2, exp: 'Nombor genap pada dadu ialah 2, 4, 6 (3 daripada 6 = 1/2).' }
    ],
    '16-17': [
      { q: 'Jika f(x) = 2x² - 3x + 1, apakah nilai f(3)?', opts: ['8', '10', '12', '16'], ans: 1, exp: 'f(3) = 2(9) - 3(3) + 1 = 18 - 9 + 1 = 10.' },
      { q: 'Apakah nilai log₁₀(1000)?', opts: ['2', '3', '4', '10'], ans: 1, exp: '10³ = 1000, maka log₁₀(1000) = 3.' },
      { q: 'Cari kecerunan garis lurus yang melalui titik (2, 4) dan (6, 12).', opts: ['1', '2', '3', '4'], ans: 1, exp: 'm = (12 - 4) / (6 - 2) = 8 / 4 = 2.' },
      { q: 'Terbitan pertama bagi y = 4x³ ialah...', opts: ['4x²', '12x²', '12x³', '7x²'], ans: 1, exp: 'dy/dx = 3 × 4x^(3-1) = 12x².' },
      { q: 'Apakah nilai sin 30° + cos 60°?', opts: ['0.5', '1.0', '1.5', '0.866'], ans: 1, exp: 'sin 30° = 0.5 dan cos 60° = 0.5; jumlahnya ialah 1.0.' }
    ]
  },
  perkataan: {
    '4-6': [
      { word: 'BUKU', hint: 'Kita membacanya untuk menimba ilmu.', exp: 'BUKU mengandungi halaman cerita dan ilmu.' },
      { word: 'BOLA', hint: 'Berbentuk bulat dan boleh disepak.', exp: 'BOLA digunakan dalam permainan sukan.' },
      { word: 'IKAN', hint: 'Haiwan yang berenang di dalam air.', exp: 'IKAN hidup di sungai dan laut.' },
      { word: 'MATA', hint: 'Deria yang digunakan untuk melihat.', exp: 'Kita melihat keindahan alam dengan MATA.' },
      { word: 'EPAL', hint: 'Buah rangup berwarna merah atau hijau.', exp: 'EPAL ialah buah yang berkhasiat.' }
    ],
    '7-9': [
      { word: 'SEKOLAH', hint: 'Tempat murid belajar bersama guru.', exp: 'SEKOLAH ialah tempat menuntut ilmu dan berkawan.' },
      { word: 'PELANGI', hint: 'Muncul di langit dengan 7 warna selepas hujan.', exp: 'PELANGI mempunyai tujuh warna yang indah.' },
      { word: 'HARIMAU', hint: 'Haiwan belang yang menjadi lambang keberanian negara.', exp: 'HARIMAU Malaya ialah khazanah rimba negara.' },
      { word: 'KOMPUTER', hint: 'Peranti elektronik untuk menaip dan belajar.', exp: 'KOMPUTER membantu kerja dan pembelajaran.' },
      { word: 'ANGKASA', hint: 'Ruang luas di luar atmosfera Bumi.', exp: 'Angkasawan meneroka ruang ANGKASA.' }
    ],
    '10-12': [
      { word: 'GRAVITI', hint: 'Daya yang menarik objek ke arah pusat Bumi.', exp: 'GRAVITI memastikan kita kekal berpijak di Bumi.' },
      { word: 'SEJARAH', hint: 'Kajian tentang peristiwa masa lampau.', exp: 'Mempelajari SEJARAH mengajar kita menghargai masa kini.' },
      { word: 'KREATIF', hint: 'Kebolehan mencipta idea baharu dan asli.', exp: 'Pemikiran KREATIF membantu menyelesaikan masalah secara unik.' },
      { word: 'TENAGA', hint: 'Keupayaan untuk melakukan kerja.', exp: 'TENAGA wujud dalam pelbagai bentuk seperti suria dan kinetik.' },
      { word: 'SAHABAT', hint: 'Rakan karib yang sentiasa menyokong.', exp: 'SAHABAT yang baik membawa pengaruh positif.' }
    ],
    '13-15': [
      { word: 'ALGORITMA', hint: 'Langkah tersusun untuk menyelesaikan sesuatu masalah.', exp: 'ALGORITMA ialah asas kepada pengaturcaraan komputer.' },
      { word: 'EKOSISTEM', hint: 'Interaksi antara hidupan dengan alam sekitarnya.', exp: 'Keseimbangan EKOSISTEM penting untuk kelestarian bumi.' },
      { word: 'HIPOTESIS', hint: 'Andaian awal yang perlu diuji melalui eksperimen.', exp: 'HIPOTESIS dibina sebelum menjalankan penyiasatan sains.' },
      { word: 'INOVASI', hint: 'Pembaharuan yang membawa nilai tambah.', exp: 'INOVASI memacu kemajuan teknologi dan masyarakat.' },
      { word: 'DEMOKRASI', hint: 'Sistem pemerintahan yang dipilih oleh rakyat.', exp: 'Malaysia mengamalkan sistem DEMOKRASI berparlimen.' }
    ],
    '16-17': [
      { word: 'KATALIS', hint: 'Bahan yang mempercepatkan kadar tindak balas kimia.', exp: 'KATALIS menurunkan tenaga pengaktifan sesuatu tindak balas.' },
      { word: 'PARADIGMA', hint: 'Kerangka pemikiran atau sudut pandang utama.', exp: 'Anjakan PARADIGMA mengubah cara kita melihat sesuatu isu.' },
      { word: 'SINTESIS', hint: 'Penggabungan pelbagai unsur membentuk satu kesatuan.', exp: 'SINTESIS maklumat memerlukan pemikiran kritis tahap tinggi.' },
      { word: 'MOMENTUM', hint: 'Hasil darab jisim dengan halaju sesuatu objek.', exp: 'MOMENTUM diabadikan dalam perlanggaran tertutup.' },
      { word: 'INTEGRITI', hint: 'Kejujuran dan ketelusan prinsip moral yang utuh.', exp: 'INTEGRITI adalah teras kepimpinan yang dipercayai.' }
    ]
  },
  logik: {
    '4-6': [
      { q: 'Lengkapkan corak ini: 🔴, 🔵, 🔴, 🔵, ___', opts: ['🔴', '🟢', '🟡', '🟣'], ans: 0, exp: 'Corak berselang-seli antara merah dan biru, jadi seterusnya ialah merah.' },
      { q: 'Manakah yang TIDAK boleh terbang?', opts: ['Burung', 'Kupu-kupu', 'Gajah', 'Lebah'], ans: 2, exp: 'Gajah tidak mempunyai sayap dan berjalan di atas tanah.' },
      { q: 'Apakah nombor selepas 7, 8, 9, ___?', opts: ['6', '10', '11', '8'], ans: 1, exp: 'Urutan nombor menaik satu demi satu: 7, 8, 9, 10.' },
      { q: 'Jika hari ini hari Isnin, esok hari apa?', opts: ['Ahad', 'Selasa', 'Rabu', 'Jumaat'], ans: 1, exp: 'Selepas hari Isnin ialah hari Selasa.' },
      { q: 'Objek manakah yang paling sejuk?', opts: ['Ais krim', 'Sup panas', 'Matahari', 'Unggun api'], ans: 0, exp: 'Ais krim disimpan sejuk dan beku.' }
    ],
    '7-9': [
      { q: 'Lengkapkan urutan nombor: 2, 4, 6, 8, ___', opts: ['9', '10', '11', '12'], ans: 1, exp: 'Setiap nombor bertambah 2 (sifir 2).' },
      { q: 'Ali lebih tinggi daripada Abu. Abu lebih tinggi daripada Chong. Siapakah paling rendah?', opts: ['Ali', 'Abu', 'Chong', 'Sama tinggi'], ans: 2, exp: 'Susunan tinggi: Ali > Abu > Chong, jadi Chong paling rendah.' },
      { q: 'Manakah objek yang ganjil dalam kumpulan ini?', opts: ['Epal', 'Oren', 'Kerusi', 'Mangga'], ans: 2, exp: 'Kerusi ialah perabot manakala yang lain ialah buah-buahan.' },
      { q: 'Lengkapkan urutan huruf: A, C, E, G, ___', opts: ['H', 'I', 'J', 'K'], ans: 1, exp: 'Melangkau satu huruf setiap langkah: A (B) C (D) E (F) G (H) I.' },
      { q: 'Berapakah penjuru pada sebuah segi tiga?', opts: ['2', '3', '4', '5'], ans: 1, exp: 'Segi tiga mempunyai 3 sisi dan 3 penjuru.' }
    ],
    '10-12': [
      { q: 'Lengkapkan siri: 3, 6, 12, 24, ___', opts: ['30', '36', '48', '42'], ans: 2, exp: 'Setiap nombor didarab dengan 2: 24 × 2 = 48.' },
      { q: 'Jika semua burung mempunyai bulu pelepah, dan merpati ialah burung, maka...', opts: ['Merpati boleh berenang', 'Merpati mempunyai bulu pelepah', 'Merpati tidak bertelur', 'Semua haiwan berbulu ialah merpati'], ans: 1, exp: 'Kesimpulan deduktif yang sah: merpati pasti mempunyai bulu pelepah.' },
      { q: 'Cari nombor seterusnya: 1, 4, 9, 16, ___', opts: ['20', '24', '25', '36'], ans: 2, exp: 'Ini ialah nombor kuasa dua: 1², 2², 3², 4², 5² = 25.' },
      { q: 'Dalam satu perlumbaan, anda memotong pelari di tempat kedua. Di kedudukan manakah anda sekarang?', opts: ['Pertama', 'Kedua', 'Ketiga', 'Keempat'], ans: 1, exp: 'Apabila memotong orang di tempat kedua, anda mengambil alih tempat kedua.' },
      { q: 'Perkataan manakah yang berlawanan maksud dengan "OPTIMIS"?', opts: ['Yakin', 'Pesimis', 'Ceria', 'Berani'], ans: 1, exp: 'Pesimis bermaksud bersikap negatif atau mudah berputus asa.' }
    ],
    '13-15': [
      { q: 'Lengkapkan jujukan Fibonacci: 1, 1, 2, 3, 5, 8, ___', opts: ['11', '12', '13', '15'], ans: 2, exp: 'Setiap nombor ialah hasil tambah dua nombor sebelumnya: 5 + 8 = 13.' },
      { q: 'Jika KOD ditulis sebagai LPE, bagaimanakah BUKU ditulis?', opts: ['CVLV', 'ATJT', 'CVLU', 'DWMW'], ans: 0, exp: 'Setiap huruf dianjakkan +1 dalam abjad: B→C, U→V, K→L, U→V.' },
      { q: '5 buah mesin mengambil masa 5 minit untuk membuat 5 alat. Berapa minit 100 mesin membuat 100 alat?', opts: ['100 minit', '50 minit', '5 minit', '1 minit'], ans: 2, exp: 'Setiap mesin membuat 1 alat dalam masa 5 minit secara serentak.' },
      { q: 'Manakah pernyataan yang logik? "Jika hujan, jalan basah." Jalan tidak basah. Maka...', opts: ['Hari sedang hujan', 'Hari tidak hujan', 'Jalan sedang dibaiki', 'Tiada kesimpulan'], ans: 1, exp: 'Mengikut hukum kontrapositif, jika akibat tidak berlaku, sebab juga tidak berlaku.' },
      { q: 'Cari nilai yang hilang: 2, 6, 12, 20, 30, ___', opts: ['36', '40', '42', '44'], ans: 2, exp: 'Perbezaan bertambah +4, +6, +8, +10, +12 → 30 + 12 = 42.' }
    ],
    '16-17': [
      { q: 'Dalam logik Boolean, apakah nilai bagi (BENAR DAN PALSU) ATAU BENAR?', opts: ['PALSU', 'BENAR', 'TIDAK TERTAKRIF', 'SIFAR'], ans: 1, exp: '(BENAR && PALSU) = PALSU; kemudian (PALSU || BENAR) = BENAR.' },
      { q: 'Lengkapkan siri: 2, 3, 5, 7, 11, 13, ___', opts: ['15', '16', '17', '19'], ans: 2, exp: 'Ini ialah urutan nombor perdana; nombor perdana selepas 13 ialah 17.' },
      { q: 'Sebuah jam menunjukkan pukul 3:15. Berapakah sudut kecil antara jarum jam dan jarum minit?', opts: ['0°', '7.5°', '15°', '30°'], ans: 1, exp: 'Jarum jam bergerak 0.5° setiap minit: 15 × 0.5° = 7.5° melepasi angka 3.' },
      { q: 'Jika P → Q adalah benar dan Q → R adalah benar, apakah yang pasti benar?', opts: ['R → P', 'P → R', '¬P → ¬R', 'Q → P'], ans: 1, exp: 'Hukum silogisme: jika P membawa kepada Q dan Q membawa kepada R, maka P → R.' },
      { q: 'Berapakah bilangan jabat tangan jika 6 orang berjabat tangan sesama sendiri sekali?', opts: ['12', '15', '18', '30'], ans: 1, exp: 'Gabungan ⁶C₂ = (6 × 5) / 2 = 15 jabat tangan.' }
    ]
  },
  gambar: {
    '4-6': [
      { pic: '🐘', q: 'Apakah nama haiwan besar yang mempunyai belalai panjang ini?', opts: ['Zirafah', 'Gajah', 'Singa', 'Arnab'], ans: 1, exp: 'Gajah menggunakan belalainya untuk mengambil makanan dan minum air.' },
      { pic: '☀️', q: 'Apakah objek bercahaya yang memanaskan Bumi pada waktu siang?', opts: ['Bulan', 'Matahari', 'Bintang', 'Awan'], ans: 1, exp: 'Matahari membekalkan cahaya dan haba kepada Bumi.' },
      { pic: '🚗', q: 'Kenderaan ini bergerak di atas jalan raya. Apakah ia?', opts: ['Kapal terbang', 'Kereta', 'Kapal layar', 'Roket'], ans: 1, exp: 'Kereta mempunyai empat roda untuk bergerak di jalan raya.' },
      { pic: '🍉', q: 'Buah ini berkulit hijau dan berair merah di dalamnya. Apakah namanya?', opts: ['Tembikai', 'Nanas', 'Durian', 'Betik'], ans: 0, exp: 'Tembikai sangat menyegarkan dimakan pada hari panas.' },
      { pic: '🐝', q: 'Serangga kecil ini menghasilkan madu yang manis. Siapakah ia?', opts: ['Semut', 'Lebah', 'Nyamuk', 'Lalat'], ans: 1, exp: 'Lebah mengumpul nektar bunga untuk menghasilkan madu.' }
    ],
    '7-9': [
      { pic: '🌋', q: 'Bentuk muka bumi ini boleh memuntahkan lava panas. Apakah ia?', opts: ['Gunung berapi', 'Air terjun', 'Gua batu', 'Lembah'], ans: 0, exp: 'Gunung berapi meletus apabila tekanan magma dari dalam bumi meningkat.' },
      { pic: '🧭', q: 'Alat ini digunakan oleh pengembara untuk menentukan arah utara dan selatan.', opts: ['Termometer', 'Kompas', 'Mikroskop', 'Jam randik'], ans: 1, exp: 'Jarum magnet kompas sentiasa menunjuk ke arah utara-selatan.' },
      { pic: '🐢', q: 'Haiwan reptilia ini membawa cengkerang keras di belakangnya dan bertelur di pantai.', opts: ['Buaya', 'Penyu', 'Ular', 'Cicak'], ans: 1, exp: 'Penyu laut berenang jauh dan kembali ke pantai untuk bertelur.' },
      { pic: '🎻', q: 'Alat muzik bertali ini dimainkan menggunakan penggesek. Apakah namanya?', opts: ['Dram', 'Biola', 'Seruling', 'Piano'], ans: 1, exp: 'Biola menghasilkan bunyi merdu apabila talinya digesek.' },
      { pic: '🌵', q: 'Tumbuhan berduri ini mampu menyimpan air dan hidup subur di kawasan gurun.', opts: ['Teratai', 'Kaktus', 'Paku-pakis', 'Kelapa'], ans: 1, exp: 'Kaktus mempunyai batang tebal untuk menyimpan air di kawasan kering.' }
    ],
    '10-12': [
      { pic: '🔬', q: 'Alat makmal ini digunakan untuk memerhati organisma seni seperti bakteria.', opts: ['Teleskop', 'Mikroskop', 'Periskop', 'Stetoskop'], ans: 1, exp: 'Mikroskop membesarkan imej objek yang terlalu kecil untuk dilihat mata kasar.' },
      { pic: '⚡🌧️', q: 'Fenomena cuaca ini melibatkan kilat, guruh dan hujan lebat.', opts: ['Kemarau', 'Ribut petir', 'Salji', 'Jerebu'], ans: 1, exp: 'Ribut petir berlaku apabila awan kumulonimbus terbentuk dengan pesat.' },
      { pic: '🛰️', q: 'Objek buatan manusia yang mengorbit Bumi untuk komunikasi dan ramalan cuaca.', opts: ['Asteroid', 'Satelit', 'Komet', 'Meteor'], ans: 1, exp: 'Satelit menghantar isyarat telekomunikasi dan imej cuaca ke Bumi.' },
      { pic: '🧬', q: 'Struktur heliks ganda dua ini membawa maklumat genetik semua hidupan.', opts: ['Protein', 'DNA', 'Karbohidrat', 'Vitamin'], ans: 1, exp: 'DNA (Asid Deoksiribonukleik) menyimpan kod genetik warisan.' },
      { pic: '♻️', q: 'Simbol tiga anak panah ini melambangkan amalan kelestarian alam iaitu...', opts: ['Pembakaran terbuka', 'Kitar semula', 'Penebangan hutan', 'Pencemaran air'], ans: 1, exp: 'Kitar semula membantu mengurangkan sisa pepejal dan menjimatkan sumber.' }
    ],
    '13-15': [
      { pic: '🔭🌌', q: 'Peralatan astronomi ini digunakan untuk mencerap objek jauh di angkasa lepas.', opts: ['Barometer', 'Teleskop', 'Higrometer', 'Galvanometer'], ans: 1, exp: 'Teleskop mengumpul cahaya atau sinaran elektromagnet dari angkasa.' },
      { pic: '🧲⚡', q: 'Gabungan magnet dan gegelung dawai berarus ini menghasilkan prinsip...', opts: ['Elektromagnet', 'Penapaian', 'Penyulingan', 'Pemejalwapan'], ans: 0, exp: 'Elektromagnet digunakan dalam motor elektrik, pembesar suara dan kereta api maglev.' },
      { pic: '🌡️📈', q: 'Peningkatan purata suhu atmosfera dan lautan Bumi secara jangka panjang merujuk kepada...', opts: ['Pemanasan global', 'Hujan asid', 'Hakisan tanah', 'Pasang surut'], ans: 0, exp: 'Pemanasan global berpunca daripada peningkatan gas rumah hijau.' },
      { pic: '⚖️🏛️', q: 'Simbol neraca keadilan ini berkait rapat dengan cabang...', opts: ['Kehakiman', 'Pertanian', 'Perindustrian', 'Pelancongan'], ans: 0, exp: 'Neraca melambangkan kesaksamaan dan keadilan dalam sistem perundangan.' },
      { pic: '🔋🔌', q: 'Komponen ini menukarkan tenaga kimia kepada tenaga elektrik dalam litar.', opts: ['Perintang', 'Sel kering / Bateri', 'Suis', 'Fius'], ans: 1, exp: 'Bateri membekalkan daya gerak elektrik untuk menggerakkan cas dalam litar.' }
    ],
    '16-17': [
      { pic: '⚛️💥', q: 'Proses pemecahan nukleus atom berat kepada nukleus lebih ringan sambil membebaskan tenaga.', opts: ['Pembelahan nuklear', 'Pelakuran nuklear', 'Elektrolisis', 'Penghabluran'], ans: 0, exp: 'Pembelahan nuklear digunakan dalam reaktor janakuasa nuklear.' },
      { pic: '📈💹', q: 'Graf pertumbuhan yang meningkat semakin curam mengikut gandaan dipanggil fungsi...', opts: ['Linear', 'Eksponen', 'Salar', 'Songsang'], ans: 1, exp: 'Fungsi eksponen menggambarkan pertumbuhan berganda seperti faedah kompaun.' },
      { pic: '🧠⚡', q: 'Sel khusus dalam sistem saraf yang menghantar impuls elektrik dikenali sebagai...', opts: ['Nefron', 'Neuron', 'Alveolus', 'Vilus'], ans: 1, exp: 'Neuron menghantar isyarat saraf antara otak dan seluruh badan.' },
      { pic: '🌐🔒', q: 'Protokol keselamatan yang menyulitkan komunikasi data antara pelayar dan pelayan web.', opts: ['HTTP', 'HTTPS / TLS', 'FTP', 'SMTP'], ans: 1, exp: 'HTTPS melindungi integriti dan kerahsiaan data pengguna di internet.' },
      { pic: '🧪🌈', q: 'Kertas litmus biru bertukar menjadi merah apabila diuji dengan larutan bersifat...', opts: ['Alkali', 'Asid', 'Neutral', 'Garam'], ans: 1, exp: 'Larutan berasid mempunyai nilai pH kurang daripada 7.' }
    ]
  },
  tekateki: {
    '4-6': [
      { q: 'Saya ada jarum tetapi tidak boleh menjahit, saya ada nombor tetapi tidak boleh mengira. Siapakah saya?', opts: ['Jam dinding', 'Baju', 'Kasut', 'Pensel'], ans: 0, exp: 'Jam mempunyai jarum jam dan nombor untuk menunjukkan masa!' },
      { q: 'Semakin banyak saya keringkan badan kamu, semakin basah diri saya. Apakah saya?', opts: ['Tuala', 'Payung', 'Bantal', 'Cermin'], ans: 0, exp: 'Tuala menyerap air dari badan dan menjadi basah.' },
      { q: 'Saya mempunyai empat kaki tetapi tidak boleh berjalan. Apakah saya?', opts: ['Meja', 'Kucing', 'Ayam', 'Kuda'], ans: 0, exp: 'Meja berdiri di atas empat kaki tetapi tidak bergerak.' },
      { q: 'Bila dibuka saya terang, bila ditutup saya gelap. Apakah saya?', opts: ['Lampu', 'Buku', 'Peti sejuk', 'Beg'], ans: 0, exp: 'Suis lampu menerangi bilik apabila dibuka.' },
      { q: 'Saya berwarna putih, jatuh dari langit bila hujan dan rasa sejuk. Apakah saya?', opts: ['Ais / Hujan batu', 'Kapas', 'Gula', 'Tepung'], ans: 0, exp: 'Ketulan ais kecil kadang-kadang turun bersama hujan lebat.' }
    ],
    '7-9': [
      { q: 'Apakah benda yang naik tetapi tidak pernah turun semula?', opts: ['Umur', 'Bola', 'Layang-layang', 'Belon'], ans: 0, exp: 'Umur kita sentiasa meningkat setiap tahun dan tidak pernah berkurang.' },
      { q: 'Saya ada leher tetapi tiada kepala, ada badan tetapi tiada kaki. Apakah saya?', opts: ['Botol', 'Ular', 'Zirafah', 'Gitar'], ans: 0, exp: 'Botol mempunyai bahagian leher dan badan.' },
      { q: 'Dalam banyak-banyak bas, bas apa yang pandai?', opts: ['Bas sekolah', 'Bas ekspres', 'Bas mini', 'Basikal'], ans: 0, exp: 'Bas sekolah membawa murid-murid pergi belajar!' },
      { q: 'Apakah yang mempunyai gigi yang banyak tetapi tidak boleh menggigit?', opts: ['Sikat rambut', 'Buaya', 'Jerung', 'Harimau'], ans: 0, exp: 'Gigi sikat digunakan untuk merapikan rambut.' },
      { q: 'Jika kamu pecahkan saya, barulah saya boleh digunakan. Apakah saya?', opts: ['Telur', 'Cawan', 'Cermin', 'Telefon'], ans: 0, exp: 'Telur perlu dipecahkan kulitnya sebelum dimasak.' }
    ],
    '10-12': [
      { q: 'Saya milik kamu sepenuhnya, tetapi orang lain lebih kerap menyebutnya berbanding diri kamu sendiri. Apakah saya?', opts: ['Nama kamu', 'Suara kamu', 'Bayang-bayang', 'Kasut kamu'], ans: 0, exp: 'Orang lain memanggil nama kita jauh lebih kerap daripada kita menyebutnya sendiri.' },
      { q: 'Apakah yang boleh mengelilingi seluruh dunia walaupun sentiasa duduk di penjuru?', opts: ['Setem pos', 'Kapal terbang', 'Angin', 'Awan'], ans: 0, exp: 'Setem ditampal di penjuru sampul surat yang dihantar ke seluruh dunia.' },
      { q: 'Saya ringan seperti bulu pelepah, tetapi orang paling kuat pun tidak mampu menahan saya selama 5 minit. Apakah saya?', opts: ['Nafas', 'Kapas', 'Kertas', 'Buih sabun'], ans: 0, exp: 'Manusia tidak mampu menahan nafas terlalu lama.' },
      { q: 'Lagi banyak kamu ambil dari saya, lagi besar saya menjadi. Apakah saya?', opts: ['Lubang', 'Kek', 'Beg duit', 'Baldi air'], ans: 0, exp: 'Semakin banyak tanah digali keluar, semakin besar lubang itu.' },
      { q: 'Saya mempunyai bandar tanpa rumah, gunung tanpa pokok, dan air tanpa ikan. Apakah saya?', opts: ['Peta', 'Mimpi', 'Lukisan', 'Kamera'], ans: 0, exp: 'Peta memaparkan simbol bandar, gunung dan sungai di atas kertas.' }
    ],
    '13-15': [
      { q: 'Saya bercakap tanpa mulut dan mendengar tanpa telinga. Saya tiada jasad tetapi hidup bersama angin. Apakah saya?', opts: ['Gema', 'Radio', 'Telefon', 'Bayang'], ans: 0, exp: 'Gema memantulkan bunyi suara apabila melantun pada permukaan keras.' },
      { q: 'Apa yang sentiasa di hadapan kamu tetapi tidak pernah dapat dilihat?', opts: ['Masa hadapan', 'Hidung', 'Cermin mata', 'Udara'], ans: 0, exp: 'Masa hadapan sentiasa menanti kita tetapi belum kelihatan.' },
      { q: 'Saya ada kunci tetapi tiada mangga, ada ruang tetapi tiada bilik, kamu boleh masuk tetapi tidak boleh keluar melalui saya. Apakah saya?', opts: ['Papan kekunci (Keyboard)', 'Pintu rumah', 'Kereta', 'Peti besi'], ans: 0, exp: 'Papan kekunci mempunyai kekunci (keys), kekunci ruang (space) dan Enter.' },
      { q: 'Jika dua orang ialah teman dan tiga orang ialah kumpulan, apakah empat dan lima?', opts: ['Sembilan', 'Pasukan', 'Keluarga', 'Ramai'], ans: 0, exp: 'Empat tambah lima bersamaan sembilan!' },
      { q: 'Benda apakah yang apabila disebut namanya, ia terus hilang?', opts: ['Kesunyian', 'Rahsia', 'Angin', 'Kegelapan'], ans: 0, exp: 'Kesunyian hilang sebaik sahaja sesuatu bunyi atau perkataan dilafazkan.' }
    ],
    '16-17': [
      { q: 'Saya mengukur masa; ada yang pantas dan ada yang perlahan. Bila saya habis, kamu akan merindui saya. Apakah saya?', opts: ['Masa', 'Pasir', 'Bateri', 'Lilin'], ans: 0, exp: 'Masa berlalu tanpa henti dan sangat berharga untuk dihargai.' },
      { q: 'Semakin banyak pengetahuan yang kamu berikan kepada orang lain, semakin banyak yang tinggal pada kamu. Apakah ia?', opts: ['Ilmu', 'Harta', 'Makanan', 'Tenaga'], ans: 0, exp: 'Ilmu tidak berkurang apabila dikongsi, malah semakin bertambah mantap.' },
      { q: 'Saya boleh mengisi sebuah bilik tanpa mengambil sebarang ruang fizikal. Apakah saya?', opts: ['Cahaya', 'Perabot', 'Air', 'Kotak'], ans: 0, exp: 'Cahaya menerangi seluruh ruang bilik tanpa memerlukan isi padu ruang.' },
      { q: 'Apakah yang berlari tanpa kaki, tidak pernah berjalan, ada mulut tetapi tidak pernah bercakap?', opts: ['Sungai', 'Kereta api', 'Jam', 'Angin'], ans: 0, exp: 'Sungai mengalir menuju ke muara (mulut sungai).' },
      { q: 'Saya sentiasa mengikuti kamu pada waktu siang, tetapi menghilang apabila gelap gelita. Apakah saya?', opts: ['Bayang-bayang', 'Kawan', 'Cermin', 'Tapak kaki'], ans: 0, exp: 'Bayang-bayang terbentuk apabila objek menghalang sumber cahaya.' }
    ]
  }
};
