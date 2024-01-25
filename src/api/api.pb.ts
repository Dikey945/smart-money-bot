export interface User {
  userTgId?: number;
  firstName?: string;
  userTag?: string;
  chatId?: number;
  isPremium?: boolean;
  // clientGroups: ClientGroup[];
}

export interface createClientGroupRequest {
  channelId?: number;
  channelName?: string;
  link?: string;
  counter?: number;
  maxFollowerValue?: number;
  ownerId?: number;
}