import {
    Component,
    Input,
    Output,
    SimpleChanges,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../app/unientities';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../core/authService';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../app/AppConfig';
import {ErrorService} from '../../app/services/services';
import {UniConfirmModal, ConfirmActions} from '../modals/confirm';

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
            <picture #imageContainer *ngIf="imgUrl.length" [ngClass]="{'loading': imageIsLoading}">
                <source [attr.srcset]="imageUrl2x" media="(-webkit-min-device-pixel-radio: 2), (min-resolution: 192dpi)">
                <img [attr.src]="imgUrl" alt="" (load)="finishedLoadingImage()" *ngIf="currentFileIndex >= 0">
            </picture>
            <section *ngIf="!singleImage || files[currentFileIndex]?.Pages?.length" class="uni-image-pager">
                <a class="prev" (click)="previous()"></a>
                <label>{{fileInfo}}</label>
                <a class="trash" (click)="deleteImage()" *ngIf="!readonly"></a>
                <a class="next" (click)="next()"></a>
            </section>

            <ul class="uni-thumbnail-list">
                <li *ngFor="let thumbnail of thumbnails; let idx = index">
                    <img [attr.src]="thumbnail"
                        [attr.alt]="shorten(files[idx]?.Description, 20)"
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
        <uni-confirm-modal></uni-confirm-modal>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniImage {
    @ViewChild(UniConfirmModal)
    private confirmModal: UniConfirmModal;

    @Input()
    public entity: string;

    @Input()
    public entityID: number;

    @Input()
    public uploadWithoutEntity: boolean = false;

    @Input()
    public size: UniImageSize;

    @Input()
    public readonly: boolean;

    @Input()
    public singleImage: boolean;

    @Input()
    public uploadConfig: IUploadConfig;

    @Input()
    public showFileID: number;

    @Input()
    public fileIDs: number[] = [];

    @Output()
    public fileListReady: EventEmitter<File[]> = new EventEmitter<File[]>();

    @Output()
    public imageLoaded: EventEmitter<File> = new EventEmitter<File>();

    @Output()
    public imageDeleted: EventEmitter<File> = new EventEmitter<File>();

    public imageIsLoading: boolean = true;

    private baseUrl: string = AppConfig.BASE_URL_FILES;

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

    constructor(
        private ngHttp: Http,
        private http: UniHttp,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef,
        authService: AuthService,
    ) {
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
            this.refreshFiles();
        } else if (changes['fileIDs']) {
            this.refreshFiles();
        } else if (changes['showFileID'] && this.files && this.files.length) {
            this.currentFileIndex = this.getChosenFileIndex();
            this.loadImage();
            if (!this.singleImage) {
                this.loadThumbnails();
            }
        }
    }

    public refreshFiles() {
        if (this.fileIDs && this.fileIDs.length > 0) {
            let requestFilter = 'ID eq ' + this.fileIDs.join(' or ID eq ');

            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files?filter=${requestFilter}`)
                .send()
                .subscribe((res) => {
                    this.files = res.json();
                    this.fileListReady.emit(this.files);
                    if (this.files.length) {
                        this.currentPage = 1;
                        this.currentFileIndex = this.showFileID ? this.getChosenFileIndex() : 0;
                        this.loadImage();
                        if (!this.singleImage) {
                            this.loadThumbnails();
                        }
                    }
                }, err => this.errorService.handle(err));
        } else if (this.entity && this.entityID) {
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files/${this.entity}/${this.entityID}`)
                .send()
                .subscribe((res) => {
                    this.files = res.json();
                    this.fileListReady.emit(this.files);
                    if (this.files.length) {
                        this.currentPage = 1;
                        this.currentFileIndex = this.showFileID ? this.getChosenFileIndex() : 0;
                        this.loadImage();
                        if (!this.singleImage) {
                            this.loadThumbnails();
                        }
                    }
                }, err => this.errorService.handle(err));
        } else {
             this.files = [];
        }
    }

    public finishedLoadingImage() {
        this.imageIsLoading = false;
        if (this.files && this.currentFileIndex) {
            this.imageLoaded.emit(this.files[this.currentFileIndex]);
        }
    }

    private getChosenFileIndex() {
        const chosenFileIndex = this.files.findIndex(file => file.ID === this.showFileID);
        if (chosenFileIndex > 0) {
            return chosenFileIndex;
        } else {
            return 0;
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

    private deleteImage() {
        this.confirmModal.confirm(
                'Virkelig slette valgt fil?',
                'Slette?')
            .then(confirmDialogResponse => {
                if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                    let oldFileID = this.files[this.currentFileIndex].ID;
                    this.http.asDELETE()
                        .usingBusinessDomain()
                        .withEndPoint(`files/${this.entity}/${this.entityID}/${oldFileID}`)
                        .send()
                        .subscribe((res) => {
                            let current = this.files[this.currentFileIndex];
                            let fileIDsIndex = this.fileIDs.indexOf(current.ID);

                            this.files.splice(this.currentFileIndex, 1);
                            if (fileIDsIndex !== -1) { this.fileIDs.splice(fileIDsIndex, 1); }
                            this.currentFileIndex--;
                            if (this.currentFileIndex < 0 && this.files.length > 0) { this.currentFileIndex = 0; }

                            if (this.currentFileIndex >= 0) { this.loadImage(); }
                            if (!this.singleImage) { this.loadThumbnails(); }

                            this.imageDeleted.emit(current);
                        }, err => this.errorService.handle(err))
                    }
            });
    }

    private loadThumbnails() {
        this.thumbnails = this.files.map(file => this.generateImageUrl(file, 100));
        this.cdr.markForCheck();
    }

    private loadImage() {
        const file = this.files[this.currentFileIndex];
        this.fileInfo = file.Name;
        if (file.Pages > 1) {
            this.fileInfo += ` (${this.currentPage}/${file.Pages})`;
        }

        let size = this.size || UniImageSize.medium;

        this.imageIsLoading = true;

        this.imgUrl2x = this.generateImageUrl(file, size * 2);
        this.imgUrl = this.generateImageUrl(file, size);
        this.cdr.markForCheck();
    }

    private generateImageUrl(file: File, width: number): string {
        let url = `${this.baseUrl}/image/?key=${this.activeCompany.Key}&token=${this.token}&id=${file.ID}&width=${width}&page=${this.currentPage}`;
        return encodeURI(url);
    }

    public shorten(str: string, length: number): string {
        if (str && str.length > length) {
            return str.substr(0, length - 3) + '...';
        } else {
            return str;
        }
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;

        if (!this.uploadWithoutEntity && (!this.entity || !this.isDefined(this.entityID))) {
            throw new Error(`Tried to upload a picture with either entity (${this.entity})`
                 + ` or entityID (${this.entityID}) being null, and uploadWithoutEntity being false`);
        }

        if (source.files && source.files.length) {
            this.uploading = true;
            const newFile = source.files[0];
            source.value = '';

            if (this.singleImage && this.files.length && !this.uploadWithoutEntity) {
                const oldFileID = this.files[0].ID;
                this.http.asDELETE()
                    .usingBusinessDomain()
                    .withEndPoint(`files/${this.entity}/${this.entityID}/${oldFileID}`)
                    .send()
                    .subscribe((res) => {
                        this.uploadFile(newFile);
                    }, err => this.errorService.handle(err));
            } else {
                this.uploadFile(newFile);
            }
        }
    }

    private uploadFile(file) {
        let data = new FormData();
        data.append('Token', this.token);
        data.append('CompanyKey', this.activeCompany.Key);
        if (this.entity) {
            data.append('EntityType', this.entity);
        }
        if (this.entityID) {
            data.append('EntityID', this.entityID);
        }
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                this.uploading = false;
                this.files.push(res);
                this.fileListReady.emit(this.files);
                this.currentFileIndex = this.files.length - 1;
                this.loadImage();
                if (!this.singleImage) {
                    this.loadThumbnails();
                }
            }, err => this.errorService.handle(err));
    }
}
