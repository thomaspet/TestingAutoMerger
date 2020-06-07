import {Component, ViewChild} from '@angular/core';
import {SupplierInvoiceStore} from '../../supplier-invoice-store';
import {SupplierInvoice} from '@uni-entities';
import {Subject} from 'rxjs';
import {takeUntil, switchMap} from 'rxjs/operators';
import {UniModalService, FileFromInboxModal} from '@uni-framework/uni-modal';
import {UniImage} from '@uni-framework/uniImage/uniImage';
import {FileService} from '@app/services/services';

@Component({
    selector: 'supplier-invoice-attachments',
    templateUrl: './supplier-invoice-attachments.html',
    styleUrls: ['./supplier-invoice-attachments.sass']
})
export class Attachments {
    @ViewChild(UniImage) uniImage: UniImage;

    startupFileID: number;
    fileIDs: number[];
    invoice: SupplierInvoice;

    onDestroy$ = new Subject();

    constructor(
        public store: SupplierInvoiceStore,
        private modalService: UniModalService,
        private fileService: FileService,
    ) {
        this.store.invoice$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(invoice => this.invoice = invoice);


        this.store.startupFileID$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(fileID => {
            // Reset list of fileIDs when new startupfileid comes
            this.fileIDs = [];
            this.startupFileID = fileID;
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    openFileFromInboxModal() {
        this.modalService.open(FileFromInboxModal).onClose.subscribe(file => {
            if (file) {
                if (this.fileIDs?.length) {
                    this.uniImage.fetchDocumentWithID(file.ID);
                } else {
                    this.startupFileID = file.ID;
                }
            }
        });
    }

    onFileListReady(files) {
        this.fileIDs = files.map(file => file.ID);
        this.store.fileIDs$.next(this.fileIDs);

        // TODO: add emit to uniimage to avoid this
        setTimeout(() => {
            const currentFile = this.uniImage?.currentFile;
            if (currentFile) {
                this.store.setSelectedFileID(currentFile.ID);
            }
        });
    }

    onImageDeleted(file) {
        this.fileIDs = this.fileIDs.filter(fileID => fileID !== file.ID);
        this.store.fileIDs$.next(this.fileIDs);
    }

    onImageUnlinked(file) {
        this.fileService.getStatistics(
            `model=filetag&select=id,tagname as tagname&top=1&orderby=ID asc&filter=deleted eq 0 and fileid eq ${file.ID}`
        ).pipe(
            switchMap(tags => {
                const tag = tags && tags.Data && tags.Data[0];
                return this.fileService.tag(file.ID, tag?.tagname || 'Upload', 0);
            })
        ).subscribe(
            () => {},
            err => console.error(err)
        );
    }

    useOCRValue(event) {}

}
