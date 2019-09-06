import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpParams} from '@angular/common/http';
import {RequestMethod} from '@uni-framework/core/http';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs';
import {IUniSaveAction} from '@uni-framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {
    CustomDimensionService,
    DimensionSettingsService,
    ProjectService,
    DepartmentService,
    ErrorService,
    CustomerInvoiceService,
    CustomerQuoteService,
    CustomerOrderService,
    PageStateService
} from '@app/services/services';
import {
    UniTableConfig,
    UniTableColumnType,
    UniTableColumn,
} from '@uni-framework/ui/unitable';
import { IUniTab } from '@app/components/layout/uni-tabs';
import { UniModalService, UniConfirmModalV2, ConfirmActions } from '@uni-framework/uni-modal';
import { ToastType, ToastService } from '@uni-framework/uniToast/toastService';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'uni-dimension-view',
    templateUrl: './dimension.html',
    styleUrls: ['./dimension.sass']
})

export class UniDimensionView implements OnInit {
    currentDimension: any = 5;
    currentItem;
    dimensionList: any[];
    dimensionMetaData;
    numberKey: string;

    tableConfig: UniTableConfig;
    TOFTableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;

    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    model$: BehaviorSubject<any> = new BehaviorSubject(null);

    activeTabIndex: number = 0;
    tabs: IUniTab[] = [
        {name: 'Detaljer'},
        {name: 'Tilbud'},
        {name: 'Ordre'},
        {name: 'Faktura'}
    ];

    numberStrings = ['QuoteNumber', 'OrderNumber', 'InvoiceNumber'];
    dateStrings = ['QuoteDate', 'OrderDate', 'InvoiceDate'];
    dateTitles = ['Tilbudsdato', 'Ordredato', 'Fakturadato'];
    linkResolverValues = ['quotes', 'orders', 'invoices'];
    services = [this.quoteService, this.orderService, this.invoiceService];

    saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: false
        }
    ];

    toolbarconfig: IToolbarConfig = {
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
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService,
        private invoiceService: CustomerInvoiceService,
        private quoteService: CustomerQuoteService,
        private orderService: CustomerOrderService,
        private modalService: UniModalService,
        private toast: ToastService,
        private pageStateService: PageStateService
    ) { }

    public ngOnInit () {

        combineLatest(this.route.params, this.route.queryParams)
            .pipe(map(results => ({params: results[0], query: results[1]})))
            .subscribe(results => {
                this.currentDimension = +results.params['id'];
                this.activeTabIndex = +results.query['tabIndex'] || 0;
                this.getDimensions();
            });
    }

    ngOnDestroy() {
        this.fields$.complete();
        this.model$.complete();
    }

    public addTab() {
        this.pageStateService.setPageState('tabIndex', this.activeTabIndex + '');

        this.tabService.addTab({
            url: this.pageStateService.getUrl(),
            name: 'Dimensjoner',
            active: true,
            moduleID: UniModules.Dimensions
        });
    }

    public getHeaderText(dimension): string {
        if (dimension.ID) {
            return `${dimension[this.numberKey]} - ${dimension.Name}`;
        } else {
            return 'Ingenting å vise';
        }
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
                this.changeTab();
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

        let pageSize = (window.innerHeight - 500);

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        this.tableConfig = new UniTableConfig('dimension.custom', false, true, pageSize)
            .setDeleteButton(true)
            .setColumns([idCol, nameCol])
            .setSearchable(true);
    }

    public onDimensionSelected(dimension) {
        this.currentItem = dimension;
        this.model$.next(this.currentItem);
        this.setUpTOFListTable(this.activeTabIndex);
    }

    private handleRemoveResponseOk() {
        this.toast.addToast('Dimensjonen er slettet', ToastType.good, 2);
    }
    private handleRemoveResponseError(err) {
        this.errorService.handle(err);
        this.refresh();
    }

    private handleDelete(res, dimensionId, dimensionNumber, dimensionName, service, customDimension) {
        if (res === true) {
            this.toast.addToast('Kan ikke slette - dimensjonen er i bruk', ToastType.warn, 2);
            this.refresh();
            return;
        }

        const deleteModal = this.modalService.open(UniConfirmModalV2, {
            header: 'Bekreft sletting',
            message: 'Vil du slette ' + this.getCurrentDimensionLabel() + ': ' + dimensionNumber + ' - ' + dimensionName + '?'
        });
        deleteModal.onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                if (customDimension !== null) {
                    service.Remove(customDimension, dimensionId).subscribe(
                        res2 => {
                            this.handleRemoveResponseOk();
                        },
                        err => {
                            this.handleRemoveResponseError(err);
                        }
                    );
                } else {
                    service.Remove(dimensionId).subscribe(
                        res2 => {
                            this.handleRemoveResponseOk();
                        },
                        err => {
                            this.handleRemoveResponseError(err);
                        }
                    );
                }
            } else {
                this.refresh();
            }
        });
    }

    public onRowDelete(row) {
        const dimensionId = row.ID;
        let dimensionName;//Dersom alle aktuelle har Name, kan row.Name brukes direkte i modalen
        let dimensionNumber;
        let service;
        let custom = false;
        switch (this.currentDimension) {
            case 1: //Project
                dimensionName = row.Name;
                dimensionNumber = row.ProjectNumber;
                service = this.projectService;
                break;
            case 2: // Department
                dimensionName = row.Name;
                dimensionNumber = row.DepartmentNumber;
                service = this.departmentService;
                break;
            case 5: // Custom
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                dimensionName = row.Name;
                dimensionNumber = row.Number;
                service = this.customDimensionService;
                custom = true;
                break;

            default:
                this.toast.addToast('Sletting er ikke implementert for denne dimensjonen', ToastType.warn, 2);
                this.refresh();
                return;
        }

        if (custom) {

            service.checkIfUsed(this.currentDimension, dimensionId).subscribe(res => {
                this.handleDelete(res, dimensionId, dimensionNumber, dimensionName, service, this.currentDimension);
            });

        } else {

            service.ActionWithBody(dimensionId, null, 'is-used', RequestMethod.Get).subscribe(res => {
                this.handleDelete(res, dimensionId, dimensionNumber, dimensionName, service, null);
                /*if (res === true) {
                    this.toast.addToast('Kan ikke slette - dimensjonen er i bruk', ToastType.warn, 2);
                    this.refresh();
                    return;
                }

                const deleteModal = this.modalService.open(UniConfirmModalV2, {
                    header: 'Bekreft sletting',
                    message: 'Vil du slette ' + this.getCurrentDimensionLabel() + ' ' + dimensionId + ' - ' + dimensionName + '?'
                });
                deleteModal.onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        service.Remove(dimensionId).subscribe(
                            res => {
                                this.toast.addToast('Dimensjonen er slettet', ToastType.good, 2);
                            },
                            err => {
                                this.errorService.handle(err);
                                this.refresh();
                            }
                        );
                    } else {
                        this.refresh();
                    }
                });        */
            });
        }
    }

    public changeTab() {
        if (this.activeTabIndex > 0) {
            this.setUpTOFListTable(this.activeTabIndex);
        }
        this.addTab();
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

            this.lookupFunction = (urlParams: HttpParams) => {
                urlParams = urlParams || new HttpParams();
                urlParams = urlParams.set(
                    'expand',
                    'Customer,DefaultDimensions.Project,DefaultDimensions.Dimension' + this.currentDimension
                );

                if (urlParams.get('orderby') === null) {
                    urlParams = urlParams.set('orderby', this.numberStrings[index - 1] + ' desc');
                }

                let filter = urlParams.get('filter') || '';
                if (this.currentItem && this.currentItem.ID) {
                    const dimensionFilter = 'DefaultDimensions.' + fieldString + ' eq ' + this.currentItem.ID;
                    if (filter) {
                        filter += ' and ' + dimensionFilter;
                    } else {
                        filter = dimensionFilter;
                    }
                }

                urlParams = urlParams.set('filter', filter);

                return this.services[index - 1].GetAllByHttpParams(urlParams)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            };

            const idCol = new UniTableColumn( this.numberStrings[index - 1], 'Nr')
                .setLinkResolver(row => `/sales/${this.linkResolverValues[index - 1]}/${row.ID}`);

            const customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
                .setLinkResolver(row => `/sales/customer/${row.Customer.ID}`);

            const nameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text);

            const dateCol = new UniTableColumn(
                this.dateStrings[index - 1],
                this.dateTitles[index - 1],
                UniTableColumnType.LocalDate
            );

            let secondDateCol = index === 3
                ? new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
                : new UniTableColumn('DeliveryDate', 'Leveringsdato', UniTableColumnType.LocalDate);

            secondDateCol = index === 1
                ? new UniTableColumn('ValidUntilDate', 'Gyldig til', UniTableColumnType.LocalDate)
                : secondDateCol;

            const refCol = new UniTableColumn('OurReference', 'Vår referanse');

            const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setTemplate(line => service.getStatusText(line.StatusCode));

            const dimCol = new UniTableColumn(
                'DefaultDimensions.' + fieldString,
                this.getCurrentDimensionLabel(),
                UniTableColumnType.Text
            ).setVisible(false);

            const totalCol = new UniTableColumn('TaxInclusiveAmount', 'Sum', UniTableColumnType.Money);

            this.TOFTableConfig = new UniTableConfig('dimension.tof.list', false)
                .setColumns([idCol, customerNumberCol, nameCol, dateCol, secondDateCol, refCol, statusCol, dimCol, totalCol])
                .setSearchable(true);
        }
    }

    // Called when dimension type is changed in the dropdown
    public dimChange(item) {
        this.router.navigateByUrl('/dimensions/overview/' + item);
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
                this.errorService.handle(err);
                done();
            });
        }
    }
    public refresh() {
        this.model$.next(this.currentItem);
        this.getDimensionlist().subscribe((dims) => {
            this.dimensionList = dims;
        });
    }

    public updateToolbarConfig() {
        this.toolbarconfig.subheads[0].title = this.getCurrentDimensionLabel();
    }

    public getCurrentDimensionLabel() {
        return this.dimensionMetaData.find(item => item.Dimension === this.currentDimension).Label || '';
    }

    public getDefaultDims() {
        return [
            { Label: 'Prosjekt', Dimension: 1 },
            { Label: 'Avdeling', Dimension: 2 },
        ];
    }

    private getDimensionFields(): UniFieldLayout[] {
        this.fields$.next([]);
        switch (this.currentDimension) {
            case 1:  // Project
                return [
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Prosjektnummer',
                        Property: 'ProjectNumber',
                        Placeholder: 'Autogenerert hvis blank',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Prosjektleder',
                        Property: 'ProjectLeadName',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                    }
                ];
            case 2: // Department
                return [
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Avdelingsnummer',
                        Property: 'DepartmentNumber',
                        Placeholder: 'Autogenerert hvis blank',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Avdelingsleder',
                        Property: 'DepartmentManagerName',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                    }
                ];
            default:
                return [
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Nummer',
                        Property: 'Number',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Navn',
                        Property: 'Name',
                    },
                    <any>{
                        FieldType: FieldType.TEXT,
                        Label: 'Beskrivelse',
                        Property: 'Description',
                    },
                    <any>{
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Opprettet',
                        Property: 'CreatedAt',
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

