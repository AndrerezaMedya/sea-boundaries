import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
    { to: '/', label: 'Beranda' },
    { to: '/request-data', label: 'Request Data' },
    { to: '/user-guide', label: 'Petunjuk Penggunaan' },
];

const PortalNav = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isBlueMode = location.pathname.startsWith('/request-data') || location.pathname.startsWith('/user-guide');
    const isHomeRoute = location.pathname === '/';
    const mobileMenuId = 'portal-mobile-menu';

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const isItemActive = (to: string) => {
        if (to === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(to);
    };

    const navItemClass = (active: boolean) => {
        if (isBlueMode) {
            return [
                'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f1988]',
                active ? 'bg-[#3552d6] text-white shadow-inner' : 'text-white/90 hover:bg-white/15 hover:text-white',
            ].join(' ');
        }

        if (isHomeRoute) {
            return [
                'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-[#0b1d7a]',
                active ? 'bg-white/25 text-white shadow-inner shadow-[#9fc8ff]/35' : 'text-white/90 hover:bg-white/15 hover:text-white',
            ].join(' ');
        }

        return [
            'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111FA2] focus-visible:ring-offset-1',
            active
                ? 'bg-[#111FA2] text-white shadow-md shadow-[#111FA2]/25'
                : 'text-[#111FA2] hover:bg-[#111FA2]/10 hover:text-[#0d1780]',
        ].join(' ');
    };

    const headerClassName = [
        'fixed left-0 right-0 top-0 z-40',
        isBlueMode
            ? 'border-b border-[#0f1988] bg-[#111FA2]/95 backdrop-blur'
            : isHomeRoute
              ? 'bg-transparent pt-3'
              : 'border-b border-slate-200 bg-white/95 backdrop-blur',
    ].join(' ');

    const navBarShellClassName = [
        'flex h-16 items-center justify-between',
        isHomeRoute && !isBlueMode
            ? 'rounded-2xl border border-white/25 bg-[#0b1d7a]/48 px-4 shadow-[0_18px_38px_rgba(3,24,89,0.36)] backdrop-blur-xl sm:px-5'
            : '',
    ].join(' ');

    return (
        <header className={headerClassName}>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className={navBarShellClassName}>
                    <div className='flex items-center gap-3'>
                        <div className={['h-10 w-10 overflow-hidden rounded-full border', isBlueMode || isHomeRoute ? 'border-white/20' : 'border-slate-200'].join(' ')}>
                            <img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
                        </div>
                        <div className='leading-tight'>
                            <p className={['text-sm font-bold', isBlueMode || isHomeRoute ? 'text-white' : 'text-[#111FA2]'].join(' ')}>SEA-BANDL</p>
                            <p className={['text-[10px]', isBlueMode ? 'text-[#FFDE42]' : isHomeRoute ? 'text-[#b8dbff]' : 'text-[#5478FF]'].join(' ')}>Sea Boundaries and Limits</p>
                        </div>
                    </div>

                    <nav className='hidden items-center gap-2 lg:flex'>
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={navItemClass(isItemActive(item.to))}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link
                            to='/peta'
                            className={[
                                'ml-1 rounded-xl bg-[#FFDE42] px-5 py-2 text-sm font-semibold text-[#111FA2] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE42] focus-visible:ring-offset-2',
                                isHomeRoute
                                    ? 'shadow-[0_12px_28px_rgba(255,222,66,0.44)] hover:scale-[1.01] hover:shadow-[0_16px_32px_rgba(255,222,66,0.52)]'
                                    : 'shadow-md hover:shadow-lg focus-visible:ring-offset-white',
                            ].join(' ')}
                        >
                            Akses Peta
                        </Link>
                    </nav>

                    <button
                        type='button'
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className={[
                            'rounded-xl p-2 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1',
                            isBlueMode || isHomeRoute ? 'text-white hover:bg-white/15' : 'text-[#111FA2] hover:bg-slate-100',
                        ].join(' ')}
                        aria-controls={mobileMenuId}
                        aria-expanded={isMobileMenuOpen}
                        aria-label='Toggle menu'
                    >
                        {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
                    </button>
                </div>

                {isMobileMenuOpen ? (
                    <div
                        id={mobileMenuId}
                        className={[
                            'py-3 lg:hidden',
                            isBlueMode
                                ? 'border-t border-white/20'
                                : isHomeRoute
                                  ? 'mt-1 rounded-b-2xl border border-white/20 border-t-0 bg-[#0b1d7a]/52 px-3 backdrop-blur-xl'
                                  : 'border-t border-slate-200',
                        ].join(' ')}
                    >
                        <div className='grid gap-1'>
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={[
                                        'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                                        isBlueMode || isHomeRoute
                                            ? isItemActive(item.to)
                                                ? 'bg-white/18 text-white'
                                                : 'text-white/90 hover:bg-white/15'
                                            : isItemActive(item.to)
                                              ? 'bg-[#111FA2] text-white'
                                              : 'text-[#111FA2] hover:bg-slate-100',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <Link
                                to='/peta'
                                className={[
                                    'mt-2 rounded-xl bg-[#FFDE42] px-4 py-2 text-center text-sm font-semibold text-[#111FA2] transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE42] focus-visible:ring-offset-2',
                                    isHomeRoute ? 'shadow-[0_12px_24px_rgba(255,222,66,0.44)]' : '',
                                ].join(' ')}
                            >
                                Akses Peta
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default PortalNav;
