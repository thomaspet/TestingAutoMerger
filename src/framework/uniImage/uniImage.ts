import {
    Component,
    Input,
    Output,
    SimpleChanges,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {trigger, transition, style, keyframes, animate} from '@angular/animations';
import * as printJS from 'print-js';

import {File} from '../../app/unientities';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../../app/authService';
import {Observable, Subject, of as observableOf, forkJoin} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {ErrorService, FileService, UniFilesService} from '../../app/services/services';
import {UniModalService, ConfirmActions, FileSplitModal} from '../uni-modal';
import {parseEHFData, generateEHFMarkup} from './ehf';
import {DomSanitizer} from '@angular/platform-browser';

export * from './ehf';

export enum UniImageSize {
    small = 150,
    medium = 700,
    large = 1200
}

export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

export interface FileExtended extends File {
    _thumbnailUrl?: string;
    _imgUrls?: string[];
    _ehfMarkup?: string;
    _ehfAttachments?: any[];
}

@Component({
    selector: 'uni-image',
    templateUrl: './uniImage.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('flashAnimation', [
          transition(':enter', [
            style({ backgroundColor: 'unset' }),
            animate('1s', keyframes([
                style({ backgroundColor: 'var(--color-c2a)', offset: 0.6 }),
                style({ backgroundColor: 'unset', offset: 1 })
            ]))
          ]),
        ]),
      ]
})
export class UniImage {
    @ViewChild(MatMenuTrigger) ocrMenu: MatMenuTrigger;

    @Input() entity: string;
    @Input() entityID: number;
    @Input() uploadWithoutEntity: boolean = false;
    @Input() size: UniImageSize;
    @Input() readonly: boolean;
    @Input() rotateAllowed: boolean;
    @Input() splitAllowed: boolean;
    @Input() splitFileDialogAllowed: boolean;
    @Input() hideToolbar: boolean;
    @Input() singleImage: boolean;
    @Input() expandInNewTab: boolean;
    @Input() uploadConfig: IUploadConfig;
    @Input() showFileID: number;
    @Input() fileIDs: number[] = [];
    @Input() hideUploadInput: boolean;

    @Output() fileListReady: EventEmitter<FileExtended[]> = new EventEmitter();
    @Output() imageDeleted: EventEmitter<FileExtended> = new EventEmitter();
    @Output() imageUnlinked: EventEmitter<FileExtended> = new EventEmitter();
    @Output() useWord = new EventEmitter();
    @Output() fileSplitCompleted = new EventEmitter();
    @Output() imageLoaded = new EventEmitter();

    private baseUrl: string = environment.BASE_URL_FILES;
    private keyListener: any;

    uploading: boolean;
    state = 'initial';

    files: FileExtended[] = [];
    currentFile: FileExtended;
    currentPage: number = 1;
    imgUrl: string;
    selectedEHFAttachment: any;
    canPrint: boolean;
    dropdownMenuItems: { label: string, action: () => void, disabled?: boolean }[];

    highlightStyle: any;
    currentClickedWord: any;
    ocrWords: any[] = [];
    ocrValues = [
        {label: 'Organisasjonsnr', value: 1},
        {label: 'Fakturadato', value: 7},
        {label: 'Forfallsdato', value: 8},
        {label: 'Fakturanummer', value: 5},
        {label: 'Bankkonto', value: 3},
        {label: 'KID', value: 4},
        {label: 'Fakturabeløp', value: 6},
    ];

    processingPercentage: number = null;

    cacheBuster = performance.now(); // used for busting the image cache after changes
    onDestroy$: Subject<any> = new Subject();

    constructor(
        private http: UniHttp,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef,
        private fileService: FileService,
        private modalService: UniModalService,
        private authService: AuthService,
        private uniFilesService: UniFilesService,
        public sanitizer: DomSanitizer
    ) {}

    public ngOnChanges(changes: SimpleChanges) {
        this.removeHighlight();
        this.currentPage = 1;
        this.currentFile = undefined;

        if ((changes['entity'] || changes['entityID']) && this.entity && this.isDefined(this.entityID)) {
            this.refreshFiles();
        } else if (changes['fileIDs']) {
            this.refreshFiles();
        } else if (changes['showFileID'] && this.files && this.files.length) {
            const file = this.files.find(f => f.ID === this.showFileID);
            this.showFile(file);
        }
    }

    ngOnDestroy() {
        this.setFileViewerData([]);
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    openFileViewer() {
        const baseUrl = window.location.href.split('/#/')[0];
        window.open(
            baseUrl + '/fileviewer.html',
            'Fileviewer',
            'menubar=0,scrollbars=1,height=950,width=965,left=0,top=8'
        );
    }

    downloadFile() {
        if (this.currentFile) {
            this.fileService.downloadFile(this.currentFile);
        }
    }

    public setOcrValues(values: any[]) {
        this.ocrValues = values;
    }

    public setOcrData(ocrResult) {
        if (ocrResult.OcrRawData) {
            const rawData = JSON.parse(ocrResult.OcrRawData);
            const words = rawData.AllWords;

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
            setTimeout(() => {
                this.state = 'initial';
                setTimeout(() => {
                    this.state = 'final';
                }, 2000);
            });
        } else {
            this.ocrWords = [];
        }

        this.cdr.markForCheck();
    }

    onOCRWordClick(word, event: MouseEvent) {
        event.stopPropagation();
        this.currentClickedWord = word;
    }

    selectOCRWord(useWordAs) {
        this.useWord.emit({
            word: this.currentClickedWord,
            propertyType: useWordAs
        });

        this.currentClickedWord = null;
        this.ocrMenu.closeMenu();
    }

    private setFileViewerData(files: FileExtended[]) {
        localStorage.setItem('fileviewer-data', JSON.stringify([]));

        if (files) {
            files = files.map(file => {
                file._imgUrls = [];
                for (let pageIndex = 1; pageIndex <= (file.Pages || 1); pageIndex++) {
                    file._imgUrls.push(this.generateImageUrl(file, UniImageSize.large, pageIndex));
                }

                return file;
            });

            localStorage.setItem('fileviewer-data', JSON.stringify(files));
        }
    }

    public refreshFiles() {
        let request;
        if (this.fileIDs && this.fileIDs.length && !(this.entity && this.entityID)) {
            const requestFilter = 'ID eq ' + this.fileIDs.join(' or ID eq ');
            request = this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files?filter=${requestFilter}`)
                .send();
        } else if (this.entity && this.entityID) {
            request = this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files/${this.entity}/${this.entityID}`)
                .send();
        }

        if (request) {
            request.subscribe(
                res => {
                    res = res.body.filter(x => x !== null);

                    // Get json data and generate markup for EHF files.
                    // Resolve the rest the of the files without changes.
                    const filesWithEHFData$ = res.map((file: FileExtended) => {
                        const filename = (file.Name || '').toLowerCase();
                        const type = (file.ContentType || '').toLowerCase();

                        if (type.includes('bis/billing') || filename.includes('.ehf')) {
                            const ehfDataRequest = this.uniFilesService.getEhfData(file.StorageReference).pipe(
                                catchError(err => {
                                    console.error('Error loading EHF data', err);
                                    return observableOf(null);
                                }),
                                map(ehfData => {
                                    if (ehfData) {
                                        const parsed = parseEHFData(ehfData);
                                        if (parsed) {
                                            file._ehfMarkup = generateEHFMarkup(parsed);
                                            file._ehfAttachments = parsed.attachments;
                                        }
                                    }

                                    return file;
                                })
                            );

                            return ehfDataRequest;
                        } else {
                            return observableOf(file);
                        }
                    });

                    forkJoin(filesWithEHFData$).subscribe((files: FileExtended[]) => {
                        this.files = this.setThumbnailUrls(files);
                        this.setFileViewerData(this.files);
                        this.fileListReady.emit(this.files);

                        if (this.files.length) {
                            this.currentPage = 1;
                            const file = this.files.find(f => f.ID === this.showFileID);
                            this.showFile(file);
                        }
                    });
                },
                err => this.errorService.handle(err)
            );
        } else {
            this.files = [];
            this.setFileViewerData(this.files);
        }
    }

    setThumbnailUrls(files: FileExtended[]): FileExtended[] {
        return (files || []).map(file => {
            file._thumbnailUrl = this.generateImageUrl(file, 100);
            return file;
        });
    }

    getCurrentFile() {
        return this.currentFile;
    }

    public fetchDocumentWithID(id: number) {
        this.fileIDs.push(id);
        this.refreshFiles();
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

    public next() {
        if (this.currentFile.Pages > this.currentPage) {
            this.currentPage++;
            this.showFile(this.currentFile);
        } else {
            const index = this.files.findIndex(f => f.ID === this.currentFile.ID);
            if (this.files[index + 1]) {
                this.showFile(this.files[index + 1]);
            }
        }
    }

    public previous() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.showFile(this.currentFile);
        } else {
            const index = this.files.findIndex(f => f.ID === this.currentFile.ID);
            if (this.files[index - 1]) {
                this.showFile(this.files[index - 1]);
            }
        }
    }

    public print() {
        const fileName = (this.currentFile.Name || '').toLowerCase();
        if (fileName.includes('.pdf')) {
            this.fileService.getDownloadUrl(this.currentFile.ID).subscribe(
                url => {
                    url += '&attachment=false';
                    try {
                        printJS({
                            printable: url,
                            type: 'pdf'
                        });
                    } catch (e) {}
                },
                err => this.errorService.handle(err)
            );
        }
    }

    public splitFileDialog() {
        this.modalService.open(FileSplitModal, {
            data: this.currentFile
        }).onClose.subscribe(res => {
            if (res === 'ok') {
                this.fileSplitCompleted.emit();
            }
        });
    }

    public splitFile() {
        const fileIndex = this.files.findIndex(f => f.ID === this.currentFile.ID);

        this.modalService.confirm({
            header: 'Bekreft oppdeling av fil',
            message: 'Vennligst bekreft at du vil dele filen i to fra og med denne siden. ' +
                     'Siste del av filen vil legges tilbake i innboksen',
            buttonLabels: {
                accept: 'Bekreft',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.uniFilesService.splitFile(
                    this.files[fileIndex].StorageReference,
                    this.currentPage,
                ).subscribe(
                    splitFileResult => {
                        this.fileService.splitFile(
                            this.files[fileIndex].ID,
                            splitFileResult.FirstPart.ExternalId,
                            splitFileResult.SecondPart.ExternalId
                        ).subscribe(
                            splitResultUE => {
                                this.cacheBuster = performance.now();
                                this.files[fileIndex] = splitResultUE.FirstPart;
                                this.setFileViewerData(this.files);

                                if (this.currentPage > 1) {
                                    this.currentPage--;
                                }

                                this.checkFileStatusAndLoadImage(
                                    splitResultUE.FirstPart
                                );
                            },
                            err => this.errorService.handle(err)
                        );
                    },
                    err => this.errorService.handle(err)
                );
            }
        });
    }

    public rotateLeft() {
        this.uniFilesService.rotate(this.currentFile.StorageReference, this.currentPage, false)
            .subscribe(
                () => this.showFile(this.currentFile, true),
                err => this.errorService.handle(err)
            );
    }

    public rotateRight() {
        this.uniFilesService.rotate(this.currentFile.StorageReference, this.currentPage, true)
            .subscribe(
                () => this.showFile(this.currentFile, true),
                err => this.errorService.handle(err)
            );
    }

    public deleteImage() {
        const deleteFileID = this.currentFile.ID;
        const buttonLabels: any = {
            reject: 'Slett',
            cancel: 'Avbryt'
        };

        if (this.entity === 'SupplierInvoice') {
            buttonLabels.accept = 'Legg tilbake i innboks';
        }

        this.modalService.confirm({
            header: 'Bekreft sletting',
            message: 'Vennligst bekreft sletting av fil',
            buttonLabels: buttonLabels
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.REJECT) {
                const deleteRequest = this.entity && this.entityID
                    ? this.fileService.deleteOnEntity(this.entity, this.entityID, deleteFileID)
                    : this.fileService.delete(deleteFileID);


                deleteRequest.subscribe(
                    () => this.removeImage(),
                    err => this.errorService.handle(err)
                );
            } else if (response === ConfirmActions.ACCEPT) {
                if (this.entity && this.entityID) {
                    this.fileService.unlinkFile(this.entity, this.entityID, deleteFileID).subscribe(
                        () => this.removeImage(true),
                        err => this.errorService.handle(err)
                    );

                } else {
                    this.removeImage(true);
                }
            }
        });
    }

    private removeImage(isUnlink: boolean = false) {
        const file = this.currentFile;
        const index = this.files.findIndex(f => f.ID === file.ID);

        if (index >= 0) {
            this.files.splice(index, 1);
            this.showFile(this.files[0]);

            this.fileListReady.emit(this.files);
            this.imageDeleted.emit(file);

            if (isUnlink) {
                this.imageUnlinked.emit(file);
            }
        }
    }

    private showFile(fileToShow: FileExtended, invalidateCache = false) {
        if (invalidateCache) {
            this.cacheBuster = performance.now();
        }

        this.selectedEHFAttachment = undefined;
        const file = fileToShow || this.files && this.files[0];

        if (file) {
            if (file !== this.currentFile) {
                this.currentPage = 1;
            }

            this.currentFile = file;
            this.removeHighlight();
            this.ocrWords = [];
            this.canPrint = file.Name && file.Name.includes('.pdf');

            this.dropdownMenuItems = this.getDropdownMenuItems();

            if (!file._ehfMarkup) {
                this.imgUrl = this.generateImageUrl(file, 1200, this.currentPage || 1);
            }
        } else {
            this.currentFile = undefined;
            this.imgUrl = undefined;
            this.dropdownMenuItems = undefined;
            this.canPrint = false;
        }

        this.cdr.markForCheck();
    }

    skipSanitazion(link: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(link);
    }

    private getDropdownMenuItems() {
        const items = [];

        if (!this.readonly) {
            items.push({ label: 'Slett fil', action: () => this.deleteImage() });
        }

        if (this.rotateAllowed) {
            items.push(
                { label: 'Roter mot klokken', action: () => this.rotateLeft() },
                { label: 'Roter med klokken', action: () => this.rotateRight() }
            );
        }

        const isPDF = this.currentFile.ContentType === 'application/pdf' || this.currentFile.Name.toLowerCase().endsWith('.pdf');
        if (this.currentFile.Pages > 1 && isPDF) {
            if (this.splitAllowed && !this.readonly) {
                items.push({
                    label: 'Del fil i to fra denne siden',
                    action: () => this.splitFile(),
                    disabled: this.currentPage === 1
                });
            }

            if (this.splitFileDialogAllowed) {
                items.push({ label: 'Del opp fil', action: () => this.splitFileDialog() });
            }
        }

        return items;
    }

    private generateImageUrl(file: FileExtended, width: number, pageOverride?: number): string {
        const url = `${this.baseUrl}/api/image`
            + `?key=${this.authService.activeCompany.Key}`
            + `&id=${file.StorageReference}`
            + `&width=${width}`
            + `&page=${pageOverride || this.currentPage}`
            + `&t=${this.cacheBuster}`;

        return encodeURI(url);
    }

    public onDrop(event, dropData) {
        const transfer = this.getTransfer(event);
        if (!transfer) {
            return;
        }

        for (let i = 0; i < transfer.files.length; i++) {
            this.uploadFile(transfer.files[i]);
        }
    }

    protected getTransfer(event: any): any {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
    }

    public onUploadInputChange(event) {
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
                this.fileService.deleteOnEntity(this.entity, this.entityID, oldFileID).subscribe(
                    () => this.uploadFile(newFile),
                    err => {
                        this.errorService.handle(err);
                        this.uploading = false;
                        this.cdr.markForCheck();
                    }
                );
            } else {
                this.uploadFile(newFile);
            }
        }
    }

    private uploadFile(file) {
        this.uniFilesService.upload(file, this.entity, this.entityID).subscribe(
            res => {
                this.fileService.Get(res.ExternalId).subscribe(
                    newFile => {
                        this.files.push(newFile);
                        this.fileIDs.push(newFile.ID);
                        this.setFileViewerData(this.files);

                        this.checkFileStatusAndLoadImage(newFile);
                    },
                    err => this.errorService.handle(err)
                );
            },
            err => {
                this.uploading = false;
                this.cdr.markForCheck();
                this.errorService.handle(err);
            }
        );
    }

    private checkFileStatusAndLoadImage(file, attempts: number = 0) {
        if (!this.processingPercentage) {
            this.processingPercentage = 0;
        }

        this.uniFilesService.getFileProcessingStatus(file.StorageReference)
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

                    this.showFile(file);

                    // emit change to parent component in case it is referencing the file ids
                    // (which will now have been updated)
                    this.fileListReady.emit(this.files);
                } else {
                    // increase wait time by 10 ms for each attempt, starting at 50 ms, making
                    // the total possible wait time will be approx 1 minute (55 sec + response time)
                    const timeout = 50 + (10 * attempts);
                    setTimeout(() => {
                        this.checkFileStatusAndLoadImage(file, attempts++);
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
