import {
	IExecuteFunctions,
	NodeApiError,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodeProperties,
} from 'n8n-workflow';
// REMOVED import { IExecuteFunctions } from 'n8n-core';

import { tavilyApiRequest } from './tavilyApi.utils';

export class TavilyExtract implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tavily Extract',
		name: 'tavilyExtract',
		icon: 'file:tavily.svg',
		group: ['transform'],
		version: 1,
		description: 'Extract web page content using the Tavily Extract endpoint',
		defaults: {
			name: 'Tavily Extract',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'tavilyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'URLs',
				name: 'urls',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add URL',
				},
				default: [],
				required: true,
				description: 'One or more URLs to extract content from',
			},
			{
				displayName: 'Include Images',
				name: 'includeImages',
				type: 'boolean',
				default: false,
				description: 'Include a list of images extracted from each URL',
			},
			{
				displayName: 'Extract Depth',
				name: 'extractDepth',
				type: 'options',
				options: [
					{ name: 'Basic', value: 'basic' },
					{ name: 'Advanced', value: 'advanced' },
				],
				default: 'basic',
				description: 'How deeply to parse each URL. "advanced" retrieves more data but can increase latency',
			},
			{
				displayName: 'API Documentation',
				name: 'apiDocumentationNotice',
				type: 'notice',
				default: '',
				description: `### Tavily Extract API

**Endpoint**: POST /extract  
**Body Parameters**:
- urls (string[]; required)
- include_images (boolean)
- extract_depth (basic|advanced)

**Response**:
- results
- failed_results
- response_time
`,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('tavilyApi');
		if (!credentials?.apiKey) {
			throw new NodeApiError(this.getNode(), { message: 'Missing Tavily API key in credentials.' });
		}
		const apiKey = credentials.apiKey as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const urls = this.getNodeParameter('urls', i, []) as string[];
				const includeImages = this.getNodeParameter('includeImages', i) as boolean;
				const extractDepth = this.getNodeParameter('extractDepth', i) as string;

				if (!Array.isArray(urls) || urls.length === 0) {
					throw new NodeApiError(this.getNode(), { message: 'At least one URL is required.' });
				}

				const body = {
					urls,
					include_images: includeImages,
					extract_depth: extractDepth,
				};

				const result = await tavilyApiRequest.call(
					this,
					'POST',
					'/extract',
					body,
					apiKey,
				);

				returnData.push({ json: result });
			} catch (error) {
				if (error instanceof NodeApiError) {
					throw error;
				}
				throw new NodeApiError(this.getNode(), { message: String(error) });
			}
		}

		return [returnData];
	}
}
