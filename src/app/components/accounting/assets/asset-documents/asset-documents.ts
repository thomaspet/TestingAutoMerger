import {Component, ViewChild} from '@angular/core';
import {map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {safeInt} from '@app/components/common/utils/utils';
import {Asset, DepreciationLine} from '@uni-entities';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {AssetsStore, IAssetState} from '@app/components/accounting/assets/assets.store';
import {ActivatedRoute, Router} from '@angular/router';
import {ErrorService} from '@app/services/common/errorService';
import {Observable, Subject} from 'rxjs';
import {FileFromInboxModal, UniModalService} from '@uni-framework/uni-modal';
import {StatusCode} from '@app/components/sales/salesHelper/salesEnums';
import {UniImage} from '@uni-framework/uniImage/uniImage';
import {FileService} from '@app/services/common/fileService';

@Component({
    selector: 'uni-asset-details-documents',
    templateUrl: './asset-documents.html'
})
export class AssetDocumentsComponent {
    @ViewChild(UniImage, { static: true }) uniImage: UniImage;
    supplierInvoiceID: number;
    state$: Observable<IAssetState>;
    numberOfDocuments = 0;
    files = [];
    startUpFileIDs = [];
    unlinkedFiles = [];
    documentsInUse = [];
    hasUploaded = false;
    onDestroy$ = new Subject();
    constructor(
        private assetsActions: AssetsActions,
        private assetsStore: AssetsStore,
        private route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private fileService: FileService
    ) {
        this.state$ = this.assetsStore.state$;
    }

    ngOnInit() {
        this.route.parent.params.pipe(
            takeUntil(this.onDestroy$),
            map(params => safeInt(params.id)),
        ).subscribe((id: number) => {
            if (id === 0) {
                this.assetsStore.assetIsDirty = false;
                this.route.queryParams.pipe(take(1)).subscribe((params) => {
                    this.supplierInvoiceID = params.supplierInvoiceID
                        || (this.assetsStore.currentAsset && this.assetsStore.currentAsset['_supplierInvoiceID'])
                        || 0;
                    let source: any = this.assetsActions.getNewAsset().pipe(take(1));
                    if (this.supplierInvoiceID) {
                        source = this.assetsActions.createAsset(this.supplierInvoiceID).pipe(take(1))
                        this.assetsStore.assetIsDirty = true;
                    }
                    source.subscribe(asset => {
                        this.startUpFileIDs = asset['_files'] ? asset['_files'].map(x => x.ID) : [];
                        this.assetsStore.currentAsset = asset;
                    });
                });
            } else {
                this.assetsActions.getAsset(id).pipe(take(1))
                    .subscribe((asset: Asset) => {
                        this.startUpFileIDs = asset['_files'] ? asset['_files'].map(x => x.ID) : [];
                        this.assetsStore.currentAsset = asset;
                    });
            }
        },  error => this.errorService.handle(error));
    }

    public openAddFileModal() {
        this.modalService.open(FileFromInboxModal).onClose.subscribe(file => {
            if (!file) {
                return;
            }

            const asset = this.assetsStore.currentAsset;
            if (asset.ID) {
                this.linkFiles(asset.ID, [file.ID], StatusCode.Completed).then(() => {
                    this.numberOfDocuments++;
                    this.uniImage.refreshFiles();
                });
            } else {
                if (asset['_files']?.length) {
                    this.uniImage.fetchDocumentWithID(safeInt(file.ID));
                } else {
                    this.startUpFileIDs = this.startUpFileIDs.concat([safeInt(file.ID)]);
                    if (!asset['_files']) {
                        asset['_files'] = [];
                    }
                    asset['_files'] = asset['_files'].concat([file]);
                }
                this.unlinkedFiles = asset['_files'].map(f => f.ID);
                this.numberOfDocuments++;
                this.assetsStore.assetIsDirty = true;
            }
        });
    }
    onImageDeleted(file: any) {
        const index = this.files.findIndex(f => f.ID === file.ID);
        const asset = this.assetsStore.currentAsset;
        if (index >= 0) {
            // Remove file from all arrays holding it
            asset['_files'].splice(index, 1);
            if (asset['_files'].length === 0) {
                this.resetDocuments();
            } else {
                this.unlinkedFiles = asset['_files'].map(f => f.ID);
                this.documentsInUse = this.unlinkedFiles;
                this.numberOfDocuments--;
            }
        }
    }

    public imageUnlinked(file: any) {
        this.tagFileStatus(file.ID, 0);
    }

    private tagFileStatus(fileID: number, flagFileStatus: number) {
        this.fileService.getStatistics(
            'model=filetag&select=id,tagname as tagname&top=1&orderby=ID asc&filter=deleted eq 0 and fileid eq ' + fileID
        ).subscribe(tags => {
            let tagname;
            if (tags.Data.length) {
                tagname = tags.Data[0].tagname;
            }
            if (tagname) {
                this.fileService.tag(fileID, tagname, flagFileStatus).subscribe(
                    () => {},
                    err => this.errorService.handle(err)
                );
            }
        });
    }


    private resetDocuments() {
        this.unlinkedFiles = [];
        this.documentsInUse = [];
        this.numberOfDocuments = 0;
        this.hasUploaded = false;
    }

    private linkFiles(ID: any, fileIDs: Array<any>, flagFileStatus?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fileIDs.forEach(fileID => {
                if (flagFileStatus) {
                    this.tagFileStatus(fileID, flagFileStatus);
                }
                this.assetsActions.linkFile(ID, fileID).subscribe(x => resolve(x));
            });
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
