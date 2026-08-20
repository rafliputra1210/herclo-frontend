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
    answer: "Setelah pesanan Anda berhasil dibayar, Anda akan mendapatkan 'Kode Dashboard'. Gunakan email Anda dan kode tersebut untuk login di halaman Dashboard, tempat Anda bisa memantau status pesanan secara real-time."
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

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 pb-24 relative">
      <PublicHeader />
      <header className="bg-gray-50 py-20 text-center border-b border-gray-100 px-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Pertanyaan Populer (FAQ)</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Temukan jawaban cepat untuk pertanyaan yang sering diajukan oleh pelanggan HERCLO.</p>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-lg pr-4">{faq.question}</span>
                <span className={`text-2xl transition-transform duration-300 ${openIndex === index ? 'rotate-45 text-gray-400' : 'text-black'}`}>
                  +
                </span>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed border-t pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-gray-50 p-8 rounded-2xl border border-gray-100">
          <h3 className="font-bold text-xl mb-2">Masih punya pertanyaan?</h3>
          <p className="text-gray-500 mb-6 text-sm">Tim kami siap membantu menjawab kebingungan Anda.</p>
          <Link href="/contact" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
            Hubungi Kami
          </Link>
        </div>
      </div>
    </main>
  );
}