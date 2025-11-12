import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { User } from 'firebase/auth';
import { MessageService } from '../services/message-service';
import { UserService } from '../services/user-service';
import type { Message } from '../models/message';

@customElement('gr-group-chat')
export class GrGroupChat extends LitElement {
  @property({ type: String }) groupId = '';
  @property({ type: String }) groupName = '';
  @property({ type: Object }) user: User | null = null;

  @state() private messages: Message[] = [];
  @state() private messageText = '';
  @state() private sending = false;

  @query('#message-input') messageInput?: HTMLTextAreaElement;
  @query('.messages-container') messagesContainer?: HTMLElement;

  private unsubscribe?: () => void;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Header */
    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    }

    .chat-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chat-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    /* Messages */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #f9fafb;
    }

    .messages-container::-webkit-scrollbar {
      width: 8px;
    }

    .messages-container::-webkit-scrollbar-track {
      background: #f3f4f6;
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 4px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    /* Message */
    .message {
      display: flex;
      gap: 12px;
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.own {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .message.own .message-avatar {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .message-content {
      flex: 1;
      max-width: 70%;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .message.own .message-header {
      flex-direction: row-reverse;
    }

    .message-sender {
      font-weight: 600;
      font-size: 0.875rem;
      color: #374151;
    }

    .message-time {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .message-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      background: white;
      border: 1px solid #e5e7eb;
      word-wrap: break-word;
      white-space: pre-wrap;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: #1a1a1a;
    }

    .message.own .message-bubble {
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      color: white;
      border: none;
    }

    /* Empty State */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.9375rem;
    }

    /* Input */
    .chat-input {
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }

    .input-container {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    textarea {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.9375rem;
      resize: none;
      min-height: 44px;
      max-height: 120px;
      transition: all 0.2s;
    }

    textarea:focus {
      outline: none;
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    textarea::placeholder {
      color: #9ca3af;
    }

    .send-button {
      padding: 10px 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
      height: 44px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .send-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Date Separator */
    .date-separator {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 8px 0;
    }

    .date-separator::before,
    .date-separator::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    .date-separator span {
      font-size: 0.75rem;
      color: #9ca3af;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.groupId) {
      this.subscribeToMessages();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private subscribeToMessages() {
    this.unsubscribe = MessageService.subscribeToGroupMessages(
      this.groupId,
      (messages) => {
        this.messages = messages;
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => this.scrollToBottom(), 100);
      }
    );
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  private async handleSendMessage(e?: Event) {
    e?.preventDefault();

    if (!this.user || !this.messageText.trim() || this.sending) {
      return;
    }

    this.sending = true;

    try {
      const senderName = UserService.getDisplayName({
        uid: this.user.uid,
        email: this.user.email,
        displayName: this.user.displayName,
        photoURL: this.user.photoURL,
      });

      await MessageService.sendMessage({
        groupId: this.groupId,
        senderId: this.user.uid,
        senderName,
        text: this.messageText,
      });

      this.messageText = '';
      if (this.messageInput) {
        this.messageInput.style.height = 'auto';
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      this.sending = false;
      this.messageInput?.focus();
    }
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSendMessage();
    }
  }

  private handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.messageText = textarea.value;

    // Auto-resize textarea
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  private getInitials(name: string): string {
    return name
      .split(/[\s@]/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private isToday(timestamp: number): boolean {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private shouldShowDateSeparator(
    currentMsg: Message,
    prevMsg?: Message
  ): boolean {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  }

  render() {
    return html`
      <div class="chat-header">
        <div class="chat-title">
          <span>💬</span>
          <span>Chat du groupe</span>
        </div>
        <div class="chat-subtitle">${this.groupName}</div>
      </div>

      <div class="messages-container">
        ${this.messages.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-icon">💬</div>
                <p>Aucun message pour le moment</p>
                <p style="font-size: 0.875rem; margin-top: 8px;">
                  Soyez le premier à envoyer un message !
                </p>
              </div>
            `
          : this.messages.map((message, index) => {
              const isOwn = message.senderId === this.user?.uid;
              const showDateSep = this.shouldShowDateSeparator(
                message,
                this.messages[index - 1]
              );

              return html`
                ${showDateSep
                  ? html`
                      <div class="date-separator">
                        <span>
                          ${this.isToday(message.createdAt)
                            ? "Aujourd'hui"
                            : new Date(message.createdAt).toLocaleDateString(
                                'fr-FR',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                }
                              )}
                        </span>
                      </div>
                    `
                  : ''}
                <div class="message ${isOwn ? 'own' : ''}">
                  <div class="message-avatar">
                    ${this.getInitials(message.senderName)}
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      ${!isOwn
                        ? html`<span class="message-sender"
                            >${message.senderName}</span
                          >`
                        : ''}
                      <span class="message-time">
                        ${MessageService.formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                    <div class="message-bubble">${message.text}</div>
                  </div>
                </div>
              `;
            })}
      </div>

      <div class="chat-input">
        <form @submit=${this.handleSendMessage}>
          <div class="input-container">
            <textarea
              id="message-input"
              placeholder="Écrivez votre message..."
              .value=${this.messageText}
              @input=${this.handleInput}
              @keypress=${this.handleKeyPress}
              ?disabled=${this.sending || !this.user}
              rows="1"
            ></textarea>
            <button
              type="submit"
              class="send-button"
              ?disabled=${!this.messageText.trim() || this.sending}
            >
              <span>${this.sending ? '⏳' : '📤'}</span>
              <span>${this.sending ? 'Envoi...' : 'Envoyer'}</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-group-chat': GrGroupChat;
  }
}
