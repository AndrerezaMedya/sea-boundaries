import { useWebGisT } from '@/i18n/useWebGisT';

interface MapPanelBackdropProps {
	onClose: () => void;
}

/** Dim map on small screens when a tool panel is open; tap to dismiss. */
const MapPanelBackdrop = ({ onClose }: MapPanelBackdropProps) => {
	const { t } = useWebGisT();
	return (
		<button
			type='button'
			className='absolute inset-0 z-[29] bg-slate-900/45 backdrop-blur-[1px] md:hidden'
			aria-label={t('common.closePanel')}
			onClick={onClose}
		/>
	);
};

export default MapPanelBackdrop;
