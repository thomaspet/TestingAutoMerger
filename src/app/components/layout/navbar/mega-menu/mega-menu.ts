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

    linkSections: INavbarLinkSection[];
    defaultSetup: INavbarLinkSection[];
    filteredLinkSections: INavbarLinkSection[][];
    searchControl: FormControl = new FormControl('');
    searchString: string = '';
    isDirty: boolean = false;

    constructor (
        private navbarService: NavbarLinkService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private translate: UniTranslationService,
    ) {
        this.navbarService.linkSections$.subscribe(sections => {
            this.linkSections = sections;
            this.defaultSetup = _.cloneDeep(this.linkSections.filter(section => !section.hidden && !section.isOnlyLinkSection));
            this.sortAfterMegaMenuIndex();
            this.cdr.markForCheck();
        });

        this.searchControl.valueChanges.subscribe(searchText => {
            if (!searchText || !searchText.length) {
                this.sortAfterMegaMenuIndex();
                return;
            }

            // let sections: INavbarLinkSection[] = _.cloneDeep(this.linkSections);
            // sections = sections.map(section => {
            //     section.linkGroups = section.linkGroups.map(group => {
            //         group.links = group.links.filter(link => {
            //             link['_searchValue'] = this.translate.translate(link.name);
            //             return link.name && this.translate.translate(link.name).toLowerCase().includes(searchText.toLowerCase());
            //         });

            //         return group;
            //     });

            //     return section;
            // });

            // this.defaultSetup = sections.filter(section => {
            //     return section.linkGroups.some(group => group.links.length > 0);
            // });
            // this.sortAfterMegaMenuIndex();
        });
    }

    sortAfterMegaMenuIndex() {
        this.filteredLinkSections = [];

        this.defaultSetup.forEach((section) => {
            if (section.megaMenuGroupIndex || section.megaMenuGroupIndex === 0) {
                if (this.filteredLinkSections.length > section.megaMenuGroupIndex
                    && this.filteredLinkSections[section.megaMenuGroupIndex].length) {

                    this.filteredLinkSections[section.megaMenuGroupIndex].push(section);
                } else {
                    this.filteredLinkSections.push([section]);
                }
            } else {
                this.filteredLinkSections.push([section]);
            }
        });
    }

    public getClass(link) {
        return this.searchString !== '' && link.name &&
        this.translate.translate(link.name).toLowerCase().includes(this.searchString.toLowerCase())
            ? 'isSearchMatch'
            : '';
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
        this.isDirty = JSON.stringify(this.linkSections) !== JSON.stringify(this.defaultSetup);
    }

    public saveMenuStructure() {
        if (this.linkSections.length !== this.defaultSetup.length) {
            const elements = this.linkSections.filter(l => l.isOnlyLinkSection);
            elements.forEach((elem) => {
                this.defaultSetup.unshift(elem);
            });
        }

        this.navbarService.saveSidebarLinks(this.defaultSetup);
        this.linkSections = this.defaultSetup;
        this.defaultSetup = _.cloneDeep(this.linkSections.filter(section => !section.hidden && !section.isOnlyLinkSection));
        this.sortAfterMegaMenuIndex();
        this.isDirty = false;
    }

    public resetChanges() {
        this.defaultSetup = JSON.parse(JSON.stringify(this.linkSections));
        this.sortAfterMegaMenuIndex();

        this.isDirty = false;
    }

    public close() {
        this.navbarService.megaMenuVisible$.next(false);
    }

    // TODO: autofocus search input
    // TODO: escape key handling

}
