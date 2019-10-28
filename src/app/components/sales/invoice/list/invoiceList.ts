import {Component, OnInit, ViewChild} from '@angular/core';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ITickerActionOverride, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import {UniTickerWrapper} from '../../../uniticker/tickerWrapper/tickerWrapper';
import {
    CustomerInvoiceService,
    ErrorService,
    CompanySettingsService,
} from '../../../../services/services';
import { ActivatedRoute, Router } from '@angular/router';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { BatchInvoiceModal } from '../../common/batchInvoiceModal/batchInvoiceModal';
import { ToastType, ToastService } from '@uni-framework/uniToast/toastService';
import { UniModalService } from '@uni-framework/uni-modal';
import { map } from 'rxjs/operators';
import { StatisticsService } from '@app/services/common/statisticsService';

@Component({
    selector: 'invoice-list',
    templateUrl: './invoiceList.html'
})
export class InvoiceList implements OnInit {

    @ViewChild(UniTickerWrapper) public tickerWrapper: UniTickerWrapper;

    public toolbarconfig: IToolbarConfig;

    public tickercode: string = 'invoice_list';
    public actionOverrides: Array<ITickerActionOverride> = this.customerInvoiceService.actionOverrides;

    public columnOverrides: Array<ITickerColumnOverride> = [
        {
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
        }
    ];

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;

    public toolbarActions = [{
        label: 'Ny faktura',
        action: this.newInvoice.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private tabService: TabService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private toastService: ToastService,
        private statisticsService: StatisticsService
    ) {}

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                    this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
                }
            }, err => this.errorService.handle(err)
            );

        this.tabService.addTab({
            url: '/sales/invoices',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });
        this.route.queryParamMap.subscribe(params => {
            this.updateToolbar(params.get('filter'));
        });
    }

    private newInvoice() {
        this.router.navigateByUrl('/sales/invoices/' + 0);
    }

    // Egen her, eller gjenbruke den i orderList. Forskjellen p.t. er bare tekst ordre/faktura 2 steder
    private openBatchInvoiceModal() {
        const mainTicker = this.tickerWrapper.tickerContainer.mainTicker;
        if (!mainTicker) {
            return;
        }
        const params = mainTicker.lastFilterParams;
        if (!params) {
            return;
        }
        let newParams = params.delete('top').delete('skip').delete('limit');
        let selectQuery = newParams.get('select');
        if (selectQuery.indexOf('CustomerInvoiceTaxInclusiveAmountCurrency') === -1 ) {
            selectQuery += ',CustomerInvoice.TaxInclusiveAmountCurrency as CustomerInvoiceTaxInclusiveAmountCurrency';
        }
        newParams = newParams.set('select', selectQuery);
        this.statisticsService
            .GetAllByHttpParams(newParams, mainTicker.ticker.Distinct || false)
            .pipe(
                map(response => response.body.Data)
            )
            .subscribe(data => {
                this.modalService.open(BatchInvoiceModal, { data: {
                    entityType: 'invoice',
                    items: data
                }}).onClose.subscribe(close => {
                    if (close === 'ok') {
                        this.toastService.addToast('Jobbkjøring vellykket');
                    }
                });
            });
    }

    private updateToolbar(filter: string) {
        this.toolbarconfig = {
            title: 'Faktura',
            contextmenu: [
                {
                    label: 'Samlefaktura',
                    action: () => {
                        this.openBatchInvoiceModal();
                    },
                    disabled: () => filter !== 'my_draft_invoices'
                },
            ]
        };
    }
}
