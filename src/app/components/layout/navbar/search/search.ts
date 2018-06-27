import {
    Component,
    AfterViewInit,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
    HostBinding,
    ChangeDetectionStrategy,
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {NavbarLinkService} from '../navbar-link-service';
import {Observable} from 'rxjs/Observable';
import PerfectScrollbar from 'perfect-scrollbar';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import * as _ from 'lodash';

@Component({
    selector: 'uni-navbar-search',
    template: `
        <nav class="navbar_search" (clickOutside)="close()">

            <input #searchInput
                class="search_input"
                type="search"
                placeholder="Søk etter tema eller funksjon"
                aria.autocomplete="inline"
                role="combobox"
                (keydown)="onKeyDown($event)"
                [formControl]="inputControl"
                (focus)="openAndShowSearch($event)"
            />
            <div class="super_search_fullscreen_container" *ngIf="displayFullscreenSearch">
                <input
                    #globalSearchInput
                    type="text"
                    class="super_search_fullscreen_input"
                    placeholder="Søk i applikasjonen"
                    (keydown)="onKeyDown($event)"
                    [formControl]="inputControl">
                <ul #resultList id="full_screen_search_list">
                    <li
                        *ngFor="let res of searchResultViewConfig; let idx = index"
                        [ngClass]="{ 'isHeaderli' : res.isHeader }"
                        [attr.aria-selected]="selectedIndex === idx && !res.isHeader"
                        (mouseover)="onMouseover(idx)"
                        (click)="confirmSelection()">

                        {{ res.value || res.name }}
                    </li>
                </ul>
                <button mat-icon-button class="fullscreen_search_close_button" (click)="close()">
                    <mat-icon aria-label="Lukk søkebildet">close</mat-icon>
                </button>
            </div>
        </nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarSearch implements AfterViewInit {
    // @ViewChild('searchInput')
    // private inputElement: ElementRef;

    @ViewChild('globalSearchInput')
    private inputElement: ElementRef;

    @ViewChild('resultList')
    private listElement: ElementRef;

    @HostBinding('class.collapsed') searchCollapsed: boolean;

    public inputControl: FormControl = new FormControl('');
    public searchResults: any[] = [];
    public isExpanded: boolean = false;
    private selectedIndex: number;
    private focusPositionTop: number = 0;
    private componentLookupSource: {name: string, url: string}[] = [];
    private confirmedSuperSearchRoutes = [];
    private modelsInSearch = [];
    private shortcuts = [];
    private superSearchTimeout;
    private scrollbar: PerfectScrollbar;
    public searchResultViewConfig = [];
    public displayFullscreenSearch: boolean = false;
    public isPrefixSearch: boolean = false;
    public prefixModule: any;

    constructor(
        public router: Router,
        private cdr: ChangeDetectorRef,
        private navbarLinkService: NavbarLinkService
    ) {
        this.navbarLinkService.linkSections$.subscribe(linkSections => {
            this.componentLookupSource = [];
            this.confirmedSuperSearchRoutes = [];
            this.shortcuts = [];
            linkSections.forEach(section => {

                section.linkGroups.forEach(group => {
                    group.links.forEach( (link) => {
                        if (link.isSuperSearchComponent) {
                            this.confirmedSuperSearchRoutes.push(link);
                        }
                        if (link.shortcutName) {
                            this.shortcuts.push(link);
                        }
                    });
                    this.componentLookupSource.push(...group.links);
                });
            });
        });

        this.checkNavbarWidth();
        Observable.fromEvent(window, 'resize')
            .throttleTime(250)
            .filter(() => !this.searchCollapsed)
            .subscribe(e => this.checkNavbarWidth());

        navbarLinkService.sidebarState$.subscribe(() => {
            setTimeout(() => {
                this.checkNavbarWidth();
            });
        });
    }

    public ngAfterViewInit() {
        Observable.fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
            if (event.ctrlKey && (event.keyCode === 32 || event.keyCode === 36)) {
                this.openAndShowSearch(event);
            }
        });

        this.inputControl.valueChanges.subscribe((inputValue) => {
            this.isExpanded = false;
            this.selectedIndex = 0;
            const query = inputValue.toLowerCase();
            this.searchResultViewConfig = [];

            clearTimeout(this.superSearchTimeout);

            // Check if the user has prefixed the query to search only for a given model
            this.isPrefixSearch = this.checkPrefixForSpecificSearch(query);

            let isShortcutForNew = false;
            if (!this.isPrefixSearch) {
                // Is the user searching for shortcut?
                isShortcutForNew = query.startsWith('ny') || query.startsWith('nytt') || query === '';

                // Add new- and component shortcuts to the search
                this.searchResultViewConfig = [].concat(this.getNewShortcutListInit(query), this.componentLookup(query));
            }

            // Set timeout so we dont call on every key down
            this.superSearchTimeout = setTimeout(() => {

                // Dont search backend when user is searching for new- or component shortcuts
                if (isShortcutForNew) {
                    // Check to see if shortcut search found something.. If not, search backend
                    if (this.searchResultViewConfig.length > 1) {
                        this.isExpanded = true;
                        this.selectedIndex = 1;
                        this.cdr.markForCheck();
                        setTimeout(() => {
                            if (this.scrollbar) {
                                this.scrollbar.update();
                            }
                        });
                    } else {
                        isShortcutForNew = false;
                    }
                }

                if ((!isShortcutForNew && query.length > 3) || this.isPrefixSearch || (query.length && !isNaN(parseInt(query, 10)))) {
                    Observable.forkJoin(this.createQueryArray(query, this.isPrefixSearch, query.substr(0, 1)))
                    .debounceTime(300)
                    .subscribe((res) => {
                        this.searchResultViewConfig = this.searchResultViewConfig.concat(this.generateConfigObject(res));
                        this.isExpanded = true;
                        this.cdr.markForCheck();
                        setTimeout(() => {
                            if (this.scrollbar) {
                                this.scrollbar.update();
                            }
                        });
                    });
                }
            }, 300);
        });
    }

    private generateConfigObject(rawData: any) {
        const dataForViewRender = [];

        // Loop all the arrays in the raw data from server
        rawData.forEach((data, ind) => {

            // Loop all individual arrays of given component
            data.forEach((dataset, index) => {
                if (index === 0) {
                    dataForViewRender.push({
                        isHeader: true,
                        url: '',
                        value: this.isPrefixSearch ? this.prefixModule.name : this.modelsInSearch[ind].name
                    });
                }

                let valueString = '';
                for (const key in dataset) {
                    if (valueString === '' && !key.includes('ID')) {
                        valueString += dataset[key] || 'Kladd';
                    } else if (!key.includes('ID')) {
                        valueString += ' - ' + dataset[key] || 'Kladd';
                    }
                }

                const url = this.isPrefixSearch
                    ? this.prefixModule.url + '/' + dataset[Object.keys(dataset)[0]]
                    : this.modelsInSearch[ind].url + '/' + dataset[Object.keys(dataset)[0]];

                dataForViewRender.push({
                    isHeader: false,
                    url: url,
                    value: valueString
                });
            });
        });

        if (!dataForViewRender.length && !this.searchResultViewConfig.length) {
            dataForViewRender.push(
                {
                    isHeader: true,
                    url: '/',
                    value: 'Ingen treff på søk. Skriveleif?'
                }
            );
        } else {
            this.selectedIndex = 1;
        }

        return dataForViewRender;
    }

    private openAndShowSearch(event) {
        event.preventDefault();
        this.displayFullscreenSearch = true;
        this.cdr.markForCheck();
        // Show shortcuts and components on default open.. Should also get "Last 5 ..." from new history route in the future..
        this.searchResultViewConfig = [].concat(this.getNewShortcutListInit(''), this.componentLookup(''));
        this.selectedIndex = 1;
        setTimeout(() => {
            if (this.inputElement) {
                this.inputElement.nativeElement.focus();
            }
            this.scrollbar = new PerfectScrollbar('#full_screen_search_list');
        }, 50);
    }

    private checkPrefixForSpecificSearch(query: string) {
        // Check first to see if the user has added a '.' as second character to indicate prefix search
        if (query.substr(1, 1) === '.') {
            // Check to see if the user has entered a valid prefic value before the '.'
            if (['f', 'o', 't', 'a', 'l', 'p', 'k'].indexOf(query.substr(0, 1)) >= 0) {
                return true;
            }
        }
        return false;
    }

    private createQueryArray(query: string, withPrefix: boolean = false, prefix?: string) {
        const queries = [];
        this.modelsInSearch = [];
        let filterValue = 'startswith'; // query.length > 3 ? 'contains' : '';

        const searchRoutes = withPrefix
            ? this.confirmedSuperSearchRoutes.filter(route => route.prefix === prefix)
            : this.confirmedSuperSearchRoutes;

        if (searchRoutes.length) {
            this.prefixModule = {
                name: searchRoutes[0].name,
                url: searchRoutes[0].url
            };
        }

        query = withPrefix ? query.substr(2, query.length - 1) : query;

        if (query.substr(0, 1) === '*') {
            filterValue = 'contains';
            query = query.substr(1, query.length - 1);
        }

        searchRoutes.forEach((route) => {
            const filteredSelects = [route.selects[0]];

            for (let i = 1; i < route.selects.length; i++) {
                if (route.selects[i].isNumeric !== isNaN(parseInt(query, 10))) {
                    filteredSelects.push(route.selects[i]);
                }
            }

            let queryStringInit = '';

            if (filteredSelects.length > 1) {
                this.modelsInSearch.push(route);
                const selectString = route.selects.map(selKey => selKey.key).join(',');

                queryStringInit += `?model=${route.moduleName}&select=${selectString}`;

                for (let i = 1; i < filteredSelects.length; i++) {
                    queryStringInit += (i === 1 ? '&filter=' : '');
                    queryStringInit +=  `${filterValue}(${filteredSelects[i].key}, '${query}')`;
                    if (i !==  filteredSelects.length - 1) {
                        queryStringInit += ' or ';
                    }
                }

                if (route.expand) {
                    queryStringInit += '&expand=' + route.expands.join(',');
                }

                if (route.joins) {
                    queryStringInit += '&join=' + route.joins.join(',');
                }

                queryStringInit += `&top=${withPrefix ? 100 : 5}&orderby=id desc&wrap=false`;

                queries.push(this.navbarLinkService.getQuery(queryStringInit));
            }
        });

        return queries;
    }

    public checkNavbarWidth() {
        const elements = document.getElementsByClassName('navbar');
        const navbar = elements && elements[0];
        if (navbar) {
            const diff = navbar.scrollWidth - navbar.clientWidth;

            const collapsed = diff > 0;
            if (collapsed !== this.searchCollapsed) {
                this.searchCollapsed = collapsed;
                this.cdr.markForCheck();
            }
        }
    }

    public onMouseover(index) {
        if (index < this.selectedIndex) {
            for (let i = index; i < this.selectedIndex; i++) {
                this.focusPositionTop -= this.listElement.nativeElement.children[i].clientHeight;
            }
        } else if (index > this.selectedIndex) {
            for (let i = this.selectedIndex; i < index; i++) {
                this.focusPositionTop += this.listElement.nativeElement.children[i].clientHeight;
            }
        }
        this.selectedIndex = index;
    }

    public onKeyDown(event) {
        let prevItem, currItem;
        let overflow = 0;

        switch (event.keyCode) {
            case 9:
                if (this.inputControl.value) {
                    event.preventDefault();
                    this.tabSelect();
                }
            break;
            case 13:
                this.confirmSelection();
            break;
            case 27:
                this.close();
            break;
            case 38:
                if (this.selectedIndex !== 0) {
                    this.selectedIndex--;
                    this.selectedIndex -= this.searchResultViewConfig[this.selectedIndex].isHeader ? 1 : 0;

                    currItem = this.listElement.nativeElement.children[this.selectedIndex];
                    if (currItem) {
                        this.focusPositionTop -= currItem.clientHeight;
                        overflow = this.focusPositionTop - this.listElement.nativeElement.scrollTop;

                        if (overflow < 0) {
                            this.listElement.nativeElement.scrollTop += overflow;
                        }
                    }
                }
            break;
            case 40:
                if (this.selectedIndex !== (this.searchResultViewConfig.length - 1)) {
                    this.selectedIndex++;
                    // if (this.searchResultViewConfig[this.selectedIndex]) {
                        this.selectedIndex += this.searchResultViewConfig[this.selectedIndex].isHeader ? 1 : 0;
                    // }
                }

                prevItem = this.listElement.nativeElement.children[this.selectedIndex - 1];
                currItem = this.listElement.nativeElement.children[this.selectedIndex];
                if (!currItem) { return; }
                overflow = (this.focusPositionTop + currItem.clientHeight)
                           - (this.listElement.nativeElement.clientHeight + this.listElement.nativeElement.scrollTop);

                if (overflow > 0) {
                    this.listElement.nativeElement.scrollTop += overflow;
                }
            break;
        }
    }

    private confirmSelection() {
        if (!this.searchResultViewConfig[this.selectedIndex] || this.searchResultViewConfig[this.selectedIndex].isHeader) { return; }
        const res = this.searchResultViewConfig[this.selectedIndex];
        this.router.navigateByUrl(res.url);
        this.close();
    }

    private tabSelect() {
        if (!this.searchResults[this.selectedIndex]) { return; }
        const name = this.searchResults[this.selectedIndex].name;

        if (['faktura', 'tilbud', 'ordre'].indexOf(name.toLowerCase()) >= 0) {
            this.inputControl.setValue(name + ' ', { emitEvent: true });
        }
    }

    private getNewShortcutListInit(query: string) {
        // Create array of predefined shortcuts and filter based on query
        let filteredShortCuts = _.cloneDeep(this.shortcuts);
        filteredShortCuts = filteredShortCuts.filter(res => res.shortcutName.toLowerCase().includes(query));

        filteredShortCuts.forEach(res => {
            res.url += '/0';
            res.value = res.shortcutName;
        });

        // If shortcuts was found, add a header for that section
        if (filteredShortCuts.length) {
            filteredShortCuts.unshift({
                isHeader: true,
                url: '/',
                value: 'Snarveier'
            });
            return filteredShortCuts;
        }
        return [];
    }

    public close() {
        this.focusPositionTop = 0;
        this.searchResultViewConfig = [];
        this.inputControl.setValue('', { emitEvent: false });
        if (this.inputElement) {
            this.inputElement.nativeElement.blur();
        }
        this.displayFullscreenSearch = false;
        this.cdr.markForCheck();
    }

    private componentLookup(query: string) {
        const results: any = [
            {
                isHeader: true,
                value: 'Modulsnarveier',
                url: '/'
            }
        ];

        const querySplit = query.split(' ');
        if (querySplit[0] === 'ny' || querySplit[0] === 'nytt') {
            querySplit.shift();
            query = querySplit.join(' ');
        }

        this.componentLookupSource.forEach((component) => {
            const name = component && component.name;
            if (name && name.toLowerCase().indexOf(query) !== -1) {
                results.push(component);
            }
        });

        return results.length > 1 ? results : [];
    }
}
