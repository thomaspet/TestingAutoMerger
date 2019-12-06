import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Company, UserDto, ContractLicenseType } from './unientities';
import { ReplaySubject } from 'rxjs';
import 'rxjs/add/operator/map';
import { UserManager, WebStorageStateStore } from 'oidc-client';
import * as moment from 'moment';
import * as $ from 'jquery';

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
];

const PUBLIC_ROUTES = [];

@Injectable()
export class AuthService {
    userManager: UserManager;

    public companyChange: EventEmitter<Company> = new EventEmitter();

    public authentication$ = new ReplaySubject<IAuthDetails>(1);
    public token$ = new ReplaySubject<string>(1);

    public jwt: string;
    public id_token: string;
    public activeCompany: Company;
    public currentUser: UserDto;

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

    constructor(private router: Router, private http: HttpClient) {
        this.activeCompany = this.storage.getOnUser('activeCompany');

        this.setLoadIndicatorVisibility(true);
        this.userManager = this.getUserManager();

        const onMissingAuth = () => {
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
                        auth => {
                            if (!auth.hasActiveContract) {
                                this.router.navigateByUrl('contract-activation');
                            }

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
                        }
                    );
                } else {
                    if (!this.router.url.startsWith('/init')) {
                        this.router.navigate(['/init/login']);
                    }

                    this.setLoadIndicatorVisibility(false);
                }
            } else {
                onMissingAuth();
            }
        }).catch((err) => {
            // Session has ended ! , clear stale state and redirect to login
            this.userManager.clearStaleState();
            this.userManager.removeUser().then((res) => {
                onMissingAuth();
            });

        });

        this.userManager.events.addUserSignedOut(() => {
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
        if (visible) {
            $('#app-spinner').fadeIn(0);
            $('#app-spinner-text').text(() => isLogout ? 'Logger ut' : 'Laster selskapsdata');
        } else {
            $('#app-spinner').fadeOut(250);
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

                    this.loadCurrentSession().pipe(take(1)).subscribe(
                        authDetails => {
                            this.authentication$.next(authDetails);
                            const forcedRedirect = this.getForcedRedirect(
                                authDetails
                            );
                            if (forcedRedirect) {
                                redirect = forcedRedirect;
                            }

                            setTimeout(() => {
                                this.router.navigateByUrl(redirect || '');
                                this.setLoadIndicatorVisibility(false);
                            });
                        },
                        () => {
                            this.storage.removeOnUser(
                                'lastActiveCompanyKey'
                            );
                            this.clearAuthAndGotoLogin();
                            this.setLoadIndicatorVisibility(false);
                        }
                    );
                }
            });
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

            const contract: ContractLicenseType = (user.License && user.License.ContractType) || {};
            const hasActiveContract = user && !this.isTrialExpired(contract);

            const authDetails = {
                token: this.jwt,
                activeCompany: this.activeCompany,
                user: user,
                hasActiveContract: hasActiveContract,
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

                this.setLoadIndicatorVisibility(true, true);
                this.userManager.createSignoutRequest({ id_token_hint: this.id_token }).then((req) => {
                    document.getElementById('silentLogout').setAttribute('src', req.url);
                });

            }
            if (!cleanTokens) {
                this.cleanStorageAndRedirect();
            }

        });
    }

    public cleanStorageAndRedirect() {
        this.storage.removeOnUser('activeCompany');
        this.storage.removeOnUser('activeFinancialYear');
        this.jwt = undefined;
        this.activeCompany = undefined;
        this.setLoadIndicatorVisibility(false);

        if (!this.router.url.startsWith('/init')) {
            this.router.navigate(['/init/login']);
        }
    }

    public canActivateRoute(user: UserDto, url: string): boolean {
        // First check if the route is a public route
        if (PUBLIC_ROUTES.some(route => route === url)) {
            return true;
        }

        const rootRoute = this.getRootRoute(url);
        if (
            !rootRoute ||
            PUBLIC_ROOT_ROUTES.some(route => route === rootRoute)
        ) {
            return true;
        }

        if (!user) {
            return false;
        }

        const permissionKey: string = this.getPermissionKey(url);
        return this.hasUIPermission(user, permissionKey);
    }

    public hasUIPermission(user: UserDto, permission: string) {
        if (!user) {
            return false;
        }

        // Treat missing or empty permissions array as access to everything
        const userPermissions = user['Permissions'] || [];
        if (!userPermissions.length) {
            return true;
        }

        permission = permission.trim();

        // Check for direct match
        let hasPermission = user['Permissions'].some(p => p === permission);

        // Pop permission parts and check for * access
        if (!hasPermission) {
            const permissionSplit = permission.split('_');

            while (permissionSplit.length && !hasPermission) {
                const multiPermision = permissionSplit.join('_') + '_*';
                if (user['Permissions'].some(p => p === multiPermision)) {
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
