import {Component, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {CustomerInvoiceService, ITickerActionOverride, ITickerColumnOverride} from '@app/services/services';
import {ActivatedRoute, Router} from '@angular/router';
import {trigger, transition, animate, style} from '@angular/animations';
import { ITableFilter } from '@uni-framework/ui/unitable';
import { BatchInvoice } from '@uni-entities';
import { Subscription } from 'rxjs';

@Component({
    selector: 'invoice-list',
    templateUrl: './invoiceList.html',
    styleUrls: ['./invoiceList.sass'],
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({transform: 'translateX(100%)'}),
                animate('500ms cubic-bezier(0.250, 0.460, 0.450, 0.940)', style({transform: 'translateX(0%)'}))
            ]),
            transition(':leave', [
                animate('500ms cubic-bezier(0.250, 0.460, 0.450, 0.940)', style({transform: 'translateX(100%)'}))
            ])
        ])
    ]
})
export class InvoiceList implements OnInit {
    public tickercode: string = 'invoice_list';
    public actionOverrides: ITickerActionOverride[] = this.customerInvoiceService.actionOverrides;
    public tableFilters: ITableFilter[];
    public columnOverrides: ITickerColumnOverride[] = [{
        Field: 'StatusCode',
        Template: (dataItem) => {
            let statusText: string = this.customerInvoiceService.getStatusText(
                dataItem.CustomerInvoiceStatusCode,
                dataItem.CustomerInvoiceInvoiceType
            );

            if (((dataItem.CustomerInvoiceTaxInclusiveAmount * -1) === dataItem.CustomerInvoiceCreditedAmount) &&
                    (dataItem.CustomerInvoiceCreditedAmount > 0 || dataItem.CustomerInvoiceCreditedAmount < 0 )) {
                statusText = 'Kreditert';
            }

            if (((dataItem.CustomerInvoiceTaxInclusiveAmount * -1) > dataItem.CustomerInvoiceCreditedAmount) &&
                    (dataItem.CustomerInvoiceCreditedAmount > 0 || dataItem.CustomerInvoiceCreditedAmount < 0 )) {
                statusText = statusText + '(Kreditert)';
            }

            if (dataItem.CustomerInvoiceCollectorStatusCode === 42501) {
                statusText = 'Purret';
            }
            if (dataItem.CustomerInvoiceCollectorStatusCode === 42502) {
                statusText = 'Inkasso';
            }

            return statusText;
        }
    }];

    public toolbarActions = [{
        label: 'Ny faktura',
        action: this.newInvoice.bind(this),
        main: true,
        disabled: false
    }];
    public showMassInvoiceList: boolean = false;
    queryParamSubscription: Subscription;

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private tabService: TabService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            url: '/sales/invoices',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });

        this.queryParamSubscription = this.route.queryParamMap.subscribe(params => {
            if (params.get("show") === "massinvoice") {
                this.showMassInvoiceList = true
            }
        })
    }

    public ngOnDestroy() {
        this.queryParamSubscription?.unsubscribe();
    }

    public closeMassInvoice(event?: BatchInvoice) {
        this.showMassInvoiceList = false;
        this.router.navigateByUrl("/sales/invoices")
        if (event) {
            this.tableFilters = [{
                field: "BatchInvoiceItem.BatchInvoiceID",
                operator: "eq",
                value: event.ID
            }]
        }
    }

    public onRowSelected(row) {
        this.router.navigateByUrl('/sales/invoices/' + row.ID);
    }

    private newInvoice() {
        this.router.navigateByUrl('/sales/invoices/' + 0);
    }
}
