import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Group } from '../models/group';
import type { User } from 'firebase/auth';
import { InvitationService } from '../services/invitation-service';

@customElement('gr-invite-modal')
export class GrInviteModal extends LitElement {
  @property({ type: Object }) group!: Group;
  @property({ type: Object }) user!: User;
  @state() private open = false;
  @state() private loading = false;
  @state() private inviteLink = '';
  @state() private copied = false;
  @state() private emailInput = '';
  @state() private emailError = '';

  static styles = css`
    :host {
      display: block;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
      padding: 20px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal {
      background: white;
      border-radius: 16px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: #1a1a1a;
      letter-spacing: -0.02em;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    .modal-body {
      padding: 24px;
    }

    .section {
      margin-bottom: 24px;
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: #374151;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .link-container {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    input[type='text'],
    input[type='email'] {
      flex: 1;
      padding: 12px;
      border: 1.5px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-family: inherit;
      transition: all 0.2s;
    }

    input[type='text']:focus,
    input[type='email']:focus {
      outline: none;
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    input[readonly] {
      background: #f9fafb;
      cursor: pointer;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9375rem;
      transition: all 0.2s;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .hint {
      font-size: 0.8125rem;
      color: #6b7280;
      margin-top: 8px;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .success-message {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 24px 0;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 600px) {
      .modal {
        margin: 0;
        max-height: 100vh;
        border-radius: 0;
      }

      .link-container {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  `;

  public async show() {
    this.open = true;
    this.copied = false;
    this.emailInput = '';
    this.emailError = '';
    await this.generateInviteLink();
  }

  private handleClose() {
    if (!this.loading) {
      this.open = false;
    }
  }

  private handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.handleClose();
    }
  }

  private async generateInviteLink() {
    this.loading = true;
    try {
      const linkId = await InvitationService.createInviteLink(
        this.group.id,
        this.user.uid,
        {
          expiresInDays: 30,
        }
      );
      this.inviteLink = InvitationService.generateInviteUrl(linkId);
    } catch (err) {
      console.error('Error generating invite link:', err);
    } finally {
      this.loading = false;
    }
  }

  private async handleCopyLink() {
    try {
      await navigator.clipboard.writeText(this.inviteLink);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 3000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private async handleSendEmail() {
    this.emailError = '';

    if (!this.emailInput.trim()) {
      this.emailError = "L'email est requis";
      return;
    }

    if (!this.validateEmail(this.emailInput)) {
      this.emailError = 'Email invalide';
      return;
    }

    this.loading = true;

    try {
      await InvitationService.sendEmailInvitation(
        this.emailInput,
        this.group.name,
        this.user.displayName || this.user.email || 'Un ami',
        this.inviteLink
      );

      // Show success
      this.emailInput = '';
      // In a real app, you'd show a success message
      alert(
        `Lien copié dans le presse-papier!\nPartagez-le à ${this.emailInput}`
      );
    } catch (err) {
      console.error('Error sending invitation:', err);
      this.emailError = "Erreur lors de l'envoi";
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (!this.open) {
      return html``;
    }

    return html`
      <div class="modal-overlay" @click=${this.handleOverlayClick}>
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">👥 Inviter des participants</h2>
            <p class="modal-subtitle">${this.group.name}</p>
          </div>

          <div class="modal-body">
            <div class="section">
              <div class="section-title">
                <span>🔗</span>
                <span>Lien d'invitation</span>
              </div>
              ${this.loading
                ? html`<div style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div>
                  </div>`
                : html`
                    <div class="link-container">
                      <input
                        type="text"
                        .value=${this.inviteLink}
                        readonly
                        @click=${this.handleCopyLink}
                      />
                      <button
                        class=${this.copied ? 'btn-success' : 'btn-primary'}
                        @click=${this.handleCopyLink}
                      >
                        ${this.copied ? '✓ Copié' : 'Copier'}
                      </button>
                    </div>
                    <div class="hint">
                      Partagez ce lien avec vos amis. Valable 30 jours.
                    </div>
                  `}
            </div>

            <div class="divider"></div>

            <div class="section">
              <div class="section-title">
                <span>📧</span>
                <span>Inviter par email</span>
              </div>
              <div class="link-container">
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  .value=${this.emailInput}
                  @input=${(e: InputEvent) =>
                    (this.emailInput = (e.target as HTMLInputElement).value)}
                  ?disabled=${this.loading}
                />
                <button
                  class="btn-primary"
                  @click=${this.handleSendEmail}
                  ?disabled=${this.loading || !this.emailInput.trim()}
                >
                  Envoyer
                </button>
              </div>
              ${this.emailError
                ? html`<div class="error-message">${this.emailError}</div>`
                : ''}
              <div class="hint">
                Un lien d'invitation sera copié dans votre presse-papier
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn-secondary"
              @click=${this.handleClose}
              ?disabled=${this.loading}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-invite-modal': GrInviteModal;
  }
}
