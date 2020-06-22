import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {saveAs} from 'file-saver';
import * as printJS from 'print-js';

import {FileExtended} from '../../uniImage';
import {FileService, UniFilesService} from '@app/services/services';
import { catchError, map } from 'rxjs/operators';
import {of as observableOf, Observable} from 'rxjs';
import { EHFData, EHFAttachment } from '../ehf-model';
import { parseEHFData } from '../ehf-data-parser';

@Component({
    selector: 'ehf-viewer',
    templateUrl: './ehf-viewer.html',
    styleUrls: ['./ehf-viewer.sass']
})
export class EHFViewer {
    @Input() file: FileExtended;
    @Output() popout = new EventEmitter();

    attachmentData: any;

    busy: boolean;

    constructor(
        private domSanitizer: DomSanitizer,
        private fileService: FileService,
        private uniFilesService: UniFilesService,
        private cdr: ChangeDetectorRef
    ) {}

    reloadFileWithAttachments(): Observable<EHFData> {
        return this.uniFilesService.getEhfData(this.file.StorageReference, true).pipe(
            catchError(err => {
                console.error('Error loading EHF data', err);
                return observableOf(null);
            }),
            map(ehfData => {
                if (ehfData) {
                    const parsed = parseEHFData(ehfData);
                    if (parsed) {
                        return parsed;
                    }
                }
            })
        );
    }

    showAttachment(attachment: EHFAttachment) {
        this.busy = true;
        this.attachmentData = undefined;

        if (!attachment.resourceUrl) {
            this.reloadFileWithAttachments().subscribe((ehfdata: EHFData) => {
                this.file._ehfAttachments = ehfdata.attachments;
                this.file._ehfAttachments.forEach((loadedAttatchment) => {
                    if (loadedAttatchment.id === attachment.id) {
                        setTimeout(() => {
                            this.attachmentData = {
                                mimeType: loadedAttatchment.mimeType,
                                url: this.domSanitizer.bypassSecurityTrustResourceUrl(loadedAttatchment.resourceUrl),
                                printUrl: loadedAttatchment.resourceUrl
                            };
                            this.busy = false;
                            this.cdr.markForCheck();
                        });
                    }
                });
            });
        } else {
            setTimeout(() => {
                this.attachmentData = {
                    mimeType: attachment.mimeType,
                    url: this.domSanitizer.bypassSecurityTrustResourceUrl(attachment.resourceUrl),
                    printUrl: attachment.resourceUrl
                };
                this.busy = false;
                this.cdr.markForCheck();
            });
        }
    }

    print() {
        if (this.attachmentData && this.attachmentData.url) {
            const type = (this.attachmentData.mimeType || '').includes('image')
                ? 'image' : 'pdf';

            printJS({
                printable: this.attachmentData.printUrl,
                type: type
            });
        } else {
            this.printEHF();
        }
    }

    downloadSource() {
        this.fileService
            .downloadXml(this.file.ID)
            .subscribe((blob) => {
                saveAs(blob, this.file.Name + '.xml');
            });
    }

    private printEHF() {
        const baseUrl = window.location.href.split('/#/')[0];
        const printFrame = document.createElement('iframe');

        printFrame.id = 'ehf-print-frame';
        printFrame.width = '0';
        printFrame.height = '0';
        printFrame.src = baseUrl + '/ehf-print.html';

        printFrame.onload = () => {
            const container = printFrame.contentDocument.getElementById('container');
            if (container) {
                container.innerHTML = this.file._ehfMarkup;
                setTimeout(() => {
                    printFrame.contentWindow.print();
                    printFrame.parentElement.removeChild(printFrame);
                }, 100);
            }
        };

        document.body.appendChild(printFrame);
    }

    getFileType(attachment) {
        return (attachment.mimeType || '').split('/')[1];
    }

    isImage(attachment) {
        return (attachment.mimeType || '').includes('image');
    }

    getTrustedUrl(url: string) {
        return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
