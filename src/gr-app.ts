import { GrAppComponent } from './gr-app-component';

window.customElements.define('gr-app', GrAppComponent);

declare global {
  interface HTMLElementTagNameMap {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'gr-app': GrAppComponent;
  }
}
