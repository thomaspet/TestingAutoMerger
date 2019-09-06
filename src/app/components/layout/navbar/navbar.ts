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
    templateUrl: './navbar.html',
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
