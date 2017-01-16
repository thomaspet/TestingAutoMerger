import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {StatisticsService, PaymentBatchService, FileService} from '../../../services/services';
import {Payment, PaymentCode, File, PaymentBatch} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {ErrorService} from '../../../services/common/ErrorService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

declare const moment;
declare const saveAs; // filesaver.js

@Component({
    selector: 'customer-payment-batches',
    templateUrl: './customerPaymentBatches.html',
})
export class CustomerPaymentBatches {
    @ViewChild(UniTable) private table: UniTable;
    private toolbarconfig: IToolbarConfig;
    private paymentBatchTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private selectedPaymentBatchID: number;
    private currentRow: any;

    constructor(private router: Router,
                private statisticsService: StatisticsService,
                private paymentBatchService: PaymentBatchService,
                private errorService: ErrorService,
                private tabService: TabService,
                private toastService: ToastService,
                private fileService: FileService) {

        this.tabService.addTab({
            name: 'Innbetalinger',
            url: '/bank/customerbatches',
            moduleID: UniModules.PaymentBatches,
            active: true }
        );
    }

    public ngOnInit() {
        this.toolbarconfig = {
                title: 'Innbetalinger',
                subheads: [],
                navigation: {}
            };

        this.setupTable();

        setTimeout(() => {
            if (this.table) {
                this.table.focusRow(0);
            }
        }, 100);
    }

    private fileUploaded(file: File) {
        this.toastService.addToast('Laster opp innbetalingsfil..', ToastType.good, 10,
            'Dette kan ta litt tid, vennligst vent...');

        this.paymentBatchService.registerCustomerPaymentFile(file)
            .subscribe(paymentBatch => {
                this.toastService.addToast('Innbetalingsfil tolket og behandlet', ToastType.good, 10,
                    'Betalinger og bilag er oppdatert');

                this.table.refreshTableData();
                this.selectedPaymentBatchID = paymentBatch.ID;
            },
            err => this.errorService.handle(err)
        );
    }

    private paymentBatchUpdated(paymentBatch: PaymentBatch) {
        if (this.table) {
            this.table.refreshTableData();
        }
    }

    private paymentBatchNavigate(direction: number) {
        if (this.table) {
            try {
                // use try catch here, in case we navigate past the last item
                // TODO: Should consider exposing number of rows to see if we can navigate further
                if (this.currentRow._originalIndex + direction >= 0) {
                    this.table.focusRow(this.currentRow._originalIndex + direction);
                } else {
                    this.selectedPaymentBatchID = null;
                }
            } catch (error) {
                this.selectedPaymentBatchID = null;
            }
        }
    }

    private deletePaymentBatch(paymentBatch: PaymentBatch) {
        this.selectedPaymentBatchID = null;
        this.currentRow = null;

        this.paymentBatchService.revertPaymentBatch(paymentBatch.ID)
            .subscribe((res) => {
                this.table.refreshTableData();
            },
            err => this.errorService.handle(err)
        );
    }

    private onRowSelected(row) {
        this.selectedPaymentBatchID = row.rowModel.ID;
        this.currentRow = row.rowModel;
    }

    private setupTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            if (!params.get('orderby')) {
                params.set('orderby', 'ID DESC');
            }

            params.set('filter', 'IsCustomerPayment eq true');

            return this.paymentBatchService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        let dateCol = new UniTableColumn('CreatedAt', 'Dato',  UniTableColumnType.LocalDate)
            .setWidth('110px');

        let totalAmountCol = new UniTableColumn('TotalAmount', 'Totalbeløp',  UniTableColumnType.Money)
            .setFilterOperator('contains')
            .setWidth('140px');

        let numberOfPaymentsCol = new UniTableColumn('NumberOfPayments', 'Antall',  UniTableColumnType.Text)
            .setFilterable(false)
            .setWidth('70px');

        let statusCodeCol = new UniTableColumn('StatusCode', 'Status',  UniTableColumnType.Text)
            .setTemplate(data => this.paymentBatchService.getStatusText(data.StatusCode,true))
            .setFilterable(false);

        // Setup table
        this.paymentBatchTableConfig = new UniTableConfig(false, true, 25)
            .setSearchable(true)
            .setColumns([dateCol, totalAmountCol, numberOfPaymentsCol, statusCodeCol]);
    }
}
