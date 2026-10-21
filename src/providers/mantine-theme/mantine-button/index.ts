import { Button } from "@mantine/core";
import classes from "./mantine-button.module.css";

export const OmegaButton = Button.extend({
	classNames: {
		root: classes.root,
	},
});
