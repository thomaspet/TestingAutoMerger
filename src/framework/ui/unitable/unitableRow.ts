import {Component, Input, Output, EventEmitter, Renderer, ViewChildren, ElementRef, QueryList, ChangeDetectionStrategy} from '@angular/core';
import {IContextMenuItem} from './unitable';
import {UniTablePipe} from './unitablePipe';
import * as Immutable from 'immutable';

export interface IRowModelChangeEvent {
    field: string;
    newValue: any;
    rowModel: Immutable.Map<string, any>;
    triggeredByOtherEvent?: boolean;
    copyEvent?: boolean;
}

@Component({
    selector: '[unitable-row]',
    template: `
        <td *ngIf="config?.multiRowSelect" tabindex="-1"><input [checked]="rowModel.get('_rowSelected')" type="checkbox" #rowSelector (change)="onRowSelectionChanged(rowSelector.checked)"/></td>
        <td #rowColumn *ngFor="let column of columns"
            bind-hidden="!column.get('visible')"
            bind-class="column.get('cls')"
            [ngClass]="column.get('conditionalCls')(rowModel.toJS())"
            [ngStyle]="{'text-align': column.get('alignment') || 'left'}"
            (focus)="onCellFocus($event, column)"
            (click)="onCellClick($event, column)"
            [tabindex]="getTabIndex(column)"
            [innerHtml]="uniTablePipe.transform(rowModel, column)"
            [attr.title]="uniTablePipe.transform(rowModel, column)">
        </td>

        <td *ngIf="config?.deleteButton" tabindex="-1" class="unitable-delete-btn">
            <button class="table-button"
                    [disabled]="config.readonly && config.deleteButton.disableOnReadonlyRows"
                    (click)="onDeleteRow()"> </button>
        </td>

        <td *ngIf="rowMenuItem" [ngClass]="{'contextMenu': !singleItemMenu}" tabindex="-1">
            <button class="table-button"
                    [disabled]="config?.readonly && contextMenu.disableOnReadonlyRows"
                    (click)="rowMenuItem.action(rowModel.toJS())">
                {{rowMenuItem.label}}
            </button>
        </td>

        <td *ngIf="config?.columnMenuVisible && !rowMenuItem && !config?.deleteButton"></td>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniTableRow {
    @Input() public rowModel: any;
    @Input() public columns: any;
    @Input() public config: any;

    @Output()
    private rowDeleted: EventEmitter<any> = new EventEmitter(false);

    @Output()
    private cellFocused: EventEmitter<any> = new EventEmitter(false);

    @Output()
    private cellClicked: EventEmitter<any> = new EventEmitter(false);

    @Output()
    private rowSelectionChanged: EventEmitter<any> = new EventEmitter(false);

    @Output()
    private contextMenuClicked: EventEmitter<any> = new EventEmitter(false);

    @ViewChildren('rowColumn')
    private cells: QueryList<ElementRef>;

    public uniTablePipe: UniTablePipe = new UniTablePipe();
    private contextMenu: any;
    private singleItemMenu: boolean = true;
    private rowMenuItem: IContextMenuItem = undefined;

    public constructor(private renderer: Renderer) {}

    public ngOnChanges(changes) {
        if (changes['config'] && this.config) {
            this.contextMenu = this.config.contextMenu;
            if (this.contextMenu && this.contextMenu.items.length) {
                if (this.contextMenu.items.length === 1 && !this.contextMenu.showDropdownOnSingleItem) {
                    this.singleItemMenu = true;
                    this.rowMenuItem = this.contextMenu.items[0];
                } else {
                    this.singleItemMenu = false;
                    this.rowMenuItem = {
                        label: '...',
                        action: () => {
                            this.contextMenuClick();
                        }
                    };
                }
            }
        }
    }

    public onCellFocus(event, column) {
        setTimeout(() => {
            this.cellFocused.emit({
                target: event.target,
                column: column,
                rowModel: this.rowModel
            });
        });
    }

    public onCellClick(event, column) {
        setTimeout(() => {
            this.cellClicked.emit({
                event: event,
                column: column,
                rowModel: this.rowModel
            });
        });
    }

    public onDeleteRow() {
        this.rowDeleted.emit({
            rowModel: this.rowModel
        });
    }

    public onRowSelectionChanged(checked: boolean) {
        const updatedRow = this.rowModel.set('_rowSelected', checked);
        this.rowSelectionChanged.emit({
            rowModel: updatedRow
        });
    }

    public getTabIndex(column) {
        return column.get('editable') ? 1 : -1;
    }

    private contextMenuClick() {
        this.contextMenuClicked.emit({
            cell: this.cells.last.nativeElement,
            rowModel: this.rowModel
        });
    }

}
