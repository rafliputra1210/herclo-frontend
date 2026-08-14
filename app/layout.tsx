import './globals.css';
import { Inter } from 'next/font/google';
import BottomNav from './components/BottomNav'; // <-- Tambahkan import ini

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HERCLO. | Elevate Your Style',
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
    <html lang="id">
      <body className={inter.className}>
        
        {/* Konten Utama Aplikasi */}
        <div className="pb-16 md:pb-0"> 
          {/* Memberi padding bawah khusus di layar kecil (pb-16) agar konten terbawah tidak tertutup oleh navigasi */}
          {children}
        </div>

        {/* Navigasi Bawah untuk Mobile */}
        <BottomNav />
        
      </body>
    </html>
  );
}