import {Component, Input, ChangeDetectorRef} from '@angular/core';

export interface IContextMenuItem {
    label: string;
    action: (item?: any) => void;
    disabled?: (item?: any) => boolean;
}

@Component({
    selector: 'table-contextmenu',
    template: `
        <ul class="table-contextmenu"
            [attr.aria-expanded]="isOpen"
            [ngStyle]="{'top': offsetTop + 'px', 'right': 0}">

            <li *ngFor="let item of activeItems" (click)="item.action(rowModel)">
                {{item.label}}
            </li>
        </ul>
    `,
    host: {
        '(click)': 'onClick($event)',
        '(document:click)': 'offClick()'
    }
})
export class TableContextMenu {
    @Input() private items: IContextMenuItem[];

    private offsetTop: number;
    private rowModel: any;
    private activeItems: IContextMenuItem[];
    public isOpen: boolean;

    constructor(private cdr: ChangeDetectorRef) {
        this.offsetTop = 0;
    }

    public toggle(offsetTop, rowModel) {
        // Second click on the same row should hide context menu
        if (this.offsetTop === offsetTop && this.isOpen) {
            this.isOpen = false;
            this.cdr.markForCheck();
            return;
        }

        this.offsetTop = offsetTop;
        this.rowModel = rowModel;

        this.activeItems = [];
        this.items.forEach((item) => {
            if (!item.disabled || !item.disabled(rowModel)) {
                this.activeItems.push(item);
            }
        });

        setTimeout(() => {
            this.isOpen = true;
            this.cdr.markForCheck();
        });
    }

    public onClick(event) {
        event.stopPropagation();
        this.isOpen = false;
    }

    private offClick() {
        this.isOpen = false;
    }
}
