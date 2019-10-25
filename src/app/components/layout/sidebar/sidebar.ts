import {Component} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {NavbarLinkService, SidebarState} from '../navbar/navbar-link-service';
import {INavbarLinkSection} from '../navbar/navbar-links-common';
import {Observable} from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';
import * as _ from 'lodash';

@Component({
    selector: 'uni-sidebar',
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.sass']
})
export class UniSidebar {
    public state: SidebarState;
    public popover: boolean;

    public expandedSectionIndex: number = 0;
    public navbarLinkSections: INavbarLinkSection[] = [];

    private scrollbar: PerfectScrollbar;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private navbarService: NavbarLinkService,
        private router: Router
    ) {
        this.navbarService.sidebarState$.subscribe(state => this.state = state);

        this.navbarService.linkSections$.subscribe(sections => {

            // this.navbarLinkSections = ;
            this.navbarLinkSections = _.cloneDeep(sections).filter(section => {
                section.linkGroups = section.linkGroups.filter(group => {
                    group.links = group.links.filter(link => {
                        return link.activeInSidebar;
                    });

                    if (group.links.length) {
                        return group;
                    }
                });

                if (section.isOnlyLinkSection || section.linkGroups.length) {
                    return section;
                }
            });

            this.getActiveSection();

            setTimeout(() => {
                if (this.scrollbar) {
                    this.scrollbar.update();
                }
            });
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.getActiveSection();
            }
        });
    }

    public ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#scroll-container');
        setTimeout(() => {
            this.breakpointObserver
                .observe(['(max-width: 1010px)'])
                .subscribe((state: BreakpointState) => {
                    if (state.matches) {
                        this.state = 'collapsed';
                        this.navbarService.sidebarState$.next(this.state);
                    }
                });
        });
    }

    public getActiveSection() {
        try {
            const route = this.router.url;

            if (this.router.url === '/') {
                this.expandedSectionIndex = 0;
                return;
            }

            const sectionsWithSameBase = this.navbarLinkSections.filter(nbls => {
                return this.router.url.split('/')[1] === nbls.url.replace('/', '');
            });

            let activeIndex = -1;

            if (sectionsWithSameBase.length === 1) {
                activeIndex = this.navbarLinkSections.findIndex(sec => sec.name === sectionsWithSameBase[0].name);
            } else {
                const item = sectionsWithSameBase.find(section => {
                    return section.linkGroups.filter(linkGroup => {
                        return linkGroup.links.filter(link => {
                             return link.url !== '/' && route.includes(link.url);
                        }).length > 0;
                    }).length > 0 ;
                });
                if (item) {
                    activeIndex = this.navbarLinkSections.findIndex(sec => sec.name === item.name);
                }
            }

            if (activeIndex >= 0) {
                this.expandedSectionIndex = activeIndex;
            }
        } catch (e) {
            console.error(e);
        }
    }

    public toggleSection(index: number, section?: INavbarLinkSection) {

        // Support home button for SR. Just navigate and return
        if (section && section.isOnlyLinkSection) {
            this.navigate(section.url);
            return;
        }

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

    public navigate(url: string) {
        this.router.navigateByUrl(url);
    }

    public navigateToSectionUrl(section: INavbarLinkSection, clickEvent: MouseEvent) {
        // Icon clicks on collapsed sidebar should not navigate
        if ((section.url || section.onIconClickUrl) && (this.popover || this.state === 'expanded')) {
            clickEvent.stopPropagation();
            this.router.navigateByUrl(section.onIconClickUrl || section.url);
        }
    }

    showMegaMenu() {
        this.navbarService.megaMenuVisible$.next(true);
    }
}
