import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Renderer,
    SimpleChanges
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BaseControl} from './baseControl';
import {UniFieldLayout} from '../interfaces';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/share';

import * as _ from 'lodash';
import {KeyCodes} from '../../../../app/services/common/keyCodes';
import {IGroupConfig} from '../../unitable/controls/autocomplete';


export class UniAutocompleteConfig {
    public source: any;
    public valueKey: string;
    public template: (obj: any) => string;
    public minLength: number;
    public debounceTime: number;
    public search: (query: string) => Observable<any>;

    public static build(obj: any) {
        return _.assign(new UniAutocompleteConfig(), obj);
    }

    constructor() {
    }
}

interface IAutocompleteCache {
    templates?: string[];
    search?: any[];
}

@Component({
    selector: 'uni-autocomplete-input',
    template: `
        <div class="autocomplete" (clickOutside)="onClickOutside()">
            <input #query
                [attr.aria-describedby]="asideGuid"
                class="autocomplete_input"
                [formControl]="control"
                [readonly]="readOnly$ | async"
                [placeholder]="field?.Placeholder || ''"
                (focus)="focusHandler()"
                role="combobox"
                autocomplete="false"
                aria-autocomplete="inline"
                [attr.aria-owns]="'results-'+guid"
                [title]="control?.value || ''"
            />
            <button #toggleBtn class="uni-autocomplete-searchBtn"
                    type="button"
                    [attr.aria-busy]="busy$ | async"
                    tabIndex="-1">
                Søk
            </button>

            <ul #list
                class="uniTable_dropdown_list"
                [id]="'results-' + guid"
                role="listbox"
                tabindex="-1"
                [attr.aria-expanded]="isExpanded$ | async">

                <li *ngFor="let item of lookupResults; let idx = index"
                    class="autocomplete_result uniTable_dropdown_item"
                    role="option"
                    (mouseover)="onMouseOver(item.isHeader, item, idx)"
                    (click)="confirmSelection(item)"
                    [attr.aria-selected]="selectedIndex === idx"
                    [ngClass]="{ 'group_list_header' : item.isHeader }">
                    {{ item.isHeader ? item.header : template(item) }}
                </li>
                <li class="poster_tags_addNew" *ngIf="field?.Options?.editor"
                    (click)="openEditor()"
                    (keydown.enter)="openEditor()"
                    (mouseover)="selectedIndex = lookupResults?.length; selectedItem = null"
                    [attr.aria-selected]="selectedIndex === lookupResults?.length"
                >
                    Opprett <strong> '{{control?.value}}'</strong>…</li>
            </ul>
            <ng-content></ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniAutocompleteInput extends BaseControl {
    @ViewChild('toggleBtn') private toggleButton: ElementRef;
    @ViewChild('list') private list: ElementRef;
    @ViewChild('query') private inputElement: ElementRef;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniAutocompleteInput> = new EventEmitter<UniAutocompleteInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniAutocompleteInput> = new EventEmitter<UniAutocompleteInput>(true);

    // state vars
    private busy$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private guid: string;
    private options: any;
    private source: Array<any>;
    private currentValue: any;
    private value: string | Object;
    private initialDisplayValue: string;
    private selectedIndex: number = -1;
    private selectedItem: any = null;
    private lookupResults: any[] = [];
    private isExpanded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private items$: Observable<any> = new Observable<any>();
    private focusPositionTop: number = 0;
    private preventSearch: boolean = false;
    private subscriptions: any[] = [];
    private groupConfig: IGroupConfig;
    private cache: IAutocompleteCache = {
        search: [],
        templates: []
    };
    constructor(private el: ElementRef, private renderer: Renderer, private cd: ChangeDetectorRef) {
        super();
        this.guid = 'autocomplete-' + performance.now();
    }

    public cleanSubscriptions() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.subscriptions = [];
    }

    public ngOnChanges(changes) {

        if (changes['field']) {
            this.readOnly$.next(this.field && this.field.ReadOnly);
        }
        if (changes['model']) {
            this.currentValue = this.currentValue || null;
            this.options = this.field.Options || {};
            this.source = this.options.source || [];
        }

        if (this.options && this.options['groupConfig']) {
            this.groupConfig = this.options['groupConfig'];
        }

        // Perform initial lookup to get display value
        if (this.control.value === null) {
            this.control.setValue('');
        }
        /*if (!this.cache.templates[this.control.value]) {
            this.getInitialDisplayValue(this.control.value).subscribe(result => {
                this.currentValue = result[0];
                this.initialDisplayValue = this.template(result[0]) || '';
                this.cache.templates[this.control.value] = this.initialDisplayValue;
                this.createControl(this.initialDisplayValue);
            });
        } else {
            this.initialDisplayValue = this.cache.templates[this.control.value];
            this.createControl(this.initialDisplayValue);
        }*/
        this.getInitialDisplayValue(this.control.value).subscribe(result => {
            if (result[0]) {
                this.currentValue = result[0];
                this.initialDisplayValue = this.template(result[0]) || '';
            } else {
                this.initialDisplayValue = this.template(this.currentValue);
            }
            this.createControl(this.initialDisplayValue);
            this.cleanSubscriptions();
            let target = this.toggleButton.nativeElement;
            let fromButton = Observable.fromEvent(target, 'click')
                .switchMap((event: Event) => {
                    return Observable.of(this.control.value);
                })
                .do(input => {
                    return this.isExpanded$.next(!this.isExpanded$.getValue());
                })
                .filter(input => {
                    return this.isExpanded$.getValue();
                })
                .switchMap((input: string) => {
                    this.busy$.next(true);
                    return this.search(input);
                });

            let fromControl = this.control.valueChanges.debounceTime(this.options.debounceTime || 100)
                .do((input) => {
                    this.busy$.next(true);
                    this.isExpanded$.next(false);
                })
                .switchMap((input: string) => {
                    return this.search(input);
                })
                .do((items) => {
                    if (this.control.value === '') {
                        this.selectedIndex = -1;
                    } else {
                        this.selectedIndex = 0;
                    }
                    this.isExpanded$.next(true);
                });
            this.items$ = fromControl.merge(fromButton).share();
            let itemsSubscription = this.items$
                .subscribe((value) => {
                    this.busy$.next(false);
                    this.lookupResults = value;
                    if (this.groupConfig) {
                        this.formatGrouping();
                    }
                    this.cache.search[this.control.value] = value;
                });
            let eventSubscription = Observable.fromEvent(this.el.nativeElement, 'keydown').subscribe(this.onKeyDown.bind(this));
            this.subscriptions.push(itemsSubscription, eventSubscription);
        });
    }

    public focus() {
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'select', []);
    }

    public blur() {
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'blur', []);
    }

    private onClickOutside() {
        this.isExpanded$.next(false);
        this.selectedIndex = -1;
        this.selectedItem = null;
        this.preventSearch = true;
        // this.control.setValue(this.initialDisplayValue, {onlySelf: true, emitEvent: false});
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
        if (this.options.getDefaultData) {
            return this.options.getDefaultData();
        } else if (Array.isArray(this.source)) {
            return Observable.of([(<any[]> this.source).find((item) => {
                return _.get(item, this.field.Options.valueProperty) === value;
            })]);
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

    private search(query: string): Observable<any> {
        // Commenting this out because of bug https://github.com/unimicro/UniForm/issues/57
        // if (this.cache.search[query]) {
        //     return Observable.of(this.cache.search[query]);
        // }
        if (this.initialDisplayValue === query) {
            query = '';
        }
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
    }

    private confirmSelection(item) {
        if (!item || item.isHeader) {
            return;
        }

        const undefinedToNull = val => val === undefined ? null : val;
        let previousValue = this.currentValue;
        this.isExpanded$.next(false); // = false;
        this.focusPositionTop = 0;

        if (this.selectedIndex < 0) {
            if (this.control.value === '') { // allow empty string as value
                this.currentValue = null;
            }
        } else {
            this.currentValue = item;
        }
        this.selectedIndex = -1;

        this.value = this.currentValue ? _.get(this.currentValue, this.field.Options.valueProperty) : null;
        this.initialDisplayValue = this.currentValue ? this.template(this.currentValue) : '';
        this.control.setValue(this.initialDisplayValue, {emitEvent: false});
        const current = _.get(this.model, this.field.Property);
        _.set(this.model, this.field.Property, this.value);
        if (this.field.Options && this.field.Options.events && this.field.Options.events.select) {
            // just select if we change the value
            if (undefinedToNull(current) !== undefinedToNull(this.value)) {
                this.field.Options.events.select(this.model, this.currentValue);
            }
        }
        if (current !== this.value) {
            this.emitChange(previousValue, this.value);
            this.emitInstantChange(previousValue, this.value, true);
        }
    }

    private toggle() {
        if (this.isExpanded$.getValue()) {
            this.close();
        } else {
            this.open();
        }
    }

    private open() {
        this.isExpanded$.next(true);
    }

    private close() {
        this.isExpanded$.next(false);
    }

    public onMouseOver(isHeader: boolean = false, item: any, index: number) {
        if (isHeader) {
            return;
        }
        this.selectedIndex = index;
        this.selectedItem = item;
    }

    private findIndex(value) {
        let result = -1;
        if (Array.isArray(this.options.source)) {
            result = this.options.source.findIndex((item) => {
                return this.template(item) === value;
            });
            // _.forEach(this.options.source, (item, index) => {
            //     if (this.template(item) === value) {
            //         result = index;
            //     }
            // });
        }
        return result;
    }

    private onKeyDown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case KeyCodes.TAB:
                if (this.selectedIndex === -1 && this.control.value) {
                    this.selectedIndex = this.findIndex(this.control.value);
                }
                if (!this.lookupResults.length) {
                    if (Array.isArray(this.options.source)) {
                        this.lookupResults = this.options.source;
                        if (this.groupConfig) {
                            this.formatGrouping();
                        }
                    }
                }
                this.selectedItem = this.lookupResults[this.selectedIndex];
                this.confirmSelection(this.selectedItem);
                this.close();
                this.selectedIndex = -1;
                break;
            case KeyCodes.ENTER:
                if (this.selectedIndex === -1 && this.control.value) {
                    this.selectedIndex = this.findIndex(this.control.value);
                }
                if (this.field.Options && this.field.Options.editor && this.selectedIndex === this.lookupResults.length) {
                    this.openEditor(this.control.value);
                } else {
                    if (!this.lookupResults.length) {
                        if (Array.isArray(this.options.source)) {
                            this.lookupResults = this.options.source;
                            if (this.groupConfig) {
                                this.formatGrouping();
                            }
                        }
                    }
                    this.selectedItem = this.lookupResults[this.selectedIndex];
                    this.confirmSelection(this.selectedItem);
                    this.close();
                    this.selectedIndex = -1;
                }
                break;
            case KeyCodes.ESCAPE:
                this.isExpanded$.next(false);
                this.selectedIndex = -1;
                this.selectedItem = null;
                this.control.setValue(this.initialDisplayValue, {emitEvent: false});
                this.inputElement.nativeElement.focus();
                try {
                    this.inputElement.nativeElement.select();
                } catch (e) {
                }
                break;
            case KeyCodes.SPACE:
                if (!this.isExpanded$.getValue() && (!this.control.value || !this.control.value.length)) {
                    event.preventDefault();
                    this.toggle();
                }
                break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectedIndex--;
                    this.selectedItem = this.lookupResults[this.selectedIndex];
                    this.scrollToListItem();
                }
                break;
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if (event.altKey && !this.isExpanded$.getValue()) {
                    this.open();
                    return;
                }

                let limitDown = this.field.Options.editor ? this.lookupResults.length : this.lookupResults.length - 1;
                if (this.selectedIndex < limitDown) {
                    this.selectedIndex++;
                    this.selectedItem = this.lookupResults[this.selectedIndex];
                    this.scrollToListItem();
                }
                break;
            case KeyCodes.F4:
                this.toggle();
                break;
        }
        this.cd.markForCheck();
    }

    private openEditor(event) {
        this.field.Options.editor(this.control.value);
            // .then(result => this.lookupResults.push(result));
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
