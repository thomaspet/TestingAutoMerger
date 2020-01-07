import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    SimpleChanges,
    HostListener
} from '@angular/core';

import {Observable, Subscription} from 'rxjs';
import {BaseControl} from '../baseControl';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces';

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
import {IGroupConfig} from '@uni-framework/ui/unitable/controls/table-autocomplete';
import {KeyCodes} from '@app/services/common/keyCodes';
import {take, debounceTime} from 'rxjs/operators';

@Component({
    selector: 'uniform-autocomplete',
    templateUrl: './uniform-autocomplete.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniFormAutocomplete extends BaseControl {
    @ViewChild('list', { static: false }) private list: ElementRef;
    @ViewChild('inputElement', { static: true }) private inputElement: ElementRef;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniFormAutocomplete> = new EventEmitter<UniFormAutocomplete>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniFormAutocomplete> = new EventEmitter<UniFormAutocomplete>(true);

    // state vars
    public busy$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public guid: string;
    private options: any;
    private source: Array<any>;
    public currentValue: any;
    private value: string | Object;
    private initialDisplayValue: string;
    private selectedIndex: number = -1;
    public lookupResults: any[] = [];
    public isExpanded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private groupConfig: IGroupConfig;

    controlSubscription: Subscription;

    constructor(private cd: ChangeDetectorRef) {
        super();
        this.guid = 'autocomplete-' + performance.now();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.busy$.complete();
        this.isExpanded$.complete();
        this.cleanSubscriptions();
    }

    public cleanSubscriptions() {
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
    }

    public ngOnChanges(changes) {
        if (changes['field']) {
            this.readOnly$.next(this.field && this.field.ReadOnly);
        }
        if (changes['model']) {
            const modelValue = _.get(changes['model'].currentValue, this.field.Property);
            if (!modelValue) {
                this.currentValue = modelValue;
            }
            this.currentValue = this.currentValue || null;
            this.options = this.field.Options || {};
            this.source = this.options.source || [];
        }

        if (this.options && this.options['groupConfig']) {
            this.groupConfig = this.options['groupConfig'];
        }

        this.getInitialDisplayValue(this.control.value).subscribe(result => {
            if (result[0]) {
                this.currentValue = result[0];
                this.initialDisplayValue = this.template(result[0]) || '';
            } else {
                this.initialDisplayValue = this.template(this.currentValue);
            }
            this.createControl(this.initialDisplayValue);
            this.cleanSubscriptions();

            this.controlSubscription = this.control.valueChanges.pipe(
                debounceTime(150)
            ).subscribe(query => {
                this.busy$.next(true);
                this.lookup(query);
            });
        });
    }

    onSearchButtonClick() {
        this.lookup();
        try {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        } catch (e) {}
    }

    lookup(query?: string) {
        // Mostly copy paste from old search function. Should rewrite (the entire component tbh)
        if (!query || this.initialDisplayValue === query) {
            query = '';
        }

        let searchResult;

        if (this.options.search) {
            searchResult = this.options.search(query);
        } else if (Array.isArray(this.source)) {
            if (query && query.length) {
                searchResult = this.source.filter((item) => {
                    return this.template(item).toLowerCase().indexOf(query.toLowerCase()) >= 0;
                });
            } else {
                searchResult = this.source;
            }
        }

        if (!searchResult || !searchResult.subscribe) {
            searchResult = Observable.of(searchResult || []);
        }

        searchResult.pipe(take(1)).subscribe(items => {
            // Apprently the old search function allowed us to return the items
            // inside an array (Array<Array<any>>) so now we'll have to support it
            // "forever".
            if (items && items[0] && Array.isArray(items[0])) {
                items = items[0];
            }

            this.lookupResults = items || [];
            if (this.groupConfig) {
                this.formatGrouping();
            }

            this.busy$.next(false);
            this.isExpanded$.next(true);
            this.selectedIndex = this.control.value ? 0 : -1;
        });
    }

    public focus() {
        try {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        } catch (e) {}
    }

    public blur() {
        try {
            this.inputElement.nativeElement.blur();
        } catch (e) {}
    }

    public onClickOutside() {
        if (this.isExpanded$.getValue()) {
            this.isExpanded$.next(false);
            this.selectedIndex = -1;

            if (this.control.value === '') {
                this.confirmSelection(null);
            } else {
                this.confirmSelection(this.currentValue);
            }
        }
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

    private confirmSelection(item) {
        if ((item && item.isHeader) || (!item && this.control.value !== '')) {
            this.control.setValue(this.initialDisplayValue || '', {emitEvent: false});
            this.isExpanded$.next(false);
            return;
        }

        const undefinedToNull = val => val === undefined ? null : val;
        let previousValue = this.currentValue;
        this.isExpanded$.next(false); // = false;

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
        this.busy$.next(false);
    }

    public onMouseOver(isHeader: boolean = false, item: any, index: number) {
        if (isHeader) {
            return;
        }
        this.selectedIndex = index;
    }

    private findIndex(value) {
        let result = -1;
        if (Array.isArray(this.options.source)) {
            result = this.options.source.findIndex((item) => {
                return this.template(item) === value;
            });
        }
        return result;
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
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
                this.confirmSelection(this.lookupResults[this.selectedIndex]);
                this.isExpanded$.next(false);
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
                    this.confirmSelection(this.lookupResults[this.selectedIndex]);
                    this.isExpanded$.next(false);
                    this.selectedIndex = -1;
                }
                break;
            case KeyCodes.ESCAPE:
                if (this.isExpanded$.getValue()) {
                    this.isExpanded$.next(false);
                } else {
                    this.control.setValue(this.initialDisplayValue, {emitEvent: false});
                }

                this.selectedIndex = -1;
                try {
                    this.inputElement.nativeElement.focus();
                    this.inputElement.nativeElement.select();
                } catch (e) {}
                break;
            case KeyCodes.SPACE:
                if (!this.isExpanded$.getValue() && (!this.control.value || !this.control.value.length)) {
                    event.preventDefault();
                    this.lookup();
                }
                break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectedIndex--;
                    this.scrollToListItem();
                }
                break;
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if (event.altKey && !this.isExpanded$.getValue()) {
                    this.isExpanded$.next(true);
                    return;
                }

                let limitDown = this.field.Options.editor ? this.lookupResults.length : this.lookupResults.length - 1;
                if (this.selectedIndex < limitDown) {
                    this.selectedIndex++;
                    this.scrollToListItem();
                }
                break;
            case KeyCodes.F4:
                this.lookup();
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
        const currItem: HTMLElement = list.children[this.selectedIndex];
        if (!currItem) {
            return;
        }

        currItem.scrollIntoView(false);
    }
}
