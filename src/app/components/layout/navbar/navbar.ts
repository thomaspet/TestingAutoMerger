import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {NavbarLinkService, INavbarLinkSection} from './navbar-link-service';
import {TabService} from './tabstrip/tabService';
import {UserService} from '@app/services/services';
import {User} from '@uni-entities';

@Component({
    selector: 'uni-navbar',
    template: `
        <uni-mega-menu *ngIf="navbarService.megaMenuVisible$ | async"></uni-mega-menu>

        <section class="navbar">
            <section class="navbar-left">
                <img class="ue-logo"
                    src="../../../../../assets/ue-logo-small.png"
                    alt="Uni Economy logo"
                    [routerLink]="'/'"
                />

                <i
                    class="material-icons hamburger-toggle"
                    role="button"
                    (click)="toggleSidebarState()">
                    menu
                </i>
            </section>

            <section class="navbar-right">
                <uni-navbar-search></uni-navbar-search>
                <navbar-create-new></navbar-create-new>

                <i role="link" class="material-icons bureau-link" routerLink="bureau">
                    business
                </i>

                <uni-company-dropdown></uni-company-dropdown>
                <uni-notifications></uni-notifications>

                <section class="navbar-settings" *ngIf="settingsLinks?.length || adminLinks?.length">
                    <i
                        role="button"
                        class="material-icons"
                        [matMenuTriggerFor]="settingsMenu">
                        settings
                    </i>

                    <mat-menu #settingsMenu="matMenu" yPosition="below" [overlapTrigger]="false">
                        <ng-template matMenuContent>
                            <section class="navbar-link-dropdown">
                                <section class="link-section" *ngIf="settingsLinks?.length">
                                    <strong>Innstillinger</strong>
                                    <ul>
                                        <li *ngFor="let link of settingsLinks">
                                            <a [routerLink]="link.url">{{link.name}}</a>
                                        </li>
                                    </ul>
                                </section>

                                <section class="link-section" *ngIf="adminLinks?.length">
                                    <strong>Admin</strong>
                                    <ul>
                                        <li *ngFor="let link of adminLinks">
                                            <a [routerLink]="link.url">{{link.name}}</a>
                                        </li>
                                    </ul>
                                </section>
                            </section>
                        </ng-template>
                    </mat-menu>
                </section>

                <navbar-user-dropdown></navbar-user-dropdown>
            </section>

        </section>

        <section class="tab-strip" [ngClass]="'sidebar-' + sidebarState">
            <uni-tabstrip></uni-tabstrip>

            <!--
            <a class="tabstrip-feedback" href="mailto:design@unimicro.no">
                <i class="material-icons">comment</i>
                Gi tilbakemelding
            </a>
            -->

            <uni-tabstrip-help></uni-tabstrip-help>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniNavbar {
    public sidebarState: string;

    public user: User;
    public licenseRole: string;

    public settingsLinks: any[] = [];
    public adminLinks: any[] = [];

    constructor(
        public userService: UserService,
        public navbarService: NavbarLinkService,
        public tabService: TabService,
        public cdr: ChangeDetectorRef
    ) {}

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
            } catch (e) {
                console.error(e);
            }

            this.cdr.markForCheck();
        });
    }

    public toggleSidebarState() {
        const newState = this.navbarService.sidebarState$.value === 'expanded'
            ? 'collapsed' : 'expanded';

        this.navbarService.sidebarState$.next(newState);
    }
}
