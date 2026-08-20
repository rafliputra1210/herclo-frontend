'use client';

import { useState } from 'react';
import PublicHeader from '../components/PublicHeader';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulasi pengiriman pesan
    setTimeout(() => {
      alert('Terima kasih! Pesan Anda telah terkirim ke tim HERCLO. Kami akan merespons melalui email Anda segera.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 pb-20 relative">
      <PublicHeader />
      <header className="bg-black text-white py-24 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Hubungi Kami</h1>
        <p className="text-gray-400 max-w-xl mx-auto">Punya saran, keluhan, atau tawaran kerja sama? Jangan ragu untuk mengirimkan pesan kepada tim kami.</p>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Informasi Kontak */}
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-black mb-6">Let's Connect.</h2>
            <p className="text-gray-500 leading-relaxed">
              HERCLO selalu mengedepankan pengalaman berbelanja terbaik. Jika Anda membutuhkan bantuan terkait pesanan, pengiriman, atau informasi produk, gunakan informasi di bawah ini.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-xl">📍</div>
              <div>
                <h4 className="font-bold text-lg">Workshop & Studio</h4>
                <p className="text-gray-500 text-sm mt-1">Jl. Mawar Merah No. 12,<br/>Kecamatan Tandes, Surabaya<br/>Jawa Timur, 60187</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-xl">✉️</div>
              <div>
                <h4 className="font-bold text-lg">Email Official</h4>
                <p className="text-gray-500 text-sm mt-1">hello@herclo.com<br/>support@herclo.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-xl">📞</div>
              <div>
                <h4 className="font-bold text-lg">WhatsApp Admin</h4>
                <p className="text-gray-500 text-sm mt-1">+62 812-3456-7890<br/>(Senin - Sabtu, 09:00 - 17:00 WIB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulir Kontak */}
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h3 className="font-bold text-2xl mb-6">Kirim Pesan Langsung</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Nama Lengkap</label>
              <input 
                type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 p-3.5 rounded-lg outline-none focus:ring-2 focus:ring-black"
                placeholder="Nama Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email Aktif</label>
              <input 
                type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 p-3.5 rounded-lg outline-none focus:ring-2 focus:ring-black"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subjek Pesan</label>
              <input 
                type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full border border-gray-300 p-3.5 rounded-lg outline-none focus:ring-2 focus:ring-black"
                placeholder="Contoh: Konfirmasi Pembayaran"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Isi Pesan</label>
              <textarea 
                required rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full border border-gray-300 p-3.5 rounded-lg outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
              ></textarea>
            </div>
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}