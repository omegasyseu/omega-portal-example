import { createFileRoute } from "@tanstack/react-router";
import { HubSection } from "@/components/profile/hub/hub-section.tsx";
import TransactionsFormAndTable from "@/components/profile/transaction-history/transaction-form-and-table.tsx";

const TransactionHistory = () => (
	<HubSection title="Transaction history">
		<TransactionsFormAndTable />
	</HubSection>
);

export const Route = createFileRoute(
	"/_authenticated/_hub/transaction-history/",
)({
	component: TransactionHistory,
});
