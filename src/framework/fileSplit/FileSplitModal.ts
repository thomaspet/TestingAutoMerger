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

@Component({
    selector: 'file-split-modal',
    template: `
        <section
            role="dialog"
            class="uni-modal account_detail_modal_size"
            (keyup)="onKey($event)">

            <header><h1>Del opp fil</h1></header>
            <article class="image-split-modal-body">
                <div class="parts">
                    <div *ngIf="processingPercentage" class="images_loading">
                        Prosesserer fil, {{processingPercentage}}% ferdig...
                    </div>

                    <strong *ngIf="thumbnails.length > 0">Foreslått oppdeling:</strong>
                    <p *ngIf="thumbnails.length > 0">Klikk på første side i hvert dokument</p>

                    <ul>
                        <li *ngFor="let part of parts">Dokument {{part.partNo}}: Side {{part.pageFrom}} til {{part.pageTo}}</li>
                    </ul>

                    <p *ngIf="parts.length > 0">
                        Kontroller at oppdelingen blir riktig i listen over. Hvis du har valgt en side ved en
                        feil kan du klikke en gang til på samme fil for å angre oppdelingen.
                        Du kan også bruke piltastene og mellomromtasten for å markere hvor filene skal deles.
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
                                width="400" />
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
                            (click)="thumbnailClicked(thumbnail.page)"
                            (focus)="thumbnailFocused(thumbnail, idx)"
                            tabindex="0">
                            <div class="thumbnail">
                                <img [attr.src]="thumbnail.url"
                                    (load)="finishedLoadingThumbnail(thumbnail)"
                                    [attr.alt]="thumbnail.page"
                                    [class.loading]="!thumbnail._isloaded"
                                    width="150" />
                                <div class="pageno">Side {{thumbnail.page}}</div>
                            </div>
                        </li>
                        <button (click)="showMorePages()" *ngIf="thumbnails.length > maxVisibleImages">Vis flere</button>
                    </div>
                </div>
            </article>
            <footer>
                <button [attr.aria-busy]="isSplitting" (click)="splitFile()" class="good">Del opp fil</button>
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
    private parts: SplitPart[] = [];
    private baseUrl: string = environment.BASE_URL_FILES;
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
        private errorService: ErrorService
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
                    this.visibleThumbnails = this.thumbnails.filter(x => x.page < this.maxVisibleImages);

                    this.focusOnFirstThumbnail();

                    if (!this.parts
                        || this.parts.length === 0
                        || this.parts[this.parts.length - 1].pageTo !== this.file.Pages) {
                        this.parts.push({pageFrom: 1, pageTo: this.file.Pages, partNo: 1});
                        this.thumbnails[0].class = 'first-in-part';
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

                            this.visibleThumbnails = this.thumbnails.filter(x => x.page < this.maxVisibleImages);
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
                if (element && element.length > this.currentThumbnailIndex) {
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
            pageUrls.push({page: i+1, url: encodeURI(url), class: '', _isloaded: false});
        }

        return pageUrls;
    }

    private clear() {
        this.parts = [];
        this.parts.push({pageFrom: 1, pageTo: this.file.Pages, partNo: 1});
        this.visibleThumbnails.forEach(thumb => thumb.class = thumb.page === 1 ? 'first-in-part' : '');
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
        }
    }

    private rotateLeft(event) {
        this.uniFilesService.rotate(this.file.StorageReference, this.currentThumbnail.page, false)
            .subscribe(res => {
                if (this.currentThumbnail.url.indexOf('&t=') !== -1) {
                    this.currentThumbnail.url = this.currentThumbnail.url.substring(0, this.currentThumbnail.url.indexOf('&t='));
                }
                this.currentThumbnail.url += '&t=' + Date.now();
                this.cdr.markForCheck();

                // reset focus on thumbnail after rotating
                this.focusOnCurrentThumbnail();
            }, err => this.errorService.handle(err)
        );
    }

    private rotateRight(event) {
        this.uniFilesService.rotate(this.file.StorageReference, this.currentThumbnail.page, true)
            .subscribe(res => {
                if (this.currentThumbnail.url.indexOf('&t=') !== -1) {
                    this.currentThumbnail.url = this.currentThumbnail.url.substring(0, this.currentThumbnail.url.indexOf('&t='));
                }
                this.currentThumbnail.url += '&t=' + Date.now();
                this.cdr.markForCheck();

                // reset focus on thumbnail after rotating
                this.focusOnCurrentThumbnail();
            }, err => this.errorService.handle(err)
        );
    }

    private thumbnailFocused(thumbnail, index) {
        this.currentThumbnail = thumbnail;
        this.currentThumbnailIndex = index;
    }

    private thumbnailClicked(page: number) {
        if (this.parts.length === 0) {
            this.parts.push({pageFrom: 1, pageTo: page - 1, partNo: 1});
            if (this.file.Pages >= page) {
                this.parts.push({pageFrom: page, pageTo: this.file.Pages, partNo: null});
            }
        } else {

            let partWithPageNoInBetween = this.parts.find(x => x.pageFrom < page && x.pageTo > page);

            if (partWithPageNoInBetween) {
                this.parts.push({pageFrom: page, pageTo: partWithPageNoInBetween.pageTo, partNo: null});
                partWithPageNoInBetween.pageTo = page - 1;
            } else if (this.parts.find(x => x.pageFrom === page) && page > 1) {
                let partWithPageAsFrom = this.parts.find(x => x.pageFrom === page);

                // exists larger part? merge with the current part
                let previousPart = this.parts.find(x => x.pageTo === page - 1);
                if (previousPart) {
                    previousPart.pageTo = partWithPageAsFrom.pageTo;
                }

                this.parts = this.parts.filter(x => x !== partWithPageAsFrom);
            } else if (this.parts.find(x => x.pageTo === page) && page > 1) {
                let partWithPageAsTo = this.parts.find(x => x.pageTo === page);
                partWithPageAsTo.pageTo = page - 1;
                this.parts.push({pageFrom: page, pageTo: page, partNo: 0});
            }
        }

        let parts = this.parts.sort((x, y) => x.pageFrom - y.pageFrom);
        for(let i = 0; i < parts.length; i++) {
            parts[i].partNo = i + 1;
        }

        this.parts = parts;

        this.visibleThumbnails.forEach(thumb => {
            if (this.parts.find(y => y.pageFrom === thumb.page) && this.parts.find(y => y.pageTo === thumb.page)) {
                thumb.class = 'first-in-part last-in-part';
            } else if (this.parts.find(y => y.pageFrom === thumb.page)) {
                thumb.class = 'first-in-part';
            } else if (this.parts.find(y => y.pageTo === thumb.page)) {
                thumb.class = 'last-in-part';
            } else {
                thumb.class = '';
            }
        });
    }

    public showMorePages() {
        // TBD: consider doing this automatically to support "infinite scroll", something like this:
        // https://codepen.io/wernight/pen/YyvNoW
        this.maxVisibleImages += 25;

        this.visibleThumbnails = this.thumbnails.filter(x => x.page < this.maxVisibleImages);

        this.visibleThumbnails.forEach(thumb => {
            if (this.parts.find(y => y.pageFrom === thumb.page) && this.parts.find(y => y.pageTo === thumb.page)) {
                thumb.class = 'first-in-part last-in-part';
            } else if (this.parts.find(y => y.pageFrom === thumb.page)) {
                thumb.class = 'first-in-part';
            } else if (this.parts.find(y => y.pageTo === thumb.page)) {
                thumb.class = 'last-in-part';
            }
        });
    }

    public splitFile() {
        if (this.parts.length <= 1) {
            this.toastService.addToast(
                'Velg hvordan filen skal deles opp',
                ToastType.bad,
                ToastTime.medium,
                'Du må klikke på flere sider for å velge hvordan filen skal deles opp'
            );

            return;
        }

        let partFromPages = [];
        this.parts.forEach(part => partFromPages.push(part.pageFrom));

        this.toastService.addToast(
            'Deler opp fil...',
            ToastType.good,
            ToastTime.short,
            'Dette kan ta litt tid, vennligst vent'
        );

        this.isSplitting = true;

        this.uniFilesService.splitFileMultiple(this.file.StorageReference, partFromPages, true)
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
        this.onClose.emit('cancel');
    }
}

export interface ThumbnailData {
    url: string;
    page: number;
    class: string;
    _isloaded: boolean;
}

export interface SplitPart {
    partNo: number;
    pageFrom: number;
    pageTo: number;
}
