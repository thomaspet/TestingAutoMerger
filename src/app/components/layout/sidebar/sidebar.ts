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
    public popover: boolean;

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
        if (this.expandedSectionIndex === index && (this.state === 'expanded' || this.popover)) {
            this.expandedSectionIndex = undefined;
        } else {
            this.expandedSectionIndex = index;
        }

        if (this.state === 'collapsed') {
            this.popover = true;
        }

        if (this.scrollbar) {
            setTimeout(() => this.scrollbar.update());
        }
    }

    public onMouseLeave() {
        if (this.popover) {
            this.popover = false;
            if (this.scrollbar) {
                setTimeout(() => this.scrollbar.update());
            }
        }
    }

    public navigateToSectionUrl(url: string, clickEvent: MouseEvent) {
        // Icon clicks on collapsed sidebar should not navigate
        if (url && (this.popover || this.state === 'expanded')) {
            clickEvent.stopPropagation();
            this.router.navigateByUrl(url);
        }
    }

    public showMegaMenu() {
        this.navbarService.megaMenuVisible$.next(true);
    }
}
