import {
    Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener,
    Renderer, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {GuidService} from '../../../../app/services/common/guidService';
import {Observable} from "rxjs/Observable";
import {KeyCodes} from "../../interfaces";

declare var _; // lodash

export interface ISelectConfig {
    valueProperty?: string;
    displayProperty?: string;
    template?: (item) => string;
    placeholder?: string;
    searchable?: boolean;
}

@Component({
    selector: 'uni-select',
    templateUrl: 'framework/uniform/controls/select/select.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSelect {
    @ViewChild('searchInput')
    public searchInput: ElementRef;

    @ViewChild('valueInput')
    public valueInput: ElementRef;

    @ViewChild('itemDropdown')
    private itemDropdown: ElementRef;

    @Input()
    private items: any[];

    @Input()
    private newButtonAction: Function;

    @Input()
    private readonly: boolean;

    @Input()
    private config: ISelectConfig;

    @Input()
    public value: any;

    @Output()
    public valueChange: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public readyEvent: EventEmitter<UniSelect> = new EventEmitter<UniSelect>(true);

    private guid: string;
    private expanded: boolean = false;

    private searchable: boolean = true;
    private searchControl: FormControl = new FormControl('');
    private filteredItems: any[];
    private filterString: string = '';

    private selectedItem: any;
    private focusedIndex: any = -1;
    private activeDecentantId: string;

    constructor(gs: GuidService, private renderer: Renderer, private cd: ChangeDetectorRef, private el: ElementRef) {
        // Set a guid for DOM elements, etc.
        this.guid = gs.guid();
    }

    public ngOnChanges(changes) {
        if (this.config && this.items) {
            // Init selected item
            if (this.config.valueProperty && this.value) {
                this.selectedItem = this.items.find(item => _.get(item, this.config.valueProperty) === this.value);
            } else {
                this.selectedItem = this.value;
            }

            this.searchable = (this.config.searchable || this.config.searchable === undefined);
            this.searchControl.updateValueAndValidity('');
            this.filteredItems = this.items;

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
        const f4AndSpaceEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.F4 || event.keyCode === KeyCodes.SPACE;
        });
        const arrowDownEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return (event.keyCode === KeyCodes.ARROW_UP
                || event.keyCode === KeyCodes.ARROW_DOWN)
                && event.altKey;
        });

        Observable.merge(f4AndSpaceEvent, arrowDownEvent)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
            });

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESC)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
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
                const character = String.fromCharCode(event.which);
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
            .filter((event: KeyboardEvent) => !(event.altKey || event.shiftKey || event.ctrlKey))
            .filter((event: KeyboardEvent) => {
                return event.keyCode === KeyCodes.ARROW_UP
                    || event.keyCode === KeyCodes.ARROW_DOWN
                    || event.keyCode === KeyCodes.ARROW_RIGHT
                    || event.keyCode === KeyCodes.ARROW_LEFT;
            });


        arrowsEvents.subscribe((event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();

            let index = -1;

            switch (event.keyCode) {
                case KeyCodes.ARROW_UP:
                case KeyCodes.ARROW_LEFT:
                    index = this.focusedIndex - 1;
                    if (index < 0) {
                        index = 0;
                    }
                    break;
                case KeyCodes.ARROW_DOWN:
                case KeyCodes.ARROW_RIGHT:
                    index = this.focusedIndex + 1;
                    if (index > this.filteredItems.length - 1) {
                        index = this.filteredItems.length - 1;
                    }
                    break;
            }

            this.focusedIndex = index;
            this.confirmSelection();
            this.scrollToListItem();
        });
    }

    private filterItems(filterString: string) {
        this.filteredItems = this.items.filter((item) => {
            return this.getDisplayValue(item).toLowerCase().indexOf(filterString.toLowerCase()) >= 0;
        });
        this.focusedIndex = -1;
        this.cd.markForCheck();
    }

    private getDisplayValue(item): string {
        if (!item || !this.config) {
            return '';
        }

        if (typeof item === 'string') {
            return item;
        } else if (this.config.displayProperty) {
            return _.get(item, this.config.displayProperty);
        } else if (this.config.template) {
            return this.config.template(item);
        } else {
            return '';
        }
    }

    private confirmSelection() {
        if (this.focusedIndex > -1) {
            this.selectedItem = this.filteredItems[this.focusedIndex];
        }
        this.focusedIndex = this.filteredItems.indexOf(this.selectedItem);
        this.valueChange.emit(this.selectedItem);
        this.activeDecentantId = this.guid + '-item-' + this.focusedIndex;
        this.cd.markForCheck();
    }

    public open() {
        if (this.readonly) {
            return;
        }
        this.expanded = true;
        this.cd.markForCheck();
    }

    public close() {
        this.expanded = false;
        this.searchControl.setValue('');
        this.filterString = '';
        this.filteredItems = this.items;
        this.cd.markForCheck();
    }

    public onNewItemClick() {
        this.newButtonAction();
        this.close();
    }

    private toggle() {
        if (this.expanded) {
            this.close();
        } else {
            this.open();
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
}
