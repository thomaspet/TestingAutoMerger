import { HttpParams } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ErrorService, MassInvoiceService, StatisticsService } from "@app/services/services";
import { BatchInvoice, StatusCode, StatusCodeSharing } from "@uni-entities";
import { AgGridWrapper } from "@uni-framework/ui/ag-grid/ag-grid-wrapper";
import { UniTableColumn, UniTableColumnType, UniTableConfig } from "@uni-framework/ui/unitable";
import { ToastService, ToastType } from "@uni-framework/uniToast/toastService";
import { of, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Component({
    selector: 'mass-invoice-list',
    templateUrl: './mass-invoice-list.html',
    styleUrls: ['./mass-invoice-list.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MassInvoiceList {
    @ViewChild("batchinvoices") table: AgGridWrapper;
    @ViewChild("batchItems") itemstable: AgGridWrapper;
    @Output() close = new EventEmitter();

    busy: boolean = false;

    tableConfig = this.getTableConfig();
    lookupFunction: (urlParams: HttpParams) => Observable<any>;

    itemsTableConfig = this.getItemsTableConfig();
    itemsLookupFunction: (urlParams: HttpParams) => Observable<any>;

    batchInvoice: BatchInvoice;
    showItems: boolean = false;
    hasFailingItems: boolean = false;

    debounceTimer;

    constructor(
        private statisticsService: StatisticsService,
        private massInvoiceService: MassInvoiceService,
        private toastService: ToastService,
        private router: Router,
        private errorService: ErrorService,
    ) {}

    public ngOnInit() {
        this.busy = true;
        this.tableConfig = this.getTableConfig();

        this.lookupFunction = (urlParams: HttpParams) => {
            const selects = [
                'ID as ID',
                'StatusCode as StatusCode',
                'Processed as Processed',
                'User.DisplayName as CreatedBy',
                'TotalToProcess as TotalToProcess',
                'InvoiceDate as InvoiceDate',
                'DueDate as DueDate',
                'Operation as Operation',
                'sum(CustomerInvoice.TaxExclusiveAmountCurrency) as SumInvoices',
                `sum(casewhen((Sharing.StatusCode eq 70003),1,0)) as CompletedItems` // Fakturete
            ];

            urlParams = urlParams.set('model', 'BatchInvoice')
                .set('select', selects.join(','))
                .set('expand', 'Items.CustomerInvoice')
                .set('join', `BatchInvoice.CreatedBy eq User.GlobalIdentity and CustomerInvoice.ID eq Sharing.EntityID and Sharing.EntityType eq 'CustomerInvoice'`);

            if (!urlParams.has('orderby')) {
                urlParams = urlParams.set('orderby', 'ID desc');
            }

            let filter = "";
            if (urlParams.get("filter")) {
                filter = urlParams.get("filter") + " and ";
            }
            urlParams = urlParams.set('filter', `${filter}Operation eq 3`)

            return this.statisticsService.GetAllByHttpParams(urlParams, true)
                .pipe(
                    catchError(err => {
                        this.errorService.handle(err);
                        return of([]);
                    })
                );
        };

        this.itemsTableConfig = this.getItemsTableConfig();
        this.busy = false;
    }
    public refreshItemsTable() {
        this.busy = true;

        if (this.debounceTimer) {
            return;
        }

        this.itemstable.refreshTableData();
        this.debounceTimer = setTimeout(() => {
            this.busy = false;
            this.debounceTimer = null;
        }, 200)
    }

    public getFailingItemsForBatch(batchInvoice: BatchInvoice): Observable<any> {
        const select = "count(ID) as Total," +
            `sum(casewhen((StatusCode eq '${StatusCode.Error}'),1,0)) as Error,` +
            `sum(casewhen((StatusCode eq '${StatusCode.Completed}'),1,0)) as Completed,` +
            "sum(casewhen((Sharing.StatusCode eq 70003),1,0)) as SharingCompleted";
        const params = new HttpParams()
            .set('model', 'BatchInvoiceItem')
            .set('select', select)
            .set('expand', 'CustomerInvoice')
            .set('join', `CustomerInvoice.ID eq Sharing.EntityID and Sharing.EntityType eq 'CustomerInvoice'`)
            .set('filter', `BatchInvoiceID eq ${batchInvoice.ID}`);

        return this.statisticsService.GetAllUnwrapped(params.toString()).pipe(
            map(res => res && res[0] || {}),
            catchError(err => {
                this.errorService.handle(err);
                return of({});
            })
        );
    }

    public getItemLookupFunction(id: number): (urlParams: HttpParams) => Observable<any> {
        return (urlParams: HttpParams) => {
            const selects = 
                'ID as ID,' +
                'CustomerInvoice.InvoiceNumber as InvoiceNumber,' +
                'CustomerInvoiceID as CustomerInvoiceID,' +
                'StatusCode as StatusCode,' +
                'CustomerInvoice.CustomerName as InvoiceCustomerName,' +
                'CustomerInvoice.CustomerID as InvoiceCustomerID,' +
                `Sharing.StatusCode as SharingStatus,` +
                `Sharing.ExternalMessage as SharingMessage,` +
                'Comment.Text as Comment';

            let filters = urlParams.get("filter");

            if (filters) {
                filters = `(${filters}) and BatchInvoiceID eq ${id}`;
            } else {
                filters = `BatchInvoiceID eq ${id}`;
            }

            urlParams = urlParams.set('model', 'BatchInvoiceItem')
                .set('select', selects)
                .set('filter', filters)
                .set('join', `BatchInvoiceItem.CommentID eq Comment.ID and CustomerInvoice.ID eq Sharing.EntityID and Sharing.EntityType eq 'CustomerInvoice'`)
                .set('expand', 'CustomerInvoice')

            return this.statisticsService.GetAllByHttpParams(urlParams, true)
                .pipe(
                    catchError(err => {
                        this.errorService.handle(err);
                        return of([]);
                    })
                );
        };
    }

    public onBatchInvoiceSelected(batchInvoice: BatchInvoice): void {
        this.itemsLookupFunction = this.getItemLookupFunction(batchInvoice.ID);
        this.getFailingItemsForBatch(batchInvoice)
            .subscribe(res => {
                this.hasFailingItems = res.Error > 0 || res.Total !== res.Completed; // Enable this when we can resend all || res.SharingError > 0;
            });
        this.batchInvoice = batchInvoice;
        this.showItems = true;
    }

    public closeWithFilters(): void {
        this.close.emit(this.batchInvoice);
    }

    public retryFailing(): void {
        this.massInvoiceService.invoiceBatch(this.batchInvoice).subscribe(success => {
            if (success) {
                this.busy = true;
                this.toastService.addToast(`Massefaktura send på nytt`, ToastType.info, 2);
                setTimeout(() => {
                    this.itemstable.refreshTableData()
                    this.busy = false;
                }, 5000);
            }
        })
    }

    private getTableConfig(): UniTableConfig {
        return new UniTableConfig('mass_invoice_list', false, false)
            .setColumnMenuVisible(true)
            .setColumns([
                new UniTableColumn('ID', 'ID')
                    .setWidth("50px"),
                new UniTableColumn('Processed', 'Fremdrift / resultat')
                    .setTemplate(row => `${row.Processed} av ${row.TotalToProcess}`)
                    .setWidth('10rem')
                    .setVisible(false),
                new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate),
                new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate),
                new UniTableColumn('CreatedBy', 'Opprettet av'),
                new UniTableColumn('SumInvoices', 'Sum', UniTableColumnType.Money)
                    .setSortable(false),
                new UniTableColumn("Utsendelse", "Utsendelse", UniTableColumnType.Text)
                    .setSortable(false)
                    .setTemplate(row => `${row.CompletedItems}/${row.TotalToProcess} Sendt`)
                    .setConditionalCls(row => {
                        if (row.CompletedItems === row.TotalToProcess)
                            return "good";
                        return "bad";
                    }),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Status)
                    .setWidth('9rem')
                    .setStatusMap({
                        [StatusCode.Draft]: 'I kø',
                        [StatusCode.Pending]: 'I kø',
                        [StatusCode.Active]: 'Under arbeid',
                        [StatusCode.Completed]: { label: 'Fullført', class: 'good' },
                        [StatusCode.Deviation]: {
                            label: 'Ignorert',
                            class: 'warn',
                            tooltip: row => "Trykk på jobben for å se feilmeldinger"
                        },
                        [StatusCode.Error]: {
                            label: 'Feilet',
                            class: 'bad',
                            tooltip: row => 'Trykk på jobben for å se feilmeldinger'
                        },
                        0: 'Ingen status'
                    }),
            ]);
    }

    private getItemsTableConfig(): UniTableConfig {
        return new UniTableConfig('mass_invoice_items_list', false, false)
            .setColumnMenuVisible(true)
            .setButtons([{
                action: () => this.refreshItemsTable(),
                label: "Oppdater",
                class: "secondary",
                icon: "cached",
            }, {
                action: () => this.closeWithFilters(),
                label: "Se i fakturaliste",
                class: "secondary",
            }], true)
            .setColumns([
                new UniTableColumn('CustomerInvoice.InvoiceNumber', 'Faktura nmr', UniTableColumnType.Number)
                    .setAlignment("center")
                    .setAlias("InvoiceNumber")
                    .setTemplate(r => r.StatusCode >= 60000 ? null : r.InvoiceNumber)
                    .setHasLink(r => r.StatusCode < 60000)
                    .setLinkClick(r => this.router.navigateByUrl(`/sales/invoices/${r.CustomerInvoiceID}`)),
                new UniTableColumn('CustomerInvoice.CustomerName', 'Kunde navn', UniTableColumnType.Text)
                    .setAlias("InvoiceCustomerName")
                    .setLinkClick(r=> this.router.navigateByUrl(`/sales/customer/${r.InvoiceCustomerID}`)),
                new UniTableColumn('Comment.Text', 'Kommentar', UniTableColumnType.Text)
                    .setAlias("Comment")
                    .setTemplate(row => row.Comment || row.SharingMessage),
                new UniTableColumn('Sharing.StatusCode', 'Utsendelse', UniTableColumnType.Status)
                    .setWidth('9rem')
                    .setAlias("SharingStatus")
                    .setStatusMap({
                        [StatusCodeSharing.Pending]: 'I kø',
                        [StatusCodeSharing.InProgress]: 'I kø',
                        [StatusCodeSharing.Completed]: { label: 'Sendt', class: 'good' },
                        [StatusCodeSharing.Cancelled]: {
                            label: 'Avbrøte',
                            class: 'warn',
                            tooltip: row => row.SharingMessage || "Mangler statusmelding"
                        },
                        [StatusCodeSharing.Failed]: {
                            label: 'Feilet',
                            class: 'bad',
                            tooltip: row => {
                                if (row.SharingMessage?.startsWith("No valid distributionplanelement")) {
                                    return "Fant ingen gyldig utsendelsesmetode";
                                }
                                return row.SharingMessage || "Mangler statusmelding";
                            }
                        },
                        0: 'Ingen status'
                    }),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Status)
                    .setWidth('9rem')
                    .setStatusMap({
                        [StatusCode.Draft]: 'I kø',
                        [StatusCode.Pending]: 'I kø',
                        [StatusCode.Active]: 'Under arbeid',
                        [StatusCode.Completed]: { label: 'Fullført', class: 'good' },
                        [StatusCode.Deviation]: {
                            label: 'Ignorert',
                            class: 'warn',
                            tooltip: row => row.Comment || row.SharingMessage || "Mangler kommentar"
                        },
                        [StatusCode.Error]: {
                            label: 'Feilet',
                            class: 'bad',
                            tooltip: row => row.Comment || row.SharingMessage || "Mangler kommentar"
                        },
                        0: 'Ingen status'
                    }),
            ]);
    }
}