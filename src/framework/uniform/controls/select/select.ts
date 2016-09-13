import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, Renderer} from '@angular/core';
import {FormControl, FormControlDirective} from '@angular/forms';
import {GuidService} from '../../../../app/services/common/guidService';
import {ClickOutsideDirective} from '../../../../framework/core/clickOutside';

declare var _; // lodash

export interface ISelectConfig {
    displayField?: string;
    valueField?: string;
    template?: (item) => string;
    placeholder?: string;
    searchable?: boolean;

    // compatibility with uniform config names
    valueProperty?: string;
    displayProperty?: string;
}

@Component({
    selector: 'uni-select',
    templateUrl: 'framework/uniform/controls/select/select.html',
    directives: [ClickOutsideDirective, FormControlDirective]
})
export class UniSelect {
    @ViewChild('searchInput')
    private inputElement: ElementRef;

    @ViewChild('itemDropdown')
    private itemDropdown: ElementRef;

    @Input()
    private items: any[];

    @Input()
    private config: ISelectConfig;

    @Input()
    public value: any;

    @Output()
    public valueChange: EventEmitter<any> = new EventEmitter<any>();

    private guid: string;
    private expanded: boolean = false;

    private searchable: boolean = true;
    private searchControl: FormControl = new FormControl('');
    private filteredItems: any[];

    private selectedItem: any;
    private focusedIndex: any = 0;
    private activeDecentantId: string;

    constructor(gs: GuidService, private renderer: Renderer) {
        // Set a guid for DOM elements, etc.
        this.guid = gs.guid();
    }

    public ngOnChanges(changes) {
        if (this.value && this.items && (changes['items'] || changes['value'])) {
            if (this.config.valueProperty) {
                this.selectedItem = this.items.find(item => _.get(item, this.config.valueProperty) === this.value);
            } else {
                this.selectedItem = this.value;
            }
        }

        if (changes['config'] && this.config) {
            if (this.config.valueProperty) {
                this.config.valueField = this.config.valueProperty;
            }
            if (this.config.displayProperty) {
                this.config.displayField = this.config.displayProperty;
            }
            this.searchable = (this.config.searchable || this.config.searchable === undefined);
        }

        if (changes['items'] && this.items) {
            this.searchControl.updateValueAndValidity('');
            this.filteredItems = this.items;
        }
    }

    public ngAfterViewInit() {
        this.focusedIndex = this.focusedIndex || 0;

        this.searchControl.valueChanges
        .debounceTime(250)
        .distinctUntilChanged()
        .subscribe((value) => {
            this.filterItems(value);
        });
    }

    // Focus first item matching character pressed
    @HostListener('keypress', ['$event'])
    private onKeypress(event) {
        // If select is searchable we dont want this
        if (!this.searchable) {
            const character = String.fromCharCode(event.which);
            const focusIndex = this.items.findIndex((item) => {
                try {
                    return item[this.config.displayField][0].toLowerCase() === character;
                } catch (e) {}

                return false;
            });

            if (focusIndex >= 0) {
                this.focusedIndex = focusIndex;
            }
        }
    }

    private filterItems(filterString: string) {
        this.filteredItems = this.items.filter((item) => {
            return this.getDisplayValue(item).toLowerCase().indexOf(filterString.toLowerCase()) >= 0;
        });
    }

    private getDisplayValue(item): string {
        if (!item || !this.config) {
            return '';
        }

        if (typeof item === 'string') {
            return item;
        } else if (this.config.displayField) {
            return _.get(item, this.config.displayField);
        } else if (this.config.template) {
            return this.config.template(item);
        } else {
            return '';
        }
    }

    private confirmSelection() {
        this.selectedItem = this.items[this.focusedIndex];
        this.valueChange.emit(this.selectedItem);
        this.activeDecentantId = this.guid + '-item-' + this.focusedIndex;
    }

    public open() {
        this.expanded = true;
        setTimeout(() => {
            this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);
        });
    }

    public close() {
        this.expanded = false;
    }

    private toggle() {
        this.expanded = !this.expanded;
        if (this.expanded) {
            setTimeout(() => {
                this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);
            });
        }
    }

    // Keyboard navigation
    @HostListener('keydown', ['$event'])
    private onKeyDown(event) {
        const key = event.which || event.keyCode || 0;

        // Tab or enter
        if (key === 9 || key === 13) {
            this.confirmSelection();
            this.expanded = false;
        // Escape
        } else if (key === 27) {
            this.expanded = false;
        // Space
        } else if (key === 32) {
            if (this.expanded) {
                this.confirmSelection();
                this.expanded = false;
            } else {
                this.expanded = true;
            }
        // Arrow up
        } else if (key === 38 && this.focusedIndex > 0) {
            event.preventDefault();
            this.focusedIndex--;
            this.scrollToListItem();
        // Arrow down
        } else if (key === 40) {
            event.preventDefault();
            if (!this.expanded) {
                this.expanded = true;
            } else {
                this.moveDown();
            }
        }
    }

    private moveDown() {
        if (!this.focusedIndex && this.focusedIndex !== 0) {
            this.focusedIndex = 0;
            return;
        }

        if (this.focusedIndex < (this.filteredItems.length - 1)) {
            this.focusedIndex++;
            this.scrollToListItem();
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
}
