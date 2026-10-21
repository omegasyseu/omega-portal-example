import axios, { type AxiosError, type AxiosResponse } from "axios";
import { API_CFG } from "@/server/config.ts";
import { type APIResponse, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

const { AMS_API } = API_CFG;

export const AMS_AXIOS_CLIENT = axios.create({
	baseURL: AMS_API,
	headers: {
		"Access-Control-Allow-Origin": "*",
		Accept: "application/json, text/plain, */*",
		"Content-Type": "application/x-www-form-urlencoded",
		apikey: "PORTAL5",
		secretKey: "87F5E34D-C1C9-450D-A4B0-5613508CB0D5",
		uType: "API",
	},
});

// Add a response interceptor
AMS_AXIOS_CLIENT.interceptors.response.use(
	(response: AxiosResponse<APIResponse>) => {
		// console.log({
		// 	response,
		// });
		const status = response.data.code;

		if (status === "SUCCESS") {
			// If the status is "SUCCESS", return the original response
			return response;
		}

		// If the status is not "SUCCESS", throw an IPSErrors instance
		throw new IPSErrors({
			response: response.data,
			message: response.data.message || "Request failed",
			name: "APIError",
			status: response.data.status,
		});
	},
	(error: AxiosError<APIResponse>) => {
		if (error.response) {
			throw new IPSErrors({
				response: error.response.data,
				message: error.response.data.message || "An error occurred",
				name: "APIError",
				status: error.response.data.status,
			});
		}
		if (!error.request) {
			// Something happened in setting up the request that triggered an Error
			throw new Error("Error setting up the request");
		}
		// The request was made but no response was received
		throw new Error("No response received from the server");
	},
);
