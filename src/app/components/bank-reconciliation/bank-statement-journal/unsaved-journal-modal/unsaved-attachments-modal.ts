import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {DebitCreditEntry, FileService} from '@app/services/services';
import {File} from '@uni-entities';

@Component({
    templateUrl: './unsaved-attachments-modal.html',
    styleUrls: ['./unsaved-attachments-modal.sass']
})
export class UnsavedAttachmentsModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter<boolean>();

    busy: boolean;
    sendFilesToInbox = false;
    uploadedFiles: File[];

    constructor(
        private fileService: FileService
    ) {}

    ngOnInit() {
        const items: DebitCreditEntry[] = this.options.data || [];
        const uploadedFiles = [];
        items.forEach(item => {
            const files = (item.files || []).filter(file => !file['_inboxFile']);
            uploadedFiles.push(...files);
        });

        this.uploadedFiles = uploadedFiles;
    }

    onSendToInboxChange() {
        this.sendFilesToInbox = this.uploadedFiles.some(file => file['_sendToInbox']);
    }

    discardUploadedFiles() {
        this.uploadedFiles.forEach(file => {
            this.fileService.delete(file.ID).subscribe(() => {}, () => {});
        });

        this.onClose.emit(true);
    }

    sendUploadedFilesToInbox() {
        this.uploadedFiles.forEach(file => {
            if (file['_sendToInbox']) {
                this.fileService.tag(file.ID, 'Upload').subscribe(() => {}, () => {});
            } else {
                this.fileService.delete(file.ID).subscribe(() => {}, () => {});
            }
        });

        this.onClose.emit(true);
    }
}
