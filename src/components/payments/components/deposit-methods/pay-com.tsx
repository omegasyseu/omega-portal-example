import { Box, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Pay from "@pay-com/js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
	DepositAmountStep,
	type DepositAmountValues,
	type DepositSubmission,
} from "@/components/payments/components/ui/deposit-amount-step.tsx";
import type { DepositReceipt } from "@/components/payments/components/ui/deposit-confirmation.tsx";
import { PortalModal } from "@/components/route-modal";
import { useDeposit } from "@/server/IPS/deposits";
import { useGetDepositLimitsByCurrency } from "@/server/IPS/deposits/get-deposit-limits.ts";

type Props = {
	code: string;
};

const CHECKOUT_MIN_HEIGHT = 500;

const PayCom = ({ code }: Props) => {
	const queryClient = useQueryClient();
	const paycomCheckoutRef = useRef(null);
	const payInstance = useRef(null);
	const { mutate, isPending } = useDeposit();
	const { data } = useGetDepositLimitsByCurrency({
		paymentMethodCode: code,
	});
	const [opened, { open, close }] = useDisclosure(false);
	const [checkoutInitialized, setCheckoutInitialized] = useState(false);
	const [receipt, setReceipt] = useState<DepositReceipt>();

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

	useEffect(() => {
		const initializePay = async () => {
			if (!payInstance.current) {
				// @ts-expect-error
				payInstance.current = await Pay.com({
					identifier: "469149248370245632",
				});
			}
		};

		initializePay();
	}, []);

	const handleDeposit = ({
		amount,
		selectedBonus,
		bonusName,
	}: DepositSubmission) => {
		mutate(
			{
				amount,
				paymentMethod: code,
				// Left out when empty: no bonus.
				requestedBonusPlanId: selectedBonus,
				noSuccessNotification: true,
			},
			{
				onSuccess: (re) => {
					open();
					setTimeout(() => {
						// @ts-expect-error
						const checkout = payInstance?.current.checkout({
							clientSecret: re.clientKey,

							onSuccess: async () => {
								await queryClient.invalidateQueries({
									queryKey: ["IPS_USER_BALANCES"],
								});
								close();
								setCheckoutInitialized(false);
								setReceipt({ amount, bonusName });
							},
							// biome-ignore lint/suspicious/noExplicitAny: Pay.com SDK does not type its errors
							onFailure: (error: any) => {
								console.log({ error });
								notifications.show({
									color: "danger",

									message: error.message,
									title: error?.data?.declineCode,
								});
								close();
								form.setValues({
									amount: "",
									selectedBonus: "",
								});
							},
						});

						checkout.universal({
							container: "#paycom_checkout",
						});
						setCheckoutInitialized(true);
					}, 100);
				},
			},
		);
	};

	return (
		<>
			<DepositAmountStep
				code={code}
				form={form}
				dailyLimit={data?.dailyLimit}
				submitLabel="Open Payment"
				isSubmitting={isPending}
				onSubmit={handleDeposit}
				receipt={receipt}
				onAnotherDeposit={() => setReceipt(undefined)}
			/>
			<PortalModal
				size="xl"
				opened={opened}
				onClose={() => {
					close();
					setCheckoutInitialized(false);
				}}
				title="Pay.com Checkout"
			>
				<Box
					mih={CHECKOUT_MIN_HEIGHT}
					id="paycom_checkout"
					ref={paycomCheckoutRef}
				/>
				{!checkoutInitialized && <Loader size="xl" />}
			</PortalModal>
		</>
	);
};

export default PayCom;
