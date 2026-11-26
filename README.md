# DioFid Arena — Sewa Lapangan

Portal demo penyewaan lapangan dengan pintu masuk login/daftar dan dashboard terpisah berdasarkan peran.

## Struktur

- `index.html` — Satu-satunya halaman masuk dan daftar.
- `admin/` — Dashboard admin, pengelolaan lapangan, pemesanan, pelanggan, dan laporan.
- `user/` — Daftar lapangan, detail/pemesanan, serta panduan pelanggan.
- `assets/` — Skrip dan gaya bersama.

Jalankan melalui server lokal (misalnya Live Server di VS Code) agar fitur Web Crypto untuk kata sandi tersedia. Akun daftar baru masuk sebagai pelanggan. Akun demo admin: `admin@diofidarena.com` / `Admin123!`.

**Batasan demo:** akun, sesi, data lapangan, dan pemesanan disimpan di browser. Pemeriksaan peran di halaman statis bukan keamanan produksi; aplikasi ini belum memakai backend atau autentikasi server.
