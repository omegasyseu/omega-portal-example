import { IconCreditCard } from "@tabler/icons-react";

const METHOD_ICON_SIZE = 22;

type Props = {
	logoUrl: string | undefined;
	// The logo's alt text: empty where the method's name is shown beside it.
	alt: string;
	className?: string;
	iconClassName?: string;
};

// A Payment Method's logo, or for a method without one, a neutral icon rather than
// another brand's logo.
export const PaymentMethodLogo = ({
	logoUrl,
	alt,
	className,
	iconClassName,
}: Props) =>
	logoUrl ? (
		<img src={logoUrl} alt={alt} className={className} />
	) : (
		<IconCreditCard
			size={METHOD_ICON_SIZE}
			className={iconClassName}
			aria-hidden
		/>
	);
