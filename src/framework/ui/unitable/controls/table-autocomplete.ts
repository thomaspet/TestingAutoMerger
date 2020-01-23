import {
    Component,
    Input,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnInit
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
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
    showResultAsTable: boolean;
    resultTableConfig: IResultTableConfig;
    addNewButton?: {
        label: string;
        action: (searchText: string) => Promise<any>;
    };
}

export interface IResultTableConfig {
    fields: IResultTableField[];
}

export interface IResultTableField {
    header: string;
    key: string;
    class?: string;
    width?: string;
    isMoneyField?: boolean;
}

export interface IResultTableButton {
    buttonText: string;
    action: () => {};
    getAction: (item) => {};
    errorAction: (msg: string) => {};
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
    templateUrl: './table-autocomplete.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitableAutocomplete implements OnInit {
    @ViewChild('input', { static: true }) public inputElement: ElementRef;
    @ViewChild('dropdown', { static: false }) private dropdown: ElementRef;

    @Input()
    public column: any;

    @Input()
    public inputControl: FormControl;
    public groupConfig: IGroupConfig;

    public options: IAutoCompleteOptions;
    public busy: boolean = false;
    public expanded: boolean;

    public showDropdownAbove: boolean = false;
    public lookupResults: any[] = [];
    public selectedIndex: any;
    private addValuePromise: Promise<any>;
    emptySearchString: string = '';

    constructor(private cdr: ChangeDetectorRef) {}

    public ngOnInit() {
        if (this.column) {
            this.options = this.column.get('options');
            if (this.options['groupConfig']) {
                this.groupConfig = this.options['groupConfig'];
            }

            // If itemTemplate is not defined, use displayField or field
            if (!this.options.itemTemplate) {
                let field = this.column.get('field');
                const displayField = this.column.get('displayField');
                if (displayField) {
                    field = displayField.split('.').slice(1).join('.');
                }

                this.options.itemTemplate = (selectedItem) => {
                    return selectedItem[field];
                };
            }
            this.showDropdownAbove = 480 > window.innerHeight - document.activeElement.getBoundingClientRect().top;
        }

        this.inputControl.valueChanges
        .switchMap((value) => {
            this.lookupResults = [];
            this.emptySearchString = 'Søker...';
            this.busy = true;
            if (value) {
                this.selectedIndex = this.groupConfig ? 1 : 0;
            } else {
                this.selectedIndex = -1;
            }
            return Observable.of(value);
        })
        .debounceTime(this.options.debounceTime || 100)
        .distinctUntilChanged()
        .subscribe((query) => {
            this.performLookup(query).subscribe((results) => {
                this.lookupResults = this.findExactMatch(results, query);
                this.emptySearchString = this.lookupResults.length ? 'Søker' : 'Ingen treff';
                if (this.groupConfig) {
                    this.formatGrouping();
                }
                this.expanded = true;

                if (this.options.showResultAsTable) {
                    // Get all the cells in the result table
                    const cells = document.getElementsByClassName('result_td');
                    setTimeout(() => {
                        if (cells.length > 0) {
                            // Loop the cells to see if there are matches
                            for (let i = 0; i < cells.length; i++) {
                                // Check to see if cell contains query, set both to lowercase to ignore casing
                                if (cells[i].innerHTML.toLowerCase().includes(query.toLowerCase())) {
                                    // Find the text to replace, no matter the casing!
                                    const index = cells[i].innerHTML.toLowerCase().indexOf(query.toLowerCase());
                                    const textToReplace = cells[i].innerHTML.substr(index, query.length);

                                    // If cell contains query, hightlight it in cell!
                                    let data = cells[i].innerHTML;
                                    data = data.replace(textToReplace, '<span class="highlighed_search_hit">' + textToReplace + '</span>');
                                    cells[i].innerHTML = data;
                                }
                            }
                        }
                    });
                }

                this.busy = false;
                this.cdr.markForCheck();
            });
        });
    }

    private findExactMatch(result: any[], query: string): any[] {
        if (!this.options.showResultAsTable) {
            return result;
        }

        let exactMatch;
        const myArray = [].concat(result);
        for (let i = 0; i < myArray.length; i++) {
            if (query.toLowerCase() === myArray[i][this.options.resultTableConfig.fields[0].key].toLowerCase()) {
                exactMatch = myArray[i];
                myArray.splice(i, 1);
            }
        }
        if (exactMatch) {
            myArray.unshift(exactMatch);
        }

        return myArray;
    }

    private addNewItem() {
        if (this.options.addNewButton) {
            this.addValuePromise = this.options.addNewButton.action(this.inputControl.value);

            this.expanded = false;
            this.cdr.markForCheck();

            this.inputElement.nativeElement.focus();
        }
    }

    private formatGrouping() {
        const groupedArray = [];

        // Add subarrays with header for each group in config
        this.groupConfig.groups.forEach((group: any) => {
            group.isHeader = true;
            groupedArray.push([group]);
        });

        // Add all elements into the different groups if the groupkey matches
        this.lookupResults.forEach((item) => {
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
                return Observable.of(this.findExactMatch(res, this.inputControl.value)[0]);
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
            this.emptySearchString = this.lookupResults.length ? 'Søker' : 'Ingen treff';
            if (this.groupConfig) {
                this.formatGrouping();
            }
            this.expanded = true;
            this.cdr.markForCheck();
        });
    }

    private performLookup(search: string): Observable<any> {
        const lookupResult = this.options.lookupFunction(search);
        let observable: Observable<any>;

        if (Array.isArray(lookupResult)) {
            observable = Observable.of(lookupResult);
        } else {
            observable = <Observable<any>>lookupResult;
        }

        return observable;
    }

    private confirmSelection(index?: any) {
        index = index >= 0 ? index : this.selectedIndex;
        const item = this.lookupResults[index];

        if (item) {
            const displayValue = this.options.itemTemplate(item);
            this.inputControl.setValue(displayValue, {emitEvent: false});
            this.selectedIndex = index;
        }
    }

    public itemClicked(index: number, isHeader: boolean) {
        if (isHeader || !this.lookupResults || !this.lookupResults[index]) {
            return;
        }

        this.confirmSelection(index);
        this.expanded = false;
        setTimeout(() => {
            this.inputElement.nativeElement.focus();
        });
    }

    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode || 0;

        // Enter, no element available and add button exists
        if (key === 13
            && this.inputControl.value
            && this.inputControl.value.length > 0
            && this.lookupResults.length === 0
            && !this.busy && this.expanded
            && this.options.addNewButton
        ) {
            this.addNewItem();
        // Enter
        } else if (key === 13 && this.selectedIndex >= 0) {
            this.confirmSelection();
        // Escape
        } else if (key === 27 && this.expanded) {
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
            event.preventDefault();
            this.expand();
        }
    }

    private scrollToListItem() {
        setTimeout(() => {
            if (this.dropdown && this.dropdown.nativeElement) {
                const activeItem: HTMLElement = this.dropdown.nativeElement.querySelector('[aria-selected=true]');
                if (activeItem) {
                    activeItem.scrollIntoView({
                        block: 'nearest'
                    });
                }
            }
        });
    }
}
