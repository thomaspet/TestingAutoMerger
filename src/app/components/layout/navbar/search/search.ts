import {
    Component,
    AfterViewInit,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
    HostBinding,
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {NavbarLinkService} from '../navbar-link-service';
import {Observable} from 'rxjs';
import {ErrorService} from '../../../../services/services';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

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
            />

            <ul #resultList
                class="search_results"
                role="listbox"
                tabindex="-1"
                [attr.aria-expanded]="isExpanded">

                <li role="option"
                    class="autocomplete_result"
                    [attr.aria-selected]="selectedIndex === idx"
                    (mouseover)="onMouseover(idx)"
                    (click)="confirmSelection()"
                    *ngFor="let result of searchResults; let idx = index"
                    style="cursor: pointer">
                    {{result.name}}
                </li>
            </ul>
        </nav>
    `,
})
export class NavbarSearch implements AfterViewInit {
    @ViewChild('searchInput')
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

    constructor(
        private http: UniHttp,
        public router: Router,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService,
        navbarLinkService: NavbarLinkService
    ) {
        navbarLinkService.linkSections$.subscribe(linkSections => {
            this.componentLookupSource = [];
            linkSections.forEach(section => {
                section.linkGroups.forEach(group => {
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
                event.preventDefault();
                this.inputElement.nativeElement.focus();
            }
        });

        this.inputControl.valueChanges.subscribe((inputValue) => {
            this.isExpanded = false;
            this.selectedIndex = 0;
            const query = inputValue.toLowerCase();

            // TODO: This should be reworked after 30.6
            if (query.indexOf('faktura ') === 0) {
                this.TOFLookup(query.slice(8), 'invoice');
            } else if (query.indexOf('ordre ') === 0) {
                this.TOFLookup(query.slice(6), 'order');
            } else if (query.indexOf('tilbud ') === 0) {
                this.TOFLookup(query.slice(7), 'quote');
            } else {
                this.componentLookup(query);
            }
        });
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
                if (this.selectedIndex !== (this.searchResults.length - 1)) {
                    this.selectedIndex++;
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
        if (!this.searchResults[this.selectedIndex]) { return; }
        const url = this.searchResults[this.selectedIndex].url;
        this.router.navigateByUrl(url);
        this.close();
    }

    private tabSelect() {
        if (!this.searchResults[this.selectedIndex]) { return; }
        const name = this.searchResults[this.selectedIndex].name;

        if (['faktura', 'tilbud', 'ordre'].indexOf(name.toLowerCase()) >= 0) {
            this.inputControl.setValue(name + ' ', { emitEvent: true });
        }
    }

    public close() {
        this.focusPositionTop = 0;
        this.searchResults = [];
        this.inputControl.setValue('', { emitEvent: false });
        this.isExpanded = false;
        this.inputElement.nativeElement.blur();
        this.cdr.markForCheck();
    }

    private componentLookup(query: string) {
        const results = [];

        this.componentLookupSource.forEach((component) => {
            const name = component && component.name;
            if (name && name.toLowerCase().indexOf(query) !== -1) {
                results.push(component);
            }
        });

        this.searchResults = results;
        this.isExpanded = true;
    }

    private TOFLookup(query: string, module: string) {
        const filterKey = module.charAt(0).toUpperCase() + module.slice(1) + 'Number';
        const modulePlural = module + 's';
        this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
                modulePlural.toLowerCase()
                + `?top=20&filter=contains(` + filterKey + `,'${query}') or contains(CustomerName,'${query}')`
            )
            .send()
            .map(response => response.json())
            .subscribe(
                (response) => {
                    const results = [];
                    response.forEach((tof) => {
                        if (tof[filterKey] === null) {
                            tof[filterKey] = 'Kladd ' + tof.ID;
                        }

                        results.push({
                            name: tof[filterKey] + ' - ' + tof.CustomerName,
                            url: '/sales/' + modulePlural + '/' + tof.ID
                        });
                    });

                    this.searchResults = results;
                    this.isExpanded = true;
                    this.cdr.markForCheck();
                },
                err => this.errorService.handle(err)
            );
    }
}
