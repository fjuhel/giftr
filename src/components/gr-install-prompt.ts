import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { promptInstall, isPWAInstalled } from '../pwa-register';

@customElement('gr-install-prompt')
export class GrInstallPrompt extends LitElement {
  @state() private showPrompt = false;
  @state() private isInstalled = false;
  @state() private isIOS = false;

  private autoDismissTimer?: number;
  private readonly AUTO_DISMISS_DELAY = 10000; // 10 seconds

  static styles = css`
    :host {
      display: block;
    }

    .install-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      color: white;
      padding: 16px 20px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    .banner-content {
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .text {
      flex: 1;
    }

    .text h3 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 700;
    }

    .text p {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.95;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .btn-install {
      background: white;
      color: #ef4444;
    }

    .btn-install:hover {
      background: #f8f9fa;
      transform: translateY(-1px);
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 16px;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* iOS specific instructions */
    .ios-instructions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      color: white;
      padding: 20px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ios-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .ios-content h3 {
      margin: 0 0 16px 0;
      font-size: 1.125rem;
      font-weight: 700;
    }

    .ios-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .ios-step {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.15);
      padding: 12px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: white;
      color: #ef4444;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .step-text {
      flex: 1;
      font-size: 0.9375rem;
    }

    .close-btn-container {
      text-align: center;
    }

    @media (max-width: 600px) {
      .actions {
        flex-direction: column;
        width: 100%;
      }

      button {
        width: 100%;
      }

      .banner-content {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.checkInstallStatus();

    // Listen for install prompt
    window.addEventListener(
      'pwa-install-available',
      this.handleInstallAvailable
    );
  }

  override disconnectedCallback() {
    window.removeEventListener(
      'pwa-install-available',
      this.handleInstallAvailable
    );
    // Clear auto-dismiss timer
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }
    super.disconnectedCallback();
  }

  private checkInstallStatus() {
    this.isInstalled = isPWAInstalled();

    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone;
    this.isIOS = isIOS && !isStandalone;

    // Check if user already installed (multiple checks for reliability)
    if (this.isInstalled || isStandalone) {
      console.log('[Install Prompt] App already installed, not showing prompt');
      return;
    }

    // Show prompt if not installed and not dismissed
    const dismissedUntil = localStorage.getItem('install-prompt-dismissed');
    const isDismissed = dismissedUntil && parseInt(dismissedUntil) > Date.now();

    if (!isDismissed) {
      // Show after a short delay to not interrupt initial load
      setTimeout(() => {
        this.showPrompt = true;
        // Auto-dismiss after 10 seconds
        this.startAutoDismissTimer();
      }, 1500);
    } else {
      console.log(
        '[Install Prompt] Dismissed until:',
        new Date(parseInt(dismissedUntil))
      );
    }
  }

  private startAutoDismissTimer() {
    // Clear any existing timer
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }

    // Auto-dismiss after 10 seconds if user doesn't interact
    this.autoDismissTimer = window.setTimeout(() => {
      if (this.showPrompt) {
        console.log('[Install Prompt] Auto-dismissing after 10 seconds');
        this.handleClose();
      }
    }, this.AUTO_DISMISS_DELAY);
  }

  private handleInstallAvailable = () => {
    const dismissedUntil = localStorage.getItem('install-prompt-dismissed');
    const isDismissed = dismissedUntil && parseInt(dismissedUntil) > Date.now();

    if (!isDismissed && !this.isInstalled) {
      this.showPrompt = true;
      this.startAutoDismissTimer();
    }
  };

  private async handleInstall() {
    // Clear auto-dismiss timer when user interacts
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }

    if (this.isIOS) {
      // iOS doesn't support programmatic install, just show instructions
      return;
    }

    const accepted = await promptInstall();
    if (accepted) {
      this.showPrompt = false;
      this.isInstalled = true;
    }
  }

  private handleClose() {
    // Clear auto-dismiss timer
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }

    this.showPrompt = false;
    // Remember dismissal for 7 days
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('install-prompt-dismissed', expires.toString());
  }

  override render() {
    if (!this.showPrompt || this.isInstalled) {
      return html``;
    }

    if (this.isIOS) {
      return html`
        <div class="ios-instructions">
          <div class="ios-content">
            <h3>📱 Installer Giftr sur votre iPhone</h3>
            <div class="ios-steps">
              <div class="ios-step">
                <div class="step-number">1</div>
                <div class="step-text">
                  Appuyez sur le bouton <strong>Partager</strong>
                  <svg
                    style="display:inline; width:16px; height:16px; vertical-align: middle;"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div class="ios-step">
                <div class="step-number">2</div>
                <div class="step-text">
                  Sélectionnez <strong>"Sur l'écran d'accueil"</strong>
                </div>
              </div>
              <div class="ios-step">
                <div class="step-number">3</div>
                <div class="step-text">
                  Appuyez sur <strong>Ajouter</strong>
                </div>
              </div>
            </div>
            <div class="close-btn-container">
              <button class="btn-close" @click=${this.handleClose}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="install-banner">
        <div class="banner-content">
          <div class="icon">🎁</div>
          <div class="text">
            <h3>Installer Giftr</h3>
            <p>Ajoutez l'app à votre écran d'accueil pour un accès rapide</p>
          </div>
          <div class="actions">
            <button class="btn-install" @click=${this.handleInstall}>
              Installer
            </button>
            <button class="btn-close" @click=${this.handleClose}>
              Plus tard
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-install-prompt': GrInstallPrompt;
  }
}
