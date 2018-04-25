import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    OnInit,
    OnChanges,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    SimpleChanges
} from '@angular/core';
// import html from './UniSearchAttrHtml';
// import css from './UniSearchAttrCss';
import {IUniSearchConfig, SearchType1880} from './IUniSearchConfig';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import {KeyCodes} from '../../../app/services/common/keyCodes';

export enum SearchType {
    INTERNAL,
    EXTERNAL
}

const HEIGHT_OF_NEW_BUTTON_PADDING = 22;
const INPUT_DEBOUNCE_TIME = 300;
const PAGE_DOWN_JUMP_LENGTH = 10;

declare const module;

@Component({
    selector: '[uni-search-attr]',
    templateUrl: './uniSearchAttr.html',
    styleUrls: ['./uniSearchAttr.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSearchAttr implements OnInit, OnChanges {
    @ViewChild('container')
    private container: ElementRef;

    @Input()
    public config: IUniSearchConfig;

    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>();

    private initialDisplayValue: string;
    public selectedIndex: number = -1;
    public expanded: boolean = false;
    public lookupResults: any[];
    public busy: boolean;
    private heightOfNewButtonPadding: number = 0;
    public currentSearchType: SearchType = SearchType.INTERNAL;
    public SearchTypeEnum = SearchType;
    private currentInputValue: string;

    public searchPersons: boolean = true;
    public searchCompanies: boolean = true;
    public hasExternalSearch: boolean = false;
    public hasCreateNewButton: boolean = false;

    constructor(private componentElement: ElementRef, private changeDetector: ChangeDetectorRef) { }

    public ngOnInit() {
        if (!this.config) {
            throw new Error('Tried to start the UniSearch component without giving it a IUniSearchConfig object!');
        }

        if (this.config.searchType1880 === SearchType1880.searchCompanies) {
            this.searchPersons = false;
        } else if (this.config.searchType1880 === SearchType1880.searchPersons) {
            this.searchCompanies = false;
        }

        const el = this.componentElement.nativeElement;

        // Move template outside <input> element, because it won't show if it's inside
        el.parentNode.appendChild(el.firstElementChild);

        Observable.fromEvent(el, 'input')
            .do(() => this.busy = true)
            .debounceTime(INPUT_DEBOUNCE_TIME)
            .do(() => this.openSearchResult())
            .map(event => (<any>event).target.value)
            .do(() => this.changeDetector.markForCheck())
            .subscribe(value => {
                this.performLookup(value);
                this.currentInputValue = value;
            });

        this.config.initialItem$.subscribe(model => {
            // this.componentElement.nativeElement.value = this.inputTemplate(model);
            el.value = this.inputTemplate(model);
            this.initialDisplayValue = this.inputTemplate(model);
            this.changeDetector.markForCheck();
        });

        // Adding here instead of with @HostListener because that resulted in 404 error on <host>/traceur
        document.addEventListener('click', event => {
            if (!event.target) {
                return;
            }

            const clickedInside = el.parentNode && el.parentNode.contains(event.target);
            if (!clickedInside) {
                this.handleUnfinishedValue(this.componentElement.nativeElement.value);
                this.closeSearchResult();
            }
        });

        // Select all text on click
        el.addEventListener('click', event => event.target.setSelectionRange(0, event.target.value.length));

        el.addEventListener('keydown', event => this.onKeydown(event));
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['config'] && changes['config'].currentValue) {
            this.hasExternalSearch = !!this.config.externalLookupFn;
            this.hasCreateNewButton = !!this.config.createNewFn;
            const showButtons = !!(this.hasCreateNewButton || this.hasExternalSearch);
            this.heightOfNewButtonPadding = showButtons ? HEIGHT_OF_NEW_BUTTON_PADDING : 0;
        }
    }

    private inputTemplate(item): string {
        return item ? this.config.inputTemplateFn(item) : '';
    }

    private rowTemplate(item): string[] | number[] {
        return item ? this.config.rowTemplateFn(item) : <string[]>[];
    }

    private selectItem() {
        if (this.busy) {
            setTimeout(() => this.selectItem(), 100);
            return;
        }

        if (this.lookupResults.length === 0) {
            if (this.hasExternalSearch) {
                this.toggleSearchType();
            }
            return;
        }

        if (this.selectedIndex === -1 && this.componentElement.nativeElement.value === this.initialDisplayValue) {
            this.closeSearchResult();
            return;
        }

        let item: any;
        if (this.componentElement.nativeElement.value || this.selectedIndex > -1) {
            const index = (this.selectedIndex > -1) ? this.selectedIndex : 0;
            item = this.lookupResults[index];
        } else {
            item = null;
        }

        this.closeSearchResult();
        this.selectedIndex = -1;
        this.initialDisplayValue = this.componentElement.nativeElement.value;
        if (item) {
            this.busy = true;
            this.config.onSelect(item)
                .do(() => this.changeDetector.markForCheck())
                .do(() => this.busy = false)
                .subscribe(expandedItem => {
                    this.changeEvent.next(expandedItem);
                    this.componentElement.nativeElement.value = this.inputTemplate(expandedItem);
                });
        } else {
            this.changeEvent.next(null);
            this.componentElement.nativeElement.value = '';
        }
    }

    public onSearchButtonClick() {
        if (this.expanded) {
            this.closeSearchResult();
        } else {
            this.openSearchResult();
            this.componentElement.nativeElement.focus();
            this.performLookup(this.componentElement.nativeElement.value || '');
        }
        this.componentElement.nativeElement.focus();
        this.changeDetector.markForCheck();
    }

    private createNewItem() {
        this.closeSearchResult();
        this.config.createNewFn(this.currentInputValue).subscribe(
            item => {
                this.componentElement.nativeElement.value = this.inputTemplate(item);
                this.changeEvent.next(item);
            },
            err => console.error(
                'Uncaught error in UniSearch! Add a .catch() on the observable before passing it to UniSearch!'
            )
        );
    }

    private toggleSearchType() {
        this.currentSearchType = this.currentSearchType === SearchType.INTERNAL
            ? SearchType.EXTERNAL
            : SearchType.INTERNAL;
        this.performLookup(this.componentElement.nativeElement.value || '');
    }

    public toggleSearchCompanies() {
        this.searchCompanies = !this.searchCompanies;
    }

    public toggleSearchPersons() {
        this.searchPersons = !this.searchPersons;
    }

    private isNumber(obj: any) {
        return typeof obj === 'number';
    }

    private performLookup(query: string) {
        this.lookupResults = null;
        this.busy = true;
        if (typeof this.config.lookupFn !== 'function') {
            throw new Error('Tried to preform UniSearch lookup without supplying a lookup function');
        }
        let lookupFn;
        if (this.currentSearchType === SearchType.INTERNAL) {
            lookupFn = this.config.lookupFn(query);
        } else if (this.currentSearchType === SearchType.EXTERNAL) {
            lookupFn = this.config.externalLookupFn(query, this.searchCompanies, this.searchPersons);
        }
        lookupFn.subscribe(response => {
            this.lookupResults = response;
            this.selectedIndex = this.componentElement.nativeElement.value ? 0 : -1;
            this.busy = false;
            this.changeDetector.markForCheck();
        }, err => console.error('Uncaught error in UniSearch! Add a .catch() in the lookup function!'));
    }

    private onKeydown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        if (!this.lookupResults && key !== KeyCodes.F4) {
            return;
        }

        switch (key) {
            case KeyCodes.F4:
                if (this.expanded) {
                    this.closeSearchResult();
                } else {
                    this.openSearchResult();
                    this.performLookup(this.componentElement.nativeElement.value || '');
                }
                break;
            case KeyCodes.F6:
                event.preventDefault();
                event.stopPropagation();
                if (this.hasExternalSearch) {
                    this.toggleSearchType();
                }
                break;
            case KeyCodes.TAB:
                this.handleUnfinishedValue(this.componentElement.nativeElement.value);
                this.closeSearchResult();
                break;
            case KeyCodes.ENTER:
                if (this.expanded) {
                    this.selectItem();
                }
                break;
            case KeyCodes.ESCAPE:
                event.preventDefault();
                this.closeSearchResult();
                this.componentElement.nativeElement.value = this.initialDisplayValue;
                break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                event.stopPropagation();
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                    this.scrollToListItem(this.selectedIndex);
                } else {
                    this.scrollToTop();
                }
                break;
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                event.stopPropagation();
                if (event.altKey && !this.expanded) {
                    this.openSearchResult();
                    return;
                }
                if (this.selectedIndex < (this.lookupResults.length - 1)) {
                    this.selectedIndex++;
                    this.scrollToListItem(this.selectedIndex);
                } else {
                    this.scrollToBottom();
                }
                break;
            case KeyCodes.F3:
                event.preventDefault();
                this.createNewItem();
                break;
            case KeyCodes.PAGE_DOWN:
                const bottomOfList = this.lookupResults.length - 1;
                this.selectedIndex += PAGE_DOWN_JUMP_LENGTH - 1;
                if (this.selectedIndex > bottomOfList) {
                    this.selectedIndex = bottomOfList;
                    this.scrollToBottom();
                } else {
                    this.scrollToListItem(this.selectedIndex);
                }
                break;
            case KeyCodes.PAGE_UP:
                event.preventDefault();
                event.stopPropagation();
                this.selectedIndex -= PAGE_DOWN_JUMP_LENGTH;
                if (this.selectedIndex < 0) {
                    this.selectedIndex = 0;
                    this.scrollToTop();
                } else {
                    this.scrollToListItem(this.selectedIndex);
                }
                break;
        }
    }

    private scrollToBottom() {
        this.container.nativeElement.scrollTop = 99999;
    }

    private scrollToTop() {
        this.container.nativeElement.scrollTop = 0;
    }

    private scrollToListItem(index: number) {
        const topPadding = this.heightOfNewButtonPadding;
        const box = this.container.nativeElement;
        const tableBody = box.querySelector('tbody');
        const currItem = <HTMLElement>tableBody.children[index];
        const borderBottomOfList = 1;
        const bottomOfList = box.scrollTop + box.offsetHeight - currItem.offsetHeight + borderBottomOfList;
        const topOfList = box.scrollTop;
        const topOfCurrentItem = currItem.offsetTop + topPadding;
        const bottomOfCurrentItem = currItem.offsetTop + currItem.offsetHeight + topPadding;
        const heightOfList = box.offsetHeight;

        if (topOfCurrentItem <= topOfList) {
            box.scrollTop = topOfCurrentItem;
        } else if (bottomOfCurrentItem > bottomOfList) {
            box.scrollTop = bottomOfCurrentItem - heightOfList;
        }
        this.changeDetector.markForCheck();
    }

    private openSearchResult() {
        if (!this.expanded) {
            this.expanded = true;
            this.selectedIndex = 0;
            this.container.nativeElement.scrollTop = 0;
        }
    }

    private handleUnfinishedValue(val: string) {
        if (val && this.config.unfinishedValueFn && this.expanded) {
            this.config
                .unfinishedValueFn(val)
                .subscribe(entity => this.changeEvent.next(entity));
        }
    }

    private closeSearchResult() {
        if (this.expanded) {
            this.currentSearchType = SearchType.INTERNAL;
            this.expanded = false;
            this.container.nativeElement.scrollTop = 0;
            this.lookupResults = null;
            this.changeDetector.markForCheck();
        }
    }
}
