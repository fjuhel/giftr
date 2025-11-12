import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import type { User } from 'firebase/auth';
import { InvitationService } from '../services/invitation-service';
import { GroupService } from '../services/group-service';
import type { Group } from '../models/group';

@customElement('gr-join-group')
export class GrJoinGroup extends LitElement {
  @property({ type: String }) linkId = '';
  @property({ type: Object }) user: User | null = null;

  @state() private loading = true;
  @state() private error = '';
  @state() private group: Group | null = null;
  @state() private joined = false;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px;
    }

    .container {
      max-width: 500px;
      margin: 80px auto;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 1.875rem;
      margin: 0 0 16px 0;
      color: #1a1a1a;
      font-weight: 700;
    }

    p {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 24px 0;
      line-height: 1.6;
    }

    .group-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 12px;
      margin: 24px 0;
      text-align: left;
    }

    .group-info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 0.9375rem;
      color: #374151;
    }

    .group-info-item:last-child {
      margin-bottom: 0;
    }

    .group-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
    }

    button {
      padding: 12px 32px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.2s;
      letter-spacing: -0.01em;
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
      margin-left: 12px;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .loading-spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top-color: #ef4444;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 40px auto;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.linkId) {
      this.validateAndLoadGroup(this.linkId, this.user);
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('linkId') && this.linkId) {
      this.validateAndLoadGroup(this.linkId, this.user);
    }
  }

  async validateAndLoadGroup(inviteId: string, user: User | null) {
    this.loading = true;
    this.error = '';

    try {
      // Validate the invite link
      const validation = await InvitationService.validateInviteLink(inviteId);

      if (!validation.valid) {
        this.error = validation.reason || "Lien d'invitation invalide";
        this.loading = false;
        return;
      }

      // Load group details
      if (validation.groupId) {
        this.group = await GroupService.getGroup(validation.groupId);

        if (!this.group) {
          this.error = 'Groupe non trouvé';
          this.loading = false;
          return;
        }

        // Check if user is already a member
        if (user && this.group.participants.includes(user.uid)) {
          this.joined = true;
        }
      }
    } catch (err) {
      console.error('Error validating invite:', err);
      this.error = "Erreur lors de la validation de l'invitation";
    } finally {
      this.loading = false;
    }
  }

  async joinGroup(inviteId: string, user: User) {
    this.loading = true;
    this.error = '';

    try {
      if (!this.group) {
        throw new Error('No group loaded');
      }

      // Add user to group
      await GroupService.addParticipant(this.group.id, user.uid);

      // Use the invite link
      await InvitationService.useInviteLink(inviteId);

      this.joined = true;

      // Dispatch event to navigate to dashboard
      setTimeout(() => {
        this.dispatchEvent(
          new CustomEvent('group-joined', {
            bubbles: true,
            composed: true,
            detail: { groupId: this.group!.id },
          })
        );
      }, 2000);
    } catch (err: any) {
      console.error('Error joining group:', err);
      if (err.message.includes('already in group')) {
        this.joined = true;
      } else {
        this.error = "Erreur lors de l'adhésion au groupe";
      }
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="card">
          ${this.loading
            ? html`<div class="loading-spinner"></div>`
            : this.error
            ? html`
                <div class="icon">⚠️</div>
                <h1>Invitation invalide</h1>
                <div class="error">${this.error}</div>
                <p>
                  Ce lien d'invitation n'est plus valide. Demandez un nouveau
                  lien à l'organisateur du groupe.
                </p>
              `
            : this.joined
            ? html`
                <div class="icon">🎉</div>
                <h1>Vous êtes dans le groupe!</h1>
                <div class="success">
                  Vous faites maintenant partie de "${this.group?.name}"
                </div>
                <p>Redirection vers le tableau de bord...</p>
              `
            : this.group
            ? html`
                <div class="icon">🎁</div>
                <h1>Invitation à rejoindre un groupe</h1>
                <p>Vous êtes invité à participer à ce Secret Santa!</p>

                <div class="group-info">
                  <div class="group-name">${this.group.name}</div>
                  ${this.group.description
                    ? html`<p style="margin: 0 0 16px 0; color: #6b7280;">
                        ${this.group.description}
                      </p>`
                    : ''}
                  <div class="group-info-item">
                    <span>👥</span>
                    <span>${this.group.participants.length} participants</span>
                  </div>
                  <div class="group-info-item">
                    <span>💰</span>
                    <span>Budget: ${this.group.budget}€</span>
                  </div>
                  <div class="group-info-item">
                    <span>📅</span>
                    <span
                      >${new Date(this.group.eventDate).toLocaleDateString(
                        'fr-FR',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}</span
                    >
                  </div>
                </div>

                ${this.user
                  ? html`
                      <button
                        class="btn-primary"
                        @click=${() => this.joinGroup(this.linkId, this.user!)}
                        ?disabled=${this.loading}
                      >
                        Rejoindre le groupe
                      </button>
                    `
                  : html`
                      <p style="margin-top: 24px;">
                        Connectez-vous pour rejoindre ce groupe
                      </p>
                    `}
              `
            : html`
                <div class="icon">❓</div>
                <h1>Invitation non trouvée</h1>
                <p>Impossible de charger les détails de l'invitation.</p>
              `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-join-group': GrJoinGroup;
  }
}
