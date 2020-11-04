import {Component, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {CompanySettingsService, ITickerActionOverride, ITickerColumnOverride, SupplierInvoiceService} from '@app/services/services';
import {Router} from '@angular/router';
import { SupplierInvoiceStore } from '../supplier-invoice-store';
import { of } from 'rxjs';
import { CompanySettings, StatusCodeSupplierInvoice } from '@uni-entities';

@Component({
    selector: 'supplier-invoice-list',
    templateUrl: './list.html'
})
export class SRSupplierInvoiceList implements OnInit {
    tickercode: string = 'supplierinvoice_list';
    actionOverrides: ITickerActionOverride[] = [];
    columnOverrides: ITickerColumnOverride[] = [{
        Field: 'StatusCode',
        Template: (dataItem) => this.supplierInvoiceService.getStatusText( dataItem.CustomerInvoiceStatusCode)
    }];

    toolbarActions = [{
        label: 'Ny utgift',
        action: this.newInvoice.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private tabService: TabService,
        private router: Router
    ) {
    }

    public ngOnInit() {
        this.tabService.addTab({
            url: '/accounting/supplier-invoice',
            name: 'Utgifter',
            active: true,
            moduleID: UniModules.Bills
        });
    }

    public onRowSelected(row) {
        this.router.navigateByUrl('/accounting/supplier-invoice/' + row.ID);
    }

    private newInvoice() {
        this.router.navigateByUrl('/accounting/inbox');
    }
}