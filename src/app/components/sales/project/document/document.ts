import { Component, ViewChild } from '@angular/core';
import { Project } from '../../../../unientities';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '../../../../../framework/ui/unitable/index';
import { ImageModal } from '../../../common/modals/ImageModal';
import { UniImage, UniImageSize } from '../../../../../framework/uniImage/uniImage';
import {
    ProjectService,
    ErrorService,
    StatisticsService
} from '../../../../services/services';

@Component({
    selector: 'project-document',
    templateUrl: './document.html'
})

export class ProjectDocument {
    @ViewChild(ImageModal) public imageModal: ImageModal;

    private project: Project;

    //Table
    private tableConfig: UniTableConfig;
    private documents$: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(
        private projectService: ProjectService, 
        private statisticsService: StatisticsService)
    {
        this.setupDocumentsTable();
    }

    public ngOnInit() {
        this.projectService.currentProject.subscribe(
            (project) => {
                this.project = project;
                if (project) {
                    this.loadDocumentList();
                }
            }
        );
    }

    private loadBasedOn(register: string) {
        return this.statisticsService
            .GetAllUnwrapped(
                `model=File&` +
                `select=ID,Name,FileEntityLink.EntityID as EntityID,FileEntityLink.EntityType as EntityType,FileEntityLink.EntityID as Customer${register}ID,Customer${register}.${register}Number as Customer${register}Number&` +
                `join=File.ID eq FileEntityLink.FileID and FileEntityLink.EntityID eq Customer${register}.ID and Customer${register}.DefaultDimensionsID eq Dimensions.ID&` +
                `filter=FileEntityLink.EntityType eq 'Customer${register}' and Dimensions.ProjectID eq ${this.project.ID}&` +
                `orderby=Name desc`);
    }

    private loadDocumentList() {
        Observable.forkJoin(
            this.loadBasedOn('Invoice'),
            this.loadBasedOn('Order'),
            this.loadBasedOn('Quote')
        ).subscribe((response: Array<any>) => {
            let documents = response[0].concat(response[1]).concat(response[2]);
            this.documents$.next(documents);
        });
    }

    private setupDocumentsTable() {
        // Define columns to use in the table
        let nameCol = new UniTableColumn('FileName', 'Navn', UniTableColumnType.Text);
        let invoiceCol = new UniTableColumn('CustomerInvoiceNumber', 'Faktura', UniTableColumnType.Text)
            .setTemplate((document) => {
                return document.CustomerInvoiceID ? 
                    `<a href='/#/sales/invoices/${document.CustomerInvoiceID}'>${document.CustomerInvoiceNumber || 'kladd'}</a>`
                    : '';
            });
        let orderCol = new UniTableColumn('CustomerOrderNumber', 'Ordre', UniTableColumnType.Text)
            .setTemplate((document) => {
                return document.CustomerOrderID ? 
                    `<a href='/#/sales/orders/${document.CustomerOrderID}'>${document.CustomerOrderNumber || 'kladd'}</a>`
                    : '';
            });
        let quoteCol = new UniTableColumn('CustomerQuoteNumber', 'Tilbud', UniTableColumnType.Text)
            .setTemplate((document) => {
                return document.CustomerQuoteID ?
                    `<a href='/#/sales/quotes/${document.CustomerQuoteID}'>${document.CustomerQuoteNumber || 'kladd'}</a>`
                    : '';
            });

        // Setup table
        this.tableConfig = new UniTableConfig(false, false, 25)
            .setSearchable(true)
            .setColumns([nameCol, invoiceCol, orderCol, quoteCol]);
    }

    public onRowSelected(file) {
        if (file.FileID) {
            this.imageModal.openReadOnly(file.EntityType, file.EntityID, file.FileID, UniImageSize.large);
        }
    }
}
