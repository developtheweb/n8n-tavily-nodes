import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TavilyApi implements ICredentialType {
	name = 'tavilyApi';
	displayName = 'Tavily API';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			description: 'Enter your Tavily API key here (e.g., tvly-abcdef123456)',
		},
	];
}