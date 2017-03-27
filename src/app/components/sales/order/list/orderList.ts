import { IToolbarConfig } from './../../../common/toolbar/toolbar';
import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {CustomerOrderService, ReportDefinitionService, ErrorService, CompanySettingsService, ReportService} from '../../../../services/services';
import {CustomerOrder, StatusCodeCustomerOrder, CompanySettings} from '../../../../unientities';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

@Component({
    selector: 'order-list',
    templateUrl: './orderList.html'
})
export class OrderList {

    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private orderTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private companySettings: CompanySettings;
    private baseCurrencyCode: string;
    private printStatusPrinted: string = '200';

    private toolbarconfig: IToolbarConfig = {
        title: 'Ordre',
        omitFinalCrumb: true
    };

    private filterTabs: any[] = [
        {label: 'Alle'},
        {label: 'Kladd', statuscode: StatusCodeCustomerOrder.Draft},
        {label: 'Registrert', statuscode: StatusCodeCustomerOrder.Registered},
        {label: 'Delvis overført faktura', statuscode: StatusCodeCustomerOrder.PartlyTransferredToInvoice},
        {label: 'Overført faktura', statuscode: StatusCodeCustomerOrder.TransferredToInvoice}
    ];
    private activeTab: any = this.filterTabs[0];

    constructor(
        private router: Router,
        private customerOrderService: CustomerOrderService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private reportService: ReportService
    ) {}

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                    this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
                }
                this.setupOrderTable();
                this.getGroupCounts();
            }, err => this.errorService.handle(err)
        );

        this.tabService.addTab({
            name: 'Ordre',
            url: '/sales/orders',
            moduleID: UniModules.Orders,
            active: true
        });
    }

    public createOrder() {
        this.router.navigateByUrl('/sales/orders/0');
    }

    private getGroupCounts() {
        this.customerOrderService.getGroupCounts().subscribe((counts) => {
            this.filterTabs.forEach((filter) => {
                filter['count'] = counts[filter.statuscode];
            });
        });
    }

    public onFilterTabClick(tab) {
        this.activeTab = tab;
        if (tab.statuscode) {
            this.table.setFilters([{
                field: 'StatusCode',
                operator: 'eq',
                value: tab.statuscode,
                group: 1
            }]);
        } else {
            this.table.removeFilter('StatusCode');
        }
    }

    private setupOrderTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams || new URLSearchParams();
            params.set('expand', 'Customer,CurrencyCode');

            if (!params.has('orderby')) {
                params.set('orderby', 'OrderDate desc');
            }

            return this.customerOrderService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Context menu
        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Rediger',
            action: (order: CustomerOrder) => {
                this.router.navigateByUrl(`/sales/orders/${order.ID}`);
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        // TODO?
        // contextMenuItems.push({
        //    label: 'Overfør til faktura',
        //    action: (order: CustomerOrder) => {

        //        //TODO?
        //        //this.customerOrderService.ActionWithBody(order.ID, order, 'transfer-to-invoice').subscribe((invoice) => {
        //        //    console.log('== order ACTION OK ==');
        //        //    alert('Overført til Faktura OK');
        //        //    //this.table.refreshTableData();
        //        //    this.router.navigateByUrl('/sales/invoices/' + invoice.ID);
        //        //}, (err) => {
        //        //    console.log('== TRANSFER-TO-INVOICE FAILED ==');
        //        //    this.log(err);
        //        //});
        //    },
        //    disabled: (rowModel) => {
        //        return !rowModel._links.transitions.transferToInvoice;
        //    }
        // });

        contextMenuItems.push({
            label: 'Avslutt',
            action: (order: CustomerOrder) => {
                const toastID = this.toastService.addToast('Avslutter ordre', ToastType.warn);
                this.customerOrderService.Transition(order.ID, order, 'complete').subscribe(() => {
                    this.toastService.removeToast(toastID);
                    this.toastService.addToast('Ordre avsluttet', ToastType.good, 10);
                    this.table.refreshTableData();
                    this.getGroupCounts();
                },
                (err) => {
                    this.toastService.removeToast(toastID);
                    this.errorService.handle(err);
                });
            },
            disabled: (rowModel) => {
                return !rowModel._links.transitions.complete;
            }
        });

        contextMenuItems.push({
            label: 'Skriv ut',
            action: (order: CustomerOrder) => {
                this.reportDefinitionService.getReportByName('Ordre id').subscribe((report) => {
                    if (report) {
                        this.previewModal.openWithId(report, order.ID);
                        this.customerOrderService.setPrintStatus(order.ID, this.printStatusPrinted).subscribe((printStatus) => {}, err => this.errorService.handle(err));
                    }
                }, err => this.errorService.handle(err));
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        contextMenuItems.push({
                label: 'Send på epost',
                action: (order: CustomerOrder) => {
                    let sendemail = new SendEmail();
                    sendemail.EntityType = 'CustomerOrder';
                    sendemail.EntityID = order.ID;
                    sendemail.CustomerID = order.CustomerID;
                    sendemail.Subject = 'Ordre ' + (order.OrderNumber ? 'nr. ' + order.OrderNumber : 'kladd');
                    sendemail.Message = 'Vedlagt finner du Ordre ' + (order.OrderNumber ? 'nr. ' + order.OrderNumber : 'kladd');

                    this.sendEmailModal.openModal(sendemail);

                    if (this.sendEmailModal.Changed.observers.length === 0) {
                        this.sendEmailModal.Changed.subscribe((email) => {
                            this.reportService.generateReportSendEmail('Ordre id', email);
                        });
                    }
                }
            }
        );

        // Define columns to use in the table
        const orderNumberCol = new UniTableColumn('OrderNumber', 'Ordrenr', UniTableColumnType.Text)
            .setWidth('100px').setFilterOperator('contains');

        const customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            .setWidth('100px').setFilterOperator('contains')
            .setTemplate((order) => {
                return order.CustomerID ? `<a href='/#/sales/customer/${order.CustomerID}'>${order.Customer.CustomerNumber}</a>` : ``;
            });

        const customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setTemplate((order) => {
                return order.CustomerID ? `<a href='/#/sales/customer/${order.CustomerID}'>${order.CustomerName}</a>` : ``;
            });

        const orderDateCol = new UniTableColumn('OrderDate', 'Ordredato', UniTableColumnType.LocalDate)
            .setWidth('10%')
            .setFilterOperator('eq');

        let currencyCodeCol = new UniTableColumn('CurrencyCode.Code', 'Valuta', UniTableColumnType.Text)
            .setWidth('5%')
            .setFilterOperator('eq')
            .setVisible(false);

        let taxInclusiveAmountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Totalsum', UniTableColumnType.Money)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        const taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum ' + this.baseCurrencyCode, UniTableColumnType.Money)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setVisible(false)
            .setCls('column-align-right number-good');

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setWidth('15%')
            .setFilterable(false)
            .setTemplate((dataItem) => {
                return this.customerOrderService.getStatusText(dataItem.StatusCode);
            });

        // Setup table
        this.orderTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setContextMenu(contextMenuItems)
            .setColumns([
                orderNumberCol,
                customerNumberCol,
                customerNameCol,
                orderDateCol,
                currencyCodeCol,
                taxInclusiveAmountCurrencyCol,
                taxInclusiveAmountCol,
                statusCol
            ]);
    }

    public onRowSelected(event) {
        this.router.navigateByUrl(`/sales/orders/${event.rowModel.ID}`);
    }
}
