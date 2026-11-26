# Sewa_Lapangan
Tugas Project PPW_2

## Portal akun

- Buka `index.html` melalui localhost untuk masuk atau mendaftar.
- Pendaftaran membuat akun dengan role `user`; setelah login, user diarahkan ke menu lapangan.
- Akun demo admin: `admin@diofidarena.com` / `Admin123!`.
- Keluar menggunakan tombol **Keluar** di halaman masing-masing role.
- Menu admin berpindah ke halaman terpisah: Dashboard, Lapangan, Pemesanan, Pelanggan, dan Laporan. Dashboard dan menu Pemesanan menampilkan transaksi dari pemesanan pelanggan; admin dapat mengubah status transaksi.
- Admin dapat menambah, mengubah, menonaktifkan, dan menghapus lapangan dari bagian **Kelola Lapangan**. Informasi yang dikelola meliputi nama, olahraga, jenis/permukaan, harga per jam, jam operasional, foto, dan keterangan.
- Lapangan aktif ditampilkan pada menu pelanggan. Pelanggan dapat memilih tanggal dan slot satu jam dalam jam operasional; slot yang sudah dipesan tidak dapat dipilih. Pemesanan baru masuk dengan status menunggu konfirmasi admin. Foto lapangan opsional dan dibatasi maksimal 1 MB.

Data akun, lapangan, dan transaksi tersimpan di browser menggunakan `localStorage`; sesi login menggunakan `sessionStorage`. Karena aplikasi ini belum memiliki backend/database server, data hanya tersedia di browser/perangkat dan origin yang sama, dapat dimanipulasi dari browser, dan belum aman atau tersinkron untuk penggunaan produksi. Untuk produksi, pindahkan autentikasi, penyimpanan, pemeriksaan jadwal/transaksi, dan role ke backend dengan database serta HTTPS.
