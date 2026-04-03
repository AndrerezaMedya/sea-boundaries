import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Anchor,
    ArrowRight,
    CheckCircle,
    Cog,
    Compass,
    Database,
    FileText,
    Mail,
    Map,
    MapPin,
    Phone,
} from 'lucide-react';

import PortalNav from '@/components/portal/PortalNav';

const featureCards = [
    {
        icon: <Map className='h-6 w-6' />,
        title: 'Peta Interaktif',
        description: 'Visualisasi peta batas laut dengan teknologi WebGIS terkini yang interaktif dan mudah digunakan.',
    },
    {
        icon: <Cog className='h-6 w-6' />,
        title: 'Geoprocessing',
        description: 'Alat analisis spasial untuk memproses dan menganalisis data geografis secara mendalam.',
    },
    {
        icon: <Compass className='h-6 w-6' />,
        title: 'Filter Data',
        description: 'Saring dan tampilkan data berdasarkan kriteria tertentu untuk analisis yang lebih spesifik.',
    },
    {
        icon: <Database className='h-6 w-6' />,
        title: 'Request Data',
        description: 'Ajukan permintaan akses data laut sesuai kebutuhan penelitian atau keperluan resmi.',
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
                <section id='hero' className='relative flex min-h-screen items-center justify-center overflow-hidden pt-16'>
                    <div className='absolute inset-0 z-0'>
                        <img
                            src='https://images.unsplash.com/photo-1747930016274-881667e26d65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600'
                            alt='Indonesia Ocean'
                            className='h-full w-full object-cover'
                        />
                        <div className='absolute inset-0 bg-gradient-to-r from-[#111FA2]/90 via-[#5478FF]/80 to-[#53CBF3]/70' />
                    </div>

                    <div className='absolute bottom-0 left-0 z-10 w-full rotate-180 overflow-hidden leading-[0]'>
                        <svg className='relative block h-20 w-full sm:h-28 md:h-32' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'>
                            <path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='#ffffff' />
                            <path d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='#ffffff' />
                            <path d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='#ffffff' />
                        </svg>
                    </div>

                    <div className='relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
                        <div className='grid items-center gap-16 md:grid-cols-2'>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className='space-y-8 text-white'
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className='flex items-center gap-4'
                                >
                                    <div className='h-16 w-16 overflow-hidden rounded-full border border-white/20 shadow-2xl sm:h-20 sm:w-20'>
                                        <img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
                                    </div>
                                    <div>
                                        <h3 className='text-2xl font-bold text-[#FFDE42] sm:text-3xl'>SEA-BANDL</h3>
                                        <p className='text-sm text-gray-200 sm:text-base'>Sistem Informasi Geografis Batas Laut Indonesia</p>
                                    </div>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className='text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl'
                                >
                                    SEA BOUNDARIES AND LIMITS
                                </motion.h1>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className='flex flex-wrap gap-4'
                                >
                                    <Link
                                        to='/peta'
                                        className='rounded-xl bg-[#FFDE42] px-8 py-4 text-lg font-medium text-[#111FA2] shadow-xl transition-all hover:scale-105 hover:shadow-2xl'
                                    >
                                        Akses Peta
                                    </Link>
                                    <button
                                        onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })}
                                        className='rounded-xl border-2 border-white bg-white/20 px-8 py-4 text-lg font-medium backdrop-blur-sm transition-all hover:bg-white/30'
                                    >
                                        Pelajari Lebih Lanjut
                                    </button>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className='grid grid-cols-1 gap-6'
                            >
                                {[
                                    { icon: <MapPin className='h-8 w-8' />, title: '17,504 Pulau', description: 'Kepulauan terbesar di dunia', delay: 0.6 },
                                    { icon: <Compass className='h-8 w-8' />, title: '5.8 Juta km²', description: 'Luas wilayah laut', delay: 0.7 },
                                    { icon: <Anchor className='h-8 w-8' />, title: '10 Negara', description: 'Berbatasan langsung', delay: 0.8 },
                                ].map(({ icon, title, description, delay }) => (
                                    <motion.article
                                        key={title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay }}
                                        className='rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/20'
                                    >
                                        <div className='flex items-start gap-4'>
                                            <div className='rounded-lg bg-[#53CBF3] p-3 text-[#111FA2]'>{icon}</div>
                                            <div>
                                                <h3 className='mb-1 text-2xl font-bold'>{title}</h3>
                                                <p className='text-gray-200'>{description}</p>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className='bg-gray-50 py-20'>
                    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className='mb-16 text-center'
                        >
                            <h2 className='mb-4 text-3xl font-bold text-[#111FA2] sm:text-4xl'>Fitur Unggulan</h2>
                            <p className='mx-auto max-w-2xl text-lg text-gray-600'>
                                Platform WebGIS yang dilengkapi dengan berbagai fitur canggih untuk memudahkan akses dan analisis data batas laut Indonesia.
                            </p>
                        </motion.div>

                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
                            {featureCards.map((feature, index) => (
                                <motion.article
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className='rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl'
                                >
                                    <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#53CBF3] text-[#111FA2]'>
                                        {feature.icon}
                                    </div>
                                    <h3 className='mb-2 text-xl font-bold text-[#111FA2]'>{feature.title}</h3>
                                    <p className='text-gray-600'>{feature.description}</p>
                                </motion.article>
                            ))}
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
                                    <div className='space-y-4 text-justify text-gray-700'>
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
