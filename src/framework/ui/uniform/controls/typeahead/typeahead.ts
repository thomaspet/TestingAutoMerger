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

import {Observable} from 'rxjs';
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
import {IGroupConfig} from '@uni-framework/ui/unitable/controls/autocomplete';
import {KeyCodes} from '@app/services/common/keyCodes';

export interface IAutocompleteCache {
    templates?: string[];
    search?: any[];
}

@Component({
    selector: 'uni-typeahead-input',
    templateUrl: './typeahead.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniTypeaheadInput extends BaseControl {
    @ViewChild('toggleBtn') private toggleButton: ElementRef;
    @ViewChild('list') private list: ElementRef;
    @ViewChild('query') private inputElement: ElementRef;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniTypeaheadInput> = new EventEmitter<UniTypeaheadInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniTypeaheadInput> = new EventEmitter<UniTypeaheadInput>(true);

    // state vars
    public busy$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public guid: string;
    private options: any;
    private source: Array<any>;
    public currentValue: any;
    private value: string | Object;
    private initialDisplayValue: string;
    private selectedIndex: number = -1;
    private selectedItem: any = null;
    public lookupResults: any[] = [];
    public isExpanded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private items$: Observable<any> = new Observable<any>();
    private focusPositionTop: number = 0;
    private preventSearch: boolean = false;
    private subscriptions: any[] = [];
    private groupConfig: IGroupConfig;
    private cache: IAutocompleteCache = {
        search: [],
        templates: []
    };
    constructor(private el: ElementRef, private cd: ChangeDetectorRef) {
        super();
        this.guid = 'autocomplete-' + performance.now();
    }

    ngOnDestroy() {
        this.busy$.complete();
        this.isExpanded$.complete();
        this.cleanSubscriptions();
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
                    this.focusEvent.emit(this);
                    return this.isExpanded$.next(!this.isExpanded$.getValue());
                })
                .filter(input => {
                    return this.isExpanded$.getValue();
                })
                .switchMap((input: string) => {
                    this.busy$.next(true);
                    return this.search(input, true);
                });

            let fromControl = this.control.valueChanges
                .filter(value => !this.options.searchOnButtonClick)
                .debounceTime(this.options.debounceTime || 100)
                .do((input) => {
                    this.busy$.next(true);
                    this.isExpanded$.next(false);
                })
                .switchMap((input: string) => {
                    return this.search(input);
                })
                .do((items) => {
                    if (items.length) {
                        this.selectedIndex = 0;
                        this.selectedItem = this.lookupResults[0];
                        this.isExpanded$.next(true);
                    } else {
                        this.selectedItem = null;
                        this.selectedIndex = -1;
                        this.isExpanded$.next(false);
                    }
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
                    if (this.inputElement.nativeElement !== document.activeElement
                        && this.toggleButton.nativeElement !== document.activeElement) {
                        if (this.lookupResults.length) {
                            this.confirmSelection(this.lookupResults[0]);
                        }else {
                            this.confirmSelection(null);
                        }
                    }
                });
            // let eventSubscription = Observable.fromEvent(this.el.nativeElement, 'keydown').subscribe(this.onKeyDown.bind(this));
            this.subscriptions.push(itemsSubscription); // , eventSubscription
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

    public onClickOutside(event) {
        if (this.isExpanded$.getValue()) {
            this.isExpanded$.next(false);
            this.selectedIndex = -1;
            this.selectedItem = null;
            this.preventSearch = true;

            if (this.control.value === '') {
                this.confirmSelection(null);
            } else {
                this.confirmSelection(this.currentValue);
            }
        }
    }

    private template(obj: any) {
        if (!this.options.template) {
            return _.get(obj, this.options.displayProperty || this.options.valueProperty);
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
            })].map(x => this.template(x)));
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

    private search(query: string, fromSearchButton = false): Observable<any> {
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
            if (filteredResults.length === 0) {
                this.selectedIndex = -1;
                this.selectedItem = null;
            }
            if (!filteredResults.length && fromSearchButton) {
                filteredResults = this.source;
            }
            return Observable.of(filteredResults.slice(0, 50));
        }
    }

    private confirmSelection(item) {
        const undefinedToNull = val => val === undefined ? null : val;
        const previousValue = this.currentValue;
        if (item) {
            this.currentValue = _.get(item, this.options.valueProperty);
        } else {
            this.currentValue = this.control.value;
        }
        this.isExpanded$.next(false); // = false;
        this.focusPositionTop = 0;
        this.selectedIndex = -1;
        this.value = this.currentValue;
        this.initialDisplayValue = this.currentValue || '';
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

    private toggle() {
        if (this.isExpanded$.getValue()) {
            this.close();
        } else {
            this.open();
        }
    }

    public open() {
        this.isExpanded$.next(true);
    }

    public close() {
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

                const limitDown = this.field.Options.editor ? this.lookupResults.length : this.lookupResults.length - 1;
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
