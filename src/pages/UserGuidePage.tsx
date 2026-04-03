import PortalPageLayout from '@/components/portal/PortalPageLayout';

const UserGuidePage = () => {
    return (
        <PortalPageLayout showIntro={false}>
            <section className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(17,31,162,0.12)]'>
                <div className='bg-gradient-to-r from-[#5478FF] to-[#53CBF3] px-6 py-8 text-center text-white'>
                    <h1 className='text-3xl font-extrabold tracking-wide sm:text-4xl'>PETUNJUK PENGGUNAAN</h1>
                    <p className='mt-1 text-sm italic text-blue-100 sm:text-lg'>Guidebook</p>
                </div>

                <div className='p-5 sm:p-8'>
                    <div className='rounded-2xl border-2 border-dashed border-[#5478FF]/35 bg-[#f7f9ff] p-8 text-center'>
                        <p className='text-base font-semibold text-[#111FA2] sm:text-lg'>PDF guidebook akan ditampilkan di sini.</p>
                    </div>
                </div>
            </section>
        </PortalPageLayout>
    );
};

export default UserGuidePage;
