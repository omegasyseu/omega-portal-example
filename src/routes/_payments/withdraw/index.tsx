import { Skeleton, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { PaymentHeader } from "@/components/payments/components/ui/payment-header.tsx";
import { PaymentMethodTiles } from "@/components/payments/components/ui/payment-method-tiles.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import { shownPaymentMethods } from "@/components/payments/shown-payment-methods.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGetWithdrawalOptions } from "@/server/IPS/withdraw/get-withdrawal-methods.ts";

const LOADING_HEIGHT = 120;

// Withdraw: the methods the player can withdraw to that the Brand shows, as tiles.
const WithdrawPage = () => {
	const { data, isLoading } = useGetWithdrawalOptions();
	const { paymentMethods } = useBrandContent();
	const methods = shownPaymentMethods(
		data?.supportedMethods ?? [],
		paymentMethods,
		"withdrawal",
	);

	return (
		<div className={classes.page}>
			<PaymentHeader title="Withdraw">
				Choose where you'd like to withdraw to.
			</PaymentHeader>
			{isLoading ? <Skeleton height={LOADING_HEIGHT} radius="lg" /> : null}
			{methods.length > 0 ? (
				<div className={classes.panel}>
					<PaymentMethodTiles
						title="Payment method"
						methods={methods}
						to="/withdraw/$code"
					/>
				</div>
			) : null}
			{!isLoading && methods.length === 0 ? (
				<Text className={classes.lead}>
					There's no way to withdraw right now. Contact Customer Support for
					help.
				</Text>
			) : null}
		</div>
	);
};

export const Route = createFileRoute("/_payments/withdraw/")({
	component: WithdrawPage,
});
