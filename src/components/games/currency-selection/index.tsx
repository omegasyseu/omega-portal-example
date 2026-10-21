import { Loader, ScrollArea, Text, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PortalModal } from "@/components/route-modal";
import classes from "./currency-selection.module.css";
import { rateLabel } from "./rate-label.ts";

const DIALOG_WIDTH = 440;
// Five whole rows (48px each, 6px apart) show before the list scrolls.
const LIST_MAX_HEIGHT = 264;

type Props = {
	openedCurrencyModal: boolean;
	closeCurrencyModal: () => void;
	currentGame: {
		title: string;
		gameId: string;
		gameProvider: string;
		image: string;
		category?: string;
	};
	data: {
		playerCurrency: string;
		gameCurrency: string;
		currentRate: number;
		playerCurrencyType: string;
		gameCurrencyType: string;
	}[];
};

// The currencies a game can be played in, when there is more than one: each with the
// rate the player's money converts at. Choosing one opens the game in it; clicking
// outside cancels the launch. Escape is left alone: on phones it would also close the
// menu drawer the game search sits in.
const CurrencySelectionModal = ({
	openedCurrencyModal,
	closeCurrencyModal,
	data,
	currentGame,
}: Props) => {
	const navigate = useNavigate();
	const location = useLocation();
	// The currency the game is opening in; the rows wait while it opens.
	const [opening, setOpening] = useState<string>();

	const play = async (gameCurrency: string) => {
		setOpening(gameCurrency);
		try {
			await navigate({
				to: "/games/$game",
				params: { game: currentGame.gameId },
				search: {
					productCode: currentGame.gameProvider,
					gameCurrency,
					gameName: currentGame.title,
				},
				state: { gameFrom: location.href },
			});
			closeCurrencyModal();
		} catch (error) {
			console.error("Couldn't open the game", currentGame.gameId, error);
			notifications.show({
				message: `We couldn't open ${currentGame.title}. Try again.`,
				color: "danger",
			});
		} finally {
			setOpening(undefined);
		}
	};

	return (
		<PortalModal
			opened={openedCurrencyModal}
			onClose={closeCurrencyModal}
			closeOnEscape={false}
			size={DIALOG_WIDTH}
			title="Choose a currency"
		>
			<Text className={classes.lead}>
				{currentGame.title} plays in these currencies. Your balance converts at
				the rate shown.
			</Text>
			<ScrollArea.Autosize
				mah={LIST_MAX_HEIGHT}
				type="auto"
				// The scrollbar sits beside the rows, not over their rates.
				offsetScrollbars="y"
			>
				<ul className={classes.list}>
					{data.map((conversion) => {
						const rate = rateLabel(conversion);
						return (
							<li key={conversion.gameCurrency}>
								<UnstyledButton
									className={classes.option}
									onClick={() => play(conversion.gameCurrency)}
									disabled={opening !== undefined}
									aria-busy={opening === conversion.gameCurrency}
								>
									<span className={classes.code}>
										{conversion.gameCurrency}
									</span>
									{opening === conversion.gameCurrency ? (
										<Loader size="xs" aria-label="Opening" />
									) : (
										<span
											className={classes.rate}
											data-unknown={rate ? undefined : true}
										>
											{rate ?? "Rate not available"}
										</span>
									)}
								</UnstyledButton>
							</li>
						);
					})}
				</ul>
			</ScrollArea.Autosize>
		</PortalModal>
	);
};

export default CurrencySelectionModal;
