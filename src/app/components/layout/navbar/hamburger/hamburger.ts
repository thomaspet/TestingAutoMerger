import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Input
} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {NavbarLinkService, INavbarLinkSection} from '../navbar-link-service';

@Component({
    selector: 'uni-hamburger-menu',
    templateUrl: './hamburger.html',
    styleUrls: ['./hamburger.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniHamburgerMenu {
    public linkSections: INavbarLinkSection[];
    public isExpanded: boolean = false;
    public sidebarVisible: boolean;

    constructor(
        private navbarService: NavbarLinkService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {
        this.navbarService.linkSections$.subscribe(sections => {
            this.linkSections = sections.filter(section => !section.hidden);
            this.cdr.markForCheck();
        });

        this.navbarService.sidebarState$.subscribe(state => {
            this.sidebarVisible = state !== 'hidden';
            this.cdr.markForCheck();
        });
    }

    public navigateToSection(url: string) {
        if (url) {
            this.router.navigateByUrl(url);
        }
    }

    public close() {
        this.isExpanded = false;
        this.cdr.markForCheck();
    }

    public toggleSidebar() {
        // if (this.sidebarVisible) {
        //     this.navbarService.sidebarState$.next('hidden');
        // } else {
        //     this.navbarService.sidebarState$.next('expanded');
        // }

        const state = this.navbarService.sidebarState$.value;
        if (state === 'expanded') {
            this.navbarService.sidebarState$.next('collapsed');
        } else {
            this.navbarService.sidebarState$.next('expanded');
        }

        this.isExpanded = false;
        this.cdr.markForCheck();
    }
}
