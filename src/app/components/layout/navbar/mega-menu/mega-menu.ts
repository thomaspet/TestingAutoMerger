import {
    Component,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    HostListener
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniTranslationService} from '@app/services/services';
import {NavbarLinkService, INavbarLinkSection} from '../navbar-link-service';
import { INavbarLink } from '../navbar-links';
import * as _ from 'lodash';

@Component({
    selector: 'uni-mega-menu',
    templateUrl: './mega-menu.html',
    styleUrls: ['./mega-menu.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniMegaMenu {
    @ViewChild('searchInput')
    searchInput: ElementRef;

    defaultLinkSection: INavbarLinkSection[];
    linkSections: INavbarLinkSection[];
    defaultSetup: INavbarLinkSection[];
    filteredLinkSections: INavbarLinkSection[][];
    searchControl: FormControl = new FormControl('');
    searchString: string = '';
    isDirty: boolean = false;

    constructor (
        private navbarService: NavbarLinkService,
        private cdr: ChangeDetectorRef,
        private translate: UniTranslationService,
    ) {
        this.navbarService.linkSections$.subscribe(sections => {
            this.defaultLinkSection = sections;
            this.initValues();
        });
    }

    initValues() {
        this.linkSections = _.cloneDeep(this.defaultLinkSection.filter(section => !section.hidden && !section.isOnlyLinkSection));
        this.defaultSetup = _.cloneDeep(this.linkSections);
        this.sortAfterMegaMenuIndex();
        this.cdr.markForCheck();
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

    getClass(link: any) {
        return this.searchString !== '' && link.name &&
        this.translate.translate(link.name).toLowerCase().includes(this.searchString.toLowerCase())
            ? 'isSearchMatch'
            : '';
    }

    ngAfterViewInit() {
        if (this.searchInput) {
            this.searchInput.nativeElement.focus();
        }
    }

    linkSelect(link: INavbarLink) {
        link.activeInSidebar = !link.activeInSidebar;
        this.isDirty = JSON.stringify(this.linkSections) !== JSON.stringify(this.defaultSetup);
    }

    saveMenuStructure() {
        if (this.linkSections.length !== this.defaultSetup.length) {
            const elements = this.linkSections.filter(l => l.isOnlyLinkSection);
            elements.forEach((elem) => {
                this.defaultSetup.unshift(elem);
            });
        }

        this.navbarService.saveSidebarLinks(this.defaultSetup);
        this.isDirty = false;
    }

    resetChanges() {
        this.defaultSetup = JSON.parse(JSON.stringify(this.linkSections));
        this.sortAfterMegaMenuIndex();
        this.isDirty = false;
    }

    close() {
        this.navbarService.megaMenuVisible$.next(false);
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === 27) {
            this.close();
        }
    }
}
