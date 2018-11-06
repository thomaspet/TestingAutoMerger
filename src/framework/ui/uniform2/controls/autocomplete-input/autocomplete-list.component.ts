import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output,
    SimpleChanges, ViewChild
} from '@angular/core';
import { IGroupConfig } from '@uni-framework/ui/unitable/controls';
import * as _ from 'lodash';
import { KeyCodes } from '@app/services/common/keyCodes';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { tap, filter } from 'rxjs/operators';
import { createGuid } from '@app/services/common/dimensionService';
@Component({
    selector: 'uni-autocomplete-list',
    templateUrl: './autocomplete-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteListComponent {
    @Input() filter: string;
    @Input() expanded: boolean;
    @Input() searchFn: Function;
    @Input() selectedItem: any;
    @Input() items: any[];
    @Input() editor: Function;
    @Input() itemTemplate: Function;
    @Input() groupConfig: IGroupConfig;
    @Input() searchOnButtonClick: boolean;
    @Input() labelProperty: string;
    @Input() valueProperty: string;
    @Input() queryInput: HTMLInputElement;

    @Output() select: EventEmitter<any> = new EventEmitter(true);
    @Output() expandChange: EventEmitter<boolean> = new EventEmitter(true);
    @Output() searchStart: EventEmitter<boolean> = new EventEmitter(true);
    @Output() searchEnd: EventEmitter<boolean> = new EventEmitter(true);

    @ViewChild('list') list: ElementRef;

    lookupResults: any[];
    selectedIndex: number;
    limitBottom = 0;
    limitTop = 0;
    interval;
    guid = createGuid();

    constructor(public changeDetector: ChangeDetectorRef) {}

    ngAfterViewInit() {
        const eventObservable = fromEvent(this.queryInput, 'keydown');
        const navigation = eventObservable.pipe(
            filter((event: KeyboardEvent) => {
                return event.which === KeyCodes.UP_ARROW || event.which === KeyCodes.DOWN_ARROW;
            }),
            tap((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
        );
        navigation.subscribe((event: KeyboardEvent) => {
            switch (event.which) {
                case KeyCodes.UP_ARROW:
                    this.moveUp();
                    break;
                case KeyCodes.DOWN_ARROW:
                    this.moveDown();
                    break;
            }
        });

        const selectOnEnter = eventObservable.pipe(
            filter((event: KeyboardEvent) => {
                return event.which === KeyCodes.ENTER && this.expanded;
            }),
            tap((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
        );
        selectOnEnter.subscribe((event: KeyboardEvent) => {
            if (this.lookupResults
                && (this.lookupResults.length === 0 || this.selectedIndex === this.lookupResults.length)
                && this.editor) {
                this.openEditor();
            } else {
                this.confirmSelection(this.lookupResults[this.selectedIndex]);
            }
            this.expandChange.emit(false);
        });
        const closeListOnTab = eventObservable.pipe(
            filter((event: KeyboardEvent) => {
                return event.which === KeyCodes.TAB && this.expanded;
            })
        );
        closeListOnTab.subscribe((event: KeyboardEvent) => {
            this.expandChange.emit(false);
        });
        const f4andSpace = eventObservable.pipe(
            filter((event: KeyboardEvent) => {
                return event.which === KeyCodes.F4 || event.which === KeyCodes.SPACE;
            }),
            tap((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
        );
        f4andSpace.subscribe((event: KeyboardEvent) => {
            this.expandChange.emit(!this.expanded);
        });
        const del = eventObservable.pipe(
            filter((event: KeyboardEvent) => {
                return event.which === KeyCodes.DELETE;
            }),
            tap((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
        );
        del.subscribe((event: KeyboardEvent) => {
            this.selectedItem = undefined;
            this.selectedIndex = undefined;
            this.select.emit(null);
            this.expandChange.emit(false);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['filter']
            && changes['filter'].currentValue !== null
            && changes['filter'].currentValue !== undefined
            && !this.searchOnButtonClick) {
            this.search();
        }
    }

    search() {
        return new Promise(resolve => {
            this.searchStart.emit(true);
            this.expandChange.emit(false);
            this.getLookupResults().subscribe((results) => {
                this.searchEnd.emit(true);
                if (document.activeElement === this.queryInput
                    || document.activeElement === this.queryInput.nextSibling) {
                    this.expandChange.emit(true);
                    this.queryInput.focus();
                }
                if (this.groupConfig) {
                    this.lookupResults = this.formatGrouping(results);
                } else {
                    this.lookupResults = results;
                }
                resolve(this.lookupResults);
                this.limitTop = this.lookupResults.length;
            });
        });
    }

    getLookupResults() {
        let query = this.filter || '';
        if (query === this.applyTemplate(this.selectedItem)) {
            query = '';
        }
        if (this.searchFn) {
            const searchResult = this.searchFn(query);
            if (searchResult.then) {
                return fromPromise(searchResult);
            }
            if (searchResult.subscribe) {
                return searchResult;
            }
            return of(searchResult);
        }
        if (!this.items) {
            return of([]);
        }
        if (Array.isArray(this.items)) {
            let filteredResults;
            if (query && query.length) {
                filteredResults = this.items.filter((item) => {
                    return this.applyTemplate(item).toLowerCase().indexOf(query.toLowerCase()) >= 0;
                });
            } else {
                filteredResults = this.items;
            }
            return of(filteredResults.slice(0, 50));
        }
    }

    private formatGrouping(data) {
        const groupedArray = [];

        // Add subarrays with header for each group in config
        this.groupConfig.groups.forEach((group: any) => {
            group.isHeader = true;
            groupedArray.push([group]);
        });

        // Add all elements into the different groups if the groupkey matches
        data.forEach((item) => {
            if (this.groupConfig.visibleValueKey ? item[this.groupConfig.visibleValueKey] : true) {
                for (let i = 0; i < this.groupConfig.groups.length; i++) {
                    if (item[this.groupConfig.groupKey] === this.groupConfig.groups[i].key) {
                        groupedArray[i].push(item);
                    }
                }
            }
        });

        // Check to see that no EMPTY groups are added with just the header
        for (let groupIndex = 0; groupIndex < groupedArray.length; groupIndex++) {
            if (groupedArray[groupIndex].length === 1) {
                groupedArray.splice(groupIndex, 1);
                if (groupIndex < groupedArray.length) {
                    groupIndex--;
                }
            }
        }

        return [].concat.apply([], groupedArray);

    }

    onMouseOver(isHeader: boolean = false, item: any, index: number) {
        if (isHeader) {
            return;
        }
        this.selectedIndex = index;
        this.selectedItem = item;
    }

    confirmSelection(item) {
        this.select.emit(item);
    }

    openEditor() {
        this.editor(this.filter).then(result => {
            this.select.emit(result);
            // this.queryInput.value = this.applyTemplate(result);
            this.expandChange.emit(false);
        });
    }

    applyTemplate(item) {
        if (!item) {
            return '';
        }
        if (this.itemTemplate) {
            return this.itemTemplate(item);
        }
        if (typeof item === 'string') {
            return item;
        }
        if (this.valueProperty && item) {
            return _.get(item, this.labelProperty);
        }
        return item;
    }

    moveUp() {
        if (this.lookupResults === undefined) {
            this.search().then(() => this.moveUp());
            return;
        }
        if (document.activeElement === this.queryInput) {
            this.expandChange.emit(true);
        }
        if (this.selectedIndex === undefined || this.selectedIndex === null) {
            this.selectedIndex = 1;
        }
        if (this.selectedIndex > this.limitBottom) {
            this.selectedIndex--;
            this.scrollToListItem();
            this.changeDetector.detectChanges();
        }
    }

    moveDown() {
        if (this.lookupResults === undefined) {
            this.search().then(() => this.moveDown());
            return;
        }
        if (!this.expanded) {
            this.selectedIndex = -1;
        }
        if (document.activeElement === this.queryInput) {
            this.expandChange.emit(true);
        }
        if (this.selectedIndex === undefined || this.selectedIndex === null) {
            this.selectedIndex = -1;
        }
        const limit = this.editor ? this.limitTop : this.limitTop - 1;
        if (this.selectedIndex < limit) {
            this.selectedIndex++;
            this.scrollToListItem();
            this.changeDetector.detectChanges();
        }
    }

    private scrollToListItem() {
        const list = this.list.nativeElement;
        const currItem = list.children[this.selectedIndex];
        if (!currItem) {
            return;
        }
        const bottom = list.scrollTop + list.offsetHeight - currItem.offsetHeight;

        if (currItem.offsetTop <= list.scrollTop) {
            list.scrollTop = currItem.offsetTop;
        } else if (currItem.offsetTop >= bottom) {
            list.scrollTop = currItem.offsetTop - (list.offsetHeight - currItem.offsetHeight);
        }
    }
}
