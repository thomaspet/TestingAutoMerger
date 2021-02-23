import { HttpParams, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter } from '@angular/core';
import { ErrorService, StatisticsService } from '@app/services/services';
import { IModalOptions, IUniModal} from '../../../../framework/uni-modal/interfaces';
import {
    IUniTableConfig,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '@uni-framework/ui/unitable';
import { cloneDeep } from 'lodash';
import { Customer } from '@uni-entities';
import { Observable } from 'rxjs';

export interface MultipleCustomerSelection {
    ID: number,
    CustomerNumber?: number,
    Name?: string,
    OrgNumber?: number,
    City?: string,
    PostalCode?: string,
    AddressLine1?: string,
    DefaultEmail?: string,
    DefaultPhone?: string,
}

@Component({
    selector: 'select-customers-modal',
    template: `
        <section role="dialog" class="uni-modal medium" style="height:100%">
            <header>Velg kunder</header>
            <article style="height:100%">
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>

                <ag-grid-wrapper
                    *ngIf="showGridSelection"
                    class="borders"
                    style="font-size: 15px; max-height: 100%;"
                    [resource]="transactionsLookupFunction"
                    [config]="tableConfig">
                </ag-grid-wrapper>

                <ag-grid-wrapper
                    *ngIf="!showGridSelection"
                    style="font-size: 15px;"
                    [resource]="selectedCustomers"
                    [config]="viewTableConfig"
                    (rowDelete)="onDeleteRow($event)"
                >
                </ag-grid-wrapper>
            </article>
            <footer>
                <span *ngIf="selectedRowCount" class="pull-left">
                    {{selectedRowCount}} kunder valgt
                </span>

                <button class="secondary" (click)="onClose.emit()">
                    Avbryt
                </button>
                <button class="c2a" (click)="closeAndEmitCustomers()">
                    Lagre
                </button>
            </footer>
        </section>
    `,
    styles: [":host {height: 70%}"]
})
export class SelectCustomersModal implements IUniModal {
    options: IModalOptions;
    onClose = new EventEmitter<MultipleCustomerSelection[]>(false);

    customers: {[id: number]: MultipleCustomerSelection} = {};
    selectedCustomers: MultipleCustomerSelection[] = [];
    selectedRowCount: number;

    busy: boolean = false;
    showGridSelection: boolean = false;
    tableConfig: IUniTableConfig;
    viewTableConfig: IUniTableConfig;
    transactionsLookupFunction: (HttpParams) => Observable<HttpResponse<any>>;

    public selectString: string =
        'Customer.ID as ID,' +
        'Info.Name as Name,' +
        'DefaultEmail.EmailAddress as DefaultEmail,' +
        'Customer.OrgNumber as OrgNumber,' +
        'InvoiceAddress.AddressLine1 as AddressLine1,' +
        'InvoiceAddress.PostalCode as PostalCode,' +
        'InvoiceAddress.City as City,' +
        'Customer.CustomerNumber as CustomerNumber,' +
        'Customer.StatusCode as StatusCode';

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
    ) {}

    public ngOnInit(): void {
        // A different way to handle a sinlge customer as the only time it should happen
        // is when we transition from the normal smart search to the grid, and we want
        // to include a previously locked in customer.
        if (this.options?.data?.customer) {
            const c: Customer = cloneDeep(this.options?.data?.customer);

            this.selectedCustomers = [{
                ID: c.ID,
                CustomerNumber: c.CustomerNumber,
                Name: c.Info?.Name,
                OrgNumber: +c.OrgNumber,
                City: c.Info?.InvoiceAddress?.City,
                PostalCode: c.Info?.InvoiceAddress?.PostalCode,
                AddressLine1: c.Info?.InvoiceAddress?.AddressLine1,
                DefaultEmail: c.Info?.DefaultEmail?.EmailAddress,
                DefaultPhone: c.Info?.DefaultPhone?.Number,
            }];
        } else if (this.options?.data?.customers) {
            this.selectedCustomers = cloneDeep(this.options?.data?.customers);
        } // multiple

        this.selectedRowCount = this.selectedCustomers?.length;
        if (this.selectedRowCount) {
            this.selectedCustomers?.forEach(customer => this.customers[customer.ID] = customer);
        }

        if (!this.selectedRowCount || this.options?.data?.customer) {
            this.showGridSelection = true;
        }

        this.setupViewCustomersTable();
        this.setupSelectCustomersTable();

        this.transactionsLookupFunction = (urlParams: HttpParams) =>
            this.getTableData(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
    }

    public ngOnDestroy(): void {
        this.customers = {};
        this.selectedCustomers = [];
        this.selectedRowCount = 0;
    }

    public closeAndEmitCustomers(): void {
        if (this.showGridSelection) {
            this.onClose.emit(Object.values(this.customers));
        } else {
            this.onClose.emit(this.selectedCustomers);
        }
    }

    public onDeleteRow(deletedRow: MultipleCustomerSelection): void {
        if (deletedRow?.ID) {
            delete this.customers[deletedRow.ID];
            this.selectedCustomers = Object.values(this.customers)
            this.selectedRowCount = this.selectedCustomers.length;
        }
    };

    private setupViewCustomersTable(): void {
        const columns = [
            new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Number)
                .setAlignment("left"),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                .setFilterOperator('contains'),
            new UniTableColumn('AddressLine1', 'Adresse', UniTableColumnType.Text)
                .setFilterOperator('contains'),
            new UniTableColumn('City', 'Poststed', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(this.getPostal),
            new UniTableColumn('DefaultEmail', 'E-post', UniTableColumnType.Text)
                .setFilterOperator('contains'),
            new UniTableColumn('OrgNumber', 'Orgnummer', UniTableColumnType.Number)
                .setFilterOperator('eq'),
        ];

        const tableName = 'sales.invoice.customerViewModal';
        this.viewTableConfig = new UniTableConfig(tableName, false, false, 15)
            .setMultiRowSelect(false)
            .setEntityType('Customer')
            .setColumns(columns)
            .setDeleteButton(true)
            .setButtons([{
                action: () => this.showGridSelection = true,
                label: "+ Legg til flere",
                class: "tertiary c2a"
            }], true)
            .setSearchable(true);
    }

    private setupSelectCustomersTable(): void {
        const columns = [
            new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Number)
                .setAlignment("left"),
            new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text)
                .setAlias("Name")
                .setFilterOperator('contains'),
            new UniTableColumn('InvoiceAddress.AddressLine1', 'Adresse', UniTableColumnType.Text)
                .setAlias("AddressLine1")
                .setFilterOperator('contains'),
            new UniTableColumn('InvoiceAddress.City', 'Poststed', UniTableColumnType.Text)
                .setAlias("City")
                .setFilterOperator('contains')
                .setTemplate(this.getPostal),
            new UniTableColumn('DefaultEmail.EmailAddress', 'E-post', UniTableColumnType.Text)
                .setAlias("DefaultEmail")
                .setFilterOperator('contains'),
            new UniTableColumn('OrgNumber', 'Orgnummer', UniTableColumnType.Number)
                .setFilterOperator('eq'),
        ];

        const tableName = 'sales.invoice.customerSelectModal';

        this.tableConfig = new UniTableConfig(tableName, false, false)
            .setHideRowCount(true)
            .setMultiRowSelect(true)
            .setCustomRowSelection({
                isRowSelected: row => !!this.customers[row.ID],
                onSelectionChange: event => {
                    if (event.allRowsUnchecked) {
                        this.customers = {};
                    } else {
                        event.changes.forEach(change => {
                            const customer = change.row;
                            if (change.selected) {
                                this.customers[customer.ID] = customer;
                            } else {
                                delete this.customers[customer.ID];
                            }
                        });
                    }

                    this.selectedCustomers = Object.values(this.customers)
                    this.selectedRowCount = this.selectedCustomers.length;
                }
            })
            .setEntityType('Customer')
            .setColumns(columns)
            .setSearchable(true);
    }

    private getPostal(customer: MultipleCustomerSelection): string {
        if (customer?.PostalCode || customer?.City) {
            return `${customer.PostalCode} ${customer.City}`;
        }
        return "";
    }

    private getTableData(urlParams: HttpParams): Observable<HttpResponse<any>> {
        let params = urlParams || new HttpParams();

        params = params.set('model', 'Customer');
        params = params.set('expand', 'Info.InvoiceAddress,Info.DefaultEmail');

        // inactive + deleted
        let filter = params.get("filter") || "";

        if (filter) {
            filter = `${filter} and `;
        }

        params = params.set('filter', `${filter}(StatusCode ne 50001 and StatusCode ne 90001)`);
        params = params.set('select', this.selectString);

        return this.statisticsService.GetAllByHttpParams(params);
    }
}
