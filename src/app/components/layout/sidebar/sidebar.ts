import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {AuthService} from '@app/authService';
import {NAVBAR_LINKS} from '../navbar/navbar-links';
import {NavbarLinkService, INavbarLinkSection, SidebarState} from '../navbar/navbar-link-service';
import {Observable} from 'rxjs/Observable';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'uni-sidebar',
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.sass']
})
export class UniSidebar {
    public state: SidebarState;
    public expandedSectionIndex: number = 0;
    public navbarLinkSections: INavbarLinkSection[];

    private scrollbar: PerfectScrollbar;
    private temporaryExpandedState: boolean;

    constructor(
        private authService: AuthService,
        private navbarService: NavbarLinkService,
        private router: Router
    ) {
        this.navbarService.sidebarState$.subscribe(state => this.state = state);

        this.navbarService.linkSections$.subscribe(sections => {
            this.navbarLinkSections = sections;
            this.getActiveSection();

            setTimeout(() => {
                if (this.scrollbar) {
                    this.scrollbar.update();
                }
            });
        });

        Observable.fromEvent(window, 'resize')
            .debounceTime(200)
            .subscribe(event => {
                if (this.state === 'expanded' && window.innerWidth <= 1010) {
                    this.state = 'collapsed';
                    this.navbarService.sidebarState$.next(this.state);
                }
            });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.getActiveSection();
            }
        });
    }

    public ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#scroll-container');
    }

    public getActiveSection() {
        try {
            const rootRoute = this.router.url.split('/')[1];
            const activeIndex = this.navbarLinkSections.findIndex(section => {
                return section.url.replace('/', '') === rootRoute;
            });

            if (activeIndex >= 0) {
                this.expandedSectionIndex = activeIndex;
            }
        } catch (e) {
            console.error(e);
        }
    }

    public toggleSection(index) {
        if (this.expandedSectionIndex === index) {
            this.expandedSectionIndex = undefined;
        } else {
            this.expandedSectionIndex = index;
        }

        // If using collapsed sidebar expand it temporarily
        if (this.state === 'collapsed') {
            this.temporaryExpandedState = true;
            this.navbarService.sidebarState$.next('expanded');
        }

        if (this.scrollbar) {
            setTimeout(() => this.scrollbar.update());
        }
    }

    public navigateToSectionUrl(url: string) {
        // Icon clicks on collapsed sidebar should not navigate
        if (url && this.state !== 'collapsed') {
            this.router.navigateByUrl(url);
        }
    }

    public collapseMeMaybe() {
        if (this.temporaryExpandedState) {
            this.temporaryExpandedState = false;
            // this.expandedSectionIndex = undefined;
            this.navbarService.sidebarState$.next('collapsed');
        }
    }

    public toggleState() {
        if (this.state === 'collapsed') {
            this.navbarService.sidebarState$.next('expanded');
        } else if (this.state === 'expanded') {
            // this.expandedSectionIndex = undefined;
            this.navbarService.sidebarState$.next('collapsed');
        }
    }

    public hideSidebar() {
        this.navbarService.sidebarState$.next('hidden');
    }
}
