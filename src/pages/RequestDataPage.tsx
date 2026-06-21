import { motion } from 'motion/react';
import { Database, FileText, Scale, ShieldCheck } from 'lucide-react';

import PortalNav from '@/components/portal/PortalNav';
import RequestDataForm from '@/components/portal/RequestDataForm';
import { useWebGisT } from '@/i18n/useWebGisT';

const RequestDataPage = () => {
    const { t } = useWebGisT();
    
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
                                {t('portalRequest.kicker')}
                            </p>
                            <h1 className='portal-display-rhythm font-sans text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.8rem]'>
                                {t('portalRequest.title')}
                            </h1>
                            <p className='portal-lead-rhythm mt-5 max-w-3xl text-base text-slate-100/90 sm:text-lg'>
                                {t('portalRequest.lead')}
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className='relative overflow-hidden bg-[#edf4ff] py-20 sm:py-24'>
                    <div className='pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]'>
                        <div className='portal-grid-overlay h-full w-full' />
                    </div>

                    <div className='relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8'>
                        <motion.aside
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className='space-y-6'
                        >
                            <p className='portal-kicker text-[#3552d6]'>{t('portalRequest.guidanceKicker')}</p>
                            <h2 className='portal-section-title font-sans text-3xl font-semibold text-[#101f8f] sm:text-4xl'>
                                {t('portalRequest.guidanceTitle')}
                            </h2>
                            <p className='portal-body-rhythm text-base text-slate-600 sm:text-lg'>
                                {t('portalRequest.guidanceLead')}
                            </p>

                            <div className='space-y-4'>
                                {[
                                    {
                                        icon: <ShieldCheck className='h-5 w-5' />,
                                        title: t('portalRequest.steps.validationTitle'),
                                        text: t('portalRequest.steps.validationText'),
                                    },
                                    {
                                        icon: <Scale className='h-5 w-5' />,
                                        title: t('portalRequest.steps.legalTitle'),
                                        text: t('portalRequest.steps.legalText'),
                                    },
                                    {
                                        icon: <Database className='h-5 w-5' />,
                                        title: t('portalRequest.steps.dataTitle'),
                                        text: t('portalRequest.steps.dataText'),
                                    },
                                    {
                                        icon: <FileText className='h-5 w-5' />,
                                        title: t('portalRequest.steps.docTitle'),
                                        text: t('portalRequest.steps.docText'),
                                    },
                                ].map((item) => (
                                    <article
                                        key={item.title}
                                        className='rounded-2xl border border-[#c9daf9] bg-white/90 p-5 shadow-[0_16px_36px_rgba(13,32,112,0.11)] backdrop-blur-sm'
                                    >
                                        <div className='mb-2 inline-flex rounded-lg bg-[#dff0ff] p-2 text-[#13329d]'>{item.icon}</div>
                                        <h3 className='portal-card-title mb-1 font-sans text-lg font-semibold text-[#101f8f]'>{item.title}</h3>
                                        <p className='portal-body-rhythm text-sm text-slate-600'>{item.text}</p>
                                    </article>
                                ))}
                            </div>
                        </motion.aside>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, delay: 0.06 }}
                            className='rounded-3xl border border-[#c9daf9] bg-white/82 p-4 shadow-[0_22px_52px_rgba(13,32,112,0.14)] backdrop-blur-sm sm:p-6'
                        >
                            <RequestDataForm />
                        </motion.section>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default RequestDataPage;
