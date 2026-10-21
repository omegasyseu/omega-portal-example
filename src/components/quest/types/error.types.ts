export interface ErrorWithStatus extends Error {
	status?: number;
	data?: unknown;
	code?: string;
}

export interface ErrorWithMessage {
	message: string;
}

export function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
	return (
		error instanceof Error &&
		typeof (error as ErrorWithStatus).status === "number"
	);
}

export function hasErrorMessage(error: unknown): error is ErrorWithMessage {
	return (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as ErrorWithMessage).message === "string"
	);
}

export function getErrorStatus(error: unknown): number | undefined {
	if (isErrorWithStatus(error)) {
		return error.status;
	}
	if (typeof error === "object" && error !== null && "status" in error) {
		const status = (error as Record<string, unknown>).status;
		return typeof status === "number" ? status : undefined;
	}
	return undefined;
}
