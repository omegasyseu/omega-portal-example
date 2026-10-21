import { Drawer } from "@mantine/core";
import { SHELL_CHROME } from "@/layout/shell/shell-chrome.ts";
import { SIDEBAR_WIDTH } from "@/layout/shell/shell-sizes.ts";
import { Sidebar } from "@/layout/shell/sidebar.tsx";
import classes from "./shell.module.css";

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

// The phone menu: the full sidebar, sliding in from the right. The title stays hidden
// but still names the dialog for screen readers; the sidebar has its own close button.
export function MenuDrawer({ isOpen, onClose }: Props) {
	return (
		<Drawer
			opened={isOpen}
			onClose={onClose}
			position="right"
			size={SIDEBAR_WIDTH}
			title="Menu"
			withCloseButton={false}
			{...SHELL_CHROME}
			classNames={{
				header: classes.menuDrawerHeader,
				body: classes.menuDrawerBody,
				content: classes.menuDrawer,
			}}
		>
			<Sidebar onNavigate={onClose} />
		</Drawer>
	);
}
