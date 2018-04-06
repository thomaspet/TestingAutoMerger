import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {CustomerOrderService, ErrorService} from '../../../services/services';
import {CustomerOrder, StatusCodeCustomerOrderItem} from '../../../unientities';

@Component({
    selector: 'uni-order-to-invoice-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Overfør til faktura'}}</h1>
            </header>
            <article>
                <uni-table
                    [resource]="order?.Items"
                    [config]="tableConfig">
                </uni-table>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Overfør</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniOrderToInvoiceModal implements IUniModal {
    @ViewChild(UniTable) public table: UniTable;
    @Input() public options: IModalOptions = {};
    @Output() public onClose: EventEmitter<CustomerOrder> = new EventEmitter();

    private tableConfig: UniTableConfig;
    private order: CustomerOrder;

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

        let selectedLines = this.table.getSelectedRows();
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
