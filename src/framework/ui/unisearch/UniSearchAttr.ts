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
    SimpleChanges,
    HostListener
} from '@angular/core';
// import html from './UniSearchAttrHtml';
// import css from './UniSearchAttrCss';
import {IUniSearchConfig, SearchType1880} from './IUniSearchConfig';
import {Observable} from 'rxjs';
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
    @ViewChild('container', { static: false }) container: ElementRef;
    @ViewChild('resultList', { static: false }) resultListElement: ElementRef;
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
    public currentInputValue: string;

    public searchPersons: boolean = true;
    public searchCompanies: boolean = true;
    public hasExternalSearch: boolean = false;
    public hasCreateNewButton: boolean = false;

    private keyEventHandler;
    private inputSubscription;

    constructor(public inputElement: ElementRef, private changeDetector: ChangeDetectorRef) { }

    public ngOnInit() {
        if (!this.config) {
            throw new Error('Tried to start the UniSearch component without giving it a IUniSearchConfig object!');
        }

        if (this.config.searchType1880 === SearchType1880.searchCompanies) {
            this.searchPersons = false;
        } else if (this.config.searchType1880 === SearchType1880.searchPersons) {
            this.searchCompanies = false;
        }

        const el = this.inputElement.nativeElement;

        // Move template outside <input> element, because it won't show if it's inside
        el.parentNode.appendChild(el.firstElementChild);

        this.inputSubscription = Observable.fromEvent(el, 'input')
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

        // Avoid memory leaks (cleanup in ngOnDestroy).
        // Key logic should be in UniSearch.ts since thats where it actually happens, not here..
        // This whole component is weird. Should probably rewrite it all.
        this.keyEventHandler = (event) => this.onKeyDown(event);
        el.addEventListener('keydown', this.keyEventHandler);
    }

    ngOnDestroy() {
        try {
            const el = this.inputElement.nativeElement;
            el.removeEventListener('keydown', this.keyEventHandler);

            this.inputSubscription.unsubscribe();
        } catch (e) {}
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

        if (this.selectedIndex === -1 && this.inputElement.nativeElement.value === this.initialDisplayValue) {
            this.closeSearchResult();
            return;
        }

        let item: any;
        if (this.inputElement.nativeElement.value || this.selectedIndex > -1) {
            const index = (this.selectedIndex > -1) ? this.selectedIndex : 0;
            item = this.lookupResults[index];
        } else {
            item = null;
        }

        this.closeSearchResult();
        this.selectedIndex = -1;
        this.initialDisplayValue = this.inputElement.nativeElement.value;
        if (item) {
            this.busy = true;
            this.config.onSelect(item)
                .do(() => this.changeDetector.markForCheck())
                .do(() => this.busy = false)
                .subscribe(expandedItem => {
                    this.changeEvent.next(expandedItem);
                    this.inputElement.nativeElement.value = this.inputTemplate(expandedItem);
                });
        } else {
            this.changeEvent.next(null);
            this.inputElement.nativeElement.value = '';
        }
    }

    public onSearchButtonClick() {
        if (this.expanded) {
            this.closeSearchResult();
        } else {
            this.openSearchResult();
            this.inputElement.nativeElement.focus();
            this.performLookup(this.inputElement.nativeElement.value || '');
        }
        this.inputElement.nativeElement.focus();
        this.changeDetector.markForCheck();
    }

    private createNewItem() {
        this.closeSearchResult();
        console.log(this.config);
        this.config.createNewFn(this.currentInputValue).subscribe(
            item => {
                this.inputElement.nativeElement.value = this.inputTemplate(item);
                this.changeEvent.next(item);
            },
            err => console.error(
                'Uncaught error in UniSearch! Add a .catch() on the observable before passing it to UniSearch!'
            )
        );
    }

    private toggleSearchType(event?) {
        if (event) {
            event.stopPropagation();
        }
        this.currentSearchType = this.currentSearchType === SearchType.INTERNAL
            ? SearchType.EXTERNAL
            : SearchType.INTERNAL;
        this.performLookup(this.inputElement.nativeElement.value || '');
    }

    public toggleSearchCompanies(event?) {
        if (event) {
            event.stopPropagation();
        }
        this.searchCompanies = !this.searchCompanies;
        this.performLookup(this.inputElement.nativeElement.value || '');
    }

    public toggleSearchPersons(event?) {
        if (event) {
            event.stopPropagation();
        }
        this.searchPersons = !this.searchPersons;
        this.performLookup(this.inputElement.nativeElement.value || '');
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
            this.selectedIndex = this.inputElement.nativeElement.value ? 0 : -1;
            this.busy = false;
            this.changeDetector.markForCheck();
        }, err => console.error('Uncaught error in UniSearch! Add a .catch() in the lookup function!'));
    }

    public onKeyDown(event: KeyboardEvent) {
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
                    this.performLookup(this.inputElement.nativeElement.value || '');
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
                this.handleUnfinishedValue();
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
                this.inputElement.nativeElement.value = this.initialDisplayValue;
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
        if (this.container) {
            this.container.nativeElement.scrollTop = 99999;
        }

    }

    private scrollToTop() {
        if (this.container) {
            this.container.nativeElement.scrollTop = 0;
        }
    }

    private scrollToListItem(index: number) {
        try {
            const list = this.resultListElement.nativeElement;
            const item: HTMLElement = list.children[index];
            item.scrollIntoView({
                block: 'nearest'
            });

            this.changeDetector.markForCheck();
        } catch (e) {
            console.error(e);
        }
    }

    private openSearchResult() {
        if (!this.expanded) {
            this.expanded = true;
            this.selectedIndex = 0;
            if (this.container) {
                this.container.nativeElement.scrollTop = 0;
            }
        }
    }

    private handleUnfinishedValue() {
        const val = this.inputElement.nativeElement.value;
        if (val && this.config.unfinishedValueFn && this.expanded) {
            this.config
                .unfinishedValueFn(val)
                .subscribe(entity => this.changeEvent.next(entity));
        }
    }

    public closeSearchResult() {
        if (this.expanded) {
            this.handleUnfinishedValue();
            this.currentSearchType = SearchType.INTERNAL;
            this.expanded = false;
            this.container.nativeElement.scrollTop = 0;
            this.lookupResults = null;
            this.changeDetector.markForCheck();
        }
    }
}
