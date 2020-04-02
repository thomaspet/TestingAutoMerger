import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, UniFilesService, SupplierInvoiceService} from '@app/services/services';
import {finalize, take} from 'rxjs/operators';
import {FileExtended} from '@uni-framework/uniImage/uniImage';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '@app/authService';

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

    constructor(
        private errorService: ErrorService,
        private supplierInvoiceService: SupplierInvoiceService,
        private uniFilesService: UniFilesService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.busy = true;

        const inboxUrl = 'filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense/0?action=get-supplierInvoice-inbox';
        this.supplierInvoiceService.fetch(inboxUrl).pipe(
            finalize(() => this.busy = false)
        ).subscribe(
            res => this.inboxFiles = res,
            err => this.errorService.handle(err)
        );
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

    preview(file: FileExtended) {
        this.imgUrl = this.generateImageUrl(file, 1000);
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
}
