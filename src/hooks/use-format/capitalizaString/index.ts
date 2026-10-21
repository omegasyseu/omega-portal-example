export type CapitalizeString = (str: string, allWords?: boolean) => string;

export const capitalizeString: CapitalizeString = (str, allWords = false) => {
	let modifiedStr = str;

	if (modifiedStr === modifiedStr.toUpperCase()) {
		modifiedStr = modifiedStr.toLowerCase();
	}

	return allWords
		? str
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ")
		: str.charAt(0).toUpperCase() + str.slice(1);
};
