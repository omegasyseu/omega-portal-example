import {
	Combobox,
	Group,
	Image,
	Text,
	TextInput,
	useCombobox,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useGameLauncher } from "@/components/games/hooks/use-game-launcher.ts";
import { LauncherCurrencyModal } from "@/components/games/launcher-currency-modal.tsx";
import {
	gameKey,
	providerLabel,
	searchGames,
} from "@/components/games/lobby-model.ts";
import { SEARCH_ICON_SIZE } from "@/constants/ui-sizes.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./game-search.module.css";

const MAX_RESULTS = 8;
const THUMBNAIL_SIZE = 40;

// Live game search: matches show as the player types, and choosing one opens the game.
export function GameSearch() {
	const [query, setQuery] = useState("");
	const { launch, picker, closePicker } = useGameLauncher();
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});
	const { lobby } = useBrandContent();
	const results = useMemo(
		() => searchGames(lobby, query).slice(0, MAX_RESULTS),
		[lobby, query],
	);

	const openGame = async (key: string) => {
		const game = results.find((result) => gameKey(result) === key);
		combobox.closeDropdown();
		setQuery("");
		if (game) {
			await launch(game);
		}
	};

	return (
		<>
			<Combobox store={combobox} onOptionSubmit={openGame}>
				<Combobox.Target>
					<TextInput
						type="search"
						name="game-search"
						autoComplete="off"
						aria-label="Search games"
						placeholder="Search games…"
						leftSection={<IconSearch size={SEARCH_ICON_SIZE} aria-hidden />}
						size="md"
						value={query}
						onChange={(event) => {
							setQuery(event.currentTarget.value);
							combobox.openDropdown();
							combobox.selectFirstOption();
						}}
						onFocus={() => combobox.openDropdown()}
						onBlur={() => combobox.closeDropdown()}
					/>
				</Combobox.Target>
				<Combobox.Dropdown hidden={query.trim() === ""}>
					<Combobox.Options>
						{results.length === 0 ? (
							<Combobox.Empty>No games match “{query.trim()}”</Combobox.Empty>
						) : (
							results.map((game) => (
								<Combobox.Option value={gameKey(game)} key={gameKey(game)}>
									<Group gap="sm" wrap="nowrap">
										<Image
											src={game.image}
											alt=""
											w={THUMBNAIL_SIZE}
											h={THUMBNAIL_SIZE}
											radius="sm"
										/>
										<div className={classes.text}>
											<Text fz="sm" fw={600} truncate>
												{game.title}
											</Text>
											<Text fz="xs" c="dimmed" truncate>
												{providerLabel(game.gameProvider)}
											</Text>
										</div>
									</Group>
								</Combobox.Option>
							))
						)}
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
			<LauncherCurrencyModal picker={picker} onClose={closePicker} />
		</>
	);
}
