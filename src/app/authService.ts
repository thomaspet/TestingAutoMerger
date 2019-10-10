import {Injectable, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {Company, UserDto, ContractLicenseType} from './unientities';
import {ReplaySubject} from 'rxjs';
import 'rxjs/add/operator/map';
import { UserManager, Log, MetadataService, User } from 'oidc-client';
import * as moment from 'moment';
import * as $ from 'jquery';
import * as jwt_decode from 'jwt-decode';

export interface IAuthDetails {
    token: string;
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
    'bank-reconciliation' // TODO: ADD PERMISSION AND REMOVE
];

const PUBLIC_ROUTES = [];

@Injectable()
export class AuthService {
    userManager: UserManager;
    userLoadededEvent: EventEmitter<User> = new EventEmitter<User>();
    loggedIn = false;

    public requestAuthentication$: EventEmitter<any> = new EventEmitter();
    public companyChange: EventEmitter<Company> = new EventEmitter();

    public authentication$: ReplaySubject<IAuthDetails> = new ReplaySubject<
        IAuthDetails
    >(1);
    public filesToken$: ReplaySubject<string> = new ReplaySubject(1);
    public jwt: string;
    public jwtDecoded: any;
    public activeCompany: any;
    public currentUser: UserDto;
    public user: User;
    public IdsUser: User; // user coming from identity server
    public filesToken: string;

    private headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

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
        this.userManager = this.getUserManager();
        this.userManager
            .getUser()
            .then(user => {
                if (user && !user.expired) {
                    this.loggedIn = true;
                    this.IdsUser = user;
                    this.userLoadededEvent.emit(user);
                } else {
                    this.loggedIn = false;
                }
            })
            .catch(err => {
                this.loggedIn = false;
            });
        this.userManager.events.addSilentRenewError(function(res) {
            console.log(res);
        });

        this.userManager.events.addUserLoaded(() => {
            this.userManager.getUser().then(user => {
                this.user = user;
                this.jwt = user.access_token;
                this.jwtDecoded = this.decodeToken(this.jwt);
                this.storage.saveOnUser('jwt', this.jwt);
            });
        });
        this.activeCompany = this.storage.getOnUser('activeCompany');

        this.jwt = this.storage.getOnUser('jwt');
        this.jwtDecoded = this.decodeToken(this.jwt);
        this.filesToken = this.storage.getOnUser('filesToken');

        if (this.jwt && this.activeCompany) {
            this.setLoadIndicatorVisibility(true);
            this.loadCurrentSession().subscribe(
                auth => {
                    this.filesToken$.next(this.filesToken);

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
                    this.setLoadIndicatorVisibility(false);
                    this.authentication$.next({
                        activeCompany: undefined,
                        token: undefined,
                        user: undefined,
                        hasActiveContract: false
                    });

                    this.clearAuthAndGotoLogin();
                }
            );
        } else {
            this.authentication$.next({
                activeCompany: undefined,
                token: undefined,
                user: undefined,
                hasActiveContract: false
            });
        }

        // Check expired status every minute, with a 10 minute offset on the expiration check
        // This allows the user to re-authenticate before http calls start 401'ing.
        // Also check if we have a files token, and re-authenticate with uni-files if not.
        setInterval(() => {
            if (this.jwt && this.isTokenExpired(10)) {
                // this.requestAuthentication$.emit(true);
            }

            if (this.jwt && !this.filesToken) {
                this.authenticateUniFiles();
            }
        }, 60000);
    }

    setLoadIndicatorVisibility(visible: boolean) {
        if (visible) {
            $('#data-loading-spinner').fadeIn(250);
        } else {
            $('#data-loading-spinner').fadeOut(250);
        }
    }

    private getUserManager(): UserManager {
        const baseUrl = window.location.origin;
        const settings: any = {
            authority: environment.authority,
            client_id: environment.client_id,
            redirect_uri: baseUrl + environment.redirect_uri,
            post_logout_redirect_uri: baseUrl + environment.post_logout_redirect_uri,
            response_type: environment.response_type,
            scope: environment.scope,
            filterProtocolClaims: environment.filterProtocolClaims,
            loadUserInfo: environment.loadUserInfo,
            automaticSilentRenew: true,
            silent_redirect_uri: baseUrl + environment.silent_redirect_uri
        };

        return new UserManager(settings);
    }

    /**
     * Authenticates the user and returns an observable of the response
     * @param {Object} credentials
     * @returns Observable
     */
    public authenticate(): void {
        this.userManager.signinRedirect();
    }

    public authenticateUniFiles(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.jwt) {
                reject('No jwt set');
            }

            const uniFilesUrl =
                environment.BASE_URL_FILES + '/api/init/sign-in';
            this.http
                .post(uniFilesUrl, JSON.stringify(this.jwt), {
                    headers: this.headers,
                    observe: 'response'
                })
                .subscribe(
                    res => {
                        if (res && res.status === 200) {
                            this.filesToken = res.body.toString();
                            this.storage.saveOnUser(
                                'filesToken',
                                this.filesToken
                            );

                            this.filesToken$.next(this.filesToken);
                            resolve(this.filesToken);
                        }
                    },
                    err => {
                        reject('Error authenticating');
                        console.log('Error authenticating:', err);
                    }
                );
        });
    }

    /**
     * Sets the current active company
     * @param {Object} activeCompany
     */
    public setActiveCompany(
        activeCompany: Company,
        redirectUrl?: string
    ): void {
        let redirect = redirectUrl;
        if (!redirect) {
            redirect = this.getSafeRoute(this.router.url);
        }

        this.router.navigateByUrl('/reload', {skipLocationChange: true}).then(navigationSuccess => {
            if (navigationSuccess) {
                this.setLoadIndicatorVisibility(true);
                this.storage.saveOnUser('activeCompany', activeCompany);
                this.storage.saveOnUser('lastActiveCompanyKey', activeCompany.Key);

                this.activeCompany = activeCompany;
                this.companyChange.emit(activeCompany);

                this.loadCurrentSession().take(1).subscribe(
                    authDetails => {
                        this.authentication$.next(authDetails);
                        const forcedRedirect = this.getForcedRedirect(authDetails);
                        if (forcedRedirect) {
                            redirect = forcedRedirect;
                        }

                        setTimeout(() => {
                            this.router.navigateByUrl(redirect || '');
                            this.setLoadIndicatorVisibility(false);
                        });
                    },
                    () => {
                        this.storage.removeOnUser('lastActiveCompanyKey');
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

        if (permissions.length === 1 && permissions[0] === 'ui_approval_accounting') {
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
        const url = (environment.BASE_URL
            + environment.API_DOMAINS.BUSINESS
            + 'users?action=current-session')
            .replace(/([^:]\/)\/+/g, '$1');
        return this.http.get<any>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.jwt}`,
                'CompanyKey': this.activeCompany.Key
            }
        }).pipe(
            map(user => {
                this.currentUser = user;

                const contract: ContractLicenseType = (user.License && user.License.ContractType) || {};
                const hasActiveContract = user && !this.isTrialExpired(contract);

                const authDetails = {
                    token: this.jwt,
                    activeCompany: this.activeCompany,
                    user: user,
                    hasActiveContract: hasActiveContract,
                    isDemo: contract.TypeName === 'Demo'
                };

                this.authentication$.next(authDetails);
                return authDetails;
            })
        );
    }

    public getToken(): string {
        return this.jwt;
    }

    /**
     * Returns decoded web token for authenticated user
     * @returns {String}
     */
    public getTokenDecoded(): any {
        return this.jwtDecoded;
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
        return new Promise((resolve, reject) => {
            this.userManager
                .getUser()
                .then(user => {
                    if (user && !user.expired) {
                        this.jwt = user.access_token;
                        this.jwtDecoded = this.decodeToken(this.jwt);
                        this.authenticateUniFiles();

                        this.storage.saveOnUser('jwt', this.jwt);
                        const hasToken: boolean = !!this.jwt;
                        const isTokenDecoded: boolean = !!this.jwtDecoded;
                        const isExpired: boolean = this.isTokenExpired(
                            this.jwtDecoded
                        );
                        resolve(hasToken && isTokenDecoded && !isExpired);
                    }
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }

    /**
     * Returns a boolean indicating whether the user has selected an active company
     * @returns {Boolean}
     */
    public hasActiveCompany(): boolean {
        return !!this.activeCompany;
    }

    /**
     * Removes web token from localStorage and memory, then redirects to /login
     */
    public clearAuthAndGotoLogin(): void  {
        if (this.isAuthenticated()) {
            this.authentication$.next({
                token: undefined,
                activeCompany: undefined,
                user: undefined,
                hasActiveContract: false
            });

            this.filesToken$.next(undefined);

            const url = environment.BASE_URL_INIT + environment.API_DOMAINS.INIT + 'log-out';
            this.http.post(url, '', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.jwt,
                    'CompanyKey': this.activeCompany
                }
            }).subscribe(() => {}, () => {}); // ignore the response
        }

        this.storage.removeOnUser('jwt');
        this.storage.removeOnUser('activeCompany');
        this.storage.removeOnUser('activeFinancialYear');
        this.storage.removeOnUser('filesToken');
        this.storage.removeOnUser('lastActiveCompanyKey');
        this.jwt = undefined;
        this.jwtDecoded = undefined;
        this.activeCompany = undefined;

        this.setLoadIndicatorVisibility(false);
        // this.router.navigateByUrl('init/login');
        this.userManager.signoutRedirect();
    }

    /**
     * Returns the decoded web token
     * @returns {Object}
     */
    private decodeToken(token: string) {
        try {
            if (!token) {
                return undefined;
            } else {
                return jwt_decode(token);
            }
        } catch (e) {}
    }

    /**
     * Returns a boolean indicating whether or not the token is expired.
     * If offSetMinutes is passed to the function it will check if token
     * will expire in the next n minutes
     * @param {Object} decodedToken
     * @param {Number} [offSetMinutes=0] offset
     * @returns {Boolean}
     */
    public isTokenExpired(offsetMinutes: number = 0): boolean {
        if (!this.jwtDecoded) {
            return true;
        }

        const expires = new Date(0);
        expires.setUTCSeconds(this.jwtDecoded.exp);
        return expires.valueOf() < new Date().valueOf() + offsetMinutes * 60000;
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