import {
	ActionIcon,
	Button,
	SegmentedControl,
	Skeleton,
	Text,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { LeaderboardStandings } from "@/components/leaderboards/leaderboard/leaderboard-standings.tsx";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import type { LeaderboardPeriod } from "@/schemas-types/leaderboard";
import { getRankingByLeaderBoardsOptions } from "@/server/IPS/leadeboards/get-specific-leaderboard.ts";
import classes from "./leaderboard-table.module.css";

const LOADING_HEIGHT = 320;

type Direction = "BACK" | "FORWARD";
const isNextDateInFuture = (
	current: string,
	segment: LeaderboardPeriod,
): boolean => {
	const currentDayJs = dayjs(current);
	const today = dayjs();
	const dateCheckers = {
		DAILY: () => currentDayJs.add(1, "day").isAfter(today),
		WEEKLY: () =>
			currentDayJs.day() === 0
				? currentDayJs.subtract(1, "week").isAfter(today)
				: currentDayJs.add(1, "week").isAfter(today),
		MONTHLY: () =>
			currentDayJs.date() === 1
				? currentDayJs.subtract(1, "month").isAfter(today)
				: currentDayJs.endOf("month").isAfter(today),
	};
	const checkDate = dateCheckers[segment] || (() => false);
	return checkDate();
};
const currentDateToday = dayjs(new Date()).format("YYYY-MM-DD");

const LeaderboardTable = () => {
	const navigate = useNavigate({ from: "/leaderboard/" });
	const { period } = useSearch({ from: "/leaderboard/" });

	const [currentDate, setCurrentDate] = useState(currentDateToday);

	const brandId = useShownBrandId();

	const handleDateChange = (value: LeaderboardPeriod, direction: Direction) => {
		const dateChangers = {
			"DAILY-BACK": () =>
				dayjs(currentDate).subtract(1, "day").format("YYYY-MM-DD"),
			"DAILY-FORWARD": () =>
				dayjs(currentDate).add(1, "day").format("YYYY-MM-DD"),
			"WEEKLY-BACK": () =>
				dayjs(currentDate)
					.day(dayjs(currentDate).day() === 0 ? -7 : 0)
					.format("YYYY-MM-DD"),
			"WEEKLY-FORWARD": () => dayjs(currentDate).day(7).format("YYYY-MM-DD"),
			"MONTHLY-BACK": () =>
				dayjs(currentDate)
					.subtract(1, "month")
					.endOf("month")
					.format("YYYY-MM-DD"),
			"MONTHLY-FORWARD": () =>
				dayjs(currentDate).add(1, "month").format("YYYY-MM-DD"),
		};

		const changeDate = dateChangers[`${value}-${direction}`];
		setCurrentDate(changeDate());
	};

	const { data, isLoading } = useQuery({
		...getRankingByLeaderBoardsOptions({
			period: period,
			date: currentDate,
			size: "10",
			brandId,
		}),
	});

	const currency = data?.currentLeaderboard?.currency ?? {};
	const canGoForward = !isNextDateInFuture(currentDate, period);

	return (
		<section className={classes.board} aria-label="Standings">
			<div className={classes.controls}>
				<SegmentedControl
					aria-label="Leaderboard period"
					radius="xl"
					value={period}
					onChange={async (e) => {
						setCurrentDate(currentDateToday);
						await navigate({
							search: { period: e },
							// Only the period changes, so the page stays scrolled where it was
							// (the router would otherwise jump to the top).
							resetScroll: false,
						});
					}}
					data={[
						{ label: "Daily", value: "DAILY" },
						{ label: "Weekly", value: "WEEKLY" },
						{ label: "Monthly", value: "MONTHLY" },
					]}
				/>
				<div className={classes.dateNav}>
					<ActionIcon
						onClick={() => {
							handleDateChange(period, "BACK");
						}}
						variant="default"
						size="lg"
						radius="xl"
						aria-label="Previous period"
					>
						<IconChevronLeft size={18} aria-hidden />
					</ActionIcon>
					<Text className={classes.date} aria-live="polite">
						{dayjs(currentDate).format("D MMM YYYY")}
					</Text>
					<ActionIcon
						onClick={() => {
							handleDateChange(period, "FORWARD");
						}}
						disabled={!canGoForward}
						variant="default"
						size="lg"
						radius="xl"
						aria-label="Next period"
					>
						<IconChevronRight size={18} aria-hidden />
					</ActionIcon>
				</div>
			</div>
			{isLoading ? (
				<Skeleton height={LOADING_HEIGHT} radius="lg" />
			) : (
				<LeaderboardStandings
					rankings={data?.rankings.data?.rankings ?? []}
					currency={currency}
				/>
			)}
			<Button
				component={Link}
				to="/leaderboard/leaderboards-debug"
				variant="default"
				className={classes.moreFilters}
			>
				More filters
			</Button>
		</section>
	);
};

export default LeaderboardTable;
