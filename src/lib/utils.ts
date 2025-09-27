export type ClassValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| ClassValue[]
	| { [key: string]: boolean | null | undefined };

const appendClass = (acc: string[], value: ClassValue): void => {
	if (!value && value !== 0) {
		return;
	}

	if (typeof value === "string" || typeof value === "number") {
		const trimmed = `${value}`.trim();
		if (trimmed.length > 0) {
			acc.push(trimmed);
		}
		return;
	}

	if (Array.isArray(value)) {
		value.forEach((item) => appendClass(acc, item));
		return;
	}

	Object.entries(value).forEach(([key, condition]) => {
		if (condition) {
			acc.push(key);
		}
	});
};

export const cn = (...inputs: ClassValue[]): string => {
	const acc: string[] = [];
	inputs.forEach((input) => appendClass(acc, input));
	return acc.join(" ");
};
