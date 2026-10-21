import { Button, Dialog, Flex, Group, Text } from "@mantine/core";

type Props = {
	error: Error | null;
	opened: boolean;
	onClose: () => void;
	toggle: () => void;
	formatedError?: string;
};
const ErrorInfo = ({
	error,
	onClose,
	opened,
	toggle,
	formatedError,
}: Props) => {
	if (error) {
		return (
			<>
				<Flex justify={"center"} mx={"auto"}>
					<Button onClick={toggle} variant="outline" color="danger" size="xs">
						Check Error
					</Button>
				</Flex>
				<Dialog
					opened={opened}
					withCloseButton
					onClose={onClose}
					size="lg"
					radius="md"
				>
					<Text size="sm" mb="xs" fw={500}>
						Error with API {error?.name}
					</Text>

					<Group align="flex-end">
						<Text>{formatedError}</Text>
					</Group>
				</Dialog>
			</>
		);
	}
	return null;
};

export default ErrorInfo;
