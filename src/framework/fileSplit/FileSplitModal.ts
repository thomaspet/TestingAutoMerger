import {Component, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IModalOptions, IUniModal} from '../uniModal/barrel';
import {File} from '../../app/unientities';
import {environment} from 'src/environments/environment';
import {Http} from '@angular/http';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../../app/authService';
import {Observable} from 'rxjs/Observable';
import {ErrorService, FileService, UniFilesService} from '../../app/services/services';
import {ToastService, ToastType, ToastTime} from '../uniToast/toastService';
import {KeyCodes} from '../../app/services/common/keyCodes';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../uniModal/barrel';

@Component({
    selector: 'file-split-modal',
    template: `
        <section
            role="dialog"
            class="uni-modal account_detail_modal_size"
            (keyup)="onKey($event)">

            <header><h1>Del opp fil</h1></header>
            <article class="image-split-modal-body" [attr.aria-busy]="isSplitting">
                <div class="parts">
                    <div *ngIf="processingPercentage" class="images_loading">
                        Prosesserer fil, {{processingPercentage}}% ferdig...
                    </div>

                    <strong *ngIf="thumbnails.length > 0">Oppdeling:</strong>
                    <ul>
                        <li *ngFor="let part of parts">
                            Dokument {{part.partNo}}: Sider: {{getPagesFromPart(part)}}
                            <a (click)="removePart(part)">Tilbakestill</a>
                        </li>
                    </ul>

                    <strong *ngIf="currentPart">Markerte sider:</strong>
                    <ul *ngIf="currentPart">
                        <li>
                            Dokument {{currentPart.partNo}}: Sider: {{getPagesFromPart(currentPart)}}
                            <a (click)="clearCurrentPart()" *ngIf="currentPart.Pages.length > 0">Nullstill</a>
                        </li>
                    </ul>

                    <button (click)="createNewPartFromSelected()" *ngIf="currentPart && currentPart.Pages.length > 0">
                        Legg til oppdeling
                    </button>

                    <p *ngIf="thumbnails.length > 0">
                        Kontroller at oppdelingen blir riktig i listen over. <br/>
                        Du kan også bruke piltastene og mellomromtasten for å velge sider. Holde inne shifttasten mens du navigerer med
                        piltastene for å markere flere sider.<br/>
                        Ctrl + Enter kan brukes for å opprette ny filinndeling med de valgte sidene, eller bruk knappen over.
                    </p>
                </div>
                <div class="images">
                    <div *ngIf="thumbnails && thumbnails.length > 0" class="image_preview">
                        <div *ngIf="!ProcessedPercentage && (!thumbnails || thumbnails.length === 0) && !currentThumbnailIndex">
                            Henter sider...
                        </div>
                        <div>
                            <img *ngIf="currentThumbnail"
                                [attr.src]="currentThumbnail.url"
                                (load)="finishedLoadingThumbnail(currentThumbnail)"
                                [attr.alt]="currentThumbnail.page"
                                [class.loading]="!currentThumbnail._isloaded"
                                [class.rotate90]="currentThumbnail._rotation === 90"
                                [class.rotate180]="currentThumbnail._rotation === 180"
                                [class.rotate270]="currentThumbnail._rotation === 270" />
                            <div class="commands" *ngIf="currentThumbnail">
                                <span class="pageno">Side {{currentThumbnail.page}}</span>
                                <a (click)="rotateLeft($event)" title="Roter venstre"><i class="material-icons">undo</i></a>
                                <a (click)="rotateRight($event)" title="Roter høyre"><i class="material-icons">redo</i></a>
                            </div>
                        </div>
                    </div>
                    <div class="image_thumbnails" #thumbnailcontainer>
                        <li *ngFor="let thumbnail of visibleThumbnails; let idx = index"
                            [class]="thumbnail.class"
                            (click)="thumbnailClicked(thumbnail.page, $event)"
                            (focus)="thumbnailFocused(thumbnail, idx)"
                            tabindex="0">
                            <div class="thumbnail">
                                <img [attr.src]="thumbnail.url"
                                    (load)="finishedLoadingThumbnail(thumbnail)"
                                    [attr.alt]="thumbnail.page"
                                    [class.loading]="!thumbnail._isloaded"
                                    [class.rotate90]="thumbnail._rotation === 90"
                                    [class.rotate180]="thumbnail._rotation === 180"
                                    [class.rotate270]="thumbnail._rotation === 270" />
                                <div class="pageno">Side {{thumbnail.page}}</div>
                            </div>
                        </li>
                        <button (click)="showMorePages()" *ngIf="thumbnails.length > maxVisibleImages">Vis flere</button>
                        <span *ngIf="thumbnails.length > 0 && visibleThumbnails.length === 0">
                            <strong>Ingen flere bilder å velge</strong>
                            <p>Trykk Del opp fil under for at endringene skal lagres og filen skal deles opp.</p>
                        </span>
                    </div>
                </div>
            </article>
            <footer>
                <button [attr.aria-busy]="isSplitting" (click)="splitFile()" class="good">Del opp fil</button>
                <button (click)="splitRemainingPerPage()" *ngIf="thumbnails.length > 0 && visibleThumbnails.length > 0">
                    Del opp dokumentet per side
                </button>
                <button [disabled]="isSplitting" (click)="clear()">Nullstill</button>
                <button [disabled]="isSplitting" (click)="close()" class="bad">Avbryt</button>
            </footer>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileSplitModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter(false);

    @ViewChild('thumbnailcontainer')
    private thumbnailContainer;

    public file: File;
    private thumbnails: ThumbnailData[] = [];
    private visibleThumbnails: ThumbnailData[] = [];
    private currentPart: SplitPart = {partNo: 1, Pages: []};
    private parts: SplitPart[] = [];
    private baseUrl: string = environment.BASE_URL_FILES;
    private previousThumbnail: ThumbnailData;
    private currentThumbnail: ThumbnailData;
    private currentThumbnailIndex: number;

    private token: any;
    private activeCompany: any;
    private processingPercentage: number;
    private hasFocusedOnFirstThumbnail: boolean = false;
    private maxVisibleImages = 25;
    private isSplitting: boolean = false;

    constructor(
        private cdr: ChangeDetectorRef,
        private fileService: FileService,
        private authService: AuthService,
        private uniFilesService: UniFilesService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {
        this.authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
            this.loadFile();
        });

        this.authService.filesToken$.subscribe(token => {
            this.token = token;
            this.loadFile();
        });
    }

    public ngOnInit() {
        this.file = this.options.data;
        if (this.file) {
            this.loadFile();
        }
    }

    private loadFile() {
        if (this.file && this.activeCompany && this.token) {
            this.thumbnails = [];

            this.uniFilesService.forceFullLoad(this.file.StorageReference)
                .subscribe(force => {
                    // poll for status on full load
                    this.checkFileStatusAndLoadImage();
                }, err => this.errorService.handle(err)
            );
        }
    }

    private checkFileStatusAndLoadImage(attempts: number = 0) {
        if (!this.processingPercentage) {
            this.processingPercentage = 0;
        }

        this.uniFilesService.getFileProcessingStatus(this.file.StorageReference)
            .subscribe((res) => {
                if (this.processingPercentage !== res.ProcessedPercentage) {
                    this.processingPercentage = res.ProcessedPercentage;
                    this.cdr.markForCheck();
                }

                // if status is 0 = unknown (e.g. it is an old file, from before the queuehandling
                // was implemented) or 3 = Finished - or we have tried a 100 times already, so just
                // try to load it
                if (res.Status === 0 || res.Status === 3 || attempts > 100) {
                    this.processingPercentage = null;

                    this.thumbnails = this.generatePageUrls(this.file, 400);
                    this.visibleThumbnails = this.thumbnails.filter(x => x.page <= this.maxVisibleImages);

                    this.focusOnFirstThumbnail();

                    if (!res.SplitPages) {
                        this.uniFilesService.getFileSplitList(this.file.StorageReference, true)
                            .subscribe(splitRes => {
                                if (splitRes && splitRes.SplitPages && splitRes.SplitPages.length > 0) {
                                    this.autoSplitOnSplitPages(splitRes.SplitPages);
                                }
                            }, err => this.errorService.handle(err)
                        );
                    } else {
                        this.autoSplitOnSplitPages(res.SplitPages);
                    }

                    this.cdr.markForCheck();
                } else {
                    if (res.Status === 2 && res.ProcessedPercentage > 0 && this.file.Pages > 10) {
                        // file is partial complete, and it is a large file - start retrieving images
                        let processedPages = Math.floor(this.file.Pages * (res.ProcessedPercentage / 100));

                        if (processedPages > this.thumbnails.length) {
                            let thumbnails = this.generatePageUrls(this.file, 400, processedPages);
                            let newThumbnails = thumbnails.slice(this.thumbnails.length);

                            this.focusOnFirstThumbnail();

                            newThumbnails.forEach(thumb => this.thumbnails.push(thumb));

                            this.visibleThumbnails = this.thumbnails.filter(x => x.page <= this.maxVisibleImages);
                            this.cdr.markForCheck();
                        }
                    }

                    // increase wait time by 10 ms for each attempt, starting at 50 ms, making
                    // the total possible wait time will be approx 1 minute (55 sec + response time)
                    let timeout = 50 + (10 * attempts);
                    setTimeout(() => {
                        this.checkFileStatusAndLoadImage(attempts++);
                    }, timeout);
                }
            });
    }

    private focusOnFirstThumbnail () {
        if(!this.hasFocusedOnFirstThumbnail) {
            setTimeout(() => {
                if (this.thumbnailContainer && this.thumbnailContainer.nativeElement) {
                    let element = this.thumbnailContainer.nativeElement.getElementsByTagName("li");
                    if (element && element.length > 0) {
                        element[0].focus();
                        this.hasFocusedOnFirstThumbnail = true;
                    }
                }
            });
        }
    }

    private focusOnCurrentThumbnail () {
        if(this.currentThumbnailIndex) {
            setTimeout(() => {
                if (this.thumbnailContainer && this.thumbnailContainer.nativeElement) {
                    let element = this.thumbnailContainer.nativeElement.getElementsByTagName("li");
                    if (element && element.length >= this.currentThumbnailIndex) {
                        element[this.currentThumbnailIndex].focus();
                    }
                }
            });
        }
    }

    private focusOnNextThumbnail () {
        if(this.currentThumbnailIndex !== null && this.currentThumbnailIndex !== undefined) {
            if (this.thumbnailContainer && this.thumbnailContainer.nativeElement) {
               let element = this.thumbnailContainer.nativeElement.getElementsByTagName("li");
                if (element && element.length > this.currentThumbnailIndex + 1) {
                    this.currentThumbnailIndex = this.currentThumbnailIndex + 1;
                    element[this.currentThumbnailIndex].focus();
                    this.cdr.markForCheck();
                }
            }
        }
    }

    private focusOnPreviousThumbnail () {
        if(this.currentThumbnailIndex !== null && this.currentThumbnailIndex !== undefined) {
            if (this.thumbnailContainer && this.thumbnailContainer.nativeElement) {
                let element = this.thumbnailContainer.nativeElement.getElementsByTagName("li");
                if (element && element.length > 0 && this.currentThumbnailIndex > 0) {
                    this.currentThumbnailIndex = this.currentThumbnailIndex - 1;
                    element[this.currentThumbnailIndex].focus();
                    this.cdr.markForCheck();
                }
            }
        }
    }

    private generatePageUrls(file: File, width: number, maxPageNo: number = null): Array<ThumbnailData> {
        let pageUrls: Array<ThumbnailData> = [];

        for(let i = 0; i < file.Pages && (!maxPageNo || i < maxPageNo); i++) {
            let url = `${this.baseUrl}/api/image/?key=${this.activeCompany.Key}&token=${this.token}&id=${file.StorageReference}&width=${width}&page=${i+1}`;
            pageUrls.push({page: i+1, url: encodeURI(url), class: '', _isloaded: false, _isPartOfBatch: false, _rotation: 0});
        }

        return pageUrls;
    }

    private clear() {
        this.parts = [];
        this.currentPart = {partNo: 1, Pages: []};
        this.visibleThumbnails = this.thumbnails.filter(x => x.page < this.maxVisibleImages);

        this.visibleThumbnails.forEach(thumb => {
            thumb._isPartOfBatch = false;
            thumb.class = '';
        });

        // reset focus when a part has been removed because the image list
        // is refreshed (images in the new part is removed)
        this.hasFocusedOnFirstThumbnail = false;
        this.focusOnFirstThumbnail();
    }

    private finishedLoadingThumbnail(thumbnail) {
        thumbnail._isloaded = true;
    }

    private onKey(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.SPACE) {
            this.thumbnailClicked(this.currentThumbnail.page);
            event.preventDefault();
        } else if (event.keyCode === KeyCodes.RIGHT_ARROW) {
            if (event.ctrlKey) {
                this.rotateRight(event);
            } else if (event.shiftKey) {
                // if holding shift, select the currentPage before moving if it
                // is not already selected
                if (!this.currentPart.Pages.find(x => x === this.currentThumbnail.page)) {
                    this.thumbnailClicked(this.currentThumbnail.page);
                }
                // also mark the item to the right
                this.focusOnNextThumbnail();
                this.thumbnailClicked(this.currentThumbnail.page);
            } else {
                this.focusOnNextThumbnail();
            }
            event.preventDefault();
        } else if (event.keyCode === KeyCodes.LEFT_ARROW) {
            if (event.ctrlKey) {
                this.rotateLeft(event);
            } else {
                this.focusOnPreviousThumbnail();
            }
            event.preventDefault();
        } else if (event.keyCode === KeyCodes.ENTER) {

            if (event.ctrlKey) {
                // add the current page to the part if it is not already selected
                if (!this.currentPart.Pages.find(x => x === this.currentThumbnail.page)) {
                    this.thumbnailClicked(this.currentThumbnail.page);
                }

                // create new part with the selected parts
                this.createNewPartFromSelected();
            } else {
                this.thumbnailClicked(this.currentThumbnail.page);
            }
        }
    }

    private createNewPartFromSelected() {
        if (this.currentPart.Pages.length > 0) {
            // mark each page as part of a batch
            this.currentPart.Pages.forEach(page => {
                let thumb = this.thumbnails.find(x => x.page === page);
                if (thumb) {
                    thumb._isPartOfBatch = true;
                }
            });

            this.parts.push(this.currentPart);

            // filter out pages in a part, because those should not be possible to reselect
            this.visibleThumbnails = this.thumbnails.filter(x => x.page <= this.maxVisibleImages && !x._isPartOfBatch);

            // consider adding a new part automatically if more pages exists that are not selected
            if (this.visibleThumbnails.length > 0) {
                this.currentPart = { partNo: this.parts.length + 1, Pages: [] };
            } else {
                this.currentPart = null;
            }

            // reset focus when a part has been added because the image list
            // is refreshed (images in the new part is removed)
            this.currentThumbnail = null;
            this.hasFocusedOnFirstThumbnail = false;
            this.focusOnFirstThumbnail();
        } else {
            this.toastService.addToast(
                'Velg en eller flere sider',
                ToastType.warn,
                ToastTime.medium,
                'Du må velge en eller flere filer som skal være med i det nye dokumentet'
            );
        }
    }

    private removePart(part: SplitPart) {
        this.parts = this.parts.filter(x => x.partNo !== part.partNo);

        // reorder partNo when deleting a part, in case e.g. 3 parts exist, and part 2 is removed
        let newPartNo = 1;
        this.parts.forEach(part => {
            part.partNo = newPartNo;
            newPartNo++;
        });

        // reset partno for the current part as well - or create a new part if non exists
        if (!this.currentPart) {
            this.currentPart = { partNo: this.parts.length + 1, Pages: [] };
        } else {
            this.currentPart.partNo = this.parts.length + 1;
        }

        // mark the pages in the part as not part of a part anymore
        part.Pages.forEach(page => {
            let thumb = this.thumbnails.find(x => x.page === page);
            if (thumb) {
                thumb.class = '';
                thumb._isPartOfBatch = false;
            }
        });

        // update image list because new images will be available for selection now
        this.visibleThumbnails = this.thumbnails.filter(x => x.page <= this.maxVisibleImages && !x._isPartOfBatch);

        // reset focus when a part has been removed because the image list
        // is refreshed (images in the new part is removed)
        this.hasFocusedOnFirstThumbnail = false;
        this.focusOnFirstThumbnail();
    }

    private clearCurrentPart() {
        this.currentPart.Pages.forEach(page => {
            let thumb = this.thumbnails.find(x => x.page === page);
            if (thumb) {
                thumb.class = '';
            }
        });

        this.currentPart.Pages = [];
    }

    private splitRemainingPerPage() {
        // if we have already selected some pages, add those to a new part first
        if (this.currentPart && this.currentPart.Pages.length > 0) {
            this.createNewPartFromSelected();
        }

        // if we have any remaining pages, create one part per page
        if (this.visibleThumbnails) {
            this.visibleThumbnails.forEach(thumb => {
                let part =  { partNo: this.parts.length + 1, Pages: [] }
                part.Pages.push(thumb.page);

                let realThumb = this.thumbnails.find(x => x.page === thumb.page);
                if (realThumb) {
                    realThumb._isPartOfBatch = true;
                }

                this.parts.push(part);
            });
        }

        this.currentPart = null;
        this.currentThumbnail = null;

        // update image list because new images will be available for selection now
        this.visibleThumbnails = this.thumbnails.filter(x => x.page <= this.maxVisibleImages && !x._isPartOfBatch);
    }

    private autoSplitOnSplitPages(splitPages: Array<number>) {
        if(splitPages.length > 0) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Dele opp fil automatisk?',
                message: `Det ble funnet ${splitPages.length} skilleark i filen - vil du dele opp filen automatisk basert på disse?`
            });

            modal.onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    let part =  { partNo: this.parts.length + 1, Pages: [] }

                    for(let i = 1; i <= this.file.Pages; i++) {
                        let thumb = this.thumbnails.find(x => x.page === i);
                        if (thumb) {
                            thumb._isPartOfBatch = true;
                        }

                        part.Pages.push(thumb.page);

                        // create new part if this is the last page, or the page is a splitpage
                        if (i === this.file.Pages || splitPages.indexOf(i) !== -1) {
                            this.parts.push(part);
                            part = { partNo: this.parts.length + 1, Pages: [] }
                        }
                    }

                    this.currentPart = null;
                    this.currentThumbnail = null;

                    // update image list because new images will be available for selection now
                    this.visibleThumbnails = this.thumbnails.filter(x => x.page <= this.maxVisibleImages && !x._isPartOfBatch);

                    this.cdr.markForCheck();
                }
            });
        }
    }


    private rotateLeft(event) {
        // do rotations locally and keep track of rotation for later usage
        this.currentThumbnail._rotation =
            this.currentThumbnail._rotation > 0 ?
                this.currentThumbnail._rotation - 90 :
                270;
    }

    private rotateRight(event) {
        // do rotations locally and keep track of rotation for later usage
        this.currentThumbnail._rotation =
            this.currentThumbnail._rotation < 270 ?
                this.currentThumbnail._rotation + 90 :
                0;
    }

    private thumbnailFocused(thumbnail, index) {
        this.previousThumbnail = this.currentThumbnail;

        this.currentThumbnail = thumbnail;
        this.currentThumbnailIndex = index;

        if (this.currentThumbnail.page === this.maxVisibleImages && this.file.Pages > this.maxVisibleImages) {
            this.showMorePages();
        }
    }

    private thumbnailClicked(page: number, event = null) {
        if (event && event.shiftKey && this.previousThumbnail) {
            // mark all pages between previousThumbnail and the new one
            var low = this.previousThumbnail.page > this.currentThumbnail.page ? this.currentThumbnail.page : this.previousThumbnail.page;
            var high = this.previousThumbnail.page < this.currentThumbnail.page ? this.currentThumbnail.page : this.previousThumbnail.page;

            for(let i = low; i <= high; i++) {

                if (!this.currentPart.Pages.find(x => x === i) && !this.thumbnails.find(x => x.page === i)._isPartOfBatch) {
                    this.currentPart.Pages.push(i);
                }
            }

            this.currentPart.Pages = this.currentPart.Pages.sort((a, b) => a - b);
        } else {
            if (!this.currentPart.Pages.find(x => x === page)) {
                this.currentPart.Pages.push(page);
                this.currentPart.Pages = this.currentPart.Pages.sort((a, b) => a - b);
            } else {
                this.currentPart.Pages = this.currentPart.Pages.filter(x => x !== page);
            }
        }

        this.visibleThumbnails.forEach(thumb => {
            if (this.currentPart.Pages.find(y => y === thumb.page)) {
                thumb.class = 'is-selected';
            } else {
                thumb.class = '';
            }
        });
    }

    public showMorePages() {
        // TBD: consider doing this automatically to support "infinite scroll", something like this:
        // https://codepen.io/wernight/pen/YyvNoW
        this.maxVisibleImages += 25;

        this.visibleThumbnails = this.thumbnails.filter(x => x.page <= this.maxVisibleImages && !x._isPartOfBatch);
    }

    private getPagesFromPart(part: SplitPart) {
        if (part.Pages && part.Pages.length > 0)
            return part.Pages.join(', ');

        return 'Ingen valgt';
    }

    public splitFile() {
        if (this.currentPart && this.currentPart.Pages.length > 0) {
            this.createNewPartFromSelected()
        }

        let thumbnailsNotInPart = this.thumbnails.filter(x => !x._isPartOfBatch);

        if ((this.parts.length === 1 && thumbnailsNotInPart.length === 0) || (this.parts.length === 0)) {
            this.toastService.addToast(
                'Velg hvordan filen skal deles opp',
                ToastType.bad,
                ToastTime.medium,
                'Filen inneholder nå kun én del, og oppdeling vil derfor ikke ha noen effekt - du må dele opp filen i flere deler før du trykker på Del opp fil'
            );

            return;
        }

        if (thumbnailsNotInPart.length > 0) {
            // some images has not been selected in any part, add all remaining to a
            // new part before calling split - this will be a new document containing
            // all pages not selected in any parts yet
            this.currentPart = {partNo: this.parts.length + 1, Pages: []};

            thumbnailsNotInPart.forEach(thumb => {
                this.currentPart.Pages.push(thumb.page);
            });

            this.createNewPartFromSelected();
        }

        this.toastService.addToast(
            'Deler opp fil...',
            ToastType.good,
            ToastTime.short,
            'Dette kan ta litt tid, vennligst vent'
        );

        this.isSplitting = true;

        let rotations = [];
        this.thumbnails.forEach(thumb => {
            if (thumb._rotation && thumb._rotation !== 0) {
                rotations.push({Page: thumb.page, Rotation: thumb._rotation});
            }
        });

        this.uniFilesService.splitFileMultiple(this.file.StorageReference, this.parts, rotations, true)
            .subscribe(res => {
                // get the UE ids based on the result from UniFiles
                let ueFileIds = [];
                if (res && res.Parts) {
                    res.Parts.forEach(part => {
                        ueFileIds.push(part.ExternalId);
                    })
                }

                this.fileService.splitFileMultiple(this.file.ID, ueFileIds)
                    .subscribe(ueRes => {
                        this.toastService.addToast(
                            'Oppdeling ferdig',
                            ToastType.good,
                            ToastTime.short
                        );

                        this.isSplitting = false;

                        this.onClose.emit('ok');
                    }, err => {
                        this.errorService.handle(err);
                        this.isSplitting = false;
                    });
            }, err => {
                this.errorService.handle(err);
                this.isSplitting = false;
            });
    }

    public close() {
        if (this.parts.length > 0 || (this.currentPart && this.currentPart.Pages.length > 0)) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Du har ikke delt opp enda',
                message: 'Du har markert at du vil dele opp filen, men har ikke trykke på Del opp fil - endringene er derfor ikke lagret. Vil du fortsette likevel?'
            });

            modal.onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.onClose.emit('cancel');
                }
            });
        } else {
            this.onClose.emit('cancel');
        }
    }
}

export interface ThumbnailData {
    url: string;
    page: number;
    class: string;
    _isloaded: boolean;
    _isPartOfBatch: boolean;
    _rotation: number;
}

export interface SplitPart {
    partNo: number;
    Pages: Array<number>;
}
