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
import {_getOptionScrollPosition} from '@angular/material';

import {Observable} from 'rxjs/Observable';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import PerfectScrollbar from 'perfect-scrollbar';

import {KeyCodes} from '@app/services/common/keyCodes';
import {UniSmartSearchItem} from './smart-search-item';
import {SmartSearchDataService} from './smart-search-data.service';

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
    searchResults: any[] = [];
    activeItemManager: ActiveDescendantKeyManager<UniSmartSearchItem>;

    loading$: Subject<boolean> = new Subject();
    componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        @Inject(OverlayRef)
        private overlayRef: any,
        private dataService: SmartSearchDataService,
        private router: Router
    ) {

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

        this.searchControl.valueChanges
            .takeUntil(this.componentDestroyed$)
            .do(value => {
                this.searchResults = this.dataService.syncLookup(value.toLowerCase());
                setTimeout(() => this.activeItemManager.setFirstItemActive());
            })
            .debounceTime(300)
            .do(() => this.loading$.next(true))
            .switchMap(value => this.dataService.asyncLookup(value.toLowerCase()))
            .subscribe(asyncResults => {
                this.searchResults.push(...asyncResults);
                this.loading$.next(false);
                setTimeout(() => this.activeItemManager.setFirstItemActive());
            });
    }

    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    onItemSelected(item) {
        if (item && item.type === 'link') {
            this.router.navigateByUrl(item.url);
            this.close();
        } else if (item && item.type === 'action') {
            // Predifined actions called here
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
    showHelp() {
        window.alert('Not yet implemented');
    }
}
