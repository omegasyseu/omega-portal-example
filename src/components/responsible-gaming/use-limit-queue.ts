import { notifications } from "@mantine/notifications";
import { useRef, useState } from "react";
import { useLimitCodeStep } from "@/components/responsible-gaming/limit-code-step.tsx";
import type { LimitType } from "@/schemas-types/responsible-gaming";
import type { LimitChange } from "@/server/IPS/responsible-gaming/update-responsible-gaming-limit.tsx";

type SaveOptions = {
	// notSaved is the failed change and the ones queued behind it.
	onError?: (
		error: Error,
		change: LimitChange,
		notSaved: LimitChange[],
	) => void;
};

// Saves a card's changes one request at a time, each through the security-code step
// when the brand requires one. It lives above the cards: a saved change refetches the
// limits, and the queue must outlive any card that re-renders. One queue serves every
// card, so only one Save runs at a time.
export const useLimitQueue = () => {
	const codeStep = useLimitCodeStep();
	const [savingType, setSavingType] = useState<LimitType | null>(null);
	// Changes still waiting behind the one being sent.
	const unsent = useRef(0);

	const saveNext = (remaining: LimitChange[], options: SaveOptions) => {
		const [change, ...rest] = remaining;
		if (!change) {
			setSavingType(null);
			return;
		}
		unsent.current = rest.length;
		codeStep.save(change, {
			onSaved: () => saveNext(rest, options),
			onError: (error) => {
				setSavingType(null);
				options.onError?.(error, change, remaining);
			},
		});
	};

	const saveAll = (changes: LimitChange[], options: SaveOptions = {}) => {
		setSavingType(changes[0]?.limitType ?? null);
		saveNext(changes, options);
	};

	// Closing the code prompt stops the Save; changes already confirmed stay saved.
	const cancel = () => {
		codeStep.cancel();
		setSavingType(null);
		if (unsent.current > 0) {
			notifications.show({
				message:
					"Save stopped. The change you didn't confirm, and any after it, weren't saved.",
				color: "gold",
			});
		}
	};

	const isBusy = savingType !== null;
	const isSaving = (limitType: LimitType) => savingType === limitType;

	return { codeStep: { ...codeStep, cancel }, saveAll, isSaving, isBusy };
};

export type LimitQueue = ReturnType<typeof useLimitQueue>;
