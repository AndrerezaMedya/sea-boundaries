import { motion } from 'motion/react';

import PortalNav from '@/components/portal/PortalNav';

const UserGuidePage = () => {
    return (
        <div className='min-h-screen bg-white text-slate-900'>
            <PortalNav />

            <main>
                <section id='hero' className='relative isolate overflow-hidden pb-16 pt-28 sm:pt-32'>
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
                    <div className='portal-aura pointer-events-none absolute -right-28 bottom-8 -z-10 h-80 w-80 rounded-full bg-[#3f77ff]/45 blur-[106px]' />

                    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65 }}
                            className='max-w-4xl text-white'
                        >
                            <p className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#0b1e7c]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#b8dbff] backdrop-blur-xl'>
                                Referensi Operasional
                            </p>
                            <h1 className='portal-display-rhythm font-sans text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.8rem]'>
                                Petunjuk Penggunaan SEA-BANDL
                            </h1>
                            <p className='portal-lead-rhythm mt-5 max-w-3xl text-base text-slate-100/90 sm:text-lg'>
                                Panduan ini membantu pengguna memahami alur navigasi, pembacaan atribut batas laut, pemanfaatan filter, serta tata cara penggunaan data secara tepat dan bertanggung jawab.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className='relative overflow-hidden bg-[#edf4ff] py-20 sm:py-24'>
                    <div className='pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]'>
                        <div className='portal-grid-overlay h-full w-full' />
                    </div>

                    <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className='overflow-hidden rounded-2xl border border-[#cfdcf8] bg-white/78 shadow-[0_16px_40px_rgba(17,31,162,0.1)] backdrop-blur-sm'
                        >
                            <div className='border-b border-[#dce6fb] bg-[linear-gradient(160deg,#f7faff_0%,#edf4ff_100%)] px-6 py-7 text-center'>
                                <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>Petunjuk Penggunaan</h2>
                                <p className='mt-1 text-sm text-[#4363d0] sm:text-base'>Guidebook</p>
                            </div>

                            <div className='p-5 sm:p-8'>
                                <div className='rounded-2xl border border-dashed border-[#5478FF]/40 bg-[#f7faff] p-10 text-center'>
                                    <p className='text-base font-semibold text-[#111FA2] sm:text-lg'>PDF guidebook akan ditampilkan di sini.</p>
                                    <p className='mt-2 text-sm text-slate-600'>Silakan unggah atau hubungkan dokumen panduan resmi untuk ditampilkan pada panel ini.</p>
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserGuidePage;
