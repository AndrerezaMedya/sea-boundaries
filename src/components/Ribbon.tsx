import { useEffect, useRef, useState } from 'react';
import {
    ChevronDown,
    Database,
    Filter,
    FlaskConical,
    Info,
    Layers,
    LogIn,
    LogOut,
    MapPin,
    Moon,
    Sun,
    Table2,
    Upload,
    User,
} from 'lucide-react';

import { downloadAttributeCsv } from '@/lib/export';
import { useAuthStore } from '@/store/useAuth';
import { useLayersStore } from '@/store/useLayers';
import { useThemeStore } from '@/store/useTheme';
import type { ActivePanel } from '@/store/useUI';
import { useUIStore } from '@/store/useUI';

type DropdownId = 'tampilan' | 'data' | 'auth';

const Ribbon = () => {
    const activeLayerId = useLayersStore((s) => s.activeLayerId);
    const tableRows = useLayersStore((s) => s.tableRows);
    const layerState = useLayersStore((s) => s.layers[activeLayerId]);

    const activePanel = useUIStore((s) => s.activePanel);
    const togglePanel = useUIStore((s) => s.togglePanel);
    const tableOpen = useUIStore((s) => s.tableOpen);
    const toggleTable = useUIStore((s) => s.toggleTable);
    const legendOpen = useUIStore((s) => s.legendOpen);
    const setLegendOpen = useUIStore((s) => s.setLegendOpen);
    const showCoordinates = useUIStore((s) => s.showCoordinates);
    const setShowCoordinates = useUIStore((s) => s.setShowCoordinates);

    const { theme, toggleTheme } = useThemeStore();

    const { role, username, mockLogin, logout } = useAuthStore();
    const [mockUsername, setMockUsername] = useState('');

    const filteredCount = layerState?.filteredIds.length ?? 0;
    const totalCount = layerState?.data.features.length ?? 0;

    const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const authRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const inDropdown = dropdownRef.current?.contains(target);
            const inAuth = authRef.current?.contains(target);
            if (!inDropdown && !inAuth) {
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
            className='app-topbar relative z-50 flex shrink-0 items-center gap-1 border-b px-3'
            style={{ height: '48px' }}
        >
            {/* ── Brand ── */}
            <div className='flex shrink-0 items-center gap-2 mr-3'>
                <h1 className='text-sm font-bold tracking-tight text-[color:var(--color-text)]'>
                    SEA-BANDL
                </h1>
                <span className='hidden text-[11px] tabular-nums text-[color:var(--color-muted)] sm:block'>
                    {filteredCount.toLocaleString('id-ID')}/{totalCount.toLocaleString('id-ID')}
                </span>
            </div>

            {/* ── Separator ── */}
            <div className='mx-1 h-5 w-px shrink-0' style={{ backgroundColor: 'var(--color-border, #e2e8f0)' }} />

            {/* ── Direct Action Buttons ── */}
            <div className='flex items-center gap-0.5'>
                {ACTION_BUTTONS.map(({ id, Icon, label, title }) => {
                    const isActive = activePanel === id;
                    return (
                        <button
                            key={id}
                            type='button'
                            onClick={() => togglePanel(id)}
                            title={title}
                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                                }`}
                        >
                            <Icon className='h-3.5 w-3.5' />
                            <span className='hidden sm:inline'>{label}</span>
                        </button>
                    );
                })}

                {/* Table button — independent (can coexist with side panel) */}
                <button
                    type='button'
                    onClick={toggleTable}
                    title='Tabel Atribut'
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${tableOpen
                            ? 'bg-blue-600 text-white'
                            : 'text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                        }`}
                >
                    <Table2 className='h-3.5 w-3.5' />
                    <span className='hidden sm:inline'>Tabel</span>
                </button>
            </div>

            {/* ── Spacer ── */}
            <div className='flex-1' />

            {/* ── Dropdown Groups ── */}
            <div ref={dropdownRef} className='flex items-center gap-0.5'>

                {/* Tampilan dropdown */}
                <div className='relative'>
                    <button
                        type='button'
                        onClick={() => handleDropdown('tampilan')}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${openDropdown === 'tampilan'
                                ? 'bg-[color:var(--color-panel-muted)]'
                                : 'hover:bg-[color:var(--color-panel-muted)]'
                            } text-[color:var(--color-text)]`}
                    >
                        Tampilan
                        <ChevronDown
                            className={`h-3 w-3 transition-transform ${openDropdown === 'tampilan' ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {openDropdown === 'tampilan' && (
                        <div
                            className='absolute right-0 top-full mt-1 w-52 overflow-hidden rounded-xl border shadow-lg'
                            style={{ zIndex: 9999, backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
                        >
                            <div className='p-1'>
                                {/* Legenda toggle */}
                                <button
                                    type='button'
                                    onClick={() => { setLegendOpen(!legendOpen); setOpenDropdown(null); }}
                                    className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                                >
                                    <Info className='h-4 w-4 shrink-0 text-[color:var(--color-muted)]' />
                                    Legenda
                                    <span className={`ml-auto text-[10px] font-bold ${legendOpen ? 'text-blue-500' : 'text-[color:var(--color-muted)]'}`}>
                                        {legendOpen ? 'ON' : 'OFF'}
                                    </span>
                                </button>

                                {/* Koordinat kursor toggle */}
                                <button
                                    type='button'
                                    onClick={() => { setShowCoordinates(!showCoordinates); setOpenDropdown(null); }}
                                    className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                                >
                                    <MapPin className='h-4 w-4 shrink-0 text-[color:var(--color-muted)]' />
                                    Koordinat Kursor
                                    <span className={`ml-auto text-[10px] font-bold ${showCoordinates ? 'text-blue-500' : 'text-[color:var(--color-muted)]'}`}>
                                        {showCoordinates ? 'ON' : 'OFF'}
                                    </span>
                                </button>

                                <div className='my-1 h-px ' />

                                {/* Theme toggle */}
                                <button
                                    type='button'
                                    onClick={() => { toggleTheme(); setOpenDropdown(null); }}
                                    className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                                >
                                    {theme === 'dark'
                                        ? <Sun className='h-4 w-4 shrink-0 text-[color:var(--color-muted)]' />
                                        : <Moon className='h-4 w-4 shrink-0 text-[color:var(--color-muted)]' />
                                    }
                                    {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Data dropdown */}
                <div className='relative'>
                    <button
                        type='button'
                        onClick={() => handleDropdown('data')}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${openDropdown === 'data'
                                ? 'bg-[color:var(--color-panel-muted)]'
                                : 'hover:bg-[color:var(--color-panel-muted)]'
                            } text-[color:var(--color-text)]`}
                    >
                        <Database className='h-3.5 w-3.5' />
                        <span className='hidden sm:inline'>Data</span>
                        <ChevronDown
                            className={`h-3 w-3 transition-transform ${openDropdown === 'data' ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {openDropdown === 'data' && (
                        <div
                            className='absolute right-0 top-full mt-1 w-60 overflow-hidden rounded-xl border shadow-lg'
                            style={{ zIndex: 9999, backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
                        >
                            <div className='p-1'>
                                <p className='px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]'>
                                    Export
                                </p>
                                <button
                                    type='button'
                                    disabled={tableRows.length === 0}
                                    onClick={() => {
                                        downloadAttributeCsv(activeLayerId, tableRows);
                                        setOpenDropdown(null);
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm disabled:cursor-not-allowed ${tableRows.length > 0
                                            ? 'text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                                            : 'text-[color:var(--color-muted)] opacity-50'
                                        }`}
                                >
                                    Export CSV
                                    <span className='text-[10px] text-[color:var(--color-muted)]'>
                                        {tableRows.length > 0 ? `${tableRows.length.toLocaleString('id-ID')} baris` : 'Tidak ada data'}
                                    </span>
                                </button>

                                <div className='my-1 h-px' style={{ backgroundColor: 'var(--color-border)' }} />

                                <p className='px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]'>
                                    Unduh Data Mentah
                                </p>
                                {/* Data download RESTRICTED — auth + backend API required */}
                                <button
                                    type='button'
                                    disabled={role !== 'authenticated'}
                                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm disabled:cursor-not-allowed ${role === 'authenticated'
                                            ? 'text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                                            : 'text-[color:var(--color-muted)] opacity-40'
                                        }`}
                                >
                                    Download SHP
                                    <span className='text-[10px]'>{role === 'authenticated' ? '↓ ZIP' : '🔐 Login'}</span>
                                </button>
                                <button
                                    type='button'
                                    disabled={role !== 'authenticated'}
                                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm disabled:cursor-not-allowed ${role === 'authenticated'
                                            ? 'text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                                            : 'text-[color:var(--color-muted)] opacity-40'
                                        }`}
                                >
                                    Download GeoJSON
                                    <span className='text-[10px]'>{role === 'authenticated' ? '↓ GeoJSON' : '🔐 Login'}</span>
                                </button>
                                {role !== 'authenticated' && (
                                    <p className='px-3 pb-2 pt-1 text-[10px] leading-tight text-[color:var(--color-muted)] opacity-70'>
                                        Data mentah hanya untuk pengguna terautentikasi.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className='relative shrink-0' ref={authRef}>
                {role === 'authenticated' ? (
                    <div className='flex items-center gap-1'>
                        {/* User chip */}
                        <button
                            type='button'
                            onClick={() => setOpenDropdown((prev) => (prev === 'auth' ? null : 'auth'))}
                            className='flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-2.5 text-[11px] font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white'>
                                <User className='h-3 w-3' />
                            </span>
                            <span className='hidden max-w-[80px] truncate sm:block'>{username}</span>
                            <span className='hidden rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-700 sm:block dark:bg-green-900 dark:text-green-300'>
                                Auth
                            </span>
                        </button>
                        {openDropdown === 'auth' && (
                            <div
                                className='absolute right-0 top-full mt-1 w-52 overflow-hidden rounded-xl border shadow-lg'
                                style={{ zIndex: 9999, backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
                            >
                                <div className='p-2'>
                                    <p className='px-1 pb-2 text-[11px] text-[color:var(--color-muted)]'>
                                        Masuk sebagai <span className='font-semibold text-[color:var(--color-text)]'>{username}</span>
                                    </p>
                                    <div className='my-1 h-px' style={{ backgroundColor: 'var(--color-border)' }} />
                                    <button
                                        type='button'
                                        onClick={() => { logout(); setOpenDropdown(null); }}
                                        className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[color:var(--color-danger)] hover:bg-[color:var(--color-panel-muted)]'
                                    >
                                        <LogOut className='h-3.5 w-3.5' />
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex items-center gap-1'>
                        <button
                            type='button'
                            onClick={() => setOpenDropdown((prev) => (prev === 'auth' ? null : 'auth'))}
                            className='flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <LogIn className='h-3.5 w-3.5' />
                            <span className='hidden sm:inline'>Masuk</span>
                        </button>
                        {openDropdown === 'auth' && (
                            <div
                                className='absolute right-0 top-full mt-1 w-60 overflow-hidden rounded-xl border shadow-lg'
                                style={{ zIndex: 9999, backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
                            >
                                <div className='p-3 space-y-2'>
                                    <p className='text-[11px] font-semibold text-[color:var(--color-text)]'>Login (Dev Mock)</p>
                                    <p className='text-[10px] leading-relaxed text-[color:var(--color-muted)]'>
                                        Login diperlukan untuk mengakses data mentah dan unduhan.
                                    </p>
                                    <input
                                        type='text'
                                        placeholder='Username'
                                        value={mockUsername}
                                        onChange={(e) => setMockUsername(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && mockUsername.trim()) {
                                                mockLogin(mockUsername);
                                                setOpenDropdown(null);
                                            }
                                        }}
                                        className='w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-[color:var(--color-panel-muted)] text-[color:var(--color-text)]'
                                        style={{ borderColor: 'var(--color-border)' }}
                                    />
                                    <button
                                        type='button'
                                        disabled={!mockUsername.trim()}
                                        onClick={() => { mockLogin(mockUsername); setOpenDropdown(null); }}
                                        className='w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        Masuk
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Ribbon;
