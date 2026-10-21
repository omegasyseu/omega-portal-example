import { Badge, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { PaymentMethodLogo } from "@/components/payments/components/ui/payment-method-logo.tsx";
import type { ShownPaymentMethod } from "@/components/payments/shown-payment-methods.ts";
import classes from "./payments.module.css";

export type PaymentMethodTile = {
	code: string;
	paymentMethod: string;
	// The fee as a percentage, as IPS sends it ("0.00"); not every method has one.
	feeRate?: string | null;
	isRecommended?: boolean;
};

const feeLabel = (feeRate?: string | null) =>
	feeRate === undefined || feeRate === null || feeRate === ""
		? undefined
		: `${Number(feeRate)}% fee`;

type Destination = "/deposit/$code" | "/withdraw/$code";

const MethodTile = ({
	shown: { method, name, logoUrl },
	to,
}: {
	shown: ShownPaymentMethod<PaymentMethodTile>;
	to: Destination;
}) => {
	const fee = feeLabel(method.feeRate);
	return (
		<Link
			to={to}
			params={{ code: method.code }}
			className={classes.tile}
			data-recommended={method.isRecommended || undefined}
		>
			{method.isRecommended ? (
				<Badge color="neon" size="xs" className={classes.recommended}>
					Recommended
				</Badge>
			) : null}
			<span className={classes.tileRadio} aria-hidden />
			<span className={classes.tileText}>
				<Text component="span" className={classes.tileName}>
					{name}
				</Text>
				{fee ? (
					<Text component="span" className={classes.note}>
						{fee}
					</Text>
				) : null}
			</span>
			<PaymentMethodLogo
				logoUrl={logoUrl}
				alt=""
				className={classes.tileLogo}
				iconClassName={classes.tileIcon}
			/>
		</Link>
	);
};

type Props = {
	title: string;
	// The methods the Brand shows, in IPS's order.
	methods: readonly ShownPaymentMethod<PaymentMethodTile>[];
	// The page a tile opens, with the method's code as `$code`.
	to: Destination;
};

// Payment methods as selectable tiles, like the Omega Wins Withdraw dialog: a radio dot,
// the method's name, its fee and its logo.
export function PaymentMethodTiles({ title, methods, to }: Props) {
	if (methods.length === 0) {
		return null;
	}
	return (
		<section aria-label={title}>
			<Title order={2} className={classes.panelTitle} mb="sm">
				{title}
			</Title>
			<ul className={classes.tiles}>
				{methods.map((shown) => (
					<li key={shown.method.paymentMethod}>
						<MethodTile shown={shown} to={to} />
					</li>
				))}
			</ul>
		</section>
	);
}
