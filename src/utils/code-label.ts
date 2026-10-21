// IPS codes such as FREE_SPINS or NOT_REVIEWED; players read "Free spins", "Not reviewed".
export const codeLabel = (code: string) => {
	const words = code.toLowerCase().replaceAll("_", " ");
	return words.charAt(0).toUpperCase() + words.slice(1);
};
