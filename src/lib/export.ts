import Papa from 'papaparse';

import { getLayerSchema } from '@/lib/schema';
import type { LayerId, TableRow } from '@/lib/types';

export const triggerCsvDownload = (content: string, filename = 'attributes.csv'): void => {
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const buildAttributeCsv = (
	layerId: LayerId,
	rows: TableRow[],
	selectedFields?: string[],
): string => {
	const schema = getLayerSchema(layerId);
	const fieldNames = selectedFields && selectedFields.length > 0 ? selectedFields : schema.fields.map((field) => field.name);
	const records = rows.map((row) => {
		const record: Record<string, unknown> = {};
		fieldNames.forEach((name) => {
			record[name] = row.properties[name];
		});
		return record;
	});
	return Papa.unparse(records, {
		delimiter: ',',
		newline: '\r\n',
	});
};

export const downloadAttributeCsv = (
	layerId: LayerId,
	rows: TableRow[],
	selectedFields?: string[],
	filename = `${layerId}-attributes.csv`,
): void => {
	if (rows.length === 0) {
		return;
	}
	const csv = buildAttributeCsv(layerId, rows, selectedFields);
	triggerCsvDownload(csv, filename);
};
