import './globals.css';
import { Inter } from 'next/font/google';
import BottomNav from './components/BottomNav'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HERCLO. | Show More Be More',
  description: 'Dailywear, Sportwear, dan Muslimwear Premium',
  icons: {
    icon: '/LOGO HERCLO5.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        
        {/* --- TEKS BERJALAN (MARQUEE) --- */}
        <div className="bg-lime-400 text-black text-[11px] md:text-xs font-black uppercase tracking-[0.2em] py-2 overflow-hidden relative z-60">
          <div className="animate-marquee">
            ✦ PROMO EKSKLUSIF: GRATIS ONGKIR SELURUH INDONESIA ✦ NEW ARRIVAL: URBAN STREETWEAR 2026 ✦ DISKON 20% UNTUK MEMBER BARU ✦ ELEVATE YOUR STYLE DENGAN HERCLO ✦
          </div>
        </div>

        {/* Konten Utama Aplikasi */}
        <div className="pb-16 md:pb-0 relative"> 
          {/* Memberi padding bawah khusus di layar kecil (pb-16) agar konten terbawah tidak tertutup oleh navigasi */}
          {children}
        </div>

        {/* Navigasi Bawah untuk Mobile */}
        <BottomNav />
        
      </body>
    </html>
  );
}