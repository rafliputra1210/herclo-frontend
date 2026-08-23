'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image_path?: string;
}

interface CompanyProfile {
  title: string;
  description: string;
  image_path?: string;
}

export default function ProfilePage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [teamRes, profileRes] = await Promise.all([
          api.get('/team'),
          api.get('/company-profile')
        ]);
        setTeamMembers(teamRes.data.data);
        setProfile(profileRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchProfileData();
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-emerald-500 selection:text-white pb-0">
      
      {/* SECTION 1: HERO & STATEMENT */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
            Kisah Kami — Est. 2026
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
            {profile?.title || 'Mendefinisikan Ulang Gaya.'}
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-gray-600 max-w-lg leading-relaxed whitespace-pre-line">
            {profile?.description || 'Berawal dari sebuah studio kecil di Surabaya, HERCLO hadir untuk mendobrak batasan antara kenyamanan harian dan estetika premium.'}
          </h2>
        </div>

        <div className="flex-1 w-full relative">
          <div className="aspect-[4/5] md:aspect-square relative rounded-3xl overflow-hidden shadow-2xl group">
            {profile?.image_path ? (
              <img 
                src={`http://127.0.0.1:8000${profile.image_path}`} 
                alt="HERCLO Studio" 
                className="w-full h-full object-cover transition-all duration-1000 ease-in-out transform group-hover:scale-105"
              />
            ) : (
              <Image 
                src="/profile-hero.jpg" 
                alt="HERCLO Studio" 
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-1000"></div>
          </div>
          {/* Ambient Glow / Pencahayaan Sinematik di belakang foto */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-20 -z-10 animate-pulse"></div>
        </div>
      </section>

      {/* SECTION 2: VISION & CRAFTSMANSHIP (Dark Mode) */}
      <section className="bg-gray-950 text-white py-32 relative overflow-hidden">
        {/* Dekorasi Animasi Partikel/Cahaya Latar Belakang */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white">Kualitas Tanpa Kompromi.</h3>
          
          <div className="space-y-8 text-lg text-gray-300 leading-relaxed font-light">
            <p>
              Setiap potongan kain, setiap jahitan, dan setiap siluet dirancang dengan ketelitian tingkat tinggi. Kami percaya bahwa pakaian bukan sekadar penutup tubuh, melainkan manifestasi dari identitas dan rasa percaya diri pemakainya.
            </p>
            <p>
              Dengan memadukan teknik pembuatan pakaian modern dan sentuhan seni klasik, koleksi kami diciptakan untuk mereka yang menghargai detail. Dari Dailywear yang esensial hingga koleksi eksklusif, kami memastikan Anda selalu tampil prima di setiap kesempatan.
            </p>
          </div>

          <div className="pt-12 border-t border-white/10 mt-12 inline-block">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2">Rafli Putra</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Founder & Creative Director</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE TEAM (Di Balik Layar) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black tracking-tight mb-4">Tim Penggerak HERCLO</h3>
            <p className="text-gray-500">Orang-orang berdedikasi di balik setiap koleksi premium yang Anda kenakan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {teamMembers.map((member) => (
              <div key={member.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6 shadow-lg bg-gray-200">
                  {member.image_path ? (
                    <img 
                      src={`http://127.0.0.1:8000${member.image_path}`} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
                  <p className="text-sm font-semibold text-emerald-600 mt-1 uppercase tracking-wider">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION */}
      <section className="relative py-32 overflow-hidden border-t border-gray-100 bg-white">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-10">
          <h3 className="text-4xl md:text-5xl font-black tracking-tight">Jadilah Bagian dari<br/>Perjalanan Kami.</h3>
          <p className="text-gray-500 text-lg">Temukan gaya yang mendefinisikan ulang karakter Anda hari ini.</p>
          
          <Link href="/collection" className="inline-block bg-black text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:-translate-y-1">
            Eksplorasi Koleksi Terbaru
          </Link>
        </div>
      </section>

    </main>
  );
}