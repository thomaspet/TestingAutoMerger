import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {of, forkJoin} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import * as moment from 'moment';

import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {SellerService, CompanySettingsService, ErrorService} from '@app/services/services';
import {Seller, BatchInvoice, BatchInvoiceOperation, LocalDate} from '@uni-entities';
import {FieldType} from '@uni-framework/ui/uniform';
import {BatchInvoiceService} from '@app/services/sales/batchInvoiceService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

export interface BatchInvoiceModalOptions {
    entityType: 'CustomerOrder' | 'CustomerInvoice';
    itemIDs: number[];
}

@Component({
    selector: 'batch-invoice-modal',
    templateUrl: './batch-invoice-modal.html',
    styleUrls: ['./batch-invoice-modal.sass']
})
export class BatchInvoiceModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean;
    batchInvoice: BatchInvoice;
    formFields: any[];

    numberOfItems: number;
    entityType: 'CustomerOrder' | 'CustomerInvoice';
    entityLabel: string;
    itemIDs: number[];

    canDistribute: boolean;

    constructor(
        private router: Router,
        private batchInvoiceService: BatchInvoiceService,
        private companySettingsService: CompanySettingsService,
        private sellerService: SellerService,
        private errorService: ErrorService,
        private toastService: ToastService,
    ) {}

    ngOnInit() {
        this.busy = true;

        forkJoin(
            this.companySettingsService.getCompanySettings(['Distributions']),
            this.sellerService.GetAll().pipe(catchError(() => of([])))
        ).subscribe(([settings, sellers]) => {
            const data: BatchInvoiceModalOptions = this.options.data || {};
            this.entityType = data.entityType;
            this.entityLabel = data.entityType === 'CustomerOrder' ? 'ordre' : 'fakturakladder';
            this.itemIDs = data.itemIDs;
            this.numberOfItems = data.itemIDs.length;

            this.batchInvoice = <BatchInvoice> {};

            this.batchInvoice.Operation = 0;
            this.batchInvoice.SellerID = 0;
            this.batchInvoice.YourRef = '';
            this.batchInvoice.InvoiceDate = new LocalDate(new Date());
            this.batchInvoice.MinAmount = settings.BatchInvoiceMinAmount || 0;

            const dueDate = moment(new Date()).add(settings.CustomerCreditDays, 'days').toDate();
            this.batchInvoice.DueDate = new LocalDate(dueDate);

            this.formFields = this.getFormFields(sellers || [], data.entityType);

            this.canDistribute = settings.AutoDistributeInvoice
                && !!settings.Distributions && !!settings.Distributions.CustomerInvoiceDistributionPlanID;

            this.busy = false;
        });
    }

    saveBatchInvoice() {
        // Because dropdown doesn't allow an item with ID eq null
        if (this.batchInvoice.SellerID === 0) {
            this.batchInvoice.SellerID = null;
        }

        this.busy = true;
        this.batchInvoiceService.Post(this.batchInvoice).subscribe(
            (batchInvoice: BatchInvoice) => {
                this.batchInvoiceService.addItems(batchInvoice.ID, this.itemIDs, this.entityType).pipe(
                    switchMap(() => this.batchInvoiceService.startInvoicing(batchInvoice.ID))
                ).subscribe(
                    () => {
                        setTimeout(() => {
                            this.toastService.toast({
                                title: `Samlefakturering av ${this.numberOfItems} ${this.entityLabel} startet`,
                                type: ToastType.info,
                                duration: 5
                            });

                            this.onClose.emit(true);
                        }, 250);
                    },
                    err => {
                        this.errorService.handle(err);
                        // Remove the batch invoice if addItem or invoice action fails.
                        // So we don't end up with "dead" batchinvoices with no items
                        this.batchInvoiceService.Remove(batchInvoice.ID).subscribe(
                            () => this.busy = false,
                            () => this.busy = false
                        );
                    }
                );
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    goToDistributionSettings() {
        this.router.navigateByUrl('/settings/distribution');
        this.onClose.emit(false);
    }

    private getFormFields(sellers: Seller[], entityType: string) {
        const entityLabel = entityType === 'CustomerOrder' ? 'ordre' : 'fakturakladd';

        return [
            {
                Property: 'InvoiceDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Fakturadato'
            },
            {
                Property: 'DueDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato'
            },
            {
                Property: 'MinAmount',
                FieldType: FieldType.NUMERIC,
                Label: 'Minimumsbeløp'
            },
            {
                Property: 'Operation',
                FieldType: FieldType.DROPDOWN,
                Label: 'Antall faktura',
                Options: {
                    source:  [
                        {ID: BatchInvoiceOperation.OneInvoiceEachCustomer, Name: `En faktura per kunde`},
                        {ID: BatchInvoiceOperation.OneInvoiceEachOrder, Name: `En faktura per ${entityLabel}`},
                        {ID: BatchInvoiceOperation.OneInvoiceEachProject, Name: `En faktura per prosjekt`},
                    ],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    hideDeleteButton: true
                }
            },
            {
                Property: 'SellerID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Selger',
                Options: {
                    source: [{ID: 0, Name: `Hentes fra ${entityLabel}`}, ...sellers],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    hideDeleteButton: true
                }
            },
            {
                Property: 'OurRef',
                FieldType: FieldType.TEXT,
                Label: 'Vår refereranse',
                Placeholder: `Hentes fra ${entityLabel}`
            },
            {
                Property: 'YourRef',
                FieldType: FieldType.TEXT,
                Label: 'Deres refereranse',
                Placeholder: `Hentes fra ${entityLabel}`
            },
            {
                Property: 'FreeTxt',
                FieldType: FieldType.TEXTAREA,
                Label: 'Fritekst'
            },
        ];
    }
}
