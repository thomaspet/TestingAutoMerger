import {Component, ViewChild} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {Router, ActivatedRoute} from '@angular/router';
import {StatisticsService, ErrorService} from '@app/services/services';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {HttpParams} from '@angular/common/http';
import {IUniTab} from '@uni-framework/uni-tabs';
import {StatusCode, BatchInvoice, Status} from '@uni-entities';
import {catchError, map} from 'rxjs/operators';
import {of, Subscription} from 'rxjs';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

import {trigger, transition, animate, style} from '@angular/animations';
import {SignalRService} from '@app/services/common/signal-r.service';

@Component({
    templateUrl: './batch-invoice-list.html',
    styleUrls: ['./batch-invoice-list.sass'],
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
export class BatchInvoiceList {
    @ViewChild(AgGridWrapper) table: AgGridWrapper;

    saveactions: IUniSaveAction[] = [{
        label: 'Ny samlefakturering',
        action: () => this.router.navigate(['sales/batch-invoices/new'])
    }];

    queryParamSubscription: Subscription;
    statusCodeFilter: string;
    selectedBatchInvoice: BatchInvoice;
    detailsVisible: boolean;
    signalRSubscription: Subscription;

    tabs: IUniTab[] = [
        { name: 'Alle' },
        { name: 'Under arbeid', queryParams: {status: StatusCode.Active} },
        { name: 'Fullført', queryParams: {status: StatusCode.Completed} },
        { name: 'Feilet / fullført med feil', queryParams: {status: StatusCode.Error} },
    ];

    totalCount: number;
    tableConfig: UniTableConfig;
    lookupFunction;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private tabService: TabService,
        private signalRService: SignalRService
    ) {
        this.tabService.addTab({
            name: 'Samlefakturering',
            url: this.router.url,
            moduleID: UniModules.BatchInvoice
        });
    }

    ngOnInit() {
        this.getFilterCounts().subscribe(counts => {
            this.totalCount = counts.Total || 0;
            if (this.totalCount) {
                this.tabs[0].count = this.totalCount;
                this.tabs[1].count = counts.Active || 0;
                this.tabs[2].count = counts.Completed || 0;
                this.tabs[3].count = counts.Error || 0;
                this.tabs = [...this.tabs];
            }
        });

        this.queryParamSubscription = this.activatedRoute.queryParamMap.subscribe(params => {
            const statusCode = params.get('status') || '';
            if (statusCode !== this.statusCodeFilter) {
                this.statusCodeFilter = statusCode ? `StatusCode eq ${statusCode}` : '';
                if (this.table  && this.table.hasLoadedData) {
                    this.reloadList();
                }
            }
        });

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
                'sum(CustomerOrder.TaxExclusiveAmountCurrency) as SumOrders',
            ];

            urlParams = urlParams.set('model', 'BatchInvoice')
                .set('select', selects.join(','))
                .set('expand', 'Items,Items.CustomerInvoice,Items.CustomerOrder')
                .set('join', 'BatchInvoice.CreatedBy eq User.GlobalIdentity');

            if (!urlParams.has('orderby')) {
                urlParams = urlParams.set('orderby', 'ID desc');
            }

            const filter = urlParams.get('filter');
            if (filter && this.statusCodeFilter) {
                urlParams = urlParams.set('filter', `${this.statusCodeFilter} and ${filter}`);
            } else if (filter || this.statusCodeFilter) {
                urlParams = urlParams.set('filter', filter || this.statusCodeFilter);
            }

            return this.statisticsService.GetAllByHttpParams(urlParams, true);
        };

        this.signalRSubscription = this.signalRService.pushMessage$.subscribe(message => {
            console.log('message', message);
            if (message && message.cargo && message.cargo.entityType === 'BatchInvoice') {
                this.reloadList();
            }
        });
    }

    ngOnDestroy() {
        if (this.queryParamSubscription) {
            this.queryParamSubscription.unsubscribe();
        }

        if (this.signalRSubscription) {
            this.signalRSubscription.unsubscribe();
        }
    }

    reloadList() {
        if (this.table && this.table.hasLoadedData) {
            console.log('reloading list');
            this.table.refreshTableData();
        }
    }


    onBatchInvoiceSelected(batchInvoice) {
        this.selectedBatchInvoice = batchInvoice;
        this.detailsVisible = true;
    }

    private getFilterCounts() {
        const selects = [
            `count(ID) as Total`,
            `sum(casewhen((StatusCode eq '${StatusCode.Active}' ),1,0)) as Active`,
            `sum(casewhen((StatusCode eq '${StatusCode.Completed}' ),1,0)) as Completed`,
            `sum(casewhen((StatusCode eq '${StatusCode.Error}' ),1,0)) as Error`,
        ];

        const params = new HttpParams()
            .set('model', 'BatchInvoice')
            .set('select', selects.join(','));

        return this.statisticsService.GetAllUnwrapped(params.toString()).pipe(
            map(res => res && res[0] || {}),
            catchError(err => {
                this.errorService.handle(err);
                return of({});
            })
        );
    }

    private getTableConfig() {
        return new UniTableConfig('batch_invoice_list', false, false)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('ID', 'Jobbnummer'),
                new UniTableColumn('Processed', 'Fremdrift / resultat')
                    .setTemplate(row => `${row.Processed} av ${row.TotalToProcess}`)
                    .setWidth('10rem'),
                new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate),
                new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate),
                new UniTableColumn('CreatedBy', 'Opprettet av'),
                new UniTableColumn('SumOrders', 'Sum', UniTableColumnType.Money),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Status)
                    .setWidth('9rem')
                    .setStatusMap({
                        [StatusCode.Active]: { label: 'Under arbeid', class: 'info' },
                        [StatusCode.Completed]: { label: 'Fullført', class: 'good' },
                        [StatusCode.Error]: { label: 'Feilet', class: 'bad' },
                        0: 'I kø'
                    }),
            ]);
    }
}
