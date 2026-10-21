import {
	type BirthDateParts,
	birthDatePartsOf,
} from "@/components/auth/signup-model.ts";
import { readIpsDate } from "@/utils/date.ts";

// The player's stored birth date as the three selects' values, empty when there's none
// or it can't be read.
export const storedBirthDate = (
	birthDateFormatted: string | null | undefined,
): BirthDateParts => birthDatePartsOf(readIpsDate(birthDateFormatted));
