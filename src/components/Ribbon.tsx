import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    Filter,
    FlaskConical,
    Home,
    Info,
    Layers,
    MapPin,
    Map as MapIcon,
} from 'lucide-react';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useWebGisT } from '@/i18n/useWebGisT';
import type { ActivePanel } from '@/store/useUI';
import { useUIStore } from '@/store/useUI';

type DropdownId = 'tampilan';

const Ribbon = () => {
    const { t } = useWebGisT();

    const activePanel = useUIStore((s) => s.activePanel);
    const togglePanel = useUIStore((s) => s.togglePanel);
    const legendOpen = useUIStore((s) => s.legendOpen);
    const setLegendOpen = useUIStore((s) => s.setLegendOpen);
    const showCoordinates = useUIStore((s) => s.showCoordinates);
    const setShowCoordinates = useUIStore((s) => s.setShowCoordinates);

    const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const inDropdown = dropdownRef.current?.contains(target);
            if (!inDropdown) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDropdown = (id: DropdownId) => {
        setOpenDropdown((prev) => (prev === id ? null : id));
    };

    const ACTION_BUTTONS: { id: Exclude<ActivePanel, null>; Icon: React.ElementType; labelKey: string; titleKey: string }[] = [
        { id: 'layers', Icon: Layers, labelKey: 'ribbon.layers', titleKey: 'ribbon.panelLayers' },
        { id: 'filter', Icon: Filter, labelKey: 'ribbon.filter', titleKey: 'ribbon.panelFilter' },
        { id: 'geoprocessing', Icon: FlaskConical, labelKey: 'ribbon.geo', titleKey: 'ribbon.panelGeo' },
        { id: 'basemap', Icon: MapIcon, labelKey: 'ribbon.basemap', titleKey: 'ribbon.basemap' },
    ];

    return (
        <header className='app-ribbon relative z-50 shrink-0 border-b border-[#0f1988] bg-[#111FA2]/95 px-2 backdrop-blur sm:px-4'>
            <div className='mx-auto flex h-14 w-full max-w-[1800px] items-center gap-1.5 sm:h-16 sm:gap-3'>
                <Link
                    to='/'
                    title={t('ribbon.homeTitle')}
                    aria-label={t('ribbon.homeAria')}
                    className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white transition-all duration-200 hover:bg-black/10 sm:h-10 sm:w-10'
                >
                    <Home className='h-4 w-4' />
                </Link>

                <div className='flex shrink-0 items-center gap-2 sm:gap-3 sm:pr-2'>
                    <div className='h-9 w-9 overflow-hidden rounded-full border border-white/20 sm:h-10 sm:w-10'>
                        <img src='/docs/logo_sea-bandl.png' alt={t('ribbon.logoAlt')} className='h-full w-full object-cover' />
                    </div>
                    <div className='app-topbar-brand hidden leading-tight min-[420px]:block'>
                        <p className='text-sm font-bold text-white'>SEA-BANDL</p>
                        <p className='hidden text-[11px] text-[#FFDE42] sm:block'>{t('ribbon.tagline')}</p>
                    </div>
                </div>

                <div className='hidden h-7 w-px bg-white/20 xl:block' />

                <div className='flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden'>
                    {ACTION_BUTTONS.map(({ id, Icon, labelKey, titleKey }) => {
                        const isActive = activePanel === id;
                        return (
                            <button
                                key={id}
                                type='button'
                                onClick={() => togglePanel(id)}
                                title={t(titleKey)}
                                aria-pressed={isActive}
                                className={[
                                    'flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-3',
                                    isActive
                                        ? 'bg-[#3552d6] text-white shadow-inner'
                                        : 'text-white/90 hover:bg-white/15 hover:text-white',
                                ].join(' ')}
                            >
                                <Icon className='h-3.5 w-3.5' />
                                <span className='hidden md:inline'>{t(labelKey)}</span>
                            </button>
                        );
                    })}
                </div>

                <div ref={dropdownRef} className='flex shrink-0 items-center gap-1 sm:gap-2'>

                    <LanguageSwitcher />

                    {/* Tampilan dropdown */}
                    <div className='relative'>
                        <button
                            type='button'
                            onClick={() => handleDropdown('tampilan')}
                            className={[
                                'flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-3',
                                openDropdown === 'tampilan'
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/90 hover:bg-white/15 hover:text-white',
                            ].join(' ')}
                        >
                            <span className='hidden min-[400px]:inline'>{t('ribbon.display')}</span>
                            <span className='min-[400px]:hidden' aria-hidden>
                                <Info className='h-3.5 w-3.5' />
                            </span>
                            <span className='sr-only min-[400px]:hidden'>{t('ribbon.display')}</span>
                            <ChevronDown
                                className={`h-3 w-3 transition-transform ${openDropdown === 'tampilan' ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {openDropdown === 'tampilan' && (
                            <div className='absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_14px_30px_rgba(10,18,50,0.22)]'>
                                <div className='p-1'>
                                    <button
                                        type='button'
                                        onClick={() => { setLegendOpen(!legendOpen); setOpenDropdown(null); }}
                                        className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100'
                                    >
                                        <Info className='h-4 w-4 shrink-0 text-slate-500' />
                                        {t('ribbon.legend')}
                                        <span className={`ml-auto text-[11px] font-bold ${legendOpen ? 'text-[#111FA2]' : 'text-slate-400'}`}>
                                            {legendOpen ? t('common.on') : t('common.off')}
                                        </span>
                                    </button>

                                    <button
                                        type='button'
                                        onClick={() => { setShowCoordinates(!showCoordinates); setOpenDropdown(null); }}
                                        className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100'
                                    >
                                        <MapPin className='h-4 w-4 shrink-0 text-slate-500' />
                                        {t('ribbon.cursorCoords')}
                                        <span className={`ml-auto text-[11px] font-bold ${showCoordinates ? 'text-[#111FA2]' : 'text-slate-400'}`}>
                                            {showCoordinates ? t('common.on') : t('common.off')}
                                        </span>
                                    </button>

                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        to='/request-data'
                        className='shrink-0 rounded-xl bg-[#FFDE42] px-2.5 py-2 text-[11px] font-semibold text-[#111FA2] shadow-md transition-all duration-200 hover:brightness-95 sm:px-4 sm:text-xs sm:hover:-translate-y-0.5 sm:hover:shadow-lg'
                    >
                        <span className='sm:hidden'>{t('ribbon.requestDataShort')}</span>
                        <span className='hidden sm:inline'>{t('ribbon.requestData')}</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Ribbon;

