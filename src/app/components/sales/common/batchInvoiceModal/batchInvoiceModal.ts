import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import { Output, EventEmitter, Component, Input, ViewChild } from '@angular/core';
import { BatchInvoiceService } from '@app/services/sales/batchInvoiceService';
import { BatchInvoice, LocalDate, BatchInvoiceItem } from '@uni-entities';
import step2FormConfig from './step2-form-config';
import * as moment from 'moment';
import { MatStepper } from '@angular/material';
import { SellerService } from '@app/services/sales/sellerService';
import { GuidService } from '@app/services/common/guidService';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { forkJoin } from 'rxjs';
import { DistributionPlanService } from '@app/services/common/distributionService';
import { Router } from '@angular/router';

@Component({
    selector: 'batch-invoice-modal',
    templateUrl: './batchInvoiceModal.html'
})
export class BatchInvoiceModal implements IUniModal {
    @Input() public options: IModalOptions;

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(MatStepper) stepper: MatStepper;

    public batchInvoice: BatchInvoice;
    public entityType: 'order' |'invoice';
    public items: any[];
    public fields = [];
    public currentStep = 1;
    public totalSteps = 4;
    public numberOfItems = 0;
    public totalAmount = 0.0;
    public settings;
    public hasDistributionPlans = false;

    constructor(
        private router: Router,
        private batchInvoiceService: BatchInvoiceService,
        private sellerService: SellerService,
        private guidService: GuidService,
        private companySettings: CompanySettingsService,
        private distributionPlanService: DistributionPlanService
    ) {
        this.batchInvoice = new BatchInvoice();
        this.batchInvoice._createguid = this.guidService.guid();
        this.batchInvoice.Items = [];
    }

    public ngOnInit() {
        this.items = this.options.data.items;
        this.entityType = this.options.data.entityType;
        this.batchInvoice.Items = this.items.map(x => {
            const item = new BatchInvoiceItem();
            item._createguid = this.guidService.guid();
            if (this.entityType === 'invoice') {
                item.CustomerInvoiceID = x.ID;
            } else {
                item.CustomerOrderID = x.ID;
            }
            return item;
        });
        this.batchInvoice.InvoiceDate = new LocalDate(new Date());
        this.batchInvoice.Operation = 0;
        this.batchInvoice.SellerID = 0;
        this.batchInvoice.YourRef = '';
        this.numberOfItems = this.items.length;
        const amountKey = this.entityType ===  'order'
            ? 'CustomerOrderTaxInclusiveAmountCurrency'
            : 'CustomerInvoiceTaxInclusiveAmountCurrency';
        this.totalAmount = this.items.reduce((sum, it) => sum + (it[amountKey] || 0), 0);

        forkJoin([
            step2FormConfig(this.entityType, this.sellerService),
            this.companySettings.getCompanySettings(),
            this.distributionPlanService.GetAll('', ['Elements', 'Elements.ElementType'])
        ]).subscribe(([config, settings, distributionPlans]) => {
            this.hasDistributionPlans = false;
            if (this.entityType === 'order') {
                this.hasDistributionPlans = distributionPlans
                        .filter(plan => plan.EntityType === 'Models.Sales.CustomerOrder').length > 0;
            } else {
                this.hasDistributionPlans = distributionPlans
                        .filter(plan => plan.EntityType === 'Models.Sales.CustomerInvoice').length > 0;
            }
            this.settings = settings;
            this.fields = config;
            this.batchInvoice.DueDate = new LocalDate(moment(new Date()).add(settings.CustomerCreditDays, 'days').toDate());
        });
    }

    public close(action: string) {
        this.onClose.emit({
            action: action
        });
    }

    public execute() {
        // Because dropdown doesn't allow an item with ID eq null
        if (this.batchInvoice.SellerID === 0) {
            this.batchInvoice.SellerID = null;
        }
        this.batchInvoiceService.Post(this.batchInvoice).subscribe((batchInvoice) => {
            if (batchInvoice) {
                this.batchInvoice.ID = batchInvoice.ID;
                this.batchInvoiceService.invoiceAction(this.batchInvoice.ID).subscribe(() => {
                    this.close('ok');
                });
            }
        });
    }

    public goBack() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.stepper.previous();
        }
    }
    public goNext() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.stepper.next();
        }
    }
}
