import {Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTickerService, CustomerInvoiceService, CustomerOrderService, CustomerQuoteService, SupplierInvoiceService} from '../../../services/services';
import {Ticker, TickerGroup, TickerAction} from '../../../services/common/uniTickerService';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {UniTickerContainer} from '../tickerContainer/tickerContainer';
import {ITickerActionOverride} from '../../../services/common/uniTickerService';
import {UniModalService, UniReinvoiceModal} from '@uni-framework/uni-modal';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-overview',
    templateUrl: './overview.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerOverview {
    @ViewChild(UniTickerContainer)
    private tickerContainer: UniTickerContainer;

    private tickers: Ticker[];
    public tickerGroups: TickerGroup[];
    public selectedTicker: Ticker;

    public actionOverrides: Array<ITickerActionOverride>;

    public tickerTitle: string;
    public createNewAction: TickerAction;
    public exportBusy: boolean;
    public navigatingToTicker = false;
    constructor(
        private tabService: TabService,
        private uniTickerService: UniTickerService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private cdr: ChangeDetectorRef,
        private customerInvoiceService: CustomerInvoiceService,
        private customerOrderService: CustomerOrderService,
        private customerQuoteService: CustomerQuoteService,
        private supplierInvoiceService: SupplierInvoiceService,
        private modalService: UniModalService
    ) {
        this.tabService.addTab({
            name: 'Oversikt',
            url: '/overview',
            moduleID: UniModules.UniTicker,
            active: true
        });
    }

    public ngAfterViewInit() {
        this.uniTickerService.getTickers().then(tickers => {
            this.tickers = tickers;

            this.tickerGroups = this.uniTickerService.getGroupedTopLevelTickers(tickers);


            this.route.queryParams.subscribe((params) => {
                const tickerCode = params['code'];

                if (!this.selectedTicker || this.selectedTicker.Code !== tickerCode) {
                    if (tickerCode) {
                        this.selectTicker(tickerCode);
                    } else {
                        this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
                    }
                }

                switch (tickerCode || this.tickerGroups[0].Tickers[0].Code) {
                    case 'invoice_list':
                        this.actionOverrides = this.customerInvoiceService.actionOverrides;
                        break;
                    case 'order_list':
                        this.actionOverrides = this.customerOrderService.actionOverrides;
                        break;
                    case 'quote_list':
                        this.actionOverrides = this.customerQuoteService.actionOverrides;
                        break;
                    case 'supplierinvoice_list':
                        this.actionOverrides = this.reinvoiceActionOverrides;
                        break;
                }
            });
        });
    }

    // ActionOverrides for reInvoice, here because of circular deps
    private reinvoiceActionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'supplierinvoice_reinvoice',
            ExecuteActionHandler: (selectedRows) => this.onReinvoice(selectedRows),
            CheckActionIsDisabled: (selectedRow) => !selectedRow || !selectedRow.SupplierInvoiceReInvoiced
        }
    ];

    private onReinvoice(selectedRows: Array<any>): Promise<any> {
        const row = selectedRows[0];
        if (!row) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.supplierInvoiceService.Get(row.ID).subscribe(invoice => {
                this.modalService.open(UniReinvoiceModal, {
                    data: {
                        supplierInvoice: invoice
                    }
                }).onClose.subscribe(() => {
                    resolve();
                });
            });
        });
    }

    private updateTab() {
        const urlWithParams = this.location.path(false);
        this.tabService.addTab({
            name: 'Oversikt',
            url: urlWithParams,
            moduleID: UniModules.UniTicker,
            active: true
        });
    }

    public navigateToTicker(ticker: Ticker) {
        this.navigatingToTicker = true;
        setTimeout(() => { // give some time to component to restart and restart also ag-grid-wrapper filters
            this.router.navigate(['/overview'], {
                queryParams: { code: ticker.Code },
                skipLocationChange: false
            });
            this.navigatingToTicker = false;
        }, 100);
    }

    public onCreateNewClick() {
        if (this.tickerContainer && this.createNewAction) {
            this.tickerContainer.runAction(this.createNewAction);
        }
    }

    private selectTicker(selectedTickerCode: string) {
        this.selectedTicker = this.tickers.find(x => x.Code === selectedTickerCode);

        if (!this.selectedTicker) {
            this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
            return;
        }

        this.updateTab();

        if (this.selectedTicker) {
            this.tickerTitle = this.selectedTicker.Name;
            this.createNewAction = undefined;
            if (this.selectedTicker.Actions) {
                this.createNewAction = this.selectedTicker.Actions.find(a => a.Type === 'new');
            }
        } else {
            this.tickerTitle = undefined;
            this.createNewAction = undefined;
        }

        this.cdr.markForCheck();
    }

    public onTickerParamsChange(params) {
        this.updateTab();
    }

    public exportToExcel() {
        if (this.exportBusy) {
            return;
        }

        this.exportBusy = true;
        this.tickerContainer.exportToExcel(() => {
            this.exportBusy = false;
        });
    }

    public turnGroupingOnOff() {
        this.tickerContainer.turnGroupingOnOff();
    }
}
