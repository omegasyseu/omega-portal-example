import {
	type Icon,
	IconBallFootball,
	IconBroadcast,
	IconCrown,
	IconDice5,
	IconFlame,
	IconLayoutGrid,
	IconPlayCard,
	IconSparkles,
	IconStar,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef } from "react";
import type { CollectionIcon } from "@/components/games/lobby-model.ts";
import type { GameNavLink } from "@/layout/shell/navigation-model.ts";

// How each Collection icon an admin can choose in Strapi is drawn.
export const COLLECTION_ICON_COMPONENTS: Record<CollectionIcon, Icon> = {
	dice: IconDice5,
	star: IconStar,
	sparkles: IconSparkles,
	flame: IconFlame,
	crown: IconCrown,
	cards: IconPlayCard,
	live: IconBroadcast,
	ball: IconBallFootball,
};

// A Collection's link shows its own icon; All Games shows a grid.
export const gamesLinkIcon = (link: GameNavLink): Icon =>
	link.icon ? COLLECTION_ICON_COMPONENTS[link.icon] : IconLayoutGrid;

// Renders a Mantine control as a router link into the games lobby, on the link's
// Collection's tab when it has one.
export const gamesLinkRoot =
	(link: GameNavLink) => (props: ComponentPropsWithoutRef<"a">) => (
		<Link
			{...props}
			to="/games"
			search={link.collection ? { collection: link.collection } : {}}
		/>
	);
