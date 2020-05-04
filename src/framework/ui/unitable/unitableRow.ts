import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChildren,
    ElementRef,
    QueryList,
    ChangeDetectionStrategy,
    OnChanges,
    ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {IContextMenuItem} from './unitable';
import {UniTableColumn, UniTableColumnType} from './config/unitableColumn';
import {UniTableConfig} from './config/unitableConfig';
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
        <td *ngIf="config?.multiRowSelect" tabindex="-1">
            <input type="checkbox" #rowSelector
                [checked]="rowModel.get('_rowSelected')"
                (change)="onRowSelectionChanged(rowSelector.checked)"
            />
        </td>

        <td #rowColumn *ngFor="let column of columns"
            bind-hidden="!column.get('visible')"
            bind-class="column.get('cls')"
            [ngClass]="column.get('conditionalCls') && column.get('conditionalCls')(rowModel.toJS())"
            [ngStyle]="{'text-align': column.get('alignment') || 'left'}"
            (focus)="onCellFocus($event, column)"
            (click)="onCellClick($event, column)"
            [tabindex]="getTabIndex(column)"
            [attr.title]="uniTablePipe.transform(rowModel, column)">

            <span role="link" class="unitable-link"
                *ngIf="column.get('linkResolver'); else nonLink"
                (click)="onLinkClick($event, column)">

                {{uniTablePipe.transform(rowModel, column)}}
            </span>

            <ng-template #nonLink>
                {{uniTablePipe.transform(rowModel, column)}}

                <em *ngIf="column.get('tooltipResolver')"
                    class="unitable-tooltip"
                    role="presentation"
                    [ngClass]="column | columnTooltipPipe: rowModel : 'cssClass'"
                    [title]="column | columnTooltipPipe: rowModel : 'text'">
                </em>
            </ng-template>

        </td>

        <td *ngIf="config?.deleteButton" tabindex="-1" class="unitable-delete-btn">
            <button class="table-button"
                [disabled]="config.readonly && config.deleteButton.disableOnReadonlyRows"
                (click)="onDeleteRow()">
            </button>
        </td>

        <td *ngIf="rowMenuItem" #contextMenuCell [ngClass]="{'contextMenu': !singleItemMenu}" tabindex="-1">
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

export class UniTableRow implements OnChanges {
    @Input() public rowModel: Immutable.Map<any, any>;
    @Input() public columns: Immutable.List<UniTableColumn>;
    @Input() public config: UniTableConfig;

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

    @ViewChild('contextMenuCell')
    private contextMenuCell: ElementRef;

    public uniTablePipe: UniTablePipe = new UniTablePipe();
    public contextMenu: any;
    public singleItemMenu: boolean = true;
    public rowMenuItem: IContextMenuItem = undefined;

    public constructor(private router: Router) {}

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

    public onLinkClick(event: MouseEvent, column: Immutable.Map<any, any>) {
        const linkResolver = column && column.get('linkResolver');
        let url = linkResolver && linkResolver(this.rowModel.toJS());

        if (url && url.length) {
            event.stopPropagation();
            if (url.includes('mailto:')) {
                window.location.href = url;
            } else if (url.includes('https') || url.includes('http') || url.includes('www')) {
                if (window.confirm('Du forlater nå applikasjonen')) {
                    if (!url.includes('http')) {
                        url = 'https://' + url;
                    }
                    window.open(url, '_blank');
                }
            } else {
                this.router.navigateByUrl(url);
            }
        } else {
            console.log('Missing link resolver in column config');
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
            cell: this.contextMenuCell.nativeElement,
            rowModel: this.rowModel
        });
    }

}
