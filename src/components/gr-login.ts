import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

@customElement('gr-login')
export class GrLogin extends LitElement {
  @state() email = '';
  @state() password = '';
  @state() isLogin = true; // toggle between login/signup
  @state() error = '';

  static styles = css`
    :host {
      display: grid;
      place-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #ff6f61, #ffb74d);
      font-family: system-ui, sans-serif;
      color: white;
    }
    .card {
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    input {
      padding: 0.6rem;
      border-radius: 8px;
      border: 1px solid #ccc;
      font-size: 1rem;
    }
    button {
      background: #ff6f61;
      color: white;
      border: none;
      padding: 0.8rem;
      border-radius: 999px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    button:hover {
      transform: scale(1.05);
    }
    .toggle {
      text-align: center;
      font-size: 0.9rem;
      cursor: pointer;
      color: #ff6f61;
    }
    .error {
      color: red;
      font-size: 0.85rem;
      text-align: center;
    }
  `;

  async handleSubmit() {
    this.error = '';
    try {
      if (this.isLogin) {
        await signInWithEmailAndPassword(auth, this.email, this.password);
      } else {
        await createUserWithEmailAndPassword(auth, this.email, this.password);
      }
    } catch (err: any) {
      this.error = err.message || 'Authentication failed';
    }
  }

  render() {
    return html`
      <div class="card">
        <h2>${this.isLogin ? 'Login' : 'Sign Up'}</h2>
        <input
          type="email"
          placeholder="Email"
          .value=${this.email}
          @input=${(e: Event) =>
            (this.email = (e.target as HTMLInputElement).value)}
        />
        <input
          type="password"
          placeholder="Password"
          .value=${this.password}
          @input=${(e: Event) =>
            (this.password = (e.target as HTMLInputElement).value)}
        />
        <button @click=${this.handleSubmit}>
          ${this.isLogin ? 'Login' : 'Sign Up'}
        </button>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        <div class="toggle" @click=${() => (this.isLogin = !this.isLogin)}>
          ${this.isLogin
            ? 'Create an account'
            : 'Already have an account? Login'}
        </div>
      </div>
    `;
  }
}
