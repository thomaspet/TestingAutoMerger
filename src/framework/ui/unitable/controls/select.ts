import {Component, Input, HostListener, ViewChild, ElementRef, Renderer} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

export interface ISelectOptions {
    resource: Observable<any> | any[];
    displayField?: string;
    itemTemplate?: (item) => string;
    searchable?: boolean;
    searchPlaceholder?: string;
    dropdownWidth?: string;
    hideNotChosenOption?: boolean;
}

@Component({
    selector: 'unitable-select',
    template: `
        <article class="uniSelect">
            <input type="text"
                #inputElement
                class="uniSelect_input"
                role="combobox"
                aria-autocomplete="none"
                tabindex="0"
                (click)="expanded = !expanded"
                (keydown)="onKeyDown($event)"
                [formControl]="inputControl"
                readonly />

            <ul #itemDropdown
                [attr.aria-expanded]="expanded"
                role="listbox"
                class="uniTable_dropdown_list"
                tabindex="-1">
                <li *ngFor="let item of items; let idx = index"
                    class="uniTable_dropdown_item"
                    [attr.aria-selected]="idx === focusedIndex"
                    (mouseover)="focusedIndex = idx"
                    (click)="itemClicked(idx)">
                    {{getDisplayValue(item)}}
                </li>
            </ul>
        </article>
    `
})
export class UnitableSelect {
    @ViewChild('inputElement')
    public inputElement: ElementRef;

    @ViewChild('itemDropdown')
    private itemDropdown: ElementRef;

    @Input()
    private column: any;

    @Input()
    public inputControl: FormControl;

    public expanded: boolean = false;
    private options: ISelectOptions;

    private items: any[];
    private focusedIndex: number;
    private selectedItem: any;

    constructor(private renderer: Renderer) {}

    public ngOnInit() {
        if (this.column) {
            this.options = this.column.get('options') || {};

            if (Array.isArray(this.options.resource)) {
                this.items = [...<any[]> this.options.resource];
            } else {
                (<Observable<any>> this.options.resource).subscribe((res) => {
                    this.items = res;
                });
            }
        }
    }

    public getValue() {
        if (this.selectedItem) {
            return this.selectedItem;
        }

        if (this.focusedIndex >= 0) {
            return this.items[this.focusedIndex];
        }
    }

    public toggle() {
        this.expanded = !this.expanded;
    }

    private itemClicked(index) {
        this.selectedItem = this.items[index];
        this.focusedIndex = index;
        this.inputControl.setValue(this.getDisplayValue(this.selectedItem));
        this.expanded = false;
        this.inputElement.nativeElement.focus();
    }

    private getDisplayValue(item: any): string {
        if (!item) {
            return 'Ikke valgt';
        }

        if (!this.options) {
            return '';
        }

        if (typeof item === 'string') {
            return item;
        } else if (this.options.itemTemplate) {
            return this.options.itemTemplate(item);
        } else if (this.options.displayField) {
            return item[this.options.displayField];
        } else {
            return '';
        }
    }

    @HostListener('keypress', ['$event'])
    private onKeypress(event) {
        if (!this.items) {
            return;
        }

        const character = String.fromCharCode(event.charCode || event.which);
        const focusIndex = this.items.findIndex((item) => {
            try {
                return item[this.options.displayField][0].toLowerCase() === character;
            } catch (e) {}

            return false;
        });

        if (focusIndex >= 0) {
            this.expanded = true;
            this.focusedIndex = focusIndex;
            this.selectedItem = this.items[focusIndex];
            this.scrollToListItem();
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        switch (key) {
            // Escape
            case 27:
                if (this.expanded) {
                    event.stopPropagation();
                    this.expanded = false;
                }
            break;
            // Space
            case 32:
                event.preventDefault();
                this.expanded = !this.expanded;
            break;
            // Arrow up
            case 38:
                event.preventDefault();
                if (this.focusedIndex > 0) {
                    this.focusedIndex--;
                    this.scrollToListItem();
                    this.selectedItem = this.items[this.focusedIndex];
                }
            break;
            // Arrow down
            case 40:
                event.preventDefault();
                if (event.altKey) {
                    this.expanded = true;
                }

                if (this.expanded) {
                    if (!this.focusedIndex && this.focusedIndex !== 0) {
                        this.focusedIndex = 0;
                        return;
                    }

                    if (this.items && this.focusedIndex < (this.items.length - 1)) {
                        this.focusedIndex++;
                        this.scrollToListItem();
                    }
                    this.selectedItem = this.items[this.focusedIndex];
                }
            break;
            // F4
            case 115:
                this.expanded = true;
            break;
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
