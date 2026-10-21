import { Modal, type ModalProps } from "@mantine/core";
import classes from "./route-modal.module.css";

// The portal's dialog style, for dialogs built from Modal's parts too.
export const PORTAL_MODAL_CLASS_NAMES = {
	content: classes.content,
	header: classes.header,
	title: classes.title,
	body: classes.body,
};

// A dialog in the portal's style: the raised surface, bordered, with a bold title.
export function PortalModal(props: ModalProps) {
	return <Modal centered classNames={PORTAL_MODAL_CLASS_NAMES} {...props} />;
}
