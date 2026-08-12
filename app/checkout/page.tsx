'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  // Tambahan State untuk Nama Penerima
  const [recipientName, setRecipientName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('herclo_cart') || '[]');
    if (localCart.length === 0) {
      router.push('/cart');
    } else {
      setCartItems(localCart);
    }
  }, [router]);

  const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Gabungkan Nama dan Alamat agar rapi masuk ke satu kolom database
    const fullShippingAddress = `${recipientName} | ${address}`;

    try {
      const response = await api.post('/checkout', { 
        shipping_address: fullShippingAddress,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.size || '-',
          color: item.color || '-'
        }))
      });
      
      // Kosongkan keranjang di browser setelah sukses
      localStorage.removeItem('herclo_cart');
      
      // Tampilkan Struk dengan Nama Pembeli
      setReceipt({
        order_id: response.data.order_id,
        name: recipientName,
        date: new Date().toLocaleString('id-ID'),
        items: cartItems,
        total: totalAmount,
        method: paymentMethod
      });
    } catch (error: any) {
      alert('Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- TAMPILAN STRUK PEMBELIAN ---
  if (receipt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-8 border-black relative overflow-hidden">
          {/* Efek gerigi struk di atas dan bawah */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgNSwxMCAxMCwwIiBmaWxsPSIjZjNmMTRiIi8+PC9zdmc+')] opacity-20"></div>
          
          <div className="text-center mb-6 mt-2">
            <h2 className="text-2xl font-black tracking-widest">HERCLO.</h2>
            <p className="text-gray-500 text-sm mt-1">Struk Pembelian</p>
            <p className="text-xs text-gray-400 mt-1">Order ID: #{receipt.order_id}</p>
            <p className="text-xs text-gray-400">{receipt.date}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-center">
             <p className="text-xs text-gray-500 mb-1">Pembeli / Penerima:</p>
             <p className="font-bold text-gray-800">{receipt.name}</p>
          </div>

          <div className="border-y border-dashed border-gray-300 py-4 mb-4 space-y-3">
            {receipt.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{item.size} | {item.color} | x{item.quantity}</p>
                </div>
                <p className="font-medium text-gray-800">Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between font-bold text-lg mb-2 text-gray-900">
            <span>Total Bayar</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(receipt.total)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-8">
            <span>Metode</span>
            <span className="font-medium uppercase">{receipt.method}</span>
          </div>
          
          <button onClick={() => router.push('/')} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // --- TAMPILAN HALAMAN CHECKOUT ---
  return (
    <main className="min-h-screen bg-gray-50 py-10 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Checkout Pesanan</h1>
        
        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: FORM INPUT */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">1. Informasi Pengiriman</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Nama Penerima</label>
                  <input 
                    type="text" 
                    required 
                    value={recipientName} 
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Contoh: Rafli Putra"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Alamat Lengkap</label>
                  <textarea 
                    required 
                    rows={3} 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama Jalan, RT/RW, Kecamatan, Kota, Kode Pos..."
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">2. Metode Pembayaran</h3>
              <div className="space-y-3">
                {['Transfer Bank', 'COD (Bayar di Tempat)', 'E-Wallet (OVO/Dana)'].map(method => (
                  <label 
                    key={method} 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === method ? 'border-black bg-gray-50 shadow-inner' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value={method} 
                      checked={paymentMethod === method} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                      className="mr-3 w-4 h-4 text-black focus:ring-black" 
                    />
                    <span className="font-medium text-sm text-gray-800">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: RINGKASAN */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Varian: {item.size} - {item.color} (x{item.quantity})</p>
                  </div>
                  <span className="font-medium text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-xl mb-6 text-gray-900">
              <span>Total Tagihan</span>
              <span>Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || !address || !recipientName} 
              className="w-full bg-black text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan Sekarang'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}