// tslint:disable:max-line-length
import {Component, ViewChildren, QueryList} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniTableConfig, UniTableColumn, UniTableColumnType, UniTable} from '../../../../framework/ui/unitable/index';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';
import {Observable} from 'rxjs/Observable';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';

import {
    Account
} from '../../../../unientities';

import {
    ErrorService,
    GuidService,
    StatisticsService,
    YearService,
    NumberSeriesService,
    NumberSeriesTypeService,
    NumberSeriesTaskService,
    AccountService
} from '../../../services/services';

declare var _;
const MAXNUMBER = 2147483647;
const MININVOICENUMBER = 100000;

@Component({
    selector: 'uni-number-series',
    templateUrl: './numberSeries.html'
})
export class NumberSeries {
    @ViewChildren(UniTable)
    private uniTables: QueryList<UniTable>;

    private series: any[] = [];
    private current: any[] = [];

    private numberseries: any[] = [];
    private types: any[] = [];
    private tasks: any[] = [];
    private currentYear: number;
    private currentSerie: any = this.numberSeriesService.series.find(x => x.ID == 'JournalEntry');
    private asinvoicenumberserie: number = null;
    private customerAccount: Account = null;
    private supplierAccount: Account = null;

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
        private numberSeriesTaskService: NumberSeriesTaskService,
        private modalService: UniModalService,
        private accountService: AccountService
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
                disabled: false
            }];
    }

    public onSaveClicked(done) {
        setTimeout( () => { // Allow the annoying editors to update
            this.busy = true;
            this.Save().then(x => {
                this.busy = false;
                done('Lagret');
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
                current = this.numberseries.filter(x => x.NumberSeriesType.EntityType == 'JournalEntry' && (this.allYears || x.AccountYear == this.currentYear || !x.AccountYear));
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
    }

    public canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave(true).then( ok => resolve(ok) );
        });
    }

    private checkSave(confirmBeforeSave: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // Allow changes to reach the component
            setTimeout(() => {
                if (!this.hasUnsavedChanges) {
                    resolve(true);
                    return;
                }

                if (confirmBeforeSave) {
                    this.modalService.confirm({
                        header: 'Lagre endringer?',
                        message: 'Ønsker du å lagre endringene før vi fortsetter?',
                        buttonLabels: {
                            accept: 'Lagre',
                            reject: 'Forkast',
                            cancel: 'Avbryt'
                        },
                        activateClickOutside: false
                    }).onClose.subscribe(response => {
                        switch (response) {
                            case ConfirmActions.ACCEPT:
                                this.Save().then(saveResult => resolve(saveResult));
                            break;
                            case ConfirmActions.REJECT:
                                resolve(true);
                            break;
                            default:
                                resolve(false);
                            break;
                        }
                    });

                } else {
                    this.Save().then(x => resolve(x));
                }
            });
        });
    }

    private Save(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            var all = this.uniTables.last.getVisibleTableData();
            let saveObserveables: Observable<any>[] = all.filter(x => (x._isDirty && this.currentSerie.ID == 'Accounting' && x._rowSelected) || (x._isDirty && this.currentSerie != 'Accounting')).map(x => {
                delete x.MainAccount;
                return this.numberSeriesService.save(x);
            });
            if (saveObserveables.length == 0) { resolve(true); }
            else {
                Observable.forkJoin(saveObserveables).subscribe(allSaved => {
                    this.toastService.addToast('Lagret', ToastType.good, 7, 'Nummerserier lagret.');
                    this.requestNumberSerie(); // Reload all
                    resolve(true);
                }, error => {
                    resolve(false);
                    this.errorService.handle(error);
                });
            }
        });
    }

    public onFormChange(event) {
        this.hasUnsavedChanges = true;
    }

    public onRowChanged(event) {
        this.hasUnsavedChanges = true;

        let row = event.rowModel;
        let index = this.current.findIndex(x => x._originalIndex == row._originalIndex);

        row._isDirty = true;

        if (index >= 0) {
            if (!row.ID && !row.Name) {
                row.Name = row._DisplayName;
            }

            if (!row.ID && row.FromNumber && (!row.NextNumber || row.NextNumber < row.FromNumber)) {
                row.NextNumber = row.FromNumber;
            }

            if (row.MainAccount) {
                row.MainAccountID = row.MainAccount.ID;
            }

            if (!row.ID && row._Yearly) {
                row.AccountYear = row._Yearly.ID ? this.currentYear : 0;
            }

            if (row._AsInvoiceNumber.ID && (row.UseNumbersFromNumberSeriesID === null || row.UseNumbersFromNumberSeriesID == 0)) {
                this.modalService.confirm({
                    header: 'Vennligst bekreft',
                    message: 'Vennligst bekreft operasjon. Endring kan ikke omgjøres etter lagring'
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        row.UseNumbersFromNumberSeriesID = this.asinvoicenumberserie;
                        row.NumberSeriesType = this.types.find(x => x.Name == 'JournalEntry number series type NOT yearly');
                        row.AccountYear = 0;

                        row.FromNumber = MININVOICENUMBER;
                        row.NextNumber = MININVOICENUMBER;
                        row.ToNumber = MAXNUMBER;
                    } else {
                        row.UseNumbersFromNumberSerieID = null;
                        row.NumberSeriesType = this.types.find(x => x.Name == 'JournalEntry number series type yearly');

                        row._AsInvoiceNumber = this.numberSeriesService.asinvoicenumber.find(x => !x.ID);
                    }

                    row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                    this.current[index] = row;
                    this.current = _.cloneDeep(this.current);
                });

            } else {
                if (row._Register) {
                    if (row._Register.EntityType !== 'JournalEntry') {
                        row.NumberSeriesType = this.types.find(x => x.EntityType === row._Register.EntityType);
                        row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                    } else {
                        row.NumberSeriesType = this.types.find(x => x.Name == (row._Yearly && row._Yearly.ID ? 'JournalEntry number series type yearly' : 'JournalEntry number series type NOT yearly'));
                        row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                        if (!row.NumberSeriesType.Yearly) {
                            row.AccountYear = 0;
                        }
                    }
                }

                row.UseNumbersFromNumberSeriesID = null;

                this.current[index] = row;
                this.current = _.cloneDeep(this.current);
            }
        } else {
            this.current.push(row);
            this.current = _.cloneDeep(this.current);
        }
    }

    private initTableConfigs() {
        this.seriesTableConfig = new UniTableConfig('settings.numberSeries.series', false, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setColumns([
                new UniTableColumn('Name', '')
            ]);

        this.initOtherSeriesTableConfig();
    }

    private initAccountingTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.accountingList', true, true, 15)
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
                    .setEditable(row => row._rowSelected),
                new UniTableColumn('_Yearly', 'Årlig?', UniTableColumnType.Select)
                    .setTemplate(row => row.NumberSeriesType ? row.NumberSeriesType.Yearly ? 'Årlig' : 'Fortløpende' : '')
                    .setEditable(row => !row.ID && row._rowSelected)
                    .setEditorOptions({
                        hideNotChosenOption: false,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.yearly
                    }),
                new UniTableColumn('NumberSeriesTask', 'Oppgave', UniTableColumnType.Select)
                    .setEditable(x => !x.row)
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
                        resource: this.tasks.filter(x => x.EntityType == 'JournalEntry')
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
            .setChangeCallback(event => this.onRowChanged(event))
            .setDefaultRowData({
                NumberSeriesTask: this.tasks.find(x => x.Name == 'Journal'),
                _Register: this.numberSeriesService.registers.find(x => x.EntityType == 'JournalEntry'),
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initSaleTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.salesList', true, true, 15)
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
                    .setEditable(true),
                new UniTableColumn('NumberSeriesTask', 'Oppgave', UniTableColumnType.Select)
                    .setVisible(false) // Hidden because we haven't defined any tasks for sales numberseries yet
                    .setEditable(row => !row.ID)
                    .setTemplate(row => row.NumberSeriesTask ? row.NumberSeriesTask._DisplayName : '')
                    .setEditorOptions({
                        hideNotChosenOption: false,
                        field: 'ID',
                        displayField: '_DisplayName',
                        resource: this.tasks.filter(x => x.EntityType != 'JournalEntry')
                    }),
                new UniTableColumn('_Register', 'Register', UniTableColumnType.Select)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => row._Register ? row._Register.DisplayName : '')
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers.filter(x => x.Sale)
                    })
            ])
            .setChangeCallback(event => this.onRowChanged(event))
            .setDefaultRowData({
                _DisplayName: '',
                _Register: null,
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initAccountsTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.accountList', true, true, 15)
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
                    .setEditable(true),
                new UniTableColumn('_Register', 'Register', UniTableColumnType.Select)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => row._Register ? row._Register.DisplayName : '')
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers.filter(x => x.EntityType === 'Customer' || x.EntityType === 'Supplier')
                    }),
                new UniTableColumn('MainAccount', 'Samlekonto', UniTableColumnType.Lookup)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => {
                        let account;
                        if (row.MainAccount) {
                            account = row.MainAccount;
                        } else if (row.ID) {
                            switch (row._Register.EntityType) {
                                case 'Customer':
                                    account = this.customerAccount;
                                case 'Supplier':
                                    account = this.supplierAccount;
                            }
                        }

                        return account
                            ? account.AccountNumber + ': ' + account.AccountName
                            : '';
                    })
                    .setEditorOptions({
                        itemTemplate: (selectedItem) => {
                            return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                        },
                        lookupFunction: (searchValue) => {
                            return this.accountSearch(searchValue);
                        }
                    }),
                ])
            .setChangeCallback(event => this.onRowChanged(event))
            .setDefaultRowData({
                _Register: this.numberSeriesService.registers.find(x => x.EntityType == 'Customer'),
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initOtherSeriesTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.othersList', true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(false)
            .setColumns([
                new UniTableColumn('_DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(false)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(true)
                    .setWidth('16rem'),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(true),
                new UniTableColumn('_Register', 'Register', UniTableColumnType.Select)
                    .setEditable(false)
                    .setTemplate(row => row._Register && row._Register.DisplayName)
                    .setEditorOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers
                    })
            ])
            .setChangeCallback(event => this.onRowChanged(event))
            .setDefaultRowData({
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
            });
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        } else {
            let copyPasteFilter = '';

            if (searchValue.indexOf(':') > 0) {
                let accountNumberPart = searchValue.split(':')[0].trim();
                let accountNamePart = searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' and AccountName eq '${accountNamePart}')`;
            }

            filter = `Visible eq 'true' and (startswith(AccountNumber\,'${searchValue}') or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
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
            this.tasks = tasks.map(x => this.numberSeriesTaskService.translateTask(x));
            this.customerAccount = settings.CustomerAccount;
            this.supplierAccount = settings.SupplierAccount;

            this.asinvoicenumberserie = numberseries.find(x => x.Name == 'Customer Invoice number series').ID
            this.numberseries = this.addCustomFields(numberseries).map(x => {
                if (x.NumberSeriesTask && x.NumberSeriesTask.Name) {
                    x.NumberSeriesTask = this.numberSeriesTaskService.translateTask(x.NumberSeriesTask);
                }

                if (x.NumberSeriesType && x.NumberSeriesType.EntityType !== 'JournalEntry') {
                    x._Register = this.numberSeriesService.registers.find(r => r.EntityType === x.NumberSeriesType.EntityType);
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
            x._Yearly = this.numberSeriesService.yearly.find(y => y.ID == x.NumberSeriesType.Yearly);

            switch(x.Name) {
                case 'JournalEntry number series Yearly':
                case 'JournalEntry number series type yearly':
                    x._Task = 'Journal';
                    break;
                case 'JournalEntry number series type NOT yearly':
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
                case 'Customer number series':
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'Customer');
                    break;
                case 'Supplier number series':
                    x._Register = this.numberSeriesService.registers.find(x => x.EntityType == 'Supplier');
                    break;
            }

            x._rowSelected = true;
            if (!x.Name) x.Name = x._DisplayName;

            return x;
        });
    }
}
