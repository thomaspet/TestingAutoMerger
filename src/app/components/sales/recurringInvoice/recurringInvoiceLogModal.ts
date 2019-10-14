import {
    Component,
    Output,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    EventEmitter,
    OnInit
} from '@angular/core';
import {Router} from '@angular/router';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable/index';
import {RecurringInvoiceService} from '../../../services/services';

@Component({
    selector: 'uni-recurringinvoice-log-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 75vw;">
            <header>{{ options.header | translate }}</header>

            <article>
                <section *ngIf="resource">
                    <ag-grid-wrapper
                        [resource]="resource"
                        [config]="uniTableConfig">
                    </ag-grid-wrapper>
                </section>
                <h5 *ngIf="showNoDataMessage" class="log-error-msg-text">
                    Ingen data å vise enda.
                    <a (click)="goToInvoice()" class="subhead-link">
                        {{ 'SALES.RECURRING_INVOICE.GOTO~' + this.options.data.reccuringInvoiceID | translate }}
                    </a>
                </h5>
            </article>
            <footer>
                <button (click)="close()" class="c2a"> Lukk </button>
            </footer>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniRecurringInvoiceLogModal implements IUniModal, OnInit {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    uniTableConfig: UniTableConfig;
    resource: any = [];
    showNoDataMessage: boolean = false;

    constructor(
        public router: Router,
        public recurringInvoiceService: RecurringInvoiceService,
        public cdr: ChangeDetectorRef
    ) { }

    public ngOnInit() {
        if (this.options) {

            this.recurringInvoiceService.getLog(this.options.data.reccuringInvoiceID).subscribe((log) => {
                if (log && log.length) {
                    this.uniTableConfig = this.generateUniTableConfig();
                    this.resource = log;
                } else {
                    this.showNoDataMessage = true;
                }
                this.cdr.markForCheck();
            });
        }
    }

    public close() {
        this.onClose.emit(null);
    }

    public goToInvoice() {
        this.router.navigateByUrl(`/sales/recurringinvoice/${this.options.data.reccuringInvoiceID}`);
        this.close();
    }

    private generateUniTableConfig(): UniTableConfig {
        const columns = [
            new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Link)
                .setLinkClick(row => {
                    this.router.navigateByUrl(`/sales/invoices/${row.InvoiceID}`);
                    this.close();
                })
                .setWidth(100),
            new UniTableColumn('OrderNumber', 'Ordrenr.', UniTableColumnType.Link)
                .setLinkClick(row => {
                    this.router.navigateByUrl(`/sales/orders/${row.OrderID}`);
                    this.close();
                })
                .setWidth(100),
            new UniTableColumn('RecurringInvoiceID', 'Avtalenr.', UniTableColumnType.Link)
                .setLinkClick(row => {
                    this.router.navigateByUrl(`/sales/recurringinvoice/${row.RecurringInvoiceID}`);
                    this.close();
                })
                .setWidth(150),
            new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate),
            new UniTableColumn('CreationDate', 'Faktura generert', UniTableColumnType.LocalDate),
            new UniTableColumn('IterationNumber', 'Nr. i rekken', UniTableColumnType.Number),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setTemplate(row => this.getStatusText(row))
        ];

        return new UniTableConfig('sales.recurringinvoice.log', false, false, 25)
            .setPageable(true)
            .setColumnMenuVisible(false)
            .setColumns(columns);
    }

    private getStatusText(row) {
        switch (row.StatusCode) {
            case 46101:
                return 'Kladd';
            case 46102:
                return 'Pågår';
            case 46103:
                return 'Feilet';
            case 46104:
                return 'Opprettet';
        }
    }
}
