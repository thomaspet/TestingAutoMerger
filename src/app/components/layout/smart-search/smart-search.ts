import {
    Component,
    Inject,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef,
} from '@angular/core';

import {OverlayRef} from '@angular/cdk/overlay';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {_getOptionScrollPosition} from '@angular/material';

import {Observable} from 'rxjs/Observable';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import PerfectScrollbar from 'perfect-scrollbar';

import {KeyCodes} from '@app/services/common/keyCodes';
import {UniSmartSearchItem} from './smart-search-item';

@Component({
    selector: 'uni-smart-search',
    templateUrl: './smart-search.html',
    styleUrls: ['./smart-search.sass']
})
export class UniSmartSearch {
    @ViewChild('searchInput') searchInput: ElementRef;
    @ViewChild('list') resultContainer: ElementRef;
    @ViewChildren(UniSmartSearchItem) listItems: QueryList<UniSmartSearchItem>;

    scrollbar: PerfectScrollbar;

    searchControl: FormControl = new FormControl('');
    searchResults: any[];
    activeItemManager: ActiveDescendantKeyManager<UniSmartSearchItem>;

    loading$: Subject<boolean> = new Subject();
    componentDestroyed$: Subject<boolean> = new Subject();

    constructor(@Inject(OverlayRef) private overlayRef: any) {
        this.searchControl.valueChanges
            .debounceTime(250)
            .takeUntil(this.componentDestroyed$)
            .subscribe(value => this.search(value));
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

        Observable.fromEvent(document, 'keydown')
            .takeUntil(this.componentDestroyed$)
            .subscribe((event: KeyboardEvent) => this.keyHandler(event));

        if (this.searchInput && this.searchInput.nativeElement) {
            this.searchInput.nativeElement.focus();
        }
    }

    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    onItemSelected(item) {
        if (item && !item.isHeader) {
            window.alert('Item selected: ' + item.name);
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
                this.activeItemManager.setFirstItemActive();
            break;
            case KeyCodes.END:
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

    search(query: string) {
        this.loading$.next(true);

        // Mock async operation
        setTimeout(() => {
            const results = this.getMockItems();

            this.searchResults = results.map((item, index) => {
                // Used for calculating scroll
                item['_indexIncludingHeaders'] = index;
                return item;
            });

            this.loading$.next(false);

            // Wait for bindings to update
            setTimeout(() => {
                this.scrollbar.update();
                this.activeItemManager.setFirstItemActive();
            });

        }, 750);
    }

    showHelp() {
        window.alert('Not yet implemented');
    }

    getMockItems() {
        return [
            { name: 'Snarveier', isHeader: true },
            { name: 'Ny faktura' },
            { name: 'Ny ordre' },
            { name: 'Nytt tilbud' },
            { name: 'Ny kunde' },

            { name: 'Menyvalg', isHeader: true },
            { name: 'Faktura' },
            { name: 'Fakturamottak' },

            { name: 'Kunder', isHeader: true },
            { name: '100020 - Faktum Faktura AS' },
            { name: '100033 - iFaktura' },

            { name: 'Leverandører', isHeader: true },
            { name: '100000 - Heisann Sveisann' },
            { name: '100002 - Uni Micro AS' },

            // BIG LIST TEST
            { name: 'Snarveier', isHeader: true },
            { name: 'Ny faktura' },
            { name: 'Ny ordre' },
            { name: 'Nytt tilbud' },
            { name: 'Ny kunde' },

            { name: 'Menyvalg', isHeader: true },
            { name: 'Faktura' },
            { name: 'Fakturamottak' },

            { name: 'Kunder', isHeader: true },
            { name: '100020 - Faktum Faktura AS' },
            { name: '100033 - iFaktura' },

            { name: 'Leverandører', isHeader: true },
            { name: '100000 - Heisann Sveisann' },
            { name: '100002 - Uni Micro AS' },
            { name: 'Snarveier', isHeader: true },
            { name: 'Ny faktura' },
            { name: 'Ny ordre' },
            { name: 'Nytt tilbud' },
            { name: 'Ny kunde' },

            { name: 'Menyvalg', isHeader: true },
            { name: 'Faktura' },
            { name: 'Fakturamottak' },

            { name: 'Kunder', isHeader: true },
            { name: '100020 - Faktum Faktura AS' },
            { name: '100033 - iFaktura' },

            { name: 'Leverandører', isHeader: true },
            { name: '100000 - Heisann Sveisann' },
            // { name: '100002 - Uni Micro AS' },
        ];
    }

}
