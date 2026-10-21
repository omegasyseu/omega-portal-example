import { useCallback, useState } from "react";
import type { Session } from "@/providers/authentication/authentication.tsx";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import type { PlayerInformation } from "@/schemas-types";
import type { PackageType } from "@/schemas-types/packages";
import { PaymentIQCashier } from "./payment-iq-cashier";

// Shades of the Brand Theme's palette (see brand-palette.ts): text, dimmed text, inputs and
// the primary blue.
const DARK_TEXT = 0;
const DARK_TEXT_DIMMED = 1;
const DARK_INPUT = 6;
const BRAND_PRIMARY = 6;
const SURFACE = 0;

interface InitializePaymentIQFormParams {
	playerInfo: PlayerInformation | undefined;
	session: Session | null;
	currentPackage?: PackageType | null;
	bonusCode?: string;
	amount?: string;
	// Called when the cashier reports the payment went through.
	onSuccess?: () => void;
}

export const usePaymentIQForm = () => {
	const [loading, setLoading] = useState(false);
	const { palette } = useBrandContent().theme;
	const initializePaymentIQForm = useCallback(
		({
			playerInfo,
			session,
			currentPackage,
			bonusCode,
			amount,
			onSuccess,
		}: InitializePaymentIQFormParams) => {
			const { brand, dark, surface } = palette;
			const merchantId = "100756998";
			return new PaymentIQCashier(
				"#cashier",
				{
					merchantId,
					// merchantId: '1',
					...(amount && { amount }),
					...(amount && {
						showAmount: false,
					}),

					locale: "pt-PT",
					userId: `${playerInfo?.partyId}`,
					// userId: '1',
					// sessionId: '123',
					sessionId: `${session?.user?.sessionKey}`,

					environment: "test",
					method: "deposit",
					attributes: {
						...(currentPackage?.packageId && {
							packageId: `${currentPackage?.packageId}`,
						}),
						...(bonusCode && { bonusCode }),
						// bonusCode: values.selectedBonus
						// packageId: `${currentPackage?.packageId}`,
						...(currentPackage?.packageId && {
							packageId: `${currentPackage?.packageId}`,
						}),
						// packageId: 1,
					},
					defaultLoader: false,
					containerWidth: "100%",
					// The cashier is a third-party widget that takes colour values, so it gets the
					// Brand Theme's own palette rather than CSS variables.
					theme: {
						labels: {
							color: dark[DARK_TEXT_DIMMED],
						},
						headings: {
							color: dark[DARK_TEXT],
						},
						buttons: {
							color: brand[BRAND_PRIMARY],
						},
						background: {
							color: surface[SURFACE],
						},
						cashierbackground: {
							color: dark[DARK_INPUT],
						},
						loader: {
							color: brand[BRAND_PRIMARY],
						},
					},
				},
				(api) => {
					api.on({
						cashierInitLoad: () => {
							setLoading(true);
							console.log("Cashier init load");
						},
						update: (data) => console.log("The passed in data was set", data),
						success: () => onSuccess?.(),
						failure: (data) => console.log("Transaction failed", data),
						isLoading: (data) => {
							setLoading(true);
							console.log("Data is loading", data);
						},
						doneLoading: (data) => {
							setLoading(false);
							console.log("Data has been successfully downloaded", data);
						},
						newProviderWindow: (data) =>
							console.log("A new window / iframe has opened", data),
						paymentMethodSelect: (data) =>
							console.log("Payment method was selected", data),
						paymentMethodPageEntered: (data) =>
							console.log("New payment method page was opened", data),
						navigate: (data) => console.log("Path navigation triggered", data),
					});
				},
			);
		},
		[palette],
	);

	return {
		loading,
		initializePaymentIQForm,
	};
};
