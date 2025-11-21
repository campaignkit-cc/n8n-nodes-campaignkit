import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CampaignKitApi implements ICredentialType {
	name = 'campaignKitApi';
	displayName = 'CampaignKit API';
	documentationUrl = 'https://docs.campaignkit.cc';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your CampaignKit API key. You can find this in your account settings at https://app.campaignkit.cc/profile',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.campaignkit.cc',
			required: true,
			description: 'The base URL for CampaignKit API. Use the default unless instructed otherwise.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/account/me',
			method: 'GET',
		},
	};
}
