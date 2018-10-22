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

export interface ITypeaheadOptions {
    lookupFunction: (searchValue: string) => Observable<any> | any[];
    itemTemplate: (selectedItem: any) => string;
    itemValue: (item: any) => string;
    debounceTime?: number;
}

@Component({
    selector: 'unitable-typeahead',
    template: `
        <article class="typeahead">
            <input type="text" #input
                class="uniTypeahead_input"
                [formControl]="inputControl"
                (keypress)="busy = true"
                (keydown)="onKeyDown($event)"
                role="combobox"
            />

            <button class="uni-typeahead-searchBtn"
                    (click)="toggle()"
                    (keydown)="onKeyDown($event)"
                    tabIndex="-1">Søk</button>

            <ul #list class="uniTable_dropdown_list"
                id="typeahead-results"
                role="listbox"
                tabindex="-1"
                [attr.aria-expanded]="expanded && lookupResults && lookupResults.length > 0">

                <li *ngFor="let item of lookupResults; let idx = index"
                    class="uniTable_dropdown_item"
                    role="option"
                    (mouseover)="selectedIndex = idx"
                    (click)="itemClicked(idx)"
                    [attr.aria-selected]="selectedIndex === idx">
                    {{options.itemTemplate(item)}}
                </li>
            </ul>
        </article>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitableTypeahead implements OnInit {
    @ViewChild('input') public inputElement: ElementRef;
    @ViewChild('list')  private list: ElementRef;

    @Input()
    private column: any;

    @Input()
    public inputControl: FormControl;

    public options: ITypeaheadOptions;
    public busy: boolean = false;
    public expanded: boolean;

    public lookupResults: any[] = [];
    public selectedIndex: any;

    constructor(private cdr: ChangeDetectorRef) {}

    public ngOnInit() {
        if (this.column) {
            this.options = this.column.get('options');

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
                this.expanded = true;
                this.busy = false;
                this.cdr.markForCheck();
            });
        });
    }

    public getValue() {
        // User deleted text
        if (this.inputControl.dirty && !this.inputControl.value) {
            return null;
        }

        // User moved on while lookup was in-flight
        if (this.busy && this.inputControl.value) {
            // "cache" input in case control gets reset during lookup
            const userInput = this.inputControl.value;
            return this.performLookup(this.inputControl.value).map((res) => {
                if (res && res[0]) {
                    return this.options.itemValue
                        ? this.options.itemValue(res[0])
                        : this.options.itemTemplate(res[0]);
                } else {
                    return userInput;
                }
            });
        }

        if (this.selectedIndex >= 0) {
            const item = this.lookupResults[this.selectedIndex];

            if (!item && this.inputControl.value) {
                return this.inputControl.value;
            }

            // sometimes we want a value function, but other times we'll just use the template
            // function (e.g. itemTemplate could show  "<code>: <name>", but the value should only
            // be "<name>")
            if (this.options.itemValue) {
                return this.options.itemValue(item);
            } else {
                return this.options.itemTemplate(item);
            }
        }

        return undefined;
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
            this.expanded = true;
            this.cdr.markForCheck();
        });
    }

    private performLookup(search: string): Observable<any> {
        const lookupResult = this.options.lookupFunction(search);
        return Array.isArray(lookupResult)
            ? Observable.of(lookupResult)
            : <Observable<any>> lookupResult;
    }

    private confirmSelection() {
        const item = this.lookupResults[this.selectedIndex];

        if (item) {
            if (this.options.itemValue) {
                const value = this.options.itemValue(item);
                this.inputControl.setValue(value, {emitEvent: false});
            } else {
                const value = this.options.itemTemplate(item);
                this.inputControl.setValue(value, {emitEvent: false});
            }
        }
    }

    private itemClicked(index) {
        this.confirmSelection();
        this.expanded = false;
        setTimeout(() => {
            this.inputElement.nativeElement.focus();
        });
    }

    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode || 0;

        if (key === 13 && this.selectedIndex >= 0) {
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
        const bottom = list.scrollTop + (list.offsetHeight) - currItem.offsetHeight;

        if (!currItem) {
            return;
        }

        if (currItem.offsetTop <= list.scrollTop) {
            list.scrollTop = currItem.offsetTop;
        } else if (currItem.offsetTop >= bottom) {
            list.scrollTop = currItem.offsetTop - (list.offsetHeight - currItem.offsetHeight);
        }
    }

}
