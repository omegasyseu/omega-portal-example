import { Flex, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useAmsWebSocketEvents } from "@/server/AMS/ams-events.tsx";
import classes from "./ticker.module.css";

const Ticker = () => {
	const { messagesQueue } = useAmsWebSocketEvents();
	const [currentMessage, setCurrentMessage] = useState<string | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			if (messagesQueue.current.length > 0 && currentMessage === null) {
				const nextMessage = messagesQueue.current.shift();
				if (nextMessage) {
					setCurrentMessage(nextMessage);
				}

				setTimeout(() => {
					setCurrentMessage(null);
				}, 10000); // Adjust this duration as necessary
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [
		currentMessage,
		messagesQueue.current.length,
		messagesQueue.current.shift,
	]);

	// console.log({
	// 	currentMessage,
	// });
	return (
		<div className={classes.messageContainer}>
			<Flex h={"fit-content"} justify={"center"} align={"center"} w={"100%"}>
				{currentMessage && (
					<Text
						mah={70}
						ta={"center"}
						fz={"sm"}
						className={`${classes.slideInFromTop} ${classes.message}`}
					>
						{currentMessage}
					</Text>
				)}
			</Flex>
		</div>
	);
};

export default Ticker;
