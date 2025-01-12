import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ChatConfig } from '../../interfaces/chat.interface';
import { MockChatService as ChatService } from '../../services/mock-chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements OnInit {
  @Input() config?: ChatConfig;
  isOpen = false;
  systemError = false;

  constructor(private chatService: ChatService) {}

  async ngOnInit() {
    if (this.config?.clientId) {
      try {
        await this.chatService.initializeChat(this.config.clientId);
        
        if (this.config?.primaryColor) {
          document.documentElement.style.setProperty('--chat-primary-color', this.config.primaryColor);
        }
        if (this.config?.secondaryColor) {
          document.documentElement.style.setProperty('--chat-secondary-color', this.config.secondaryColor);
        }
      } catch (error) {
        this.systemError = true;
      }
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}