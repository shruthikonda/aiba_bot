export interface ChatConfig {
  clientId: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  initialMessage?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

export interface HandshakeResponse {
  token: string;
  botName: string;
  contactNumber: string;
  emailId: string;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface ChatSession {
  sessionId: string;
  startTime: Date;
  lastActive: Date;
  userInfo: UserInfo | null;
  messages: ChatMessage[];
}