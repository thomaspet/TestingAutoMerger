import {Component, Input, ViewChild, ElementRef} from '@angular/core';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../core/authService';
import {ImageUploader} from './imageUploader';

export enum UniImageSize {
    small = 150,
    medium = 700,
    large = 1200
}

export interface IUploadConfig {
    entityType: string;
    entityId: number;
    onSuccess: (imageId: number) => void;
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-image',
    template: `
        <section *ngIf="pageCount > 1">
            <button class="c2a" [disabled]="imageId === 0" (click)="prev()">prev</button>
            <button class="c2a" (click)="next()">next</button>
        </section>

        <picture #imageContainer *ngIf="imgUrl.length" [attr.aria-busy]="loadingImage">
            <source [attr.srcset]="imgUrl2x" media="(-webkit-min-device-pixel-radio: 2), (min-resolution: 192dpi)">
            <img [attr.src]="imgUrl" alt="">
        </picture>
        <section *ngIf="uploadConfig && !uploadConfig.isDisabled">
            <label [ngClass]="{'has-image': imgUrl.length}">
                <a>{{file?.name || 'Klikk her for å velge bilde'}}</a>
                <input type="file" (change)="uploadFileChange($event)">
                <button (click)="uploadFile()" [attr.aria-busy]="uploading" [disabled]="!file || uploading">Last opp</button>
            </label>
        </section>
        <p *ngIf="uploadConfig && uploadConfig.isDisabled">{{uploadConfig.disableMessage}}</p>
    `,
    providers: [ImageUploader]
})
export class UniImage {
    @ViewChild('imageContainer')
    private imageContainer: ElementRef;

    @Input()
    private imageId: number;

    @Input()
    private size: UniImageSize;

    @Input()
    private uploadConfig: IUploadConfig;

    private uploading: boolean = false;
    private loadingImage: boolean = false;

    private pageCount: number = 1;
    private currentPage: number = 1;

    private imgUrl: string = '';
    private imgUrl2x: string = '';

    private file: File;

    constructor(private authService: AuthService, private http: UniHttp, private imageUploader: ImageUploader) {}

    public ngOnChanges() {
        if (this.imageId) {
            this.updateImage();
        }
    }

    public ngAfterViewInit() {
        this.authService.authenticationStatus$.subscribe((isAuthenticated) => {
            if (isAuthenticated) {
                this.updateImage();
            } else {
                this.imgUrl = '';
                this.imgUrl2x = '';
            }
        });
    }

    private buildImgUrl(token: string, companyKey: string, width: number): string {
        let url = `https://uniimages.azurewebsites.net/?id=${this.imageId}&page=${this.currentPage}&key=${companyKey}&token=${token}`;
        if (width) {
            url += '&width=' + width;
        }

        return encodeURI(url);
    }

    private updateImage() {
        this.loadingImage = true;
        const token = 'Bearer ' + this.authService.getToken();
        const companyKey = this.authService.getActiveCompany()['Key'];

        // Get data about the file (pageCount etc)
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('files/' + this.imageId)
            .send()
            .map(response => response.json())
            .subscribe((response) => {
                this.pageCount = response['PageCount'] || 1;
            });

        // Generate image urls
        this.imgUrl = this.buildImgUrl(token, companyKey, (this.size || undefined));
        this.imgUrl2x = this.buildImgUrl(token, companyKey, (this.size ? (this.size * 2) : undefined));

        setTimeout(() => {
            let img = this.imageContainer.nativeElement.querySelector('img');
            if (img.complete) {
                this.loadingImage = false;
            } else {
                img.addEventListener('load', () => {
                    this.loadingImage = false;
                });
                img.addEventListener('error', () => {
                    this.loadingImage = false;
                });
            }
        });
    }

    private next() {
        this.currentPage++;
        this.updateImage();
    }

    private prev() {
        this.currentPage--;
        this.updateImage();
    }


    private uploadFileChange(event) {
        const source = event.srcElement || event.target;
        if (source.files && source.files.length) {
            this.file = source.files[0];
        }
    }

    private uploadFile() {
        this.uploading = true;

        this.imageUploader.uploadImage(this.uploadConfig.entityType, this.uploadConfig.entityId, this.file)
        .then(() => {
            const slot = this.imageUploader.Slot;
            this.uploadConfig.onSuccess(slot.ID);
            this.uploading = false;
        });

        this.file = undefined;
    }

}
