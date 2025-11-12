import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('gr-welcome')
export class GrWelcome extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(
        180deg,
        #0f172a 0%,
        #1e293b 50%,
        #334155 100%
      );
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
      position: relative;
      overflow-x: hidden;
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    /* Modern custom scrollbar */
    :host::-webkit-scrollbar {
      width: 14px;
    }

    :host::-webkit-scrollbar-track {
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.8) 0%,
        rgba(30, 41, 59, 0.8) 50%,
        rgba(51, 65, 85, 0.8) 100%
      );
      border-left: 2px solid rgba(255, 255, 255, 0.05);
    }

    :host::-webkit-scrollbar-thumb {
      background: linear-gradient(
        180deg,
        #ef4444 0%,
        #ec4899 50%,
        #8b5cf6 100%
      );
      border-radius: 10px;
      border: 3px solid rgba(15, 23, 42, 0.8);
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.6),
        inset 0 0 10px rgba(255, 255, 255, 0.2);
      animation: scrollbarPulse 2s ease-in-out infinite;
    }

    @keyframes scrollbarPulse {
      0%,
      100% {
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.6),
          inset 0 0 10px rgba(255, 255, 255, 0.2);
      }
      50% {
        box-shadow: 0 0 30px rgba(236, 72, 153, 0.8),
          inset 0 0 15px rgba(255, 255, 255, 0.3);
      }
    }

    :host::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        180deg,
        #dc2626 0%,
        #db2777 50%,
        #7c3aed 100%
      );
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.9),
        inset 0 0 15px rgba(255, 255, 255, 0.4);
      animation: none;
    }

    :host::-webkit-scrollbar-thumb:active {
      background: linear-gradient(
        180deg,
        #b91c1c 0%,
        #be185d 50%,
        #6d28d9 100%
      );
      box-shadow: 0 0 40px rgba(239, 68, 68, 1),
        inset 0 0 20px rgba(255, 255, 255, 0.5);
    }

    /* Firefox scrollbar */
    :host {
      scrollbar-width: thin;
      scrollbar-color: #ef4444 rgba(15, 23, 42, 0.5);
    }

    /* Snow particles */
    .snowflake {
      position: fixed;
      top: -10px;
      color: #ffffff;
      font-size: 8px;
      opacity: 0.9;
      animation: snowfall linear infinite;
      user-select: none;
      pointer-events: none;
      z-index: 1;
      filter: blur(0.5px);
    }

    @keyframes snowfall {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
      }
      50% {
        transform: translateY(50vh) translateX(40px) rotate(180deg);
      }
      100% {
        transform: translateY(100vh) translateX(0) rotate(360deg);
      }
    }

    /* Snow accumulation at bottom */
    :host::after {
      content: '';
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(
        to top,
        rgba(255, 255, 255, 0.3) 0%,
        transparent 100%
      );
      pointer-events: none;
      z-index: 2;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
      z-index: 1;
    }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 120px 24px 80px;
      animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      margin: 0 0 16px 0;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.1;
      background: linear-gradient(
        135deg,
        #ef4444 0%,
        #ec4899 50%,
        #8b5cf6 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.3));
    }

    .hero .subtitle {
      font-size: clamp(1.125rem, 2vw, 1.5rem);
      margin: 0 0 24px 0;
      color: #cbd5e1;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    .hero .tagline {
      font-size: clamp(1rem, 1.5vw, 1.125rem);
      max-width: 600px;
      margin: 0 auto 48px;
      line-height: 1.6;
      color: #94a3b8;
      font-weight: 400;
    }

    /* Auth Buttons */
    .auth-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 80px;
    }
    .btn {
      padding: 14px 32px;
      font-size: 1rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.01em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .btn-primary {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
      transform: translateY(-2px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .btn-secondary:active {
      transform: translateY(0);
    }

    /* Features Section */
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      padding: 64px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature {
      padding: 32px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
    }

    .feature:nth-child(1) {
      animation-delay: 0.1s;
    }
    .feature:nth-child(2) {
      animation-delay: 0.2s;
    }
    .feature:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
      display: block;
    }

    .feature h3 {
      font-size: 1.25rem;
      margin: 0 0 12px 0;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .feature p {
      font-size: 0.9375rem;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0;
      font-weight: 400;
    }

    /* How it works */
    .how-it-works {
      padding: 80px 24px;
      text-align: center;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
    }

    .how-it-works h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      color: #ffffff;
      margin: 0 0 64px 0;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 48px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .step {
      text-align: center;
      animation: fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
    }

    .step:nth-child(1) {
      animation-delay: 0.2s;
    }
    .step:nth-child(2) {
      animation-delay: 0.4s;
    }
    .step:nth-child(3) {
      animation-delay: 0.6s;
    }
    .step:nth-child(4) {
      animation-delay: 0.8s;
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      color: white;
      border-radius: 16px;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 20px;
      box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .step:hover .step-number {
      transform: rotate(360deg) scale(1.1);
      box-shadow: 0 12px 24px rgba(239, 68, 68, 0.6);
    }

    .step h4 {
      font-size: 1.125rem;
      color: #ffffff;
      margin: 0 0 12px 0;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .step p {
      color: #cbd5e1;
      line-height: 1.6;
      font-size: 0.9375rem;
      margin: 0;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 64px 24px;
      color: #64748b;
      font-size: 0.875rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .footer p {
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .hero {
        padding: 80px 24px 60px;
      }

      .features {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 48px 24px;
      }

      .steps {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .how-it-works {
        padding: 60px 24px;
      }
    }
  `;

  private handleLogin() {
    this.dispatchEvent(
      new CustomEvent('login', { bubbles: true, composed: true })
    );
  }

  private handleRegister() {
    this.dispatchEvent(
      new CustomEvent('register', { bubbles: true, composed: true })
    );
  }

  override connectedCallback() {
    super.connectedCallback();
    this.createSnowflakes();
  }

  private createSnowflakes() {
    // Create 50 small particle snowflakes with varying paths
    setTimeout(() => {
      for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '•';
        snowflake.style.left = Math.random() * 100 + '%';

        const fallDuration = Math.random() * 5 + 8;
        snowflake.style.animationDuration = `${fallDuration}s`;
        snowflake.style.opacity = (Math.random() * 0.5 + 0.5).toString();
        snowflake.style.fontSize = Math.random() * 8 + 4 + 'px';
        snowflake.style.animationDelay = `-${Math.random() * 10}s`;
        this.shadowRoot?.appendChild(snowflake);
      }
    }, 100);
  }

  render() {
    return html`
      <div class="container">
        <div class="hero">
          <h1>Giftr</h1>
          <div class="subtitle">L'échange de cadeaux réinventé</div>
          <p class="tagline">
            Organisez votre Secret Santa en quelques clics. Simple, rapide et
            entièrement gratuit.
          </p>

          <div class="auth-buttons">
            <button class="btn btn-primary" @click=${this.handleLogin}>
              Se connecter
            </button>
            <button class="btn btn-secondary" @click=${this.handleRegister}>
              Créer un compte
            </button>
          </div>
        </div>

        <div class="features">
          <div class="feature">
            <span class="feature-icon">🎁</span>
            <h3>Tirage automatique</h3>
            <p>
              Notre algorithme intelligent assigne chaque participant de manière
              aléatoire et équitable. Plus besoin de papiers !
            </p>
          </div>

          <div class="feature">
            <span class="feature-icon">🔒</span>
            <h3>100% Anonyme</h3>
            <p>
              Gardez le secret intact. Seul vous savez pour qui vous offrez un
              cadeau jusqu'au jour de la révélation.
            </p>
          </div>

          <div class="feature">
            <span class="feature-icon">📝</span>
            <h3>Liste de souhaits</h3>
            <p>
              Créez votre wishlist pour guider votre Secret Santa. Budget,
              préférences, tout est prévu.
            </p>
          </div>

          <div class="feature">
            <span class="feature-icon">👥</span>
            <h3>Groupes illimités</h3>
            <p>
              Famille, amis, collègues... Gérez plusieurs Secret Santa depuis un
              seul compte.
            </p>
          </div>

          <div class="feature">
            <span class="feature-icon">📧</span>
            <h3>Invitations simples</h3>
            <p>
              Invitez vos participants par email en un clic. Ils reçoivent tout
              pour rejoindre votre groupe.
            </p>
          </div>

          <div class="feature">
            <span class="feature-icon">✨</span>
            <h3>Révélation magique</h3>
            <p>
              Le jour J, dévoilez les identités dans l'app et partagez un moment
              convivial.
            </p>
          </div>
        </div>

        <div class="how-it-works">
          <h2>Comment ça marche ?</h2>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <h4>Créez votre groupe</h4>
              <p>
                Nommez votre événement, définissez le budget et la date
                d'échange.
              </p>
            </div>

            <div class="step">
              <div class="step-number">2</div>
              <h4>Invitez vos amis</h4>
              <p>
                Partagez le lien ou envoyez des emails directement depuis
                l'application.
              </p>
            </div>

            <div class="step">
              <div class="step-number">3</div>
              <h4>Lancez le tirage</h4>
              <p>
                Une fois tout le monde inscrit, lancez le tirage. Chacun
                découvre son attribution.
              </p>
            </div>

            <div class="step">
              <div class="step-number">4</div>
              <h4>Échangez les cadeaux</h4>
              <p>Le jour J, partagez vos cadeaux et révélez les identités !</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>© 2025 Giftr - Fait avec ❤️</p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-welcome': GrWelcome;
  }
}
