import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock3 } from 'lucide-react';

import PortalPageLayout from '@/components/portal/PortalPageLayout';

type RequestSuccessState = {
    requesterName?: string;
    institution?: string;
    requestedAt?: string;
    requestId?: string;
};

const RequestDataSuccessPage = () => {
    const location = useLocation();
    const state = (location.state ?? {}) as RequestSuccessState;
    const submittedTimeLabel = state.requestedAt
        ? new Date(state.requestedAt).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
        : null;

    return (
        <PortalPageLayout showIntro={false}>
            <section className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(17,31,162,0.12)]'>
                <div className='bg-gradient-to-r from-[#5478FF] to-[#53CBF3] px-6 py-8 text-center text-white'>
                    <h1 className='text-3xl font-extrabold tracking-wide sm:text-4xl'>FORM BERHASIL DIKIRIM</h1>
                    <p className='mt-1 text-sm italic text-blue-100 sm:text-lg'>Submission Success</p>
                </div>

                <div className='space-y-5 p-5 sm:p-8'>
                    <div className='rounded-2xl border border-[#5478FF]/25 bg-[#f3f7ff] p-4'>
                        <div className='flex items-start gap-3'>
                            <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-[#111FA2]' />
                            <div>
                                <p className='text-sm font-semibold text-[#111FA2]'>Permintaan data telah diterima</p>
                                <p className='mt-1 text-sm text-slate-700'>
                                    Tim akan meninjau pengajuan dan mengirim informasi lanjutan melalui kontak Anda.
                                </p>
                            </div>
                        </div>
                    </div>

                    {state.requestId || state.requesterName || state.institution || submittedTimeLabel ? (
                        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-[#5478FF]'>Ringkasan Pengajuan</p>
                            <div className='mt-2 space-y-1.5 text-sm text-slate-700'>
                                {state.requestId ? (
                                    <p>
                                        No. referensi:{' '}
                                        <code className='font-mono text-xs text-[#111FA2]'>{state.requestId}</code>
                                    </p>
                                ) : null}
                                {state.requesterName ? <p>Nama: {state.requesterName}</p> : null}
                                {state.institution ? <p>Institusi: {state.institution}</p> : null}
                                {submittedTimeLabel ? (
                                    <p className='flex items-center gap-1.5'>
                                        <Clock3 className='h-4 w-4 text-slate-500' />
                                        Dikirim: {submittedTimeLabel}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    <div className='flex flex-wrap gap-3'>
                        <Link
                            to='/request-data'
                            className='rounded-xl bg-gradient-to-r from-[#5478FF] to-[#111FA2] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
                        >
                            Buat Permintaan Baru
                        </Link>
                        <Link
                            to='/peta'
                            className='rounded-xl border border-[#5478FF]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#111FA2] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f3f7ff]'
                        >
                            Buka Peta Interaktif
                        </Link>
                        <Link
                            to='/'
                            className='rounded-xl border border-[#5478FF]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#111FA2] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f3f7ff]'
                        >
                            Ke Beranda
                        </Link>
                    </div>
                </div>
            </section>
        </PortalPageLayout>
    );
};

export default RequestDataSuccessPage;
