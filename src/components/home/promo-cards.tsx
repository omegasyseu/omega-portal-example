import { Button, Text, Title } from "@mantine/core";
import { IconCards, IconGift } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import classes from "./home.module.css";

const PROMO_ICON_SIZE = 24;

const PROMOS = [
	{
		key: "casino",
		title: "Casino",
		lead: "Dive into our games",
		action: "View Games",
		to: "/games",
		Icon: IconCards,
		art: classes.promoCasino,
	},
	{
		key: "promotions",
		title: "Promotions",
		lead: "See the rewards waiting for you",
		action: "To Promotions",
		to: "/bonus",
		Icon: IconGift,
		art: classes.promoPromotions,
	},
] as const;

// Cards that lead to the lobby and to Promotions, as on the reference home.
export function PromoCards() {
	return PROMOS.map(({ key, title, lead, action, to, Icon, art }) => (
		<section
			key={key}
			className={`${classes.promo} ${art}`}
			aria-labelledby={`promo-${key}`}
		>
			<div>
				<Title order={2} id={`promo-${key}`} className={classes.promoTitle}>
					<Icon
						size={PROMO_ICON_SIZE}
						className={classes.promoIcon}
						aria-hidden
					/>
					{title}
				</Title>
				<Text className={classes.promoLead}>{lead}</Text>
			</div>
			<Button component={Link} to={to}>
				{action}
			</Button>
		</section>
	));
}
