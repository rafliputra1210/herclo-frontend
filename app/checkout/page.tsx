'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { useRouter } from 'next/navigation';
import BackButton from '../components/BackButton';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // State untuk Data Akun Otomatis
  const [email, setEmail] = useState('');
  const [dashboardCode, setDashboardCode] = useState('');

  // State untuk Data Penerima Dasar
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Otomatis via Midtrans');

  // --- STATE WILAYAH (DROPDOWN BERJENJANG) ---
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const [selectedProv, setSelectedProv] = useState({ id: '', name: '' });
  const [selectedReg, setSelectedReg] = useState({ id: '', name: '' });
  const [selectedDist, setSelectedDist] = useState({ id: '', name: '' });
  const [selectedVill, setSelectedVill] = useState({ id: '', name: '' });
  const [addressDetail, setAddressDetail] = useState('');

  // State untuk Fitur Promo
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 1. Suntikkan Script Midtrans Snap
  useEffect(() => {
    const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = 'Mid-client-nKHReRtdDSAr5DCl'; // Pastikan Client Key kamu benar

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

  // 3. Fetch Data Provinsi & Promo Aktif Saat Halaman Dimuat
  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(res => res.json())
      .then(data => setProvinces(data));

    api.get('/promos')
      .then(res => setAvailablePromos(res.data.data || []))
      .catch(() => {});
  }, []);

  // --- HANDLER DROPDOWN WILAYAH ---
  const handleProvChange = async (e: any) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedProv({ id, name });
    setSelectedReg({ id: '', name: '' });
    setDistricts([]); setVillages([]);
    if (id) {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`);
      setRegencies(await res.json());
    }
  };

  const handleRegChange = async (e: any) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedReg({ id, name });
    setSelectedDist({ id: '', name: '' });
    setVillages([]);
    if (id) {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`);
      setDistricts(await res.json());
    }
  };

  const handleDistChange = async (e: any) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedDist({ id, name });
    setSelectedVill({ id: '', name: '' });
    if (id) {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`);
      setVillages(await res.json());
    }
  };

  const handleVillChange = (e: any) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedVill({ id, name });
  };

  // Hitung Total Belanja & Diskon
  const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const finalTotal = totalAmount - discountAmount;

  // 4. Fungsi Validasi Kode Promo
  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    try {
      const res = await api.post('/promo/validate', {
        code: promoCodeInput,
        total_amount: totalAmount
      });
      setDiscountAmount(res.data.discount_amount);
      setAppliedPromo(res.data.promo_code);
      alert(res.data.message);
    } catch (error: any) {
      setDiscountAmount(0);
      setAppliedPromo(null);
      alert(error.response?.data?.message || 'Gagal menggunakan promo');
    }
  };

  // 5. Proses Checkout & Midtrans
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Gabungkan nama, wa, dan alamat berjenjang untuk disimpan di database
    const fullShippingAddress = `${recipientName} | WA: ${phone} | ${addressDetail}, Desa/Kel. ${selectedVill.name}, Kec. ${selectedDist.name}, ${selectedReg.name}, Prov. ${selectedProv.name}`;

    try {
      const response = await api.post('/checkout', {
        email: email,
        dashboard_code: dashboardCode,
        shipping_address: fullShippingAddress,
        payment_method: paymentMethod,
        items: cartItems,
        promo_code: appliedPromo
      });

      const snapToken = response.data.snap_token;

      if (snapToken) {
        // @ts-ignore
        window.snap.pay(snapToken, {
          onSuccess: function (result: any) {
            localStorage.setItem('herclo_receipt', JSON.stringify({
              orderId: result.order_id, email, dashboardCode, total: finalTotal
            }));
            localStorage.removeItem('herclo_cart');
            router.push('/receipt');
          },
          onPending: function (result: any) {
            alert('Menunggu pembayaran diselesaikan...');
            localStorage.setItem('herclo_receipt', JSON.stringify({
              orderId: result.order_id, email, dashboardCode, total: finalTotal
            }));
            localStorage.removeItem('herclo_cart');
            router.push('/receipt');
          },
          onError: function () {
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

  // Validasi tombol bayar (semua dropdown wajib terisi)
  const isFormValid = email && dashboardCode.length >= 4 && recipientName && phone && selectedVill.id && addressDetail && cartItems.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 py-10 font-sans text-gray-900 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-8">Checkout Pesanan</h1>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* BAGIAN FORMULIR PENGISIAN */}
          <div className="lg:col-span-7 space-y-6">

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

            {/* Form Alamat Pengiriman Berjenjang */}
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
                  <label className="block text-sm font-semibold mb-1">Nomor WhatsApp / HP Aktif</label>
                  <input
                    type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890 (Untuk konfirmasi kurir)"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black transition-shadow"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-sm mb-3">Wilayah Pengiriman</h4>

                  {/* Grid Provinsi & Kota */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Provinsi</label>
                      <select required value={selectedProv.id} onChange={handleProvChange} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-black">
                        <option value="">-- Pilih Provinsi --</option>
                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kabupaten/Kota</label>
                      <select required value={selectedReg.id} onChange={handleRegChange} disabled={!selectedProv.id} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100">
                        <option value="">-- Pilih Kota/Kab --</option>
                        {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Grid Kecamatan & Desa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kecamatan</label>
                      <select required value={selectedDist.id} onChange={handleDistChange} disabled={!selectedReg.id} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100">
                        <option value="">-- Pilih Kecamatan --</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Desa/Kelurahan</label>
                      <select required value={selectedVill.id} onChange={handleVillChange} disabled={!selectedDist.id} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100">
                        <option value="">-- Pilih Desa --</option>
                        {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Detail Jalan / RT.RW / Patokan</label>
                    <textarea
                      required rows={3} value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman Blok A2 No.15, RT 01/RW 02. Pagar hitam."
                      className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black transition-shadow resize-none text-sm"
                    ></textarea>
                  </div>
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
                      <img src={`${BACKEND_URL}${item.product.image_path}`} alt={item.product.name} className="w-full h-full object-cover" />
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

            {/* FITUR KODE PROMO & VOUCHER */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <label className="block text-sm font-semibold mb-2">Punya Kode Promo / Voucher?</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  disabled={appliedPromo !== null}
                  placeholder="MASUKKAN KODE..."
                  className="flex-1 border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 uppercase text-sm font-bold"
                />
                {appliedPromo ? (
                  <button type="button" onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoCodeInput(''); }} className="px-4 bg-red-100 text-red-600 font-bold rounded-lg text-sm hover:bg-red-200 transition-colors">
                    Batal
                  </button>
                ) : (
                  <button type="button" onClick={handleApplyPromo} className="px-4 bg-black text-white font-bold rounded-lg text-sm hover:bg-gray-800 transition-colors">
                    Pakai
                  </button>
                )}
              </div>

              {/* DAFTAR VOUCHER AKTIF YANG BISA DIKLIK KONSUMEN */}
              {availablePromos.length > 0 && !appliedPromo && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Voucher Tersedia (Klik 1x untuk Pakai):</p>
                  <div className="flex flex-wrap gap-2">
                    {availablePromos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPromoCodeInput(p.code);
                          api.post('/promo/validate', { code: p.code, total_amount: totalAmount })
                            .then(res => {
                              setDiscountAmount(res.data.discount_amount);
                              setAppliedPromo(res.data.promo_code);
                            })
                            .catch(err => alert(err.response?.data?.message || 'Kode promo belum memenuhi syarat.'));
                        }}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>🎟️</span>
                        <span>{p.code}</span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          ({p.type === 'persen' ? `${p.value}%` : `Rp ${new Intl.NumberFormat('id-ID').format(p.value)}`})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RINCIAN HARGA */}
            <div className="space-y-3 mb-6 border-b border-gray-100 pb-6 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal Produk</span>
                <span>Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Diskon Promo ({appliedPromo})</span>
                  <span>- Rp {new Intl.NumberFormat('id-ID').format(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Biaya Layanan Midtrans</span>
                <span className="text-emerald-500 font-semibold">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between font-black text-2xl mb-8 text-gray-900">
              <span>Total Tagihan</span>
              <span>Rp {new Intl.NumberFormat('id-ID').format(finalTotal)}</span>
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