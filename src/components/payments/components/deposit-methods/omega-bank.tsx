import { useForm } from "@mantine/form";
import { useState } from "react";
import {
	DepositAmountStep,
	type DepositAmountValues,
} from "@/components/payments/components/ui/deposit-amount-step.tsx";
import type { DepositReceipt } from "@/components/payments/components/ui/deposit-confirmation.tsx";
import { CONTINUE_TO_PAYMENT_SITE, useDeposit } from "@/server/IPS/deposits";
import { useGetDepositLimitsByCurrency } from "@/server/IPS/deposits/get-deposit-limits.ts";

type Props = {
	code: string;
};

// OMEGA Bank: an amount and a bonus (or none), then Deposit, then its confirmation.
const OmegaBank = ({ code }: Props) => {
	const { data } = useGetDepositLimitsByCurrency({
		paymentMethodCode: code,
	});

	const form = useForm<DepositAmountValues>({
		initialValues: {
			amount: "",
			selectedBonus: "",
		},

		validate: {
			amount: (value) =>
				Number(value) > Number(data?.dailyLimit)
					? `Amount cannot exceed ${data?.dailyLimit}`
					: null,
		},
	});

	const { mutate, isPending } = useDeposit();
	const [receipt, setReceipt] = useState<DepositReceipt>();

	return (
		<DepositAmountStep
			code={code}
			form={form}
			dailyLimit={data?.dailyLimit}
			submitLabel="Deposit"
			isSubmitting={isPending}
			onSubmit={({ amount, selectedBonus, bonusName }) =>
				mutate(
					{
						amount,
						paymentMethod: code,
						// Left out when empty: no bonus.
						requestedBonusPlanId: selectedBonus,
						// The confirmation says so instead.
						noSuccessNotification: true,
					},
					{
						onSuccess: ({ status }) => {
							// A deposit that continues on the provider's site isn't done yet.
							if (status !== CONTINUE_TO_PAYMENT_SITE) {
								setReceipt({ amount, bonusName });
							}
						},
					},
				)
			}
			receipt={receipt}
			onAnotherDeposit={() => setReceipt(undefined)}
		/>
	);
};

export default OmegaBank;
