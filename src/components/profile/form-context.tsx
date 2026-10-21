// form-context.ts file
import { createFormContext } from "@mantine/form";

interface EditProfileForm {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	birthMonth: string;
	birthDay: string;
	birthYear: string;
	gender: string;
	langCode: string;
	postalCode: string;
	streetNumber: string;
	address: string;
	city: string;
	province: string;
	country: string;
	mobile: string;
	phone: string;
}

// You can give context variables any name
export const [
	EditProfileFormProvider,
	useEditProfileFormContext,
	useEditProfileForm,
] = createFormContext<Partial<EditProfileForm>>();
