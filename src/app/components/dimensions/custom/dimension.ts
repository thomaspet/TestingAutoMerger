import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Project, Department, Region, Responsible} from '../../../unientities';
import {
    CustomDimensionService,
    DimensionSettingsService,
    ProjectService,
    DepartmentService,
    ErrorService,
    CustomerInvoiceService,
    CustomerQuoteService,
    CustomerOrderService
} from '../../../services/services';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {
    UniTableConfig,
    UniTableColumnType,
    UniTableColumn,
    IUniTableConfig,
    UniTable,
    ITableFilter
} from '../../../../framework/ui/unitable/index';

@Component({
    selector: 'uni-dimension-view',
    templateUrl: './dimension.html'
})

export class UniDimensionView implements OnInit {

    @ViewChild(UniTable)
    private table: UniTable;

    public currentDimension: any = 5;
    public currentItem;
    public dimensionList: any[];
    public dimensionMetaData;
    public numberKey: string;
    private tableConfig: IUniTableConfig;
    private TOFTableConfig: IUniTableConfig;

    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private model$: BehaviorSubject<any> = new BehaviorSubject(null);

    public tabs: string[] = ['Detaljer', 'Tilbud', 'Ordre', 'Faktura'];
    public activeTabIndex: number = 0;

    public numberStrings = ['QuoteNumber', 'OrderNumber', 'InvoiceNumber'];
    public dateStrings = ['QuoteDate', 'OrderDate', 'InvoiceDate'];
    public dateTitles = ['Tilbudsdato', 'Ordredato', 'Fakturadato'];
    public linkResolverValues = ['quotes', 'orders', 'invoices'];
    public services = [this.quoteService, this.orderService, this.invoiceService];

    private lookupFunction: (urlParams: URLSearchParams) => any;

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

    public toolbarconfig: IToolbarConfig = {
        title: 'Dimensjoner',
        navigation: {
            add: () => this.add()
        },
        subheads: [ { title: '' } ]
    };

    constructor (
        private tabService: TabService,
        private customDimensionService: CustomDimensionService,
        private dimensionSettingsService: DimensionSettingsService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService,
        private invoiceService: CustomerInvoiceService,
        private quoteService: CustomerQuoteService,
        private orderService: CustomerOrderService
    ) { }

    public ngOnInit () {
        // Subscribe to routes to direct link!
        this.route.params.subscribe((param) => {
            this.currentDimension = +param['id'];

            this.tabService.addTab({
                url: '/dimensions/overview/' + this.currentDimension,
                name: 'Dimensjoner',
                active: true,
                moduleID: UniModules.Dimensions
            });

            this.getDimensions();
        });
    }

    // Gets all dimension-types and adds them to local array, then calls getDimensionsList
    public getDimensions() {
        this.dimensionMetaData = this.getDefaultDims();
        this.dimensionSettingsService.GetAll(null).subscribe((res) => {
            res.forEach((dim) => {
                this.dimensionMetaData.push(dim);
            });
            this.fields$.next(this.getDimensionFields());
            this.getDimensionlist().subscribe((dims) => {
                this.dimensionList = dims;
                this.currentItem = dims.length > 0 ? dims[0] : this.getNewDimension();
                this.model$.next(this.currentItem);
                this.setUpListTable(this.numberKey);
                this.cdr.markForCheck();
                this.updateToolbarConfig();
            });
        });
    }

    // Gets a list of specific dimension type based on currentDimension number
    public getDimensionlist() {
        let query;
        if (this.currentDimension >= 5 && this.currentDimension <= 10) {
            query = this.customDimensionService.getCustomDimensionList(this.currentDimension);
            this.numberKey = 'Number';
        } else if (this.currentDimension === 1) {
           this.numberKey = 'ProjectNumber';
            query = this.projectService.GetAll(null);
        } else if (this.currentDimension === 2) {
            this.numberKey = 'DepartmentNumber';
            query = this.departmentService.GetAll(null);
        }
        return query;
    }

    // Sets up the table to show the list of dimensions at the left side of the view
    public setUpListTable(numberKey: string = 'Number', nameKey: string = 'Name') {
        const idCol = new UniTableColumn(numberKey, 'Nr').setWidth('20%');

        const nameCol = new UniTableColumn(nameKey, 'Navn', UniTableColumnType.Text);

        this.tableConfig = new UniTableConfig('dimension.custom', false)
            .setColumns([idCol, nameCol])
            .setSearchable(true);
    }

    public onRowSelected(item) {
        this.currentItem = item.rowModel;
        this.model$.next(this.currentItem);
        this.setUpTOFListTable(this.activeTabIndex);
    }

    public onTOFRowSelected(item) {
        console.log(item);
        // TODO: What todo when user clicks on tof?
    }

    public changeTab(index: number) {
        this.activeTabIndex = index;
        if (index > 0) {
            this.setUpTOFListTable(index);
        }
    }

    public setUpTOFListTable(index: number) {
        if (!!this.currentItem && !!this.currentItem.ID) {
            let service;

            // Set default field for filter in unitable
            let fieldString = 'Dimension' + this.currentDimension + 'ID';
            fieldString = this.currentDimension === 1 ? 'ProjectID' : fieldString;
            fieldString = this.currentDimension === 2 ? 'DepartmentID' : fieldString;
            fieldString = this.currentDimension === 3 ? 'RegionID' : fieldString;
            fieldString = this.currentDimension === 4 ? 'ResponsibilityID' : fieldString;

            if (index === 1) {
                service = this.quoteService;
            } else if (index === 2) {
                service = this.orderService;
            } else {
                service = this.invoiceService;
            }

            this.lookupFunction = (urlParams: URLSearchParams) => {
                urlParams = urlParams || new URLSearchParams();
                urlParams.set(
                    'expand',
                    'Customer,DefaultDimensions.Project,DefaultDimensions.Dimension' + this.currentDimension
                );

                if (urlParams.get('orderby') === null) {
                    urlParams.set('orderby', this.numberStrings[index - 1] + ' desc');
                }

                    // Custom dimensions
                if (!urlParams.get('filter') && this.currentDimension >= 5) {
                    urlParams.set('filter', 'DefaultDimensions.Dimension' + this.currentDimension + 'ID eq ' + this.currentItem.ID);
                    // Project
                } else if (!urlParams.get('filter') && this.currentDimension === 1) {
                    urlParams.set('filter', 'DefaultDimensions.ProjectID eq ' + this.currentItem.ID);
                    // Department
                } else if (!urlParams.get('filter') && this.currentDimension === 2) {
                    urlParams.set('filter', 'DefaultDimensions.DepartmentID eq ' + this.currentItem.ID);
                    // Region ??
                } else if (!urlParams.get('filter') && this.currentDimension === 3) {
                    urlParams.set('filter', 'DefaultDimensions.RegionID eq ' + this.currentItem.ID);
                    // Responsibility ??
                } else if (!urlParams.get('filter') && this.currentDimension === 4) {
                    urlParams.set('filter', 'DefaultDimensions.ResponsibilityID eq ' + this.currentItem.ID);
                }

                return this.services[index - 1].GetAllByUrlSearchParams(urlParams)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            };

            const idCol = new UniTableColumn( this.numberStrings[index - 1], 'Nr')
                .setWidth('8%')
                .setLinkResolver(row => `/sales/${this.linkResolverValues[index - 1]}/${row.ID}`);

            const customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
                .setWidth('10%')
                .setLinkResolver(row => `/sales/customer/${row.Customer.ID}`);

            const nameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text);

            const dateCol = new UniTableColumn(
                this.dateStrings[index - 1],
                this.dateTitles[index - 1],
                UniTableColumnType.LocalDate).setWidth('15%');

            let secondDateCol = index === 3
                ? new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate).setWidth('15%')
                : new UniTableColumn('DeliveryDate', 'Leveringsdato', UniTableColumnType.LocalDate).setWidth('15%');

            secondDateCol = index === 1
                ? new UniTableColumn('ValidUntilDate', 'Gyldig til', UniTableColumnType.LocalDate).setWidth('15%')
                : secondDateCol;

            const refCol = new UniTableColumn('OurReference', 'Vår referanse');

            const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setTemplate(line => service.getStatusText(line.StatusCode))
                .setWidth('15%');

            const dimCol = new UniTableColumn(
                'DefaultDimensions.' + fieldString,
                this.getCurrentDimensionLabel(),
                UniTableColumnType.Text
            ).setVisible(false);

            const totalCol = new UniTableColumn('TaxInclusiveAmount', 'Sum', UniTableColumnType.Money).setWidth('10%');

            const filter: ITableFilter = {
                field: 'DefaultDimensions.' + fieldString,
                operator: 'eq',
                value: this.currentItem.ID,
                group: 0,
                searchValue: '',
                selectConfig: null
            }

            this.TOFTableConfig = new UniTableConfig('dimension.tof.list', false)
                .setColumns([idCol, customerNumberCol, nameCol, dateCol, secondDateCol, refCol, statusCol, dimCol, totalCol])
                .setFilters([filter])
                .setSearchable(true);
        }
    }

    // Called when dimension type is changed in the dropdown
    public dimChange(item) {
        this.currentDimension = parseInt(item, 10);
        this.fields$.next(this.getDimensionFields());
        this.getDimensionlist().subscribe((dims) => {
            this.dimensionList = dims;
            this.currentItem = dims.length > 0 ? dims[0] : this.getNewDimension();
            this.model$.next(this.currentItem);
            this.activeTabIndex = 0;
            this.setUpListTable(this.numberKey);
            this.cdr.markForCheck();
            this.updateToolbarConfig();
        });
    }

    public add() {
        this.currentItem = this.getNewDimension();
        this.model$.next(this.currentItem);
        this.activeTabIndex = 0;
    }

    public save(done) {
        if (this.checkDimension(done)) {
            const query = this.getSaveOption().subscribe((res) => {
                done('Lagring vellykket');
                this.currentItem = res;
                this.model$.next(this.currentItem);
                this.getDimensionlist().subscribe((dims) => {
                    this.dimensionList = dims;
                });
            },
            (err) => {
                done('Lagring feilet');
            });
        }
    }

    public updateToolbarConfig() {
        this.toolbarconfig.subheads[0].title = this.getCurrentDimensionLabel();
    }

    public getCurrentDimensionLabel() {
        return this.dimensionMetaData.find(item => item.Dimension === this.currentDimension).Label || '';
    }

    public getDefaultDims() {
        return [
            {
                Label: 'Prosjekt',
                Dimension: 1
            },
            {
                Label: 'Avdeling',
                Dimension: 2
            },
            /*{
                Label: 'Ansvar',
                Dimension: 3
            },
            {
                Label: 'Område',
                Dimension: 4
            },*/
        ];
    }

    private getDimensionFields(): UniFieldLayout[] {
        this.fields$.next([]);
        switch (this.currentDimension) {
            case 1:  // Project
                return [
                    <any>{
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosjektnummer',
                        Property: 'ProjectNumber',
                        Placeholder: 'Autogenerert hvis blank',
                        FieldSet: 1,
                        Legend: 'Prosjekt',
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Prosjektleder',
                        Property: 'ProjectLeadName',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    }
                ];
            case 2: // Department
                return [
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Avdelingsnummer',
                        Property: 'DepartmentNumber',
                        Placeholder: 'Autogenerert hvis blank',
                        Legend: 'Avdeling',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Avdelingsleder',
                        Property: 'DepartmentManagerName',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                        FieldSet: 1,
                        FieldSetColumn: 2
                    }
                ];
            default:
                return [
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Nummer',
                        Property: 'Number',
                        FieldSet: 1,
                        FieldSetColumn: 1,
                        Legend: this.dimensionMetaData.find(item => item.Dimension === this.currentDimension).Label
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                        FieldSet: 1,
                        FieldSetColumn: 2,
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                        FieldSet: 1,
                        FieldSetColumn: 1
                    },
                    <any>{
                        FieldType: FieldType.DATE_TIME_PICKER,
                        Label: 'Opprettet',
                        Property: 'CreatedAt',
                        FieldSet: 1,
                        FieldSetColumn: 2,
                        ReadOnly: true
                    }
                ];
        }
    }

    public checkDimension(done): boolean {
        const dim = this.model$.getValue();
        let returnBoolean = true;
        if (!dim) {
            return false;
        }
        switch (this.currentDimension) {
            case 1:
                return true;
            case 2:
                return true;
            default:
                if (!dim.Name || dim.Name === '') {
                    returnBoolean = false;
                    done('Ikke lagret! Dimensjonen må ha et navn');
                } else if (!dim.Number) {
                    returnBoolean = false;
                    done('Ikke lagret! Dimensjonsnummer kan ikke være 0 eller tomt');
                }
        }
        return returnBoolean;
    }

    private getNewDimension() {
        switch (this.currentDimension) {
            case 1:
                return {
                    Name: '',
                    ProjectNumber: undefined,
                    Description: '',
                    ProjectLeadName: ''
                };
            case 2:
                return {
                    Name: '',
                    DepartmentNumber: undefined,
                    Description: '',
                    DepartmentManagerName: ''
                };
            case 3:
                return {
                    Name: '',
                    ID: null,
                    Description: '',
                    NameOfResponsible: ''
                };
            case 4:
                return {
                    Name: '',
                    ID: null,
                    Description: '',
                    RegionCode: ''
                };
            default:
                return {
                    Name: '',
                    Number: null,
                    Description: '',
                };
        }
    }

    private getSaveOption() {
        this.currentItem = this.model$.getValue();
        switch (this.currentDimension) {
            case 1:
                if (this.currentItem.ID) {
                    return this.projectService.Put(this.currentItem.ID, this.currentItem);
                } else {
                    return this.projectService.Post(this.currentItem);
                }
            case 2:
                if (this.currentItem.ID) {
                    return this.departmentService.Put(this.currentItem.ID, this.currentItem);
                } else {
                    return this.departmentService.Post(this.currentItem);
                }
            default:
                return this.customDimensionService.saveCustomDimension(this.currentDimension, this.currentItem);
        }
    }
}

