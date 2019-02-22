import {Component} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {Project, File} from '@uni-entities';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {ImageModal} from '../../../common/modals/ImageModal';
import {UniImageSize} from '@uni-framework/uniImage/uniImage';
import {UniModalService} from '@uni-framework/uni-modal';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {
    ProjectService,
    ErrorService,
    StatisticsService,
    FileService
} from '@app/services/services';

declare var _;

@Component({
    selector: 'project-document',
    templateUrl: './document.html'
})
export class ProjectDocument {
    project: Project;
    tableConfig: UniTableConfig;
    documents: File[];

    private onDestroy$: Subject<any> = new Subject();

    constructor(
        private projectService: ProjectService,
        private statisticsService: StatisticsService,
        private fileService: FileService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private modalService: UniModalService
    ) {
        this.setupDocumentsTable();
    }

    public ngOnInit() {
        this.projectService.currentProject.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(project => {
            this.project = project;
            if (project) {
                this.loadDocumentList();
            }
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private loadBasedOn(register: string) {
        return this.statisticsService
            .GetAllUnwrapped(
                `model=File&` +
                `select=ID,Name,FileEntityLink.EntityID as EntityID,FileEntityLink.EntityType as EntityType`
                + `,FileEntityLink.EntityID as Customer${register}ID,Customer${register}.${register}Number `
                + `as Customer${register}Number&` +
                `join=File.ID eq FileEntityLink.FileID and FileEntityLink.EntityID eq Customer${register}.ID `
                + `and Customer${register}.DefaultDimensionsID eq Dimensions.ID&` +
                `filter=FileEntityLink.EntityType eq 'Customer${register}' and Dimensions.ProjectID `
                + `eq ${this.project.ID}&` +
                `orderby=Name desc`);
    }

    private loadCurrentProject() {
        return this.statisticsService.GetAllUnwrapped(
            `model=File&` +
            `select=ID,Name,FileEntityLink.EntityID as EntityID,FileEntityLink.EntityType as EntityType&` +
            `join=File.ID eq FileEntityLink.FileID and FileEntityLink.EntityID eq Project.ID&` +
            `filter=FileEntityLink.EntityType eq 'Project' and FileEntityLink.EntityID eq ${this.project.ID}&` +
            `orderby=Name desc`
        );
    }

    private loadDocumentList() {
        if (!this.project || !this.project.ID) {
            return;
        }

        Observable.forkJoin(
            this.loadBasedOn('Invoice'),
            this.loadBasedOn('Order'),
            this.loadBasedOn('Quote'),
            this.loadCurrentProject()
        ).subscribe(response => {
            this.documents = _.flatten(response);
        });
    }

    private setupDocumentsTable() {
        // Define columns to use in the table
        const nameCol = new UniTableColumn('FileName', 'Navn', UniTableColumnType.Text)
            .setOnCellClick(row => this.previewDocument(row));
        const invoiceCol = new UniTableColumn('CustomerInvoiceNumber', 'Faktura', UniTableColumnType.Link)
            .setWidth('6rem', false)
            .setLinkResolver(row => `/sales/invoices/${row.CustomerInvoiceID}`);

        const orderCol = new UniTableColumn('CustomerOrderNumber', 'Ordre', UniTableColumnType.Link)
            .setWidth('6rem', false)
            .setLinkResolver(row => `/sales/orders/${row.CustomerOrderID}`);

        const quoteCol = new UniTableColumn('CustomerQuoteNumber', 'Tilbud', UniTableColumnType.Link)
            .setWidth('6rem', false)
            .setLinkResolver(row => `/sales/quotes/${row.CustomerQuoteID}`);

        // Setup table
        this.tableConfig = new UniTableConfig('sales.project.documents', false, false, 25)
            .setSearchable(true)
            .setDeleteButton(true)
            .setColumns([nameCol, invoiceCol, orderCol, quoteCol]);
    }

    // Handlers
    public onRowDeleted(file) {
        this.fileService.deleteOnEntity(file.EntityType, file.EntityID, file.FileID)
            .subscribe(
                () => {
                    this.toastService.addToast('Fil slettet', ToastType.good, ToastTime.short);
                    this.loadDocumentList();
                },
                err => this.errorService.handle(err)
            );
    }

    public previewDocument(row) {
        if (row.FileID) {
            const data = {
                entity: row.EntityType,
                entityID: row.EntityID,
                fileIDs: null,
                showFileID: row.FileID,
                readonly: true,
                size: UniImageSize.large
            };

            this.modalService.open(ImageModal, { data: data });
        }
    }

    public onFileUploaded() {
        this.loadDocumentList();
    }
}
