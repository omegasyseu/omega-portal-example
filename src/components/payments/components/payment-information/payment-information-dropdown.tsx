import { Select } from "@mantine/core";
import type { PaymentInformation } from "@/schemas-types/payments";
import { useGetPaymentInformation } from "@/server/IPS/payments/get-payment-information";

type Props = {
	type: string;
	paymentMethods: string[];
};

const PaymentInformationDropdown = ({
	type,
	paymentMethods,
	...props
}: Props) => {
	const { data: paymentInformation } = useGetPaymentInformation(
		type,
		paymentMethods,
	);

	const selectPaymentInformationData =
		paymentInformation?.data?.map((info: PaymentInformation) => {
			let label = "";
			switch (info.type) {
				case "CREDIT_CARD":
					label = `Credit Card ending in ${info?.detailsAsMap?.LAST_4_DIGIT}`;
					break;
				case "BANK":
					label = `Bank Account with ID ${info?.detailsAsMap?.PROVIDER_ID}`;
					break;
				default:
					label = info.description;
			}

			return {
				value: info.id.toString(),
				label: label,
			};
		}) || [];

	return (
		<Select
			label="Select Existing Payment Information"
			placeholder="Choose payment information"
			data={selectPaymentInformationData}
			{...props}
		/>
	);
};

export default PaymentInformationDropdown;
