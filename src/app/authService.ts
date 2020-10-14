import {Injectable, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, take, tap} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {Company, UserDto, ContractLicenseType} from './unientities';
import {ReplaySubject} from 'rxjs';
import 'rxjs/add/operator/map';
import {UserManager, WebStorageStateStore} from 'oidc-client';
import {THEMES, theme} from 'src/themes/theme';

import * as moment from 'moment';
import {FeaturePermissionService} from './featurePermissionService';

export interface IAuthDetails {
    activeCompany: Company;
    user: UserDto;
    hasActiveContract: boolean;
    isDemo?: boolean;
}

const PUBLIC_ROOT_ROUTES = [
    'reload',
    'init',
    'bureau',
    'about',
    'assignments',
    'tickers',
    'uniqueries',
    'sharings',
    'marketplace',
    'predefined-descriptions',
    'gdpr',
    'contract-activation',
    'license-info',
    'dashboard-new'
];

const PUBLIC_ROUTES = [];

@Injectable()
export class AuthService {
    userManager: UserManager;

    companyChange: EventEmitter<Company> = new EventEmitter();

    authentication$ = new ReplaySubject<IAuthDetails>(1);
    token$ = new ReplaySubject<string>(1);
    errorMessage$ = new ReplaySubject<string>(1);

    jwt: string;
    id_token: string;
    activeCompany: Company;
    currentUser: UserDto;
    contractID: number;

    // Re-implementing a subset of BrowserStorageService here to prevent circular dependencies
    private storage = {
        saveOnUser: (key, value) => {
            if (value === undefined) {
                throw new Error(
                    'Tried to marshal undefined into a JSON string, failing to prevent corrupt localStorage'
                );
            }
            localStorage.setItem(key, JSON.stringify(value));
        },
        getOnUser: key => {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch (e) {
                localStorage.removeItem(key);
                return null;
            }
        },
        removeOnUser: key => localStorage.removeItem(key)
    };

    constructor(
        private router: Router,
        private http: HttpClient,
        private featurePermissionService: FeaturePermissionService
    ) {
        this.activeCompany = this.storage.getOnUser('activeCompany');

        this.setLoadIndicatorVisibility(true);
        this.userManager = this.getUserManager();

        const onMissingAuth = () => {
            this.token$.next(undefined);
            this.authentication$.next({
                activeCompany: undefined,
                user: undefined,
                hasActiveContract: false,
            });

            this.clearAuthAndGotoLogin();
            this.setLoadIndicatorVisibility(false);
        };

        Promise.all([
            this.userManager.getUser(),
            this.userManager.querySessionStatus(),
        ]).then(res => {
            const user = res[0];
            const sessionStatus = res[1];

            if (sessionStatus && user && !user.expired && user.access_token) {
                this.id_token = user.id_token;
                this.jwt = user.access_token;
                this.token$.next(this.jwt);
                this.storage.saveOnUser('jwt', this.jwt);

                if (this.activeCompany) {
                    this.loadCurrentSession().subscribe(
                        () => {
                            // Give the app a bit of time to initialise before we remove spinner
                            // (less visual noise on startup)
                            setTimeout(() => {
                                this.setLoadIndicatorVisibility(false);
                            }, 250);
                        },
                        () => {
                            this.activeCompany = undefined;
                            this.storage.removeOnUser('activeCompany');
                            if (!this.router.url.startsWith('/init')) {
                                this.router.navigate(['/init/login']);
                            }

                            this.setLoadIndicatorVisibility(false);
                        }
                    );
                } else {
                    if (!this.router.url.startsWith('/init')) {
                        this.router.navigate(['/init/login']);
                    }

                    this.setLoadIndicatorVisibility(false);
                }
            } else {
                this.userManager.clearStaleState();
                this.userManager.removeUser().then(() => {
                    onMissingAuth();
                });
            }
        }).catch((err) => {
            // Session has ended ! , clear stale state and redirect to login
            this.userManager.clearStaleState();
            this.userManager.removeUser().then((res) => {
                onMissingAuth();
            });

        });

        this.userManager.events.addUserSignedOut(() => {
            this.token$.next(undefined);
            this.userManager.removeUser().then((res) => {
                this.cleanStorageAndRedirect();
                this.setLoadIndicatorVisibility(false);
            });

        });

        this.userManager.events.addUserLoaded(() => {
            this.userManager.getUser().then(user => {
                if (user && !user.expired && user.access_token) {
                    this.userManager.clearStaleState();
                    this.id_token = user.id_token;
                    this.jwt = user.access_token;
                    this.token$.next(this.jwt);
                    this.storage.saveOnUser('jwt', this.jwt);
                }
            });
        });

        this.userManager.events.addSilentRenewError(function(res) {
            console.log(res);
        });
    }

    setLoadIndicatorVisibility(visible: boolean, isLogout = false) {
        const spinner = document.getElementById('app-spinner');
        if (spinner) {
            if (visible) {
                spinner.style.opacity = '1';
                spinner.style.display = 'flex';
                const textElement = document.getElementById('app-spinner-text');
                if (textElement) {
                    textElement.innerText = isLogout ? 'Logger ut' : 'Laster selskapsdata';
                }
            } else {
                let opacity = 1;
                const interval = setInterval(() => {
                    if (opacity <= 0.2) {
                        spinner.style.display = 'none';
                        clearInterval(interval);
                    } else {
                        spinner.style.opacity = opacity.toString();
                        opacity = opacity - 0.2;
                    }
                }, 50);
            }
        }

        // #chat-container is added by boost, so it wont show up
        // if you do a project wide search for it. Dont remove this :)
        const boostChat = document.getElementById('chat-container');
        if (boostChat) {
            boostChat.style.visibility = visible ? 'hidden' : 'visible';
        }
    }

    private getUserManager(): UserManager {
        const baseUrl = window.location.origin;

        const settings: any = {
            authority: environment.authority,
            client_id: environment.client_id,
            redirect_uri: baseUrl + '/assets/auth.html',
            silent_redirect_uri: baseUrl + '/assets/silent-renew.html',
            post_logout_redirect_uri: baseUrl + environment.post_logout_redirect_uri,
            response_type: 'id_token token',
            scope: 'profile openid AppFramework',
            filterProtocolClaims: true,
            loadUserInfo: true,
            automaticSilentRenew: true,
            accessTokenExpiringNotificationTime: 300, // 5 minute
            silentRequestTimeout: 20000, // 20 seconds
            userStore: new WebStorageStateStore({ store: window.localStorage })
        };

        return new UserManager(settings);
    }

    public authenticate(): void {
        this.userManager.signinRedirect();
    }

    /**
     * Sets the current active company
     * @param {Object} activeCompany
     */
    public setActiveCompany(activeCompany: Company, redirectUrl?: string): void {
        let redirect = redirectUrl;
        if (!redirect) {
            redirect = this.getSafeRoute(this.router.url);
        }

        this.router
            .navigateByUrl('/reload', { skipLocationChange: true })
            .then(navigationSuccess => {
                if (navigationSuccess) {
                    this.setLoadIndicatorVisibility(true);
                    this.storage.saveOnUser('activeCompany', activeCompany);
                    this.storage.saveOnUser('lastActiveCompanyKey', activeCompany.Key);

                    this.activeCompany = activeCompany;
                    this.companyChange.emit(activeCompany);

                    this.reloadCurrentSession().subscribe(
                        authDetails => {
                            const forcedRedirect = this.getForcedRedirect(authDetails);
                            if (forcedRedirect) {
                                redirect = forcedRedirect;
                            }

                            setTimeout(() => {
                                this.router.navigateByUrl(redirect || '').then(success => {
                                    if (!success) {
                                        this.router.navigateByUrl('/');
                                    }
                                });

                                this.setLoadIndicatorVisibility(false);
                            });
                        },
                        (err) => {
                            this.isAuthenticated().then(isAuthenticated => {
                                if (!isAuthenticated) {
                                    this.storage.removeOnUser('lastActiveCompanyKey');
                                    this.idsLogout();
                                } else {
                                    this.setLoadIndicatorVisibility(false);
                                    this.storage.removeOnUser('lastActiveCompanyKey');
                                    this.errorMessage$.next('Klarte ikke hente selskapsdata for dette firma. Prøv igjen senere');
                                    this.router.navigateByUrl('/init/login');
                                }
                            });
                        }
                    );
                }
            });
    }

    reloadCurrentSession() {
        return this.loadCurrentSession().pipe(
            take(1),
            tap(auth => this.authentication$.next(auth))
        );
    }

    private getForcedRedirect(authDetails: IAuthDetails) {
        const permissions = authDetails.user['Permissions'] || [];

        if (authDetails.user && !authDetails.hasActiveContract) {
            return 'contract-activation';
        }

        if (
            permissions.length === 1 &&
            permissions[0] === 'ui_approval_accounting'
        ) {
            return '/assignments/approvals';
        }
    }

    private getSafeRoute(url: string): string {
        let safeUrl = url.split('?')[0];
        safeUrl = safeUrl.split(';')[0];

        const split = safeUrl.split('/').filter(part => !!part);
        if (split.length) {
            const paramIndex = split.findIndex(
                part => !isNaN(parseInt(part, 0))
            );
            if (paramIndex > 0) {
                safeUrl = split.slice(0, paramIndex).join('/');
            }
        }

        return safeUrl || '';
    }

    loadCurrentSession(): Observable<IAuthDetails> {
        const url = (
            environment.BASE_URL +
            environment.API_DOMAINS.BUSINESS +
            'users?action=current-session'
        ).replace(/([^:]\/)\/+/g, '$1');

        return this.http.get<any>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${this.jwt}`,
                CompanyKey: this.activeCompany.Key
            }
        }).pipe(map(user => {
            this.currentUser = user;
            this.contractID = user?.License?.Company?.ContractID;

            const contract: ContractLicenseType = (user.License && user.License.ContractType) || {};
            this.featurePermissionService.activatePackage(contract.TypeName);

            const authDetails = {
                token: this.jwt,
                activeCompany: this.activeCompany,
                user: user,
                hasActiveContract: !this.isTrialExpired(contract),
                isDemo: contract.TypeName === 'Demo',
            };

            this.authentication$.next(authDetails);
            return authDetails;
        }));
    }

    /**
     * Returns the current active companykey string
     */
    public getCompanyKey(): string {
        return this.activeCompany && this.activeCompany.Key;
    }

    /**
     * Returns a boolean indicating whether the user is authenticated or not
     * @returns {Boolean}
     */
    public isAuthenticated(): Promise<boolean> {
        return new Promise(resolve => {
            this.userManager
                .getUser()
                .then(user => {
                    if (user && !user.expired && !!user.access_token) {
                        this.jwt = user.access_token;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(() => resolve(false));
        });
    }

    signoutRedirect() {
        if (this.userManager) {
            this.userManager.signoutRedirect();
        }
    }

    /**
     * Removes web token from localStorage and memory, then redirects to /login
     */
    public clearAuthAndGotoLogin(): void {
        this.authentication$.pipe(take(1)).subscribe(auth => {
            let cleanTokens: boolean = false;
            if (auth && auth.user) {
                cleanTokens = true;
                this.authentication$.next({
                    activeCompany: undefined,
                    user: undefined,
                    hasActiveContract: false,
                });

                this.idsLogout();
            }
            if (!cleanTokens) {
                this.cleanStorageAndRedirect();
            }

        });
    }

    idsLogout() {
        this.setLoadIndicatorVisibility(true, true);

        // Hotfix 20.12.19. This should only be necessary until the next release.
        this.runLogoutRequest();
        //

        this.userManager.createSignoutRequest({ id_token_hint: this.id_token }).then((req) => {
            document.getElementById('silentLogout').setAttribute('src', req.url);
        });
    }

    // Hotfix 20.12.19. This should only be necessary until the next release.
    private runLogoutRequest() {
        const url = environment.BASE_URL_INIT + environment.API_DOMAINS.INIT + 'log-out';
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + this.jwt)
            .set('CompanyKey', this.activeCompany && this.activeCompany.Key);

        this.http.post(url, '', { headers: headers }).subscribe(
            () => {},
            () => {} // fail silently
        );
    }

    public cleanStorageAndRedirect() {
        this.storage.removeOnUser('activeCompany');
        this.storage.removeOnUser('activeFinancialYear');
        this.activeCompany = undefined;
        this.jwt = undefined;
        this.token$.next(undefined);
        this.setLoadIndicatorVisibility(false);

        if (!this.router.url.includes('init')) {
            this.router.navigate(['/init/login']);
        }
    }

    public canActivateRoute(user: UserDto, url: string): boolean {
        // First check if the route is a public route
        if (PUBLIC_ROUTES.some(route => route === url)) {
            return true;
        }

        const rootRoute = this.getRootRoute(url);
        const permissionKey: string = this.getPermissionKey(url);

        if (!this.featurePermissionService.canShowRoute(permissionKey)) {
            return false;
        }

        if (!rootRoute || PUBLIC_ROOT_ROUTES.some(route => route === rootRoute)) {
            return true;
        }

        if (!user) {
            return false;
        }

        return this.hasUIPermission(user, permissionKey);
    }

    public hasUIPermission(user: UserDto, permission: string) {
        if (!user) {
            return false;
        }

        const permissions = user['Permissions'] || [];

        // Interpret no permissions as full access if PermissionHandling is set to SOFT
        if (!permissions.length && user['PermissionHandling'] === 'SOFT') {
            return true;
        }

        permission = permission.trim();

        // Check for direct match
        let hasPermission = permissions.some(p => p === permission);

        // Pop permission parts and check for * access
        if (!hasPermission) {
            const permissionSplit = permission.split('_');

            while (permissionSplit.length && !hasPermission) {
                const multiPermision = permissionSplit.join('_') + '_*';
                if (permissions.some(p => p === multiPermision)) {
                    hasPermission = true;
                }

                permissionSplit.pop();
            }
        }

        return hasPermission;
    }

    private getRootRoute(url): string {
        const noParams = url.split('?')[0];
        let routeParts = noParams.split('/');
        routeParts = routeParts.filter(part => part !== '');

        return routeParts[0];
    }

    private getPermissionKey(url: string): string {
        if (!url) {
            return '';
        }

        // Remove query params first
        let noQueryParams = url.split('?')[0];
        noQueryParams = noQueryParams.split(';')[0];

        let urlParts = noQueryParams.split('/');
        urlParts = urlParts.filter(part => {
            // Remove empty url parts and numeric url parts (ID params)
            return part !== '' && isNaN(parseInt(part, 10));
        });

        return 'ui_' + urlParts.join('_');
    }

    private isTrialExpired(contract: ContractLicenseType): boolean {
        if (contract.TypeName === 'Demo' && contract.TrialExpiration) {
            const daysRemaining = moment(contract.TrialExpiration).diff(
                moment(),
                'days'
            );
            if (daysRemaining > 0) {
                return false;
            } else {
                return true;
            }
        }

        return false;
    }
}
