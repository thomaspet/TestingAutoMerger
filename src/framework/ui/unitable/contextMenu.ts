import {Component, Input, ChangeDetectorRef} from '@angular/core';
import {IContextMenuItem} from './unitable';

@Component({
    selector: 'unitable-contextmenu',
    template: `
        <section class="dropdown-menu" *ngIf="isOpen" [ngStyle]="{'top': offsetTop, 'right': 0}">
            <a class="dropdown-menu-item"
                *ngFor="let item of activeItems"
                (click)="item.action(rowModel.toJS())">
                {{item.label}}
            </a>
        </section>
    `,
    host: {
        '(click)': 'onClick($event)',
        '(document:click)': 'offClick()'
    }
})
export class UnitableContextMenu {
    @Input()
    private items: IContextMenuItem[];

    public offsetTop: number;
    public rowModel: any;
    public activeItems: IContextMenuItem[];
    public isOpen: boolean;

    constructor(private cdr: ChangeDetectorRef) {
        this.offsetTop = 0;
    }

    public update(offsetTop, rowModel) {
        // Second click on the same row should hide context menu
        if (this.offsetTop === offsetTop && this.isOpen) {
            this.isOpen = false;
            return;
        }

        this.offsetTop = offsetTop;
        this.rowModel = rowModel;

        this.activeItems = [];
        this.items.forEach((item) => {
            if (!item.disabled || !item.disabled(rowModel.toJS())) {
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

    public offClick() {
        this.isOpen = false;
    }
}
