import {Component, Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';

export interface IAutoCompleteOptions {
    lookupFunction: (searchValue: string) => Observable<any> | any[];
    itemTemplate: (selectedItem: any) => string;
    groupConfig?: IGroupConfig;
    debounceTime?: number;
    addNewButtonVisible?: boolean;
    addNewButtonText?: string;
    addNewButtonCallback?: (searchText: string) => Promise<any>;
}

export interface IGroupInfo {
    key: number | string; // Match value in group
    header: string; // Group header
}

export interface IGroupConfig {
    groupKey: string; // Key to value that items in group match with
    visibleValueKey?: string; // Key to a boolean value in the item that if true, item is added to a group
    groups: Array<IGroupInfo>;  // All the groups with key and header
}

@Component({
    selector: 'unitable-autocomplete',
    template: `
        <article class="autocomplete">
            <input
                type="text"
                #input
                class="uniAutocomplete_input"
                [formControl]="inputControl"
                (keypress)="busy = true"
                (keydown)="onKeyDown($event)"
                role="combobox"
                aria-autocomplete="inline"
                [attr.aria-owns]="autocomplete-results"
            />

            <button class="uni-autocomplete-searchBtn"
                    (click)="toggle()"
                    (keydown)="onKeyDown($event)"
                    tabIndex="-1">Søk
            </button>

            <ul #list class="uniTable_dropdown_list"
                id="autocomplete-results"
                role="listbox"
                tabindex="-1"
                [attr.aria-expanded]="expanded">

                <li *ngFor="let item of lookupResults; let idx = index"
                    class="uniTable_dropdown_item"
                    role="option"
                    (mouseover)="selectedIndex = item.isHeader ? selectedIndex : idx"
                    (click)="itemClicked(idx, item.isHeader)"
                    [ngClass]="{ 'group_list_header' : item.isHeader }"
                    [attr.aria-selected]="selectedIndex === idx">
                    {{ item.isHeader ? item.header : editorOptions.itemTemplate(item) }}
                </li>
                <li *ngIf="!busy && editorOptions.addNewButtonVisible" class="autocomplete-add-button">
                    <button (click)="addNewItem()">
                        {{ editorOptions.addNewButtonText ? editorOptions.addNewButtonText : 'Legg til' }}
                    </button>
                </li>
            </ul>
        </article>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitableAutocomplete {
    @ViewChild('input') public inputElement: ElementRef;
    @ViewChild('list')  private list: ElementRef;

    @Input()
    private column: any;

    @Input()
    private inputControl: FormControl;
    private groupConfig: IGroupConfig;

    private editorOptions: IAutoCompleteOptions;
    public busy: boolean = false;
    public expanded: boolean;

    private lookupResults: any[] = [];
    private selectedIndex: any;
    private addValuePromise: Promise<any>;

    constructor(private cdr: ChangeDetectorRef) {}

    public ngOnInit() {
        if (this.column) {
            this.editorOptions = this.column.get('editorOptions');
            if (this.editorOptions['groupConfig']) {
                this.groupConfig = this.editorOptions['groupConfig'];
            }

            // If itemTemplate is not defined, use displayField or field
            if (!this.editorOptions.itemTemplate) {
                var field = this.column.get('field');
                const displayField = this.column.get('displayField');
                if (displayField) {
                    field = displayField.split('.').slice(1).join('.');
                }

                this.editorOptions.itemTemplate = (selectedItem) => {
                    return selectedItem[field];
                };
            }
        }

        this.inputControl.valueChanges
        .switchMap((value) => {
            this.lookupResults = [];
            this.busy = true;
            if (value) {
                this.selectedIndex = 0;
            } else {
                this.selectedIndex = -1;
            }
            return Observable.of(value);
        })
        .debounceTime(100)
        .distinctUntilChanged()
        .subscribe((query) => {
            this.performLookup(query).subscribe((results) => {
                this.lookupResults = results;
                if (this.groupConfig) {
                    this.formatGrouping();
                }
                this.expanded = true;
                this.busy = false;
                this.cdr.markForCheck();
            });
        });
    }

    private addNewItem() {
        if (this.editorOptions.addNewButtonCallback) {
            this.addValuePromise = this.editorOptions.addNewButtonCallback(this.inputControl.value);

            this.expanded = false;
            this.cdr.markForCheck();

            this.inputElement.nativeElement.focus();
        }
    }

    private formatGrouping() {
        let groupedArray = [];

        // Add subarrays with header for each group in config
        this.groupConfig.groups.forEach((group: any) => {
            group.isHeader = true;
            groupedArray.push([group]);
        });

        // Add all elements into the different groups if the groupkey matches
        this.lookupResults.forEach((item) => {
            if (this.groupConfig.visibleValueKey ? item[this.groupConfig.visibleValueKey] : true) {
                for (var i = 0; i < this.groupConfig.groups.length; i++) {
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

        this.lookupResults = [].concat.apply([], groupedArray);
    }

    public getValue() {
        // User deleted text
        if (this.inputControl.dirty && !this.inputControl.value) {
            return null;
        }

        // user is adding a value throug a promise
        if (this.addValuePromise) {
            return this.addValuePromise;
        }

        // User was "too quick"
        if (this.busy && this.inputControl.value) {
            return this.performLookup(this.inputControl.value).switchMap((res) => {
                return Observable.of(res[0]);
            });
        }

        return (this.selectedIndex >= 0)
            ? this.lookupResults[this.selectedIndex]
            : undefined;
    }

    public toggle() {
        if (this.expanded) {
            this.expanded = false;
        } else {
            this.expand();
        }
    }

    private expand() {
        this.performLookup('').subscribe((res) => {
            this.selectedIndex = -1;
            this.lookupResults = res;
            if (this.groupConfig) {
                this.formatGrouping();
            }
            this.expanded = true;
            this.cdr.markForCheck();
        });
    }

    private performLookup(search: string): Observable<any> {
        let lookupResult = this.editorOptions.lookupFunction(search);
        let observable: Observable<any>;

        if (Array.isArray(lookupResult)) {
            observable = Observable.of(lookupResult);
        } else {
            observable = <Observable<any>>lookupResult;
        }

        return observable;
    }

    private confirmSelection() {
        let item = this.lookupResults[this.selectedIndex];

        if (item) {
            const displayValue = this.editorOptions.itemTemplate(item);
            this.inputControl.setValue(displayValue, {emitEvent: false});
        }
    }

    public itemClicked(index: number, isHeader = false) {
        if (isHeader) {
            return;
        }
        this.confirmSelection();
        this.expanded = false;
        setTimeout(() => {
            this.inputElement.nativeElement.focus();
        });
    }

    private onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode || 0;

        if (key === 13 && this.inputControl.value && this.inputControl.value.length > 0 && this.lookupResults.length === 0 && !this.busy && this.expanded && this.editorOptions.addNewButtonVisible) {
            // enter, no element available and add button exists
            this.addNewItem();
        } else if (key === 13 && this.selectedIndex >= 0) {
            // enter
            this.confirmSelection();
        } else if (key === 27 && this.expanded) {
            // Escape
            event.stopPropagation();
            this.expanded = false;
            this.inputElement.nativeElement.focus();
        // Space
        } else if (key === 32 && (!this.inputControl.value || this.inputControl.value.length === 0)) {
            event.preventDefault();
            this.expand();
        // Arrow up
        } else if (key === 38 && this.selectedIndex > 0) {
            event.preventDefault();
            if (this.lookupResults[this.selectedIndex - 1].isHeader) {
                this.selectedIndex--;
            }
            this.selectedIndex--;
            this.scrollToListItem();
        // Arrow down
        } else if (key === 40) {
            event.preventDefault();
            if (event.altKey) {
                event.stopPropagation();
                this.expand();
                return;
            }

            if (this.selectedIndex < (this.lookupResults.length - 1)) {
                if (this.lookupResults[this.selectedIndex + 1].isHeader) {
                    this.selectedIndex++;
                }
                this.selectedIndex++;
                this.scrollToListItem();
            }
        // F4
        } else if (key === 115) {
            this.expand();
        }
    }

    private scrollToListItem() {
        const list = this.list.nativeElement;
        const currItem = list.children[this.selectedIndex];

        if (!currItem) {
            return;
        }

        const bottom = list.scrollTop + (list.offsetHeight) - currItem.offsetHeight;

        if (currItem.offsetTop <= list.scrollTop) {
            list.scrollTop = currItem.offsetTop;
        } else if (currItem.offsetTop >= bottom) {
            list.scrollTop = currItem.offsetTop - (list.offsetHeight - currItem.offsetHeight);
        }
    }

}
