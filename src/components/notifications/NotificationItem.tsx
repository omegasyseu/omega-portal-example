import { ActionIcon, Box, Group, Paper, Stack, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { NotificationType } from "@/server/notifications/notifications-websocket";
import { formatRelativeDate } from "@/utils/date";
import { createNotificationIcon } from "./utils/notificationHelpers";

interface NotificationItemProps {
	notification: NotificationType;
	onMarkAsRead: () => void;
}

export const NotificationItem = ({
	notification,
	onMarkAsRead,
}: NotificationItemProps) => {
	const isRead = notification.data?.read;
	// Unread items sit on the tile colour so they stand out from read ones.
	const restingBackground = isRead
		? "transparent"
		: "var(--mantine-color-dark-6)";
	// WebSocket timestamps are in ISO format from server (America/Vancouver timezone)
	// Convert server time to client's local timezone for display
	const {
		date: timeAgo,
		time,
		showTime,
	} = formatRelativeDate(notification.timestamp);

	return (
		<Paper
			p="sm"
			withBorder={false}
			bg={restingBackground}
			radius={8}
			style={{
				cursor: "pointer",
				transition: "background-color 0.2s",
				border: "1px solid var(--mantine-color-dark-4)",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = "var(--mantine-color-dark-5)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = restingBackground;
			}}
		>
			<Group gap="sm" align="flex-start">
				<Box mt={2}>{createNotificationIcon(notification.type)}</Box>

				<Stack gap={4} style={{ flex: 1 }}>
					<Group justify="space-between" align="flex-start">
						<Text size="sm" fw={isRead ? 400 : 600} c="dark.0">
							{notification.title}
						</Text>
						{!isRead && (
							<ActionIcon
								size="xs"
								variant="subtle"
								aria-label="Mark as read"
								onClick={(e) => {
									e.stopPropagation();
									onMarkAsRead();
								}}
							>
								<IconCheck size={12} aria-hidden />
							</ActionIcon>
						)}
					</Group>

					<Text size="xs" c="dark.1">
						{notification.message}
					</Text>

					<Text size="xs" c="dark.2">
						{timeAgo}
						{showTime && time ? ` at ${time}` : ""}
					</Text>
				</Stack>
			</Group>
		</Paper>
	);
};
