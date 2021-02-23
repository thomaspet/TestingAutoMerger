import { Component, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { CompanySettingsService, CustomerService, DistributionPlanService, ErrorService, StatisticsService } from '@app/services/services';
import { CompanySettings, Customer, CustomerInvoice, FieldType } from '@uni-entities';
import { IUniTableConfig, UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { IModalOptions, IUniModal} from '../../../../../framework/uni-modal/interfaces';
import { cloneDeep } from 'lodash';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { MultipleCustomerSelection } from '@app/components/common/modals/selectCustomersModal';
import { Observable } from 'rxjs';
import { UniFieldLayout } from '@uni-framework/ui/uniform';
import { UniModalService } from '@uni-framework/uni-modal';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { CustomerEditModal } from '@app/components/common/modals/customer-edit-modal/customer-edit-modal';

@Component({
    selector: 'wizard-mass-invoice',
    templateUrl: './mass-invoice-wizard.html',
    styleUrls: ['./mass-invoice-wizard.sass']
})
export class MassInvoiceWizardModal implements IUniModal {
    @ViewChild("viewCustomers") viewTable: AgGridWrapper;

    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean = false;
    showGridSelection: boolean = false;
    selectedCustomers: MultipleCustomerSelection[] = [];
    customersClone: MultipleCustomerSelection[] = [];
    invoice: CustomerInvoice;
    tableConfig: IUniTableConfig;
    selectionTableConfig: IUniTableConfig;

    STEPS: {[id: string]: number} = {
        BatchInvoiceSettings: 0,
        Customers: 1,
        Complete: 2,
    }

    currentStep: number = this.STEPS.BatchInvoiceSettings;
    lastStep: number = this.STEPS.Complete;

    formFields: UniFieldLayout[];
    canDistribute: boolean = false;
    withinLockedDate: boolean = false;
    notifyEmail: boolean = false;

    lockedMva: Date;
    lockedAccounting: Date;

    transactionsLookupFunction: (HttpParams) => Observable<HttpResponse<any>>;

    customers: {[id: number]: MultipleCustomerSelection} = {};
    settings: CompanySettings;
    selectedRowCount: number;
    hasDistributionMap: {number?: boolean} = {};
    distributionMap: {number?: any} = {};
    distributionPlan: any;

    public selectString: string = 
        'Customer.ID as ID,' +
        'Info.Name as Name,' +
        'DefaultEmail.EmailAddress as DefaultEmail,' +
        'DefaultPhone.Number as DefaultPhone,' +
        'Customer.OrgNumber as OrgNumber,' +
        'InvoiceAddress.AddressLine1 as AddressLine1,' +
        'InvoiceAddress.PostalCode as PostalCode,' +
        'InvoiceAddress.City as City,' +
        'Customer.CustomerNumber as CustomerNumber,' +
        'Customer.StatusCode as StatusCode';

    private customerExpands: string[] = [
        'Info.Addresses',
        'Info.DefaultContact.Info',
        'Info.Emails',
        'Info.DefaultEmail',
        'Info.Contacts.Info',
        'Info.DefaultPhone',
        'Info.Phones',
        'Distributions'
    ];

    constructor(
        private statisticsService: StatisticsService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private customerService: CustomerService,
        private modalService: UniModalService,
        private distributionPlanService: DistributionPlanService
    ) {  }

    public ngOnInit() {
        this.busy = true;
        this.selectedCustomers =  this.options?.data?.customers ? cloneDeep(this.options?.data?.customers) : []; // Clone it to avoid modifying the original
        this.selectedRowCount = this.selectedCustomers.length;
        this.showGridSelection = this.selectedRowCount === 0;

        this.invoice = this.options?.data?.invoice;

        this.formFields = this.getFormFields();

        Observable.forkJoin([
            this.companySettingsService.getCompanySettings(['Distributions']),
            this.distributionPlanService.getForCustomers(this.selectedCustomers.map(sc => sc.ID)),
            this.distributionPlanService.Get(this.invoice?.DistributionPlanID, ["Elements"])
        ])
         .finally(() => this.busy = false)
         .subscribe(([settings, distributionmap, distributionplan]: [CompanySettings, any, any]) => {
                this.settings = settings;
                this.distributionMap = distributionmap;

                // Fallback to company settings defaultplan
                if (!distributionplan?.Elements?.length) {
                    this.distributionPlanService.Get(settings?.Distributions?.CustomerInvoiceDistributionPlanID, ["Elements"])
                        .subscribe(plan => {
                            this.distributionPlan = plan;
                            this.canDistribute = !!plan?.Elements?.length;
                    })
                } else {
                    this.distributionPlan = distributionplan;
                    this.canDistribute = !!distributionplan?.Elements?.length;
                }

                // Is the invoicedate within a locked vat/accounting period
                this.lockedMva = new Date(`${settings.VatLockedDate}`); // doesn't seem to be a localdate here, just a string.
                this.lockedAccounting = new Date(`${settings.AccountingLockedDate}`);
                const invoiceDate = new Date(`${this.invoice.InvoiceDate}`);

                this.withinLockedDate = this.lockedMva >= invoiceDate || this.lockedAccounting >= invoiceDate;

                // Populate the valid distribution map
                if (this.selectedRowCount) {
                    this.selectedCustomers?.forEach(customer => {
                        this.customers[customer.ID] = customer;

                        this.hasDistributionMap[customer.ID] = {
                            valid: distributionmap[customer.ID]?.some(dpt => dpt.IsValid),
                            first: this.chooseDistribution(customer)
                        };
                    });
                }

                // Set up view and edit tables
                this.setupViewCustomersTable();
                this.setupSelectCustomersTable();
            });

        this.transactionsLookupFunction = (urlParams: HttpParams) => 
            this.getTableData(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
    }

    public goToDistributionSettings(): void {
        window.open("#/settings/distribution");
    }

    public cancelSelection(): void {
        this.showGridSelection = false;
        this.close();
    }

    public lagreSelection(): void {
        // Only query a new lookup map if there's a missing customer.
        if (this.selectedCustomers.every(c => this.distributionMap[c.ID])){
            this.showGridSelection = false;
            return;
        }

        this.busy = true;
        this.distributionPlanService.getForCustomers(this.selectedCustomers.map(sc => sc.ID))
            .finally(() => {
                this.busy = false;
                this.showGridSelection = false;
            })
            .subscribe(dpm => {
            this.distributionMap = dpm;

            if (this.selectedRowCount) {
                this.selectedCustomers?.forEach(customer => {
                    this.customers[customer.ID] = customer;

                    this.hasDistributionMap[customer.ID] = {
                        valid: dpm[customer.ID]?.some(dpt => dpt.IsValid),
                        first: this.chooseDistribution(customer)
                    };
                });
            }
        })
    }

    public onDeleteRow(deletedRow: MultipleCustomerSelection): void {
        if (deletedRow?.ID) {
            delete this.customers[deletedRow.ID];
            this.selectedCustomers = Object.values(this.customers)
            this.selectedRowCount = this.selectedCustomers.length;
        }
    };

    public previous(): void {
        if (this.currentStep > 0) {
            this.currentStep--;
        }
    }

    public next(): void {
        if (this.currentStep < this.lastStep) {
            this.currentStep++;
        }
    }

    public close(): void {
        this.onClose.emit({success: false});
    }

    public saveBatchInvoice(): void {
        const customers = this.customers ? Object.values(this.customers) : null;
        this.onClose.emit({
            customers: customers.length > 0 ? customers : null,
            invoice: this.invoice,
            notifyEmail: this.notifyEmail,
            success: true
        });
    }

    public onFormEdit(): void {
        this.lockedMva = new Date(`${this.settings.VatLockedDate}`); // It doesn't seem to be a localdate here, just a string.
        this.lockedAccounting = new Date(`${this.settings.AccountingLockedDate}`);
        const invoiceDate = new Date(`${this.invoice.InvoiceDate}`);

        this.withinLockedDate = this.lockedMva >= invoiceDate || this.lockedAccounting >= invoiceDate;
    }

    private openCustomerEditModal(row: MultipleCustomerSelection): void {
        this.busy = true;
        this.customerService.Get(row.ID, this.customerExpands).subscribe(customer => {
            this.modalService.open(CustomerEditModal, { data: { customer } })
                .onClose
                .finally(() => this.busy = false)
                .subscribe((c: Customer) => {
                    if (!c) return;

                    const newRow: MultipleCustomerSelection = {
                        AddressLine1: c.Info?.InvoiceAddress?.AddressLine1,
                        City: c.Info?.InvoiceAddress?.City,
                        CustomerNumber: c.CustomerNumber,
                        DefaultEmail: c.Info?.DefaultEmail?.EmailAddress,
                        ID: c.ID,
                        Name: c.Info?.Name,
                        OrgNumber: +c.OrgNumber,
                        PostalCode: c.Info?.InvoiceAddress?.PostalCode,
                        DefaultPhone: c.Info?.DefaultPhone?.Number
                    }
                    const index = this.selectedCustomers.findIndex(c => c.ID === newRow.ID);
                    this.selectedCustomers[index] = newRow;
                    this.customers[newRow.ID] = newRow;

                    this.distributionPlanService.getForCustomer(c.ID).subscribe(dpts => {
                        this.hasDistributionMap[row.ID] = {
                            valid: dpts?.some(dpt => dpt.IsValid),
                            first: this.chooseDistribution(row)
                        };
                        this.distributionMap[c.ID] = dpts;
                        this.viewTable.refreshTableData();
                    })
                });
        })
    }

    private setupViewCustomersTable(): void {
        const columns = [
            new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Number)
                .setAlignment("left")
                .setMaxWidth(100),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                .setLinkClick(r => this.openCustomerEditModal(r))
                .setCellTitleResolver(() => "Trykk for å redigere kunde")
                .setFilterOperator('contains'),
            new UniTableColumn('AddressLine1', 'Adresse', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setVisible(false),
            new UniTableColumn('City', 'Poststed', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(this.getPostal)
                .setVisible(false),
            new UniTableColumn("DefaultPhone", "Telefon", UniTableColumnType.Text)
                .setFilterOperator('contains'),
            new UniTableColumn('DefaultEmail', 'E-post', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setFilterOperator('eq'),
            new UniTableColumn('OrgNumber', 'Orgnummer', UniTableColumnType.Number)
                .setFilterOperator('eq')
                .setVisible(false),
            new UniTableColumn("Distributions", "Utsendelse", UniTableColumnType.Text)
                .setTemplate((row) => this.chooseDistribution(row))
                .setTooltipResolver(r => {
                    if (this.hasDistributionMap) {
                        const map_ = this.hasDistributionMap[r.ID];
                        if (!map_?.valid) {
                            return {
                                text: "Denne kunden kan ikke motta faktura etter oppsatt utsendeleseplan. Vi anbefaler derfor at du legger inn epost adresse på kunden. Dette gjør du ved å klikke på kundenavnet i listen. Fakturaen vil da bli sendt på epost.",
                                type: "bad",
                            };
                        }

                        if (map_.first === "VippsInvoice" && !this.distributionMap[r.ID]?.find(dm => dm.ElementTypeName === "Email").IsValid) {
                            return {
                                text: "Vipps kan feile om kunden ikke er registret hos vipps eller har fakturamottak skrudd av. Vi anbefaler å legge til en Epost som backup",
                                type: "neutral"
                            }
                        }
                    }
                }),
        ];

        const tableName = 'sales.invoice.customerViewModal';
        this.tableConfig = new UniTableConfig(tableName, false, false, 15)
            .setMultiRowSelect(false)
            .setEntityType('Customer')
            .setColumns(columns)
            .setDeleteButton(true)
            .setButtons([{
                action: () => this.showGridSelection=true,
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
            new UniTableColumn('DefaultPhone.Number', 'Telefon', UniTableColumnType.Text)
                .setAlias("DefaultPhone")
                .setFilterOperator('contains'),
            new UniTableColumn('OrgNumber', 'Orgnummer', UniTableColumnType.Number)
                .setFilterOperator('eq'),
        ];

        const tableName = 'sales.invoice.customerSelectModal';
        this.selectionTableConfig = new UniTableConfig(tableName, false, false)
            .setMultiRowSelect(true)
            .setHideRowCount(true)
            .setCustomRowSelection({
                isRowSelected: (row: MultipleCustomerSelection) => !!this.customers[row.ID],
                onSelectionChange: event => {
                    if (event.allRowsUnchecked) {
                        this.customers = {};
                        this.selectedCustomers = [];
                    } else {
                        event.changes.forEach(change => {
                            const customer = change.row;
                            if (change.selected) {
                                this.customers[customer.ID] = customer;
                            } else {
                                delete this.customers[customer.ID];
                            }
                            this.selectedCustomers = Object.values(this.customers)
                        });
                    }

                    this.selectedRowCount = this.selectedCustomers.length;
                }
            })
            .setEntityType('Customer')
            .setColumns(columns)
            .setSearchable(true);
    }

    private chooseDistribution(row): string {
        const distributions = this.distributionMap[row.ID];
        const planElementTypes = this.distributionPlan?.Elements;

        const lookup = [];

        if (!planElementTypes || planElementTypes.length === 0) return "Kan ikke sendes";

        for (const pet of planElementTypes) {
            const dist = distributions?.find(di => pet.DistributionPlanElementTypeID === di.ElementType)
            lookup.push({...dist, priority: pet.Priority});
        }

        const dist = lookup.sort((a, b) => a.priority - b.priority);
        const firstValid = dist?.find(d => d.IsValid);

        return firstValid?.ElementTypeName ?? "Kan ikke sendes";
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
        params = params.set('expand', 'Info.InvoiceAddress,Info.DefaultEmail,Info.DefaultPhone');

        // inactive + deleted
        let filter = params.get("filter") || "";

        if (filter) {
            filter = `${filter} and `;
        }

        params = params.set('filter', `${filter}(StatusCode ne 50001 and StatusCode ne 90001)`);
        params = params.set('select', this.selectString);

        return this.statisticsService.GetAllByHttpParams(params);
    }

    private getFormFields(): UniFieldLayout[] {
        const fields = [];

        fields.push(
            {
                Property: 'InvoiceDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Fakturadato',
            },
            {
                Property: 'PaymentDueDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato'
            },
            {
                Property: 'OurReference',
                FieldType: FieldType.TEXT,
                Label: 'Vår refereranse',
                Placeholder: `Hentes fra fakturakladd`
            },
            {
                Property: 'YourReference',
                FieldType: FieldType.TEXT,
                Label: 'Deres refereranse',
                Placeholder: `Hentes fra fakturakladd`
            },
            {
                Property: 'FreeTxt',
                FieldType: FieldType.TEXTAREA,
                Label: 'Fritekst'
            }
        );

        return fields;
    }
}
