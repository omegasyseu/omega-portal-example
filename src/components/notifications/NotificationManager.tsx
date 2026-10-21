import { useNotificationManager } from "./hooks/useNotificationManager";
import { NotificationBell } from "./NotificationBell";

export const NotificationManager = () => {
	const { notifications, markAsRead, markAllAsRead, clearAll } =
		useNotificationManager();

	return (
		<NotificationBell
			notifications={notifications}
			onMarkAsRead={markAsRead}
			onMarkAllAsRead={markAllAsRead}
			onClearAll={clearAll}
		/>
	);
};
