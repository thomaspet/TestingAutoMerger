import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Input
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {NavbarLinkService, INavbarLinkSection} from '../navbar-link-service';

@Component({
    selector: 'uni-horizontal-navbar',
    templateUrl: './horizontal-nav.html',
    styleUrls: ['./horizontal-nav.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalNavbar {
    public linkSections: INavbarLinkSection[];
    public isExpanded: boolean = false;
    public sidebarVisible: boolean;

    constructor(
        private navbarService: NavbarLinkService,
        private cdr: ChangeDetectorRef
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

    public close() {
        this.isExpanded = false;
        this.cdr.markForCheck();
    }

    public toggleSidebar() {
        if (this.sidebarVisible) {
            this.navbarService.sidebarState$.next('hidden');
        } else {
            this.navbarService.sidebarState$.next('expanded');
        }

        this.isExpanded = false;
        this.cdr.markForCheck();
    }
}
