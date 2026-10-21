import { Anchor, Skeleton, Text } from "@mantine/core";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import Coinspaid from "@/components/payments/components/deposit-methods/coinspaid.tsx";
import EVoucher from "@/components/payments/components/deposit-methods/e-voucher.tsx";
import OmegaBank from "@/components/payments/components/deposit-methods/omega-bank.tsx";
import PayCom from "@/components/payments/components/deposit-methods/pay-com.tsx";
import PaymentIQ from "@/components/payments/components/deposit-methods/payment-iq.tsx";
import { PaymentHeader } from "@/components/payments/components/ui/payment-header.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import { shownPaymentMethod } from "@/components/payments/shown-payment-methods.ts";
import { PAYMENT_METHOD_CODE } from "@/constants/payments";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGetDepositMethods } from "@/server/IPS/deposits/get-deposit-methods.ts";

const LOADING_HEIGHT = 160;

// Deposit with one method; each method keeps its own steps. Once IPS's methods have
// loaded, a method IPS doesn't offer the player, or the Brand doesn't show for deposits,
// leads back to the list.
const PaymentMethod = () => {
	const { code } = Route.useParams();
	const { data, isPending } = useGetDepositMethods();
	const { paymentMethods } = useBrandContent();
	const shown = shownPaymentMethod(
		code,
		data?.offeredCodes ?? [],
		paymentMethods,
		"deposit",
	);
	const renderComponent = () => {
		switch (code) {
			case PAYMENT_METHOD_CODE.OMEGA_BANK:
				return <OmegaBank code={code} />;
			case PAYMENT_METHOD_CODE.COINSPAID_V2:
				return <Coinspaid code={code} />;
			case PAYMENT_METHOD_CODE.EVOUCHER:
				return <EVoucher code={code} />;
			case PAYMENT_METHOD_CODE.PAYMENTIQ_ALL:
				return <PaymentIQ code={code} />;
			case PAYMENT_METHOD_CODE.PAYCOM:
				return <PayCom code={code} />;
			default:
				return (
					<Text className={classes.lead}>
						This payment method isn't available. Choose another one.
					</Text>
				);
		}
	};

	if (isPending) {
		return (
			<div className={classes.page}>
				<Skeleton height={LOADING_HEIGHT} radius="lg" />
			</div>
		);
	}
	if (!shown) {
		return <Navigate to="/deposit" replace />;
	}

	return (
		<div className={classes.page}>
			<PaymentHeader title={`Deposit with ${shown.name}`}>
				<Anchor component={Link} to="/deposit">
					Choose another method
				</Anchor>
			</PaymentHeader>
			{renderComponent()}
		</div>
	);
};

export const Route = createFileRoute("/_payments/deposit/$code/")({
	component: PaymentMethod,
});
