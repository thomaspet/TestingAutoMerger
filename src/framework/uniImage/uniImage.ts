import {
    Component,
    Input,
    Output,
    SimpleChanges,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef
} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../app/unientities';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../core/authService';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../app/AppConfig';
import {ErrorService, FileService, UniFilesService} from '../../app/services/services';
import {UniModalService, ConfirmActions} from '../uniModal/barrel';
import {UniPrintModal} from '../../app/components/reports/modals/print/printModal';

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
        <article class="uniImage" (click)="onClick()" (clickOutside)="offClick()">
            <picture
                #imageContainer
                *ngIf="imgUrl.length"
                [ngClass]="{'loading': imageIsLoading,'clickable': currentClicked}"
                (click)="onImageClick()">

                <source
                    [attr.srcset]="imageUrl2x"
                    media="(-webkit-min-device-pixel-radio: 2), (min-resolution: 192dpi)">

                <img
                    #image
                    [attr.src]="imgUrl"
                    alt=""
                    (error)="onLoadImageError($event)"
                    (load)="finishedLoadingImage()"
                    *ngIf="currentFileIndex >= 0">
            </picture>

            <section class="uni-image-pager">
                <a *ngIf="files.length > 1" class="prev" (click)="previous()"></a>
                <label>{{fileInfo}}</label>

                <a class="print" (click)="printOutPdf()"></a>

                <a class="trash" (click)="deleteImage()" *ngIf="!readonly"></a>
                <a *ngIf="files.length > 1" class="next" (click)="next()"></a>
            </section>

            <span id="span-area-highlighter" class="span-area-highlight-class" [ngStyle]="highlightStyle"></span>

            <ul class="uni-thumbnail-list" [ngClass]="{'-has-thumbnails': this.thumbnails.length > 0}">
                <li *ngFor="let thumbnail of thumbnails; let idx = index">
                    <img
                        [attr.src]="thumbnail"
                        [attr.alt]="shorten(files[idx]?.Description, 20)"
                        (click)="thumbnailClicked(idx)">
                </li>

                <li *ngIf="!readonly && !uploadConfig?.isDisabled" [attr.aria-busy]="uploading">

                    <label
                        class="uni-image-upload"
                        [attr.aria-disabled]="uploadConfig?.isDisabled || uploading"
                        (drop)="onDrop($event, dropData)">

                        <input
                            type="file"
                            (change)="uploadFileChange($event)"
                            [attr.aria-disabled]="uploadConfig?.isDisabled"
                            [disabled]="uploadConfig?.isDisabled">
                    </label>
                </li>
            </ul>
        </article>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniImage {
    @ViewChild('image')
    private image: ElementRef;

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
    public expandInNewTab: boolean;

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

    @Output()
    public imageClicked: EventEmitter<File> = new EventEmitter<File>();

    public imageIsLoading: boolean = true;

    private baseUrl: string = AppConfig.BASE_URL_FILES;

    private token: any;
    private activeCompany: any;
    private didTryReAuthenticate: boolean = false;

    private uploading: boolean;
    private keyListener: any;

    private files: File[] = [];
    private thumbnails: string[] = [];

    private currentFileIndex: number;
    private currentPage: number = 1;
    private fileInfo: string;

    private imgUrl: string = '';
    private imgUrl2x: string = '';
    private highlightStyle: any;
    private pdfUrl: string;

    constructor(
        private ngHttp: Http,
        private http: UniHttp,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef,
        private fileService: FileService,
        private modalService: UniModalService,
        private authService: AuthService,
        private uniFilesService: UniFilesService
    ) {
        // Subscribe to authentication/activeCompany changes
        this.authService.authentication$.subscribe((authDetails) => {
            this.token = authDetails.filesToken;
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
        // make sure we are clicking on another picture beforetrying to load an image
        if (this.currentFileIndex !== index) {
            this.currentFileIndex = index;
            this.loadImage();
        }
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

    private printOutPdf() {
        if (this.files[this.currentFileIndex].Name.includes('.pdf')) {
            return this.fileService.printFile(this.files[this.currentFileIndex].ID)
                .subscribe(res => {
                    let url = JSON.parse(res._body) + '&attachment=false';
                    this.modalService.open(UniPrintModal, {data: {url: url}})
                        .onClose.subscribe(
                            () => {},
                            err => this.errorService(err)
                    );
                });
        }
        return this.fileService.printFile(this.files[this.currentFileIndex].ID)
            .subscribe(res => {
                let url = JSON.parse(res._body) + '&attachment=false';
                this.printImage(url);
            },
                err => this.errorService(err)
            );
    }

    private imageToPrint(source: string) {
        return "<html><head><script>function step1(){\n" +
            "setTimeout('step2()', 10);}\n" +
            "function step2(){window.print();window.close()}\n" +
            "</scri" + "pt></head><body onload='step1()'>\n" +
            "<img src='" + source + "' /></body></html>";
    }

    private printImage(source: string) {
        var pwa = window.open('_new');
        pwa.document.open();
        pwa.document.write(this.imageToPrint(source));
        pwa.document.close();
    }

    private deleteImage() {
        this.modalService.confirm({
            header: 'Bekreft sletting',
            message: 'Vennligst bekreft sletting av fil',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                let oldFileID = this.files[this.currentFileIndex].ID;
                this.http.asDELETE()
                    .usingBusinessDomain()
                    .withEndPoint(`files/${oldFileID}`)
                    .send()
                    .subscribe(
                        res => {
                            let current = this.files[this.currentFileIndex];
                            let fileIDsIndex = this.fileIDs.indexOf(current.ID);

                            this.files.splice(this.currentFileIndex, 1);
                            if (fileIDsIndex !== -1) { this.fileIDs.splice(fileIDsIndex, 1); }
                            this.currentFileIndex--;
                            if (this.currentFileIndex < 0 && this.files.length > 0) { this.currentFileIndex = 0; }

                            if (this.currentFileIndex >= 0) { this.loadImage(); }
                            if (!this.singleImage) { this.loadThumbnails(); }

                            this.imageDeleted.emit(current);
                        },
                        err => this.errorService.handle(err)
                    );
            }
        });
    }

    public onLoadImageError(error) {
        this.reauthenticate(() => {
            setTimeout(() => {
                // run in setTimeout to allow authService to update the filestoken
                this.refreshFiles();
            });
        });
    }

    public reauthenticate(runAfterReauth) {
        if (!this.didTryReAuthenticate) {
            // set flag to avoid "authentication loop" if the new authentication
            // also throws an error
            this.didTryReAuthenticate = true;

            this.uniFilesService.checkAuthentication()
                .then(res => {
                    // authentication is ok - something else caused the problem
                }).catch(err => {
                    // authentication failed, try to reauthenticated
                    this.authService.authenticateUniFiles()
                        .then(res => {
                            if (runAfterReauth) {
                                runAfterReauth();
                            }
                        }).catch((errAuth) => {
                            this.errorService.handle(err);
                        });
                });
        }
    }

    public onImageClick() {
        const img: HTMLImageElement = this.image.nativeElement;
        if (this.expandInNewTab && img) {
            window.open(img.src);
        }

        this.imageClicked.emit(this.files[this.currentFileIndex]);
    }

    private loadThumbnails() {
        this.thumbnails = this.files.map(file => this.generateImageUrl(file, 100));
        this.cdr.markForCheck();
    }

    private loadImage() {
        const file = this.files[this.currentFileIndex];
        if (!file) {
            return;
        }

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
        let url = `${this.baseUrl}/api/image/?key=${this.activeCompany.Key}&token=${this.token}&id=${file.StorageReference}&width=${width}&page=${this.currentPage}`;
        return encodeURI(url);
    }

    public shorten(str: string, length: number): string {
        if (str && str.length > length) {
            return str.substr(0, length - 3) + '...';
        } else {
            return str;
        }
    }

    private onDrop(event, dropData) {
        let transfer = this.getTransfer(event);
        if (!transfer) {
            return;
        }

        for (let i = 0; i < transfer.files.length; i++) {
            this.uploadFile(transfer.files[i]);
        }
    }

    protected getTransfer(event: any): any {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
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
        data.append('Key', this.activeCompany.Key);
        if (this.entity) {
            data.append('EntityType', this.entity);
        }
        if (this.entityID) {
            data.append('EntityID', this.entityID.toString());
        }
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                // files are uploaded to unifiles, and will get an externalid that
                // references the file in UE - get the UE file and add that to the
                // collection
                this.fileService.Get(res.ExternalId)
                    .subscribe(newFile => {
                        this.uploading = false;
                        this.files.push(newFile);
                        this.fileListReady.emit(this.files);
                        this.currentFileIndex = this.files.length - 1;
                        this.loadImage();

                        if (!this.singleImage) {
                            this.loadThumbnails();
                        }
                    }, err => this.errorService.handle(err));
            }, err => {
                // if an error occurs, try to reauthenticate to unifiles - typically
                // this happens if unifiles is deployed while the user is logged in
                if (!this.didTryReAuthenticate) {
                    // run reauthentication and try to upload the file once more
                    // so the user doesnt have to
                    this.reauthenticate(() => {
                        this.uploadFile(file);
                    });
                } else {
                    this.errorService.handle(err);
                }
            });
    }

    // Coordinates param should contain positions top and left + height and width of highlight element
    // Height and width params is the sixe of the originally scanned document
    // styleObject is for custom style like size, color and shape on the highlight marker..
    public highlight(coordinates: number[], width: number, height: number, styleObject?: any) {

        if ((!coordinates || coordinates.length < 4) && !styleObject) {
            return;
        }

        // Find the ratio between the original scanned image(height and width param) and the shown image
        let widthRatio = (this.image.nativeElement.clientWidth || width) / width;
        let heightRatio = (this.image.nativeElement.clientHeight || height) / height;

        if (styleObject) {
            this.highlightStyle = styleObject;
        } else {
            this.highlightStyle = {
                display: 'block',
                height: coordinates[3] + 'px',
                width: coordinates[2] + 'px',
                left: (coordinates[0] - coordinates[2]) * widthRatio + 'px',
                top: (coordinates[1] - coordinates[3]) * heightRatio + 'px'
            };
        }
    }

    public removeHighlight() {
        this.highlightStyle = {
            display: 'none'
        };
    }
}
