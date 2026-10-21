/**
 * Extracts the base part of a URL up to the specified segment count.
 * @param {string} url - The full URL to process.
 * @param {number} segmentCount - The number of segments to include in the base URL.
 * @returns {string} The base part of the URL.
 */
export const extractBaseUrl = (url: string, segmentCount = 2): string => {
	// Ensure the URL has 'https://' for uniform processing if it doesn't start with any protocol
	const normalizedUrl =
		url.startsWith("http://") || url.startsWith("https://")
			? url
			: `https://${url}`;

	// Remove the protocol for easier splitting
	const urlWithoutProtocol = normalizedUrl.replace(/(^\w+:|^)\/\//, "");

	// Split the URL to get the segments
	const segments = urlWithoutProtocol.split("/");

	// Join the segments to form the base URL without the last part
	const baseUrl = segments.slice(0, segmentCount).join("/");

	return baseUrl;
};
