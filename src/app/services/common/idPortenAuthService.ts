import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserManager, WebStorageStateStore, User, Log} from 'oidc-client';
import { Observable } from 'rxjs';

// Log.logger = console;
// Log.level = Log.DEBUG;


@Injectable()
export class IDPortenAuthenticationService {
  userManager: UserManager =  new UserManager(this.getSettings());

  idPortenJwt: string;
  loggedIn: boolean;
  currentUser: User;

  constructor() {
    this.userManager.getUser().then(user => {
      this.currentUser = user;
    });

    this.userManager.events.addUserLoaded((user) => {
      this.currentUser = user;
    });
  }

  private getSettings(): any {
    const baseUrl = window.location.origin;
    const settings: any = {
      authority: environment.ID_PORTEN.authority,
      client_id: environment.ID_PORTEN.client_id,
      popup_redirect_uri: `${baseUrl}/assets/idporten-popup-callback.html`,
      popupWindowFeatures: 'menubar=yes,location=yes,toolbar=yes,width=1200,height=800,left=100,top=100;resizable=yes',
      post_logout_redirect_uri: baseUrl,
      response_type: 'code',
      scope: 'openid profile',
      acr_values: 'Level3',
      code_challenge_method: 'S256',
      automaticSilentRenew: false,
      loadUserInfo: false,
      revokeAccessTokenOnSignout: true,
      userStore: new WebStorageStateStore({ store: window.localStorage })
    };
    return settings;
  }


  public getUser(): Promise<User> {
    return this.userManager.getUser();
  }

  // If not using popup. Will refresh UE because of callback
  public login(): Promise<void> {
     return this.userManager.signinRedirect();
  }

  public popupSignin() {
    return this.userManager.signinPopup();
  }

  public logout(): Promise<void> {
    return this.userManager.signoutRedirect();
  }

  isLoggedIn(): boolean {
    if (this.currentUser && !this.currentUser.expired) {
        return true;
    }
    return false;
  }

  getAuthorizationHeaderValue(): string {
    return `${this.currentUser.access_token}`;
  }

  async completeAuthentication(): Promise<void> {
    const user = await this.userManager.signinRedirectCallback();
    this.currentUser = user;
  }
}
