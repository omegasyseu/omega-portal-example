import { rem } from "@mantine/core";
import {
	IconBuildingBank,
	IconPigMoney,
	IconRefresh,
} from "@tabler/icons-react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RegistrationGate } from "@/components/auth/complete-registration/registration-gate.tsx";
import PaymentsTabs from "@/components/payments/components/tabs";
import { useCurrentPathname } from "@/hooks/use-current-pathname.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { requireSignIn } from "@/providers/authentication/require-sign-in.ts";

// What a QUICK_REG player is asked to finish registering for, per payment page.
const ACTION_BY_PAGE: Record<string, string> = {
	"/deposit": "deposit",
	"/withdraw": "withdraw",
	"/purchase": "buy coins",
	"/repurchase": "buy coins",
	"/redeem": "redeem",
};

const PyaymentsDashboard = () => {
	const { session } = useSession();
	const page = useCurrentPathname().split("/").slice(0, 2).join("/");
	const TabLinks = [
		//{
		//	name: "Overview",
		//	value: "overview",
		//	link: "/overview",
		//	icon: <IconInfoCircle style={{ width: rem(16), height: rem(16) }} />,
		// },
		{
			name: session?.user?.loggedInBrand?.isSocialBrand
				? "Purchase"
				: "Deposit",
			value: session?.user?.loggedInBrand?.isSocialBrand
				? "purchase"
				: "deposit",
			link: session?.user?.loggedInBrand?.isSocialBrand
				? "/purchase"
				: "/deposit",
			icon: <IconPigMoney style={{ width: rem(16), height: rem(16) }} />,
		},
		...(session?.user?.loggedInBrand?.socialType === "SOCIAL_AU"
			? [
					{
						name: "Repurchase",
						value: "repurchase",
						link: "/repurchase",
						icon: <IconRefresh style={{ width: rem(16), height: rem(16) }} />,
					},
				]
			: []),
		{
			name: session?.user?.loggedInBrand?.isSocialBrand
				? "Redeem"
				: "Withdrawal",
			value: session?.user?.loggedInBrand?.isSocialBrand
				? "redeem"
				: "withdraw",
			link: session?.user?.loggedInBrand?.isSocialBrand
				? "/redeem"
				: "/withdraw",
			icon: <IconBuildingBank style={{ width: rem(16), height: rem(16) }} />,
		},
		// {
		// 	name: "Transaction History",
		// 	value: "transaction-history",
		// 	link: "/transaction-history",
		// 	icon: <IconHistory style={{ width: rem(16), height: rem(16) }} />,
		// },
	];
	return (
		<PaymentsTabs TabLinks={TabLinks}>
			<RegistrationGate action={ACTION_BY_PAGE[page] ?? "pay"}>
				<Outlet />
			</RegistrationGate>
		</PaymentsTabs>
	);
};

export const Route = createFileRoute("/_payments")({
	component: PyaymentsDashboard,
	beforeLoad: requireSignIn,
});
