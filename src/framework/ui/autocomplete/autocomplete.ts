import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {Customer} from '@uni-entities';
import {FormControl} from '@angular/forms';
import {debounceTime, take, finalize, tap, catchError} from 'rxjs/operators';
import {Subscription, BehaviorSubject, Observable, of as observableOf} from 'rxjs';
import {KeyCodes} from '@app/services/common/keyCodes';
import {get} from 'lodash';
import {ErrorService} from '@app/services/services';

export interface AutocompleteOptions {
    canClearValue?: boolean;
    autofocus?: boolean;
    openSearchOnFocus?: boolean;
    lookup: (query: string, filterCheckboxValues?: boolean[]) => any[] | Observable<any[]>;
    placeholder?: string;
    displayField?: string;
    displayFunction?: (item) => string;
    itemTemplate?: (item) => string;
    resultTableColumns?: {header: string, field?: string, template?: (item) => string}[];
    editHandler?: (item) => Observable<any>;
    createHandler?: () => Observable<any>;
    createLabel?: string;
    filterCheckboxes?: {
        label: string;
        value: boolean;
    }[];
}

@Component({
    selector: 'autocomplete',
    templateUrl: './autocomplete.html',
    styleUrls: ['./autocomplete.sass']
})
export class Autocomplete {
    @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;
    @ViewChild('optionContainer') optionContainer: ElementRef;

    @Input() readonly: boolean;
    @Input() options: AutocompleteOptions;
    @Input() value: any;
    @Output() valueChanges = new EventEmitter<Customer>();

    searchControl = new FormControl('');
    controlSubscription: Subscription;

    lookupResults: any[] = [];
    focusIndex = -1;
    isExpanded$ = new BehaviorSubject<boolean>(false);
    loading$ = new BehaviorSubject<boolean>(false);

    constructor(private errorService: ErrorService) {}

    ngOnInit() {
        this.controlSubscription = this.searchControl.valueChanges.pipe(
            tap(() => {
                this.loading$.next(true);
                this.isExpanded$.next(true);
            }),
            debounceTime(200),
        ).subscribe(query => this.performLookup(query));
    }

    ngOnDestroy() {
        this.controlSubscription.unsubscribe();
        this.isExpanded$.complete();
        this.loading$.complete();
    }

    ngOnChanges(changes) {
        if (changes['value']) {
            this.updateControlValue();
        }

        if (changes['options'] && this.options && this.options.autofocus) {
            setTimeout(() => this.focus());
        }
    }

    performLookup(query: string) {
        this.loading$.next(true);
        this.lookupFunction(query).pipe(
            tap(items => this.focusIndex = query && items.length ? 0 : -1),
            finalize(() => this.loading$.next(false))
        ).subscribe(items => this.lookupResults = items);
    }

    private lookupFunction(query: string): Observable<any[]> {
        const filterCheckboxValues = this.options.filterCheckboxes
            && this.options.filterCheckboxes.map(checkbox => checkbox.value);

        const lookupResult = this.options.lookup(query, filterCheckboxValues) || [];
        const res$ = Array.isArray(lookupResult) ? observableOf(lookupResult) : lookupResult;
        return res$.pipe(
            take(1),
            catchError(err => {
                this.errorService.handle(err);
                return observableOf([]);
            }),
        );
    }

    focus() {
        if (this.inputElement && this.inputElement.nativeElement) {
            this.inputElement.nativeElement.focus();
        }
    }

    toggle() {
        this.isExpanded$.next(!this.isExpanded$.value);
        if (this.isExpanded$.value) {
            this.performLookup('');
        }
    }

    close() {
        this.isExpanded$.next(false);
        this.updateControlValue();
    }

    getDisplayValue(item) {
        if (this.options.itemTemplate) {
            return this.options.itemTemplate(item);
        } else if (this.options.displayFunction) {
            return this.options.displayFunction(item);
        } else if (this.options.displayField) {
            return get(item, this.options.displayField);
        }
    }

    getResultCellValue(item, col) {
        return col.template ? col.template(item) : get(item, col.field);
    }

    private updateControlValue() {
        let controlValue = '';
        if (this.value) {
            if (this.options.displayFunction) {
                controlValue = this.options.displayFunction(this.value);
            } else if (this.options.displayField) {
                controlValue = get(this.value, this.options.displayField);
            }
        }

        this.searchControl.setValue(controlValue, {emitEvent: false});
    }

    select(value, refocus?: boolean) {
        // Check specifically for false so canClearValue defaults to true
        if (value || this.options.canClearValue !== false) {
            this.value = value || null;
            this.valueChanges.emit(this.value);
        }

        this.focusIndex = -1;
        this.updateControlValue();
        this.isExpanded$.next(false);
        if (refocus) {
            try {
                this.inputElement.nativeElement.focus();
            } catch (e) {}
        }
    }

    onF3Key(event: KeyboardEvent) {
        event.preventDefault();
        this.create();
    }

    create() {
        if (this.options && this.options.createHandler) {
            this.options.createHandler().subscribe(newEntity => {
                if (newEntity) {
                    this.select(newEntity);
                }
            });

            this.isExpanded$.next(false);
        }
    }

    onFocus() {
        try {
            this.inputElement.nativeElement.select();
        } catch (e) {}
    }

    onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        switch (key) {
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if (this.isExpanded$.value) {
                    if (this.focusIndex < this.lookupResults.length - 1) {
                        this.focusIndex++;
                        this.scrollToListItem();
                    }
                } else {
                    this.toggle();
                }
            break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (this.focusIndex > 0) {
                    this.focusIndex--;
                    this.scrollToListItem();
                }
            break;
            case KeyCodes.ENTER:
            case KeyCodes.TAB:
                if (!this.isExpanded$.value) {
                    return;
                }

                if (this.loading$.value && this.searchControl.value) {
                    // User tried selecting while the search was still in progress
                    this.selectBestMatch(this.searchControl.value);
                    this.isExpanded$.next(false);
                } else {
                    if (this.focusIndex >= 0) {
                        this.select(this.lookupResults[this.focusIndex], key === KeyCodes.ENTER);
                    } else {
                        const shouldClearValue = this.options.canClearValue !== false
                            && this.searchControl.dirty
                            && !this.searchControl.value;

                        if (shouldClearValue) {
                            this.select(null, false);
                        } else {
                            this.updateControlValue();
                            this.isExpanded$.next(false);
                        }
                    }
                }
            break;
            case KeyCodes.ESCAPE:
                this.close();
            break;
            case KeyCodes.SPACE:
                if (!this.searchControl.value) {
                    event.preventDefault();
                    this.toggle();
                }
            break;
        }
    }

    scrollToListItem() {
        if (this.optionContainer && this.optionContainer.nativeElement && this.optionContainer.nativeElement.children) {
            const row: HTMLElement = this.optionContainer.nativeElement.children[this.focusIndex];
            if (row) {
                row.scrollIntoView(false);
            }
        }
    }

    private selectBestMatch(query: string) {
        this.lookupFunction(query).subscribe(items => {
            let bestMatch;
            let bestMatchCount = 0;
            (items || []).forEach(item => {
                const displayValue = this.getDisplayValue(item);
                const matchCount = this.getNumberOfMatchingCharacters(displayValue, query);
                if (matchCount > bestMatchCount) {
                    bestMatch = item;
                    bestMatchCount = matchCount;
                }
            });

            if (bestMatch) {
                this.select(bestMatch, false);
            } else {
                this.updateControlValue();
            }
        });
    }

    private getNumberOfMatchingCharacters(s1: string, s2: string) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const startIndex = s1.indexOf(s2);
        if (startIndex >= 0) {
            s1 = s1.slice(startIndex);
            for (let i = 0; i < s2.length; i++) {
                if (s1[i] !== s2[i]) {
                    return i;
                }
            }

            return s2.length;
        } else {
            return 0;
        }
    }
}
