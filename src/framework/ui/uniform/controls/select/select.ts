import {
    Component, Input, Output, EventEmitter, ViewChild, ElementRef,
    Renderer, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';
import {KeyCodes} from '../../../../../app/services/common/keyCodes';

export interface ISelectConfig {
    valueProperty?: string;
    displayProperty?: string;
    addEmptyValue?: boolean;
    template?: (item) => string;
    placeholder?: string;
    searchable?: boolean;
}

@Component({
    selector: 'uni-select',
    template: `
        <article class="uniSelect"
                 *ngIf="config && items" (clickOutside)="close()">

            <input type="text" #valueInput
                   [attr.aria-describedby]="config?.asideGuid"
                   class="uniSelect_input"
                   role="combobox"
                   aria-autocomplete="none"
                   [attr.aria-owns]="guid"
                   [attr.aria-activedescendant]="activeDescendantId"
                   tabindex="0"
                   [value]="getDisplayValue(selectedItem)"
                   [placeholder]="config?.placeholder || ''"
                   [attr.aria-readonly]="readonly"
                   (click)="toggle()"
                   [title]="getTitle()"
                   (keydown.delete)="clear($event)"
                   readonly/>
            <button
                (click)="clear($event)"
                class="closeBtn"
                *ngIf="selectedItem"
            ></button>
            <article class="uniSelect_dropdown" [hidden]="!expanded">
                <section class="uniSelect_search" *ngIf="searchable">
                    <input #searchInput type="search"
                           [placeholder]="config?.searchPlaceholder || 'Filtrer elementer'"
                           [formControl]="searchControl"
                    />
                </section>

                <ul #itemDropdown
                    [id]="guid"
                    [attr.aria-expanded]="true"
                    class="uniSelect_dropdown_list"
                    role="listbox"
                    tabindex="-1">

                    <li *ngFor="let item of filteredItems; let idx = index"
                        class="uniSelect_dropdown_item"
                        role="item"
                        tabindex="-1"
                        [id]="guid + '-item-' + idx"
                        [attr.aria-selected]="idx === focusedIndex"
                        (mouseover)="focusedIndex = idx"
                        (click)="confirmSelection($event)">
                        {{getDisplayValue(item)}}
                    </li>
                    <li *ngIf="newButtonAction"
                        class="uniSelect_dropdown_new_button_item">
                        <button
                            type="button"
                            (click)="onNewItemClick()">
                            Ny
                        </button>
                    </li>
                </ul>
            </article>
        </article>

    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSelect {
    @ViewChild('searchInput') public searchInput: ElementRef;
    @ViewChild('valueInput') public valueInput: ElementRef;
    @ViewChild('itemDropdown') public itemDropdown: ElementRef;

    @Input() public items: any[];
    @Input() public newButtonAction: Function;
    @Input() public readonly: boolean;
    @Input() public config: ISelectConfig;
    @Input() public value: any;

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

    constructor(public renderer: Renderer, public cd: ChangeDetectorRef, public el: ElementRef) {
        // Set a guid for DOM elements, etc.
        this.guid = (new Date()).getTime().toString();
    }

    public ngOnChanges(changes) {
        if (this.config && this.items) {
            // Init selected item
            if (this.config.valueProperty) {
                this.selectedItem = this.items.find(item => _.get(item, this.config.valueProperty) === this.value);
            } else {
                this.selectedItem = this.value;
            }
            this.initialItem = this.selectedItem;
            this.searchable = (this.config.searchable || this.config.searchable === undefined);
            this.searchControl.updateValueAndValidity('');
            this.filteredItems = this.items;
            this.focusedIndex = this.filteredItems.indexOf(this.selectedItem);

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
            return (event.keyCode === KeyCodes.UP_ARROW
                || event.keyCode === KeyCodes.DOWN_ARROW)
                && event.altKey;
        });

        Observable.merge(f4AndSpaceEvent, arrowDownEvent)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
            });

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
            .filter((event: KeyboardEvent) => !(event.altKey || event.shiftKey || event.ctrlKey))
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
        this.filteredItems = this.items.filter((item) => {
            let displayValue = this.getDisplayValue(item) || '';
            return displayValue.toLowerCase().indexOf(filterString.toLowerCase()) >= 0;
        });
        this.cd.markForCheck();
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
        }
        this.focusedIndex = this.filteredItems.indexOf(this.selectedItem);
        this.initialItem = this.selectedItem;
        this.valueChange.emit(this.selectedItem);
        this.activeDecentantId = this.guid + '-item-' + this.focusedIndex;
        this.close();
        this.focus();
    }

    public clear(event: MouseEvent | KeyboardEvent) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.searchControl.setValue('');
        this.selectedItem = null;
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
