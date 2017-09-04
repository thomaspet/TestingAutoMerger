import {Component, Input} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {
    StatusCodeCustomerInvoiceItem,
    LocalDate
} from '../../../../unientities';
import {
    StatisticsService,
    ErrorService
} from '../../../../services/services';

@Component({
    selector: 'customer-products-sold',
    templateUrl: './customerProductsSold.html'
})
export class CustomerProductsSold {
    @Input() public customerID: number;

    //Filter
    private datefieldFrom: UniFieldLayout = new UniFieldLayout();
    private datefieldTo: UniFieldLayout = new UniFieldLayout();
    private filterFrom: LocalDate;
    private filterTo: LocalDate;

    //Table
    private tableConfig: UniTableConfig;
    private products$: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(
        private statisticsService: StatisticsService
    ) {
        this.setupFilter();
        this.setupProductTable();
    }

    public ngOnInit() {
        this.loadProducts();
    }

    private setupFilter() {
        this.datefieldFrom.Property = 'From';
        this.datefieldFrom.Placeholder = 'Fra dato';
        this.datefieldTo.Property = 'To';
        this.datefieldTo.Placeholder = 'Til dato';
    }

    private onDateFromChanged(model) {
        this.filterFrom = model.From.currentValue;
        this.loadProducts();
    }

    private onDateToChanged(model) {
        this.filterTo = model.To.currentValue;
        this.loadProducts();
    }

    private loadProducts() {
        let datefilter = '';
        datefilter += (this.filterFrom || '') && ` and CustomerInvoice.InvoiceDate ge '${this.filterFrom}'`;
        datefilter += (this.filterTo || '') && ` and CustomerInvoice.InvoiceDate le '${this.filterTo}'`;

        this.statisticsService
            .GetAllUnwrapped(`model=Product&` +
                             `select=ID,PartName,Name,sum(CustomerInvoiceItem.SumTotalExVat) as TotalExVat,` +
                                `sum(CustomerInvoiceItem.SumTotalIncVat) as TotalIncVat,` +
                                `sum(CustomerInvoiceItem.NumberOfItems) as NumberOfItems&` +
                             `join=Product.ID eq CustomerInvoiceItem.ProductID and CustomerInvoiceItem.CustomerInvoiceID eq CustomerInvoice.ID&` +
                             `filter=CustomerInvoice.CustomerID eq ${this.customerID} and CustomerInvoiceItem.StatusCode eq ${StatusCodeCustomerInvoiceItem.Invoiced}${datefilter}&` +
                             `orderby=sum(CustomerInvoiceItem.NumberOfItems) desc`)
                             .subscribe(products => {
                this.products$.next(products);
            });
    }

    private setupProductTable() {
        // Define columns to use in the table
        let numberOfItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number)
            .setWidth('5rem');
        let partNameCol = new UniTableColumn('ProductPartName', 'Produktnr',  UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((product) => {
                return `<a href='/#/sales/products/${product.ProductID}'>${product.ProductPartName}</a>`;
            });
        let nameCol = new UniTableColumn('ProductName', 'Navn',  UniTableColumnType.Text)
            .setFilterOperator('contains');
        let priceExVatCol = new UniTableColumn('TotalExVat', 'Totalpris eks. mva',  UniTableColumnType.Money)
            .setFilterOperator('eq')
            .setWidth('15%');
        let priceIncVatCol = new UniTableColumn('TotalIncVat', 'Totalpris inkl. mva',  UniTableColumnType.Money)
            .setFilterOperator('eq')
            .setWidth('15%');

        // Setup table
        this.tableConfig = new UniTableConfig('sales.customer.details.productsSold', false, false, 25)
            .setSearchable(true)
            .setColumns([numberOfItemsCol, partNameCol, nameCol, priceExVatCol, priceIncVatCol]);
    }
}
