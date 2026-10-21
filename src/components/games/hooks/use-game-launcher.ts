import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useRequireRegistration } from "@/components/auth/complete-registration/use-needs-registration.ts";
import { useSendToSignIn } from "@/components/auth/hooks/use-send-to-sign-in.ts";
import { type LobbyGame, launchPlan } from "@/components/games/lobby-model.ts";
import { getGameCurrencyConversionOptions } from "@/components/games/queries/get-game-currency-conversion.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type { CurrencySelection } from "@/schemas-types";

export type CurrencyConversion = NonNullable<
	NonNullable<CurrencySelection>["currencyConversions"]
>[number];

// A game that can't run in the player's currency and offers several: the player picks one.
export type CurrencyPicker = {
	game: LobbyGame;
	conversions: CurrencyConversion[];
};

// Opens games. A logged-out visitor is sent to sign in and back. When the game can't run
// in the player's currency and offers more than one, `picker` holds the choices for the
// currency modal. Failures show a notification, and repeat clicks wait for the first.
export const useGameLauncher = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();
	const { session } = useSession();
	const { selectedAccount } = useGeneralInfo();
	const sendToSignIn = useSendToSignIn();
	const requireRegistration = useRequireRegistration();
	const [isLaunching, setIsLaunching] = useState(false);
	const [picker, setPicker] = useState<CurrencyPicker>();

	const openGame = async (game: LobbyGame, gameCurrency: string) =>
		navigate({
			to: "/games/$game",
			params: { game: game.gameId },
			search: {
				productCode: game.gameProvider,
				gameCurrency,
				gameName: game.title,
			},
			state: { gameFrom: location.href },
		});

	const findCurrencyAndOpen = async (game: LobbyGame) => {
		if (!session?.user) {
			await sendToSignIn();
			return;
		}
		// A quick sign-up (QUICK_REG) finishes registering before the first game.
		if (requireRegistration()) {
			return;
		}
		// The selected account loads just after sign-in; until then there's nothing to play with.
		if (!selectedAccount?.sessionKey) {
			notifications.show({
				message: "Your account is still loading. Try again in a moment.",
			});
			return;
		}

		const data = await queryClient.fetchQuery(
			getGameCurrencyConversionOptions({
				sessionKey: selectedAccount.sessionKey,
				productCode: game.gameProvider,
				brandId: session.user.loggedInBrand?.id,
			}),
		);
		const plan = launchPlan(
			data?.currencyConversions ?? [],
			selectedAccount.currency,
		);
		if (plan.kind === "open") {
			await openGame(game, plan.currency);
		} else if (plan.kind === "pick") {
			setPicker({ game, conversions: plan.conversions });
		} else {
			notifications.show({
				message: `${game.title} isn't available in your currency right now.`,
			});
		}
	};

	const launch = async (game: LobbyGame) => {
		if (isLaunching) {
			return;
		}
		setIsLaunching(true);
		try {
			await findCurrencyAndOpen(game);
		} catch (error) {
			console.error("Couldn't open game", game.gameId, error);
			notifications.show({
				color: "danger",
				message: `We couldn't open ${game.title}. Please try again.`,
			});
		} finally {
			setIsLaunching(false);
		}
	};

	return {
		launch,
		isLaunching,
		picker,
		closePicker: () => setPicker(undefined),
	};
};
