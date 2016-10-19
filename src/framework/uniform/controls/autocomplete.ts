import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, Renderer} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {BizHttp} from '../../core/http/BizHttp';
import {UniFieldLayout} from '../interfaces';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';

declare var _; // lodash


export class UniAutocompleteConfig {
    public source: BizHttp<any>|any[];
    public valueKey: string;
    public template: (obj: any) => string;
    public minLength: number;
    public debounceTime: number;
    public search: (query: string) => Observable<any>;

    public static build(obj: any) {
        return _.assign(new UniAutocompleteConfig(), obj);
    }

    constructor() { }
}

@Component({
    selector: 'uni-autocomplete-input',
    template: `
        <div class="autocomplete" (clickOutside)="onClickOutside()">
            <input #query
                *ngIf="control"
                class="autocomplete_input"
                [formControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
                (keydown)="onKeyDown($event)"
                role="combobox"
                autocomplete="false"
                aria-autocomplete="inline"
                [attr.aria-owns]="'results-'+guid"
            />

            <button #toggleBtn class="uni-autocomplete-searchBtn"
                    (click)="toggle()"
                    (keydown.esc)="onKeyDown($event)"
                    tabIndex="-1">
                Søk
            </button>

            <ul #list
                class="uniTable_dropdown_list"
                [id]="'results-' + guid"
                role="listbox"
                tabindex="-1"
                [attr.aria-expanded]="isExpanded">

                <li *ngFor="let item of lookupResults; let idx = index"
                    class="autocomplete_result"
                    role="option"
                    (mouseover)="selectedIndex = idx"
                    (click)="confirmSelection()"
                    [attr.aria-selected]="selectedIndex === idx">
                    {{template(item)}}
                </li>
            </ul>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniAutocompleteInput {
    @ViewChild('list')  private list: ElementRef;
    @ViewChild('query') private inputElement: ElementRef;

    @Input()
    private field: UniFieldLayout;

    @Input()
    private model: any;

    @Input()
    private control: FormControl;

    @Output()
    public onReady: EventEmitter<UniAutocompleteInput> = new EventEmitter<UniAutocompleteInput>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    // state vars
    private guid: string;
    private options: any;
    private source: BizHttp<any> | Array<any>;
    private lastValue: any;
    private value: string;
    private initialDisplayValue: string;


    private busy: boolean = false;
    private selectedIndex: number = -1;
    private lookupResults: any[] = [];
    private isExpanded: boolean;
    private focusPositionTop: number = 0;

    constructor(private el: ElementRef, private renderer: Renderer, private cd: ChangeDetectorRef) {
        this.guid = 'autocomplete-' + performance.now();
    }

    public ngOnChanges(changes) {
        if (changes['model']) {
            this.lastValue = null;
            this.options = this.field.Options || {};
            this.source = this.options.source;
        }

        // Perform initial lookup to get display value
        this.getInitialDisplayValue(this.control.value).subscribe(result => {
            this.initialDisplayValue = this.template(result[0]) || '';
            this.control.setValue(this.initialDisplayValue, {emitEvent: false});
        });

        this.control.valueChanges
            .debounceTime(this.options.debounceTime || 100)
            .filter((input: string) => {
                return this.control.dirty;
            })
            .switchMap((input: string) => {
                this.isExpanded = false;
                this.lookupResults = [];
                this.busy = true;
                return this.search(input);
            })
            .subscribe((items: any[]) => {
                this.selectedIndex = -1;
                this.lookupResults = items;
                this.isExpanded = true;
                this.busy = false;
                this.cd.markForCheck();
            });
    }


    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    public focus() {
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);
    }

    public blur() {
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'blur', []);
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    private onClickOutside() {
        this.isExpanded = false;
    }

    private template(obj: any) {
        if (!this.options.template) {
            return _.get(obj, this.options.displayProperty);
        } else {
            return this.options.template(obj);
        }
    }

    private getInitialDisplayValue(value): Observable<any> {

        if (!this.source) {
            return Observable.of([]);
        }

        if (Array.isArray(this.source)) {
            return Observable.of([(<any[]> this.source).find((item) => {
                return _.get(item, this.field.Options.valueProperty) === value;
            })]);
        } else {
            return (<BizHttp<any>> this.source).GetAll(`filter=${this.field.Options.valueProperty} eq ${value}`);
        }
    }

    private search(query: string): Observable<any> {
        if (this.options.search) {
            return this.options.search(query);
        }

        if (!this.source) {
            return Observable.of([]);
        }

        // Local search
        if (Array.isArray(this.source)) {
            let filteredResults;
            if (query && query.length) {
                filteredResults = this.source.filter((item) => {
                    return this.template(item).toLowerCase().indexOf(query.toLowerCase()) >= 0;
                });
            } else {
                filteredResults = this.source;
            }
            return Observable.of(filteredResults.slice(0, 50));
        }
        // Remote search
        else {
            const operator = /^\d+$/.test(query) ? 'startswith' : 'contains';
            return (<BizHttp<any>> this.source).GetAll(`filter=${operator}(${this.field.Options.displayProperty},'${query}')&top=50`);
        }
    }

    private confirmSelection() {
        this.isExpanded = false;
        this.focusPositionTop = 0;

        // Wait for response
        // (allows us to still select result[0] when user tabs out before lookup is finished)
        if (this.busy) {
            setTimeout(() => {
                this.confirmSelection();
            }, 200);

            return;
        }

        // User just tabbed through the field
        if (this.selectedIndex === -1 && this.control.value === this.initialDisplayValue) {
            return;
        }

        let selectedItem;
        if (this.control.value.length || this.selectedIndex > -1) {
            const index = (this.selectedIndex > -1) ? this.selectedIndex : 0;
            selectedItem = this.lookupResults[index];
        } else {
            selectedItem = null;
        }

        this.value = selectedItem ? _.get(selectedItem, this.field.Options.valueProperty) : null;
        this.initialDisplayValue = selectedItem ? this.template(selectedItem) : '';
        this.control.setValue(this.initialDisplayValue, {emitEvent: false});
        _.set(this.model, this.field.Property, this.value);
        if (this.field.Options && this.field.Options.events && this.field.Options.events.select) {
            this.field.Options.events.select(this.model);
        }
        this.selectedIndex = -1;

        this.onChange.emit(this.model);
        this.cd.markForCheck();
    }

    private toggle() {
        if (this.isExpanded) {
            this.isExpanded = false;
        } else {
            this.search('').subscribe((items) => {
                this.selectedIndex = -1;
                this.lookupResults = items;
                this.isExpanded = true;
                this.busy = false;
                this.cd.markForCheck();
            });
        }
    }


    private onKeyDown(event: KeyboardEvent) {
        switch (event.keyCode) {
            // Tab & enter
            case 9:
            case 13:
                this.confirmSelection();
            break;
            // Escape
            case 27:
                this.isExpanded = false;
                this.selectedIndex = -1;
                this.control.setValue(this.initialDisplayValue, {emitEvent: false});
                this.cd.markForCheck();
                this.inputElement.nativeElement.focus();
                try {
                    this.inputElement.nativeElement.select();
                } catch (e) {}
            break;
            // Space
            case 32:
                if (!this.isExpanded && (!this.control.value || !this.control.value.length)) {
                    event.preventDefault();
                    this.toggle();
                }
            break;
            // Arrow up
            case 38:
                event.preventDefault();
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                    this.scrollToListItem();
                }
            break;
            // Arrow down
            case 40:
                event.preventDefault();
                if (event.altKey && !this.isExpanded) {
                    this.toggle();
                    return;
                }

                if (this.selectedIndex < (this.lookupResults.length - 1)) {
                    this.selectedIndex++;
                    this.scrollToListItem();
                }
            break;
            // F4
            case 115:
                this.toggle();
            break;
        }
    }

    private scrollToListItem() {
        const list = this.list.nativeElement;
        const currItem = list.children[this.selectedIndex];
        const bottom = list.scrollTop + list.offsetHeight - currItem.offsetHeight;

        if (currItem.offsetTop <= list.scrollTop) {
            list.scrollTop = currItem.offsetTop;
        } else if (currItem.offsetTop >= bottom) {
            list.scrollTop = currItem.offsetTop - (list.offsetHeight - currItem.offsetHeight);
        }
    }
}
