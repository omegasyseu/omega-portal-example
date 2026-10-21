// Prompts that show once per sign-in, remembered across reloads for the browser tab and
// forgotten on logout. Blocked storage just means a prompt may show again.
const PREFIX = "portal-5-prompted:";

// Each prompt is remembered on its own.
export type Prompt = "registration" | "kyc";

export const wasPrompted = (prompt: Prompt, sessionKey: string) => {
	try {
		return sessionStorage.getItem(PREFIX + prompt) === sessionKey;
	} catch (error) {
		console.warn("Couldn't read a remembered prompt; it may show again", error);
		return false;
	}
};

export const rememberPrompted = (prompt: Prompt, sessionKey: string) => {
	try {
		sessionStorage.setItem(PREFIX + prompt, sessionKey);
	} catch (error) {
		console.warn("Couldn't remember a prompt; it may show again", error);
	}
};

// Clears the remembered prompts so no session key outlives the sign-in in storage.
export const forgetPrompts = () => {
	try {
		const keys = Array.from({ length: sessionStorage.length }, (_, index) =>
			sessionStorage.key(index),
		);
		for (const key of keys) {
			if (key?.startsWith(PREFIX)) sessionStorage.removeItem(key);
		}
	} catch (error) {
		console.warn("Couldn't forget the remembered prompts", error);
	}
};
