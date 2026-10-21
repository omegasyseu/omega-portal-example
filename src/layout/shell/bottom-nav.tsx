import { Text, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import { useOpenEngageDialog } from "@/components/engage-dialog/use-engage-dialog.ts";
import { useCurrentPathname } from "@/hooks/use-current-pathname.ts";
import { NAV_ICONS, renderNavIcon } from "@/layout/shell/nav-icons.tsx";
import { navLinkProps } from "@/layout/shell/nav-link-props.ts";
import {
	isLinkActive,
	isMenuSlot,
	type MenuSlot,
	type NavLink,
} from "@/layout/shell/navigation-model.ts";
import { useShellNavigation } from "@/layout/shell/use-shell-navigation.ts";
import classes from "./shell.module.css";

type Props = {
	isMenuOpen: boolean;
	onOpenMenu: () => void;
};

const SlotContent = ({ slot }: { slot: NavLink | MenuSlot }) => (
	<>
		{renderNavIcon(NAV_ICONS[slot.icon])}
		<Text component="span" className={classes.bottomNavLabel}>
			{slot.label}
		</Text>
	</>
);

// Phone navigation: the call to action, three shortcuts and the menu.
export function BottomNav({ isMenuOpen, onOpenMenu }: Props) {
	const { bottomNav } = useShellNavigation();
	const pathname = useCurrentPathname();
	const href = useLocation({ select: (location) => location.href });
	const openDialog = useOpenEngageDialog();

	return (
		<nav aria-label="Shortcuts" className={classes.bottomNav}>
			{bottomNav.map((slot) => {
				if (isMenuSlot(slot)) {
					return (
						<UnstyledButton
							key={slot.key}
							onClick={onOpenMenu}
							aria-expanded={isMenuOpen}
							aria-haspopup="dialog"
							className={classes.bottomNavSlot}
						>
							<SlotContent slot={slot} />
						</UnstyledButton>
					);
				}
				const isActive = isLinkActive(slot, pathname, openDialog);
				return (
					<UnstyledButton
						key={slot.key}
						renderRoot={(props) => (
							<Link {...props} {...navLinkProps(slot, href)} />
						)}
						aria-current={isActive ? "page" : undefined}
						data-active={isActive || undefined}
						data-call-to-action={slot.isCallToAction}
						className={classes.bottomNavSlot}
					>
						<SlotContent slot={slot} />
					</UnstyledButton>
				);
			})}
		</nav>
	);
}
