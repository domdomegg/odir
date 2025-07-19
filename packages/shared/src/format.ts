export const boolean = (b?: boolean | null): string => (b === undefined || b === null ? '—' : (b && 'Yes') || 'No');
export const date = (unixTimestamp?: number | null): string => (unixTimestamp === undefined || unixTimestamp === null ? '—' : new Date(unixTimestamp * 1000).toLocaleDateString('en-GB'));
export const percent = (percentageInPoints?: number | null): string => (percentageInPoints === undefined || percentageInPoints === null ? '—' : `${percentageInPoints}%`);
export const timestamp = (unixTimestamp?: number | null): string => (unixTimestamp === undefined || unixTimestamp === null ? '—' : new Date(unixTimestamp * 1000).toLocaleString('en-GB'));
export const json = (any: unknown): string => String(JSON.stringify(any));
