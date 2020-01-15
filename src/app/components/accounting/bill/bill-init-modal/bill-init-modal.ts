import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, UniFilesService, SupplierInvoiceService} from '@app/services/services';
import {finalize, take} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'bill-init-modal',
    templateUrl: './bill-init-modal.html',
    styleUrls: ['./bill-init-modal.sass']
})
export class BillInitModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    entityLabel = environment.isSrEnvironment ? 'regning' : 'leverandørfaktura';
    busy: boolean;
    inboxFiles;

    constructor(
        private errorService: ErrorService,
        private supplierInvoiceService: SupplierInvoiceService,
        private uniFilesService: UniFilesService,
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
}
