import { makeAutoObservable } from 'mobx';
import type { Pages } from '../gr-app-component';
import type { Router } from '@lit-labs/router';

declare global {
  interface Window {
    grAppMobx: GrAppMobx;
  }
}

export class GrAppMobx {
  public selectedPage?: Pages;

  public router?: Router;

  public constructor() {
    makeAutoObservable(this);
  }

  public setRouter(router: Router) {
    this.router = router;
  }

  public navigate(path: string) {
    window.history.pushState({}, '', path);
    this.router?.goto(path);
  }

  public setSelectedPage(page?: Pages) {
    this.selectedPage = page;
  }
}

const grAppMobx = new GrAppMobx();
window.grAppMobx = grAppMobx;

export default grAppMobx;
