import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {NavbarLinkService} from './navbar-link-service';
import {AuthService} from '@app/authService';
import {TabService} from './tabstrip/tabService';
import {UserService} from '@app/services/services';
import {User, ContractLicenseType} from '@uni-entities';

import {SmartSearchService} from '../smart-search/smart-search.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'uni-navbar',
    template: `
        <section class="navbar">
            <section class="navbar-left">
                <section routerLink="/" id="logo"></section>

                <i *ngIf="hasActiveContract"
                    class="material-icons hamburger-toggle"
                    role="button"
                    (click)="toggleSidebarState()">
                    menu
                </i>
            </section>

            <section class="navbar-right">
                <section *ngIf="isDemo && !demoExpired" class="demo-company-notifier" routerLink="/contract-activation">
                    {{demoText}}
                    <a>Aktiver nå</a>
                </section>

                <section *ngIf="isDemo && demoExpired" class="demo-company-notifier expired">
                    Prøveperiode utløpt
                </section>

                <section *ngIf="isTemplateCompany"
                    class="template-company-warning"
                    matTooltip="Denne klienten er merket som mal. Det vil si at man ved oppretting av nye klienter kan kopiere data og innstillinger fra den. Man bør derfor kun registrere data som skal kopieres til nye klienter.">
                    MALKLIENT
                </section>

                <button *ngIf="hasActiveContract" class="navbar-search" mat-icon-button (click)="openSearch()">
                    <mat-icon aria-label="Search">search</mat-icon>
                </button>

                <navbar-create-new *ngIf="hasActiveContract"></navbar-create-new>

                <i *ngIf="hasActiveContract" role="link" class="material-icons bureau-link" routerLink="bureau">
                    business
                </i>

                <uni-company-dropdown></uni-company-dropdown>
                <notifications></notifications>

                <section class="navbar-settings" *ngIf="hasActiveContract && (settingsLinks?.length || adminLinks?.length)">
                    <i class="material-icons" #settingsToggle role="button">settings</i>

                    <dropdown-menu [trigger]="settingsToggle" minWidth="14rem">
                        <ng-template>
                            <ng-container *ngIf="settingsLinks?.length">
                                <span class="dropdown-menu-header">Innstillinger</span>
                                <a class="dropdown-menu-item"
                                    *ngFor="let link of settingsLinks"
                                    [routerLink]="link.url">
                                    {{link.name}}
                                </a>
                            </ng-container>

                            <ng-container *ngIf="adminLinks?.length">
                                <span class="dropdown-menu-header">Admin</span>
                                <a class="dropdown-menu-item"
                                    *ngFor="let link of adminLinks"
                                    [routerLink]="link.url">
                                    {{link.name}}
                                </a>
                            </ng-container>
                        </ng-template>
                    </dropdown-menu>
                </section>

                <navbar-user-dropdown></navbar-user-dropdown>
            </section>

        </section>

        <section *ngIf="hasActiveContract" class="tab-strip" [ngClass]="'sidebar-' + sidebarState">
            <uni-tabstrip></uni-tabstrip>
            <uni-tabstrip-help></uni-tabstrip-help>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniNavbar {
    sidebarState: string;

    user: User;
    licenseRole: string;
    hasActiveContract: boolean;
    isTemplateCompany: boolean;

    isDemo: boolean;
    demoExpired: boolean;
    demoText: string;

    settingsLinks: any[] = [];
    adminLinks: any[] = [];

    onDestroy$ = new Subject();

    constructor(
        public authService: AuthService,
        public userService: UserService,
        public navbarService: NavbarLinkService,
        public tabService: TabService,
        public cdr: ChangeDetectorRef,
        private smartSearchService: SmartSearchService,
    ) {
        this.authService.authentication$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(auth => {
            if (auth && auth.activeCompany) {
                this.hasActiveContract = auth.hasActiveContract;
                this.isTemplateCompany = auth.activeCompany.IsTemplate;
                this.isDemo = auth.isDemo;

                if (auth.isDemo) {
                    const contract = (auth.user.License && auth.user.License.ContractType) || <ContractLicenseType> {};
                    const daysRemaining = moment(contract.TrialExpiration).diff(moment(), 'days');
                    if (daysRemaining > 0) {
                        const daysWording = daysRemaining === 1 ? 'dag' : 'dager';
                        this.demoText = `Demo (${daysRemaining} ${daysWording} igjen)`;
                    } else {
                        this.demoExpired = true;
                        this.demoText = '';
                    }
                }

                this.cdr.markForCheck();
            }
        });
    }

    public ngOnInit() {
        this.userService.getCurrentUser().subscribe(user => {
            this.user = user;

            const licenseRoles: string[] = [];
            if (user['License'] && user['License'].ContractType) {
                if (user['License'].ContractType.TypeName) {
                    licenseRoles.push(user['License'].ContractType.TypeName);
                }
            }
            if (user['License'] && user['License'].UserType) {
                if (user['License'].UserType.TypeName) {
                    licenseRoles.push(user['License'].UserType.TypeName);
                }
            }

            this.licenseRole = licenseRoles.join('/');
        });

        this.navbarService.sidebarState$.subscribe(state => {
            this.sidebarState = state;
        });

        this.navbarService.linkSections$.subscribe(linkSections => {
            this.settingsLinks = [];
            this.adminLinks = [];

            try {
                const settingsSection = linkSections.find(section => section.url === '/settings');
                this.settingsLinks = settingsSection.linkGroups[0].links;
                this.adminLinks = settingsSection.linkGroups[1].links;
            } catch (e) {/* dont care, just means the user doesnt have settings permissions */}

            this.cdr.markForCheck();
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    openSearch() {
        this.smartSearchService.open();
    }

    public toggleSidebarState() {
        const newState = this.navbarService.sidebarState$.value === 'expanded'
            ? 'collapsed' : 'expanded';

        this.navbarService.sidebarState$.next(newState);
    }
}
