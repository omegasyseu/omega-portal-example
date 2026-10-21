// Vite 8 resolves a default import from a CommonJS package to the whole
// module.exports in a "type": "module" project. Packages compiled from ES
// modules keep their real export on module.exports.default; unwrap it.
export const interopDefault = <T>(imported: T): T => {
	const wrapped = imported as { default?: T } | null;
	return wrapped !== null &&
		typeof wrapped === "object" &&
		wrapped.default !== undefined
		? wrapped.default
		: imported;
};
