import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodeProperties,
	NodeApiError,
} from 'n8n-workflow';

import { tavilyApiRequest } from './tavilyApi.utils';

// NEW: maintain a constant array for valid time ranges
const ALLOWED_TIME_RANGES = ['', 'day', 'week', 'month', 'year', 'd', 'w', 'm', 'y'];

export class TavilySearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tavily Search',
		name: 'tavilySearch',
		icon: 'file:tavily.svg',
		group: ['transform'],
		version: 1,
		description: 'Execute a search query using the Tavily Search endpoint',
		defaults: {
			name: 'Tavily Search',
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
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				description: 'The search query to execute with Tavily',
			},
			{
				displayName: 'Topic',
				name: 'topic',
				type: 'options',
				options: [
					{ name: 'General', value: 'general' },
					{ name: 'News', value: 'news' },
				],
				default: 'general',
				description: 'The category of the search',
			},
			{
				displayName: 'Search Depth',
				name: 'searchDepth',
				type: 'options',
				options: [
					{ name: 'Basic', value: 'basic' },
					{ name: 'Advanced', value: 'advanced' },
				],
				default: 'basic',
				description: 'Depth of the search (basic=1 credit, advanced=2 credits)',
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 20,
				},
				default: 5,
				description: 'Maximum number of search results to return (0-20)',
			},
			{
				displayName: 'Time Range',
				name: 'timeRange',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Day', value: 'day' },
					{ name: 'Week', value: 'week' },
					{ name: 'Month', value: 'month' },
					{ name: 'Year', value: 'year' },
					{ name: 'd', value: 'd' },
					{ name: 'w', value: 'w' },
					{ name: 'm', value: 'm' },
					{ name: 'y', value: 'y' },
				],
				default: '',
				description: 'Time range filter (relative to current date)',
			},
			{
				displayName: 'Days (News Only)',
				name: 'days',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 3,
				description: 'Number of days back from the current date to include (for topic=news)',
				displayOptions: {
					show: {
						topic: ['news'],
					},
				},
			},
			{
				displayName: 'Include Answer',
				name: 'includeAnswer',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Basic', value: 'basic' },
					{ name: 'Advanced', value: 'advanced' },
				],
				default: 'false',
				description: 'Include an LLM-generated answer (basic or advanced)',
			},
			{
				displayName: 'Include Raw Content',
				name: 'includeRawContent',
				type: 'boolean',
				default: false,
				description: 'Include cleaned and parsed HTML content of each search result',
			},
			{
				displayName: 'Include Images',
				name: 'includeImages',
				type: 'boolean',
				default: false,
				description: 'Perform an image search and include images in the response',
			},
			{
				displayName: 'Include Image Descriptions',
				name: 'includeImageDescriptions',
				type: 'boolean',
				displayOptions: {
					show: {
						includeImages: [true],
					},
				},
				default: false,
				description: 'When including images, also add a descriptive text for each image',
			},
			{
				displayName: 'Include Domains',
				name: 'includeDomains',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Domain',
				},
				default: [],
				description: 'Domains to specifically include in the search results',
			},
			{
				displayName: 'Exclude Domains',
				name: 'excludeDomains',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Domain',
				},
				default: [],
				description: 'Domains to specifically exclude from the search results',
			},
			{
				displayName: 'API Documentation',
				name: 'apiDocumentationNotice',
				type: 'notice',
				default: '',
				description: `### Tavily Search API

**Endpoint**: POST /search  
**Body Parameters**:
- query (required)
- topic (general|news)
- search_depth (basic|advanced)
- max_results (0-20)
- time_range (day|week|month|year|d|w|m|y)
- days (>=0, news only)
- include_answer (false|basic|advanced)
- include_raw_content (boolean)
- include_images (boolean)
- include_image_descriptions (boolean)
- include_domains (string[])
- exclude_domains (string[])

**Response**:
- query
- answer (optional)
- images (optional)
- results
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
			// Standardize NodeApiError usage
			throw new NodeApiError(this.getNode(), new Error('Missing Tavily API key in credentials.'));
		}
		const apiKey = credentials.apiKey as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const query = this.getNodeParameter('query', i) as string;
				const topic = this.getNodeParameter('topic', i) as string;
				const searchDepth = this.getNodeParameter('searchDepth', i) as string;
				const maxResults = this.getNodeParameter('maxResults', i) as number;
				const timeRange = this.getNodeParameter('timeRange', i) as string;
				const days = this.getNodeParameter('days', i) as number;
				const includeAnswer = this.getNodeParameter('includeAnswer', i) as string;
				const includeRawContent = this.getNodeParameter('includeRawContent', i) as boolean;
				const includeImages = this.getNodeParameter('includeImages', i) as boolean;
				const includeImageDescriptions = this.getNodeParameter('includeImageDescriptions', i) as boolean;
				const includeDomains = this.getNodeParameter('includeDomains', i, []) as string[];
				const excludeDomains = this.getNodeParameter('excludeDomains', i, []) as string[];

				// --- Validate input parameters ---
				if (!query?.trim()) {
					throw new NodeApiError(this.getNode(), new Error('Query parameter cannot be empty.'));
				}
				if (maxResults < 0 || maxResults > 20) {
					throw new NodeApiError(this.getNode(), new Error('Max Results must be between 0 and 20.'));
				}
				// Use ALLOWED_TIME_RANGES constant
				if (!ALLOWED_TIME_RANGES.includes(timeRange)) {
					throw new NodeApiError(this.getNode(), new Error(`Invalid timeRange value. Allowed: ${ALLOWED_TIME_RANGES.join(', ')}`));
				}
				if (topic === 'news' && days < 0) {
					throw new NodeApiError(this.getNode(), new Error('Days must be >= 0 when topic is "news".'));
				}
				// ----------------------------------

				const body: Record<string, any> = {
					query,
					topic,
					search_depth: searchDepth,
					max_results: maxResults,
					include_raw_content: includeRawContent,
					include_images: includeImages,
					include_image_descriptions: includeImageDescriptions,
				};

				if (timeRange) {
					body.time_range = timeRange;
				}
				if (topic === 'news') {
					body.days = days;
				}
				if (includeAnswer !== 'false') {
					body.include_answer = includeAnswer;
				}
				if (Array.isArray(includeDomains) && includeDomains.length > 0) {
					body.include_domains = includeDomains;
				}
				if (Array.isArray(excludeDomains) && excludeDomains.length > 0) {
					body.exclude_domains = excludeDomains;
				}

				// Make request via the shared utility
				const result = await tavilyApiRequest.call(
					this,
					'POST',
					'/search',
					body,
					apiKey,
				);

				returnData.push({ json: result });
			} catch (error) {
				// Ensure consistent error wrapping
				if (error instanceof NodeApiError) {
					throw error;
				}
				throw new NodeApiError(this.getNode(), error as Error);
			}
		}

		return [returnData];
	}
}
