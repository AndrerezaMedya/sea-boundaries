import { motion } from 'motion/react';
import { Blocks, RefreshCw, Lock } from 'lucide-react';
import PortalNav from '@/components/portal/PortalNav';
import { useWebGisT } from '@/i18n/useWebGisT';

const MethodologyPage = () => {
    const { t } = useWebGisT();

    return (
        <div className='min-h-screen bg-white text-slate-900'>
            <PortalNav />

            <main>
                {/* HERO SECTION */}
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
                                {t('methodology.hero.badge')}
                            </p>
                            <h1 className='portal-display-rhythm font-sans text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.8rem]'>
                                {t('methodology.hero.title')}<br />
                                <span className='text-[#53CBF3]'>{t('methodology.hero.titleHighlight')}</span>
                            </h1>
                            
                            <div className='mt-10 flex flex-col sm:flex-row overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm'>
                                <div className='flex-1 border-b sm:border-b-0 sm:border-r border-white/10 p-5 relative'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[1.5px] text-[#53CBF3] mb-1'>{t('methodology.hero.p1Title')}</h3>
                                    <p className='text-xs text-white/60'>{t('methodology.hero.p1Desc')}</p>
                                </div>
                                <div className='flex-1 border-b sm:border-b-0 sm:border-r border-white/10 p-5 relative'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[1.5px] text-[#53CBF3] mb-1'>{t('methodology.hero.p2Title')}</h3>
                                    <p className='text-xs text-white/60'>{t('methodology.hero.p2Desc')}</p>
                                </div>
                                <div className='flex-1 border-b sm:border-b-0 sm:border-r border-white/10 p-5 relative'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[1.5px] text-[#53CBF3] mb-1'>{t('methodology.hero.p3Title')}</h3>
                                    <p className='text-xs text-white/60'>{t('methodology.hero.p3Desc')}</p>
                                </div>
                                <div className='flex-1 p-5 relative'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[1.5px] text-[#53CBF3] mb-1'>{t('methodology.hero.p4Title')}</h3>
                                    <p className='text-xs text-white/60'>{t('methodology.hero.p4Desc')}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className='relative overflow-hidden bg-[#edf4ff] py-20 sm:py-24'>
                    <div className='pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]'>
                        <div className='portal-grid-overlay h-full w-full' />
                    </div>

                    <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20'>
                        
                        {/* METODE PENGEMBANGAN */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className='overflow-hidden rounded-2xl border border-[#cfdcf8] bg-white/78 shadow-[0_16px_40px_rgba(17,31,162,0.1)] backdrop-blur-sm'
                        >
                            <div className='border-b border-[#dce6fb] bg-[linear-gradient(160deg,#f7faff_0%,#edf4ff_100%)] px-6 py-7'>
                                <p className='text-xs font-bold uppercase tracking-widest text-[#267dff] mb-2'>{t('methodology.dev.badge')}</p>
                                <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>{t('methodology.dev.title')}</h2>
                                <p className='mt-3 text-sm text-slate-600 sm:text-base max-w-3xl'>{t('methodology.dev.desc')}</p>
                            </div>

                            <div className='p-5 sm:p-8 grid gap-8 md:grid-cols-2'>
                                <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
                                    <div className='flex items-start gap-4 mb-4'>
                                        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600'>
                                            <Blocks className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className='inline-block rounded bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-1'>{t('methodology.dev.wfBadge')}</span>
                                            <h3 className='text-lg font-bold text-slate-900'>{t('methodology.dev.wfTitle')}</h3>
                                        </div>
                                    </div>
                                    <p className='text-sm text-slate-600 mb-5 leading-relaxed'>{t('methodology.dev.wfDesc')}</p>
                                    <ul className='space-y-3 text-xs sm:text-sm text-slate-700'>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>1</span> {t('methodology.dev.w1')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>2</span> {t('methodology.dev.w2')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>3</span> {t('methodology.dev.w3')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>4</span> {t('methodology.dev.w4')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>5</span> {t('methodology.dev.w5')}</li>
                                    </ul>
                                </div>

                                <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
                                    <div className='flex items-start gap-4 mb-4'>
                                        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600'>
                                            <RefreshCw className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className='inline-block rounded bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-700 mb-1'>{t('methodology.dev.agBadge')}</span>
                                            <h3 className='text-lg font-bold text-slate-900'>{t('methodology.dev.agTitle')}</h3>
                                        </div>
                                    </div>
                                    <p className='text-sm text-slate-600 mb-5 leading-relaxed'>{t('methodology.dev.agDesc')}</p>
                                    <ul className='space-y-3 text-xs sm:text-sm text-slate-700'>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>1</span> {t('methodology.dev.a1')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>2</span> {t('methodology.dev.a2')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>3</span> {t('methodology.dev.a3')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>4</span> {t('methodology.dev.a4')}</li>
                                        <li className='flex items-start gap-3 border-t border-slate-100 pt-3'><span className='font-bold text-slate-400'>5</span> {t('methodology.dev.a5')}</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.section>

                        {/* SKEMA BASIS DATA */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                        >
                            <div className='mb-8'>
                                <p className='text-xs font-bold uppercase tracking-widest text-[#267dff] mb-2'>{t('methodology.db.badge')}</p>
                                <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>{t('methodology.db.title')}</h2>
                                <p className='mt-3 text-sm text-slate-600 sm:text-base max-w-3xl'>{t('methodology.db.desc')}</p>
                            </div>

                            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center'><span className='mr-2 inline-block h-2 w-2 rounded-full bg-blue-500'></span>{t('methodology.db.spBadge')}</p>
                                    <h4 className='font-bold text-slate-900 mb-2'>{t('methodology.db.spTitle')}</h4>
                                    <p className='text-xs text-slate-600 mb-4 leading-relaxed'>{t('methodology.db.spDesc')}</p>
                                </div>

                                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center'><span className='mr-2 inline-block h-2 w-2 rounded-full bg-cyan-500'></span>{t('methodology.db.adBadge')}</p>
                                    <h4 className='font-bold text-slate-900 mb-2'>{t('methodology.db.adTitle')}</h4>
                                    <p className='text-xs text-slate-600 mb-4 leading-relaxed'>{t('methodology.db.adDesc')}</p>
                                </div>

                                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center'><span className='mr-2 inline-block h-2 w-2 rounded-full bg-amber-500'></span>{t('methodology.db.rrBadge')}</p>
                                    <h4 className='font-bold text-slate-900 mb-2'>{t('methodology.db.rrTitle')}</h4>
                                    <p className='text-xs text-slate-600 mb-4 leading-relaxed'>{t('methodology.db.rrDesc')}</p>
                                </div>

                                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center'><span className='mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500'></span>{t('methodology.db.srBadge')}</p>
                                    <h4 className='font-bold text-slate-900 mb-2'>{t('methodology.db.srTitle')}</h4>
                                    <p className='text-xs text-slate-600 mb-4 leading-relaxed'>{t('methodology.db.srDesc')}</p>
                                </div>

                                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center'><span className='mr-2 inline-block h-2 w-2 rounded-full bg-violet-500'></span>{t('methodology.db.ptBadge')}</p>
                                    <h4 className='font-bold text-slate-900 mb-2'>{t('methodology.db.ptTitle')}</h4>
                                    <p className='text-xs text-slate-600 mb-4 leading-relaxed'>{t('methodology.db.ptDesc')}</p>
                                </div>

                                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center'><span className='mr-2 inline-block h-2 w-2 rounded-full bg-pink-500'></span>{t('methodology.db.mdBadge')}</p>
                                    <h4 className='font-bold text-slate-900 mb-2'>{t('methodology.db.mdTitle')}</h4>
                                    <p className='text-xs text-slate-600 mb-4 leading-relaxed'>{t('methodology.db.mdDesc')}</p>
                                </div>
                            </div>
                        </motion.section>

                        {/* KEAMANAN SISTEM */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                        >
                            <div className='mb-8'>
                                <p className='text-xs font-bold uppercase tracking-widest text-[#267dff] mb-2'>{t('methodology.sec.badge')}</p>
                                <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>{t('methodology.sec.title')}</h2>
                                <p className='mt-3 text-sm text-slate-600 sm:text-base max-w-3xl'>{t('methodology.sec.desc')}</p>
                            </div>

                            <div className='flex flex-col gap-3 mb-10'>
                                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-red-500'>
                                    <div className='w-full sm:w-48 shrink-0'>
                                        <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>{t('methodology.sec.p1Sub')}</p>
                                        <p className='text-sm font-bold text-slate-900'>{t('methodology.sec.p1Title')}</p>
                                        <p className='text-xs text-slate-500'>{t('methodology.sec.p1Desc')}</p>
                                    </div>
                                    <div className='flex flex-wrap gap-2'>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-red-500'></span>Query Restriction</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Role-Based Access (RBAC)</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>No Raw DB Export</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Hak Akses Minimal</span>
                                    </div>
                                </div>

                                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-amber-500'>
                                    <div className='w-full sm:w-48 shrink-0'>
                                        <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>{t('methodology.sec.p2Sub')}</p>
                                        <p className='text-sm font-bold text-slate-900'>{t('methodology.sec.p2Title')}</p>
                                        <p className='text-xs text-slate-500'>{t('methodology.sec.p2Desc')}</p>
                                    </div>
                                    <div className='flex flex-wrap gap-2'>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-amber-500'></span>JWT Token Auth</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Session Management</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>API Key Validation</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Tingkat Pengguna & Admin</span>
                                    </div>
                                </div>

                                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-violet-500'>
                                    <div className='w-full sm:w-48 shrink-0'>
                                        <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>{t('methodology.sec.p3Sub')}</p>
                                        <p className='text-sm font-bold text-slate-900'>{t('methodology.sec.p3Title')}</p>
                                        <p className='text-xs text-slate-500'>{t('methodology.sec.p3Desc')}</p>
                                    </div>
                                    <div className='flex flex-wrap gap-2'>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-violet-500'></span>HTTPS / TLS Enkripsi</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>CORS Policy</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Rate Limiting</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Input Validation & Sanitasi</span>
                                    </div>
                                </div>

                                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-cyan-500'>
                                    <div className='w-full sm:w-48 shrink-0'>
                                        <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>{t('methodology.sec.p4Sub')}</p>
                                        <p className='text-sm font-bold text-slate-900'>{t('methodology.sec.p4Title')}</p>
                                        <p className='text-xs text-slate-500'>{t('methodology.sec.p4Desc')}</p>
                                    </div>
                                    <div className='flex flex-wrap gap-2'>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-cyan-500'></span>WMS/WFS Terproteksi</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Layer Access Control</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>IP Whitelist</span>
                                        <span className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900'><span className='h-1.5 w-1.5 rounded-full bg-slate-400'></span>Audit Log Akses</span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-5'>
                                <div className='pt-0.5 text-red-600'>
                                    <Lock className="h-6 w-6" />
                                </div>
                                <div className='text-sm text-slate-700 leading-relaxed'>
                                    <strong className='text-slate-900 font-semibold'>{t('methodology.sec.noteStrong')}</strong> {t('methodology.sec.noteBody')}
                                </div>
                            </div>
                        </motion.section>

                        {/* STANDAR */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                        >
                            <div className='mb-8'>
                                <p className='text-xs font-bold uppercase tracking-widest text-[#267dff] mb-2'>{t('methodology.std.badge')}</p>
                                <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>{t('methodology.std.title')}</h2>
                                <p className='mt-3 text-sm text-slate-600 sm:text-base max-w-3xl'>{t('methodology.std.desc')}</p>
                            </div>

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div className='flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[9px] font-bold leading-tight tracking-wide text-white text-center'>IHO<br />S-121</div>
                                    <div>
                                        <h4 className='text-sm font-bold text-slate-900 mb-1'>{t('methodology.std.ihoTitle')}</h4>
                                        <p className='text-xs text-slate-600 mb-2 leading-relaxed'>{t('methodology.std.ihoDesc')}</p>
                                        <span className='inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>{t('methodology.std.ihoTag')}</span>
                                    </div>
                                </div>
                                <div className='flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[9px] font-bold leading-tight tracking-wide text-white text-center'>UNCLOS<br />1982</div>
                                    <div>
                                        <h4 className='text-sm font-bold text-slate-900 mb-1'>{t('methodology.std.unclosTitle')}</h4>
                                        <p className='text-xs text-slate-600 mb-2 leading-relaxed'>{t('methodology.std.unclosDesc')}</p>
                                        <span className='inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>{t('methodology.std.unclosTag')}</span>
                                    </div>
                                </div>
                                <div className='flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[9px] font-bold leading-tight tracking-wide text-white text-center'>ISO<br />19115</div>
                                    <div>
                                        <h4 className='text-sm font-bold text-slate-900 mb-1'>{t('methodology.std.iso115Title')}</h4>
                                        <p className='text-xs text-slate-600 mb-2 leading-relaxed'>{t('methodology.std.iso115Desc')}</p>
                                        <span className='inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>{t('methodology.std.iso115Tag')}</span>
                                    </div>
                                </div>
                                <div className='flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[9px] font-bold leading-tight tracking-wide text-white text-center'>ISO<br />25010</div>
                                    <div>
                                        <h4 className='text-sm font-bold text-slate-900 mb-1'>{t('methodology.std.iso010Title')}</h4>
                                        <p className='text-xs text-slate-600 mb-2 leading-relaxed'>{t('methodology.std.iso010Desc')}</p>
                                        <span className='inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>{t('methodology.std.iso010Tag')}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* SPESIFIKASI & METADATA */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                        >
                            <div className='mb-8'>
                                <p className='text-xs font-bold uppercase tracking-widest text-[#267dff] mb-2'>{t('methodology.meta.badge')}</p>
                                <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>{t('methodology.meta.title')}</h2>
                                <p className='mt-3 text-sm text-slate-600 sm:text-base max-w-3xl'>{t('methodology.meta.desc')}</p>
                            </div>

                            <div className='flex flex-col gap-4'>
                                <div className='flex flex-col md:flex-row gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-base font-bold text-white/90'>{t('methodology.meta.n1Num')}</div>
                                    <div className='flex-1'>
                                        <h4 className='text-[15px] font-bold text-slate-900 mb-1'>{t('methodology.meta.n1Title')}</h4>
                                        <p className='text-xs font-medium text-blue-600 mb-1.5'>{t('methodology.meta.n1Src')}</p>
                                        <p className='text-[13px] text-slate-600 mb-3 leading-relaxed'>{t('methodology.meta.n1Desc')}</p>
                                        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kGeom')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v1Geom')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kRef')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v1Ref')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kFormat')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v1Format')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kValid')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v1Valid')}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col md:flex-row gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-base font-bold text-white/90'>{t('methodology.meta.n2Num')}</div>
                                    <div className='flex-1'>
                                        <h4 className='text-[15px] font-bold text-slate-900 mb-1'>{t('methodology.meta.n2Title')}</h4>
                                        <p className='text-xs font-medium text-blue-600 mb-1.5'>{t('methodology.meta.n2Src')}</p>
                                        <p className='text-[13px] text-slate-600 mb-3 leading-relaxed'>{t('methodology.meta.n2Desc')}</p>
                                        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kGeom')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v2Geom')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kRef')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v2Ref')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kFormat')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v2Format')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kValid')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v2Valid')}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col md:flex-row gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-base font-bold text-white/90'>{t('methodology.meta.n3Num')}</div>
                                    <div className='flex-1'>
                                        <h4 className='text-[15px] font-bold text-slate-900 mb-1'>{t('methodology.meta.n3Title')}</h4>
                                        <p className='text-xs font-medium text-blue-600 mb-1.5'>{t('methodology.meta.n3Src')}</p>
                                        <p className='text-[13px] text-slate-600 mb-3 leading-relaxed'>{t('methodology.meta.n3Desc')}</p>
                                        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kType')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v3Type')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kFormat')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v3Format')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kParty')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v3Party')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kValid')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v3Valid')}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col md:flex-row gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-base font-bold text-white/90'>{t('methodology.meta.n4Num')}</div>
                                    <div className='flex-1'>
                                        <h4 className='text-[15px] font-bold text-slate-900 mb-1'>{t('methodology.meta.n4Title')}</h4>
                                        <p className='text-xs font-medium text-blue-600 mb-1.5'>{t('methodology.meta.n4Src')}</p>
                                        <p className='text-[13px] text-slate-600 mb-3 leading-relaxed'>{t('methodology.meta.n4Desc')}</p>
                                        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kType')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v4Type')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kFormat')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v4Format')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kParty')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v4Party')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kValid')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v4Valid')}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col md:flex-row gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-base font-bold text-white/90'>{t('methodology.meta.n5Num')}</div>
                                    <div className='flex-1'>
                                        <h4 className='text-[15px] font-bold text-slate-900 mb-1'>{t('methodology.meta.n5Title')}</h4>
                                        <p className='text-xs font-medium text-blue-600 mb-1.5'>{t('methodology.meta.n5Src')}</p>
                                        <p className='text-[13px] text-slate-600 mb-3 leading-relaxed'>{t('methodology.meta.n5Desc')}</p>
                                        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kType')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v5Type')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kFormat')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v5Format')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kParty')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v5Party')}</span></div>
                                            <div><span className='block text-[10px] font-bold uppercase tracking-wide text-slate-500'>{t('methodology.meta.kValid')}</span><span className='text-xs font-medium text-slate-900'>{t('methodology.meta.v5Valid')}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                    </div>
                </section>
            </main>
        </div>
    );
};

export default MethodologyPage;
