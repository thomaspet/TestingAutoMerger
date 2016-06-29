import {Component, Input} from '@angular/core';
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
}

@Component({
    selector: 'uni-image',
    template: `
        <section *ngIf="pageCount > 1">
            <button class="c2a" [disabled]="imageId === 0" (click)="prev()">prev</button>
            <button class="c2a" (click)="next()">next</button>
        </section>

        <picture *ngIf="imgUrl.length">
            <source [attr.srcset]="imgUrl2x" media="(-webkit-min-device-pixel-radio: 2), (min-resolution: 192dpi)">
            <img [attr.src]="imgUrl" alt="">
        </picture>

        <section *ngIf="uploadConfig">
            <label [ngClass]="{'has-image': imgUrl.length}">
                <a>{{file?.name || 'Klikk her for å velge bilde'}}</a>
                <input type="file" (change)="uploadFileChange($event)">
                <button (click)="uploadFile()" [attr.aria-busy]="uploading" [disabled]="!file || uploading">Last opp</button>
            </label>
            
        </section>
    `,
    providers: [ImageUploader]
})
export class UniImage {
    @Input() 
    private imageId: number;
    
    @Input()
    private size: UniImageSize;

    @Input()
    private uploadConfig: IUploadConfig;

    private uploading: boolean = false;

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
        const token = 'Bearer ' + this.authService.getToken();
        const companyKey = this.authService.getActiveCompany()['Key'];

        // Get data about the file (pageCount etc)
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('files/' + this.imageId)
            .send()
            .subscribe((response) => {
                this.pageCount = response['PageCount'] || 1;
            });
        
        // Generate image urls
        this.imgUrl = this.buildImgUrl(token, companyKey, (this.size || undefined));
        this.imgUrl2x = this.buildImgUrl(token, companyKey, (this.size ? (this.size * 2) : undefined));
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
        const files = event.srcElement.files;
        if (files && files.length) {
            this.file = files[0];
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
    }

}
