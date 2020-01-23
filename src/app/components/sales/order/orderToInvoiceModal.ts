import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {CustomerOrderService, ErrorService} from '../../../services/services';
import {CustomerOrder, StatusCodeCustomerOrderItem} from '../../../unientities';

@Component({
    selector: 'uni-order-to-invoice-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Overfør til faktura'}}</header>
            <article>
                <ag-grid-wrapper
                    [resource]="order?.Items"
                    [config]="tableConfig">
                </ag-grid-wrapper>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Overfør</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniOrderToInvoiceModal implements IUniModal {
    @ViewChild(AgGridWrapper, { static: true }) public table: AgGridWrapper;
    @Input() public options: IModalOptions = {};
    @Output() public onClose: EventEmitter<CustomerOrder> = new EventEmitter();

    public tableConfig: UniTableConfig;
    public order: CustomerOrder;

    constructor(
        private orderService: CustomerOrderService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.tableConfig = this.getTableConfig();
        const orderID = this.options.data || null;
        if (!orderID) {
            this.close(false);
            return;
        }

        this.orderService.Get(orderID, ['Items.Product']).subscribe(
            (order: CustomerOrder) => {
                order.Items = order.Items.filter(item => {
                    return item.StatusCode === StatusCodeCustomerOrderItem.Registered;
                });

                order.Items = order.Items.sort((a, b) => a.SortIndex - b.SortIndex);
                this.order = order;
            },
            err => {
                this.errorService.handle(err);
                this.close(false);
            }
        );
    }

    public close(emitValue?: boolean) {
        if (!emitValue || !this.table) {
            this.onClose.emit(null);
            return;
        }

        const selectedLines = this.table.getSelectedRows();
        this.order.Items = selectedLines;

        this.onClose.emit(this.order);
    }

    private getTableConfig(): UniTableConfig {
        return new UniTableConfig('sales.order.orderToInvoice', false, true)
            .setMultiRowSelect(true, true)
            .setColumns([
                new UniTableColumn('Product.PartName', 'Produktnr'),
                new UniTableColumn('ItemText', 'Tekst'),
                new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number)
            ]);
    }
}
