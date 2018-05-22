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
import {AuthService} from '../../app/authService';
import {Observable} from 'rxjs/Observable';
import {environment} from 'src/environments/environment';
import {ErrorService, FileService, UniFilesService} from '../../app/services/services';
import {UniModalService, ConfirmActions} from '../uni-modal';
import {UniPrintModal} from '../../app/components/reports/modals/print/printModal';
import {ToastService, ToastType, ToastTime} from '../uniToast/toastService';
import {FileSplitModal} from '../fileSplit/FileSplitModal';
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
            <section class="image-section" *ngIf="files?.length > 0">
                <section class="uni-image-pager" *ngIf="files?.length && !hideToolbar">
                    <a *ngIf="files.length > 1 || (files[currentFileIndex] && files[currentFileIndex].Pages > 1)"
                        class="prev"
                        (click)="previous()">
                    </a>

                    {{fileInfo}}

                    <a class="print" (click)="print()">
                        <i class="material-icons">print</i>
                    </a>

                    <a class="split" (click)="splitFile()"
                        *ngIf="splitAllowed && !readonly && files[currentFileIndex] && currentPage > 1 && files[currentFileIndex].Pages > 1 && files[currentFileIndex].Name.toLowerCase().endsWith('.pdf')">
                        <i class="material-icons">call_split</i>
                    </a>

                    <a class="split" (click)="splitFileDialog()"
                        *ngIf="splitFileDialogAllowed && files[currentFileIndex] && files[currentFileIndex].Pages > 1 && files[currentFileIndex].Name.toLowerCase().endsWith('.pdf')">
                        <i class="material-icons">call_split</i>
                    </a>

                    <a class="trash" (click)="deleteImage()" *ngIf="!readonly">
                        <i class="material-icons">delete</i>
                    </a>

                    <a (click)="rotateLeft()" *ngIf="rotateAllowed">
                        <i class="material-icons">undo</i>
                    </a>
                    <a (click)="rotateRight()" *ngIf="rotateAllowed">
                        <i class="material-icons">redo</i>
                    </a>

                    <a *ngIf="files.length > 1 || (files[currentFileIndex] && files[currentFileIndex].Pages > 1)"
                        class="next"
                        (click)="next()">
                    </a>
                </section>

                <div *ngIf="uploading && !hideToolbar" class="uploading-progress-info">
                    <span *ngIf="processingPercentage">
                        Prosesserer fil, {{processingPercentage}}% ferdig
                    </span>
                    <span *ngIf="!processingPercentage">
                        Laster opp...
                    </span>
                </div>

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

                    <span *ngIf="!imageIsLoading">
                        <span *ngFor="let word of ocrWords"
                            class="image-word"
                            title="{{word.text}}"
                            [ngStyle]="word._style"
                            (click)="onWordClicked(word, $event)">
                        </span>

                        <div *ngIf="wordPickerAreaVisible"
                            class="word-picker-area"
                            [ngStyle]="currentClickedWordStyle"
                            (click)="$event.stopPropagation()"
                            (clickOutside)="abortUseWord()">

                            <p>Valgt verdi: {{currentClickedWord.text}}</p>
                            <h3>Bruk verdi som:</h3>
                            <button (click)="selectWordUsage(7, $event)">Fakturadato</button>
                            <button (click)="selectWordUsage(8, $event)">Forfallsdato</button>
                            <button (click)="selectWordUsage(5, $event)">Fakturanummer</button>
                            <button (click)="selectWordUsage(3, $event)">Bankkonto</button>
                            <button (click)="selectWordUsage(4, $event)">KID</button>
                            <button (click)="selectWordUsage(6, $event)">Fakturabeløp</button>
                        </div>

                        <span id="span-area-highlighter" class="span-area-highlight-class" [ngStyle]="highlightStyle"></span>
                    </span>
                </picture>
            </section>

            <ul class="uni-thumbnail-list" *ngIf="thumbnils?.length || !readonly"
                [ngClass]="{'-has-thumbnails': thumbnails?.length}">

                <li *ngIf="!readonly && !uploadConfig?.isDisabled && !uploading" [attr.aria-busy]="uploading">
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
                <li *ngFor="let thumbnail of thumbnails; let idx = index">
                    <img [attr.src]="thumbnail"
                        [attr.alt]="shorten(files[idx]?.Description, 20)"
                        (click)="thumbnailClicked(idx)">
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
    public rotateAllowed: boolean;

    @Input()
    public splitAllowed: boolean;

    @Input()
    public splitFileDialogAllowed: boolean;

    @Input()
    public hideToolbar: boolean;

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

    @Output()
    public useWord: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public fileSplitCompleted: EventEmitter<any> = new EventEmitter<any>();

    public imageIsLoading: boolean = true;

    private baseUrl: string = environment.BASE_URL_FILES;

    private token: any;
    private activeCompany: any;
    private didTryReAuthenticate: boolean = false;
    private lastUrlFailed: string = null;

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

    private wordPickerAreaVisible: boolean = false;
    private currentClickedWordStyle: any;
    private currentClickedWord: any;


    private processingPercentage: number = null;

    private ocrWords: Array<any> = [];

    constructor(
        private ngHttp: Http,
        private http: UniHttp,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef,
        private fileService: FileService,
        private modalService: UniModalService,
        private authService: AuthService,
        private uniFilesService: UniFilesService,
        private toastService: ToastService
    ) {
        this.authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
            this.refreshFiles();
        });

        this.authService.filesToken$.subscribe(token => {
            this.token = token;
            this.refreshFiles();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.imgUrl = this.imgUrl2x = '';
        this.removeHighlight();
        this.currentPage = 1;

        this.thumbnails = [];
        if (this.activeCompany) {
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
    }

    public setOcrData(ocrResult) {
        if (ocrResult.OcrRawData) {
            let rawData = JSON.parse(ocrResult.OcrRawData);
            let words = rawData.AllWords;

            if (words && ocrResult.ImageWidth && ocrResult.ImageHeight) {
                words.forEach(word => {
                    if (!word._style) {
                        word._style = {
                            height: (word.Height * 100 / ocrResult.ImageHeight) + '%',
                            width: (word.Width * 100 / ocrResult.ImageWidth) + '%',
                            left: (word.Left * 100 / ocrResult.ImageWidth) + '%',
                            top: 'calc(' + (word.Top * 100 / ocrResult.ImageHeight) + '% - 4.5px)'
                        };
                    }
                });
            }

            this.ocrWords = words;
        } else {
            this.ocrWords = [];
        }

        this.cdr.markForCheck();
    }

    public onWordClicked(word, event: MouseEvent) {
        this.wordPickerAreaVisible = true;
        this.currentClickedWord = word;

        this.currentClickedWordStyle = {
            top: 'calc(' + word._style.top + ' + 1.5rem)',
            left: 'calc(' + word._style.left + ' - 6rem)'
        };

        event.stopPropagation();
    }

    public selectWordUsage(useWordAs, event: MouseEvent) {
        this.useWord.emit({
            word: this.currentClickedWord,
            propertyType: useWordAs
        });

        this.currentClickedWord = null;
        this.currentClickedWordStyle = null;
        this.wordPickerAreaVisible = false;

        event.stopPropagation();
    }

    public abortUseWord(event: MouseEvent) {
        this.currentClickedWord = null;
        this.currentClickedWordStyle = null;
        this.wordPickerAreaVisible = false;
    }

    public refreshFiles() {
        if (!this.token || !this.activeCompany) {
            return;
        }

        if (this.fileIDs && this.fileIDs.length > 0) {
            let requestFilter = 'ID eq ' + this.fileIDs.join(' or ID eq ');
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files?filter=${requestFilter}`)
                .send()
                .subscribe((res) => {
                    this.files = res.json().filter(x => x !== null);
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
                    this.files = res.json().filter(x => x !== null);
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

    public fetchDocumentWithID(id: number) {
        this.fileIDs.push(id);
        this.refreshFiles();
    }

    private getChosenFileIndex() {
        const chosenFileIndex = this.files.findIndex(file => file.ID === this.showFileID);
        if (chosenFileIndex > 0) {
            return chosenFileIndex;
        } else {
            return 0;
        }
    }

    public getCurrentFile(): File {
        return this.files[this.currentFileIndex];
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

    private print() {
        const currentFile = this.files[this.currentFileIndex];

        // If not pdf, just print the image
        if (!currentFile.Name || !currentFile.Name.includes('.pdf')) {
            this.printImage(this.imgUrl);
            return;
        }

        this.fileService.printFile(this.files[this.currentFileIndex].ID)
            .subscribe((res: any) => {
                const url = JSON.parse(res._body) + '&attachment=false';

                this.modalService.open(UniPrintModal, {
                    data: { url: url }
                }).onClose.take(1).subscribe();
            },
            err => this.errorService.handle(err)
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
        if (pwa) {
            pwa.document.open();
            pwa.document.write(this.imageToPrint(source));
            pwa.document.close();
        } else {
            this.toastService.addToast(
                'Blokkert?',
                ToastType.warn,
                ToastTime.medium,
                'Sjekk om du har blokkering for ny fane/vindu i nettleseren din.'
            );
        }
    }

    private splitFileDialog() {
        this.modalService.open(FileSplitModal, {
                data: this.getCurrentFile()
            })
            .onClose.subscribe(res => {
                if (res === 'ok') {
                    this.fileSplitCompleted.emit();
                }
            });
    }

    private splitFile() {
        this.modalService.confirm({
            header: 'Bekreft oppdeling av fil',
            message: 'Vennligst bekreft at du vil dele filen i to fra og med denne siden. Siste del av filen vil legges tilbake i innboksen',
            buttonLabels: {
                accept: 'Bekreft',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.uniFilesService.splitFile(this.files[this.currentFileIndex].StorageReference, this.currentPage, true)
                    .then(splitFileResult => {
                        this.fileService.splitFile(
                            this.files[this.currentFileIndex].ID,
                            splitFileResult.FirstPart.ExternalId,
                            splitFileResult.SecondPart.ExternalId
                        ).subscribe(splitResultUE => {
                            // replace the current file, and make uniimage reload the split file
                            this.files[this.currentFileIndex] = splitResultUE.FirstPart;

                            // because the file was split, go back one page, or the request will
                            // fail because the page does not exist
                            this.currentPage--;

                            // check filestatus and load file/image when Uni Files is done
                            // processing it
                            this.checkFileStatusAndLoadImage(splitFileResult.FirstPart.StorageReference);
                        }, err => this.errorService.handle(err));
                    }).catch(err => this.errorService.handle(err));
                }
        });
    }

    private rotateLeft(event) {
        this.uniFilesService.rotate(this.getCurrentFile().StorageReference, this.currentPage, false)
            .subscribe(res => {
                this.loadImage(true);
            }, err => this.errorService.handle(err)
        );
    }

    private rotateRight(event) {
        this.uniFilesService.rotate(this.getCurrentFile().StorageReference, this.currentPage, true)
            .subscribe(res => {
                this.loadImage(true);
            }, err => this.errorService.handle(err)
        );
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

                            this.files.splice(this.currentFileIndex, 1);
                            this.currentFileIndex--;
                            if (this.currentFileIndex < 0 && this.files.length > 0) { this.currentFileIndex = 0; }

                            if (this.currentFileIndex >= 0) { this.loadImage(); }
                            if (!this.singleImage) { this.loadThumbnails(); }

                            this.fileListReady.emit(this.files);
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
        // if something failed when loading another image, we should try again
        if (this.imgUrl2x != this.lastUrlFailed) {
            this.didTryReAuthenticate = false;
        }

        if (!this.didTryReAuthenticate) {
            // set flag to avoid "authentication loop" if the new authentication
            // also throws an error
            this.didTryReAuthenticate = true;
            this.lastUrlFailed = this.imgUrl2x;

            this.uniFilesService.checkAuthentication()
                .then(res => {
                    // authentication is ok - something else caused the problem,
                    // assume it was just a glitch and retry whatever was supposed
                    // to be done
                    runAfterReauth();
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

    private loadImage(forceRefresh: boolean = false) {
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

        this.removeHighlight();

        this.imgUrl2x = this.generateImageUrl(file, size * 2) + (forceRefresh ? '&t=' + Date.now() : '');
        this.imgUrl = this.generateImageUrl(file, size) + (forceRefresh ? '&t=' + Date.now() : '');

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
        // reset reauth flag it might be needed to reauthenticate if the
        // user has not left the view containing the uniimage components
        // for a while (and it has already authenticated)
        this.didTryReAuthenticate = false;

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
                    }, err => {
                        this.errorService.handle(err);
                        this.uploading = false;
                        this.cdr.markForCheck();
                    });
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
        data.append('CacheOnUpload', 'true');
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
                        this.files.push(newFile);
                        this.fileIDs.push(newFile.ID);
                        this.currentFileIndex = this.files.length - 1;
                        this.currentPage = 1;
                        this.removeHighlight();

                        // reset reauth flag after uploading, because sometimes getting new
                        // images will fail right after upload, and we need to retry to get
                        // it if it fails the first time
                        this.didTryReAuthenticate = false;

                        // check filestatus and load file/image when Uni Files is done
                        // processing it
                        this.checkFileStatusAndLoadImage(res.StorageReference);

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
                    this.uploading = false;
                    this.cdr.markForCheck();
                    this.errorService.handle(err);
                }
            });
    }

    private checkFileStatusAndLoadImage(fileId: string, attempts: number = 0) {
        if (!this.processingPercentage) {
            this.processingPercentage = 0;
        }

        this.uniFilesService.getFileProcessingStatus(fileId)
            .subscribe((res) => {
                if (this.processingPercentage !== res.ProcessedPercentage) {
                    this.processingPercentage = res.ProcessedPercentage;
                    this.cdr.markForCheck();
                }

                // if status is 0 = unknown (e.g. it is an old file, from before the queuehandling
                // was implemented) or 3 = Finished - or we have tried a
                if (res.Status === 0 || res.Status === 3 || attempts > 100) {
                    this.uploading = false;
                    this.processingPercentage = null;

                    this.loadImage();

                    if (!this.singleImage) {
                        this.loadThumbnails();
                    }

                    // emit change to parent component in case it is referencing the file ids
                    // (which will now have been updated)
                    this.fileListReady.emit(this.files);
                } else {
                    // increase wait time by 10 ms for each attempt, starting at 50 ms, making
                    // the total possible wait time will be approx 1 minute (55 sec + response time)
                    let timeout = 50 + (10 * attempts);
                    setTimeout(() => {
                        this.checkFileStatusAndLoadImage(fileId, attempts++);
                    }, timeout);
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
                height: (coordinates[3] * 100 / height) + '%',
                width: (coordinates[2] * 100 / width) + '%',
                left: (coordinates[0] * 100 / width) + '%',
                top: 'calc(' + (coordinates[1] * 100 / height) + '% - 4.5px)'
            };
        }
    }

    public removeHighlight() {
        this.highlightStyle = {
            display: 'none'
        };
    }
}
