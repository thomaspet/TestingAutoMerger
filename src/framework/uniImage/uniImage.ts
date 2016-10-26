import {Component, Input, SimpleChanges} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../app/unientities';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../core/authService';
import {ImageUploader} from './imageUploader';
import {Observable} from 'rxjs/Observable';

export enum UniImageSize {
    small = 150,
    medium = 700,
    large = 1200
}

export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-image',
    template: `
        <article (click)="onClick()" (clickOutside)="offClick()">
            <picture #imageContainer *ngIf="imgUrl.length">
                <source [attr.srcset]="imageUrl2x" media="(-webkit-min-device-pixel-radio: 2), (min-resolution: 192dpi)">
                <img [attr.src]="imgUrl" alt="">
            </picture>
            <section *ngIf="!singleImage || files[currentFileIndex]?.Pages?.length" class="uni-image-pager">
                <a class="prev" (click)="previous()"></a>
                <label>{{fileInfo}}</label>
                <a class="next" (click)="next()"></a>
            </section>

            <ul class="uni-thumbnail-list">
                <li *ngFor="let thumbnail of thumbnails; let idx = index">
                    <img [attr.src]="thumbnail"
                        [attr.alt]="files[idx]?.Description"
                        (click)="thumbnailClicked(idx)">
                </li>
                <li *ngIf="!readonly && !uploadConfig?.isDisabled" [attr.aria-busy]="uploading">
                    <label class="uni-image-upload"
                           [attr.aria-disabled]="uploadConfig?.isDisabled || uploading">
                        <input type="file"
                            (change)="uploadFileChange($event)"
                            [attr.aria-disabled]="uploadConfig?.isDisabled"
                            [disabled]="uploadConfig?.isDisabled">
                    </label>
                </li>
            </ul>
        </article>
    `,
})
export class UniImage {
    @Input()
    public entity: string;

    @Input()
    public entityID: number;

    @Input()
    public size: UniImageSize;

    @Input()
    public readonly: boolean;

    @Input()
    public singleImage: boolean;

    @Input()
    public uploadConfig: IUploadConfig;

    private baseUrl: string = 'https://unifiles.azurewebsites.net/';

    private token: any;
    private activeCompany: any;

    private uploading: boolean;
    private keyListener: any;

    private files: File[] = [];
    private thumbnails: string[] = [];

    private currentFileIndex: number;
    private currentPage: number = 1;
    private fileInfo: string;

    private imgUrl: string = '';
    private imgUrl2x: string = '';

    constructor(private ngHttp: Http, private http: UniHttp, private imageUploader: ImageUploader, authService: AuthService) {
        // Subscribe to authentication/activeCompany changes
        authService.authentication$.subscribe((authDetails) => {
            this.token = authDetails.token;
            this.activeCompany = authDetails.activeCompany;
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.imgUrl = this.imgUrl2x = '';
        this.thumbnails = [];

        if ((changes['entity'] || changes['entityID']) && this.entity && this.isDefined(this.entityID)) {
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files/${this.entity}/${this.entityID}`)
                .send()
                .subscribe((res) => {
                    this.files = res.json();
                    if (this.files.length) {
                        this.currentFileIndex = 0;
                        this.currentPage = 1;
                        this.loadImage();

                        if (!this.singleImage) {
                            this.loadThumbnails();
                        }
                    }
                });
        }
    }

    private isDefined(value: any) {
        return (value !== undefined && value !== null);
    }

    public onClick() {
        if (!this.keyListener || this.keyListener.closed) {
            this.keyListener = Observable.fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
                const key = event.which || event.keyCode;
                if (key === 37) {
                    this.previous();
                } else if (key === 39) {
                    this.next();
                }
            });
        }
    }

    public offClick() {
        if (this.keyListener && !this.keyListener.closed) {
            this.keyListener.unsubscribe();
        }
    }

    private thumbnailClicked(index) {
        this.currentFileIndex = index;
        this.loadImage();
    }

    private next() {
        if (this.files[this.currentFileIndex].Pages >= this.currentPage + 1) {
            this.currentPage++;
            this.loadImage();
        } else if (this.currentFileIndex < this.files.length - 1) {
            this.currentFileIndex++;
            this.currentPage = 1;
            this.loadImage();
        }
    }

    private previous() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadImage();
        } else if (this.currentFileIndex > 0) {
            this.currentFileIndex--;
            this.currentPage = 1;
            this.loadImage();
        }
    }

    private loadThumbnails() {
        this.thumbnails = this.files.map(file => this.generateImageUrl(file, 100));
    }

    private loadImage() {
        const file = this.files[this.currentFileIndex];
        this.fileInfo = file.Name;
        if (file.Pages > 1) {
            this.fileInfo += ` (${this.currentPage}/${file.Pages})`;
        }

        let size = this.size || UniImageSize.medium;
        this.imgUrl2x = this.generateImageUrl(file, size * 2);
        this.imgUrl = this.generateImageUrl(file, size);
    }

    private generateImageUrl(file: File, width: number): string {
        let url = `${this.baseUrl}/image/?key=${this.activeCompany.Key}&id=${file.ID}&width=${width}&page=${this.currentPage}`;
        return encodeURI(url);
    }

    private uploadFileChange(event) {
        const source = event.srcElement || event.target;

        if (!this.entity || !this.isDefined(this.entityID)) {
            throw new Error(`Tried to upload a picture with either entity (${this.entity})`
                 + `or entityID (${this.entityID}) being null`);
        }

        if (source.files && source.files.length) {
            this.uploading = true;
            const newFile = source.files[0];
            source.value = '';

            if (this.singleImage && this.files.length) {
                const oldFileID = this.files[0].ID;
                this.http.asDELETE()
                    .usingBusinessDomain()
                    .withEndPoint(`files/${this.entity}/${this.entityID}/${oldFileID}`)
                    .send()
                    .subscribe((res) => {
                        this.uploadFile(newFile);
                    });
            } else {
                this.uploadFile(newFile);
            }
        }
    }

    public uploadFile(file) {
        let data = new FormData();
        data.append('Token', this.token);
        data.append('CompanyKey', this.activeCompany.Key);
        data.append('EntityType', this.entity);
        data.append('EntityID', this.entityID);
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                this.uploading = false;
                this.files.push(res);
                this.currentFileIndex = this.files.length - 1;
                this.loadImage();
                if (!this.singleImage) {
                    this.loadThumbnails();
                }
            });
    }
}
