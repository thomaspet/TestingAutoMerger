import {Component, HostListener, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';

export interface ISelectOptions {
    resource: any[] | ((row?) => any[]) | Observable<any>;
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
        <section class="input-with-button" (click)="expanded = !expanded">
            <input #inputElement
                type="text"
                class="select-input"
                role="combobox"
                aria-autocomplete="none"
                tabindex="0"
                (keydown)="onKeyDown($event)"
                [formControl]="inputControl"
                readonly
            />

            <button type="button" tabIndex="-1">
                <i class="material-icons">expand_more</i>
            </button>
        </section>

        <input-dropdown-menu [input]="inputElement" [visible]="expanded">
            <ng-template>
                <section #dropdown>
                    <section class="dropdown-menu-item"
                        *ngFor="let item of items; let idx = index"
                        [attr.aria-selected]="idx === focusedIndex"
                        (mouseover)="focusedIndex = idx"
                        (click)="itemClicked(idx)">

                        {{getDisplayValue(item)}}
                    </section>
                </section>
            </ng-template>
        </input-dropdown-menu>
    `
})
export class UnitableSelect {
    @ViewChild('inputElement', { static: true })
    public inputElement: ElementRef;

    @ViewChild('dropdown')
    private dropdown: ElementRef;

    column: any;
    rowModel: any;
    inputControl: FormControl;

    itemSelected: EventEmitter<any> = new EventEmitter();

    public expanded: boolean = false;
    private options: ISelectOptions;

    public items: any[];
    public focusedIndex: number;
    private selectedItem: any;

    public ngOnInit() {
        if (this.column) {
            this.options = this.column.get('options') || {};
            const resource = this.options.resource;

            if (Array.isArray(resource)) {
                this.items = [...resource];
            } else if (typeof resource === 'function') {
                this.items = resource(this.rowModel);
            } else {
                (<Observable<any>> resource).subscribe((res) => {
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

    itemClicked(index) {
        this.selectedItem = this.items[index];
        this.focusedIndex = index;
        this.inputControl.setValue(this.getDisplayValue(this.selectedItem));
        this.expanded = false;
        this.inputElement.nativeElement.focus();
        this.itemSelected.emit();
    }

    private getDisplayValue(item: any): string {
        if (item === null || item === undefined) {
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
    public onKeypress(event) {
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

    public onKeyDown(event: KeyboardEvent) {
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
        if (this.dropdown && this.dropdown.nativeElement) {
            const item: HTMLElement = this.dropdown.nativeElement.children[this.focusedIndex];
            if (item) {
                item.scrollIntoView({block: 'nearest'});
            }
        }
    }

}
