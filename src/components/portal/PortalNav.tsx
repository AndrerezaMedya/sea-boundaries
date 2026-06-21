import { useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useWebGisT } from '@/i18n/useWebGisT';
import { useLocaleStore } from '@/store/useLocale';

type HomeSurfaceMode = 'heroDark' | 'lightSections' | 'deepBlueSections';

/** Sections in scroll order; nav style follows whichever contains the probe line. */
const HOME_SURFACE_SECTIONS: { id: string; mode: HomeSurfaceMode }[] = [
    { id: 'hero', mode: 'heroDark' },
    { id: 'tentang', mode: 'lightSections' },
    { id: 'timeline-historis', mode: 'lightSections' },
    { id: 'tim-pengembang', mode: 'lightSections' },
    { id: 'home-deep-zone', mode: 'deepBlueSections' },
    { id: 'kontak', mode: 'deepBlueSections' },
];

const NAV_SURFACE_PROBE_Y = 80;

function resolveHomeSurfaceMode(): HomeSurfaceMode {
    const probeY = NAV_SURFACE_PROBE_Y;

    for (const { id, mode } of HOME_SURFACE_SECTIONS) {
        const section = document.getElementById(id);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
            return mode;
        }
    }

    return 'lightSections';
}

function topBandRootMargin(probeY: number): string {
    const bandHeight = Math.max(1, probeY);
    const bottomTrim = Math.max(0, window.innerHeight - bandHeight);
    return `-${bandHeight - 1}px 0px -${bottomTrim}px 0px`;
}

const PortalNav = () => {
    const { t } = useWebGisT();
    const { locale, setLocale } = useLocaleStore();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [homeSurfaceMode, setHomeSurfaceMode] = useState<HomeSurfaceMode>('heroDark');
    const isBlueMode = false;
    const isHomeRoute = location.pathname === '/';
    const isAdaptiveRoute = (isHomeRoute || location.pathname === '/request-data' || location.pathname === '/user-guide' || location.pathname === '/metodologi') && !isBlueMode;
    const mobileMenuId = 'portal-mobile-menu';

    const navItems = useMemo(() => [
        { to: '/', label: t('portalNav.home') },
        { to: '/request-data', label: t('portalNav.requestData') },
        { to: '/metodologi', label: t('portalNav.methodology') },
        { to: '/user-guide', label: t('portalNav.userGuide') },
    ], [t]);

    const toggleLocale = () => setLocale(locale === 'id' ? 'en' : 'id');

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useLayoutEffect(() => {
        if (!isAdaptiveRoute) {
            setHomeSurfaceMode('heroDark');
            return;
        }

        let frameId: number | null = null;
        let cancelled = false;

        const syncFromProbe = () => {
            if (!cancelled) {
                setHomeSurfaceMode(resolveHomeSurfaceMode());
            }
        };

        const scheduleSync = () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
            frameId = window.requestAnimationFrame(() => {
                frameId = null;
                syncFromProbe();
            });
        };

        const observer = new IntersectionObserver(
            () => scheduleSync(),
            {
                root: null,
                rootMargin: topBandRootMargin(NAV_SURFACE_PROBE_Y),
                threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
            },
        );

        for (const { id } of HOME_SURFACE_SECTIONS) {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        }

        syncFromProbe();
        window.addEventListener('scroll', scheduleSync, { passive: true, capture: true });
        window.addEventListener('resize', scheduleSync);
        window.addEventListener('load', scheduleSync);

        return () => {
            cancelled = true;
            observer.disconnect();
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
            window.removeEventListener('scroll', scheduleSync, true);
            window.removeEventListener('resize', scheduleSync);
            window.removeEventListener('load', scheduleSync);
        };
    }, [isAdaptiveRoute, isHomeRoute]);

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

        if (isAdaptiveRoute) {
            if (homeSurfaceMode === 'lightSections') {
                return [
                    'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111FA2] focus-visible:ring-offset-1 focus-visible:ring-offset-white',
                    active ? 'bg-[#111FA2] text-white shadow-md shadow-[#111FA2]/20' : 'text-[#11206f] hover:bg-[#111FA2]/10 hover:text-[#0c1762]',
                ].join(' ');
            }

            return [
                'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-[#0b1d7a]',
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
            : isAdaptiveRoute
                ? 'bg-transparent pt-3'
                : 'border-b border-slate-200/80 bg-white/100 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/58',
    ].join(' ');

    const navBarShellClassName = [
        'flex h-16 items-center justify-between transition-[background-color,border-color,box-shadow,color] duration-300',
        isAdaptiveRoute
            ? homeSurfaceMode === 'lightSections'
                ? 'rounded-2xl border border-[#c7d7f6]/85 bg-white/64 px-4 shadow-[0_14px_30px_rgba(17,31,107,0.14)] backdrop-blur-3xl supports-[backdrop-filter]:bg-white/55 sm:px-5'
                : 'rounded-2xl border border-white/25 bg-[#0b1d7a]/48 px-4 shadow-[0_18px_38px_rgba(3,24,89,0.36)] backdrop-blur-xl sm:px-5'
            : '',
    ].join(' ');

    return (
        <header className={headerClassName}>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className={navBarShellClassName}>
                    <div className='flex items-center gap-3'>
                        <div className={['h-10 w-10 overflow-hidden rounded-full border transition-colors duration-300', isBlueMode || (isAdaptiveRoute && homeSurfaceMode !== 'lightSections') ? 'border-white/20' : 'border-slate-200'].join(' ')}>
                            <img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
                        </div>
                        <div className='leading-tight'>
                            <p
                                className={[
                                    'text-sm font-bold transition-colors duration-300',
                                    isBlueMode || (isAdaptiveRoute && homeSurfaceMode !== 'lightSections') ? 'text-white' : 'text-[#111FA2]',
                                ].join(' ')}
                            >
                                SEA-BANDL
                            </p>
                            <p
                                className={[
                                    'text-[10px] transition-colors duration-300',
                                    isBlueMode
                                        ? 'text-[#FFDE42]'
                                        : isAdaptiveRoute
                                            ? homeSurfaceMode === 'lightSections'
                                                ? 'text-[#4b69d9]'
                                                : 'text-[#b8dbff]'
                                            : 'text-[#5478FF]',
                                ].join(' ')}
                            >
                                {t('portalNav.tagline')}
                            </p>
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

                        <button
                            type='button'
                            onClick={toggleLocale}
                            className={[
                                'ml-2 flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111FA2] focus-visible:ring-offset-1',
                                isBlueMode || (isAdaptiveRoute && homeSurfaceMode !== 'lightSections')
                                    ? 'text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white focus-visible:ring-offset-[#0f1988]'
                                    : 'text-[#111FA2] hover:bg-[#111FA2]/10 hover:text-[#0d1780]',
                            ].join(' ')}
                            aria-label='Toggle Language'
                        >
                            <Globe className='h-4 w-4' />
                            <span className="uppercase">{locale}</span>
                        </button>

                        <Link
                            to='/peta'
                            className={[
                                'ml-1 rounded-xl bg-[#FFDE42] px-5 py-2 text-sm font-semibold text-[#111FA2] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE42] focus-visible:ring-offset-2',
                                isHomeRoute
                                    ? 'shadow-[0_12px_28px_rgba(255,222,66,0.44)] hover:scale-[1.01] hover:shadow-[0_16px_32px_rgba(255,222,66,0.52)]'
                                    : 'shadow-md hover:shadow-lg focus-visible:ring-offset-white',
                            ].join(' ')}
                        >
                            {t('portalNav.accessMap')}
                        </Link>
                    </nav>

                    <button
                        type='button'
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className={[
                            'rounded-xl p-2 lg:hidden transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1',
                            isBlueMode || (isAdaptiveRoute && homeSurfaceMode !== 'lightSections') ? 'text-white hover:bg-white/15' : 'text-[#111FA2] hover:bg-slate-100',
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
                                : isAdaptiveRoute
                                    ? homeSurfaceMode === 'lightSections'
                                        ? 'mt-1 rounded-b-2xl border border-[#c7d7f6] border-t-0 bg-white/92 px-3 backdrop-blur-xl'
                                        : 'mt-1 rounded-b-2xl border border-white/20 border-t-0 bg-[#0b1d7a]/52 px-3 backdrop-blur-xl'
                                    : 'border-t border-slate-200',
                        ].join(' ')}
                    >
                        <div className='grid gap-1'>
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={[
                                        'rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-300',
                                        isBlueMode || (isAdaptiveRoute && homeSurfaceMode !== 'lightSections')
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

                            <button
                                type='button'
                                onClick={toggleLocale}
                                className={[
                                    'rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-300 flex items-center gap-2',
                                    isBlueMode || (isAdaptiveRoute && homeSurfaceMode !== 'lightSections')
                                        ? 'text-white/90 hover:bg-white/15'
                                        : 'text-[#111FA2] hover:bg-slate-100',
                                ].join(' ')}
                            >
                                <Globe className='h-4 w-4' />
                                <span className="uppercase">{locale === 'id' ? 'Indonesia' : 'English'}</span>
                            </button>

                            <Link
                                to='/peta'
                                className={[
                                    'mt-2 rounded-xl bg-[#FFDE42] px-4 py-2 text-center text-sm font-semibold text-[#111FA2] transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE42] focus-visible:ring-offset-2',
                                    isHomeRoute ? 'shadow-[0_12px_24px_rgba(255,222,66,0.44)]' : '',
                                ].join(' ')}
                            >
                                {t('portalNav.accessMap')}
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default PortalNav;
