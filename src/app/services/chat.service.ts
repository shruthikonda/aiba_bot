import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, HandshakeResponse, ChatResponse, UserInfo } from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  private botName = new BehaviorSubject<string>('AIBA');
  private isLoading = new BehaviorSubject<boolean>(false);
  private token: string | null = null;
  private sessionId: string | null = null;
  private userInfo: UserInfo | null = null;
  private chatInput: any = null;
  private contactNumber: string = '';
  private emailId: string = '';
  private readonly API_URL = 'https://aiba.integrifyai.com/api';
  
  constructor(private http: HttpClient) {}

  getMessages(): Observable<ChatMessage[]> {
    return this.messages.asObservable();
  }

  getBotName(): Observable<string> {
    return this.botName.asObservable();
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  setChatInput(input: any) {
    this.chatInput = input;
  }

  async initializeChat(clientId: string): Promise<void> {
    try {
      const response = await this.http.post<HandshakeResponse>(`${this.API_URL}/handshake`, {
        clientId
      }).toPromise();

      if (response) {
        this.token = response.token;
        this.botName.next(response.botName);
        this.contactNumber = response.contactNumber;
        this.emailId = response.emailId;
      }
    } catch (error) {
      console.error('Handshake failed:', error);
      throw error;
    }
  }

  async setUserInfo(userInfo: UserInfo): Promise<void> {
    this.userInfo = userInfo;
  }

  async sendBotMessage(content: string): Promise<void> {
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'bot',
      timestamp: new Date()
    };
    this.messages.next([...this.messages.value, botMessage]);
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.token) {
      throw new Error('Chat not initialized');
    }

    this.isLoading.next(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    const currentMessages = this.messages.value;
    this.messages.next([...currentMessages, userMessage]);

    const typingMessage: ChatMessage = {
      id: 'typing-' + Date.now(),
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    
    this.messages.next([...this.messages.value, typingMessage]);

    try {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      const response = await this.http.post<ChatResponse>(`${this.API_URL}/chat`, {
        message: content,
        sessionId: this.sessionId
      }, { headers }).toPromise();

      const messages = this.messages.value.filter(m => !m.isTyping);
      if (response) {
        this.sessionId = response.sessionId;
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          content: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.next([...messages, botMessage]);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage = `I am having some trouble now. Please contact our team at Phone: ${this.contactNumber} or Email: ${this.emailId}`;
      const messages = this.messages.value.filter(m => !m.isTyping);
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.next([...messages, botMessage]);
    } finally {
      this.isLoading.next(false);
      if (this.chatInput) {
        setTimeout(() => {
          this.chatInput.focus();
        }, 0);
      }
    }
  }
}