'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ShaderBackground from '@/components/ui/shader-background';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import {
  Phone,
  MapPin,
  CalendarDays,
  Stethoscope,
  AlertTriangle,
  User,
  ChevronRight,
  Heart,
  Activity,
  Lightbulb,
  Mail,
  Star,
  Clock,
  Shield,
  Brain,
  Bone,
  Baby,
  Eye,
  Pill,
  MessageSquare,
  Send,
} from 'lucide-react';

/* ─────────────────────────── Data ─────────────────────────── */
const doctors = [
  { name: 'Dr. Sameer Sharma', specialty: 'General Physician', distanceKm: 1.2, phone: '+91 98877-66554', rating: 4.9, wait: '~10 min' },
  { name: 'Dr. Anjali Gupta', specialty: 'Cardiologist', distanceKm: 2.3, phone: '+91 91122-33445', rating: 4.8, wait: '~20 min' },
  { name: 'Dr. Vikram Reddy', specialty: 'Pediatrician', distanceKm: 3.1, phone: '+91 90000-11111', rating: 4.7, wait: '~15 min' },
  { name: 'Dr. Rajesh Deshmukh', specialty: 'Orthopedic', distanceKm: 4.0, phone: '+91 88888-22222', rating: 4.6, wait: '~30 min' },
];

const specialties = [
  { label: 'Cardiology', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', desc: 'Heart & vascular care' },
  { label: 'Neurology', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', desc: 'Brain & nervous system' },
  { label: 'Pediatrics', icon: Baby, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', desc: "Children's health" },
  { label: 'Orthopedics', icon: Bone, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', desc: 'Bones & joints' },
  { label: 'Ophthalmology', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20', desc: 'Eye care & vision' },
  { label: 'General Practice', icon: Stethoscope, color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', desc: 'Primary care' },
  { label: 'Psychiatry', icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20', desc: 'Mental health' },
  { label: 'Pharmacy', icon: Pill, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', desc: 'Medication & prescriptions' },
];

const healthTips = [
  { title: 'Stay Hydrated', body: 'Drink at least 8 glasses of water a day to maintain optimal body function and energy levels.', tag: 'Wellness', color: 'text-blue-400' },
  { title: 'Regular Exercise', body: '30 minutes of moderate exercise five days a week significantly reduces the risk of chronic diseases.', tag: 'Fitness', color: 'text-green-400' },
  { title: 'Sleep Well', body: 'Adults need 7–9 hours of quality sleep per night for proper cognitive and physical recovery.', tag: 'Recovery', color: 'text-violet-400' },
  { title: 'Balanced Diet', body: 'Incorporate fruits, vegetables, whole grains, and lean proteins in every meal for long-term health.', tag: 'Nutrition', color: 'text-amber-400' },
  { title: 'Mental Health', body: 'Practice mindfulness, deep breathing, or meditation for at least 10 minutes daily to reduce stress.', tag: 'Mind', color: 'text-pink-400' },
  { title: 'Regular Checkups', body: 'Schedule annual health screenings even when you feel healthy to detect issues early.', tag: 'Prevention', color: 'text-cyan-400' },
];

type TabId = 'home' | 'find' | 'specialties' | 'tips' | 'book' | 'emergency' | 'contact';


/* ─────────────────────────── Component ─────────────────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [locationStatus, setLocationStatus] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [doctorList, setDoctorList] = useState<typeof doctors>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '+91 ', doctor: '', date: '', notes: '' });
  const [contact, setContact] = useState({ name: '', email: '', message: '' });

  // DB Data State (falling back to hardcoded arrays if DB is empty)
  const [dbDoctors, setDbDoctors] = useState<typeof doctors>(doctors);
  const [dbSpecialties, setDbSpecialties] = useState<typeof specialties>(specialties);
  const [dbHealthTips, setDbHealthTips] = useState<typeof healthTips>(healthTips);

  useEffect(() => {
    async function fetchData() {
      const { data: doctorsData } = await supabase.from('doctors').select('*');
      const { data: specialtiesData } = await supabase.from('specialties').select('*');
      const { data: tipsData } = await supabase.from('health_tips').select('*');

      if (doctorsData && doctorsData.length > 0) {
        setDbDoctors(doctorsData.map(d => ({ name: d.name, specialty: d.specialty, distanceKm: d.distance_km, phone: d.phone, rating: d.rating, wait: d.wait_time })));
      }
      if (specialtiesData && specialtiesData.length > 0) {
        // Map icon strings to actual Lucide components in a real app; for now just using the fetched data format
        setDbSpecialties(specialtiesData as any);
      }
      if (tipsData && tipsData.length > 0) setDbHealthTips(tipsData);
    }
    fetchData();
  }, []);

  const handleFindNearby = () => {
    setLocationError(false);
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      setLocationError(true);
      setDoctorList(dbDoctors);
      return;
    }
    setLocating(true);
    setLocationStatus('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLocationError(false);
        setLocationStatus(
          `✅ Location found (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}). Showing nearby doctors sorted by distance.`
        );
        setDoctorList([...dbDoctors].sort((a, b) => a.distanceKm - b.distanceKm));
      },
      () => {
        setLocating(false);
        setLocationError(true);
        setLocationStatus('Location permission was denied. Showing all available doctors.');
        setDoctorList(dbDoctors);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const filteredDoctors = doctorList.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('Booking appointment and sending notifications...');

    try {
      const response = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          doctor: form.doctor,
          date: form.date,
          notes: form.notes
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setBookingStatus(`✅ Appointment confirmed! Confirmation sent to ${form.email} and ${form.phone}.`);
      setForm({ fullName: '', email: '', phone: '+91 ', doctor: '', date: '', notes: '' });
    } catch (error) {
      setBookingStatus('❌ An error occurred while booking. Please try again.');
      console.error(error);
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('Sending message...');

    const { error } = await supabase.from('contact_messages').insert([
      {
        name: contact.name,
        email: contact.email,
        message: contact.message
      }
    ]);

    if (error) {
      setContactStatus('❌ Failed to send message. Try again later.');
      console.error(error);
    } else {
      setContactStatus(`✅ Thank you, ${contact.name}! We received your message and will reply to ${contact.email} soon.`);
      setContact({ name: '', email: '', message: '' });
    }
  };

  /* shared card class */
  const card = 'bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl';
  const input = 'bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition';

  return (
    <>
      <ShaderBackground />

      {/* ── Header with animated nav bar ── */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-sm border-b border-white/10 sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Heart className="text-violet-400 w-5 h-5" strokeWidth={2.5} />
          <span className="text-white text-base font-bold tracking-tight hidden sm:block">HealthConnect</span>
        </div>

        {/* Animated nav bar */}
        <BottomNavBar
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
          className="mx-auto"
        />

        {/* Spacer to balance logo */}
        <div className="w-8 sm:w-28 flex-shrink-0" />
      </header>

      {/* ── Tab Content ── */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 pb-24 w-full">

        {/* ══ HOME ══ */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-10">
            {/* Hero */}
            <section className="flex flex-col items-center text-center gap-6 pt-10 pb-4">
              <span className="text-xs font-semibold tracking-widest text-violet-300 uppercase bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full">
                Your Health, Connected
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight max-w-3xl">
                Find Doctors{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                  Near You
                </span>
              </h1>
              <p className="text-white/60 text-lg max-w-xl">
                Connect with emergency services, discover nearby providers, and book appointments — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={() => setActiveTab('find')} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-violet-900/50">
                  <MapPin className="w-4 h-4" /> Find Doctors
                </button>
                <button onClick={() => setActiveTab('emergency')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full border border-white/20 transition-all backdrop-blur-sm">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Emergency
                </button>
              </div>
            </section>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '200+', label: 'Doctors', color: 'text-violet-400' },
                { value: '15 min', label: 'Avg Wait', color: 'text-blue-400' },
                { value: '4.8★', label: 'Rating', color: 'text-amber-400' },
                { value: '24/7', label: 'Support', color: 'text-emerald-400' },
              ].map((s) => (
                <div key={s.label} className={`${card} flex flex-col items-center text-center gap-1`}>
                  <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
                  <span className="text-white/50 text-xs">{s.label}</span>
                </div>
              ))}
            </div>
            {/* Quick access cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'specialties', icon: Activity, label: 'Browse Specialties', sub: 'Find the right specialist', color: 'text-pink-400', bg: 'from-pink-600/20 to-pink-900/10' },
                { id: 'tips', icon: Lightbulb, label: 'Health Tips', sub: 'Stay healthy every day', color: 'text-amber-400', bg: 'from-amber-600/20 to-amber-900/10' },
                { id: 'contact', icon: Mail, label: 'Contact Us', sub: 'Get support anytime', color: 'text-cyan-400', bg: 'from-cyan-600/20 to-cyan-900/10' },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => setActiveTab(q.id as TabId)}
                  className={`${card} flex items-start gap-4 text-left hover:scale-[1.02] transition-transform bg-gradient-to-br ${q.bg}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <q.icon className={`w-5 h-5 ${q.color}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{q.label}</p>
                    <p className="text-white/40 text-xs">{q.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ FIND DOCTORS ══ */}
        {activeTab === 'find' && (
          <section className="flex flex-col gap-5">
            <div className={card}>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-violet-400 w-5 h-5" />
                <h2 className="text-white font-bold text-lg">Find Doctors Near Me</h2>
              </div>
              <p className="text-white/50 text-sm mb-5">Click below to use your GPS location to discover nearby providers.</p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  id="findNearbyBtn"
                  onClick={handleFindNearby}
                  disabled={locating}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-violet-900/40"
                >
                  {locating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Locating…
                    </>
                  ) : (
                    <><MapPin className="w-4 h-4" /> Find Nearby Doctors</>
                  )}
                </button>

                {/* Google Maps fallback */}
                <a
                  href="https://www.google.com/maps/search/doctors+near+me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-full border border-white/20 transition-all text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                  Open in Google Maps
                </a>
              </div>

              {/* Status message */}
              {locationStatus && (
                <p className={`text-sm px-4 py-2.5 rounded-xl border mb-2 ${locationError
                  ? 'text-amber-300 bg-amber-400/10 border-amber-400/20'
                  : locating
                    ? 'text-violet-300 bg-violet-400/10 border-violet-400/20'
                    : 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20'
                  }`}>
                  {locationStatus}
                </p>
              )}
            </div>

            {/* Search/filter — shown once list is loaded */}
            {doctorList.length > 0 && (
              <>
                <div className="relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or specialty…"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  />
                  <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                  </svg>
                </div>

                <div className="flex flex-col gap-3">
                  {filteredDoctors.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-8">No doctors match your search.</p>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between gap-4 flex-wrap bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{doc.name}</p>
                            <p className="text-white/50 text-xs">{doc.specialty} · {doc.distanceKm.toFixed(1)} km away</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-amber-400"><Star className="w-3 h-3 fill-current" />{doc.rating}</span>
                          <span className="flex items-center gap-1 text-xs text-white/40"><Clock className="w-3 h-3" />{doc.wait}</span>
                          <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">Available</span>
                          <a href={`tel:${doc.phone}`} className="flex items-center gap-1 bg-white/10 hover:bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 transition-all">
                            <Phone className="w-3 h-3" /> Contact
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Empty state — before button is clicked */}
            {doctorList.length === 0 && !locating && (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-violet-400" />
                </div>
                <p className="text-white font-semibold">No doctors loaded yet</p>
                <p className="text-white/40 text-sm max-w-xs">Click &quot;Find Nearby Doctors&quot; above to detect your location and show providers near you.</p>
              </div>
            )}
          </section>
        )}

        {/* ══ SPECIALTIES ══ */}
        {activeTab === 'specialties' && (
          <section className="flex flex-col gap-6">
            <div className={card}>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="text-pink-400 w-5 h-5" />
                <h2 className="text-white font-bold text-lg">Browse by Specialty</h2>
              </div>
              <p className="text-white/50 text-sm">Select a specialty to find matching providers near you.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {dbSpecialties.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setActiveTab('find')}
                  className={`${card} flex flex-col items-center text-center gap-3 hover:scale-[1.03] transition-all hover:border-white/20`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${s.bg}`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {/* Insurance banner */}
            <div className={`${card} flex items-center gap-4 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border-violet-500/20`}>
              <Shield className="text-violet-400 w-8 h-8 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Insurance Accepted</p>
                <p className="text-white/50 text-xs">We work with 50+ insurance providers. Verify your coverage before booking.</p>
              </div>
              <button onClick={() => setActiveTab('contact')} className="ml-auto flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all whitespace-nowrap">
                Learn More <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        )}

        {/* ══ HEALTH TIPS ══ */}
        {activeTab === 'tips' && (
          <section className="flex flex-col gap-6">
            <div className={card}>
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="text-amber-400 w-5 h-5" />
                <h2 className="text-white font-bold text-lg">Daily Health Tips</h2>
              </div>
              <p className="text-white/50 text-sm">Science-backed advice to help you live your healthiest life.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dbHealthTips.map((tip) => (
                <div key={tip.title} className={`${card} flex flex-col gap-3 hover:border-white/20 transition-all`}>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-bold">{tip.title}</p>
                    <span className={`text-xs font-semibold ${tip.color} bg-white/5 border border-white/10 px-2.5 py-1 rounded-full`}>
                      {tip.tag}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">{tip.body}</p>
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className={`${card} text-center flex flex-col items-center gap-3 bg-gradient-to-br from-amber-600/10 to-orange-900/10 border-amber-500/20`}>
              <Lightbulb className="w-8 h-8 text-amber-400" />
              <p className="text-white font-bold">Want personalised health advice?</p>
              <p className="text-white/50 text-sm">Book a consultation with one of our specialists.</p>
              <button onClick={() => setActiveTab('book')} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-full transition-all">
                Book Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ══ BOOK ══ */}
        {activeTab === 'book' && (
          <section className={`${card} flex flex-col gap-6`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarDays className="text-blue-400 w-6 h-6" />
                <h2 className="text-white font-bold text-2xl">Book an Appointment</h2>
              </div>
              <p className="text-white/50 text-sm">Please provide your details below to schedule an appointment with one of our specialists.</p>
            </div>

            <form id="bookingForm" onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Personal Information Group */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                  <User className="w-4 h-4 text-violet-400" />
                  <h3 className="text-white/80 font-semibold text-sm">Patient Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-xs text-white/50 font-medium ml-1">Full Name</label>
                    <input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required placeholder="e.g. Jane Doe" className={input} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs text-white/50 font-medium ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                      <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="jane@example.com" className={`${input} w-full pl-9`} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="phone" className="text-xs text-white/50 font-medium ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                      <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+91 00000-00000" className={`${input} w-full pl-9`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details Group */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <h3 className="text-white/80 font-semibold text-sm">Appointment Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="doctor" className="text-xs text-white/50 font-medium ml-1">Select Specialist</label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                      <select id="doctor" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required className={`${input} w-full pl-9 appearance-none`}>
                        <option value="" className="bg-gray-900 drop-shadow-lg text-white/40">Choose a doctor...</option>
                        {doctorList.map((d) => (
                          <option key={d.name} value={d.name} className="bg-gray-900 text-white">{d.name} ({d.specialty})</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-3 top-3.5 w-4 h-4 text-white/30 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="date" className="text-xs text-white/50 font-medium ml-1">Preferred Date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-white/30 pointer-events-none" />
                      <input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className={`${input} w-full pl-9 [color-scheme:dark]`} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label htmlFor="notes" className="text-xs text-white/50 font-medium ml-1">Symptoms or Additional Notes (Optional)</label>
                  <textarea id="notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Briefly describe your symptoms or reason for visit..." className={`${input} resize-y min-h-[100px]`} />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2 border-t border-white/10 mt-2">
                <button type="submit" id="bookAppointmentBtn" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-violet-900/40">
                  Confirm Booking <CalendarDays className="w-4 h-4 ml-2" />
                </button>
              </div>

              {bookingStatus && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-4 rounded-xl shadow-lg mt-2">
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{bookingStatus}</p>
                </div>
              )}
            </form>
          </section>
        )}

        {/* ══ EMERGENCY ══ */}
        {activeTab === 'emergency' && (
          <section className="flex flex-col gap-6">
            <div className={`${card} border-red-500/30 bg-red-500/5`}>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="text-red-400 w-6 h-6" />
                <h2 className="text-white font-bold text-xl">Emergency Medical Services</h2>
              </div>
              <p className="text-white/60 text-sm mb-6">If this is a life-threatening emergency, call immediately. Do not delay.</p>
              <div className="flex flex-wrap gap-3 mb-4">
                <a href="tel:108" id="callEmergency108" className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-red-900/40 text-sm">
                  <Phone className="w-5 h-5" /> Call 108 — Ambulance
                </a>
                <a href="tel:102" id="callEmergency102" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full border border-white/20 transition-all text-sm">
                  <Phone className="w-4 h-4" /> Call 102 — Emergency
                </a>
              </div>
              <p className="text-white/30 text-xs">Use your local emergency number based on your country/region.</p>
            </div>
            {/* Symptom guide */}
            <div className={card}>
              <h3 className="text-white font-bold mb-4">When to Call Emergency Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Chest pain or pressure',
                  'Difficulty breathing',
                  'Sudden severe headache',
                  'Loss of consciousness',
                  'Signs of stroke (FAST)',
                  'Severe allergic reaction',
                  'Uncontrolled bleeding',
                  'Suspected poisoning',
                ].map((symptom) => (
                  <div key={symptom} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {symptom}
                  </div>
                ))}
              </div>
            </div>
            {/* Nearby hospitals */}
            <div className={card}>
              <h3 className="text-white font-bold mb-4">Nearby Hospitals</h3>
              <div className="flex flex-col gap-3">
                {['AIIMS — 1.4 km', 'Apollo Hospitals — 2.1 km', 'Max Multi-speciality Hospital — 3.5 km'].map((h) => (
                  <div key={h} className="flex items-center justify-between text-sm text-white/70 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                    <span>{h}</span>
                    <span className="text-emerald-400 text-xs font-semibold">Open 24/7</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ CONTACT ══ */}
        {activeTab === 'contact' && (
          <section className="flex flex-col gap-6">
            <div className={card}>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="text-cyan-400 w-5 h-5" />
                <h2 className="text-white font-bold text-lg">Contact Us</h2>
              </div>
              <p className="text-white/50 text-sm">Have questions or need support? We're here to help 24/7.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Phone, label: 'Phone Support', value: '+91 1800-200-HEALTH', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
                { icon: Mail, label: 'Email', value: 'support@healthconnect.io', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
                { icon: Clock, label: 'Hours', value: '24 / 7 / 365', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
              ].map((c) => (
                <div key={c.label} className={`${card} flex flex-col items-center text-center gap-3`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${c.bg}`}>
                    <c.icon className={`w-6 h-6 ${c.color}`} />
                  </div>
                  <p className="text-white/50 text-xs">{c.label}</p>
                  <p className="text-white font-semibold text-sm">{c.value}</p>
                </div>
              ))}
            </div>
            {/* Contact Form */}
            <div className={card}>
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" /> Send a Message
              </h3>
              <form onSubmit={handleContact} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 font-medium">Your Name</label>
                    <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} required placeholder="Jane Smith" className={input} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 font-medium">Email Address</label>
                    <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required placeholder="jane@example.com" className={input} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50 font-medium">Message</label>
                  <textarea rows={4} value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} required placeholder="How can we help you?" className={`${input} resize-none`} />
                </div>
                <div>
                  <button type="submit" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-cyan-900/40">
                    Send Message <Send className="w-4 h-4" />
                  </button>
                </div>
                {contactStatus && (
                  <p className="text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">{contactStatus}</p>
                )}
              </form>
            </div>
          </section>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center text-white/30 text-xs pb-8 px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-white/50 font-semibold">HealthConnect</span>
        </div>
        © {new Date().getFullYear()} HealthConnect · All rights reserved ·{' '}
        <button onClick={() => setActiveTab('contact')} className="underline hover:text-white/60 transition-colors">Contact</button>
      </footer>
    </>
  );
}
