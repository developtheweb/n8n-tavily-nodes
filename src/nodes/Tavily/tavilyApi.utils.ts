import axios, { AxiosError, AxiosResponse } from 'axios';
import { NodeApiError, IExecuteFunctions } from 'n8n-workflow'; // CHANGED
// import { IExecuteFunctions } from 'n8n-core'; // REMOVED

/**
 * Common function to call the Tavily API.
 * Handles request execution and standard error handling.
 */
export async function tavilyApiRequest(
	this: IExecuteFunctions,
	method: 'POST',
	resource: '/search' | '/extract',
	body: Record<string, any>,
	apiKey: string,
): Promise<any> {

	let response: AxiosResponse<any>;

	try {
		response = await axios.request({
			method,
			url: `https://api.tavily.com${resource}`,
			data: body,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			let message = `Tavily API error: ${error.message}`;

			if (status) {
				switch (status) {
					case 400:
						message = 'Tavily error [400]: Bad Request.';
						break;
					case 401:
						message = 'Tavily error [401]: Unauthorized.';
						break;
					case 403:
						message = 'Tavily error [403]: Forbidden.';
						break;
					case 429:
						message = 'Tavily error [429]: Too many requests.';
						break;
					case 500:
						message = 'Tavily error [500]: Internal Server Error.';
						break;
					default:
						message = `Tavily API error [${status}]: ${error.message}`;
						break;
				}
			}

			// If the Tavily API returned a body with error details, append them
			if (error.response?.data) {
				const data = error.response.data;
				const additionalMsgParts: string[] = [];

				if (data.error_code) {
					additionalMsgParts.push(`error_code: ${data.error_code}`);
				}
				if (data.error_message) {
					additionalMsgParts.push(`error_message: ${data.error_message}`);
				}
				if (!data.error_code && !data.error_message) {
					additionalMsgParts.push(JSON.stringify(data));
				}

				if (additionalMsgParts.length > 0) {
					message += ` | ${additionalMsgParts.join(' | ')}`;
				}
			}

			// PASS A JsonObject
			throw new NodeApiError(this.getNode(), { message });
		} else {
			// If not an AxiosError, wrap it
			throw new NodeApiError(this.getNode(), { message: String(error) });
		}
	}

	return response.data;
}
