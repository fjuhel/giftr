import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';

@customElement('gr-auth-modal')
export class GrAuthModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) initialMode: 'login' | 'register' = 'login';

  @state() private mode: 'login' | 'register' = 'login';
  @state() private email = '';
  @state() private password = '';
  @state() private confirmPassword = '';
  @state() private displayName = '';
  @state() private loading = false;
  @state() private error = '';

  override connectedCallback() {
    super.connectedCallback();
    this.mode = this.initialMode;
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open') && this.open) {
      this.resetForm();
      this.mode = this.initialMode;
    }
  }

  private resetForm() {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.displayName = '';
    this.error = '';
    this.loading = false;
  }

  private validateForm(): string | null {
    if (!this.email || !this.password) {
      return 'Veuillez remplir tous les champs requis';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return 'Adresse email invalide';
    }

    // Password validation
    if (this.password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Register-specific validation
    if (this.mode === 'register') {
      if (!this.displayName) {
        return 'Veuillez entrer votre nom';
      }

      if (this.password !== this.confirmPassword) {
        return 'Les mots de passe ne correspondent pas';
      }
    }

    return null;
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();

    const validationError = this.validateForm();
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      let userCredential: UserCredential;

      if (this.mode === 'login') {
        userCredential = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );

        // Update user profile with display name
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: this.displayName,
          });
        }
      }

      // Close modal and notify parent
      this.dispatchEvent(
        new CustomEvent('auth-success', {
          detail: { user: userCredential.user },
          bubbles: true,
          composed: true,
        })
      );
      this.closeModal();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: string };
        switch (error.code) {
          case 'auth/email-already-in-use':
            this.error = 'Cette adresse email est déjà utilisée';
            break;
          case 'auth/invalid-email':
            this.error = 'Adresse email invalide';
            break;
          case 'auth/user-not-found':
            this.error = 'Aucun compte trouvé avec cette adresse email';
            break;
          case 'auth/wrong-password':
            this.error = 'Mot de passe incorrect';
            break;
          case 'auth/weak-password':
            this.error = 'Le mot de passe est trop faible';
            break;
          case 'auth/invalid-credential':
            this.error = 'Identifiants invalides';
            break;
          default:
            this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
      } else {
        this.error = 'Une erreur est survenue. Veuillez réessayer.';
      }
    } finally {
      this.loading = false;
    }
  }

  private closeModal() {
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.closeModal();
    }
  }

  private switchMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  static styles = css`
    :host {
      display: block;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
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
      background: #ffffff;
      border-radius: 16px;
      padding: 32px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
      position: relative;
      animation: slideUp 0.2s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(16px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .close-button {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #f3f4f6;
      border: none;
      color: #6b7280;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 8px;
      line-height: 1;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      background: #e5e7eb;
      color: #374151;
    }

    .modal-header {
      margin-bottom: 24px;
    }

    .modal-title {
      color: #1a1a1a;
      font-size: 1.875rem;
      font-weight: 800;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    .modal-subtitle {
      color: #6b7280;
      margin: 0;
      font-size: 0.9375rem;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      color: #374151;
      font-weight: 600;
      font-size: 0.875rem;
      letter-spacing: -0.01em;
    }

    .form-input {
      padding: 12px 14px;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      background: #ffffff;
      color: #1a1a1a;
      font-size: 0.9375rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    .form-input:focus {
      outline: none;
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #ef4444;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 0.875rem;
      animation: shake 0.3s ease-out;
      font-weight: 500;
    }

    @keyframes shake {
      0%,
      100% {
        transform: translateX(0);
      }
      25% {
        transform: translateX(-8px);
      }
      75% {
        transform: translateX(8px);
      }
    }

    .submit-button {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 4px;
      position: relative;
      letter-spacing: -0.01em;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .submit-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }

    .submit-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .submit-button.loading {
      color: transparent;
    }

    .spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }

    .divider {
      text-align: center;
      margin: 24px 0 20px 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e5e7eb;
    }

    .divider-text {
      position: relative;
      background: #ffffff;
      padding: 0 12px;
      color: #9ca3af;
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .switch-mode {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .switch-mode-button {
      background: none;
      border: none;
      color: #ef4444;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      font-size: inherit;
      transition: color 0.2s;
    }

    .switch-mode-button:hover {
      color: #dc2626;
      text-decoration: underline;
    }
  `;

  render() {
    if (!this.open) return null;

    const isLogin = this.mode === 'login';

    return html`
      <div class="modal-backdrop" @click=${this.handleBackdropClick}>
        <div class="modal">
          <button
            class="close-button"
            @click=${this.closeModal}
            aria-label="Fermer"
          >
            ×
          </button>

          <div class="modal-header">
            <h2 class="modal-title">
              ${isLogin ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p class="modal-subtitle">
              ${isLogin
                ? 'Connectez-vous pour organiser vos échanges'
                : 'Rejoignez-nous pour commencer'}
            </p>
          </div>

          <form class="form" @submit=${this.handleSubmit}>
            ${this.error
              ? html`<div class="error-message">${this.error}</div>`
              : ''}
            ${!isLogin
              ? html`
                  <div class="form-group">
                    <label class="form-label" for="displayName">Nom</label>
                    <input
                      id="displayName"
                      type="text"
                      class="form-input"
                      placeholder="Jean Dupont"
                      .value=${this.displayName}
                      @input=${(e: Event) =>
                        (this.displayName = (
                          e.target as HTMLInputElement
                        ).value)}
                      ?disabled=${this.loading}
                    />
                  </div>
                `
              : ''}

            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input
                id="email"
                type="email"
                class="form-input"
                placeholder="vous@exemple.com"
                .value=${this.email}
                @input=${(e: Event) =>
                  (this.email = (e.target as HTMLInputElement).value)}
                ?disabled=${this.loading}
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                class="form-input"
                placeholder="••••••••"
                .value=${this.password}
                @input=${(e: Event) =>
                  (this.password = (e.target as HTMLInputElement).value)}
                ?disabled=${this.loading}
              />
            </div>

            ${!isLogin
              ? html`
                  <div class="form-group">
                    <label class="form-label" for="confirmPassword">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      class="form-input"
                      placeholder="••••••••"
                      .value=${this.confirmPassword}
                      @input=${(e: Event) =>
                        (this.confirmPassword = (
                          e.target as HTMLInputElement
                        ).value)}
                      ?disabled=${this.loading}
                    />
                  </div>
                `
              : ''}

            <button
              type="submit"
              class="submit-button ${this.loading ? 'loading' : ''}"
              ?disabled=${this.loading}
            >
              ${this.loading ? html`<span class="spinner"></span>` : ''}
              ${isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          <div class="divider">
            <span class="divider-text">ou</span>
          </div>

          <div class="switch-mode">
            ${isLogin
              ? html`Pas encore de compte ?
                  <button
                    type="button"
                    class="switch-mode-button"
                    @click=${this.switchMode}
                  >
                    Créer un compte
                  </button>`
              : html`Déjà un compte ?
                  <button
                    type="button"
                    class="switch-mode-button"
                    @click=${this.switchMode}
                  >
                    Se connecter
                  </button>`}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-auth-modal': GrAuthModal;
  }
}
