import { Button, Group, List, Modal, Stack, Text } from "@mantine/core";
import { MODAL_CLASS_NAMES } from "@/components/responsible-gaming/modal-class-names.ts";
import classes from "./responsible-gaming.module.css";

type Props = {
	isOpen: boolean;
	lockedUntil: string;
	isLocking: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

const SelfExclusionConfirmModal = ({
	isOpen,
	lockedUntil,
	isLocking,
	onCancel,
	onConfirm,
}: Props) => (
	<Modal
		opened={isOpen}
		onClose={onCancel}
		centered
		title={<Text fw={700}>Confirm self-exclusion</Text>}
		classNames={MODAL_CLASS_NAMES}
	>
		<Stack gap={"lg"}>
			<Stack gap={4}>
				<Text className={classes.note}>Your account will be locked until</Text>
				<Text className={classes.lockUntil}>{lockedUntil}</Text>
			</Stack>
			<List className={classes.warningList} spacing={"xs"}>
				<List.Item>You will be logged out now.</List.Item>
				<List.Item>You can't log in until the date above.</List.Item>
				<List.Item>
					Only our support team can lift it early. You can't undo this yourself.
				</List.Item>
			</List>
			<Group justify={"flex-end"}>
				<Button variant={"default"} onClick={onCancel} disabled={isLocking}>
					Cancel
				</Button>
				<Button color={"danger"} onClick={onConfirm} loading={isLocking}>
					Lock my account
				</Button>
			</Group>
		</Stack>
	</Modal>
);

export default SelfExclusionConfirmModal;
