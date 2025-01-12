import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent {
  @Input() disabled: boolean = false;
  @Output() send = new EventEmitter<string>();
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;
  messageText = '';

  sendMessage() {
    if (this.messageText.trim() && !this.disabled) {
      this.send.emit(this.messageText);
      this.messageText = '';
    }
  }

  focus() {
    this.messageInput.nativeElement.focus();
  }
}