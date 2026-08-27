'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';

const faqData = [
  {
    question: "Apakah produk HERCLO tersedia untuk pengiriman seluruh Indonesia?",
    answer: "Ya, kami melayani pengiriman ke seluruh wilayah Indonesia. Biaya ongkos kirim akan disesuaikan secara otomatis berdasarkan lokasi yang Anda masukkan saat proses checkout."
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer: "Kami menggunakan payment gateway Midtrans yang mendukung berbagai metode pembayaran, mulai dari Virtual Account (BCA, BNI, BRI, Mandiri), e-Wallet (GoPay, ShopeePay, OVO), hingga pembayaran via minimarket."
  },
  {
    question: "Bagaimana cara melacak pesanan saya?",
    answer: "Setelah pesanan Anda berhasil dibayar, Anda akan mendapatkan Kode Dashboard. Gunakan email Anda dan kode tersebut untuk login di halaman Dashboard, tempat Anda bisa memantau status pesanan secara real-time."
  },
  {
    question: "Apakah saya bisa menukar barang jika ukurannya tidak pas?",
    answer: "Tentu. Kami memiliki kebijakan penukaran barang (Return Policy) maksimal 3x24 jam setelah barang diterima, dengan syarat tag masih terpasang dan pakaian belum dicuci. Hubungi tim admin kami untuk proses penukaran."
  },
  {
    question: "Apakah gambar di website sesuai dengan aslinya?",
    answer: "100% Real Pict. Kami melakukan pemotretan di studio sendiri. Namun, mungkin ada sedikit perbedaan warna karena tingkat kecerahan atau kalibrasi layar perangkat Anda."
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert('Terima kasih! Pesan Anda telah terkirim ke tim HERCLO. Kami akan merespons melalui email Anda segera.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 pb-20 relative">
      <PublicHeader />
      
      {/* Header Banner */}
      <header className="bg-black text-white py-20 text-center px-6 relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-full transition-all hover:border-lime-400 active:scale-95 shadow-xs"
            >
              <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-lime-400">
            HERCLO OFFICIAL CONTACT
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
            Hubungi Kami
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Punya pertanyaan seputar pesanan, produk, atau ingin menyampaikan keluhan & saran? Kami siap membantu Anda.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        
        {/* SECTION 1: KANAN FORMS & KIRI KONTAK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Informasi Kontak */}
          <div className="space-y-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-lime-600 bg-lime-100 px-3 py-1 rounded-full inline-block mb-3">Let's Connect</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Terhubung dengan Tim HERCLO.</h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed mt-3">
                HERCLO selalu mengedepankan pengalaman berbelanja terbaik. Jika Anda membutuhkan bantuan terkait pesanan, pengiriman, atau informasi produk, gunakan kontak resmi kami di bawah ini.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/80 hover:border-gray-200 transition-colors">
                <div className="w-11 h-11 bg-black text-lime-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">Workshop & Studio</h4>
                  <p className="text-gray-500 text-xs md:text-sm mt-1 leading-relaxed">
                    Jl. Irigasi No.136, RT.9/RW.2, Ujung Menteng, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13960
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/80 hover:border-gray-200 transition-colors">
                <div className="w-11 h-11 bg-black text-lime-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">Email Official</h4>
                  <p className="text-gray-500 text-xs md:text-sm mt-1">hello@herclo.com • support@herclo.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/80 hover:border-gray-200 transition-colors">
                <div className="w-11 h-11 bg-black text-lime-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">WhatsApp Admin</h4>
                  <p className="text-gray-500 text-xs md:text-sm mt-1">+62 812-3456-7890 (Senin - Sabtu, 09:00 - 17:00 WIB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulir Kontak */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200/80 shadow-xs">
            <h3 className="font-black text-2xl mb-2 text-gray-900">Kirim Pesan Langsung</h3>
            <p className="text-xs text-gray-500 mb-6">Isi formulir di bawah ini dan tim kami akan membalas via email.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-gray-300 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="Masukkan Nama Anda"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Email Aktif</label>
                <input 
                  type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-gray-300 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Subjek Pesan</label>
                <input 
                  type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-white border border-gray-300 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="Contoh: Konfirmasi Pembayaran / Ukuran Produk"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Isi Pesan</label>
                <textarea 
                  required rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-white border border-gray-300 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black resize-none transition-all"
                  placeholder="Tuliskan pertanyaan atau pesan Anda secara detail..."
                ></textarea>
              </div>
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-md active:scale-[0.99]"
              >
                {isSubmitting ? 'Mengirim Pesan...' : 'Kirim Pesan Now'}
              </button>
            </form>
          </div>

        </div>

        {/* SECTION 2: PERTANYAAN POPULER (FAQ ACCORDION) */}
        <div id="faq" className="pt-10 border-t border-gray-100">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-lime-600 bg-lime-100 px-3 py-1 rounded-full inline-block mb-3">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <p className="text-gray-500 text-sm md:text-base mt-2">Temukan jawaban instan untuk pertanyaan umum seputar pengiriman, pembayaran, dan penukaran.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 bg-white">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-base md:text-lg text-gray-900 pr-4">{faq.question}</span>
                  <span className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold transition-transform duration-300 shrink-0 ${openFaqIndex === index ? 'rotate-45 bg-black text-lime-400' : 'text-gray-700'}`}>
                    +
                  </span>
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}