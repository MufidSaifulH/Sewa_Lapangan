# Sewa_Lapangan
Tugas Project PPW_2

## Portal akun

- Buka `index.html` melalui localhost untuk masuk atau mendaftar.
- Pendaftaran membuat akun dengan role `user`; setelah login, user diarahkan ke menu lapangan.
- Akun demo admin: `admin@diofidarena.com` / `Admin123!`.
- Keluar menggunakan tombol **Keluar** di halaman masing-masing role.
- Menu admin berpindah ke halaman terpisah: Dashboard, Lapangan, Pemesanan, Pelanggan, Laporan, dan Pengaturan. Daftar pemesanan masih data contoh; laporan dan pengaturan belum terhubung ke backend.
- Admin dapat menambah, mengubah, menonaktifkan, dan menghapus lapangan dari bagian **Kelola Lapangan**. Informasi yang dikelola meliputi nama, olahraga, jenis/permukaan, harga per jam, jam operasional, foto, dan keterangan.
- Lapangan aktif ditampilkan pada menu pelanggan. Foto lapangan opsional dan dibatasi maksimal 1 MB.

Data akun dan lapangan disimpan di browser menggunakan `localStorage` dan sesi login di `sessionStorage`. Implementasi ini hanya untuk demo frontend; role dan data dapat dimanipulasi dari browser dan tidak aman untuk penggunaan produksi. Untuk produksi, pindahkan autentikasi, penyimpanan data, dan pemeriksaan role ke backend dengan database serta HTTPS.
