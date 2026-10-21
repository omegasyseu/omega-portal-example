import {
	Box,
	Button,
	Flex,
	Loader,
	Paper,
	SimpleGrid,
	Text,
	Title,
} from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
	LEADERBOARD_PERIODS,
	LEADERBOARD_STATUSES,
} from "@/components/leaderboards/constants";
import { useMantineForm } from "@/hooks/use-form";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import { LeaderBoardForm } from "@/schemas-types";
import { leaderboardSearchSchema } from "@/schemas-types/leaderboard";
import { useGetIpsBrands } from "@/server/IPS/general/get-ips-brands.ts";
import { getAllLeaderboardsOptions } from "@/server/IPS/leadeboards";
import { getRankingByLeaderBoardsOptions } from "@/server/IPS/leadeboards/get-specific-leaderboard.ts";
import { PortalDateInput, PortalSelect } from "@/ui/form-inputs";
import { PortalComboboxWithLimit } from "@/ui/form-inputs/portal-combobox";

const LeaderboardForm = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { data: brandsOptions } = useGetIpsBrands();
	const { session } = useSession();
	const isLoggedIn = !!session?.user?.sessionKey;
	const selectedBrandId = useShownBrandId();

	const form = useMantineForm({
		validate: LeaderBoardForm,
		initialValues: {
			status: ["RUNNING"],
			period: ["DAILY", "WEEKLY", "MONTHLY", "RANGE"],
			startDate: dayjs().startOf("day").toDate(),
			endDate: dayjs().endOf("week").toDate(),
			// Empty follows the Selected Brand; a visitor can pick another below.
			brandId: "",
		},
	});

	const brandId = form.getValues().brandId || selectedBrandId;
	const { data, isLoading, refetch, isRefetching } = useQuery({
		...getAllLeaderboardsOptions({
			brandId,
			period: form.values.period?.join(","),
			status: form.values.status?.join(","),
			...(form.values.startDate && {
				startDate: dayjs(form.values.startDate).format("YYYY-MM-DDTHH:mm:ss"),
			}),
			...(form.values.endDate && {
				endDate: dayjs(form.values.endDate).format("YYYY-MM-DDTHH:mm:ss"),
			}),
		}),
	});
	return (
		<>
			<Flex
				direction={"column"}
				maw={1440}
				w={"100%"}
				align={"center"}
				justify={"center"}
				mx={"auto"}
				gap={10}
			>
				<SimpleGrid cols={{ lg: isLoggedIn ? 4 : 5 }}>
					<PortalComboboxWithLimit
						data={LEADERBOARD_STATUSES}
						pillsInputProps={{
							w: "100%",
							label: "Status",
						}}
						{...form.getInputProps("status")}
					/>
					<PortalComboboxWithLimit
						data={LEADERBOARD_PERIODS}
						pillsInputProps={{
							w: "100%",
							label: "Period",
						}}
						{...form.getInputProps("period")}
					/>

					<PortalDateInput
						name={"startDate"}
						w={"100%"}
						label={"Start Date"}
						placeholder={"Select Start Date"}
						maxDate={new Date()}
						{...form.getInputProps("startDate")}
					/>
					<PortalDateInput
						name={"endDate"}
						w={"100%"}
						label={"End Date"}
						placeholder={"Select End Date"}
						minDate={
							form.values.startDate
								? new Date(form.values.startDate)
								: new Date()
						}
						{...form.getInputProps("endDate")}
					/>
					{!isLoggedIn && (
						<PortalSelect
							label={"Brand"}
							searchable
							allowDeselect={false}
							data={brandsOptions?.brandLabelAndValueSorted ?? []}
							{...form.getInputProps("brandId")}
						/>
					)}
				</SimpleGrid>

				<Button
					my={"md"}
					maw={200}
					w={"100%"}
					mx={"auto"}
					onClick={async () => await refetch()}
					loading={isLoading}
				>
					Submit
				</Button>
			</Flex>
			<Box maw={1440} w={"100%"} mx={"auto"} mt={30}>
				<Title order={5} c={"dark.0"} fz={50} ta={"center"}>
					Available Leaderboards
				</Title>
				<SimpleGrid pos={"relative"} cols={4} mt={"sm"}>
					{isRefetching && <Loader pos={"absolute"} top={"-50px"} />}

					{data?.data ? (
						data?.data?.map((board) => {
							return (
								<Paper
									style={{
										cursor: "pointer",
									}}
									onClick={async () => {
										await navigate({
											to: "/leaderboard",
											// The API types period as any string; read it the way the URL is read.
											search: leaderboardSearchSchema.parse({
												period: board?.period,
											}),
										});
									}}
									onMouseEnter={async () => {
										await queryClient.prefetchQuery(
											getRankingByLeaderBoardsOptions({
												period: `${board?.period}`,
												date: dayjs(new Date()).format("YYYY-MM-DD"),
												size: "10",
											}),
										);
									}}
									key={`${board?.brandId}-${board?.leaderboardName}`}
									bg={"dark.6"}
									shadow="md"
									withBorder
									p="lg"
								>
									<Text c={"dark.0"} fz={"md"}>
										Name: {board?.leaderboardName}
									</Text>
									<Text c={"dark.0"} fz={"md"}>
										Status: {board?.status}
									</Text>
									<Text c={"dark.0"} fz={"md"}>
										Period: {board?.period}
									</Text>
								</Paper>
							);
						})
					) : (
						<Text c={"dark.0"} fz={"md"}>
							No data available
						</Text>
					)}
				</SimpleGrid>
			</Box>
		</>
	);
};

export default LeaderboardForm;
