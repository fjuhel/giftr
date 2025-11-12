import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { GroupService } from '../services/group-service';
import grAppMobx from '../states/gr-app-mobx';
import type { Group } from '../models/group';
import type { GrCreateGroupModal } from './gr-create-group-modal';
import type { GrInviteModal } from './gr-invite-modal';
import './gr-create-group-modal';
import './gr-invite-modal';

@customElement('gr-dashboard')
export class GrDashboard extends LitElement {
  @property({ type: Object }) user!: User;

  @state() private groups: Group[] = [];
  @state() private loading = true;
  @state() private selectedGroup: Group | null = null;

  @query('gr-create-group-modal') private createModal!: GrCreateGroupModal;
  @query('gr-invite-modal') private inviteModal!: GrInviteModal;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      color: #1a1a1a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 16px 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(
        135deg,
        #ef4444 0%,
        #ec4899 50%,
        #8b5cf6 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9375rem;
      font-weight: 600;
      color: white;
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #ffffff;
    }

    .user-email {
      font-size: 0.8125rem;
      color: #cbd5e1;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.875rem;
      letter-spacing: -0.01em;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    /* Main Content */
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .welcome-message {
      margin-bottom: 32px;
    }

    .welcome-message h1 {
      font-size: clamp(1.875rem, 3vw, 2.25rem);
      margin: 0 0 8px 0;
      color: #1a1a1a;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .welcome-message p {
      font-size: 1rem;
      color: #6b7280;
      margin: 0;
    }

    /* Quick Actions */
    .quick-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 12px 24px;
      font-size: 0.9375rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #ffffff;
      color: #374151;
      padding: 12px 24px;
      font-size: 0.9375rem;
      border: 1.5px solid #e5e7eb;
    }

    .btn-secondary:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-1px);
    }

    /* Sections */
    .section {
      margin-bottom: 40px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 1.5rem;
      color: #1a1a1a;
      margin: 0;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    /* Groups Grid */
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .group-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .group-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
      border-color: #d1d5db;
    }

    .group-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 16px 0;
      letter-spacing: -0.01em;
    }

    .group-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #4b5563;
      font-size: 0.9375rem;
    }

    .group-info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-top: 12px;
      letter-spacing: -0.01em;
    }

    .status-active {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .status-pending {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .status-completed {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
    }

    /* Group Card Actions */
    .group-card-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-invite {
      flex: 1;
      padding: 8px 16px;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-invite:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 64px 24px;
      background: #ffffff;
      border-radius: 12px;
      border: 2px dashed #e5e7eb;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      font-weight: 700;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 24px;
      font-size: 0.9375rem;
    }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 4px 0;
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .header {
        padding: 12px 16px;
      }

      .container {
        padding: 24px 16px;
      }

      .welcome-message {
        margin-bottom: 24px;
      }

      .groups-grid {
        grid-template-columns: 1fr;
      }

      .stats {
        grid-template-columns: 1fr;
      }
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.loadGroups();
  }

  private async loadGroups() {
    this.loading = true;

    try {
      this.groups = await GroupService.getUserGroups(this.user.uid);

      console.log('[Dashboard] Loaded', this.groups.length, 'groups');
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      this.loading = false;
    }
  }

  private async handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  private getUserInitials(): string {
    const name = this.user.displayName || this.user.email || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private handleCreateGroup() {
    this.createModal?.show();
  }

  private async handleCreateGroupSubmit() {
    await this.loadGroups();
  }

  private handleGroupClick(group: Group) {
    grAppMobx.navigate(`/group/${group.id}`);
  }

  private handleInviteClick(group: Group, event: Event) {
    event.stopPropagation(); // Prevent group card click
    this.selectedGroup = group;
    this.inviteModal?.show();
  }

  render() {
    if (this.loading) {
      return html`
        <div class="header">
          <div class="header-left">
            <div class="logo">Giftr</div>
          </div>
        </div>
        <div class="container">
          <div style="text-align: center; padding: 64px 20px;">
            <div style="font-size: 3rem; margin-bottom: 16px;">⏳</div>
            <div style="color: #6b7280;">Chargement de vos groupes...</div>
          </div>
        </div>
      `;
    }

    const participantCount = this.groups.reduce(
      (acc, g) => acc + g.participants.length,
      0
    );
    const drawnCount = this.groups.filter((g) => g.isDrawn).length;

    return html`
      <div class="header">
        <div class="header-left">
          <div class="logo">Giftr</div>
        </div>
        <div class="user-info">
          <div class="user-avatar">${this.getUserInitials()}</div>
          <div class="user-details">
            <div class="user-name">
              ${this.user.displayName || 'Utilisateur'}
            </div>
            <div class="user-email">${this.user.email}</div>
          </div>
          <button class="btn btn-logout" @click=${this.handleLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      <div class="container">
        <div class="welcome-message">
          <h1>
            🎄 Bienvenue, ${this.user.displayName?.split(' ')[0] || 'ami'}! 🎄
          </h1>
          <p>Prêt à organiser vos échanges de cadeaux ?</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${this.groups.length}</div>
            <div class="stat-label">Groupes actifs</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${participantCount}</div>
            <div class="stat-label">Participants au total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${drawnCount}</div>
            <div class="stat-label">Tirages effectués</div>
          </div>
        </div>

        <div class="quick-actions">
          <button class="btn btn-primary" @click=${this.handleCreateGroup}>
            <span>➕</span>
            <span>Créer un nouveau groupe</span>
          </button>
          <button class="btn btn-secondary">
            <span>📝</span>
            <span>Ma liste de souhaits</span>
          </button>
        </div>

        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Mes groupes</h2>
          </div>

          ${this.groups.length > 0
            ? html`
                <div class="groups-grid">
                  ${this.groups.map(
                    (group) => html`
                      <div
                        class="group-card"
                        @click=${() => this.handleGroupClick(group)}
                      >
                        <h3 class="group-name">${group.name}</h3>
                        <div class="group-info">
                          <div class="group-info-item">
                            <span>👥</span>
                            <span
                              >${group.participants.length} participants</span
                            >
                          </div>
                          <div class="group-info-item">
                            <span>💰</span>
                            <span>Budget: ${group.budget}€</span>
                          </div>
                          <div class="group-info-item">
                            <span>📅</span>
                            <span
                              >${new Date(group.eventDate).toLocaleDateString(
                                'fr-FR',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                }
                              )}</span
                            >
                          </div>
                          <div class="group-info-item">
                            <span>🎲</span>
                            <span
                              >${group.isDrawn
                                ? 'Tirage effectué'
                                : 'En attente du tirage'}</span
                            >
                          </div>
                        </div>

                        <div class="group-card-actions">
                          <button
                            class="btn-invite"
                            @click=${(e: Event) =>
                              this.handleInviteClick(group, e)}
                          >
                            <span>✉️</span>
                            <span>Inviter</span>
                          </button>
                        </div>

                        <span
                          class="status-badge ${group.status === 'active'
                            ? 'status-active'
                            : group.status === 'pending'
                            ? 'status-pending'
                            : 'status-completed'}"
                        >
                          ${group.status === 'active'
                            ? '✨ Actif'
                            : group.status === 'pending'
                            ? '⏳ En attente'
                            : '✅ Terminé'}
                        </span>
                      </div>
                    `
                  )}
                </div>
              `
            : html`
                <div class="empty-state">
                  <div class="empty-icon">🎁</div>
                  <h3>Aucun groupe pour le moment</h3>
                  <p>Créez votre premier groupe et invitez vos amis !</p>
                  <button
                    class="btn btn-primary"
                    @click=${this.handleCreateGroup}
                  >
                    Créer mon premier groupe
                  </button>
                </div>
              `}
        </div>
      </div>

      <gr-create-group-modal
        @create-group=${this.handleCreateGroupSubmit}
      ></gr-create-group-modal>

      ${this.selectedGroup
        ? html`<gr-invite-modal
            .group=${this.selectedGroup}
            .user=${this.user}
          ></gr-invite-modal>`
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-dashboard': GrDashboard;
  }
}
