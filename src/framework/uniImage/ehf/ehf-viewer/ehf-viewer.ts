import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FileExtended} from '../../uniImage';
import {DomSanitizer} from '@angular/platform-browser';
import printJS from 'print-js';

@Component({
    selector: 'ehf-viewer',
    templateUrl: './ehf-viewer.html',
    styleUrls: ['./ehf-viewer.sass']
})
export class EHFViewer {
    @Input() file: FileExtended;
    @Output() popout = new EventEmitter();

    attachmentData: any;

    constructor(private domSanitizer: DomSanitizer) {}

    showAttachment(attachment) {
        this.attachmentData = undefined;
        setTimeout(() => {
            this.attachmentData = {
                mimeType: attachment.mimeType,
                url: this.domSanitizer.bypassSecurityTrustResourceUrl(attachment.resourceUrl),
                printUrl: attachment.resourceUrl
            };
        });
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
