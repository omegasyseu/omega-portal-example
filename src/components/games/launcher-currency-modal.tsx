import CurrencySelectionModal from "@/components/games/currency-selection";
import type { CurrencyPicker } from "@/components/games/hooks/use-game-launcher.ts";

// The currency choice for a game opened through useGameLauncher, shown only when needed.
export function LauncherCurrencyModal({
	picker,
	onClose,
}: {
	picker?: CurrencyPicker;
	onClose: () => void;
}) {
	return picker ? (
		<CurrencySelectionModal
			openedCurrencyModal
			closeCurrencyModal={onClose}
			data={picker.conversions}
			currentGame={picker.game}
		/>
	) : null;
}
