import { Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	DepositAmountStep,
	type DepositAmountValues,
	type DepositSubmission,
} from "@/components/payments/components/ui/deposit-amount-step.tsx";
import type { DepositReceipt } from "@/components/payments/components/ui/deposit-confirmation.tsx";
import { usePaymentIQForm } from "@/components/payments/hooks/use-payment-iq.tsx";
import { PortalModal } from "@/components/route-modal";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGetDepositLimitsByCurrency } from "@/server/IPS/deposits/get-deposit-limits.ts";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";

type Props = {
	code: string;
};

const CASHIER_MIN_HEIGHT = 500;

const PaymentIQ = ({ code }: Props) => {
	const { session } = useSession();
	const { data: playerInfo } = useGetPlayerInfo();
	const [opened, { open, close }] = useDisclosure(false);
	const { initializePaymentIQForm } = usePaymentIQForm();
	const queryClient = useQueryClient();
	const [receipt, setReceipt] = useState<DepositReceipt>();

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

	const handleOpenModal = ({
		amount,
		selectedBonus,
		bonusName,
	}: DepositSubmission) => {
		open();
		// Delay the initialization to ensure the modal and its contents are fully rendered
		setTimeout(() => {
			initializePaymentIQForm({
				playerInfo,
				session,
				// Left out when empty: no bonus.
				bonusCode: selectedBonus,
				amount,
				onSuccess: async () => {
					await queryClient.invalidateQueries({
						queryKey: ["IPS_USER_BALANCES"],
					});
					close();
					setReceipt({ amount, bonusName });
				},
			});
		}, 100); // Small delay to ensure DOM is updated
	};

	return (
		<>
			<DepositAmountStep
				code={code}
				form={form}
				dailyLimit={data?.dailyLimit}
				submitLabel="Deposit"
				onSubmit={handleOpenModal}
				receipt={receipt}
				onAnotherDeposit={() => setReceipt(undefined)}
			/>
			<PortalModal size="xl" opened={opened} onClose={close} title="Payment-IQ">
				<Box mih={CASHIER_MIN_HEIGHT} id="cashier" />
			</PortalModal>
		</>
	);
};

export default PaymentIQ;
