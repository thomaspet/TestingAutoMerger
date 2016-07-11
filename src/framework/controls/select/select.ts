import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, Renderer} from '@angular/core';
import {Control} from '@angular/common';
import {GuidService} from '../../../app/services/services';
import {ClickOutsideDirective} from '../../../framework/core/clickOutside';

export interface ISelectConfig {
    displayField?: string;
    template?: (item) => string;
    placeholder?: string;
    searchable?: boolean;
}

@Component({
    selector: 'uni-select',
    templateUrl: 'framework/controls/select/select.html',
    directives: [ClickOutsideDirective]
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
    private focusPositionTop: number = 0;

    private searchable: boolean = true;
    private searchControl: Control = new Control('');
    private filteredItems: any[];

    private selectedItem: any;
    private focusedIndex: any;
    private activeDecentantId: string;

    constructor(gs: GuidService, private renderer: Renderer) {
        // Set a guid for DOM elements, etc.
        this.guid = gs.guid();
    }

    public ngOnChanges(changes) {
        if (changes['value'] && this.value) {
            this.selectedItem = this.value;
        }

        if (changes['config'] && this.config) {
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
                this.setFocusIndex(focusIndex);
            }
        }        
    } 

    @HostListener('keydown', ['$event'])
    private onKeydown(event) {
        const key = event.which || event.keyCode || 0;
        // Vars for calculating scroll on arrow keys
        var prevItem = undefined;
        var currItem = undefined;
        var overflow = 0;
        
        // Tab or enter
        if (key === 9 || key === 13) {
            this.confirmSelection();
            this.close();
        // Escape
        } else if (key === 27) {
            this.close();
        // Space
        } else if (key === 32) {
            if (this.expanded) {
                this.confirmSelection();
                this.close();
            } else {
                this.open();
            }
        // Arrow up
        } else if (key === 38) {
            event.preventDefault(); // avoid scrolling entire page
            if (this.focusedIndex > 0) {
                this.focusedIndex--;

                currItem = this.itemDropdown.nativeElement.children[this.focusedIndex];
                this.focusPositionTop -= currItem.offsetHeight;
                overflow = this.focusPositionTop - this.itemDropdown.nativeElement.scrollTop;

                if (overflow < 0) {
                    this.itemDropdown.nativeElement.scrollTop += overflow;
                }
            }
        // Arrow down
        } else if (key === 40) {
            event.preventDefault(); // avoid scrolling entire page
            if (this.focusedIndex < (this.items.length - 1)) {
                this.focusedIndex++;

                prevItem = this.itemDropdown.nativeElement.children[this.focusedIndex - 1];
                currItem = this.itemDropdown.nativeElement.children[this.focusedIndex];

                if (prevItem && currItem) {
                    this.focusPositionTop += prevItem.offsetHeight;

                        
                    overflow = (this.focusPositionTop + currItem.offsetHeight) - 
                               (this.itemDropdown.nativeElement.offsetHeight + this.itemDropdown.nativeElement.scrollTop);
                    

                    if (overflow > 0) {
                        this.itemDropdown.nativeElement.scrollTop += overflow;
                    }
                }
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
            return item[this.config.displayField];
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

    private setFocusIndex(index) {
        if (index < this.focusedIndex) {
            for (let i = index; i < this.focusedIndex; i++) {
                this.focusPositionTop -= this.itemDropdown.nativeElement.children[i].offsetHeight; 
            }
        } else if (index > this.focusedIndex) {
            for (let i = this.focusedIndex; i < index; i++) {
                this.focusPositionTop += this.itemDropdown.nativeElement.children[i].offsetHeight;
            }
        }

        this.focusedIndex = index;
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
}
