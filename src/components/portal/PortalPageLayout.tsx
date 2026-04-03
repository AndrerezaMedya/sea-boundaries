import type { PropsWithChildren } from 'react';

import PortalNav from '@/components/portal/PortalNav';

type PortalPageLayoutProps = PropsWithChildren<{
    title?: string;
    description?: string;
    showIntro?: boolean;
}>;

const PortalPageLayout = ({ title, description, showIntro = true, children }: PortalPageLayoutProps) => {
    return (
        <div className='min-h-screen bg-[#eef1f6] text-slate-900'>
            <PortalNav />
            <main className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-24 sm:px-6 lg:px-8'>
                {showIntro && title ? (
                    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
                        <h1 className='text-2xl font-semibold text-slate-900 sm:text-3xl'>{title}</h1>
                        {description ? <p className='mt-2 max-w-3xl text-sm text-slate-600 sm:text-base'>{description}</p> : null}
                    </section>
                ) : null}
                {children}
            </main>
        </div>
    );
};

export default PortalPageLayout;
