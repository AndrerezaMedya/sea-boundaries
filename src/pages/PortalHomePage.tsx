import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Anchor,
    ArrowRight,
    ChevronDown,
    CheckCircle,
    Cog,
    Compass,
    Database,
    FileCheck2,
    FileText,
    Mail,
    Map,
    MapPin,
    Phone,
    Scale,
    ShieldCheck,
} from 'lucide-react';

import PortalNav from '@/components/portal/PortalNav';

const featureCards = [
    {
        icon: <Map className='h-6 w-6' />,
        focus: 'Visualisasi Strategis',
        title: 'Peta Interaktif',
        description: 'Menampilkan batas maritim NKRI secara terstruktur untuk kebutuhan pemantauan, konsultasi publik, dan komunikasi antar-instansi.',
    },
    {
        icon: <Cog className='h-6 w-6' />,
        focus: 'Analisis Geospasial',
        title: 'Geoprocessing',
        description: 'Menyediakan proses spasial terukur untuk evaluasi skenario, dukungan teknis, serta penyiapan bahan kebijakan kelautan.',
    },
    {
        icon: <Compass className='h-6 w-6' />,
        focus: 'Penelusuran Presisi',
        title: 'Filter Data',
        description: 'Memfasilitasi penelusuran data berdasarkan wilayah, jenis batas, dan status dokumen agar analisis tetap presisi dan konsisten.',
    },
    {
        icon: <Database className='h-6 w-6' />,
        focus: 'Layanan Kelembagaan',
        title: 'Request Data',
        description: 'Mendukung mekanisme permintaan data untuk penelitian, verifikasi lintas lembaga, dan kebutuhan administrasi resmi.',
    },
];

const terms = [
    {
        title: 'Penggunaan Data',
        items: [
            'Data yang tersedia dalam platform ini hanya boleh digunakan untuk keperluan yang sah dan sesuai dengan hukum yang berlaku.',
            'Pengguna dilarang menggunakan data untuk tujuan yang merugikan kedaulatan dan keamanan negara.',
            'Setiap publikasi atau penggunaan data harus mencantumkan sumber dari SEA-BANDL.',
        ],
    },
    {
        title: 'Hak Akses',
        items: [
            'Akses terhadap beberapa layer data mungkin dibatasi dan memerlukan registrasi atau izin khusus.',
            'Pengguna bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi mereka.',
            'Sistem berhak membatasi atau mencabut akses jika terjadi pelanggaran ketentuan.',
        ],
    },
    {
        title: 'Keakuratan Data',
        items: [
            'Data yang ditampilkan telah melalui proses verifikasi, namun pengguna tetap perlu melakukan validasi untuk keperluan kritis.',
            'Pengelola platform tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan data.',
            'Data dapat diperbarui sewaktu-waktu tanpa pemberitahuan sebelumnya.',
        ],
    },
    {
        title: 'Kewajiban Pengguna',
        items: [
            'Pengguna wajib mematuhi semua peraturan dan ketentuan yang berlaku.',
            'Pengguna tidak diperkenankan melakukan aktivitas yang dapat mengganggu kinerja sistem.',
            'Segala bentuk pelanggaran dapat dikenakan sanksi sesuai hukum yang berlaku.',
        ],
    },
];

type HomeLocationState = {
    scrollTo?: string;
};

const PortalHomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const state = (location.state ?? null) as HomeLocationState | null;
        if (!state?.scrollTo) return;

        const run = () => {
            const target = document.getElementById(state.scrollTo as string);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            navigate('/', { replace: true, state: null });
        };

        const timer = window.setTimeout(run, 80);
        return () => window.clearTimeout(timer);
    }, [location.state, navigate]);

    return (
        <div className='min-h-screen bg-white text-slate-900'>
            <PortalNav />

            <main>
                <section id='hero' className='relative isolate flex min-h-screen items-center justify-center overflow-hidden pt-20'>
                    <div className='absolute inset-0 -z-20'>
                        <img
                            src='https://images.unsplash.com/photo-1747930016274-881667e26d65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600'
                            alt='Indonesia Ocean'
                            className='h-full w-full object-cover'
                        />
                        <div className='absolute inset-0 bg-[linear-gradient(110deg,rgba(5,17,78,0.92)_0%,rgba(12,42,145,0.86)_42%,rgba(17,138,199,0.7)_100%)]' />
                        <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(83,203,243,0.24),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(38,125,255,0.32),transparent_42%)]' />
                    </div>

                    <div className='portal-grid-overlay absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_48%,transparent_95%)]' />

                    <div className='portal-aura pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-[#53CBF3]/35 blur-[96px]' />
                    <div className='portal-aura pointer-events-none absolute -right-28 bottom-10 -z-10 h-80 w-80 rounded-full bg-[#3f77ff]/45 blur-[106px]' />
                    <div className='pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 rotate-[-90deg] text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100/55 xl:block'>
                        E95° - E141° / S11° - N6°
                    </div>

                    <div className='relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
                        <div className='grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14'>
                            <motion.div
                                initial={{ opacity: 0, x: -42 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.75 }}
                                className='space-y-8 text-white'
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className='inline-flex items-center gap-3 rounded-full border border-white/25 bg-[#0b1e7c]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b8dbff] backdrop-blur-xl'
                                >
                                    <span className='portal-badge-pulse h-2 w-2 rounded-full bg-[#53CBF3] shadow-[0_0_14px_rgba(83,203,243,0.95)]' />
                                    Acuan Diplomatik dan Hukum Laut
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.55 }}
                                    className='flex items-center gap-4'
                                >
                                    <div className='h-16 w-16 overflow-hidden rounded-full border border-white/30 shadow-2xl shadow-[#03265f]/60 sm:h-20 sm:w-20'>
                                        <img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
                                    </div>
                                    <div>
                                        <h3 className='font-display text-2xl font-bold text-[#FFDE42] sm:text-3xl'>SEA-BANDL</h3>
                                        <p className='text-sm text-slate-100/90 sm:text-base'>Sistem Informasi Geografis Batas Laut Indonesia</p>
                                    </div>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className='portal-display-rhythm font-display text-4xl font-semibold sm:text-5xl lg:text-[3.95rem]'
                                >
                                    <span className='block text-white'>Otoritas Geospasial</span>
                                    <span className='block bg-gradient-to-r from-white via-[#dbeeff] to-[#8fd8ff] bg-clip-text text-transparent'>
                                        Batas Maritim NKRI
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className='portal-lead-rhythm max-w-2xl text-base text-slate-100/90 sm:text-lg'
                                >
                                    Menyajikan visualisasi dan penelusuran batas laut, landas kontinen, serta zona ekonomi eksklusif berbasis dokumen hukum terverifikasi untuk mendukung kepastian hukum, tata kelola, dan komunikasi diplomatik.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className='flex flex-wrap gap-4'
                                >
                                    <Link
                                        to='/peta'
                                        className='group inline-flex items-center gap-2 rounded-2xl bg-[#FFDE42] px-8 py-4 text-base font-semibold text-[#111FA2] shadow-[0_16px_42px_rgba(255,222,66,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_22px_46px_rgba(255,222,66,0.58)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1b70]'
                                    >
                                        Buka Peta Interaktif
                                        <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5' />
                                    </Link>
                                    <button
                                        type='button'
                                        onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })}
                                        className='rounded-2xl border border-white/35 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1b70]'
                                    >
                                        Telaah Dokumen Hukum
                                    </button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.58 }}
                                    className='flex flex-wrap items-center gap-3 text-xs text-slate-100/85 sm:text-sm'
                                >
                                    <span className='rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md'>Kepastian Hukum</span>
                                    <span className='rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md'>Dukungan Diplomatik</span>
                                    <span className='rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md'>Jejak Audit Data</span>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 44 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.75, delay: 0.18 }}
                                className='relative grid auto-rows-[minmax(122px,auto)] grid-cols-2 gap-4 lg:gap-5'
                            >
                                <div className='pointer-events-none absolute -right-12 -top-16 hidden h-40 w-40 rounded-full border border-white/15 bg-[radial-gradient(circle,rgba(184,219,255,0.22)_0%,rgba(184,219,255,0)_72%)] lg:block' />
                                <motion.article
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card col-span-2 rounded-2xl border p-6 backdrop-blur-[18px] shadow-[0_22px_52px_rgba(8,31,102,0.36)]'
                                >
                                    <div className='mb-4 flex items-start justify-between gap-4'>
                                        <div>
                                            <p className='text-xs uppercase tracking-[0.16em] text-slate-100/75'>Luas Wilayah Laut</p>
                                            <h3 className='mt-2 font-display text-4xl font-bold leading-none text-white sm:text-[2.8rem]'>
                                                5.8 <span className='text-2xl font-semibold text-[#bde7ff] sm:text-3xl'>Juta km²</span>
                                            </h3>
                                        </div>
                                        <span className='rounded-xl bg-[#53CBF3]/28 p-3 text-[#e6f8ff]'>
                                            <Compass className='h-6 w-6' />
                                        </span>
                                    </div>
                                    <p className='text-sm text-slate-100/80'>Memetakan ruang maritim Indonesia untuk dukungan kebijakan, diplomasi, dan tata kelola kelautan.</p>
                                </motion.article>

                                <motion.article
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card rounded-2xl border p-5 backdrop-blur-[16px] shadow-[0_18px_38px_rgba(8,31,102,0.32)]'
                                >
                                    <div className='mb-4 inline-flex rounded-lg bg-[#53CBF3]/24 p-2 text-[#ddf5ff]'>
                                        <MapPin className='h-5 w-5' />
                                    </div>
                                    <h3 className='font-display text-2xl font-bold text-white'>17.504</h3>
                                    <p className='text-sm text-slate-100/80'>Pulau terdaftar</p>
                                </motion.article>

                                <motion.article
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.62 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card rounded-2xl border p-5 backdrop-blur-[16px] shadow-[0_18px_38px_rgba(8,31,102,0.32)]'
                                >
                                    <div className='mb-4 inline-flex rounded-lg bg-[#53CBF3]/24 p-2 text-[#ddf5ff]'>
                                        <Anchor className='h-5 w-5' />
                                    </div>
                                    <h3 className='font-display text-2xl font-bold text-white'>10</h3>
                                    <p className='text-sm text-slate-100/80'>Negara berbatasan</p>
                                </motion.article>

                                <motion.article
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.69 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card col-span-2 rounded-2xl border p-5 backdrop-blur-[16px] shadow-[0_18px_38px_rgba(8,31,102,0.32)]'
                                >
                                    <div className='mb-2 flex items-center gap-3'>
                                        <span className='rounded-lg bg-[#53CBF3]/24 p-2 text-[#ddf5ff]'>
                                            <Database className='h-5 w-5' />
                                        </span>
                                        <p className='text-sm font-semibold uppercase tracking-[0.11em] text-slate-100/85'>Integritas Sumber Data</p>
                                    </div>
                                    <p className='text-sm leading-relaxed text-slate-100/82'>
                                        Setiap segmen batas ditautkan dengan dokumen perjanjian, legal instrument, serta metadata kualitas untuk audit jejak data yang lebih kuat.
                                    </p>
                                    <p className='mt-3 text-xs font-medium uppercase tracking-[0.12em] text-sky-100/72'>Diperbarui 24 Apr 2026</p>
                                </motion.article>
                            </motion.div>
                        </div>
                    </div>

                    <button
                        type='button'
                        onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })}
                        className='portal-scroll-cue absolute bottom-24 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/92 backdrop-blur-lg transition-colors hover:bg-white/20 md:inline-flex'
                    >
                        Jelajahi
                        <ChevronDown className='h-4 w-4' />
                    </button>

                    <div className='absolute bottom-0 left-0 z-10 w-full overflow-hidden leading-[0]'>
                        <svg className='relative block h-16 w-full sm:h-20 md:h-24' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'>
                            <path
                                d='M0,120L48,110C96,100,192,80,288,76.7C384,73,480,87,576,96.7C672,107,768,113,864,104C960,93,1056,67,1152,58.7L1200,50L1200,120L1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z'
                                fill='#ffffff'
                                fillOpacity='1'
                            />
                        </svg>
                    </div>
                </section>

                <section className='relative overflow-hidden bg-[#edf4ff] py-24'>
                    <div className='pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]'>
                        <div className='portal-grid-overlay h-full w-full' />
                    </div>
                    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <div className='relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start'>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className='space-y-8'
                            >
                                <p className='portal-kicker text-[#3552d6]'>Kapabilitas Inti</p>
                                <h2 className='portal-section-title font-display text-3xl font-semibold text-[#101f8f] sm:text-4xl lg:text-[2.6rem]'>
                                    Fitur Strategis untuk Otoritas dan Kepastian Hukum
                                </h2>
                                <p className='portal-section-lead text-base text-slate-600 sm:text-lg'>
                                    Setiap fitur dirancang untuk memastikan data batas maritim dapat ditelusuri asal-usulnya, diverifikasi status hukumnya, dan digunakan secara bertanggung jawab pada tingkat nasional maupun lintas kelembagaan.
                                </p>

                                <div className='rounded-2xl border border-[#c9daf9] bg-white/80 p-6 shadow-[0_18px_40px_rgba(14,33,111,0.12)] backdrop-blur-sm'>
                                    <div className='mb-4 flex items-center gap-3'>
                                        <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0ebff] text-[#101f8f]'>
                                            <Scale className='h-5 w-5' />
                                        </span>
                                        <h3 className='font-display text-lg font-semibold text-[#101f8f] sm:text-xl'>Kerangka Tata Kelola Data</h3>
                                    </div>
                                    <ul className='space-y-3 text-sm leading-relaxed text-slate-600 sm:text-base'>
                                        <li className='flex items-start gap-2'>
                                            <ShieldCheck className='mt-0.5 h-4 w-4 flex-shrink-0 text-[#2f6dd9]' />
                                            Sumber peta dan dokumen hukum ditautkan secara eksplisit untuk menjaga jejak verifikasi.
                                        </li>
                                        <li className='flex items-start gap-2'>
                                            <FileCheck2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-[#2f6dd9]' />
                                            Metadata kualitas data disajikan agar setiap interpretasi teknis memiliki dasar yang konsisten.
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>

                            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                                {featureCards.map((feature, index) => (
                                    <motion.article
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 26 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.45, delay: index * 0.08 }}
                                        className='group relative overflow-hidden rounded-2xl border border-[#c9daf9] bg-white/92 p-6 shadow-[0_20px_45px_rgba(13,32,112,0.11)] transition-shadow hover:shadow-[0_28px_55px_rgba(13,32,112,0.18)]'
                                    >
                                        <p className='absolute right-5 top-4 font-display text-4xl font-semibold leading-none text-[#d7e6ff]'>
                                            {(index + 1).toString().padStart(2, '0')}
                                        </p>
                                        <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#dff0ff] text-[#13329d] transition-colors group-hover:bg-[#cbe9ff]'>
                                            {feature.icon}
                                        </div>
                                        <p className='mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3a66d1]'>{feature.focus}</p>
                                        <h3 className='portal-card-title mb-3 font-display text-xl font-semibold text-[#101f8f]'>{feature.title}</h3>
                                        <p className='portal-body-rhythm text-sm text-slate-600 sm:text-base'>{feature.description}</p>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id='tentang' className='relative overflow-hidden bg-white py-20'>
                    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <div className='relative overflow-hidden rounded-3xl bg-[#FFDE42] p-8 sm:p-12 lg:p-16'>
                            <div
                                className='absolute inset-0 opacity-10'
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(17, 31, 162, 0.15) 1px, transparent 0)',
                                    backgroundSize: '40px 40px',
                                }}
                            />

                            <div className='relative z-10 grid items-center gap-12 md:grid-cols-2'>
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className='overflow-hidden rounded-2xl shadow-2xl'>
                                        <img
                                            src='https://images.unsplash.com/photo-1713098965471-d324f294a71d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280'
                                            alt='Ocean Map'
                                            className='h-full w-full object-cover'
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h2 className='mb-6 text-3xl font-bold text-[#111FA2] sm:text-4xl'>Tentang SEA-BANDL</h2>
                                    <div className='portal-body-rhythm space-y-4 text-justify text-gray-700'>
                                        <p>
                                            <strong>SEA-BANDL (Sea Boundaries and Limits)</strong> adalah Sistem Informasi Geografis berbasis web yang dikembangkan untuk memvisualisasikan dan mengelola informasi mengenai batas laut Indonesia.
                                        </p>
                                        <p>
                                            Indonesia sebagai negara kepulauan terbesar di dunia memiliki wilayah laut yang sangat luas. Platform ini hadir untuk memberikan akses mudah terhadap data batas laut, zona ekonomi eksklusif (ZEE), landas kontinen, dan informasi penting lainnya terkait kedaulatan laut Indonesia.
                                        </p>
                                        <p>
                                            Dengan menggunakan teknologi WebGIS terkini, SEA-BANDL menyediakan peta interaktif yang memungkinkan pengguna untuk mengeksplorasi batas-batas laut Indonesia dengan detail dan akurat, mendukung pengambilan keputusan dan riset di bidang kelautan.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id='syarat' className='bg-gray-50 py-20'>
                    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className='mb-16 text-center'
                        >
                            <div className='mb-4 flex justify-center'>
                                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-[#53CBF3] text-[#111FA2]'>
                                    <FileText className='h-8 w-8' />
                                </div>
                            </div>
                            <h2 className='mb-4 text-3xl font-bold text-[#111FA2] sm:text-4xl'>Syarat dan Ketentuan</h2>
                            <p className='mx-auto max-w-2xl text-lg text-gray-600'>
                                Harap baca dan pahami syarat dan ketentuan berikut sebelum menggunakan platform SEA-BANDL.
                            </p>
                        </motion.div>

                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                            {terms.map((section, index) => (
                                <motion.article
                                    key={section.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className='rounded-xl bg-white p-6 shadow-md'
                                >
                                    <h3 className='mb-4 text-xl font-bold text-[#5478FF]'>{section.title}</h3>
                                    <ul className='space-y-3'>
                                        {section.items.map((item) => (
                                            <li key={item} className='flex items-start gap-3'>
                                                <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-[#53CBF3]' />
                                                <span className='text-sm text-gray-700'>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.article>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className='mt-12 rounded-xl border-l-4 border-[#FFDE42] bg-white p-8 shadow-md'
                        >
                            <p className='text-gray-700'>
                                <strong>Catatan Penting:</strong> Dengan mengakses dan menggunakan platform SEA-BANDL, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku. Jika Anda tidak menyetujui ketentuan ini, harap tidak melanjutkan penggunaan platform.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className='relative overflow-hidden py-20'>
                    <div className='absolute inset-0 z-0'>
                        <img
                            src='https://images.unsplash.com/photo-1592994731535-4de8307b64f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600'
                            alt='Indonesia Satellite View'
                            className='h-full w-full object-cover'
                        />
                        <div className='absolute inset-0 bg-gradient-to-r from-[#111FA2]/95 to-[#5478FF]/85' />
                    </div>

                    <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className='text-center text-white'
                        >
                            <h2 className='mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl'>Siap Menjelajahi Batas Laut Indonesia?</h2>
                            <p className='mx-auto mb-10 max-w-3xl text-lg text-gray-200 sm:text-xl'>
                                Akses platform WebGIS SEA-BANDL sekarang dan dapatkan visualisasi lengkap tentang batas laut Indonesia.
                            </p>
                            <div className='flex flex-wrap justify-center gap-4'>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to='/peta'
                                        className='inline-flex items-center gap-2 rounded-xl bg-[#FFDE42] px-8 py-4 text-lg font-medium text-[#111FA2] shadow-xl'
                                    >
                                        Akses Peta
                                        <ArrowRight className='h-5 w-5' />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to='/user-guide'
                                        className='inline-flex rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20'
                                    >
                                        Petunjuk Penggunaan
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <footer id='kontak' className='bg-gradient-to-r from-[#111FA2] to-[#5478FF] text-white'>
                    <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
                        <div className='mb-8 grid grid-cols-1 gap-8 md:grid-cols-2'>
                            <div>
                                <div className='mb-4 flex items-center gap-3'>
                                    <div className='h-10 w-10 overflow-hidden rounded-full border border-white/20'>
                                        <img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
                                    </div>
                                    <div>
                                        <h3 className='text-xl font-bold'>SEA-BANDL</h3>
                                        <p className='text-sm text-gray-300'>Sea Boundaries and Limits</p>
                                    </div>
                                </div>
                                <p className='text-sm text-gray-300'>Sistem Informasi Geografis untuk Batas Laut Indonesia</p>
                            </div>

                            <div>
                                <h4 className='mb-4 font-bold'>Informasi Kontak</h4>
                                <ul className='space-y-3 text-sm text-gray-300'>
                                    <li className='flex items-start gap-2'>
                                        <Mail className='mt-0.5 h-4 w-4 flex-shrink-0' />
                                        <span>info@sea-bandl.go.id</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <Phone className='mt-0.5 h-4 w-4 flex-shrink-0' />
                                        <span>+62 21 1234 5678</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <MapPin className='mt-0.5 h-4 w-4 flex-shrink-0' />
                                        <span>Jakarta Pusat, Indonesia</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className='border-t border-white/20 pt-8'>
                            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                                <p className='text-sm text-gray-300'>© 2026 SEA-BANDL. Hak Cipta Dilindungi Undang-Undang.</p>
                                <div className='flex gap-6 text-sm text-gray-300'>
                                    <a href='#' className='transition-colors hover:text-[#FFDE42]'>
                                        Kebijakan Privasi
                                    </a>
                                    <a href='#' className='transition-colors hover:text-[#FFDE42]'>
                                        Sitemap
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PortalHomePage;
