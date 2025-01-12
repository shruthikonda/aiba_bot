import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { MockChatService as ChatService } from '../../services/mock-chat.service';
import { ChatMessage, UserInfo } from '../../interfaces/chat.interface';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent, ChatInputComponent],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements AfterViewChecked {
  messages: ChatMessage[] = [];
  @Input() systemError: boolean = false;
  @Output() toggleChat = new EventEmitter<void>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild(ChatInputComponent) private chatInput!: ChatInputComponent;
  
  userInfo: UserInfo | null = null;
  tempUserInfo: UserInfo = { name: '', email: '' };
  botName: string = 'AIBA';
  emailError: string = '';
  isLoading: boolean = false;
  chatEnded: boolean = false;

  constructor(private chatService: ChatService) {
    this.chatService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        if (messages.length > 0) {
          const storedUserInfo = this.chatService.getUserInfo();
          if (storedUserInfo) {
            this.userInfo = storedUserInfo;
          }
        }
      },
      error: (error) => {
        console.error('Message subscription error:', error);
        this.systemError = true;
      }
    });

    this.chatService.getBotName().subscribe(name => {
      this.botName = name;
    });
    
    this.chatService.getLoadingState().subscribe(state => {
      this.isLoading = state;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    if (this.chatInput) {
      this.chatService.setChatInput(this.chatInput);
    }
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {}
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  async registerUser() {
    if (!this.tempUserInfo.name.trim()) {
      return;
    }

    if (!this.validateEmail(this.tempUserInfo.email)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.emailError = '';
    this.userInfo = { ...this.tempUserInfo };
    await this.chatService.setUserInfo(this.userInfo);
    const greeting = `Hi ${this.userInfo.name}! 👋 How can I help you today? 😊`;
    await this.chatService.sendBotMessage(greeting);
  }

  async endChat() {
    this.chatEnded = true;
    await this.chatService.endChat();
  }

  async onSendMessage(content: string) {
    this.chatEnded = false; // Reset chatEnded when user sends a new message
    await this.chatService.sendMessage(content);
  }
}