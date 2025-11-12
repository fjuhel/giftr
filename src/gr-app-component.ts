import '@webcomponents/scoped-custom-element-registry';
import { LitElement, nothing, css, html } from 'lit';
import { state } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import grAppMobx from './states/gr-app-mobx';
import './mobx-config';
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { notificationService } from './services/notification-service';
import { UserService } from './services/user-service';
import { GrLogin } from './components/gr-login';
import { GrWelcome } from './components/gr-welcome';
import { GrDashboard } from './components/gr-dashboard';
import { GrAuthModal } from './components/gr-auth-modal';
import { GrInstallPrompt } from './components/gr-install-prompt';
import { GrJoinGroup } from './components/gr-join-group';
import { GrGroupDetail } from './components/gr-group-detail';
import { registerServiceWorker, setupInstallPrompt } from './pwa-register';

export enum Pages {
  WELCOME = 'welcome-page',
  DASHBOARD = 'dashboard-page',
  JOIN_GROUP = 'join-group-page',
  GROUP_DETAIL = 'group-detail-page',
}

export class GrAppComponent extends ScopedElementsMixin(LitElement) {
  @state() user: User | null = null;

  @state() private drawer = true;

  @state() private mobileView = false;

  @state() private appIsReady = false;

  @state() private authModalOpen = false;

  @state() private authModalMode: 'login' | 'register' = 'login';

  // eslint-disable-next-line doubletrade/class-members-should-not-use-functions-defined-later
  private router: Router = new Router(this, [
    {
      name: Pages.WELCOME,
      path: '/',
      render: () =>
        this.user
          ? html`<gr-dashboard .user=${this.user}></gr-dashboard>`
          : html`
              <gr-welcome
                @login=${this.handleLogin}
                @register=${this.handleRegister}
              ></gr-welcome>
            `,
    },
    {
      name: Pages.GROUP_DETAIL,
      path: '/group/:groupId',
      render: ({ groupId }) =>
        html`<gr-group-detail
          .groupId=${groupId || ''}
          .user=${this.user}
        ></gr-group-detail>`,
    },
    {
      name: Pages.JOIN_GROUP,
      path: '/invite/:linkId',
      render: ({ linkId }) =>
        html`<gr-join-group
          .linkId=${linkId || ''}
          .user=${this.user}
          @group-joined=${this.handleGroupJoined}
        ></gr-join-group>`,
    },
  ]);

  protected static get scopedElements() {
    return {
      'gr-login': GrLogin,
      'gr-welcome': GrWelcome,
      'gr-dashboard': GrDashboard,
      'gr-auth-modal': GrAuthModal,
      'gr-install-prompt': GrInstallPrompt,
      'gr-join-group': GrJoinGroup,
      'gr-group-detail': GrGroupDetail,
    };
  }

  public override connectedCallback() {
    super.connectedCallback();

    // Register PWA service worker
    registerServiceWorker();
    setupInstallPrompt();

    // Initialize FCM notifications
    notificationService.initialize();

    onAuthStateChanged(auth, async (user) => {
      this.user = user;
      this.appIsReady = true;

      // Request notification permission and save FCM token when user logs in
      if (user) {
        this.setupNotifications();
      }
    });
    grAppMobx.setRouter(this.router);
    this.addEventListener('toggle-drawer', this.toggleDrawer);
  }

  public override disconnectedCallback() {
    this.removeEventListener('toggle-drawer', this.toggleDrawer);
    super.disconnectedCallback();
  }

  private handleLogin() {
    this.authModalMode = 'login';
    this.authModalOpen = true;
  }

  private handleRegister() {
    this.authModalMode = 'register';
    this.authModalOpen = true;
  }

  private handleAuthModalClose() {
    this.authModalOpen = false;
  }

  private handleAuthSuccess() {
    this.authModalOpen = false;
    // User state will be updated automatically by onAuthStateChanged
  }

  private handleGroupJoined() {
    // Redirect to dashboard after joining a group
    grAppMobx.navigate('/');
  }

  protected override firstUpdated() {
    // listen size changes to adapt drawer mode
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.mobileView = entry.contentRect.width < 600;
        if (this.mobileView) this.drawer = false;
      }
    });
    resizeObserver.observe(this);
    this.mobileView = this.offsetWidth < 600;
    if (this.mobileView) {
      this.drawer = false;
    }
  }

  public static get styles() {
    const componentStyle = css`
      :host {
        display: block;
        height: 100vh;
        width: 100%;
        overflow: visible;
        background-color: white;
      }

      .wrapper {
        height: 100%;
      }

      .left-part {
        width: 250px;
        height: 100%;
        box-shadow: var(--primary-box-shadow);
        z-index: 96;
      }

      .left-part.collapsed {
        width: 0px;
        opacity: 0;
        transform: translateX(-8px);
      }

      .right-part {
        height: 100%;
      }
    `;
    return [componentStyle];
  }

  protected override render() {
    if (!this.appIsReady) {
      return nothing;
    }

    return html`
      ${this.router.outlet()}
      <gr-auth-modal
        .open=${this.authModalOpen}
        .initialMode=${this.authModalMode}
        @close=${this.handleAuthModalClose}
        @auth-success=${this.handleAuthSuccess}
      ></gr-auth-modal>
      <gr-install-prompt></gr-install-prompt>
    `;
  }

  private toggleDrawer() {
    this.drawer = !this.drawer;
  }

  private async setupNotifications() {
    try {
      console.log('[App] Setting up FCM notifications...');
      const permission = await notificationService.getNotificationPermission();
      console.log('[App] Current notification permission:', permission);

      if (permission === 'default') {
        console.log('[App] Requesting notification permission...');
        const granted = await notificationService.requestPermission();
        if (!granted) {
          console.log('[App] Notification permission denied by user');
          return;
        }
        console.log('[App] Notification permission granted!');
      } else if (permission === 'denied') {
        console.log('[App] Notification permission was previously denied');
        return;
      }

      // Get FCM token and save it
      const token = await notificationService.getFCMToken();
      if (token) {
        await UserService.saveFCMToken(token);
        console.log('[App] FCM token saved successfully ✅');
      }
    } catch (error) {
      console.error('[App] Error setting up notifications:', error);
    }
  }
}
