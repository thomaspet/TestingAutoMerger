import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'row-menu',
    template: `
        <span class="row-menu-container" (click)="$event.stopPropagation()">
            <i class="material-icons"
                *ngIf="deleteButtonAction"
                (click)="deleteButtonAction(rowData)">

                delete
            </i>

            <ng-template [ngIf]="contextMenuItems?.length">
                <i class="material-icons" #toggle (click)="onContextMenuToggle()">
                    more_horiz
                </i>

                <dropdown-menu [trigger]="toggle" minWidth="12rem">
                    <ng-template>
                        <a class="dropdown-menu-item" *ngFor="let item of filteredContextMenuItems" (click)="item.action(rowData)">
                            {{item.label}}
                        </a>
                    </ng-template>
                </dropdown-menu>
            </ng-template>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowMenuRenderer implements ICellRendererAngularComp {
    parentContext: AgGridWrapper;
    rowData: any;

    contextMenuItems: any[];
    filteredContextMenuItems: any[];
    deleteButtonAction: (row) => void;

    agInit(params: ICellRendererParams): void {
        this.buildMenuItems(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.buildMenuItems(params);
        return true;
    }

    buildMenuItems(params: ICellRendererParams) {
        const isGroupRow = params.node.group;
        if (!isGroupRow) {
            this.rowData = params.data;
            this.parentContext = params.context.componentParent;

            this.contextMenuItems = this.parentContext.getContextMenuItems(this.rowData);
            this.deleteButtonAction = this.parentContext.getDeleteButtonAction(this.rowData);
        }
    }

    public onContextMenuToggle() {
        // Filter items here instead of on init, because init runs on every row
        // and we only need to do this when the user actually opens a menu
        this.filteredContextMenuItems = this.contextMenuItems && this.contextMenuItems.filter(item => {
            return !item.disabled || !item.disabled(this.rowData);
        });
    }
}
