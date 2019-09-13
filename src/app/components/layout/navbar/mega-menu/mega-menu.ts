import {
    Component,
    ViewChild,
    ElementRef,
    Output,
    ChangeDetectionStrategy,
    EventEmitter,
    ChangeDetectorRef,
    HostListener
} from '@angular/core';

import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {UniTranslationService} from '@app/services/services';
import * as _ from 'lodash';

import {NavbarLinkService, INavbarLinkSection} from '../navbar-link-service';
import { INavbarLink } from '../navbar-links';

@Component({
    selector: 'uni-mega-menu',
    templateUrl: './mega-menu.html',
    styleUrls: ['./mega-menu.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniMegaMenu {
    @ViewChild('searchInput') public searchInput: ElementRef;

    public linkSections: INavbarLinkSection[];
    public filteredLinkSections: INavbarLinkSection[];
    public searchControl: FormControl = new FormControl('');

    constructor(
        private navbarService: NavbarLinkService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private translate: UniTranslationService,
    ) {
        this.navbarService.linkSections$.subscribe(sections => {
            this.linkSections = sections.filter(section => !section.hidden);
            this.filteredLinkSections = this.linkSections;
            this.cdr.markForCheck();
        });

        this.searchControl.valueChanges.subscribe(searchText => {
            if (!searchText || !searchText.length) {
                this.filteredLinkSections = this.linkSections;
                return;
            }

            let sections: INavbarLinkSection[] = _.cloneDeep(this.linkSections);
            sections = sections.map(section => {
                section.linkGroups = section.linkGroups.map(group => {
                    group.links = group.links.filter(link => {
                        return link.name && this.translate.translate(link.name).toLowerCase().includes(searchText.toLowerCase());
                    });

                    return group;
                });

                return section;
            });

            this.filteredLinkSections = sections.filter(section => {
                return section.linkGroups.some(group => group.links.length > 0);
            });
        });
    }

    public ngAfterViewInit() {
        if (this.searchInput) {
            this.searchInput.nativeElement.focus();
        }
    }

    @HostListener('document:keydown', ['$event'])
    public onKeydown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === 27) {
            this.close();
        }
    }

    public navigate(url: string) {
        if (url) {
            this.router.navigateByUrl(url);
        }

        this.close();
    }

    public linkSelect(link: INavbarLink) {
        link.activeInSidebar = !link.activeInSidebar;
    }

    public saveMenuStructure() {
        this.navbarService.saveSidebarLinks(this.filteredLinkSections);
    }

    public close() {
        this.navbarService.megaMenuVisible$.next(false);
    }

    // TODO: autofocus search input
    // TODO: escape key handling

}
