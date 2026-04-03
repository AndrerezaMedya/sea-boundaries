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
				'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
				active ? 'bg-[#3552d6] text-white shadow-inner' : 'text-white/90 hover:bg-white/15 hover:text-white',
			].join(' ');
		}

		return [
			'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
			active
				? 'bg-[#111FA2] text-white shadow-md shadow-[#111FA2]/25'
				: 'text-[#111FA2] hover:bg-[#111FA2]/10 hover:text-[#0d1780]',
		].join(' ');
	};

	return (
		<header
			className={[
				'fixed left-0 right-0 top-0 z-40 border-b backdrop-blur',
				isBlueMode ? 'border-[#0f1988] bg-[#111FA2]/95' : 'border-slate-200 bg-white/95',
			].join(' ')}
		>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='flex h-16 items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='h-10 w-10 overflow-hidden rounded-full border border-white/20'>
							<img src='/docs/logo_sea-bandl.png' alt='Logo SEA-BANDL' className='h-full w-full object-cover' />
						</div>
						<div className='leading-tight'>
							<p className={['text-sm font-bold', isBlueMode ? 'text-white' : 'text-[#111FA2]'].join(' ')}>SEA-BANDL</p>
							<p className={['text-[10px]', isBlueMode ? 'text-[#FFDE42]' : 'text-[#5478FF]'].join(' ')}>Sea Boundaries and Limits</p>
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
							className='ml-1 rounded-xl bg-[#FFDE42] px-5 py-2 text-sm font-semibold text-[#111FA2] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg'
						>
							Akses Peta
						</Link>
					</nav>

					<button
						onClick={() => setIsMobileMenuOpen((prev) => !prev)}
						className={[
							'rounded-xl p-2 lg:hidden',
							isBlueMode ? 'text-white hover:bg-white/15' : 'text-[#111FA2] hover:bg-slate-100',
						].join(' ')}
						aria-label='Toggle menu'
					>
						{isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
					</button>
				</div>

				{isMobileMenuOpen ? (
					<div className={['border-t py-3 lg:hidden', isBlueMode ? 'border-white/20' : 'border-slate-200'].join(' ')}>
						<div className='grid gap-1'>
							{navItems.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									className={[
										'rounded-xl px-3 py-2 text-sm font-semibold',
										isBlueMode ? 'text-white/90 hover:bg-white/15' : 'text-[#111FA2] hover:bg-slate-100',
									].join(' ')}
								>
									{item.label}
								</Link>
							))}

							<Link
								to='/peta'
								className='mt-2 rounded-xl bg-[#FFDE42] px-4 py-2 text-center text-sm font-semibold text-[#111FA2] transition-all duration-200 hover:brightness-95'
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
