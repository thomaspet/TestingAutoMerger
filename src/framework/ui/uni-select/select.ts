import {
    Component, Input, Output, EventEmitter, ViewChild, ElementRef,
    ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, AfterViewInit
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import * as _ from 'lodash';
import {KeyCodes} from '@app/services/common/keyCodes';

export interface ISelectConfig {
    valueProperty?: string;
    displayProperty?: string;
    addEmptyValue?: boolean;
    template?: (item) => string;
    placeholder?: string;
    searchable?: boolean;
    hideDeleteButton?: boolean;
}

@Component({
    selector: 'uni-select',
    templateUrl: './select.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSelect implements OnChanges, AfterViewInit {
    @ViewChild('searchInput') public searchInput: ElementRef;
    @ViewChild('valueInput') public valueInput: ElementRef;
    @ViewChild('itemDropdown') public itemDropdown: ElementRef;

    @Input() public items: any[];
    @Input() public newButtonAction: Function;
    @Input() public readonly: boolean;
    @Input() public config: ISelectConfig;
    @Input() public value: any;
    @Input() public searchFn: (query: string) => Observable<any>;
    @Input() public initialItemFn: () => Observable<any>;
    @Output() public valueChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() public readyEvent: EventEmitter<UniSelect> = new EventEmitter<UniSelect>(true);

    public guid: string;
    public expanded: boolean = false;

    public searchable: boolean = true;
    public searchControl: FormControl = new FormControl('');
    public filteredItems: any[];
    public filterString: string = '';

    public selectedItem: any = null;
    public focusedIndex: any = -1;
    public initialItem: any;
    public activeDecentantId: string;
    public valueInputControl = new FormControl('');

    constructor(public cd: ChangeDetectorRef, public el: ElementRef) {
        // Set a guid for DOM elements, etc.
        this.guid = (new Date()).getTime().toString();
    }

    public ngOnInit() {
        if (this.initialItemFn) {
            this.initialItemFn().subscribe(item => {
                this.initialItem = item;
                this.selectedItem = this.initialItem;
                this.searchable = (this.config.searchable || this.config.searchable === undefined);
                this.searchControl.setValue('');
                const displayValue = this.getDisplayValue(this.selectedItem);
                this.valueInputControl.setValue(displayValue);
            });
        }
    }

    public ngOnChanges(changes) {
        if (this.config && this.items) {
            // Init selected item
            if (this.config.valueProperty && typeof this.value !== 'object') {
                this.selectedItem = this.items.find(item => _.get(item, this.config.valueProperty) === this.value);
            } else {
                this.selectedItem = this.value;
            }
            this.searchable = (this.config.searchable || this.config.searchable === undefined);
            this.searchControl.setValue('');
            this.filteredItems = this.items;
            this.focusedIndex = this.filteredItems.indexOf(this.selectedItem);
            const displayValue = this.getDisplayValue(this.selectedItem);
            this.valueInputControl.setValue(displayValue);
            this.cd.markForCheck();
        }
    }

    public ngAfterViewInit() {
        this.focusedIndex = this.focusedIndex || -1;
        this.searchControl.valueChanges
            .distinctUntilChanged()
            .subscribe((value: string) => {
                this.filterItems(value);
            });
        this.createOpenCloseListeners();
        this.createNavigationListener();
        this.createSearchListener();
        this.readyEvent.emit(this);
    }

    private createOpenCloseListeners() {
        const keyDownEvent = Observable.fromEvent(this.el.nativeElement, 'keydown');
        const f4Event = keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.F4);
        const spaceEvent = keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.SPACE);
        const arrowDownEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return (event.keyCode === KeyCodes.UP_ARROW
                || event.keyCode === KeyCodes.DOWN_ARROW)
                && event.altKey;
        });

        Observable.merge(f4Event, arrowDownEvent)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();

                this.toggle();
            });

        spaceEvent.subscribe((event: KeyboardEvent) => this.open());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESCAPE)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.selectedItem = this.initialItem;
                this.focusedIndex = this.filteredItems.indexOf(this.selectedItem);
                this.close();
            });

        keyDownEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.ENTER || event.keyCode === KeyCodes.TAB;
        }).subscribe(() => {
            this.confirmSelection();
            this.close();
        });
    }

    private createSearchListener() {
        const keypressEvent = Observable.fromEvent(this.el.nativeElement, 'keypress');
        keypressEvent.filter((event: KeyboardEvent) => event.keyCode !== KeyCodes.ENTER)
            .subscribe((event: KeyboardEvent) => {
                const ignoredKeyCodes = [KeyCodes.ESCAPE, KeyCodes.TAB];
                const keyCode = event.which || event.keyCode;
                const character = String.fromCharCode(keyCode);

                if (ignoredKeyCodes.indexOf(keyCode) > -1) {
                    return;
                }
                if (!this.searchable) {
                    const focusIndex = this.items.findIndex((item) => {
                        try {
                            return item[this.config.displayProperty][0].toLowerCase() === character;
                        } catch (e) {
                        }
                        return false;
                    });

                    if (focusIndex >= 0) {
                        this.focusedIndex = focusIndex;
                    }
                    this.confirmSelection();
                } else {
                    if (!this.expanded) {
                        this.open();
                        if (this.filteredItems.length) {
                            this.focusedIndex = 0;
                        }
                        this.cd.markForCheck();
                        setTimeout(() => {
                            this.searchInput.nativeElement.focus();
                            this.searchControl.setValue(this.searchControl.value + character);
                        }, 200);
                    }

                }
            });
    }

    private createNavigationListener() {
        const arrowsEvents = Observable.fromEvent(this.el.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => !this.readonly && !(event.altKey || event.shiftKey || event.ctrlKey))
            .filter((event: KeyboardEvent) => {
                return event.keyCode === KeyCodes.UP_ARROW
                    || event.keyCode === KeyCodes.DOWN_ARROW
                    || event.keyCode === KeyCodes.RIGHT_ARROW
                    || event.keyCode === KeyCodes.LEFT_ARROW;
            });


        arrowsEvents.subscribe((event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();

            let index = -1;

            switch (event.keyCode) {
                case KeyCodes.UP_ARROW:
                case KeyCodes.LEFT_ARROW:
                    index = this.focusedIndex - 1;
                    if (index < 0) {
                        index = 0;
                    }
                    break;
                case KeyCodes.DOWN_ARROW:
                case KeyCodes.RIGHT_ARROW:
                    index = this.focusedIndex + 1;
                    if (index > this.filteredItems.length - 1) {
                        index = this.filteredItems.length - 1;
                    }
                    break;
            }

            this.focusedIndex = index;
            this.move();
            this.scrollToListItem();
        });
    }

    private filterItems(filterString: string) {
        if (!this.searchFn) {
            this.filteredItems = this.items.filter((item) => {
                const displayValue = this.getDisplayValue(item) || '';
                return displayValue.toLowerCase().indexOf(filterString.toLowerCase()) >= 0;
            });
            this.cd.markForCheck();
        } else {
            this.searchFn(filterString).subscribe(items => {
                this.filteredItems = items;
                this.cd.markForCheck();
            });
        }
    }

    private getDisplayValue(item): string {
        if (!item || !this.config) {
            return '';
        }

        if (typeof item === 'string') {
            return item;
        } else if (this.config.displayProperty) {
            return _.get(item, this.config.displayProperty, '');
        } else if (this.config.template) {
            return this.config.template(item);
        } else {
            return '';
        }
    }

    private move() {
        if (this.focusedIndex > -1) {
            this.selectedItem = this.filteredItems[this.focusedIndex];
        }
        this.focusedIndex = this.filteredItems.indexOf(this.selectedItem);
        // this.valueChange.emit(this.selectedItem);
        this.activeDecentantId = this.guid + '-item-' + this.focusedIndex;
        // this.close();
        this.cd.markForCheck();
    }

    private confirmSelection(event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (this.focusedIndex > -1) {
            this.selectedItem = this.filteredItems[this.focusedIndex];
        } else {
            return;
        }
        this.focusedIndex = this.filteredItems.indexOf(this.selectedItem);
        this.initialItem = this.selectedItem;
        const displayValue = this.getDisplayValue(this.selectedItem);
        this.valueInputControl.setValue(displayValue);
        if (this.selectedItem !== undefined) {
            this.valueChange.emit(this.selectedItem);
            this.activeDecentantId = this.guid + '-item-' + this.focusedIndex;
        }
        this.close();
        this.focus();
    }

    public clear(event?: MouseEvent | KeyboardEvent) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (this.readonly || this.config.hideDeleteButton) {
            return;
        }

        this.searchControl.setValue('');
        this.selectedItem = null;
        this.valueInputControl.setValue('');
        this.focusedIndex = -1;
        this.initialItem = null;
        this.activeDecentantId = '';
        this.valueChange.emit(null);
        this.close();
        this.focus();
    }

    public open() {
        if (this.readonly) {
            return;
        }
        this.searchControl.setValue('');
        this.filterString = '';
        if (this.items) {
            this.filteredItems = this.items;
            this.expanded = true;
            this.cd.markForCheck();
        } else if (this.searchFn) {
            this.searchFn('').subscribe(items => {
                this.filteredItems = items;
                this.expanded = true;
                this.cd.markForCheck();
            });
        }
    }

    public close() {
        this.expanded = false;
        this.cd.markForCheck();
    }

    public onNewItemClick() {
        this.newButtonAction();
        this.close();
    }

    public toggle() {
        if (this.readonly) {
            return;
        }
        if (this.expanded) {
            this.close();
            this.focus();
        } else {
            this.open();
            try {
                setTimeout(() => {
                    if (this.searchInput) {
                      this.searchInput.nativeElement.focus();
                    }
                });
            } catch (e) {}
        }
    }

    private scrollToListItem() {
        const list = this.itemDropdown.nativeElement;
        const currItem = list.children[this.focusedIndex];
        const bottom = list.scrollTop + (list.offsetHeight) - currItem.offsetHeight;

        if (currItem.offsetTop <= list.scrollTop) {
            list.scrollTop = currItem.offsetTop;
        } else if (currItem.offsetTop >= bottom) {
            list.scrollTop = currItem.offsetTop - (list.offsetHeight - currItem.offsetHeight);
        }
    }

    public focus() {
        this.valueInput.nativeElement.focus();
    }

    public select() {
        this.valueInput.nativeElement.select();
    }

    public getTitle() {
        if (this.valueInput) {
            return (this.valueInput as any).nativeElement.value || '';
        } else {
            return '';
        }
    }
}
