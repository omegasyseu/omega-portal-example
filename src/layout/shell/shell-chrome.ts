// The shell (header, sidebar, bottom nav and phone menu) is dark in every Colour Mode:
// Mantine renders it in its dark scheme, and in Light Mode it takes the brand's deepest
// shade (light-mode.css).
export const SHELL_CHROME = {
	"data-shell-chrome": true,
	"data-mantine-color-scheme": "dark",
} as const;
