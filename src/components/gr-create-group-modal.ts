import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { CreateGroupData } from '../models/group';

@customElement('gr-create-group-modal')
export class GrCreateGroupModal extends LitElement {
  @state() private open = false;
  @state() private loading = false;
  @state() private error = '';

  @state() private formData: CreateGroupData = {
    name: '',
    description: '',
    budget: 30,
    eventDate: '',
  };

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

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #374151;
      font-size: 0.875rem;
    }

    .required {
      color: #ef4444;
    }

    input,
    textarea {
      width: 100%;
      padding: 12px;
      border: 1.5px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-family: inherit;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .input-hint {
      font-size: 0.8125rem;
      color: #6b7280;
      margin-top: 4px;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-prefix {
      font-size: 0.9375rem;
      color: #6b7280;
      font-weight: 500;
    }

    input[type='number'] {
      max-width: 120px;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
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
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-submit {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

      .modal-footer {
        flex-direction: column-reverse;
      }

      button {
        width: 100%;
      }
    }
  `;

  public show() {
    this.open = true;
    this.error = '';
    this.formData = {
      name: '',
      description: '',
      budget: 30,
      eventDate: '',
    };
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

  private handleInputChange(
    field: keyof CreateGroupData,
    value: string | number
  ) {
    this.formData = {
      ...this.formData,
      [field]: value,
    };
  }

  private validateForm(): string | null {
    if (!this.formData.name.trim()) {
      return 'Le nom du groupe est requis';
    }
    if (this.formData.budget < 1) {
      return 'Le budget doit être supérieur à 0€';
    }
    if (!this.formData.eventDate) {
      return "La date de l'événement est requise";
    }

    const eventDate = new Date(this.formData.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return "La date de l'événement doit être dans le futur";
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
      this.dispatchEvent(
        new CustomEvent('create-group', {
          bubbles: true,
          composed: true,
          detail: this.formData,
        })
      );
      // Don't close here - parent will close on success
    } catch (err) {
      this.error = 'Une erreur est survenue. Veuillez réessayer.';
      this.loading = false;
    }
  }

  public hideLoading() {
    this.loading = false;
  }

  public showError(message: string) {
    this.error = message;
    this.loading = false;
  }

  public close() {
    this.open = false;
  }

  render() {
    if (!this.open) {
      return html``;
    }

    return html`
      <div class="modal-overlay" @click=${this.handleOverlayClick}>
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">🎁 Créer un nouveau groupe</h2>
            <p class="modal-subtitle">
              Organisez votre prochain Secret Santa en quelques clics
            </p>
          </div>

          <form @submit=${this.handleSubmit}>
            <div class="modal-body">
              ${this.error
                ? html`<div class="error-message">${this.error}</div>`
                : ''}

              <div class="form-group">
                <label> Nom du groupe <span class="required">*</span> </label>
                <input
                  type="text"
                  placeholder="Ex: Secret Santa Famille 2025"
                  .value=${this.formData.name}
                  @input=${(e: InputEvent) =>
                    this.handleInputChange(
                      'name',
                      (e.target as HTMLInputElement).value
                    )}
                  ?disabled=${this.loading}
                  required
                />
              </div>

              <div class="form-group">
                <label>Description (optionnelle)</label>
                <textarea
                  placeholder="Ajoutez quelques détails sur cet événement..."
                  .value=${this.formData.description || ''}
                  @input=${(e: InputEvent) =>
                    this.handleInputChange(
                      'description',
                      (e.target as HTMLTextAreaElement).value
                    )}
                  ?disabled=${this.loading}
                ></textarea>
              </div>

              <div class="form-group">
                <label>
                  Budget par personne <span class="required">*</span>
                </label>
                <div class="input-group">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    .value=${this.formData.budget.toString()}
                    @input=${(e: InputEvent) =>
                      this.handleInputChange(
                        'budget',
                        parseInt((e.target as HTMLInputElement).value) || 0
                      )}
                    ?disabled=${this.loading}
                    required
                  />
                  <span class="input-prefix">€</span>
                </div>
                <div class="input-hint">
                  Budget recommandé pour l'achat du cadeau
                </div>
              </div>

              <div class="form-group">
                <label>
                  Date de l'événement <span class="required">*</span>
                </label>
                <input
                  type="date"
                  .value=${this.formData.eventDate}
                  @input=${(e: InputEvent) =>
                    this.handleInputChange(
                      'eventDate',
                      (e.target as HTMLInputElement).value
                    )}
                  ?disabled=${this.loading}
                  required
                />
                <div class="input-hint">
                  Date à laquelle vous échangerez les cadeaux
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn-cancel"
                @click=${this.handleClose}
                ?disabled=${this.loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                class="btn-submit"
                ?disabled=${this.loading}
              >
                ${this.loading
                  ? html`<span class="loading-spinner"></span>Création...`
                  : 'Créer le groupe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-create-group-modal': GrCreateGroupModal;
  }
}
