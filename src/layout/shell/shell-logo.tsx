import { Image, Text } from "@mantine/core";
import { useBrandName } from "@/components/brand/use-brand-name.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./shell.module.css";

// Brand logos are wide, so each placement caps the height and the width. A Brand without
// a logo shows its name in the type size that fills the same height, or nothing until its
// name is known.
const LOGO_SIZES = {
	sidebar: { height: 34, maxWidth: 220, nameSize: "xl" },
	header: { height: 28, maxWidth: 160, nameSize: "lg" },
	footer: { height: 24, maxWidth: 160, nameSize: "md" },
} as const;

type Props = {
	placement: keyof typeof LOGO_SIZES;
	// Leave the logo unnamed when a surrounding link already names the destination.
	isNamed?: boolean;
};

// The Brand's own logo from Strapi, the same in both Brand Themes, or its name when it
// has none: Strapi's name, else IPS's for a Brand with no content in Strapi, else nothing.
export const ShellLogo = ({ placement, isNamed = false }: Props) => {
	const { height, maxWidth, nameSize } = LOGO_SIZES[placement];
	const { logoUrl } = useBrandContent();
	const brandName = useBrandName();

	if (!logoUrl) {
		if (!brandName) return null;
		return (
			<Text
				component="span"
				fz={nameSize}
				maw={maxWidth}
				truncate="end"
				className={classes.logoName}
			>
				{brandName}
			</Text>
		);
	}

	return (
		<Image
			src={logoUrl}
			alt={isNamed ? (brandName ?? "") : ""}
			h={height}
			w="100%"
			maw={maxWidth}
			fit="contain"
			className={classes.logo}
		/>
	);
};
