import {
    Component,
    Inject,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef,
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {OverlayRef} from '@angular/cdk/overlay';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import { _getOptionScrollPosition } from '@angular/material/core';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';

import {fromEvent, Observable, Subject} from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';

import {UniSmartSearchItem} from '../smart-search-item';
import {KeyCodes} from '@app/services/common/keyCodes';
import {AuthService} from '@app/authService';
import {CompanyService} from '@app/services/services';
import {Company} from '@uni-entities';

@Component({
    selector: 'uni-company-search',
    templateUrl: './company-search.html',
})
export class UniCompanySearch {
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
    @ViewChild('list', { static: true }) resultContainer: ElementRef;
    @ViewChildren(UniSmartSearchItem) listItems: QueryList<UniSmartSearchItem>;

    scrollbar: PerfectScrollbar;

    searchControl: FormControl = new FormControl('');
    searchResults: any[] = [];
    activeItemManager: ActiveDescendantKeyManager<UniSmartSearchItem>;

    componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        @Inject(OverlayRef)
        private overlayRef: any,
        private companyService: CompanyService,
        private authService: AuthService
    ) {
        this.companyService.GetAll(null).subscribe(
            companies => {
                this.searchResults = this.mapCompaniesToSearchResults(companies);
            },
            err => console.error(err)
        );
    }

    ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#results-container');
        this.activeItemManager = new ActiveDescendantKeyManager(this.listItems)
            .skipPredicate(item => !!item.isHeader);

        // Listen to activeItem changes to reposition scroll
        this.activeItemManager.change
            .takeUntil(this.componentDestroyed$)
            .subscribe(index => {
                setTimeout(() => {
                    this.scrollActiveItemIntoView(index);
                });
            });

        fromEvent(document, 'keydown')
            .takeUntil(this.componentDestroyed$)
            .subscribe((event: KeyboardEvent) => this.keyHandler(event));

        this.searchControl.valueChanges
            .takeUntil(this.componentDestroyed$)
            .debounceTime(50)
            .switchMap(value => this.searchCompanies(value))
            .subscribe(results => {
                this.searchResults = results;
                setTimeout(() => this.activeItemManager.setFirstItemActive());
            });

        setTimeout(() => {
            try {
               (<any> document.activeElement).blur();
                this.searchInput.nativeElement.focus();
            } catch (e) {}
        });
    }

    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    onItemSelected(item) {
        const company = item.company;
        this.authService.setActiveCompany(company);
        this.close();
    }

    private searchCompanies(query: string): Observable<Company[]> {
        return this.companyService.GetAll(null).map(companies => {
            const filteredCompanies = companies.filter(company => {
                const name = (company.Name || '').toLowerCase();
                const clientNumber = (company.ClientNumber || '').toString();

                return name.includes(query.toLowerCase())
                    || clientNumber.startsWith(query);
            });

            return this.mapCompaniesToSearchResults(filteredCompanies);
        });
    }

    private mapCompaniesToSearchResults(companies: Company[]): any[] {
        const searchResults: any[] = [{
            type: 'header',
            value: 'Bytt selskap'
        }];

        companies.forEach(company => {
            const label = !!company.ClientNumber
                ? company.ClientNumber + ' - ' + company.Name
                : company.Name;

            searchResults.push({
                value: label,
                company: company
            });
        });

        return searchResults;
    }

    private close() {
        this.overlayRef.dispose();
    }

    private scrollActiveItemIntoView(index) {
        if (index >= 0 && this.resultContainer) {
            try {
                const list = this.resultContainer.nativeElement;

                if (index === 1) { // index 1 because index 0 is always a header right?
                    list.scrollTop = 0;
                } else {
                    const scroll = _getOptionScrollPosition(
                        index,
                        40,
                        list.scrollTop,
                        list.offsetHeight
                    );

                    list.scrollTop = scroll;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    private keyHandler(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        switch (key) {
            case KeyCodes.UP_ARROW:
            case KeyCodes.DOWN_ARROW:
                this.activeItemManager.onKeydown(event);
            break;
            case KeyCodes.HOME:
                event.preventDefault();
                this.activeItemManager.setFirstItemActive();
            break;
            case KeyCodes.END:
                event.preventDefault();
                this.activeItemManager.setLastItemActive();
            break;
            case KeyCodes.ENTER:
                const activeElement = this.activeItemManager.activeItem;
                this.onItemSelected(activeElement.item);
            break;
            case KeyCodes.ESCAPE:
                this.close();
            break;
        }
    }
}
