import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges, EventEmitter, Output} from '@angular/core';
import {SafeUrl, DomSanitizer} from '@angular/platform-browser';
import {FileService} from '@app/services/services';

@Component({
    selector: 'auth-img',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <img
            *ngIf="resourceUrl"
            [src]="resourceUrl"
            [alt]="alt"
            (load)="load.emit($event)"
        />
    `,
    styles: [
        ':host { display: block; }',
        'img { width: 100% }'
    ]
})
export class AuthImg {
    @Input() src: string;
    @Input() alt = '';
    @Output() load = new EventEmitter();

    resourceUrl: SafeUrl;

    constructor(
        private fileService: FileService,
        private domSanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['src'] && changes['src'].currentValue !== changes['src'].previousValue) {
            if (this.src) {
                this.loadImage();
            } else {
                this.resourceUrl = undefined;
            }
        }
    }

    loadImage() {
        this.fileService.getImageBlob(this.src).subscribe(
            (blob: Blob) => {
                try {
                    blob = blob.slice(0, blob.size, 'image/jpeg');

                    const url = URL.createObjectURL(blob);
                    this.resourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
                } catch (e) {
                    this.resourceUrl = undefined;
                }

                this.cdr.markForCheck();
            },
            err => {
                console.error(err);
                this.resourceUrl = undefined;
                this.cdr.markForCheck();
            }
        );
    }

}
