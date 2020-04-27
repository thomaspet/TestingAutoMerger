import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams, GridApi} from 'ag-grid-community';
import {UniTableColumn} from '@uni-framework/ui/unitable';
import {File} from '@uni-entities';
import {UniFilesService, ErrorService, FileService} from '@app/services/services';
import {DropdownMenu} from '@uni-framework/ui/dropdown-menu/dropdown-menu';
import {switchMap} from 'rxjs/operators';
import {get, set} from 'lodash';
import {of} from 'rxjs';

@Component({
    selector: 'attachment-cell',
    templateUrl: './attachment-cell.html',
    styleUrls: ['./attachment-cell.sass']
})
export class AttachmentCellRenderer implements ICellRendererAngularComp {
    @ViewChild(DropdownMenu, { static: false }) dropdownMenu: DropdownMenu;

    busy: boolean;
    params: ICellRendererParams;
    items: Array<File|number>;
    column: UniTableColumn;
    options;
    row;
    gridApi: GridApi;

    constructor(
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService,
        private uniFilesService: UniFilesService,
        private fileService: FileService,
    ) {}

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.row = params.node.data || {};

        this.column = params.colDef && params.colDef['_uniTableColumn'] || {};

        this.options = this.column.options || {};
        this.items = get(this.row, this.column.field, []);
        this.gridApi = params.api;
    }

    refresh(): boolean {
        return false;
    }

    getItemLabel(item: File | number) {
        if (typeof item === 'object') {
            return item.Name;
        }

        return `Fil ${item}`;
    }

    private onChange() {
        set(this.row, this.column.field, this.items);
        this.gridApi.updateRowData({update: [this.row]});
        if (this.column['_onChange']) {
            this.column['_onChange'](this.row, this.items);
        }
    }

    onItemClick(item) {
        const fileID = typeof item === 'object' ? item.ID : item;
        if (this.options.previewHandler && fileID > 0) {
            this.options.previewHandler(fileID);
        }
    }

    onFileAdded(event) {
        const source = event.srcElement || event.target;
        const file = source.files && source.files[0];
        if (file) {
            this.busy = true;
            this.uniFilesService.upload(file).pipe(
                switchMap((res: any) => this.fileService.Get(res.ExternalId))
            ).subscribe(
                res => {
                    this.items.push(res);
                    this.onChange();
                    this.cdr.markForCheck();
                    this.busy = false;
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    }

    deleteFile(index: number) {
        const item = this.items[index];
        const fileID = typeof item === 'object' ? item.ID : item;

        // Don't remove inbox files, just splice them from the list
        const delete$ = fileID && !item['_inboxFile'] ? this.fileService.Remove(fileID) : of(true);
        this.busy = true;
        delete$.subscribe(
            () => {
                this.items.splice(index, 1);
                this.onChange();
                this.busy = false;
                this.cdr.markForCheck();
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
                this.cdr.markForCheck();
            }
        );
    }

    addFromInbox() {
        this.options.addFromInboxHandler().subscribe(file => {
            if (file && file.ID) {
                // Some view might be dependant on this field.
                // Don't change it without doing a global search and fixing those views.
                file['_inboxFile'] = true;
                this.items.push(file);
                this.onChange();
            }
        });
    }
}
