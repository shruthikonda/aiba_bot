import { Injectable } from '@angular/core';
import { ChatSession, UserInfo, ChatMessage } from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEYS = {
    SESSION: 'chat_session',
    USER: 'chat_user',
    LAST_CLEANUP: 'chat_last_cleanup'
  };

  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_MESSAGES = 100; // Maximum number of messages to store

  constructor() {
    this.performCleanup();
  }

  saveSession(session: ChatSession): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
      this.clearStorage(); // Clear storage if we hit quota limits
    }
  }

  getSession(): ChatSession | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as ChatSession;
      
      // Convert string dates back to Date objects
      session.startTime = new Date(session.startTime);
      session.lastActive = new Date(session.lastActive);
      session.messages = session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      // Check session validity
      if (this.isSessionExpired(session)) {
        this.clearStorage();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error retrieving session:', error);
      this.clearStorage();
      return null;
    }
  }

  saveUserInfo(userInfo: UserInfo): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  }

  getUserInfo(): UserInfo | null {
    try {
      const userInfo = localStorage.getItem(this.STORAGE_KEYS.USER);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error retrieving user info:', error);
      return null;
    }
  }

  clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEYS.SESSION);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
  }

  private isSessionExpired(session: ChatSession): boolean {
    const now = new Date().getTime();
    const lastActive = new Date(session.lastActive).getTime();
    return now - lastActive > this.SESSION_TIMEOUT;
  }

  private performCleanup(): void {
    try {
      const now = new Date().getTime();
      const lastCleanup = Number(localStorage.getItem(this.STORAGE_KEYS.LAST_CLEANUP)) || 0;

      // Only perform cleanup once every 24 hours
      if (now - lastCleanup > this.CLEANUP_INTERVAL) {
        const session = this.getSession();
        if (session && this.isSessionExpired(session)) {
          this.clearStorage();
        }
        localStorage.setItem(this.STORAGE_KEYS.LAST_CLEANUP, now.toString());
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}