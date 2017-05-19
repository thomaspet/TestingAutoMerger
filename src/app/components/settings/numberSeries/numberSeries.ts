// tslint:disable:max-line-length
import {Component, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniField, FieldType} from 'uniform-ng2/main';
import {UniTableConfig, UniTableColumn, UniTableColumnType, UniTable} from 'unitable-ng2/main';
import {ErrorService, UserService, GuidService, StatisticsService, YearService, NumberSeriesService, NumberSeriesTypeService, NumberSeriesTaskService} from '../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {Observable} from 'rxjs/Observable';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';

declare var _;
const MAXNUMBER = 2147483647;

@Component({
    selector: 'uni-number-series',
    templateUrl: './numberSeries.html'
})
export class NumberSeries {
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChildren(UniTable) private uniTables: QueryList<UniTable>;

    private series: any[] = [];
    private current: any[] = [];

    private numberseries: any[] = [];
    private types: any[] = [];
    private tasks: any[] = [];
    private currentYear: number;
    private currentSerie: any = this.numberSeriesService.series.find(x => x.ID == 'JournalEntry');
    private asinvoicenumberserie: number = null;
    private customeraccountnumber: number = null;
    private supplieraccountnumber: number = null;

    public hasUnsavedChanges: boolean = false;
    public busy: boolean = false;
    public allYears: boolean = false;

    public seriesTableConfig: UniTableConfig;
    public listTableConfig: UniTableConfig;

    public saveactions: IUniSaveAction[] = [];

    constructor(
        private http: UniHttp,
        private tabService: TabService,
        private errorService: ErrorService,
        private guidService: GuidService,
        private statisticsService: StatisticsService,
        private yearService: YearService,
        private toastService: ToastService,
        private numberSeriesService: NumberSeriesService,
        private numberSeriesTypeService: NumberSeriesTypeService,
        private numberSeriesTaskService: NumberSeriesTaskService
    ) {
        this.series = this.numberSeriesService.series;
        this.initTableConfigs();
        this.initAccountingTableConfig();
        this.updateSaveActions();

        this.yearService.selectedYear$.subscribe(year => {
            this.currentYear = year;
            this.checkSave(true).then( ok => { if (ok) {
               this.requestNumberSerie();
            }});
        });
    }

    public onSerieSelected(event) {
        if (!(event && event.rowModel)) { return; }

        this.currentSerie = event.rowModel;

        this.checkSave(true).then( ok => { if (ok) {
            this.setCurrent(event.rowModel);
        }});
    }

    public updateSaveActions() {
        this.saveactions = [
            {
                label: 'Lagre',
                action: (done) => this.onSaveClicked(done),
                main: true,
                disabled: !this.hasUnsavedChanges
            }];
    }

    public onSaveClicked(done) {
        setTimeout( () => { // Allow the annoying editors to update
            this.busy = true;
            this.Save().then(x => {
                this.busy = false;
                done();
            }).catch(reason => done(reason));
        }, 50);
    }

    private setCurrent(t: any) {
        if (this.uniTables) {
            this.uniTables.last.blur();
        }

        let current = [];

        switch(t.ID) {
            case 'JournalEntry':
                current = this.numberseries.filter(x => x.NumberSeriesType.EntityType == 'JournalEntry' && (this.allYears || x.AccountYear == this.currentYear || x.AccountYear == 0));
                // filter ions first, remove allready added to db
                let journalEntryType = this.types.find(x => x.Name == 'JournalEntry number series type yearly');
                current = current.concat(this.numberSeriesService.suggestions.map(x => {
                    x.AccountYear = this.currentYear;

                    x.NumberSeriesTask = this.tasks.find(y => y.Name == x._Task);
                    x.NumberSeriesTaskID = x.NumberSeriesTask.ID;

                    x.NumberSeriesType = journalEntryType;
                    x.NumberSeriesTypeID = x.NumberSeriesType.ID;

                    x._AsInvoiceNumber = this.numberSeriesService.asinvoicenumber[0];
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'JournalEntry');

                    return x;
                }).filter(x => { // filter allready added suggestions
                    return !current.find(y => x.NumberSeriesTaskID == y.NumberSeriesTaskID);
                }));

                this.initAccountingTableConfig();
                break;
            case 'Sale':
                current = this.numberseries.filter(x => ['CustomerQuote', 'CustomerOrder', 'CustomerInvoice', 'CustomerInvoiceReminder'].indexOf(x.NumberSeriesType.EntityType) >= 0);
                this.initSaleTableConfig();
                break;
            case 'Accounts':
                current = this.numberseries.filter(x => ['Customer', 'Supplier'].indexOf(x.NumberSeriesType.EntityType) >= 0);
                this.initAccountsTableConfig();
                break;
            case 'Others':
                current = this.numberseries.filter(x => ['JournalEntry', 'CustomerQuote', 'CustomerOrder', 'CustomerInvoice', 'Customer', 'Supplier'].indexOf(x.NumberSeriesType.EntityType) < 0)
                this.initOtherSeriesTableConfig();
                break;
        }

        this.current = _.cloneDeep(current);
        this.uniTables.last.refreshTableData();
        this.hasUnsavedChanges = false;
        this.updateSaveActions();
    }

    public canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave(true).then( ok => resolve(ok) );
        });
    }

    private checkSave(ask: boolean): Promise<boolean> {
        return new Promise( (resolve, reject) => {

            // todo: remove timer when uniform has solutions for completing current edit
            setTimeout(() => {

                if (!this.hasUnsavedChanges) {
                    resolve(true);
                    return;
                }
                if (ask) {
                    this.confirmModal.confirm('Lagre endringer før du fortsetter?', 'Lagre endringer?', true)
                    .then( (userChoice: ConfirmActions) => {
                        switch (userChoice) {
                            case ConfirmActions.ACCEPT:
                                this.Save().then( saveResult => resolve(saveResult) );
                                break;

                            case ConfirmActions.CANCEL:
                                resolve(false);
                                break;

                            default:
                                resolve(true);
                                break;
                        }
                    });
                } else {
                    this.Save().then( x => resolve(x) );
                }

            }, 50);
        });
    }

    private Save(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            var all = this.uniTables.last.getVisibleTableData();
            let saveObserveables: Observable<any>[] = all.filter(x => (x._isDirty && this.currentSerie.ID == 'Accounting' && x._rowSelected) || (x._isDirty && this.currentSerie != 'Accounting')).map(x => {
                return this.numberSeriesService.save(x);
            });
            Observable.forkJoin(saveObserveables).subscribe(allSaved => {
                this.toastService.addToast('Lagret', ToastType.good, 7, 'Nummerserier lagret.');
                this.requestNumberSerie(); // Reload all
                resolve(true);
            }, error => {
                resolve(false);
                this.errorService.handle(error);
            });
        });
    }

    public onFormChange(event) {
        this.hasUnsavedChanges = true;
        this.updateSaveActions();
    }

    public onRowChanged(event) {
        this.hasUnsavedChanges = true;
        this.updateSaveActions();

        let row = event.rowModel;
        let index = this.current.findIndex(x => x._originalIndex == row._originalIndex);

        row._isDirty = true;

        if (index >= 0) {
            if (row._AsInvoiceNumber.ID)  {
                row.UseNumbersFromNumberSeriesID = this.asinvoicenumberserie;
                row.NumberSeriesType = this.types.find(x => x.Name == 'JournalEntry number series type not yearly');
                row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                row.AccountYear = 0;
                this.uniTables.last.refreshTableData();
            } else {
                row.NumberSeriesType = this.types.find(x => x.Name == (row._Yearly.ID ? 'JournalEntry number series type Yearly' : 'JournalEntry number series type not yearly'));
                row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                row.UseNumbersFromNumberSeriesID = null;
            }

            if (!row.ID && !row.Name) {
                row.Name = row._DisplayName;
            }

            if (!row.ID && !row.NumberSeriesType && row._Register) {
                row.NumberSeriesType = this.types.find(x => x.EntityType == row._Register.EntityType && x.Yearly == 0);
                row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
            }

            this.current[index] = row;
        } else {
            this.current.push(row);
        }

        this.current = _.cloneDeep(this.current);
    }

    private initTableConfigs() {
        this.seriesTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setColumns([
                new UniTableColumn('Name', '')
            ]);

        this.initOtherSeriesTableConfig();
    }

    private initAccountingTableConfig() {
        this.listTableConfig = new UniTableConfig(true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setMultiRowSelect(true)
            .setColumns([
                new UniTableColumn('_DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(row => !row.ID && row._rowSelected)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(row => row._rowSelected)
                    .setWidth('16rem'),
                new UniTableColumn('FromNumber', 'Fra nr', UniTableColumnType.Number)
                    .setEditable(row => !row.ID && row._rowSelected),
                new UniTableColumn('ToNumber', 'Til nr', UniTableColumnType.Number)
                    .setEditable(row => row._rowSelected)
                    .setTemplate(row => `${row.ToNumber == MAXNUMBER ? 'max' : row.ToNumber ? row.ToNumber : ''}`),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(row => row._rowSelected && !row.ID),
                new UniTableColumn('_Yearly', 'Årlig?', UniTableColumnType.Select)
                    .setTemplate(row => row.NumberSeriesType ? row.NumberSeriesType.Yearly ? 'Årlig' : 'Fortløpende' : '')
                    .setEditable(row => !row.ID && row._rowSelected)
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.yearly
                    }),
                new UniTableColumn('NumberSeriesTask', 'Oppgave', UniTableColumnType.Select)
                    .setEditable(row => !row.ID && row._rowSelected)
                    .setTemplate(row => {
                        if (row.NumberSeriesTask == null) {
                            return 'Bokføring'; // Missing NumberSeriesTask
                        }

                        return row.NumberSeriesTask._DisplayName;
                    })
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        field: 'ID',
                        displayField: '_DisplayName',
                        resource: this.tasks
                    }),
                new UniTableColumn('_Register', 'Register', UniTableColumnType.Select)
                    .setEditable(row => !row.ID && row._rowSelected)
                    .setTemplate(row => row._Register.DisplayName)
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers
                    }),
                new UniTableColumn('_AsInvoiceNumber', 'Lik fakturanr.', UniTableColumnType.Select)
                    .setEditable(row => !row.ID && row._rowSelected && row.Name == 'JournalEntry invoice number series type')
                    .setTemplate(row => row.Name == 'JournalEntry invoice number series type' ? row._AsInvoiceNumber.DisplayName : '')
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        field: 'ID',
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.asinvoicenumber
                    })
            ])
            .setDefaultRowData({
                FromNumber: null,
                ToNumber: null,
                NextNumber: null,
                NumberSeriesTaskID: 0,
                NumberSeriesTask: {},
                _Register: this.numberSeriesService.registers.find(x => x.EntityType == 'JournalEntry'),
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initSaleTableConfig() {
        this.listTableConfig = new UniTableConfig(true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setColumns([
                new UniTableColumn('_DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(row => !row.ID)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(true)
                    .setWidth('16rem'),
                new UniTableColumn('FromNumber', 'Fra nr', UniTableColumnType.Number)
                    .setEditable(row => !row.ID),
                new UniTableColumn('ToNumber', 'Til nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setTemplate(row => `${row.ToNumber == MAXNUMBER ? 'max' : row.ToNumber ? row.ToNumber : ''}`),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(row => !row.ID),
                new UniTableColumn('NumberSeriesTask', 'Oppgave', UniTableColumnType.Select)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => row.NumberSeriesTask ? row.NumberSeriesTask._DisplayName : '')
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        field: 'ID',
                        displayField: '_DisplayName',
                        resource: this.tasks
                    }),
                new UniTableColumn('_Register', 'Register', UniTableColumnType.Select)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => row._Register ? row._Register.DisplayName : '')
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers
                    })
            ])
            .setDefaultRowData({
                Name: null,
                FromNumber: null,
                ToNumber: null,
                NextNumber: null,
                NumberSeriesTaskID: 0,
                NumberSeriesTask: null,
                _DisplayName: '',
                _Register: null,
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initAccountsTableConfig() {
        this.listTableConfig = new UniTableConfig(true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setColumns([
                new UniTableColumn('_DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(row => !row.ID)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(true)
                    .setWidth('16rem'),
                new UniTableColumn('FromNumber', 'Fra nr', UniTableColumnType.Number)
                    .setEditable(row => !row.ID),
                new UniTableColumn('ToNumber', 'Til nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setTemplate(row => `${row.ToNumber == MAXNUMBER ? 'max' : row.ToNumber ? row.ToNumber : ''}`),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(row => !row.ID),
                new UniTableColumn('CollectionAccount', 'Samlekonto', UniTableColumnType.Number)
                    .setEditable(false)
                    .setTemplate(row => {
                        switch (row.Name) {
                            case 'Customer number series':
                                return this.customeraccountnumber.toString();
                            case 'Supplier number series':
                                return this.supplieraccountnumber.toString();
                            default:
                                return '';
                        }
                    })
            ])
            .setDefaultRowData({
                FromNumber: null,
                ToNumber: null,
                NextNumber: null,
                NumberSeriesTaskID: 0,
                NumberSeriesTask: {},
                _Register: null,
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initOtherSeriesTableConfig() {
        this.listTableConfig = new UniTableConfig(true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setColumns([
                new UniTableColumn('_DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(false)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(row => row._rowSelected)
                    .setWidth('16rem'),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(row => row._rowSelected && !row.ID),
                new UniTableColumn('_Register', 'Register', UniTableColumnType.Select)
                    .setEditable(row => !row.ID && row._rowSelected)
                    .setTemplate(row => row._Register && row._Register.DisplayName)
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers
                    })
            ])
            .setDefaultRowData({
                FromNumber: null,
                ToNumber: null,
                NextNumber: null,
                NumberSeriesTaskID: 0,
                NumberSeriesTask: {},
                _Register: null,
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private onRowSelectionChange(event) {
        if (event == null) {
            var all = this.uniTables.last.getTableData();
            this.current = all.map(chosen => {
                return this.setPredefinedOrNot(chosen);
            });
        } else {
            var chosen = this.setPredefinedOrNot(event.rowModel);
            this.current[chosen._originalIndex] = chosen;
        }

        this.current = _.cloneDeep(this.current);
    }

    private setPredefinedOrNot(chosen) {
        if (chosen.ID) {
            chosen._rowSelected = true;
        } else if (chosen._rowSelected) {
            chosen.FromNumber = chosen._FromNumber;
            chosen.ToNumber = chosen._ToNumber;
            chosen.NextNumber = chosen._NextNumber;
            chosen._isDirty = true;
            this.hasUnsavedChanges = true;
        } else {
            chosen.FromNumber = null;
            chosen.ToNumber = null;
            chosen.NextNumber = null;
        }

        return chosen;
    }

    private onEditChange(event) {
        var rowIndex = event.originalIndex;
        var value = event.rowModel[event.field];

        if (!value) {
            return event.rowModel;
        }

        this.hasUnsavedChanges = true;
    }

    public updateTable() {
        this.setCurrent(this.currentSerie);
    }

    private requestNumberSerie() {
        Observable.forkJoin([
            this.numberSeriesTypeService.GetAll(''),
            this.numberSeriesService.getNumberSeriesList(),
            this.numberSeriesTaskService.GetAll(''),
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint('companysettings?hateoas=false&expand=SupplierAccount,CustomerAccount')
                .send().map(response => response.json())
        ]).subscribe(data => {
            let types = data[0];
            let numberseries = data[1];
            let tasks = data[2];
            let settings = data[3][0];

            this.types = types;
            this.tasks = tasks.map(x => this.numberSeriesService.translateTask(x));
            this.customeraccountnumber = settings.CustomerAccount.AccountNumber;
            this.supplieraccountnumber = settings.SupplierAccount.AccountNumber;

            this.asinvoicenumberserie = numberseries.find(x => x.Name == 'Customer Invoice number series').ID
            this.numberseries = this.addCustomFields(numberseries).map(x => {
                if (x.NumberSeriesTask && x.NumberSeriesTask.Name) {
                    x.NumberSeriesTask = this.numberSeriesService.translateTask(x.NumberSeriesTask);
                }

                x._AsInvoiceNumber = this.numberSeriesService.asinvoicenumber[this.asinvoicenumberserie == x.UseNumbersFromNumberSeriesID ? 1 : 0];

                return x;
            });

            // Remove system series from UI
            this.numberseries = this.numberseries.filter(x =>
                ['JournalEntry batch number series', 'Integration test order number series'].indexOf(x.Name) == -1
            )

            this.setCurrent(this.currentSerie);
        }, error => this.errorService.handle(error));
    }

    private addCustomFields(result) {
        return result.map(x => {
            x = this.numberSeriesService.translateSerie(x);
            x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'JournalEntry');

            switch(x.Name) {
                case 'JournalEntry number series Yearly':
                    x._Task = 'Journal';
                    break;
                case 'JournalEntry invoice number series type':
                    x._Task = 'CustomerInvoice';
                    break;
                case 'JournalEntry supplierinvoice number series type':
                    x._Task = 'SupplierInvoice';
                    break;
                case 'JournalEntry salary number series type':
                    x._Task = 'Salary';
                    break;
                case 'JournalEntry bank number series type':
                    x._Task = 'Bank';
                    break;
                case 'JournalEntry vatreport number series type':
                    x._Task = 'VatReport';
                    break;
                case 'Customer Invoice number series':
                    x._Task = 'CustomerInvoice';
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'CustomerInvoice');
                    break;
                case 'Customer Order number series':
                    x._Task = 'Order';
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'CustomerOrder');
                    break;
                case 'Customer Quote number series':
                    x._Task = 'Quote';
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'CustomerQuote');
                    break;
                case 'Customer Invoice Reminder number series':
                    x._Task = 'Reminder';
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'Reminder');
                    break;
                case 'Department number series':
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'Department');
                    break;
                case 'Employee number series':
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'Employee');
                    break;
                case 'Project number series':
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'Project');
                    break;
            }

            x._rowSelected = true;
            if (!x.Name) x.Name = x._DisplayName;

            return x;
        });
    }
}
