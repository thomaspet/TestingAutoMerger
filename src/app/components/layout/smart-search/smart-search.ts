import {
    Component,
    Inject,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef,
} from '@angular/core';
import {Router} from '@angular/router';

import {OverlayRef} from '@angular/cdk/overlay';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import { _getOptionScrollPosition } from '@angular/material/core';

import {fromEvent, Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';

import {KeyCodes} from '@app/services/common/keyCodes';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {UniSmartSearchItem} from './smart-search-item';
import {SmartSearchDataService} from './smart-search-data.service';

@Component({
    selector: 'uni-smart-search',
    templateUrl: './smart-search.html',
})
export class UniSmartSearch {
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
    @ViewChild('list', { static: true }) resultContainer: ElementRef;
    @ViewChildren(UniSmartSearchItem) listItems: QueryList<UniSmartSearchItem>;

    scrollbar: PerfectScrollbar;

    searchControl: FormControl = new FormControl('');
    searchResults: any[] = [];
    activeItemManager: ActiveDescendantKeyManager<UniSmartSearchItem>;

    loading$: Subject<boolean> = new Subject();
    componentDestroyed$: Subject<boolean> = new Subject();
    searchValue: string = '';
    lastTenSearches: any[] = [{
        type: 'header',
        value: '10 siste brukte søk',
        url: '/',
    }];

    constructor(
        @Inject(OverlayRef)
        private overlayRef: any,
        private dataService: SmartSearchDataService,
        private toast: ToastService,
        private router: Router
    ) {
        this.lastTenSearches = this.lastTenSearches.concat([], JSON.parse( localStorage.getItem('LastTenSearches')) || []);
        if (this.lastTenSearches.length > 1) {
            this.searchResults = this.lastTenSearches;
            setTimeout(() => this.activeItemManager.setFirstItemActive());
        }
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
            .do(value => {
                this.searchValue = value;
                this.searchResults = this.dataService.syncLookup(value.toLowerCase());
                setTimeout(() => this.activeItemManager.setFirstItemActive());
            })
            .debounceTime(300)
            .do(() => {
                this.loading$.next(true);
            })
            .switchMap(value => this.dataService.asyncLookup(value.toLowerCase()))
            .subscribe(asyncResults => {
                this.searchResults.push(...asyncResults);
                this.loading$.next(false);
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
        // Push search value to last 10 searches when result is used!
        if (!!this.searchValue && this.searchValue !== ' ' && this.searchValue !== '*') {
            this.lastTenSearches.unshift(this.lastTenSearches[0]);
            this.lastTenSearches[1] = {
                type: 'search',
                value: this.searchValue,
                url: '/',
            };

            if (this.lastTenSearches.length > 10) {
                this.lastTenSearches.pop();
            }
            localStorage.setItem('LastTenSearches',
                JSON.stringify(this.lastTenSearches.filter(search => search.type !== 'header')));
        }

        if (item && item.type === 'link') {
            this.router.navigateByUrl(item.url);
            this.close();
        } else if (item && item.type === 'report') {
            const report = {
                ID: item.actionValues[0] || 0,
                Name: item.actionValues[1] || '',
                Description: item.actionValues[2] || ''
            };
            this.dataService.openReportModal(report);
            this.close();
        } else if (item && item.type === 'action') {
             // Predifined actions called here
             item.onSelect();
             this.close();
        } else if (item && item.type === 'search') {
            // User selected one of 10 last searches
            this.loading$.next(true);
            this.searchInput.nativeElement.value = item.value;
            this.searchResults = this.dataService.syncLookup(item.value.toLowerCase());
            this.dataService.asyncLookup(item.value.toLowerCase())
            .subscribe(asyncResults => {
                this.searchResults.push(...asyncResults);
                this.loading$.next(false);
                setTimeout(() => this.activeItemManager.setFirstItemActive());
            });
        } else if (item && item.type === 'external-link') {
            window.open(item.url, '_blank');
            this.close();
        } else if (item && item.type === 'user') {
            this.dataService.openUserSettingsModal();
            this.close();
        }
    }

    close() {
        this.overlayRef.dispose();
    }

    scrollActiveItemIntoView(index) {
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

    keyHandler(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        switch (key) {
            case KeyCodes.UP_ARROW:
            case KeyCodes.DOWN_ARROW:
                this.activeItemManager.onKeydown(event);
            break;
            case KeyCodes.TAB:
                if (event.shiftKey) {
                    this.activeItemManager.setPreviousItemActive();
                } else {
                    this.activeItemManager.setNextItemActive();
                }
            break;
            case KeyCodes.PAGE_UP:
                this.goToPreviousSection();
            break;
            case KeyCodes.PAGE_DOWN:
                this.goToNextSection();
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

    goToNextSection() {
        const currentIndex = this.activeItemManager.activeItemIndex;

        const items = this.listItems.toArray();
        const nextHeaderIndex = items.findIndex((item, index) => {
            return index > currentIndex && item.isHeader;
        });

        if (nextHeaderIndex > 0 && (nextHeaderIndex + 1) <= this.searchResults.length) {
            this.activeItemManager.setActiveItem(nextHeaderIndex + 1);
        }
    }

    goToPreviousSection() {
        const currentIndex = this.activeItemManager.activeItemIndex;

        let items = this.listItems.toArray();
        items = items.slice(0, currentIndex);
        items = items.reverse();

        // Remember that the array is reversed when reading the rest of the funtion
        const currentHeaderIndex = items.findIndex(item => !!item.isHeader);

        if (currentHeaderIndex >= 0) {
            const previousHeaderIndex = items.findIndex((item, index) => {
                return index > currentHeaderIndex && !!item.isHeader;
            });

            const newActiveItem = items[previousHeaderIndex - 1];
            if (newActiveItem) {
                this.activeItemManager.setActiveItem(newActiveItem);
            }
        }
    }
    showHelp() {
        window.alert('Not yet implemented');
    }
}
