import { ActionIcon, Popover, Stack, Switch, Text } from "@mantine/core";
import { useDisclosure, useWindowEvent } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import {
	isWidgetOffered,
	setWidgetSetting,
	useWidgetSettings,
	type WidgetSetting,
} from "@/components/games/widget-settings.ts";
import { MENU_ICON_SIZE } from "@/constants/ui-sizes.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./game-view.module.css";

// Quest first, then the rail's cards and the tabs below the game, in the order they show.
const SWITCHES: readonly { name: WidgetSetting; label: string }[] = [
	{ name: "showQuest", label: "Quest" },
	{ name: "showJackpot", label: "Jackpot" },
	{ name: "showCashback", label: "Cashback" },
	{ name: "showChallenge", label: "Daily Challenges" },
	// Still saved as showLeaderboard, the key players' choices are stored under.
	{ name: "showLeaderboard", label: "Daily Race" },
];

// The toolbar's ⚙ button: switches for the widgets around the game, as on Omega Wins.
export function WidgetSettingsMenu() {
	const settings = useWidgetSettings();
	const { engageFeatures } = useBrandContent();
	const [opened, { toggle, close }] = useDisclosure(false);
	// A click into the game frame never reaches this document, so the window losing
	// focus to the iframe is what closes the menu.
	useWindowEvent("blur", close);

	return (
		<Popover
			opened={opened}
			onDismiss={close}
			position="bottom-end"
			shadow="md"
			radius="lg"
			trapFocus
			returnFocus
			withinPortal
		>
			<Popover.Target>
				<ActionIcon
					variant="default"
					size="input-sm"
					aria-label="Game widgets"
					onClick={toggle}
				>
					<IconSettings size={MENU_ICON_SIZE} aria-hidden />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown className={classes.widgetMenu}>
				<Text className={classes.widgetMenuTitle}>Game widgets</Text>
				<Stack gap="sm">
					{SWITCHES.filter(({ name }) =>
						isWidgetOffered(name, engageFeatures),
					).map(({ name, label }) => (
						<Switch
							key={name}
							label={label}
							labelPosition="left"
							checked={settings[name]}
							onChange={(event) =>
								setWidgetSetting(name, event.currentTarget.checked)
							}
							classNames={{
								body: classes.widgetSwitchBody,
								labelWrapper: classes.widgetSwitchLabel,
								track: classes.widgetSwitchTrack,
							}}
						/>
					))}
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
}
