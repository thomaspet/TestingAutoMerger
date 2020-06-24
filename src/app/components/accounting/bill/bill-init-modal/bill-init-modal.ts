import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, UniFilesService, SupplierInvoiceService} from '@app/services/services';
import {finalize, take} from 'rxjs/operators';
import {FileExtended} from '@uni-framework/uniImage/uniImage';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '@app/authService';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { UniTableColumn } from '@uni-framework/ui/unitable/config/unitableColumn';
import { File } from '@uni-entities';

@Component({
    selector: 'bill-init-modal',
    templateUrl: './bill-init-modal.html',
    styleUrls: ['./bill-init-modal.sass']
})
export class BillInitModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean;
    inboxFiles;
    imgUrl: string;
    selectedFile: FileExtended;
    loadingFiles: boolean;

    tableConfig: UniTableConfig;

    constructor(
        private errorService: ErrorService,
        private supplierInvoiceService: SupplierInvoiceService,
        private uniFilesService: UniFilesService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.busy = true;

        this.tableConfig = this.getTableConfig();

        const inboxUrl = 'filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense|Upload/0?action=get-supplierInvoice-inbox';
        this.supplierInvoiceService.fetch(inboxUrl).pipe(
            finalize(() => this.busy = false)
        ).subscribe(
            res => this.inboxFiles = res,
            err => this.errorService.handle(err)
        );
    }


    onFileListReady(files: FileExtended[]) {
        if (files) {
            this.loadingFiles = false;
        }
    }

    uploadFile(event) {
        const source = event.srcElement || event.target;
        if (!source.files || !source.files[0]) {
            return;
        }

        this.busy = true;
        this.uniFilesService.upload(source.files[0], 'SupplierInvoice').pipe(
            take(1),
            finalize(() => this.busy = false)
        ).subscribe(
            res => this.onClose.emit(res.ExternalId),
            err => this.errorService.handle(err)
        );
    }

    preview(file: File) {
        if (!this.selectedFile || this.selectedFile.ID !== file.ID) {
            this.imgUrl = this.generateImageUrl(file, 1000);
            this.loadingFiles = true;
            this.selectedFile = file;
        }
    }

    private generateImageUrl(file: FileExtended, width: number): string {
        const baseUrl: string = environment.BASE_URL_FILES;
        const cacheBuster = performance.now();
        console.log({file});
        const url = `${baseUrl}/api/image`
            + `?key=${this.authService.activeCompany.Key}`
            + `&id=${file.StorageReference}`
            + `&width=${width}`
            + `&page=1`
            + `&t=${cacheBuster}`;

        return encodeURI(url);
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
