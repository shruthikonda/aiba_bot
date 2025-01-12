import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { ChatWidgetComponent } from './app/components/chat-widget/chat-widget.component';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatWidgetComponent],
  template: `
    <div>
      <h1>Welcome to {{ name }}!</h1>
      <app-chat-widget
        [config]="{
          clientId: 'demo-client',
          primaryColor: '#007bff',
          secondaryColor: '#e9ecef',
          position: 'bottom-right',
          initialMessage: 'Hello! How can I help you today?'
        }">
      </app-chat-widget>
    </div>
  `
})
export class App {
  name = 'Chat Widget Demo';
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});