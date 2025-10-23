import {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
	IAuthenticateGeneric,
} from 'n8n-workflow';

export class NapCatApi implements ICredentialType {
	name = 'napCatApi';
	displayName = 'NapCat API';
	documentationUrl = 'https://napcat.apifox.cn/226888843e0';

	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://napcat:3001',
			description: 'NapCat API服务器的基础URL。支持本地部署(http://localhost:3001)和Docker部署(http://napcat:3001)',
			required: true,
			placeholder: 'http://napcat:3001',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
				expirable: true,
			},
			default: '',
			description: 'NapCat API访问令牌 (Bearer Token)。从NapCat服务获取的认证令牌',
			required: true,
			placeholder: 'your-bearer-token',
		},
	];

	// 预认证方法 - 验证token有效性
	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		try {
			const baseUrl = String(credentials.baseUrl || '').trim();
			if (!baseUrl) {
				throw new Error('API Base URL 为空，请在凭证中填写正确的地址');
			}

			const response = await this.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}/get_login_info`,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${credentials.accessToken}`,
				},
				timeout: 10000, // 10秒超时
			});

			// 检查响应是否有效
			if (response && typeof response === 'object') {
				return { accessToken: credentials.accessToken };
			} else {
				throw new Error('Invalid response from NapCat API');
			}
		} catch (error: any) {
			if (error.code === 'ECONNREFUSED') {
				throw new Error('无法连接到NapCat服务，请检查API Base URL和网络连接');
			} else if (error.code === 'ENOTFOUND') {
				throw new Error('NapCat服务地址未找到，请检查API Base URL');
			} else if (error.response?.status === 401) {
				throw new Error('Access Token无效或已过期，请检查认证信息');
			} else if (error.response?.status === 404) {
				throw new Error('NapCat API接口不存在，请检查API版本');
			} else {
				throw new Error(`NapCat API认证失败: ${error.message}`);
			}
		}
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	// 改进的测试请求
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl && $credentials.baseUrl.trim()}}',
			url: '/get_login_info',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': '=Bearer {{$credentials.accessToken}}',
			},
		},
		rules: [],
	};
}
