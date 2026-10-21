import { Title } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";
import classes from "./general-info.module.css";

const ICON_SIZE = 18;

type Props = {
	// Names the card: the heading's id, which the section is labelled by.
	id: string;
	icon: Icon;
	title: string;
	// Extra layout class, such as the card's place in the phone order.
	className?: string;
	// Shown at the right of the heading, such as a status badge. A card that passes it keeps
	// the heading row even while it is empty, so the heading does not move when it fills.
	aside?: ReactNode;
	children: ReactNode;
};

// A General info card: a section headed by an icon tile and the card's name.
export function ProfileCard({
	id,
	icon: CardIcon,
	title,
	className,
	aside,
	children,
}: Props) {
	const heading = (
		<Title order={2} id={id} className={classes.cardTitle}>
			<span className={classes.icon}>
				<CardIcon size={ICON_SIZE} aria-hidden />
			</span>
			{title}
		</Title>
	);

	return (
		<section
			className={className ? `${classes.card} ${className}` : classes.card}
			aria-labelledby={id}
		>
			{aside !== undefined ? (
				<div className={classes.cardHead}>
					{heading}
					{aside}
				</div>
			) : (
				heading
			)}
			{children}
		</section>
	);
}
