import { Carousel } from "@mantine/carousel";
import { Button, Text } from "@mantine/core";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEngageDialogLink } from "@/components/engage-dialog/use-engage-dialog.ts";
import type {
	BannerDialog,
	BannerLink,
	BrandBanner,
} from "@/providers/brand-content/brand-content.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./games-lobby.module.css";

// Three slides on desktop, one and a bit on phones so the next banner peeks in.
const SLIDE_SIZE = { base: "85%", sm: "50%", md: "33.333333%" };

const BannerButton = ({
	linkProps,
	children,
}: {
	linkProps: LinkProps;
	children: ReactNode;
}) => (
	<Button
		renderRoot={(props) => <Link {...props} {...linkProps} />}
		size="compact-md"
	>
		{children}
	</Button>
);

// Opens the dialog over the lobby (after sign-in for a visitor).
const DialogBannerButton = ({
	dialog,
	children,
}: {
	dialog: BannerDialog;
	children: ReactNode;
}) => (
	<BannerButton linkProps={useEngageDialogLink(dialog)}>
		{children}
	</BannerButton>
);

const BannerAction = ({
	link,
	children,
}: {
	link: BannerLink;
	children: ReactNode;
}) =>
	link.kind === "dialog" ? (
		<DialogBannerButton dialog={link.dialog}>{children}</DialogBannerButton>
	) : (
		// A path from Strapi, so it isn't one of the router's typed routes. The router's
		// Link doesn't follow a changed href, so a new path (another Brand) remounts it.
		<BannerButton key={link.to} linkProps={{ href: link.to }}>
			{children}
		</BannerButton>
	);

const Banner = ({ title, buttonText, link, imageUrl }: BrandBanner) => (
	<div className={classes.banner}>
		{imageUrl ? (
			// The title says what the banner is about, so the art is decorative.
			<img className={classes.bannerArt} src={imageUrl} alt="" loading="lazy" />
		) : null}
		<Text className={classes.bannerTitle}>{title}</Text>
		<BannerAction link={link}>{buttonText}</BannerAction>
	</div>
);

// The Brand's banners from its content, in a Mantine carousel like the reference's
// slider. A Brand without banners gets no carousel at all.
export function LobbyBanners() {
	const { banners } = useBrandContent();
	if (banners.length === 0) return null;

	return (
		<Carousel
			aria-label="Featured"
			slideSize={SLIDE_SIZE}
			slideGap="md"
			emblaOptions={{ align: "start" }}
			previousControlProps={{ "aria-label": "Previous banner" }}
			nextControlProps={{ "aria-label": "Next banner" }}
			classNames={{ control: classes.bannerControl }}
		>
			{banners.map((banner, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: banners have no id; list order is their identity
				<Carousel.Slide key={index}>
					<Banner {...banner} />
				</Carousel.Slide>
			))}
		</Carousel>
	);
}
