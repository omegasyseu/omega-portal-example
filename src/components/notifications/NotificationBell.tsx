import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Group,
	Indicator,
	Popover,
	ScrollArea,
	Stack,
	Text,
} from "@mantine/core";
import { IconBell, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import {
	HEADER_CONTROL_SIZE,
	NAV_ICON_SIZE,
	NAV_ICON_STROKE,
} from "@/constants/ui-sizes.ts";
import type { NotificationType } from "@/server/notifications/notifications-websocket";
import { NotificationItem } from "./NotificationItem";

interface NotificationBellProps {
	notifications: NotificationType[];
	onMarkAsRead: (id: string) => void;
	onMarkAllAsRead: () => void;
	onClearAll: () => void;
}

export const NotificationBell = ({
	notifications,
	onMarkAsRead,
	onMarkAllAsRead,
	onClearAll,
}: NotificationBellProps) => {
	const [opened, setOpened] = useState(false);
	const unreadCount = notifications.filter((n) => !n.data?.read).length;

	return (
		<Popover
			opened={opened}
			onChange={setOpened}
			position="bottom-end"
			width={380}
			trapFocus
			withArrow
		>
			<Popover.Target>
				<Indicator
					inline
					label={unreadCount > 0 ? unreadCount : undefined}
					size={16}
					color="danger"
					disabled={unreadCount === 0}
				>
					<ActionIcon
						variant="default"
						size={HEADER_CONTROL_SIZE}
						aria-label="Notifications"
						onClick={() => setOpened((o) => !o)}
					>
						<IconBell size={NAV_ICON_SIZE} stroke={NAV_ICON_STROKE} />
					</ActionIcon>
				</Indicator>
			</Popover.Target>

			<Popover.Dropdown>
				<Stack gap="xs">
					<Group justify="space-between" px="xs">
						<Text size="sm" fw={600} c="dark.0">
							Notifications
						</Text>
						{unreadCount > 0 && (
							<Badge color="danger" size="sm" variant="filled">
								{unreadCount} new
							</Badge>
						)}
					</Group>

					{notifications.length > 0 && (
						<Group justify="flex-end" px="xs" gap="xs">
							{unreadCount > 0 && (
								<Button
									size="xs"
									variant="subtle"
									color="brand"
									leftSection={<IconCheck size={14} />}
									onClick={onMarkAllAsRead}
								>
									Mark all read
								</Button>
							)}
							<Button
								size="xs"
								variant="subtle"
								color="danger"
								onClick={onClearAll}
							>
								Clear all
							</Button>
						</Group>
					)}

					<ScrollArea h={400} type="auto">
						{notifications.length === 0 ? (
							<Box p="xl" ta="center">
								<Text size="sm" c="dark.2">
									No notifications
								</Text>
							</Box>
						) : (
							<Stack gap="xs">
								{notifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										onMarkAsRead={() => onMarkAsRead(notification.id)}
									/>
								))}
							</Stack>
						)}
					</ScrollArea>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};
