import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

// 智能检测消息类型
function detectMessageType(content: string): string {
	if (!content) return 'text';

	// 检查是否为URL
	const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i;
	if (urlPattern.test(content.trim())) {
		return 'image';
	}

	// 检查是否为文件路径
	const filePattern = /^.+\.(mp3|wav|amr|silk|mp4|avi|mov|wmv|flv)$/i;
	if (filePattern.test(content.trim())) {
		const ext = content.toLowerCase().split('.').pop();
		if (['mp3', 'wav', 'amr', 'silk'].includes(ext || '')) {
			return 'voice';
		} else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext || '')) {
			return 'video';
		}
	}

	// 检查是否为JSON
	try {
		JSON.parse(content);
		return 'json';
	} catch {
		// 不是JSON，继续检测
	}

	// 检查是否为表情ID（纯数字）
	if (/^\d+$/.test(content.trim())) {
		return 'face';
	}

	// 默认为文本
	return 'text';
}

// 构建消息对象
function buildMessage(messageType: string, content: string, additionalParams: Record<string, any> = {}): any[] {
	const actualType = messageType === 'auto' ? detectMessageType(content) : messageType;

	switch (actualType) {
		case 'text':
			return [{ type: 'text', data: { text: content } }];
		case 'image':
			return [{ type: 'image', data: { file: content } }];
		case 'voice':
			return [{ type: 'voice', data: { file: content } }];
		case 'video':
			return [{ type: 'video', data: { file: content } }];
		case 'face':
			return [{ type: 'face', data: { id: content } }];
		case 'json':
			return [{ type: 'json', data: JSON.parse(content) }];
		case 'reply':
			return [{ type: 'reply', data: { id: additionalParams.replyMessageId } }];
		case 'music':
			return [{ type: 'music', data: { id: additionalParams.musicId } }];
		case 'custom_music':
			return [{ type: 'custom_music', data: JSON.parse(additionalParams.customMusicData) }];
		case 'dice':
			return [{ type: 'dice', data: {} }];
		case 'rps':
			return [{ type: 'rps', data: {} }];
		case 'forward':
			return [{ type: 'forward', data: { id: additionalParams.forwardMessageId } }];
		case 'file':
			return [{ type: 'file', data: { file: content } }];
		default:
			return [{ type: 'text', data: { text: content } }];
	}
}

export class NapCat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NapCat',
		name: 'napCat',
		icon: 'file:napcat.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: '与NapCat QQ机器人API交互',
		defaults: {
			name: 'NapCat',
		},
		inputs: ['main'],
		outputs: ['main'],
	usableAsTool: true,
		credentials: [
			{
				name: 'napCatApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl && $credentials.baseUrl.trim()}}',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: '资源类型',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '账号相关 (Account)',
						value: 'account',
					},
					{
						name: '消息相关 (Message)',
						value: 'message',
					},
					{
						name: '群聊相关 (Group)',
						value: 'group',
					},
					{
						name: '文件相关 (File)',
						value: 'file',
					},
					{
						name: '密钥相关 (Key)',
						value: 'key',
					},
					{
						name: '系统操作 (System)',
						value: 'system',
					},
					{
						name: '其他接口 (Other)',
						value: 'other',
					},
				],
				default: 'message',
			},
			// 账号相关操作
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: '获取登录号信息',
						value: 'getLoginInfo',
						description: '获取登录号信息',
						action: '获取登录号信息',
					},
					{
						name: '获取账号信息',
						value: 'getStrangerInfo',
						description: '获取账号信息',
						action: '获取账号信息',
					},
					{
						name: '获取好友列表',
						value: 'getFriendList',
						description: '获取好友列表',
						action: '获取好友列表',
					},
					{
						name: '获取单向好友列表',
						value: 'getUnidirectionalFriendList',
						description: '获取单向好友列表',
						action: '获取单向好友列表',
					},
					{
						name: '获取最近消息列表',
						value: 'getRecentContact',
						description: '获取最近消息列表',
						action: '获取最近消息列表',
					},
					{
						name: '设置好友备注',
						value: 'setFriendRemark',
						description: '设置好友备注',
						action: '设置好友备注',
					},
					{
						name: '设置私聊已读',
						value: 'markPrivateMsgAsRead',
						description: '设置私聊已读',
						action: '设置私聊已读',
					},
					{
						name: '设置群聊已读',
						value: 'markGroupMsgAsRead',
						description: '设置群聊已读',
						action: '设置群聊已读',
					},
					{
						name: '设置消息已读',
						value: 'markMsgAsRead',
						description: '设置消息已读',
						action: '设置消息已读',
					},
				],
				default: 'getLoginInfo',
			},
			// 消息相关操作
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: '发送私聊消息',
						value: 'sendPrivateMessage',
						description: '发送私聊消息',
						action: '发送私聊消息',
					},
					{
						name: '发送群聊消息',
						value: 'sendGroupMessage',
						description: '发送群聊消息',
						action: '发送群聊消息',
					},
					{
						name: '发送消息（通用）',
						value: 'sendMsg',
						description: '发送消息（通用）',
						action: '发送消息',
					},
					{
						name: '撤回消息',
						value: 'recallMessage',
						description: '撤回消息',
						action: '撤回消息',
					},
					{
						name: '获取消息详情',
						value: 'getMessageDetail',
						description: '获取消息详情',
						action: '获取消息详情',
					},
					{
						name: '获取图片消息详情',
						value: 'getImage',
						description: '获取图片消息详情',
						action: '获取图片消息详情',
					},
					{
						name: '获取语音消息详情',
						value: 'getRecord',
						description: '获取语音消息详情',
						action: '获取语音消息详情',
					},
					{
						name: '获取合并转发消息',
						value: 'getForwardMsg',
						description: '获取合并转发消息',
						action: '获取合并转发消息',
					},
					{
						name: '发送合并转发消息',
						value: 'sendForwardMsg',
						description: '发送合并转发消息',
						action: '发送合并转发消息',
					},
					{
						name: '发送群合并转发消息',
						value: 'sendGroupForwardMsg',
						description: '发送群合并转发消息',
						action: '发送群合并转发消息',
					},
					{
						name: '消息转发到群',
						value: 'forwardGroupSingleMsg',
						description: '消息转发到群',
						action: '消息转发到群',
					},
					{
						name: '发送私聊合并转发消息',
						value: 'sendPrivateForwardMsg',
						description: '发送私聊合并转发消息',
						action: '发送私聊合并转发消息',
					},
					{
						name: '消息转发到私聊',
						value: 'forwardFriendSingleMsg',
						description: '消息转发到私聊',
						action: '消息转发到私聊',
					},
					{
						name: '获取群历史消息',
						value: 'getGroupHistory',
						description: '获取群历史消息',
						action: '获取群历史消息',
					},
					{
						name: '获取好友历史消息',
						value: 'getFriendHistory',
						description: '获取好友历史消息',
						action: '获取好友历史消息',
					},
					{
						name: '发送戳一戳',
						value: 'sendPoke',
						description: '发送戳一戳',
						action: '发送戳一戳',
					},
					{
						name: '发送群聊戳一戳',
						value: 'groupPoke',
						description: '发送群聊戳一戳',
						action: '发送群聊戳一戳',
					},
					{
						name: '发送私聊戳一戳',
						value: 'friendPoke',
						description: '发送私聊戳一戳',
						action: '发送私聊戳一戳',
					},
					{
						name: '贴表情',
						value: 'stickExpression',
						description: '贴表情',
						action: '贴表情',
					},
					{
						name: '获取贴表情详情',
						value: 'fetchEmojiLike',
						description: '获取贴表情详情',
						action: '获取贴表情详情',
					},
				],
				default: 'sendPrivateMessage',
			},
			// 群聊相关操作
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['group'],
					},
				},
				options: [
					{
						name: '获取群信息',
						value: 'getGroupInfo',
						description: '获取群信息',
						action: '获取群信息',
					},
					{
						name: '获取群列表',
						value: 'getGroupList',
						description: '获取群列表',
						action: '获取群列表',
					},
					{
						name: '获取群详细信息',
						value: 'getGroupDetailInfo',
						description: '获取群详细信息',
						action: '获取群详细信息',
					},
					{
						name: '获取群成员信息',
						value: 'getGroupMemberInfo',
						description: '获取群成员信息',
						action: '获取群成员信息',
					},
					{
						name: '获取群成员列表',
						value: 'getGroupMemberList',
						description: '获取群成员列表',
						action: '获取群成员列表',
					},
					{
						name: '设置群名',
						value: 'setGroupName',
						description: '设置群名',
						action: '设置群名',
					},
					{
						name: '设置群管理',
						value: 'setGroupAdmin',
						description: '设置群管理',
						action: '设置群管理',
					},
					{
						name: '设置群成员名片',
						value: 'setGroupCard',
						description: '设置群成员名片',
						action: '设置群成员名片',
					},
					{
						name: '群踢人',
						value: 'kickGroupMember',
						description: '群踢人',
						action: '群踢人',
					},
					{
						name: '群禁言',
						value: 'banGroupMember',
						description: '群禁言',
						action: '群禁言',
					},
					{
						name: '全体禁言',
						value: 'banGroupWhole',
						description: '全体禁言',
						action: '全体禁言',
					},
					{
						name: '退群',
						value: 'leaveGroup',
						description: '退群',
						action: '退群',
					},
					{
						name: '群打卡',
						value: 'groupSign',
						description: '群打卡',
						action: '群打卡',
					},
				],
				default: 'getGroupInfo',
			},
			// 文件相关操作
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: '获取群文件系统信息',
						value: 'getGroupFileSystemInfo',
						description: '获取群文件系统信息',
						action: '获取群文件系统信息',
					},
					{
						name: '获取群文件列表',
						value: 'getGroupFiles',
						description: '获取群文件列表',
						action: '获取群文件列表',
					},
					{
						name: '上传群文件',
						value: 'uploadGroupFile',
						description: '上传群文件',
						action: '上传群文件',
					},
					{
						name: '删除群文件',
						value: 'deleteGroupFile',
						description: '删除群文件',
						action: '删除群文件',
					},
					{
						name: '上传私聊文件',
						value: 'uploadPrivateFile',
						description: '上传私聊文件',
						action: '上传私聊文件',
					},
				],
				default: 'getGroupFileSystemInfo',
			},
			// 密钥相关操作
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['key'],
					},
				},
				options: [
					{
						name: '获取Cookies',
						value: 'getCookies',
						description: '获取Cookies',
						action: '获取Cookies',
					},
					{
						name: '获取CSRF Token',
						value: 'getCsrfToken',
						description: '获取CSRF Token',
						action: '获取CSRF Token',
					},
				],
				default: 'getCookies',
			},
			// 系统操作
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['system'],
					},
				},
				options: [
					{
						name: '获取版本信息',
						value: 'getVersionInfo',
						description: '获取版本信息',
						action: '获取版本信息',
					},
					{
						name: '账号退出',
						value: 'botExit',
						description: '账号退出',
						action: '账号退出',
					},
				],
				default: 'getVersionInfo',
			},
			// 其他接口
			{
				displayName: '操作类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['other'],
					},
				},
				options: [
					{
						name: '检查链接安全性',
						value: 'checkUrlSafely',
						description: '检查链接安全性',
						action: '检查链接安全性',
					},
					{
						name: '获取收藏列表',
						value: 'getCollectionList',
						description: '获取收藏列表',
						action: '获取收藏列表',
					},
				],
				default: 'checkUrlSafely',
			},
			// 用户ID参数 - 账号相关
			{
				displayName: '用户ID',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getStrangerInfo', 'setFriendRemark', 'markPrivateMsgAsRead', 'markMsgAsRead'],
					},
				},
				default: '',
				description: '目标用户ID',
				required: true,
			},
			// 用户ID参数 - 消息相关
			{
				displayName: '用户ID',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendPrivateMessage', 'getFriendHistory', 'friendPoke'],
					},
				},
				default: '',
				description: '目标用户ID',
				required: true,
			},
			// 群组ID参数 - 消息相关
			{
				displayName: '群组ID',
				name: 'groupId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendGroupMessage', 'getGroupHistory', 'groupPoke'],
					},
				},
				default: '',
				description: '目标群组ID',
				required: true,
			},
			// 群组ID参数 - 群聊相关
			{
				displayName: '群组ID',
				name: 'groupId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['getGroupInfo', 'getGroupDetailInfo', 'getGroupMemberInfo', 'getGroupMemberList', 'setGroupName', 'setGroupAdmin', 'setGroupCard', 'kickGroupMember', 'banGroupMember', 'banGroupWhole', 'leaveGroup', 'groupSign'],
					},
				},
				default: '',
				description: '目标群组ID',
				required: true,
			},
			// 群组ID参数 - 文件相关
			{
				displayName: '群组ID',
				name: 'groupId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['getGroupFileSystemInfo', 'getGroupFiles', 'uploadGroupFile', 'deleteGroupFile'],
					},
				},
				default: '',
				description: '目标群组ID',
				required: true,
			},
			// 消息类型参数
			{
				displayName: '消息类型',
				name: 'messageType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendPrivateMessage', 'sendGroupMessage'],
					},
				},
				options: [
					{
						name: '自动检测 (Auto Detect)',
						value: 'auto',
						description: '根据内容自动选择消息类型',
					},
					{
						name: '文本 (Text)',
						value: 'text',
					},
					{
						name: '图片 (Image)',
						value: 'image',
					},
					{
						name: '语音 (Voice)',
						value: 'voice',
					},
					{
						name: '视频 (Video)',
						value: 'video',
					},
					{
						name: '系统表情 (Face)',
						value: 'face',
					},
					{
						name: 'JSON卡片 (JSON)',
						value: 'json',
					},
					{
						name: '回复消息 (Reply)',
						value: 'reply',
					},
					{
						name: '音乐卡片 (Music)',
						value: 'music',
					},
					{
						name: '自定义音乐卡片 (Custom Music)',
						value: 'custom_music',
					},
					{
						name: '超级表情-骰子 (Dice)',
						value: 'dice',
					},
					{
						name: '超级表情-猜拳 (RPS)',
						value: 'rps',
					},
					{
						name: '合并转发 (Forward)',
						value: 'forward',
					},
					{
						name: '文件 (File)',
						value: 'file',
					},
				],
				default: 'auto',
			},
			// 消息内容参数
			{
				displayName: '消息内容/URL',
				name: 'messageContent',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendPrivateMessage', 'sendGroupMessage'],
						messageType: ['auto', 'text', 'image', 'voice', 'video', 'face', 'json', 'music', 'custom_music', 'file'],
					},
				},
				default: '',
				description: '消息内容、文件URL或数据。自动检测模式下，支持文本、图片URL、语音/视频文件路径等',
				required: true,
			},
			// 消息ID参数
			{
				displayName: '消息ID',
				name: 'messageId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['recallMessage', 'getMessageDetail', 'getImage', 'getRecord', 'getForwardMsg', 'stickExpression', 'fetchEmojiLike'],
					},
				},
				default: '',
				description: '消息ID',
				required: true,
			},
			// 备注参数
			{
				displayName: '备注',
				name: 'remark',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['setFriendRemark'],
					},
				},
				default: '',
				description: '好友备注',
				required: true,
			},
			// 群名参数
			{
				displayName: '群名',
				name: 'groupName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['setGroupName'],
					},
				},
				default: '',
				description: '群名称',
				required: true,
			},
			// 名片参数
			{
				displayName: '名片',
				name: 'card',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['setGroupCard'],
					},
				},
				default: '',
				description: '群成员名片',
				required: true,
			},
			// 启用参数
			{
				displayName: '启用',
				name: 'enable',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['setGroupAdmin', 'banGroupWhole'],
					},
				},
				default: true,
				description: '是否启用',
			},
			// 时长参数
			{
				displayName: '时长（秒）',
				name: 'duration',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['banGroupMember'],
					},
				},
				default: 0,
				description: '禁言时长，0为永久禁言',
			},
			// 文件参数
			{
				displayName: '文件',
				name: 'file',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['uploadGroupFile', 'uploadPrivateFile'],
					},
				},
				default: '',
				description: '文件路径或URL',
				required: true,
			},
			// 文件名参数
			{
				displayName: '文件名',
				name: 'name',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['uploadGroupFile', 'uploadPrivateFile'],
					},
				},
				default: '',
				description: '文件名称',
				required: true,
			},
			// 文件ID参数
			{
				displayName: '文件ID',
				name: 'fileId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['deleteGroupFile'],
					},
				},
				default: '',
				description: '文件ID',
				required: true,
			},
			// URL参数
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['other'],
						operation: ['checkUrlSafely'],
					},
				},
				default: '',
				description: '要检查的链接',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const credentials = await this.getCredentials('napCatApi');
				const baseUrl = String(credentials?.baseUrl || '').trim();
				if (!baseUrl) {
					throw new Error('NapCat API Base URL 未设置或为空');
				}

				const buildUrl = (path: string) => `${baseUrl}${path}`;
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData = {};

				// 账号相关接口
				if (resource === 'account') {
					if (operation === 'getLoginInfo') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_login_info'),
							body: {},
						});
					} else if (operation === 'getStrangerInfo') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_stranger_info'),
							body: { user_id: userId },
						});
					} else if (operation === 'getFriendList') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_friend_list'),
							body: {},
						});
					} else if (operation === 'getUnidirectionalFriendList') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_unidirectional_friend_list'),
							body: {},
						});
					} else if (operation === 'getRecentContact') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_recent_contact'),
							body: {},
						});
					} else if (operation === 'setFriendRemark') {
						const userId = this.getNodeParameter('userId', i) as string;
						const remark = this.getNodeParameter('remark', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_friend_remark'),
							body: { user_id: userId, remark },
						});
					} else if (operation === 'markPrivateMsgAsRead') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/mark_private_msg_as_read'),
							body: { user_id: userId },
						});
					} else if (operation === 'markGroupMsgAsRead') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/mark_group_msg_as_read'),
							body: { group_id: groupId },
						});
					} else if (operation === 'markMsgAsRead') {
						const userId = this.getNodeParameter('userId', i) as string;
						const groupId = this.getNodeParameter('groupId', i, '') as string;
						const body: any = {};
						if (userId) body.user_id = userId;
						if (groupId) body.group_id = groupId;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/mark_msg_as_read'),
							body,
						});
					}
				}

				// 消息相关接口
				if (resource === 'message') {
					if (operation === 'sendPrivateMessage') {
						const userId = this.getNodeParameter('userId', i) as string;
						const messageType = this.getNodeParameter('messageType', i) as string;
						const messageContent = this.getNodeParameter('messageContent', i) as string;

						const additionalParams: Record<string, any> = {};
						if (messageType === 'reply') {
							additionalParams.replyMessageId = this.getNodeParameter('replyMessageId', i);
						} else if (messageType === 'music') {
							additionalParams.musicId = this.getNodeParameter('musicId', i);
						} else if (messageType === 'custom_music') {
							additionalParams.customMusicData = this.getNodeParameter('customMusicData', i);
						} else if (messageType === 'forward') {
							additionalParams.forwardMessageId = this.getNodeParameter('forwardMessageId', i);
						}

						const message = buildMessage(messageType, messageContent, additionalParams);

						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/send_private_msg'),
							body: {
								user_id: userId,
								message,
							},
						});
					} else if (operation === 'sendGroupMessage') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const messageType = this.getNodeParameter('messageType', i) as string;
						const messageContent = this.getNodeParameter('messageContent', i) as string;

						const additionalParams: Record<string, any> = {};
						if (messageType === 'reply') {
							additionalParams.replyMessageId = this.getNodeParameter('replyMessageId', i);
						} else if (messageType === 'music') {
							additionalParams.musicId = this.getNodeParameter('musicId', i);
						} else if (messageType === 'custom_music') {
							additionalParams.customMusicData = this.getNodeParameter('customMusicData', i);
						} else if (messageType === 'forward') {
							additionalParams.forwardMessageId = this.getNodeParameter('forwardMessageId', i);
						}

						const message = buildMessage(messageType, messageContent, additionalParams);

						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/send_group_msg'),
							body: {
								group_id: groupId,
								message,
							},
						});
					} else if (operation === 'recallMessage') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/delete_msg'),
							body: { message_id: messageId },
						});
					} else if (operation === 'getGroupHistory') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const count = this.getNodeParameter('count', i) || 20;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_msg_history'),
							body: { group_id: groupId, count },
						});
					} else if (operation === 'getFriendHistory') {
						const userId = this.getNodeParameter('userId', i) as string;
						const count = this.getNodeParameter('count', i) || 20;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_private_msg_history'),
							body: { user_id: userId, count },
						});
					} else if (operation === 'getMessageDetail') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_msg'),
							body: { message_id: messageId },
						});
					} else if (operation === 'sendPoke') {
						const targetId = this.getNodeParameter('targetId', i) as string;
						const pokeType = this.getNodeParameter('pokeType', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/send_poke'),
							body: { target_id: targetId, poke_type: pokeType },
						});
					} else if (operation === 'stickExpression') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const faceId = this.getNodeParameter('faceId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/stick_expression'),
							body: { message_id: messageId, face_id: faceId },
						});
					}
				}

				// 群聊相关接口
				if (resource === 'group') {
					if (operation === 'getGroupInfo') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_info'),
							body: { group_id: groupId },
						});
					} else if (operation === 'getGroupList') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_list'),
							body: {},
						});
					} else if (operation === 'getGroupDetailInfo') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_detail_info'),
							body: { group_id: groupId },
						});
					} else if (operation === 'getGroupMemberInfo') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_member_info'),
							body: { group_id: groupId, user_id: userId },
						});
					} else if (operation === 'getGroupMemberList') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_member_list'),
							body: { group_id: groupId },
						});
					} else if (operation === 'setGroupName') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const groupName = this.getNodeParameter('groupName', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_name'),
							body: { group_id: groupId, group_name: groupName },
						});
					} else if (operation === 'setGroupAdmin') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						const enable = this.getNodeParameter('enable', i) as boolean;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_admin'),
							body: { group_id: groupId, user_id: userId, enable },
						});
					} else if (operation === 'setGroupCard') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						const card = this.getNodeParameter('card', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_card'),
							body: { group_id: groupId, user_id: userId, card },
						});
					} else if (operation === 'kickGroupMember') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						const rejectAddAgain = this.getNodeParameter('rejectAddAgain', i, false) as boolean;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_kick'),
							body: { group_id: groupId, user_id: userId, reject_add_again: rejectAddAgain },
						});
					} else if (operation === 'banGroupMember') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						const duration = this.getNodeParameter('duration', i, 0) as number;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_ban'),
							body: { group_id: groupId, user_id: userId, duration },
						});
					} else if (operation === 'banGroupWhole') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const enable = this.getNodeParameter('enable', i) as boolean;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_whole_ban'),
							body: { group_id: groupId, enable },
						});
					} else if (operation === 'leaveGroup') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const isDismiss = this.getNodeParameter('isDismiss', i, false) as boolean;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_leave'),
							body: { group_id: groupId, is_dismiss: isDismiss },
						});
					} else if (operation === 'groupSign') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/set_group_sign'),
							body: { group_id: groupId },
						});
					}
				}

				// 文件相关接口
				if (resource === 'file') {
					if (operation === 'getGroupFileSystemInfo') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_file_system_info'),
							body: { group_id: groupId },
						});
					} else if (operation === 'getGroupFiles') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_group_root_files'),
							body: { group_id: groupId },
						});
					} else if (operation === 'uploadGroupFile') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const file = this.getNodeParameter('file', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/upload_group_file'),
							body: { group_id: groupId, file, name },
						});
					} else if (operation === 'deleteGroupFile') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const fileId = this.getNodeParameter('fileId', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/delete_group_file'),
							body: { group_id: groupId, file_id: fileId },
						});
					} else if (operation === 'uploadPrivateFile') {
						const userId = this.getNodeParameter('userId', i) as string;
						const file = this.getNodeParameter('file', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/upload_private_file'),
							body: { user_id: userId, file, name },
						});
					}
				}

				// 密钥相关接口
				if (resource === 'key') {
					if (operation === 'getCookies') {
						const domain = this.getNodeParameter('domain', i, '') as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_cookies'),
							body: { domain },
						});
					} else if (operation === 'getCsrfToken') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_csrf_token'),
							body: {},
						});
					}
				}

				// 系统操作接口
				if (resource === 'system') {
					if (operation === 'getVersionInfo') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_version_info'),
							body: {},
						});
					} else if (operation === 'botExit') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/bot_exit'),
							body: {},
						});
					}
				}

				// 其他接口
				if (resource === 'other') {
					if (operation === 'checkUrlSafely') {
						const url = this.getNodeParameter('url', i) as string;
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/check_url_safely'),
							body: { url },
						});
					} else if (operation === 'getCollectionList') {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'napCatApi', {
							method: 'POST',
							url: buildUrl('/get_collection_list'),
							body: {},
						});
					}
				}

				returnData.push({ json: responseData });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
