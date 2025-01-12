import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, HandshakeResponse, UserInfo, ChatSession } from '../interfaces/chat.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class MockChatService {
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  private botName = new BehaviorSubject<string>('AIBA');
  private isLoading = new BehaviorSubject<boolean>(false);
  private isSystemDown = false;
  private shouldFailChat = false;
  private chatInput: any = null;
  private currentSession: ChatSession | null = null;
  
  private readonly MOCK_DELAY = 1000;
  private readonly MOCK_TYPING_DELAY = 2000;
  
  private readonly MOCK_HANDSHAKE_RESPONSE: HandshakeResponse = {
    token: 'mock-jwt-token',
    botName: 'AIBA',
    contactNumber: '+1 (555) 123-4567',
    emailId: 'support@integrifyai.com'
  };

  constructor(private storageService: StorageService) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const session = this.storageService.getSession();
    if (session) {
      this.currentSession = session;
      this.messages.next(session.messages);
    }
  }

  private updateSession(messages: ChatMessage[]): void {
    if (!this.currentSession) {
      this.currentSession = {
        sessionId: `session-${Date.now()}`,
        startTime: new Date(),
        lastActive: new Date(),
        userInfo: this.storageService.getUserInfo(),
        messages: []
      };
    }

    this.currentSession.lastActive = new Date();
    this.currentSession.messages = messages;
    this.storageService.saveSession(this.currentSession);
  }

  getMessages(): Observable<ChatMessage[]> {
    return this.messages.asObservable();
  }

  getBotName(): Observable<string> {
    return this.botName.asObservable();
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  getUserInfo(): UserInfo | null {
    return this.storageService.getUserInfo();
  }

  setChatInput(input: any) {
    this.chatInput = input;
  }

  async initializeChat(clientId: string): Promise<void> {
    this.isLoading.next(true);
    
    try {
      if (this.isSystemDown) {
        await this.simulateDelay();
        throw new Error('System under maintenance');
      }

      await this.simulateDelay();
      this.botName.next(this.MOCK_HANDSHAKE_RESPONSE.botName);
      
    } finally {
      this.isLoading.next(false);
    }
  }

  async setUserInfo(userInfo: UserInfo): Promise<void> {
    await this.simulateDelay();
    this.storageService.saveUserInfo(userInfo);
    if (this.currentSession) {
      this.currentSession.userInfo = userInfo;
      this.storageService.saveSession(this.currentSession);
    }
  }

  async sendBotMessage(content: string): Promise<void> {
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'bot',
      timestamp: new Date()
    };
    const updatedMessages = [...this.messages.value, botMessage];
    this.messages.next(updatedMessages);
    this.updateSession(updatedMessages);
  }

  async sendMessage(content: string): Promise<void> {
    this.isLoading.next(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...this.messages.value, userMessage];
    this.messages.next(updatedMessages);
    this.updateSession(updatedMessages);

    const typingMessage: ChatMessage = {
      id: 'typing-' + Date.now(),
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    
    this.messages.next([...updatedMessages, typingMessage]);

    try {
      if (this.shouldFailChat) {
        await this.simulateDelay();
        throw new Error('Chat API error');
      }

      await this.simulateDelay(this.MOCK_TYPING_DELAY);
      
      const messages = updatedMessages;
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Mock response: ${content}`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      const finalMessages = [...messages, botMessage];
      this.messages.next(finalMessages);
      this.updateSession(finalMessages);
    } catch (error) {
      const errorMessage = `I am having some trouble now. Please contact our team at Phone: ${this.MOCK_HANDSHAKE_RESPONSE.contactNumber} or Email: ${this.MOCK_HANDSHAKE_RESPONSE.emailId}`;
      const messages = updatedMessages;
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      const finalMessages = [...messages, botMessage];
      this.messages.next(finalMessages);
      this.updateSession(finalMessages);
    } finally {
      this.isLoading.next(false);
      if (this.chatInput) {
        setTimeout(() => {
          this.chatInput.focus();
        }, 0);
      }
    }
  }

  async endChat(): Promise<void> {
    await this.sendBotMessage("This conversation has been ended, if you need any further assistance, please let me know.");
    this.storageService.clearStorage();
    this.currentSession = null;
  }

  private simulateDelay(ms: number = this.MOCK_DELAY): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setSystemDown(isDown: boolean): void {
    this.isSystemDown = isDown;
  }

  setChatFailure(shouldFail: boolean): void {
    this.shouldFailChat = shouldFail;
  }
}