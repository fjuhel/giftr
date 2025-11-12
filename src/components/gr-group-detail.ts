import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { User } from 'firebase/auth';
import { GroupService } from '../services/group-service';
import { InvitationService } from '../services/invitation-service';
import { UserService, type UserProfile } from '../services/user-service';
import grAppMobx from '../states/gr-app-mobx';
import type { Group } from '../models/group';
import './gr-group-chat';

@customElement('gr-group-detail')
export class GrGroupDetail extends LitElement {
  @property({ type: String }) groupId = '';
  @property({ type: Object }) user: User | null = null;

  @state() private loading = true;
  @state() private group: Group | null = null;
  @state() private error = '';
  @state() private isCreator = false;
  @state() private showInviteModal = false;
  @state() private inviteLink = '';
  @state() private copySuccess = false;
  @state() private launching = false;
  @state() private participantProfiles: Map<string, UserProfile> = new Map();

  @query('#invite-link-input') inviteLinkInput?: HTMLInputElement;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    /* Header */
    .header {
      background: linear-gradient(
        135deg,
        #0f172a 0%,
        #1e293b 50%,
        #334155 100%
      );
      padding: 24px;
      color: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .back-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9375rem;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .group-header {
      flex: 1;
    }

    .group-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      margin: 0 0 8px 0;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .group-subtitle {
      font-size: 0.9375rem;
      opacity: 0.8;
      margin: 0;
    }

    /* Container */
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    /* Stats Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 4px 0;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }

    /* Action Buttons */
    .actions {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9375rem;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
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

    .btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .btn-secondary:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .btn-danger {
      background: white;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .btn-danger:hover {
      background: #fef2f2;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Sections */
    .section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 20px 0;
      color: #1a1a1a;
    }

    /* Participants List */
    .participants-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .participant-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .participant-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      font-size: 0.875rem;
    }

    .participant-info {
      flex: 1;
    }

    .participant-name {
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 2px 0;
    }

    .participant-email {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .participant-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
    }

    .remove-button {
      padding: 6px 12px;
      background: transparent;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .remove-button:hover {
      background: #fef2f2;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    /* Modal */
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
      padding: 20px;
    }

    .modal {
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .invite-link-container {
      display: flex;
      gap: 8px;
      margin: 16px 0;
    }

    .invite-link-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      background: #f9fafb;
    }

    .copy-button {
      padding: 12px 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .copy-button:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-1px);
    }

    .copy-button.success {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top-color: #ef4444;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Error */
    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    /* Info Box */
    .info-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .info-box strong {
      font-weight: 600;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.groupId) {
      this.loadGroup();
    }
  }

  async loadGroup() {
    this.loading = true;
    this.error = '';

    try {
      this.group = await GroupService.getGroup(this.groupId);

      if (!this.group) {
        this.error = 'Groupe non trouvé';
        return;
      }

      this.isCreator = this.user
        ? await GroupService.isCreator(this.groupId, this.user.uid)
        : false;

      // Load participant profiles
      this.participantProfiles = await UserService.getUserProfiles(
        this.group.participants
      );
    } catch (err) {
      console.error('Error loading group:', err);
      this.error = 'Erreur lors du chargement du groupe';
    } finally {
      this.loading = false;
    }
  }

  private handleBack() {
    grAppMobx.navigate('/');
  }

  private async handleInvite() {
    try {
      const linkId = await InvitationService.createInviteLink(
        this.groupId,
        this.user!.uid,
        { expiresInDays: 30 }
      );
      this.inviteLink = InvitationService.generateInviteUrl(linkId);
      this.showInviteModal = true;
    } catch (err) {
      console.error('Error creating invite link:', err);
      this.error = "Erreur lors de la création du lien d'invitation";
    }
  }

  private async handleCopyLink() {
    try {
      await navigator.clipboard.writeText(this.inviteLink);
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  }

  private closeInviteModal() {
    this.showInviteModal = false;
    this.copySuccess = false;
  }

  private async handleLaunchDraw() {
    if (!this.group) return;

    if (this.group.participants.length < 3) {
      this.error =
        'Vous devez avoir au moins 3 participants pour lancer le tirage';
      return;
    }

    if (
      !confirm(
        'Êtes-vous sûr de vouloir lancer le tirage ? Cette action est irréversible.'
      )
    ) {
      return;
    }

    this.launching = true;
    this.error = '';

    try {
      // TODO: Implement draw algorithm
      await GroupService.markAsDrawn(this.groupId);
      await this.loadGroup();
      alert('Tirage effectué avec succès ! 🎉');
    } catch (err) {
      console.error('Error launching draw:', err);
      this.error = 'Erreur lors du lancement du tirage';
    } finally {
      this.launching = false;
    }
  }

  private async handleRemoveParticipant(participantId: string) {
    if (!this.group || !this.isCreator) return;

    if (participantId === this.group.createdBy) {
      alert('Vous ne pouvez pas retirer le créateur du groupe');
      return;
    }

    if (
      !confirm('Êtes-vous sûr de vouloir retirer ce participant du groupe ?')
    ) {
      return;
    }

    try {
      await GroupService.removeParticipant(this.groupId, participantId);
      await this.loadGroup();
    } catch (err) {
      console.error('Error removing participant:', err);
      this.error = 'Erreur lors de la suppression du participant';
    }
  }

  private async handleDeleteGroup() {
    if (!this.group || !this.isCreator) return;

    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.'
      )
    ) {
      return;
    }

    try {
      await GroupService.deleteGroup(this.groupId);
      this.handleBack();
    } catch (err) {
      console.error('Error deleting group:', err);
      this.error = 'Erreur lors de la suppression du groupe';
    }
  }

  private getParticipantProfile(participantId: string) {
    return this.participantProfiles.get(participantId);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <div class="loading-spinner"></div>
        </div>
      `;
    }

    if (this.error && !this.group) {
      return html`
        <div class="container">
          <div class="error-message">${this.error}</div>
          <button class="btn-secondary" @click=${this.handleBack}>
            Retour au tableau de bord
          </button>
        </div>
      `;
    }

    if (!this.group) {
      return html`<div class="container">Groupe non trouvé</div>`;
    }

    return html`
      <div class="header">
        <div class="header-content">
          <button class="back-button" @click=${this.handleBack}>
            <span>←</span>
            <span>Retour</span>
          </button>
          <div class="group-header">
            <h1 class="group-title">${this.group.name}</h1>
            ${this.group.description
              ? html`<p class="group-subtitle">${this.group.description}</p>`
              : ''}
          </div>
        </div>
      </div>

      <div class="container">
        ${this.error
          ? html`<div class="error-message">${this.error}</div>`
          : ''}

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <p class="stat-label">Participants</p>
            <p class="stat-value">${this.group.participants.length}</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <p class="stat-label">Budget</p>
            <p class="stat-value">${this.group.budget}€</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <p class="stat-label">Date de l'événement</p>
            <p class="stat-value">
              ${new Date(this.group.eventDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
          <div class="stat-card">
            <div class="stat-icon">${this.group.isDrawn ? '✅' : '⏳'}</div>
            <p class="stat-label">Statut</p>
            <p class="stat-value">
              ${this.group.isDrawn ? 'Tiré' : 'En attente'}
            </p>
          </div>
        </div>

        <!-- Actions -->
        ${this.isCreator
          ? html`
              <div class="actions">
                <button class="btn-primary" @click=${this.handleInvite}>
                  <span>✉️</span>
                  <span>Inviter des participants</span>
                </button>
                ${!this.group.isDrawn
                  ? html`
                      <button
                        class="btn-secondary"
                        @click=${this.handleLaunchDraw}
                        ?disabled=${this.launching ||
                        this.group.participants.length < 3}
                      >
                        <span>🎲</span>
                        <span
                          >${this.launching
                            ? 'Tirage en cours...'
                            : 'Lancer le tirage'}</span
                        >
                      </button>
                    `
                  : ''}
                <button class="btn-danger" @click=${this.handleDeleteGroup}>
                  <span>🗑️</span>
                  <span>Supprimer le groupe</span>
                </button>
              </div>
            `
          : ''}

        <!-- Draw Info -->
        ${!this.group.isDrawn
          ? html`
              <div class="info-box">
                <strong>🎲 À propos du tirage au sort :</strong><br />
                Le tirage assignera aléatoirement un Secret Santa à chaque
                participant. Personne ne peut se tirer soi-même. Une fois le
                tirage effectué, chaque participant verra qui il doit gâter !
                ${this.group.participants.length < 3
                  ? html`<br /><br /><strong
                        >⚠️ Vous devez avoir au moins 3 participants pour lancer
                        le tirage.</strong
                      >`
                  : ''}
              </div>
            `
          : ''}

        <!-- Participants -->
        <div class="section">
          <h2 class="section-title">
            Participants (${this.group.participants.length})
          </h2>

          ${this.group.participants.length > 0
            ? html`
                <div class="participants-list">
                  ${this.group.participants.map((participantId) => {
                    const profile = this.getParticipantProfile(participantId);
                    const displayName = profile
                      ? UserService.getDisplayName(profile)
                      : 'Chargement...';
                    const initials = profile
                      ? UserService.getInitials(profile)
                      : '?';
                    const email = profile?.email || '';

                    return html`
                      <div class="participant-card">
                        <div class="participant-avatar">${initials}</div>
                        <div class="participant-info">
                          <p class="participant-name">${displayName}</p>
                          ${email
                            ? html`<p class="participant-email">${email}</p>`
                            : ''}
                        </div>
                        ${participantId === this.group!.createdBy
                          ? html`<span class="participant-badge"
                              >Créateur</span
                            >`
                          : ''}
                        ${this.isCreator &&
                        participantId !== this.group!.createdBy
                          ? html`
                              <button
                                class="remove-button"
                                @click=${() =>
                                  this.handleRemoveParticipant(participantId)}
                              >
                                Retirer
                              </button>
                            `
                          : ''}
                      </div>
                    `;
                  })}
                </div>
              `
            : html`
                <div class="empty-state">
                  <div class="empty-icon">👥</div>
                  <p>Aucun participant pour le moment</p>
                </div>
              `}
        </div>

        <!-- Group Chat -->
        <div class="section" style="height: 600px;">
          <gr-group-chat
            .groupId=${this.groupId}
            .groupName=${this.group.name}
            .user=${this.user}
            style="height: 100%;"
          ></gr-group-chat>
        </div>
      </div>

      <!-- Invite Modal -->
      ${this.showInviteModal
        ? html`
            <div class="modal-overlay" @click=${this.closeInviteModal}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                <h2 class="modal-title">Inviter des participants</h2>
                <p>
                  Partagez ce lien avec les personnes que vous souhaitez inviter
                  :
                </p>
                <div class="invite-link-container">
                  <input
                    id="invite-link-input"
                    class="invite-link-input"
                    type="text"
                    readonly
                    .value=${this.inviteLink}
                  />
                  <button
                    class="copy-button ${this.copySuccess ? 'success' : ''}"
                    @click=${this.handleCopyLink}
                  >
                    ${this.copySuccess ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
                <p
                  style="font-size: 0.875rem; color: #6b7280; margin-top: 12px;"
                >
                  Ce lien expire dans 30 jours
                </p>
                <div class="modal-actions">
                  <button
                    class="btn-secondary"
                    style="flex: 1"
                    @click=${this.closeInviteModal}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          `
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-group-detail': GrGroupDetail;
  }
}
