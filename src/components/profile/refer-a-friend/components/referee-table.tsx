import { refereesColumn } from "@/components/profile/refer-a-friend/components/columns/referees-column.tsx";
import classes from "@/components/profile/refer-a-friend/refer-a-friend.module.css";
import { ReusableTransactionTable } from "@/components/table/basic";
import { useGetReferee } from "@/server/IPS/profile-info/get-referees.ts";

const RefereeTable = () => {
	const { isLoading, data: referees } = useGetReferee();
	return (
		// Eight columns don't fit a phone, so the table scrolls inside its own box.
		<div className={classes.tableScroller}>
			<div className={classes.table}>
				<ReusableTransactionTable
					tableGridWrapper={{
						cols: 8,
					}}
					data={referees?.referees ?? []}
					columns={refereesColumn}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
};

export default RefereeTable;
