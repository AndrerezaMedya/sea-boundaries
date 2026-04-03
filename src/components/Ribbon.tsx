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
    Table2,
    Upload,
} from 'lucide-react';

import { useLayersStore } from '@/store/useLayers';
import type { ActivePanel } from '@/store/useUI';
import { useUIStore } from '@/store/useUI';

type DropdownId = 'tampilan';

const Ribbon = () => {
    const activeLayerId = useLayersStore((s) => s.activeLayerId);
    const layerState = useLayersStore((s) => s.layers[activeLayerId]);

    const activePanel = useUIStore((s) => s.activePanel);
    const togglePanel = useUIStore((s) => s.togglePanel);
    const tableOpen = useUIStore((s) => s.tableOpen);
    const toggleTable = useUIStore((s) => s.toggleTable);
    const legendOpen = useUIStore((s) => s.legendOpen);
    const setLegendOpen = useUIStore((s) => s.setLegendOpen);
    const showCoordinates = useUIStore((s) => s.showCoordinates);
    const setShowCoordinates = useUIStore((s) => s.setShowCoordinates);

    const filteredCount = layerState?.filteredIds.length ?? 0;
    const totalCount = layerState?.data.features.length ?? 0;

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

    const ACTION_BUTTONS: { id: Exclude<ActivePanel, null>; Icon: React.ElementType; label: string; title: string }[] = [
        { id: 'layers', Icon: Layers, label: 'Layer', title: 'Panel Layer Peta' },
        { id: 'filter', Icon: Filter, label: 'Filter', title: 'Query Builder & Filter' },
        { id: 'geoprocessing', Icon: FlaskConical, label: 'Geo', title: 'Geoprocessing' },
        { id: 'import', Icon: Upload, label: 'Import', title: 'Import GeoJSON' },
    ];

    return (
        <header
            className='app-ribbon relative z-50 border-b border-[#0f1988] bg-[#111FA2]/95 px-4 backdrop-blur'
            style={{ height: '64px' }}
        >
            <div className='mx-auto flex h-full w-full max-w-[1800px] items-center gap-3'>
                <Link
                    to='/'
                    title='Kembali ke Beranda'
                    aria-label='Kembali ke Beranda'
                    className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/0 text-white transition-all duration-200 hover:bg-black/10'
                >
                    <Home className='h-4.2 w-4.2' />
                </Link>

                <div className='flex shrink-0 items-center gap-3 pr-2'>
                    <div className='h-10 w-10 overflow-hidden rounded-full border border-white/20'>
                        <img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
                    </div>
                    <div className='app-topbar-brand leading-tight'>
                        <p className='text-sm font-bold text-white'>SEA-BANDL</p>
                        <p className='text-[10px] text-[#FFDE42]'>Sea Boundaries and Limits</p>
                    </div>
                </div>

                <div className='hidden h-7 w-px bg-white/20 xl:block' />

                <div className='flex min-w-0 flex-1 items-center gap-1'>
                    {ACTION_BUTTONS.map(({ id, Icon, label, title }) => {
                        const isActive = activePanel === id;
                        return (
                            <button
                                key={id}
                                type='button'
                                onClick={() => togglePanel(id)}
                                title={title}
                                className={[
                                    'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                                    isActive
                                        ? 'bg-[#3552d6] text-white shadow-inner'
                                        : 'text-white/90 hover:bg-white/15 hover:text-white',
                                ].join(' ')}
                            >
                                <Icon className='h-3.5 w-3.5' />
                                <span className='hidden lg:inline'>{label}</span>
                            </button>
                        );
                    })}

                    <button
                        type='button'
                        onClick={toggleTable}
                        title='Tabel Atribut'
                        className={[
                            'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                            tableOpen
                                ? 'bg-[#3552d6] text-white shadow-inner'
                                : 'text-white/90 hover:bg-white/15 hover:text-white',
                        ].join(' ')}
                    >
                        <Table2 className='h-3.5 w-3.5' />
                        <span className='hidden lg:inline'>Tabel</span>
                    </button>
                </div>

                <div ref={dropdownRef} className='flex shrink-0 items-center gap-1'>

                    {/* Tampilan dropdown */}
                    <div className='relative'>
                        <button
                            type='button'
                            onClick={() => handleDropdown('tampilan')}
                            className={[
                                'flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                                openDropdown === 'tampilan'
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/90 hover:bg-white/15 hover:text-white',
                            ].join(' ')}
                        >
                            Tampilan
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
                                        Legenda
                                        <span className={`ml-auto text-[10px] font-bold ${legendOpen ? 'text-[#111FA2]' : 'text-slate-400'}`}>
                                            {legendOpen ? 'ON' : 'OFF'}
                                        </span>
                                    </button>

                                    <button
                                        type='button'
                                        onClick={() => { setShowCoordinates(!showCoordinates); setOpenDropdown(null); }}
                                        className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100'
                                    >
                                        <MapPin className='h-4 w-4 shrink-0 text-slate-500' />
                                        Koordinat Kursor
                                        <span className={`ml-auto text-[10px] font-bold ${showCoordinates ? 'text-[#111FA2]' : 'text-slate-400'}`}>
                                            {showCoordinates ? 'ON' : 'OFF'}
                                        </span>
                                    </button>

                                    <div className='my-1 h-px bg-slate-200' />

                                    <div className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-600'>
                                        Mode Terang Aktif
                                        <span className='ml-auto text-[10px] font-bold text-[#111FA2]'>ON</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        to='/request-data'
                        className='rounded-xl bg-[#FFDE42] px-4 py-2 text-xs font-semibold text-[#111FA2] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg'
                    >
                        Request Data
                    </Link>
                </div>
                <div className='hidden rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white/85 xl:block'>
                    {filteredCount.toLocaleString('id-ID')}/{totalCount.toLocaleString('id-ID')} fitur
                </div>
            </div>
        </header>
    );
};

export default Ribbon;
