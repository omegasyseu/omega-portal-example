import {
	type Icon,
	IconCashBanknote,
	IconChevronsUp,
	IconCoins,
	IconDeviceGamepad2,
	IconGift,
	IconHome,
	IconMap2,
	IconMenu2,
	IconSend,
	IconShieldCheck,
	IconShoppingCart,
	IconStar,
	IconTrophy,
	IconUserPlus,
	IconUsers,
	IconWallet,
} from "@tabler/icons-react";
import { NAV_ICON_SIZE, NAV_ICON_STROKE } from "@/constants/ui-sizes.ts";
import type { NavIcon } from "@/layout/shell/navigation-model.ts";

// Nav icons sit next to a visible label, so screen readers skip them.
export const renderNavIcon = (IconComponent: Icon) => (
	<IconComponent size={NAV_ICON_SIZE} stroke={NAV_ICON_STROKE} aria-hidden />
);

export const NAV_ICONS: Record<NavIcon, Icon> = {
	promotions: IconSend,
	jackpot: IconCoins,
	challenge: IconStar,
	levelup: IconChevronsUp,
	quest: IconMap2,
	leaderboard: IconTrophy,
	refer: IconUsers,
	deposit: IconWallet,
	withdraw: IconCashBanknote,
	purchase: IconShoppingCart,
	redeem: IconGift,
	home: IconHome,
	games: IconDeviceGamepad2,
	register: IconUserPlus,
	menu: IconMenu2,
	"responsible-gaming": IconShieldCheck,
};
