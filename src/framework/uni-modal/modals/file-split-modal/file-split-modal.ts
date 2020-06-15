import {Component, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {File} from '@uni-entities';
import {environment} from 'src/environments/environment';
import {AuthService} from '@app/authService';
import {ErrorService, FileService, UniFilesService} from '@app/services/services';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {KeyCodes} from '@app/services/common/keyCodes';
import {UniModalService} from '../../modalService';

@Component({
    selector: 'file-split-modal',
    templateUrl: './file-split-modal.html',
    styleUrls: ['./file-split-modal.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileSplitModal implements IUniModal {
    @ViewChild('thumbnailcontainer', { static: true }) thumbnailContainer;
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter(false);

    public file: File;
    public thumbnails: ThumbnailData[] = [];
    public visibleThumbnails: ThumbnailData[] = [];
    public currentPart: SplitPart = {partNo: 1, Pages: []};
    public parts: SplitPart[] = [];
    private baseUrl: string = environment.BASE_URL_FILES;
    private previousThumbnail: ThumbnailData;
    public currentThumbnail: ThumbnailData;
    public currentThumbnailIndex: number;

    public processingPercentage: number;
    private hasFocusedOnFirstThumbnail: boolean = false;
    public isSplitting: boolean = false;

    numberOfVisibleImages = 10; // used in template

    constructor(
        private cdr: ChangeDetectorRef,
        private fileService: FileService,
        private authService: AuthService,
        private uniFilesService: UniFilesService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.file = this.options.data;
        if (this.file) {
            this.thumbnails = [];
            this.uniFilesService.forceFullLoad(this.file.StorageReference).subscribe(
                () => {
                    // poll for status on full load
                    this.checkFileStatusAndLoadImage();
                },
                err => this.errorService.handle(err)
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

                    this.thumbnails = this.getImageUrls(this.file, 400);
                    this.visibleThumbnails = this.thumbnails;

                    this.focusOnFirstThumbnail();

                    if (!res.SplitPages) {
                        this.uniFilesService.getFileSplitList(this.file.StorageReference)
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
                            let thumbnails = this.getImageUrls(this.file, 400, processedPages);
                            let newThumbnails = thumbnails.slice(this.thumbnails.length);

                            this.focusOnFirstThumbnail();

                            newThumbnails.forEach(thumb => this.thumbnails.push(thumb));

                            this.visibleThumbnails = this.thumbnails;
                            this.cdr.markForCheck();
                        }
                    }

                    // increase wait time by 10 ms for each attempt, starting at 50 ms, making
                    // the total possible wait time will be approx 1 minute (55 sec + response time)
                    const timeout = 50 + (10 * attempts);
                    setTimeout(() => {
                        this.checkFileStatusAndLoadImage(attempts + 1);
                    }, timeout);
                }
            });
    }

    private focusOnFirstThumbnail () {
        if(!this.hasFocusedOnFirstThumbnail) {
            setTimeout(() => {
                if (this.thumbnailContainer && this.thumbnailContainer.nativeElement) {
                    let element = this.thumbnailContainer.nativeElement.querySelectorAll('.thumbnail');
                    if (element && element.length > 0) {
                        element[0].focus();
                        this.hasFocusedOnFirstThumbnail = true;
                    }
                }
            });
        }
    }

    private focusOnNextThumbnail () {
        if(this.currentThumbnailIndex !== null && this.currentThumbnailIndex !== undefined) {
            if (this.thumbnailContainer && this.thumbnailContainer.nativeElement) {
               let element = this.thumbnailContainer.nativeElement.querySelectorAll('.thumbnail');
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
                let element = this.thumbnailContainer.nativeElement.querySelectorAll('.thumbnail');
                if (element && element.length > 0 && this.currentThumbnailIndex > 0) {
                    this.currentThumbnailIndex = this.currentThumbnailIndex - 1;
                    element[this.currentThumbnailIndex].focus();
                    this.cdr.markForCheck();
                }
            }
        }
    }

    private getImageUrls(file: File, width: number, maxPageNo: number = null): Array<ThumbnailData> {
        const pageUrls: ThumbnailData[] = [];

        for (let i = 0; i < file.Pages && (!maxPageNo || i < maxPageNo); i++) {
            const url = `${this.baseUrl}/api/image`
                + `?key=${this.authService.activeCompany.Key}`
                + `&id=${file.StorageReference}`
                + `&width=${1200}`
                + `&page=${i + 1}`;

            pageUrls.push({
                page: i + 1,
                url: encodeURI(url),
                class: '',
                _isPartOfBatch: false,
            });
        }

        return pageUrls;
    }

    public clear() {
        this.parts = [];
        this.currentPart = {partNo: 1, Pages: []};
        this.visibleThumbnails = this.thumbnails;

        this.visibleThumbnails.forEach(thumb => {
            thumb._isPartOfBatch = false;
            thumb.class = '';
        });

        // reset focus when a part has been removed because the image list
        // is refreshed (images in the new part is removed)
        this.hasFocusedOnFirstThumbnail = false;
        this.focusOnFirstThumbnail();
    }

    public onKey(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.SPACE) {
            this.thumbnailClicked(this.currentThumbnail.page);
            event.preventDefault();
        } else if (event.keyCode === KeyCodes.RIGHT_ARROW) {
            if (event.shiftKey) {
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
            this.focusOnPreviousThumbnail();
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

    public createNewPartFromSelected() {
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
            this.visibleThumbnails = this.thumbnails.filter(x => !x._isPartOfBatch);

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

    public removePart(part: SplitPart) {
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
        this.visibleThumbnails = this.thumbnails.filter(x => !x._isPartOfBatch);

        // reset focus when a part has been removed because the image list
        // is refreshed (images in the new part is removed)
        this.hasFocusedOnFirstThumbnail = false;
        this.focusOnFirstThumbnail();
    }

    public clearCurrentPart() {
        this.currentPart.Pages.forEach(page => {
            let thumb = this.thumbnails.find(x => x.page === page);
            if (thumb) {
                thumb.class = '';
            }
        });

        this.currentPart.Pages = [];
    }

    public splitRemainingPerPage() {
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
        this.visibleThumbnails = this.thumbnails.filter(x => !x._isPartOfBatch);
    }

    private autoSplitOnSplitPages(splitPages: Array<number>) {
        if (splitPages.length > 0) {
            const modal = this.modalService.confirm({
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
                    this.visibleThumbnails = this.thumbnails.filter(x => !x._isPartOfBatch);

                    this.cdr.markForCheck();
                }
            });
        }
    }

    public thumbnailFocused(thumbnail, index) {
        this.previousThumbnail = this.currentThumbnail;

        this.currentThumbnail = thumbnail;
        this.currentThumbnailIndex = index;
    }

    public thumbnailClicked(page: number, event = null) {
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

    public getPagesFromPart(part: SplitPart) {
        if (part.Pages && part.Pages.length) {
            return 'Side ' + part.Pages.join(', ');
        }

        return 'Ingen sider valgt';
    }

    public splitFile() {
        if (this.currentPart && this.currentPart.Pages.length > 0) {
            this.createNewPartFromSelected();
        }

        const thumbnailsNotInPart = this.thumbnails.filter(x => !x._isPartOfBatch);

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


        this.uniFilesService.splitFileMultiple(this.file.StorageReference, this.parts, []).subscribe(
            res => {
                // get the UE ids based on the result from UniFiles
                const ueFileIds = [];
                if (res && res.Parts) {
                    res.Parts.forEach(part => {
                        ueFileIds.push(part.ExternalId);
                    });
                }

                this.fileService.splitFileMultiple(this.file.ID, ueFileIds).subscribe(
                    ueRes => {
                        this.toastService.addToast(
                            'Oppdeling ferdig',
                            ToastType.good,
                            ToastTime.short
                        );

                        this.isSplitting = false;

                        this.onClose.emit('ok');
                    },
                    err => {
                        this.errorService.handle(err);
                        this.isSplitting = false;
                    }
                );
            },
            err => {
                this.errorService.handle(err);
                this.isSplitting = false;
            }
        );
    }

    public close() {
        if (this.parts.length > 0 || (this.currentPart && this.currentPart.Pages.length > 0)) {
            const modal = this.modalService.confirm({
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
    _isPartOfBatch: boolean;
}

export interface SplitPart {
    partNo: number;
    Pages: Array<number>;
}
