import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Anchor,
    ArrowRight,
    ChevronDown,
    Compass,
    Database,
    Instagram,
    Linkedin,
    MapPin,
} from 'lucide-react';

import PortalNav from '@/components/portal/PortalNav';
import { useWebGisT } from '@/i18n/useWebGisT';
import teamPhoto1 from '@/assets/1.webp';
import teamPhoto2 from '@/assets/2.webp';
import teamPhoto3 from '@/assets/3.webp';
import teamPhoto4 from '@/assets/4.webp';
import teamPhoto5 from '@/assets/5.webp';
import itbLogo from '@/assets/itb.webp';
import sintaLogo from '@/assets/sinta.webp';
import dosen1Photo from '@/assets/dosen-1.webp';
import dosen2Photo from '@/assets/dosen-2.webp';
import dosen3Photo from '@/assets/dosen-3.webp';

type HomeLocationState = {
    scrollTo?: string;
};

const TEAM_MEMBERS = [
    {
        id: 1,
        name: 'Wafi Haidi',
        nim: '15122001',
        photo: teamPhoto1,
        linkedin: 'https://id.linkedin.com/in/wafi-haidi-bb1480196',
        instagram: 'https://instagram.com/wafihaidi_',
    },
    {
        id: 2,
        name: 'Kavita Rinda Gishela',
        nim: '15122005',
        photo: teamPhoto2,
        linkedin: 'https://www.linkedin.com/in/kavitarindagishela',
        instagram: 'https://instagram.com/kavitaghisela_',
    },
    {
        id: 3,
        name: "Muhammad As'ad Mu'izzu",
        nim: '15122024',
        photo: teamPhoto3,
        linkedin: 'https://www.linkedin.com/in/izzumu/',
        instagram: 'https://instagram.com/izzumu',
    },
    {
        id: 4,
        name: 'Andrereza Medya Endrikaputra',
        nim: '15122066',
        photo: teamPhoto4,
        linkedin: 'https://www.linkedin.com/in/andrereza-medya-endrikaputra-a9b654156/',
        instagram: 'https://instagram.com/andrzmdptr',
    },
    {
        id: 5,
        name: 'Azis Luqman Hakim',
        nim: '15122082',
        photo: teamPhoto5,
        linkedin: 'https://www.linkedin.com/in/azisluqman/',
        instagram: 'https://instagram.com/zziskm',
    },
] as const;

const SUPERVISORS = [
    {
        id: 1,
        name: 'Prof. Dr. Ir. Eka Djunarsjah, M.T.',
        photo: dosen1Photo,
        itbUrl: 'https://itb.ac.id/staf/profil/eka-djunarsjah',
        sintaUrl: 'https://sinta.kemdiktisaintek.go.id/authors/profile/6039432',
    },
    {
        id: 2,
        name: 'Ir. Agung Budi Harto, M.Sc., Ph.D.',
        photo: dosen2Photo,
        itbUrl: 'https://itb.ac.id/staf/profil/1788/agung-budi-harto',
        sintaUrl: 'https://sinta.kemdiktisaintek.go.id/authors/profile/6033974',
    },
    {
        id: 3,
        name: 'Prof. Ir. Hasanuddin Zainal Abidin, M.Sc., Ph.D.',
        photo: dosen3Photo,
        itbUrl: 'https://itb.ac.id/staf/profil/1054/hasanuddin-zainal-abidin',
        sintaUrl: 'https://sinta.kemdiktisaintek.go.id/authors/profile/5998906',
    },
] as const;

const TeamMemberPhoto = ({ src, name }: { src: string; name: string }) => (
    <div className='aspect-[3/4] overflow-hidden bg-[#eef5ff]'>
        <img
            src={src}
            alt={name}
            className='h-full w-full object-cover object-top'
            loading='lazy'
        />
    </div>
);

const PortalHomePage = () => {
    const { t } = useWebGisT();
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedTimelineIndex, setExpandedTimelineIndex] = useState<number | null>(null);

    const timelineMoments = [
        {
            period: t('portalHome.timeline.t1Period'),
            description: t('portalHome.timeline.t1Desc'),
        },
        {
            period: t('portalHome.timeline.t2Period'),
            description: t('portalHome.timeline.t2Desc'),
        },
        {
            period: t('portalHome.timeline.t3Period'),
            description: t('portalHome.timeline.t3Desc'),
        },
        {
            period: t('portalHome.timeline.t4Period'),
            description: t('portalHome.timeline.t4Desc'),
        },
    ];

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
                <section id='hero' className='portal-hero-shell relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden'>
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

                    <div className='relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-16 lg:px-8 lg:pt-14'>
                        <div className='grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14'>
                            <motion.div
                                initial={{ opacity: 0, x: -42 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.75 }}
                                className='space-y-7 text-white sm:space-y-8'
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className='mt-6 inline-flex items-center gap-3 rounded-full border border-white/25 bg-[#0b1e7c]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b8dbff] backdrop-blur-xl'
                                >
                                    <span className='portal-badge-pulse h-2 w-2 rounded-full bg-[#53CBF3] shadow-[0_0_14px_rgba(83,203,243,0.95)]' />
                                    {t('portalHome.hero.badge')}
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
                                        <h3 className='font-sans text-2xl font-bold text-[#FFDE42] sm:text-3xl'>SEA-BANDL</h3>
                                        <p className='text-sm text-slate-100/90 sm:text-base'>{t('portalNav.tagline')}</p>
                                    </div>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className='portal-display-rhythm font-sans font-semibold flex flex-col gap-2 sm:gap-3'
                                >
                                    <span className='block text-white text-5xl sm:text-6xl lg:text-[4.5rem] leading-none'>
                                        {t('portalHome.hero.title')}
                                    </span>

                                    <span className='block bg-gradient-to-r from-white via-[#dbeeff] to-[#8fd8ff] bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-[3.5rem] leading-tight sm:leading-tight lg:leading-[0.85]'>
                                        {t('portalHome.hero.subtitle')}
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className='portal-lead-rhythm max-w-2xl text-base text-slate-100/90 sm:text-lg'
                                >
                                    {t('portalHome.hero.desc')}
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
                                        {t('portalHome.hero.mapBtn')}
                                        <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5' />
                                    </Link>
                                    <button
                                        type='button'
                                        onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })}
                                        className='rounded-2xl border border-white/35 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1b70]'
                                    >
                                        {t('portalHome.hero.aboutBtn')}
                                    </button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.58 }}
                                    className='flex flex-wrap items-center gap-3 text-xs text-slate-100/85 sm:text-sm'
                                >
                                    <span className='rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md'>{t('portalHome.hero.tag1')}</span>
                                    <span className='rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md'>{t('portalHome.hero.tag2')}</span>
                                    <span className='rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md'>{t('portalHome.hero.tag3')}</span>
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
                                    initial={{ opacity: 0, y: 20, scale: 0.985, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.12)' }}
                                    animate={{ opacity: 1, y: 0, scale: 1, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.11)', borderColor: 'rgba(255,255,255,0.28)' }}
                                    transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card col-span-2 rounded-2xl border p-6 shadow-[0_22px_52px_rgba(8,31,102,0.36)] [will-change:transform,opacity,backdrop-filter]'
                                >
                                    <div className='mb-4 flex items-start justify-between gap-4'>
                                        <div>
                                            <p className='text-xs uppercase tracking-[0.16em] text-slate-100/75'>{t('portalHome.stats.areaLabel')}</p>
                                            <h3 className='mt-2 font-sans text-4xl font-bold leading-none text-white sm:text-[2.8rem]'>
                                                {t('portalHome.stats.areaValue')} <span className='text-2xl font-semibold text-[#bde7ff] sm:text-3xl'>{t('portalHome.stats.areaUnit')}</span>
                                            </h3>
                                        </div>
                                        <span className='rounded-xl bg-[#53CBF3]/28 p-3 text-[#e6f8ff]'>
                                            <Compass className='h-6 w-6' />
                                        </span>
                                    </div>
                                    <p className='text-sm text-slate-100/80'>{t('portalHome.stats.areaDesc')}</p>
                                </motion.article>

                                <motion.article
                                    initial={{ opacity: 0, y: 18, scale: 0.985, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.12)' }}
                                    animate={{ opacity: 1, y: 0, scale: 1, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.11)', borderColor: 'rgba(255,255,255,0.28)' }}
                                    transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card rounded-2xl border p-5 shadow-[0_18px_38px_rgba(8,31,102,0.32)] [will-change:transform,opacity,backdrop-filter]'
                                >
                                    <div className='mb-4 inline-flex rounded-lg bg-[#53CBF3]/24 p-2 text-[#ddf5ff]'>
                                        <MapPin className='h-5 w-5' />
                                    </div>
                                    <h3 className='font-sans text-2xl font-bold text-white'>{t('portalHome.stats.islandValue')}</h3>
                                    <p className='text-sm text-slate-100/80'>{t('portalHome.stats.islandDesc')}</p>
                                </motion.article>

                                <motion.article
                                    initial={{ opacity: 0, y: 18, scale: 0.985, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.12)' }}
                                    animate={{ opacity: 1, y: 0, scale: 1, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.11)', borderColor: 'rgba(255,255,255,0.28)' }}
                                    transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card rounded-2xl border p-5 shadow-[0_18px_38px_rgba(8,31,102,0.32)] [will-change:transform,opacity,backdrop-filter]'
                                >
                                    <div className='mb-4 inline-flex rounded-lg bg-[#53CBF3]/24 p-2 text-[#ddf5ff]'>
                                        <Anchor className='h-5 w-5' />
                                    </div>
                                    <h3 className='font-sans text-2xl font-bold text-white'>{t('portalHome.stats.borderValue')}</h3>
                                    <p className='text-sm text-slate-100/80'>{t('portalHome.stats.borderDesc')}</p>
                                </motion.article>

                                <motion.article
                                    initial={{ opacity: 0, y: 18, scale: 0.985, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.12)' }}
                                    animate={{ opacity: 1, y: 0, scale: 1, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255,255,255,0.11)', borderColor: 'rgba(255,255,255,0.28)' }}
                                    transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className='portal-glass-card col-span-2 rounded-2xl border p-5 shadow-[0_18px_38px_rgba(8,31,102,0.32)] [will-change:transform,opacity,backdrop-filter]'
                                >
                                    <div className='mb-2 flex items-center gap-3'>
                                        <span className='rounded-lg bg-[#53CBF3]/24 p-2 text-[#ddf5ff]'>
                                            <Database className='h-5 w-5' />
                                        </span>
                                        <p className='text-sm font-semibold uppercase tracking-[0.11em] text-slate-100/85'>{t('portalHome.stats.dataLabel')}</p>
                                    </div>
                                    <p className='text-sm leading-relaxed text-slate-100/80'>
                                        {t('portalHome.stats.dataDesc')}
                                    </p>
                                    <p className='mt-3 text-xs font-medium uppercase tracking-[0.12em] text-[#bde7ff]'>{t('portalHome.stats.dataUpdated')}</p>
                                </motion.article>
                            </motion.div>
                        </div>
                    </div>

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


                <section id='tentang' className='relative overflow-hidden bg-[#f7faff] py-24'>
                    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8fbff] via-[#eef5ff] to-[#e4efff] p-8 shadow-[0_28px_58px_rgba(15,34,109,0.14)] ring-1 ring-[#c8daf7] sm:p-12 lg:p-16'>
                            <div
                                className='absolute inset-0 opacity-10'
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(17, 31, 162, 0.15) 1px, transparent 0)',
                                    backgroundSize: '40px 40px',
                                }}
                            />

                            <div className='relative z-10 grid items-center gap-8 md:grid-cols-2'>
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: -15 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className='overflow-hidden rounded-2xl border border-[#c8daf7] shadow-2xl'>
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
                                    <h2 className='portal-section-title mb-6 font-sans text-3xl font-semibold text-[#111FA2] sm:text-4xl'>{t('portalHome.about.title')}</h2>
                                    <div className='portal-body-rhythm space-y-4 text-justify text-slate-700'>
                                        <p dangerouslySetInnerHTML={{ __html: t('portalHome.about.p1') }} />
                                        <p dangerouslySetInnerHTML={{ __html: t('portalHome.about.p2') }} />
                                        <p dangerouslySetInnerHTML={{ __html: t('portalHome.about.p3') }} />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>



                <section id='timeline-historis' className='relative overflow-hidden bg-[#f7faff] py-24'>
                    <div className='pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]'>
                        <div className='portal-grid-overlay h-full w-full' />
                    </div>

                    <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className='mb-14 text-center'
                        >
                            <p className='portal-kicker mb-3 text-[#3552d6]'>{t('portalHome.timeline.kicker')}</p>
                            <h2 className='portal-section-title mb-4 font-sans text-3xl font-semibold text-[#111FA2] sm:text-4xl'>{t('portalHome.timeline.title')}</h2>
                            <p className='portal-section-lead mx-auto text-base text-slate-600 sm:text-lg'>
                                {t('portalHome.timeline.lead')}
                            </p>
                        </motion.div>

                        <div className='grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10'>
                            <motion.aside
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.65, delay: 0.08 }}
                                className='relative px-1 py-2 sm:pr-6'
                            >
                                <div className='absolute bottom-1 left-0 top-1 w-px bg-gradient-to-b from-[#2d4ad1] via-[#6e90fb] to-transparent' />
                                <div className='pl-6 sm:pl-8'>
                                    <p className='portal-kicker mb-3 text-[#3552d6]'>{t('portalHome.timeline.highlightKicker')}</p>
                                    <h3 className='portal-card-title mb-5 font-sans text-2xl font-semibold text-[#111FA2] sm:text-[1.75rem]'>{t('portalHome.timeline.highlightTitle')}</h3>
                                    <div className='portal-body-rhythm space-y-4 text-sm text-slate-700 sm:text-base'>
                                        <p>{t('portalHome.timeline.highlightP1')}</p>
                                        <p>{t('portalHome.timeline.highlightP2')}</p>
                                    </div>
                                </div>
                            </motion.aside>

                            <motion.article
                                initial={{ opacity: 0, y: 22 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className='divide-y divide-[#e3ecff]'
                            >
                                {timelineMoments.map((moment, index) => (
                                    <div key={moment.period}>
                                        <button
                                            type='button'
                                            onClick={() => setExpandedTimelineIndex(expandedTimelineIndex === index ? null : index)}
                                            className='w-full px-0 py-5 text-left font-sans text-lg font-semibold text-[#132b92] transition-colors hover:text-[#3552d6] flex items-center justify-between'
                                        >
                                            <span>{moment.period}</span>
                                            <motion.div
                                                animate={{ rotate: expandedTimelineIndex === index ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronDown className='h-5 w-5 text-[#3552d6]' />
                                            </motion.div>
                                        </button>

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: expandedTimelineIndex === index ? 'auto' : 0,
                                                opacity: expandedTimelineIndex === index ? 1 : 0,
                                            }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className='overflow-hidden'
                                        >
                                            <div className='portal-body-rhythm pb-5 text-sm text-slate-700 sm:text-base'>
                                                {moment.description}
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </motion.article>
                        </div>
                    </div>
                </section>

                <section id='tim-pengembang' className='relative overflow-hidden bg-[#f7faff] py-24'>
                    <div className='pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]'>
                        <div className='portal-grid-overlay h-full w-full' />
                    </div>

                    <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className='mb-14 text-center'
                        >
                            <p className='portal-kicker mb-3 text-[#3552d6]'>{t('portalHome.team.kicker')}</p>
                            <h2 className='portal-section-title mb-4 font-sans text-3xl font-semibold text-[#111FA2] sm:text-4xl'>
                                {t('portalHome.team.title')}
                            </h2>
                            <p className='portal-section-lead mx-auto max-w-2xl text-base text-slate-600 sm:text-lg'>
                                {t('portalHome.team.lead')}
                            </p>
                        </motion.div>

                        <div className='grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5'>
                            {TEAM_MEMBERS.map((member, index) => (
                                    <motion.article
                                        key={member.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.45, delay: index * 0.06 }}
                                        whileHover={{ y: -4 }}
                                        className='overflow-hidden rounded-2xl border border-[#c8daf7] bg-white shadow-[0_18px_38px_rgba(15,34,109,0.1)] ring-1 ring-[#dbe8ff] transition-shadow duration-300 hover:shadow-[0_22px_48px_rgba(15,34,109,0.14)]'
                                    >
                                        <TeamMemberPhoto src={member.photo} name={member.name} />
                                        <div className='px-3 py-4 text-center sm:px-4 sm:py-5'>
                                            <h3 className='font-sans text-sm font-semibold text-[#111FA2] sm:text-base'>{member.name}</h3>
                                            <p className='mt-1 text-xs font-medium text-[#3552d6] sm:text-sm'>{member.nim}</p>
                                            <div className='mt-3 flex items-center justify-center gap-2'>
                                                <a
                                                    href={member.linkedin}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    aria-label={t('portalHome.team.linkedinAria', { name: member.name })}
                                                    className='rounded-lg p-1.5 text-[#5478FF]/80 transition-colors hover:bg-[#eef5ff] hover:text-[#111FA2]'
                                                >
                                                    <Linkedin className='h-5 w-5' />
                                                </a>
                                                <a
                                                    href={member.instagram}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    aria-label={t('portalHome.team.instagramAria', { name: member.name })}
                                                    className='rounded-lg p-1.5 text-[#5478FF]/80 transition-colors hover:bg-[#eef5ff] hover:text-[#111FA2]'
                                                >
                                                    <Instagram className='h-5 w-5' />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.article>
                            ))}
                        </div>

                        {/* Supervisors Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className='mt-20 mb-14 text-center'
                        >
                            <h2 className='portal-section-title mb-4 font-sans text-3xl font-semibold text-[#111FA2] sm:text-4xl'>
                                {t('portalHome.team.supervisors')}
                            </h2>
                        </motion.div>

                        <div className='grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 max-w-4xl mx-auto'>
                            {SUPERVISORS.map((member, index) => (
                                    <motion.article
                                        key={member.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.45, delay: index * 0.06 }}
                                        whileHover={{ y: -4 }}
                                        className='overflow-hidden rounded-2xl border border-[#c8daf7] bg-white shadow-[0_18px_38px_rgba(15,34,109,0.1)] ring-1 ring-[#dbe8ff] transition-shadow duration-300 hover:shadow-[0_22px_48px_rgba(15,34,109,0.14)]'
                                    >
                                        <TeamMemberPhoto src={member.photo} name={member.name} />
                                        <div className='flex flex-col justify-between px-3 py-4 text-center sm:px-4 sm:py-5 min-h-[110px]'>
                                            <h3 className='font-sans text-sm font-semibold text-[#111FA2] sm:text-base leading-snug'>
                                                {member.name}
                                            </h3>
                                            <div className='mt-3 flex items-center justify-center gap-3'>
                                                <a
                                                    href={member.itbUrl}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    aria-label='ITB Profile'
                                                    className='rounded-lg transition-transform hover:scale-110'
                                                >
                                                    <img src={itbLogo} alt='ITB' className='h-6 w-6 object-contain' />
                                                </a>
                                                <a
                                                    href={member.sintaUrl}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    aria-label='SINTA Profile'
                                                    className='rounded-lg transition-transform hover:scale-110'
                                                >
                                                    <img src={sintaLogo} alt='SINTA' className='h-6 w-auto object-contain' />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id='home-deep-zone' className='relative overflow-hidden py-20'>
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
                            <p className='portal-kicker mb-3 text-[#b9d9ff]'>{t('portalHome.deepZone.kicker')}</p>
                            <h2 className='portal-section-title mb-6 font-sans text-3xl font-semibold sm:text-4xl lg:text-5xl'>{t('portalHome.deepZone.title')}</h2>
                            <p className='portal-section-lead mx-auto mb-10 text-base text-gray-200 sm:text-xl'>
                                {t('portalHome.deepZone.lead')}
                            </p>
                            <div className='flex flex-wrap justify-center gap-4'>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to='/peta'
                                        className='inline-flex items-center gap-2 rounded-xl bg-[#FFDE42] px-8 py-4 text-lg font-medium text-[#111FA2] shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f237c]'
                                    >
                                        {t('portalHome.deepZone.mapBtn')}
                                        <ArrowRight className='h-5 w-5' />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to='/user-guide'
                                        className='inline-flex rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f237c]'
                                    >
                                        {t('portalHome.deepZone.guideBtn')}
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <footer id='kontak' className='bg-gradient-to-r from-[#111FA2] to-[#5478FF] text-white'>
                    <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
                        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
                            <div className='flex flex-col items-start'>
                                <div className='flex items-center justify-start gap-3'>
                                    <div className='h-10 w-10 overflow-hidden rounded-full border border-white/20'>
                                        <img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
                                    </div>
                                    <div className='text-left'>
                                        <h3 className='text-xl font-bold'>SEA-BANDL</h3>
                                        <p className='text-sm text-gray-300'>{t('portalNav.tagline')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className='text-right md:max-w-md'>
                                <p className='text-[11px] text-white font-medium'>
                                    Capstone Project &bull; Geodesy &amp; Geomatics Engineering &bull; Institut Teknologi Bandung &bull; 2026
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PortalHomePage;
