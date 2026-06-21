import {
	IHO_BOUNDARY_COLOR,
	EASY_READ_COLORS,
	EASY_READ_LINE_LAYER_IDS,
	POINT_LEGEND_COLORS,
	POINT_LEGEND_LAYER_IDS,
	type EasyReadLineLayerId,
	type PointLegendLayerId,
} from '@/components/map/ihoSymbology';
import { getLayerLabel } from '@/i18n/webgis-catalog';
import { useWebGisT } from '@/i18n/useWebGisT';
import { useUIStore } from '@/store/useUI';
import {
	STATUS_LEGEND_ITEMS,
	dashForStatusTier,
	type StatusSymbologyTier,
} from '@/lib/statusSymbology';

const FisheryLegendIcon = () => (
	<svg aria-hidden='true' viewBox='0 0 64 64' className='h-8 w-8'>
		<ellipse cx='35' cy='32' rx='17' ry='8' fill='white' fillOpacity='0.78' stroke={IHO_BOUNDARY_COLOR} strokeWidth='3.2' />
		<path d='M18 32 7 24M18 32 7 40M18 32 7 32' fill='none' stroke={IHO_BOUNDARY_COLOR} strokeWidth='3.2' strokeLinecap='round' />
		<circle cx='43.5' cy='30' r='1.7' fill={IHO_BOUNDARY_COLOR} />
	</svg>
);

type IhoLegendItem =
	| { kind: 'marker'; marker: string; labelKey: string }
	| { kind: 'fishery'; labelKey: string }
	| { kind: 'label'; text: string; labelKey: string };

const IHO_LEGEND_ITEMS: IhoLegendItem[] = [
	{ kind: 'label', text: 'Baseline', labelKey: 'legend.iho.baseline' },
	{ kind: 'marker', marker: '+  +', labelKey: 'legend.iho.territorial' },
	{ kind: 'marker', marker: '+', labelKey: 'legend.iho.contiguous' },
	{ kind: 'fishery', labelKey: 'legend.iho.fisheries' },
	{ kind: 'label', text: 'Continental Shelf', labelKey: 'legend.iho.continentalShelf' },
	{ kind: 'label', text: 'EEZ', labelKey: 'legend.iho.eez' },
	{ kind: 'label', text: 'ECS', labelKey: 'legend.iho.ecs' },
];

const EASY_READ_LABEL_KEYS: Record<EasyReadLineLayerId, string> = {
	baseline: 'legend.easyRead.baseline',
	territorial_sea: 'legend.easyRead.territorial',
	contiguous_zone: 'legend.easyRead.contiguous',
	eez_limit: 'legend.easyRead.eez',
	continental_shelf: 'legend.easyRead.continentalShelf',
	landas_kontinen_ekstensi: 'legend.easyRead.extendedShelf',
	fisheries: 'legend.easyRead.fisheries',
};

const LegendSymbol = ({ item }: { item: IhoLegendItem }) => {
	if (item.kind === 'label') {
		return (
			<span className='relative inline-flex h-8 w-28 items-center justify-center'>
				<span className='absolute h-px w-full' style={{ backgroundColor: IHO_BOUNDARY_COLOR }} />
				<span
					className='relative whitespace-pre-line bg-[color:var(--color-panel)] px-1 text-center text-[11px] italic leading-tight'
					style={{ color: IHO_BOUNDARY_COLOR }}
				>
					{item.text}
				</span>
			</span>
		);
	}

	if (item.kind === 'fishery') {
		return (
			<span className='relative inline-flex h-8 w-28 items-center justify-center'>
				<span className='absolute h-px w-full' style={{ backgroundColor: IHO_BOUNDARY_COLOR }} />
				<span className='relative bg-[color:var(--color-panel)] px-1'>
					<FisheryLegendIcon />
				</span>
			</span>
		);
	}

	return (
		<span className='relative inline-flex h-8 w-28 items-center justify-center'>
			<span className='absolute h-px w-full' style={{ backgroundColor: IHO_BOUNDARY_COLOR }} />
			<span className='relative bg-[color:var(--color-panel)] px-1 text-lg leading-none' style={{ color: IHO_BOUNDARY_COLOR }}>
				{item.marker}
			</span>
		</span>
	);
};

/** Legend swatch: round caps + phase offset so long-dash tier reads as dashes, not dash-dot. */
const statusDashSwatch = (
	tier: StatusSymbologyTier,
): { dasharray?: string; dashoffset?: number; linecap: 'butt' | 'round' } => {
	const dash = dashForStatusTier(tier);
	if (!dash) return { linecap: 'butt' };
	const scale = 2;
	const [d, g] = dash;
	const dashLen = d * scale;
	const gapLen = g * scale;
	const period = dashLen + gapLen;
	return {
		dasharray: `${dashLen} ${gapLen}`,
		dashoffset: tier === 'long' ? period * 0.12 : 0,
		linecap: 'round',
	};
};

const StatusLineSwatch = ({ tier, color }: { tier: StatusSymbologyTier; color: string }) => {
	const swatch = statusDashSwatch(tier);
	return (
		<svg aria-hidden='true' width='48' height='16' viewBox='0 0 48 16' className='flex-shrink-0'>
			<line
				x1='2'
				y1='8'
				x2='46'
				y2='8'
				stroke={color}
				strokeWidth='3'
				strokeLinecap={swatch.linecap}
				strokeDasharray={swatch.dasharray}
				strokeDashoffset={swatch.dashoffset}
			/>
		</svg>
	);
};

const EasyReadLineSwatch = ({ layerId }: { layerId: EasyReadLineLayerId }) => {
	const color = EASY_READ_COLORS[layerId];

	return (
		<svg aria-hidden='true' width='48' height='16' viewBox='0 0 48 16' className='flex-shrink-0'>
			<line x1='2' y1='8' x2='46' y2='8' stroke={color} strokeWidth='3' strokeLinecap='round' />
		</svg>
	);
};

const PointSwatch = ({ color }: { color: string }) => (
	<svg aria-hidden='true' width='48' height='16' viewBox='0 0 48 16' className='flex-shrink-0'>
		<circle cx='24' cy='8' r='5' fill={color} stroke='#ffffff' strokeWidth='1.5' opacity={0.9} />
	</svg>
);

const PointLegendBlock = ({
	locale,
	t,
}: {
	locale: 'id' | 'en';
	t: (key: string) => string;
}) => (
	<div className='mt-4 border-t border-[color:var(--color-border)] pt-3'>
		<h4 className='text-xs font-semibold uppercase tracking-wide text-[color:var(--color-muted)]'>
			{t('legend.pointsHeading')}
		</h4>
		<ul className='mt-2 space-y-2'>
			{POINT_LEGEND_LAYER_IDS.map((layerId: PointLegendLayerId) => (
				<li key={layerId} className='flex items-center gap-3 text-sm text-[color:var(--color-text)]'>
					<PointSwatch color={POINT_LEGEND_COLORS[layerId]} />
					<span>{getLayerLabel(layerId, locale)}</span>
				</li>
			))}
		</ul>
	</div>
);

const STATUS_LABEL_KEYS: Record<StatusSymbologyTier, string> = {
	solid: 'legend.statusSolid',
	long: 'legend.statusLong',
	short: 'legend.statusShort',
};

const StatusLegendBlock = ({ lineColor, t }: { lineColor: string; t: (key: string) => string }) => (
	<div className='mt-4 border-t border-[color:var(--color-border)] pt-3'>
		<h4 className='text-xs font-semibold uppercase tracking-wide text-[color:var(--color-muted)]'>
			{t('legend.statusHeading')}
		</h4>
		<ul className='mt-2 space-y-2'>
			{STATUS_LEGEND_ITEMS.map((item) => (
				<li key={item.tier} className='flex items-center gap-3 text-sm text-[color:var(--color-text)]'>
					<StatusLineSwatch tier={item.tier} color={lineColor} />
					<span>{t(STATUS_LABEL_KEYS[item.tier])}</span>
				</li>
			))}
		</ul>
	</div>
);

const Legend = () => {
	const { t, locale } = useWebGisT();
	const symbologyMode = useUIStore((s) => s.symbologyMode);

	return (
		<div className='space-y-4'>
			{symbologyMode === 'iho' ? (
				<div>
					<h3 className='text-sm font-semibold text-[color:var(--color-text)]'>{t('legend.ihoTitle')}</h3>
					<ul className='mt-3 space-y-2'>
						{IHO_LEGEND_ITEMS.map((item) => (
							<li key={item.labelKey} className='flex items-center gap-3 text-sm text-[color:var(--color-text)]'>
								<LegendSymbol item={item} />
								<span>{t(item.labelKey)}</span>
							</li>
						))}
					</ul>
					<PointLegendBlock locale={locale} t={t} />
					<StatusLegendBlock lineColor={IHO_BOUNDARY_COLOR} t={t} />
				</div>
			) : (
				<div>
					<h3 className='text-sm font-semibold text-[color:var(--color-text)]'>{t('legend.easyReadTitle')}</h3>
					<ul className='mt-3 space-y-2.5'>
						{EASY_READ_LINE_LAYER_IDS.map((layerId) => (
							<li key={layerId} className='flex items-center gap-3 text-sm text-[color:var(--color-text)]'>
								<EasyReadLineSwatch layerId={layerId} />
								<span>{t(EASY_READ_LABEL_KEYS[layerId])}</span>
							</li>
						))}
					</ul>
					<PointLegendBlock locale={locale} t={t} />
					<StatusLegendBlock lineColor={IHO_BOUNDARY_COLOR} t={t} />
				</div>
			)}
		</div>
	);
};

export default Legend;
