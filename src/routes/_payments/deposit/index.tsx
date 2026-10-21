import { Skeleton, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { PaymentHeader } from "@/components/payments/components/ui/payment-header.tsx";
import {
	type PaymentMethodTile,
	PaymentMethodTiles,
} from "@/components/payments/components/ui/payment-method-tiles.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import { shownPaymentMethods } from "@/components/payments/shown-payment-methods.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { useGetDepositMethods } from "@/server/IPS/deposits/get-deposit-methods.ts";
import { useGetRecommendedPaymentMethod } from "@/server/IPS/payments/get-recommended-payment-method";

const LOADING_HEIGHT = 160;

// Deposit: the player's Payment Methods the Brand shows, as tiles, grouped as the API
// groups them. Card methods show once the recommended card method is known, which they
// flag.
const DepositPage = () => {
	const { data, isLoading } = useGetDepositMethods();
	const { selectedAccount } = useGeneralInfo();
	const { paymentMethods } = useBrandContent();
	const shownForDeposit = (methods: readonly PaymentMethodTile[] = []) =>
		shownPaymentMethods(methods, paymentMethods, "deposit");
	const cardMethods = data?.supportedCardMethods ?? [];
	const bankMethods = shownForDeposit(data?.supportedBankMethods);
	const otherMethods = shownForDeposit(data?.supportedOtherMethods);

	const { data: recommendedCardMethod } = useGetRecommendedPaymentMethod(
		"card",
		cardMethods.length > 0,
	);
	const shownCardMethods = shownForDeposit(
		cardMethods.map((method) => ({
			...method,
			isRecommended: recommendedCardMethod?.paymentMethod === method.code,
		})),
	);
	const hasMethods =
		bankMethods.length > 0 ||
		shownCardMethods.length > 0 ||
		otherMethods.length > 0;

	return (
		<div className={classes.page}>
			<PaymentHeader title="Deposit">
				Choose how you'd like to deposit.
			</PaymentHeader>
			{isLoading ? <Skeleton height={LOADING_HEIGHT} radius="lg" /> : null}
			{hasMethods ? (
				<div className={classes.panel}>
					<PaymentMethodTiles
						title="Bank methods"
						methods={bankMethods}
						to="/deposit/$code"
					/>
					{recommendedCardMethod ? (
						<PaymentMethodTiles
							title="Card methods"
							methods={shownCardMethods}
							to="/deposit/$code"
						/>
					) : null}
					<PaymentMethodTiles
						title="Other methods"
						methods={otherMethods}
						to="/deposit/$code"
					/>
				</div>
			) : null}
			{!isLoading && !hasMethods ? (
				<Text className={classes.lead}>
					There's no way to deposit in {selectedAccount?.currency} right now.
					Switch currency from your balance, or contact Customer Support.
				</Text>
			) : null}
		</div>
	);
};

export const Route = createFileRoute("/_payments/deposit/")({
	component: DepositPage,
});
