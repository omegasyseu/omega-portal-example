import { Tabs, TabsList, TabsTab } from "@mantine/core";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import classes from "./payment-tabs.module.css";

type Props = {
	children: ReactNode;
	TabLinks: {
		name: string;
		link: string;
		icon: ReactNode;
		value: string;
	}[];
};
const PaymentsTabs = ({ children, TabLinks }: Props) => {
	const pathname = useLocation();
	const navigate = useNavigate();
	const basePath = pathname.pathname.split("/")[1] || "overview"; // Extracts 'withdraw' from '/withdraw/OMEGA_BANK'

	return (
		<Tabs
			variant={"pills"}
			defaultValue="settings"
			value={basePath}
			onChange={async (value) => {
				const tab = TabLinks.find((tab) => tab.value === value);
				if (tab) {
					await navigate({
						to: tab.link,
					});
				}
			}}
			classNames={classes}
		>
			<TabsList>
				{TabLinks.map((tab) => {
					const { name, icon, value } = tab;

					return (
						<TabsTab key={name} value={value} leftSection={icon}>
							{name}
						</TabsTab>
					);
				})}
			</TabsList>
			{children}
		</Tabs>
	);
};

export default PaymentsTabs;
