import { createFileRoute, redirect } from "@tanstack/react-router";
import RedeemView from "@/components/social-payments/redeem-view.tsx";

const RedeemPage = () => {
	return <RedeemView />;
};

export const Route = createFileRoute("/_payments/redeem/")({
	component: RedeemPage,
	beforeLoad: ({ context: { authentication } }) => {
		if (!authentication?.session?.user?.loggedInBrand?.isSocialBrand) {
			throw redirect({
				to: "/",
			});
		}
	},
});
