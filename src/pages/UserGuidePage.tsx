import { motion } from 'motion/react';
import { Map, Layers, Filter, Info, Activity, FileText, Download } from 'lucide-react';

import PortalNav from '@/components/portal/PortalNav';
import { useWebGisT, useWebGisLocale } from '@/i18n/useWebGisT';
import { webgisMessages } from '@/i18n/webgis-messages';
import pdfPlaceholder from '@/assets/Petunjuk Penggunaan SEA-BANDL.pdf';

const UserGuidePage = () => {
    const { t } = useWebGisT();
    const locale = useWebGisLocale();
    const messages = webgisMessages[locale].userGuide;

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
                                {t('userGuide.hero.badge')}
                            </p>
                            <h1 className='portal-display-rhythm font-sans text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.8rem]'>
                                {t('userGuide.hero.title')}
                            </h1>
                            <p className='portal-lead-rhythm mt-5 max-w-3xl text-base text-slate-100/90 sm:text-lg'>
                                {t('userGuide.hero.desc')}
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
                                <h2 className='font-sans text-3xl font-semibold tracking-tight text-[#101f8f] sm:text-4xl'>{t('userGuide.sectionTitle')}</h2>
                                <p className='mt-1 text-sm text-[#4363d0] sm:text-base'>{t('userGuide.sectionSubtitle')}</p>
                            </div>

                            <div className='p-5 sm:p-8 space-y-16'>
                                
                                {/* 3.2 Mengakses Peta Interaktif */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <div className='mb-8'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4363d0] to-[#101f8f] shadow-sm'>
                                                <Map className='h-5 w-5 text-white' />
                                            </div>
                                            <h3 className='text-2xl font-bold text-[#101f8f] flex items-center gap-2'>
                                                {t('userGuide.sections.accessMap.title')}
                                            </h3>
                                        </div>
                                        <p className='mt-3 text-[15px] leading-relaxed text-slate-600 max-w-3xl ml-14'>
                                            {t('userGuide.sections.accessMap.desc')}
                                        </p>
                                    </div>
                                    <div className='relative ml-14 before:absolute before:bottom-0 before:left-[15px] before:top-4 before:w-[2px] before:bg-blue-100'>
                                        <div className='space-y-6'>
                                            {messages.sections.accessMap.steps.map((step, i) => (
                                                <div key={i} className='relative flex items-start gap-5 group'>
                                                    <div className='relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-xs font-bold text-[#4363d0] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4363d0] group-hover:text-white'>
                                                        {i + 1}
                                                    </div>
                                                    <div className='flex-1 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200'>
                                                        <h4 className='text-base font-bold text-slate-900'>{step.t}</h4>
                                                        <p className='text-sm text-slate-600 mt-1.5 leading-relaxed'>{step.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 3.3 Mengatur Layer Peta */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className='pt-6 border-t border-dashed border-[#cfdcf8]'
                                >
                                    <div className='mb-8'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4363d0] to-[#101f8f] shadow-sm'>
                                                <Layers className='h-5 w-5 text-white' />
                                            </div>
                                            <h3 className='text-2xl font-bold text-[#101f8f] flex items-center gap-2'>
                                                {t('userGuide.sections.layers.title')}
                                            </h3>
                                        </div>
                                        <p className='mt-3 text-[15px] leading-relaxed text-slate-600 max-w-3xl ml-14'>
                                            {t('userGuide.sections.layers.desc')}
                                        </p>
                                    </div>
                                    <div className='relative ml-14 before:absolute before:bottom-0 before:left-[15px] before:top-4 before:w-[2px] before:bg-blue-100'>
                                        <div className='space-y-6'>
                                            {messages.sections.layers.steps.map((step, i) => (
                                                <div key={i} className='relative flex items-start gap-5 group'>
                                                    <div className='relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-xs font-bold text-[#4363d0] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4363d0] group-hover:text-white'>
                                                        {i + 1}
                                                    </div>
                                                    <div className='flex-1 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200'>
                                                        <h4 className='text-base font-bold text-slate-900'>{step.t}</h4>
                                                        <p className='text-sm text-slate-600 mt-1.5 leading-relaxed'>{step.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 3.4 Menggunakan Filter Atribut */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className='pt-6 border-t border-dashed border-[#cfdcf8]'
                                >
                                    <div className='mb-8'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4363d0] to-[#101f8f] shadow-sm'>
                                                <Filter className='h-5 w-5 text-white' />
                                            </div>
                                            <h3 className='text-2xl font-bold text-[#101f8f] flex items-center gap-2'>
                                                {t('userGuide.sections.filter.title')}
                                            </h3>
                                        </div>
                                        <p className='mt-3 text-[15px] leading-relaxed text-slate-600 max-w-3xl ml-14'>
                                            {t('userGuide.sections.filter.desc')}
                                        </p>
                                    </div>
                                    <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ml-14'>
                                        {messages.sections.filter.steps.map((step, i) => (
                                            <div key={i} className='rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#4363d0] group'>
                                                <div className='flex items-center gap-4 mb-4'>
                                                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#4363d0] transition-colors duration-300 group-hover:bg-[#4363d0] group-hover:text-white'>
                                                        0{i + 1}
                                                    </div>
                                                    <h4 className='text-base font-bold text-slate-900'>{step.t}</h4>
                                                </div>
                                                <p className='text-sm text-slate-600 leading-relaxed'>{step.d}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* 3.6 Membuka Detail Atribut */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className='pt-6 border-t border-dashed border-[#cfdcf8]'
                                >
                                    <div className='mb-8'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4363d0] to-[#101f8f] shadow-sm'>
                                                <Info className='h-5 w-5 text-white' />
                                            </div>
                                            <h3 className='text-2xl font-bold text-[#101f8f] flex items-center gap-2'>
                                                {t('userGuide.sections.detail.title')}
                                            </h3>
                                        </div>
                                        <p className='mt-3 text-[15px] leading-relaxed text-slate-600 max-w-3xl ml-14'>
                                            {t('userGuide.sections.detail.desc')}
                                        </p>
                                    </div>
                                    <div className='relative ml-14 before:absolute before:bottom-0 before:left-[15px] before:top-4 before:w-[2px] before:bg-blue-100'>
                                        <div className='space-y-6'>
                                            {messages.sections.detail.steps.map((step, i) => (
                                                <div key={i} className='relative flex items-start gap-5 group'>
                                                    <div className='relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-xs font-bold text-[#4363d0] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4363d0] group-hover:text-white'>
                                                        {i + 1}
                                                    </div>
                                                    <div className='flex-1 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200'>
                                                        <h4 className='text-base font-bold text-slate-900'>{step.t}</h4>
                                                        <p className='text-sm text-slate-600 mt-1.5 leading-relaxed'>{step.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 3.7 Menggunakan Geoprocessing */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className='pt-6 border-t border-dashed border-[#cfdcf8]'
                                >
                                    <div className='mb-8'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4363d0] to-[#101f8f] shadow-sm'>
                                                <Activity className='h-5 w-5 text-white' />
                                            </div>
                                            <h3 className='text-2xl font-bold text-[#101f8f] flex items-center gap-2'>
                                                {t('userGuide.sections.geo.title')}
                                            </h3>
                                        </div>
                                        <p className='mt-3 text-[15px] leading-relaxed text-slate-600 max-w-3xl ml-14'>
                                            {t('userGuide.sections.geo.desc')}
                                        </p>
                                    </div>
                                    <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8 ml-14'>
                                        {messages.sections.geo.steps.map((step, i) => (
                                            <div key={i} className='rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#4363d0] group'>
                                                <div className='flex items-center gap-4 mb-4'>
                                                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#4363d0] transition-colors duration-300 group-hover:bg-[#4363d0] group-hover:text-white'>
                                                        0{i + 1}
                                                    </div>
                                                    <h4 className='text-base font-bold text-slate-900'>{step.t}</h4>
                                                </div>
                                                <p className='text-sm text-slate-600 leading-relaxed'>{step.d}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='rounded-2xl border border-blue-100 bg-blue-50/50 p-6 ml-14 shadow-sm backdrop-blur-sm'>
                                        <div className='flex items-center gap-2 mb-5'>
                                            <Activity className='h-5 w-5 text-[#4363d0]' />
                                            <h4 className='text-base font-bold text-slate-900'>{t('userGuide.sections.geo.listTitle')}</h4>
                                        </div>
                                        <div className='grid gap-4 sm:grid-cols-3'>
                                            {messages.sections.geo.operations.map((op, i) => (
                                                <div key={i} className='bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow'>
                                                    <strong className='block text-sm text-[#4363d0] mb-1.5'>{op.t}</strong>
                                                    <span className='text-sm text-slate-600 leading-relaxed block'>{op.d}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 3.8 Mengajukan Request Data */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className='pt-6 border-t border-dashed border-[#cfdcf8]'
                                >
                                    <div className='mb-8'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4363d0] to-[#101f8f] shadow-sm'>
                                                <FileText className='h-5 w-5 text-white' />
                                            </div>
                                            <h3 className='text-2xl font-bold text-[#101f8f] flex items-center gap-2'>
                                                {t('userGuide.sections.requestData.title')}
                                            </h3>
                                        </div>
                                        <p className='mt-3 text-[15px] leading-relaxed text-slate-600 max-w-3xl ml-14'>
                                            {t('userGuide.sections.requestData.desc')}
                                        </p>
                                    </div>
                                    <div className='relative ml-14 before:absolute before:bottom-0 before:left-[15px] before:top-4 before:w-[2px] before:bg-blue-100'>
                                        <div className='space-y-6'>
                                            {messages.sections.requestData.steps.map((step, i) => (
                                                <div key={i} className='relative flex items-start gap-5 group'>
                                                    <div className='relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-xs font-bold text-[#4363d0] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4363d0] group-hover:text-white'>
                                                        {i + 1}
                                                    </div>
                                                    <div className='flex-1 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200'>
                                                        <h4 className='text-base font-bold text-slate-900'>{step.t}</h4>
                                                        <p className='text-sm text-slate-600 mt-1.5 leading-relaxed'>{step.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.section>

                        {/* Download CTA Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, delay: 0.2 }}
                            className='mt-8 overflow-hidden rounded-2xl border border-[#cfdcf8] bg-[#f7faff]/90 shadow-[0_16px_40px_rgba(17,31,162,0.06)] backdrop-blur-sm p-8 sm:p-12 text-center relative'
                        >
                            <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(83,203,243,0.1),transparent_70%)] pointer-events-none' />
                            <div className='mx-auto max-w-2xl relative z-10'>
                                <h3 className='font-sans text-2xl font-bold tracking-tight text-[#101f8f] sm:text-3xl mb-4'>
                                    {t('userGuide.cta.title')}
                                </h3>
                                <p className='text-slate-600 mb-8'>
                                    {t('userGuide.cta.desc')}
                                </p>
                                <a 
                                    href={pdfPlaceholder} 
                                    download="User_Guide_SEA-BANDL.pdf"
                                    className='inline-flex items-center gap-2 rounded-xl bg-[#FFDE42] px-8 py-3.5 text-[15px] font-bold text-[#111FA2] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(255,222,66,0.44)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE42] focus-visible:ring-offset-2'
                                >
                                    <Download className='h-5 w-5' />
                                    {t('userGuide.cta.btn')}
                                </a>
                            </div>
                        </motion.section>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserGuidePage;
