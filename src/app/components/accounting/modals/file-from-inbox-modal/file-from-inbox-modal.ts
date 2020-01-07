import { Component, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { SupplierInvoiceService, ErrorService } from '@app/services/services';
import { UniTableColumn, UniTableConfig } from '@uni-framework/ui/unitable';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { File } from '@uni-entities';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'file-from-inbox-modal',
    templateUrl: './file-from-inbox-modal.html',
    styleUrls: ['./file-from-inbox-modal.sass'],
})
export class FileFromInboxModal implements IUniModal {
    @ViewChild(AgGridWrapper, { static: false }) table: AgGridWrapper;

    options: IModalOptions = {};
    onClose: EventEmitter<File> = new EventEmitter();

    tableConfig: UniTableConfig;
    files: File[];
    selectedFile: File;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorService: ErrorService
    ) {}

    ngOnInit() {
        this.tableConfig = this.getTableConfig();

        const url = 'filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense/0?action=get-supplierInvoice-inbox';
        this.supplierInvoiceService.fetch(url).subscribe(
            files => this.files = files || [],
            err => this.errorService.handle(err)
        );
    }

    onFileSelected(file: File) {
        this.selectedFile = file;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event) {
        const key = event.which || event.keyCode;
        if (key === UP_ARROW && this.table) {
            this.table.selectPrevious();
        } else if (key === DOWN_ARROW && this.table) {
            this.table.selectNext();
        } else if (key === ENTER) {
            setTimeout(() => {
                this.onClose.emit(this.selectedFile);
            });
        }
    }

    private getTableConfig() {
        return new UniTableConfig('accounting.file_from_inbox_table', false, true)
            .setAutofocus(true)
            .setSearchable(false)
            .setPageSize(15)
            .setColumns([
                new UniTableColumn('ID', 'Nr.').setWidth('3rem'),
                new UniTableColumn('Name', 'Filnavn'),
                new UniTableColumn('Description', 'Tekst'),
                new UniTableColumn('Source', 'Kilde')
                    .setWidth('5rem')
                    .setTemplate(file => this.getFileSource(file))
            ]);
    }

    private getFileSource(file: File): string {
        try {
            switch (file.FileTags[0].TagName) {
                case 'IncomingMail': return 'Epost';
                case 'IncomingEHF': return 'EHF';
                case 'IncomingTravel': return 'Reise';
                case 'IncomingExpense': return 'Utlegg';
            }
        } catch (e) {
            return '';
        }
    }
}
