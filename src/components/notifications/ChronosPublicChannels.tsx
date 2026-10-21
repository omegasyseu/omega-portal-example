import { useSession } from "@/providers/authentication/authentication";
import {
	CHRONOS_PUBLIC_CHANNEL_IDS,
	useChronosPublicChannel,
} from "@/server/chronos/chronos-websocket";
import { showChronosToast } from "./utils/chronosToasts";

const ChronosPublicChannel = ({ channelId }: { channelId: string }) => {
	useChronosPublicChannel(channelId, showChronosToast);
	return null;
};

/**
 * Subscribes the logged-in player to the configured public Chronos channels (toasts only).
 * Mounted once at the router root so the sockets stay open across page navigation.
 */
export const ChronosPublicChannels = () => {
	const { session } = useSession();

	if (!session?.user?.sessionKey || CHRONOS_PUBLIC_CHANNEL_IDS.length === 0) {
		return null;
	}

	return (
		<>
			{CHRONOS_PUBLIC_CHANNEL_IDS.map((channelId) => (
				<ChronosPublicChannel key={channelId} channelId={channelId} />
			))}
		</>
	);
};
