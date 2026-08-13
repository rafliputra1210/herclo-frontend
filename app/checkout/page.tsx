'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios'; // Pastikan path ini sesuai dengan struktur folder kamu
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // State untuk Data Akun Otomatis
  const [email, setEmail] = useState('');
  const [dashboardCode, setDashboardCode] = useState('');

  // State untuk Data Pengiriman
  const [recipientName, setRecipientName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Otomatis via Midtrans');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 1. Suntikkan Script Midtrans Snap
  useEffect(() => {
    const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
    // PENTING: Ganti dengan Client Key Sandbox Midtrans milikmu
    const clientKey = 'Mid-client-nKHReRtdDSAr5DCl';

    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2. Baca Data Keranjang dari LocalStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('herclo_cart') || '[]');
    if (savedCart.length === 0) {
      alert('Keranjang Anda kosong! Silakan pilih produk terlebih dahulu.');
      router.push('/');
    } else {
      setCartItems(savedCart);
    }
  }, [router]);

  // Hitung Total Belanja
  const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // 3. Proses Checkout & Pemanggilan Midtrans
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Gabungkan nama dan alamat untuk disimpan di database
    const fullShippingAddress = `${recipientName} | ${address}`;

    try {
      // Tembak API Checkout di Laravel (termasuk email & kode dashboard)
      const response = await api.post('/checkout', {
        email: email,
        dashboard_code: dashboardCode,
        shipping_address: fullShippingAddress,
        payment_method: paymentMethod,
        items: cartItems
      });

      const snapToken = response.data.snap_token;

      // Panggil Popup Midtrans jika Token berhasil didapat
      if (snapToken) {
        // @ts-ignore
        window.snap.pay(snapToken, {
          onSuccess: function (result: any) {
            // Simpan data struk sementara untuk halaman /receipt
            localStorage.setItem('herclo_receipt', JSON.stringify({
              orderId: result.order_id,
              email: email,
              dashboardCode: dashboardCode,
              total: totalAmount
            }));
            localStorage.removeItem('herclo_cart'); // Kosongkan keranjang
            router.push('/receipt'); // Lempar ke halaman sukses
          },
          onPending: function (result: any) {
            alert('Menunggu pembayaran diselesaikan...');
            // Tetap simpan struk dan lempar ke /receipt agar pelanggan tahu kode aksesnya
            localStorage.setItem('herclo_receipt', JSON.stringify({
              orderId: result.order_id,
              email: email,
              dashboardCode: dashboardCode,
              total: totalAmount
            }));
            localStorage.removeItem('herclo_cart');
            router.push('/receipt');
          },
          onError: function (result: any) {
            alert('Pembayaran gagal! Silakan coba lagi.');
          },
          onClose: function () {
            alert('Anda menutup popup sebelum menyelesaikan pembayaran.');
          }
        });
      }

    } catch (error: any) {
      alert('Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validasi tombol bayar (semua wajib diisi)
  const isFormValid = email && dashboardCode.length >= 4 && recipientName && address && cartItems.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 py-10 font-sans text-gray-900 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-black tracking-tight mb-8">Checkout Pesanan</h1>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* BAGIAN FORMULIR PENGISIAN */}
          <div className="space-y-6">

            {/* Form Akun Otomatis */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h3 className="font-bold text-lg mb-1">1. Informasi Akun</h3>
              <p className="text-xs text-gray-500 mb-5">Kami akan membuatkan akses otomatis untuk melacak pesanan Anda.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Email Aktif</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com (Untuk mengirim struk)"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Buat Kode Dashboard</label>
                  <input
                    type="text" required minLength={4} value={dashboardCode} onChange={(e) => setDashboardCode(e.target.value)}
                    placeholder="Minimal 4 Karakter (Contoh: HERCLO123)"
                    className="w-full border border-emerald-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/50 transition-shadow font-medium"
                  />
                  <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                    * Simpan kode ini. Digunakan sebagai password untuk melacak resi pengiriman.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Alamat Pengiriman */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
              <h3 className="font-bold text-lg mb-5">2. Alamat Pengiriman</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nama Lengkap Penerima</label>
                  <input
                    type="text" required value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Sesuai KTP / Nama Panggilan"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Alamat Lengkap Tujuan</label>
                  <textarea
                    required rows={3} value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama Jalan, RT/RW, Patokan Rumah, Kecamatan, Kota, Kode Pos..."
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black transition-shadow resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

          </div>

          {/* BAGIAN RINGKASAN PESANAN (SIDEBAR KANAN) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>

            <div className="space-y-4 mb-6 border-b border-gray-100 pb-6 max-h-64 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image_path ? (
                      <img src={`http://127.0.0.1:8000${item.product.image_path}`} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Produk</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Varian: {item.size} - {item.color}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-semibold text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-bold text-sm text-black">Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 border-b border-gray-100 pb-6 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal Produk</span>
                <span>Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Biaya Layanan Midtrans</span>
                <span className="text-emerald-500 font-semibold">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between font-black text-2xl mb-8 text-gray-900">
              <span>Total Tagihan</span>
              <span>Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full bg-black text-white py-4 rounded-xl font-black hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
            >
              {isSubmitting ? 'Memproses Pesanan...' : (
                <>Bayar dengan <span className="bg-white text-black px-2.5 py-0.5 rounded text-sm font-black ml-1">Midtrans</span></>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              🔒 Pembayaran aman & terenkripsi
            </p>
          </div>

        </form>
      </div>
    </main>
  );
}