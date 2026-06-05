import type { Locale } from '@/i18n/types';
import { LOCALES } from '@/i18n/types';
import { useWebGisT } from '@/i18n/useWebGisT';
import { useLocaleStore } from '@/store/useLocale';

const LanguageSwitcher = () => {
	const { t } = useWebGisT();
	const locale = useLocaleStore((s) => s.locale);
	const setLocale = useLocaleStore((s) => s.setLocale);

	return (
		<div
			className='flex items-center gap-1.5'
			role='group'
			aria-label={t('ribbon.language')}
		>
			{LOCALES.map((code: Locale) => {
				const active = locale === code;
				return (
					<button
						key={code}
						type='button'
						onClick={() => setLocale(code)}
						aria-pressed={active}
						className={[
							'min-w-[2rem] rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-200',
							active
								? 'bg-white text-[#111FA2] shadow-sm'
								: 'text-white/85 hover:bg-white/15 hover:text-white',
						].join(' ')}
					>
						{code}
					</button>
				);
			})}
		</div>
	);
};

export default LanguageSwitcher;
