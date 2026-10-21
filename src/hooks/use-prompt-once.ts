import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/providers/authentication/authentication.tsx";
import {
	type Prompt,
	rememberPrompted,
	wasPrompted,
} from "@/utils/prompt-once.ts";

// A dialog that just closed (sign-in, or Complete Registration right before the KYC
// prompt) gets this long to finish leaving, so two dialogs never show at once.
const PROMPT_DELAY_MS = 400;

// Opens a prompt the first time `shouldPrompt` holds in a sign-in, once the sign-in dialog
// has gone, and not again until the player signs in again. `open` must be stable.
export const usePromptOnce = (
	prompt: Prompt,
	shouldPrompt: boolean,
	open: () => void,
) => {
	const { session } = useSession();
	const sessionKey = session?.user?.sessionKey;
	const isAuthOpen = useSearch({
		strict: false,
		select: (search) => !!search.auth,
	});
	const isDue = shouldPrompt && !isAuthOpen;

	useEffect(() => {
		if (!isDue || !sessionKey || wasPrompted(prompt, sessionKey)) return;
		const timer = setTimeout(() => {
			rememberPrompted(prompt, sessionKey);
			open();
		}, PROMPT_DELAY_MS);
		return () => clearTimeout(timer);
	}, [prompt, isDue, sessionKey, open]);
};
