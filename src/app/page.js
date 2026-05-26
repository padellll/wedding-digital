"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Calendar, 
  Send, 
  Sparkles, 
  Music, 
  VolumeX, 
  ChevronRight,
  Info
} from 'lucide-react';

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/lib/firebase.js";
import { supabase } from '@/lib/supabase';

/**
 * KONFIGURASI TEMA & TANGGAL
 */
const THEME = {
  primary: 'bg-emerald-900',
  secondary: 'text-emerald-800',
  accent: 'text-amber-500',
  border: 'border-amber-200/50',
  glass: 'bg-white/80 backdrop-blur-md'
};

const TARGET_DATE = new Date('2026-08-22T08:00:00');

/**
 * KOMPONEN: AI WISH FORMATTER
 * Menggunakan Gemini API untuk memperindah ucapan tamu
 */
const WishForm = ({ onSend }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const submitWish = async () => {
    if (!name || !message) return;

    const newWish = {
      name,
      text: message
    };

    await onSend(newWish);

    setName('');
    setMessage('');
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50">
      <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-2">
        <Heart className="w-4 h-4 text-amber-500" />
        <span className="text-sm italic font-medium">
          Ucapan & Doa
        </span>
      </div>

      <input
        type="text"
        placeholder="Nama"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 text-sm rounded-xl border border-emerald-200 outline-none"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tulis ucapan dan doa..."
        className="w-full p-3 text-sm rounded-xl border border-emerald-200 outline-none min-h-25"
      />

      <button
        onClick={submitWish}
        className="w-full py-2 bg-emerald-800 text-white rounded-lg text-sm font-semibold"
      >
        Kirim Ucapan
      </button>
    </div>
  );
};

/**
 * KOMPONEN UTAMA: APP
 */
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [wishes, setWishes] = useState([]);
  const addWish = async (wish) => {

  const { data, error } = await supabase
    .from('wishes')
    .insert([
      {
        name: wish.name,
        text: wish.text
      }
    ])
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  setWishes((prev) => [data, ...prev]);
};

const deleteWish = async (id) => {

  try {

    await fetch("/api/wishes", {

      method: "DELETE",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id
      })
    });

    setWishes((prev) =>
      prev.filter((wish) => wish.id !== id)
    );

  } catch (error) {

    console.log(error);
  }
};
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [attendance, setAttendance] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  // Efek Countdown Real-time
  useEffect(() => {

  const loadWishes = async () => {

    try {

      const res = await fetch(
        "/api/wishes"
      );

      const data = await res.json();

      setWishes(data || []);

    } catch (error) {

      console.log(error);
    }
  };

  loadWishes();

}, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const submitRSVP = async () => {

  if (!guestName || !guestCount || !attendance) {

    alert("Lengkapi data terlebih dahulu");

    return;
  }

  const { data, error } = await supabase
    .from('rsvp')
    .insert([
      {
        nama: guestName,
        jumlah_tamu: guestCount,
        kehadiran: attendance
      }
    ]);

  console.log(data);
  console.log(error);

  if (error) {

    alert(error.message);

    return;
  }

  alert("Konfirmasi berhasil dikirim");

  setGuestName('');
  setGuestCount('');
  setAttendance('');
};

  // Kontrol Audio
  useEffect(() => {
    if (isOpen && audioRef.current) {
      const playAudio = async () => {
        try {
          audioRef.current.volume = 0.4;
          await audioRef.current.play();
          setIsMuted(false);
        } catch (err) {
          console.log("Autoplay block:", err);
          setIsMuted(true);
        }
      };
      playAudio();
    }
  }, [isOpen]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  // LAYAR PEMBUKA (COVER)
  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#064e3b 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 z-10"
        >
          <span className="text-amber-600 tracking-[0.4em] text-xs uppercase mb-6 block font-bold">The Wedding Of</span>
          <h1 className="font-serif text-[42px] sm:text-[58px] md:text-[82px] text-emerald-900 mb-4 font-bold whitespace-nowrap leading-tight"> Zami <span className="text-amber-500 font-light"> & </span> Intan </h1>
          <p className="font-light text-stone-500 italic mb-12 text-base md:text-lg">Sabtu, 22 Agustus 2026</p>
          
          <div className="mb-10 text-stone-600 space-y-2">
            <p className="text-xs uppercase tracking-widest font-semibold">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <h3 className="text-2xl font-bold text-emerald-950">Tamu Undangan</h3>
          </div>

          <button 
            onClick={() => setIsOpen(true)}
            className="group relative px-10 py-4 bg-emerald-900 text-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/30"
          >
            <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
              Buka Undangan <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  // ISI UNDANGAN UTAMA
  return (
    <div className="bg-stone-50 text-stone-800 min-h-screen selection:bg-amber-100 font-sans overflow-x-hidden">
      {/* Background Audio */}
      <audio ref={audioRef} loop preload="auto">
        <source src="audio/beautiful-in-white.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Floating UI */}
      <button 
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-2xl flex items-center justify-center text-emerald-900 border border-emerald-100 transition-transform active:scale-90"
      >
        {isMuted ? <VolumeX size={24} /> : <Music size={24} className="animate-bounce" />}
      </button>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-40">
          {/* Desktop */}
           <img 
            src="images/wedding-bg.jpg" 
            className="w-full h-full object-cover md:object-center object-[65%_center]" 
            alt="Wedding Background" 
           />  
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-emerald-950/80 via-emerald-950/40 to-emerald-950/90"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center text-white p-6"
        >
          <div className="w-24 h-px bg-amber-500 mx-auto mb-6"></div>
          <p className="uppercase tracking-[0.5em] text-xs mb-6 text-amber-200 font-bold">Menuju Hari Bahagia</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl sm:text-6xl md:text-8xl lg:text-9xl mb-8 font-bold leading-tight">Zami & Intan</h2>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 mt-10 sm:mt-12 bg-emerald-950/30 p-4 sm:p-6 rounded-3xl backdrop-blur-sm border border-white/10">
            {Object.entries(timeLeft).map(([unit, val]) => (
              <div key={unit} className="text-center min-w-15 sm:min-w-20">
                <div className="text-2xl sm:text-3xl sm:text-4xl md:text-5xl md:text-5xl font-serif text-amber-400 font-bold">{val}</div>
                <div className="text-[10px] uppercase tracking-widest text-emerald-100 font-medium">
                  {unit === 'd' ? 'Hari' : unit === 'h' ? 'Jam' : unit === 'm' ? 'Menit' : 'Detik'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Profil Section */}
      <section className="py-16 md:py-24 px-6 max-w-5xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-6 text-emerald-900 font-bold italic">Assalamu’alaikum Wr. Wb.</h3>
          <p className="text-stone-500 font-light leading-relaxed max-w-2xl mx-auto text-base md:text-lg">
            Maha suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu untuk menghadiri pernikahan kami:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
          {/* Groom */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-4 border-2 border-amber-500/30 rounded-full rotate-12"></div>
              <div className="absolute -inset-4 border-2 border-emerald-900/20 rounded-full -rotate-12"></div>
              <img src="images/zami.jpg" className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover object-[center_20%] scale-90 bg-emerald-50 rounded-full border-8 border-white shadow-2xl relative z-10" alt="Zami" />
            </div>
            <h4 className="font-serif text-[22px] sm:text-[30px] md:text-[42px] text-emerald-900 font-bold mb-3 leading-tight whitespace-nowrap">Ahmad Nurul Zam Zami</h4>
            <p className="text-amber-600 font-semibold text-sm mb-4 uppercase tracking-widest">Putra Pertama Bapak Hasan & Ibu Yandriana</p>
          </motion.div>

          {/* Bride */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-4 border-2 border-amber-500/30 rounded-full -rotate-12"></div>
              <div className="absolute -inset-4 border-2 border-emerald-900/20 rounded-full rotate-12"></div>
              <img src="images/intan.jpg" className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover object-[center_20%] scale-90 bg-emerald-50 rounded-full border-8 border-white shadow-2xl relative z-10" alt="Intan" />
            </div>
            <h4 className="font-serif text-[22px] sm:text-[30px] md:text-[42px] text-emerald-900 font-bold mb-3 leading-tight whitespace-nowrap">Nur Intan Rizkiana</h4>
            <p className="text-amber-600 font-semibold text-sm mb-4 uppercase tracking-widest">Putri Pertama Bapak Saiman & Ibu Inta Marini</p>
          </motion.div>
        </div>
      </section>

      {/* Info Acara */}
      <section className="bg-emerald-950 py-16 md:py-24 px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <Heart size={300} />
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl"
          >
            <Calendar className="text-amber-500 mb-8" size={48} />
            <h5 className="font-serif text-3xl mb-4 font-bold">Akad Nikah</h5>
            <div className="font-light text-sm text-amber-300 mb-2">Senin, 16 Agustus 2026</div>
            <div className="h-0.5 w-16 bg-amber-500 mb-8"></div>
            <div className="space-y-6 text-stone-200">
              <p className="flex items-center gap-4 text-base md:text-lg"><Clock className="text-amber-400" size={20} /> - WIB</p>
              <p className="flex items-start gap-4 text-base md:text-lg leading-relaxed"><MapPin className="text-amber-400 mt-1" size={20} /> Jln. Kemang Utara IX, Jakarta Selatan</p>
            </div>
            <a
  href="https://maps.app.goo.gl/pCtrsUSd9oFRqp8NA?g_st=ic"
  target="_blank"
  rel="noopener noreferrer"
  className="block mt-10 w-full py-4 border border-amber-500/50 text-amber-500 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-emerald-950 transition-all text-center"
>
  Buka Google Maps
</a>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl"
          >
            <Heart className="text-amber-500 mb-8" size={48} />
            <h5 className="font-serif text-3xl mb-4 font-bold">Ngunduh Mantu</h5>
            <div className="font-light text-sm text-amber-300 mb-2">Sabtu, 22 Agustus 2026</div>
            <div className="h-0.5 w-16 bg-amber-500 mb-8"></div>
            <div className="space-y-6 text-stone-200">
              <p className="flex items-center gap-4 text-base md:text-lg"><Clock className="text-amber-400" size={20} /> - </p>
              <p className="flex items-start gap-4 text-base md:text-lg leading-relaxed"><MapPin className="text-amber-400 mt-1" size={20} /> Cilandak Dalam VIII, Jakarta Selatan</p>
            </div>
            <a
  href="https://maps.app.goo.gl/MxSACmCsBBfF4VMT7?g_st=ic"
  target="_blank"
  rel="noopener noreferrer"
  className="block mt-10 w-full py-4 border border-amber-500/50 text-amber-500 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-emerald-950 transition-all text-center"
>
  Buka Google Maps
</a>
          </motion.div>
        </div>
      </section>

      {/* Prewedding Gallery */}
<section className="py-16 md:py-24 px-6 bg-stone-100 overflow-hidden border-y border-stone-200">
  <div className="max-w-6xl mx-auto">

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-20"
    >
      <p className="uppercase tracking-[0.4em] text-xs text-amber-600 font-bold mb-4">
        Our Moments
      </p>

      <h3 className="font-serif text-5xl text-emerald-900 font-bold italic mb-6">
        Pre-Wedding Gallery
      </h3>

      <div className="w-24 h-px bg-amber-500 mx-auto mb-8"></div>

      <p className="max-w-2xl mx-auto text-stone-500 leading-relaxed text-base md:text-lg font-light">
        Setiap perjalanan memiliki cerita indahnya sendiri. 
        Berikut beberapa momen yang menjadi bagian dari perjalanan cinta kami.
      </p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">

      {[
        "images/prewed1.jpg",
        "images/prewed2.jpg",
        "images/prewed3.jpg",
        "images/prewed4.jpg",
        "images/prewed5.jpg",
        "images/prewed6.jpg"
      ].map((img, idx) => (

        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: idx * 0.1
          }}
          whileHover={{
            y: -10
          }}
          className="group relative overflow-hidden rounded-4x1 bg-white border border-white/50 shadow-2xl"
        >

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-emerald-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>

          {/* Image */}
          <img
            src={img}
            alt={`Prewedding ${idx + 1}`}
            className="w-full h-64 sm:h-80 md:h-96 object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Text Hover */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <p className="text-white font-serif text-2xl italic">
              Zami & Intan
            </p>

            <div className="w-12 h-px bg-amber-400 mt-3"></div>
          </div>

        </motion.div>
      ))}

    </div>
  </div>
</section>

      {/* RSVP & Wishlist */}
<section className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16 lg:gap-20">
    

    {/* RSVP */}
    <div>
      <h3 className="font-serif text-center text-3xl sm:text-4xl md:text-5xl text-emerald-900 mb-4 font-bold italic">
        Konfirmasi Kehadiran
      </h3>

      <p className="text-center text-stone-500 mb-10">
        Bantu kami mempersiapkan segalanya dengan memberikan konfirmasi kehadiran Anda.
      </p>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          submitRSVP();
        }}
      >
        <input
          type="text"
          placeholder="Nama Lengkap"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-4 md:p-5 rounded-2xl bg-white border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-800 transition-all shadow-sm"
        />

        <div className="grid grid-cols-2 gap-6">
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-800 shadow-sm font-medium"
          >
            <option value="">Jumlah Tamu</option>
            <option value="1 Orang">1 Orang</option>
            <option value="2 Orang">2 Orang</option>
          </select>

          <select
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
            className="p-4 md:p-5 rounded-2xl bg-white border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-800 shadow-sm font-medium"
          >
            <option value="">Kehadiran</option>
            <option value="Hadir">Hadir</option>
            <option value="Tidak Hadir">Tidak Hadir</option>
          </select>
        </div>

        <button className="w-full py-5 bg-emerald-900 text-white rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all">
          Kirim Konfirmasi
        </button>
      </form>
    </div>

    {/* Wishlist */}
    <div className="space-y-10 lg:mt-0 mt-8">

      <div>
        <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-emerald-900 mb-4 font-bold italic text-center">
          Ucapan & Doa
        </h3>

        <p className="text-sm text-stone-500 mb-6 text-center font-medium">
          Berikan ucapan dan doa terbaik Anda untuk kedua mempelai..
        </p>

        <WishForm onSend={addWish} />
      </div>

      <div className="h-112.5 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
        <AnimatePresence>
          {(wishes ?? [])
            .filter((w) => w?.name && w?.text)
            .map((wish, idx) => (
              <motion.div
                key={wish.id || idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-white rounded-3xl border border-stone-100 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3 text-emerald-900">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold uppercase">
                    {wish?.name?.charAt(0) || "?"}
                  </div>

                  <p className="font-bold text-sm tracking-wide">
                    {wish?.name || "Anonymous"}
                  </p>
                </div>

                <p className="text-stone-600 text-sm italic leading-relaxed font-light">
                  "{wish?.text || ""}"
                </p>

                <button
                  onClick={() => deleteWish(wish.id)}
                  className="mt-4 text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Hapus
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>

  </div>
</section>

      {/* Tanda Terima Kasih */}
<section className="bg-stone-100 py-16 md:py-24 text-center px-6 border-y border-stone-200">
  <div className="max-w-2xl mx-auto">
    <Heart className="mx-auto text-amber-500 mb-8 animate-pulse" size={40} />
    
    <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-emerald-900 mb-6 font-bold italic">
      Terima Kasih
    </h3>

    <p className="text-stone-600 leading-relaxed text-base md:text-lg font-light">
      Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
      Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu
      untuk hari bahagia kami.
    </p>

    <p className="mt-6 text-stone-500 italic">
      Sampai jumpa di hari istimewa kami.
    </p>
  </div>
</section>

      {/* Footer */}
      <footer className="py-12 md:py-20 bg-emerald-950 text-center text-white/50 px-6 relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="font-serif text-3xl text-amber-500 mb-3 italic">Terima Kasih</h4>
          <p className="text-xs uppercase tracking-[0.5em] mb-12 font-bold">Zami & Intan</p>
          <div className="w-16 h-px bg-white/20 mx-auto mb-8"></div>
          <p className="text-[10px] opacity-40 uppercase tracking-widest">© 2026 Digital Invitation</p>
        </div>
      </footer>

      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');

        html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  overflow-x: hidden;
}

img {
  max-width: 100%;
  height: auto;
}
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #064e3b;
          border-radius: 20px;
        }
        
        body {
          scroll-behavior: smooth;
        }
      `}} />
    </div>
  );
}