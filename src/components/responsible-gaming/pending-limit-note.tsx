import { IconClock } from "@tabler/icons-react";
import classes from "./rg-limits.module.css";

const ICON_SIZE = 18;

// One Pending Limit under an RG Limit card, such as "your weekly limit rises to …".
export function PendingLimitNote({ note }: { note: string }) {
	return (
		<p className={classes.pending}>
			<IconClock size={ICON_SIZE} aria-hidden />
			<span>
				<strong>Pending Limit:</strong> {note}
			</span>
		</p>
	);
}
