import {Component, ViewChild, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {UniHttp} from '../../../../../../framework/core/http/http';
import {Account, VatType, Project, Department, SupplierInvoice, CustomerInvoice} from '../../../../../unientities';
import {VatTypeService, AccountService, JournalEntryService, DepartmentService, ProjectService, CustomerInvoiceService} from '../../../../../services/services';
import {JournalEntryData} from '../../../../../models/models';
import {JournalEntryMode} from '../../journalentrymanual/journalentrymanual';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';

declare const _;
declare const moment;

@Component({
    selector: 'journal-entry-professional',
    templateUrl: 'app/components/accounting/journalentry/components/journalentryprofessional/journalentryprofessional.html',
})
export class JournalEntryProfessional implements OnInit {
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public journalEntryID: number = 0;
    @Input() public runAsSubComponent: boolean = false;
    @Input() public mode: number = JournalEntryMode.Manual;
    @Input() public disabled: boolean = false;
    @Input() public journalEntryLines: JournalEntryData[] = [];

    @ViewChild(UniTable) private table: UniTable;
    private journalEntryTableConfig: UniTableConfig;

    @Output() public dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() public dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();

    private projects: Project[];
    private departments: Department[];
    private vattypes: VatType[];
    private accounts: Account[];

    private SAME_OR_NEW_NEW: string = '1';
    private newAlternative: any = {ID: this.SAME_OR_NEW_NEW, Name: 'Nytt bilag'};
    public journalEntryNumberAlternatives: Array<any> = [];

    private firstAvailableJournalEntryNumber: string = '';
    private lastUsedJournalEntryNumber: string = '';

    constructor(private uniHttpService: UniHttp,
            private vatTypeService: VatTypeService,
            private accountService: AccountService,
            private journalEntryService: JournalEntryService,
            private departmentService: DepartmentService,
            private projectService: ProjectService,
            private customerInvoiceService: CustomerInvoiceService,
            private toastService: ToastService) {

    }

    public ngOnInit() {
        this.setupJournalEntryTable();
    }

    private setupJournalEntryTable() {
        let journalentrytoday: JournalEntryData = new JournalEntryData()
        journalentrytoday.FinancialDate = moment().toDate();

        Observable.forkJoin(
            this.departmentService.GetAll(null),
            this.projectService.GetAll(null),
            this.vatTypeService.GetAll('orderby=VatCode'),
            this.accountService.GetAll('filter=Visible eq true&orderby=AccountNumber', ['VatType']),
            this.journalEntryService.getNextJournalEntryNumber(journalentrytoday)
        ).subscribe(
            (data) => {
                this.departments = data[0];
                this.projects = data[1];
                this.vattypes = data[2];
                this.accounts = data[3];
                this.firstAvailableJournalEntryNumber = data[4];

                this.setupUniTable();

                this.dataLoaded.emit(this.journalEntryLines);
            },
            (err) => console.log('Error retrieving data: ', err)
        );
    }

    private setJournalEntryNumberProperties(newRow) {

        if (newRow.JournalEntryID) {
            // if this is a saved journalentry, dont try to updated JournalEntryNo, this will normally not
            // be displayed to the user anyway in these cases
            return;
        }

        let data = this.table.getTableData();

        if (newRow.SameOrNewDetails) {
            if (newRow.SameOrNewDetails.ID === this.SAME_OR_NEW_NEW) {
                newRow.JournalEntryNo = this.firstAvailableJournalEntryNumber;
            } else {
                newRow.JournalEntryNo = newRow.SameOrNewDetails.Name;
            }
        } else {
            if (data.length === 0) {
                // set New number as default if nothing is specified and no previous numbers have been used
                newRow.SameOrNewDetails = this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1];
                newRow.JournalEntryNo = this.firstAvailableJournalEntryNumber;
            } else {
                newRow.JournalEntryNo = this.lastUsedJournalEntryNumber;
            }
        }

        newRow.SameOrNew = newRow.JournalEntryNo;
        newRow.SameOrNewDetails = {ID: newRow.JournalEntryNo, Name: newRow.JournalEntryNo};

        setTimeout(() => {
            // update alternatives, this will change when new numbers are used. Do this after datasource is updated, using setTimeout
            // because we need the updated alternatives to reuse the same method
            this.setupSameNewAlternatives();
        });
    }

    private calculateNetAmount(rowModel) {
        if (rowModel.Amount && rowModel.Amount !== 0) {
            if (rowModel.DebitAccount && rowModel.DebitVatType) {
                let calc = this.journalEntryService.calculateJournalEntryData(rowModel.DebitAccount, rowModel.DebitVatType, rowModel.Amount, null);
                rowModel.NetAmount = calc.amountNet;
            } else if (rowModel.CreditAccount && rowModel.CreditVatType) {
                let calc = this.journalEntryService.calculateJournalEntryData(rowModel.CreditAccount, rowModel.CreditVatType, rowModel.Amount, null);
                rowModel.NetAmount = calc.amountNet;
            } else {
                rowModel.NetAmount = rowModel.Amount;
            }
        }
    }

    private calculateGrossAmount(rowModel) {
        if (rowModel.NetAmount && rowModel.NetAmount !== 0) {
            if (rowModel.DebitAccount && rowModel.DebitVatType) {
                let calc = this.journalEntryService.calculateJournalEntryData(rowModel.DebitAccount, rowModel.DebitVatType, null, rowModel.NetAmount);
                rowModel.Amount = calc.amountGross;
            } else if (rowModel.CreditAccount && rowModel.CreditVatType) {
                let calc = this.journalEntryService.calculateJournalEntryData(rowModel.CreditAccount, rowModel.CreditVatType, null, rowModel.NetAmount);
                rowModel.Amount = calc.amountGross;
            } else {
                rowModel.NetAmount = rowModel.Amount;
            }
        }
    }

    private setDebitAccountProperties(rowModel) {
        let account = rowModel.DebitAccount;
        if (account) {
            rowModel.DebitAccountID = account.ID;
            rowModel.DebitVatType = account.VatType;
            rowModel.DebitVatTypeID = account.VatTypeID;
        } else {
            rowModel.DebitAccountID = null;
        }
    }

    private setCreditAccountProperties(rowModel) {
        let account = rowModel.CreditAccount;
        if (account) {
            rowModel.CreditAccountID = account.ID;
            rowModel.CreditVatType = account.VatType;
            rowModel.CreditVatTypeID = account.VatTypeID;
        } else {
            rowModel.CreditAccountID = null;
        }
    }

    private setDebitVatTypeProperties(rowModel) {
        let vattype = rowModel.DebitVatType;
        rowModel.DebitVatTypeID = vattype != null ? vattype.ID : null;
    }

    private setCreditVatTypeProperties(rowModel) {
        let vattype = rowModel.CreditVatType;
        rowModel.CreditVatTypeID = vattype != null ? vattype.ID : null;
    }

    private setProjectProperties(rowModel) {
        let project = rowModel['Dimensions.Project'];
        if (project) {
            rowModel.Dimensions.Project = project;
            rowModel.Dimensions.ProjectID = project.ID;
        }
    }

    private setDepartmentProperties(rowModel) {
        let dep = rowModel['Dimensions.Department'];
        if (dep) {
            rowModel.Dimensions.Department = dep;
            rowModel.Dimensions.DepartmentID = dep.ID;
        }
    }

    private setCustomerInvoiceProperties(rowModel: JournalEntryData) {
        let invoice = rowModel['CustomerInvoice'];
        if (invoice) {
            rowModel.InvoiceNumber = invoice.InvoiceNumber;
        }

        if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
            for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                let line = invoice.JournalEntry.Lines[i];

                if (line.Account.UsePostPost) {
                    rowModel.CustomerInvoiceID = invoice.ID;
                    rowModel.Amount = line.RestAmount;

                    if (line.SubAccount) {
                        rowModel.CreditAccountID = line.SubAccountID;
                        rowModel.CreditAccount = line.SubAccount;
                    } else {
                        rowModel.CreditAccountID = line.AccountID;
                        rowModel.CreditAccount = line.Account;
                    }

                    let defaultBankAccount = this.accounts.find(x => x.AccountNumber === 1920);
                    if (defaultBankAccount) {
                        rowModel.DebitAccount = defaultBankAccount;
                        rowModel.DebitAccountID = defaultBankAccount.ID;
                    }

                    break;
                }
            }
        }
    }

    private setupUniTable() {

        let sameOrNewCol = new UniTableColumn('SameOrNewDetails', 'Bilagsnr', UniTableColumnType.Lookup).setWidth('6%')
            .setEditorOptions({
                displayField: 'Name',
                lookupFunction: (searchValue) => {
                    return Observable.from([this.journalEntryNumberAlternatives.filter((alternative) => alternative.Name.indexOf(searchValue.toLowerCase()) >= 0 || (searchValue === '+' && alternative.ID === this.SAME_OR_NEW_NEW))]);
                },
                itemTemplate: (item) => {
                    return item ? item.Name : '';
                }
            })
            .setTemplate((item) => {
                return item.JournalEntryNo ? item.JournalEntryNo : '';
            });

        let financialDateCol = new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.Date).setWidth('7%');

        let invoiceNoCol = new UniTableColumn('CustomerInvoice', 'Fakturanr', UniTableColumnType.Lookup)
            .setDisplayField('InvoiceNumber')
            .setWidth('10%')
            .setEditorOptions({
                itemTemplate: (selectedItem: CustomerInvoice) => {
                    return selectedItem ? (`Fakturanr: ${selectedItem.InvoiceNumber}. Restbeløp: ${selectedItem.RestAmount}`) : '';
                },
                lookupFunction: (searchValue) => {
                    return this.customerInvoiceService.GetAll(`filter=startswith(InvoiceNumber, '${searchValue}')&top=10&expand=JournalEntry,JournalEntry.Lines,JournalEntry.Lines.Account,JournalEntry.Lines.SubAccount`);
                }
            });

        let debitAccountCol = new UniTableColumn('DebitAccount', 'Debet', UniTableColumnType.Lookup)
            .setDisplayField('DebitAccount.AccountNumber')
            .setTemplate((rowModel) => {
                if (rowModel.DebitAccount) {
                    let account = rowModel.DebitAccount;
                    return !rowModel._isEmpty ? account.AccountNumber + ': ' + account.AccountName : '';
                }
                return '';
            })
            .setWidth('15%')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.accounts.filter((account) => account.AccountNumber.toString().startsWith(searchValue) || account.AccountName.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0 || searchValue === `${account.AccountNumber}: ${account.AccountName}`)]);
                }
            });

        let debitVatTypeCol = new UniTableColumn('DebitVatType', 'MVA', UniTableColumnType.Lookup)
            .setDisplayField('DebitVatType.VatCode')
            .setWidth('8%')
            .setSkipOnEnterKeyNavigation(true)
            .setTemplate((rowModel) => {
                if (rowModel.DebitVatType) {
                    let vatType = rowModel.DebitVatType;
                    return `${vatType.VatCode}: ${vatType.VatPercent}%`;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent == searchValue || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%` || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`)]);
                }
            });

        let creditAccountCol = new UniTableColumn('CreditAccount', 'Kredit', UniTableColumnType.Lookup)
            .setDisplayField('CreditAccount.AccountNumber')
            .setTemplate((rowModel) => {
                if (rowModel.CreditAccount) {
                    let account = rowModel.CreditAccount;
                    return account.AccountNumber + ': ' + account.AccountName;
                }
                return '';
            })
            .setWidth('15%')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.accounts.filter((account) => account.AccountNumber.toString().startsWith(searchValue) || account.AccountName.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0 || searchValue === `${account.AccountNumber}: ${account.AccountName}`)]);
                }
            });

        let creditVatTypeCol = new UniTableColumn('CreditVatType', 'MVA', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setSkipOnEnterKeyNavigation(true)
            .setTemplate((rowModel) => {
                if (rowModel.CreditVatType) {
                    let vatType = rowModel.CreditVatType;
                    return `${vatType.VatCode}: ${vatType.VatPercent}%`;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
                },
                lookupFunction: (searchValue) => {
                   return Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent == searchValue || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%` || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`)]);
                }
            });

        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money).setWidth('7%');
        let netAmountCol = new UniTableColumn('NetAmount', 'Netto', UniTableColumnType.Money).setWidth('7%').setSkipOnEnterKeyNavigation(true);

        let projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Project && rowModel.Dimensions.Project.Name) {
                    let project = rowModel.Dimensions.Project;
                    return project.ID + ' - ' + project.Name;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.ID + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                   return Observable.from([this.projects.filter((project) => project.ID == searchValue || project.Name.toLowerCase().indexOf(searchValue) >= 0)]);
                }
            });

        let departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Department && rowModel.Dimensions.Department.Name) {
                    let dep = rowModel.Dimensions.Department;
                    return dep.ID + ' - ' + dep.Name;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.ID + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                   return Observable.from([this.departments.filter((dep) => dep.ID == searchValue || dep.Name.toLowerCase().indexOf(searchValue) >= 0)]);
                }
            });

        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);

        let defaultRowData = {
            Dimensions: {},
            DebitAccount: null,
            DebitAccountID: null,
            CreditAccount: null,
            CreditAccountID: null,
            // KE: We might want to set these as "Nytt bilag" for some entrymodes, but expected behaviour with
            //     UniTable is to copy value from the row above it you dont enter anything. Leave this for now, need to be considered

            // SameOrNew: this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1].ID,
            // SameOrNewDetails: this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1],
            Description: ''
        };

        let columns: Array<UniTableColumn> = [];

        if (this.mode === JournalEntryMode.Supplier) {
            creditAccountCol.setSkipOnEnterKeyNavigation(true);

            columns = [financialDateCol, debitAccountCol, debitVatTypeCol, creditAccountCol, amountCol, netAmountCol,
                projectCol, departmentCol, descriptionCol];
        } else if (this.mode === JournalEntryMode.Payment) {
            debitAccountCol.setSkipOnEnterKeyNavigation(true);
            debitVatTypeCol.setSkipOnEnterKeyNavigation(true);
            creditAccountCol.setSkipOnEnterKeyNavigation(true);
            creditVatTypeCol.setSkipOnEnterKeyNavigation(true);
            descriptionCol.setSkipOnEnterKeyNavigation(true);

            defaultRowData.Description = 'Innbetaling';

            columns = [sameOrNewCol, invoiceNoCol, financialDateCol, debitAccountCol, creditAccountCol, amountCol,
                 descriptionCol];
        } else {

            columns = [sameOrNewCol, financialDateCol, debitAccountCol, debitVatTypeCol, creditAccountCol, creditVatTypeCol, amountCol, netAmountCol,
                projectCol, departmentCol, descriptionCol];
        }

        this.journalEntryTableConfig = new UniTableConfig(!this.disabled, false, 100)
            .setColumns(columns)
            .setAutoAddNewRow(true)
            .setMultiRowSelect(false)
            .setContextMenu([
                {
                    action: (item) => this.deleteLine(item),
                    disabled: (item) => { return this.disabled; },
                    label: 'Slett linje'
                }
            ])
            .setDefaultRowData(defaultRowData)
            .setChangeCallback((event) => {
                var newRow = event.rowModel;

                if (event.field === 'SameOrNewDetails' || !newRow.JournalEntryNo) {
                    this.setJournalEntryNumberProperties(newRow);
                }

                if (event.field === 'Amount') {
                    this.calculateNetAmount(newRow);
                } else if (event.field === 'NetAmount') {
                    this.calculateGrossAmount(newRow);
                } else if (event.field === 'DebitAccount') {
                    this.setDebitAccountProperties(newRow);
                    this.calculateNetAmount(newRow);
                } else if (event.field === 'CreditAccount') {
                    this.setCreditAccountProperties(newRow);
                    this.calculateNetAmount(newRow);
                } else if (event.field === 'DebitVatType') {
                    this.setDebitVatTypeProperties(newRow);
                    this.calculateNetAmount(newRow);
                } else if (event.field === 'CreditVatType') {
                    this.setCreditVatTypeProperties(newRow);
                    this.calculateNetAmount(newRow);
                } else if (event.field === 'Dimensions.Department') {
                    this.setDepartmentProperties(newRow);
                } else if (event.field === 'Dimensions.Project') {
                    this.setProjectProperties(newRow);
                } else if (event.field === 'CustomerInvoice') {
                    this.setCustomerInvoiceProperties(newRow);
                }

                // Return the updated row to the table
                return newRow;
            });

        setTimeout(() => {
            this.setupSameNewAlternatives();
            this.table.focusRow(0);
        });

    }

    private deleteLine(line) {
        if (confirm('Er du sikker på at du vil slette linjen?')) {
            this.table.removeRow(line._originalIndex);
        }
    }

    private setupSameNewAlternatives() {

        if (this.journalEntryTableConfig
            && this.journalEntryTableConfig.columns
            && this.journalEntryTableConfig.columns.length > 0
            && this.journalEntryTableConfig.columns[0].field === 'SameOrNewDetails') {

            this.journalEntryNumberAlternatives = [];

            let currentRow: any;

            // add list of possible numbers from start to end if we have any table data
            if (this.table) {
                currentRow = this.table.getCurrentRow();
                let tableData = this.table.getTableData();

                if (tableData.length > 0) {
                    let range = this.journalEntryService.findJournalNumbersFromLines(tableData);
                    this.lastUsedJournalEntryNumber = range.lastNumber;
                    this.firstAvailableJournalEntryNumber = range.nextNumber;

                    for (let i = 0; i <= (range.last - range.first); i++) {
                        let jn = `${i + range.first}-${range.year}`;
                        this.journalEntryNumberAlternatives.push({ID: jn, Name: jn});
                    }
                }
            }

            // new always last one
            this.journalEntryNumberAlternatives.push(this.newAlternative);

            // update editor with new options
            this.journalEntryTableConfig.columns[0].editorOptions.resource = this.journalEntryNumberAlternatives;
        }
    }

    private validateData(data: Array<JournalEntryData>, completeCallback): string {
        let invalidRows = data.filter(x => !x.Amount || !x.FinancialDate || (!x.CreditAccountID && !x.DebitAccountID));

        if (invalidRows.length > 0) {
            return 'Dato, beløp og enten debet eller kreditkonto må fylles ut på alle radene. Vennligst korriger og lagre igjen';
        }

        return null;
    }

    public postJournalEntryData(completeCallback) {

        let tableData = this.table.getTableData();

        let validationMessage = this.validateData(tableData, completeCallback);

        if (validationMessage) {
            this.toastService.addToast('Feil ved validering av data:', ToastType.bad, null, validationMessage);
            completeCallback('Validering feilet');
            return;
        }

        this.journalEntryService.postJournalEntryData(tableData)
            .subscribe(
            data => {
                var firstJournalEntry = data[0];
                var lastJournalEntry = data[data.length - 1];

                // Validate if journalEntry number has changed
                var numbers = this.journalEntryService.findJournalNumbersFromLines(tableData);

                if (firstJournalEntry.JournalEntryNo !== numbers.firstNumber ||
                    lastJournalEntry.JournalEntryNo !== numbers.lastNumber) {
                    this.toastService.addToast('Lagring var vellykket, men merk at tildelt bilagsnummer er ' + firstJournalEntry.JournalEntryNo + ' - ' + lastJournalEntry.JournalEntryNo, ToastType.warn);

                } else {
                    this.toastService.addToast('Lagring var vellykket!', ToastType.good, 10);
                }

                completeCallback('Lagret og bokført');

                // Empty list
                this.journalEntryLines = new Array<JournalEntryData>();

                setTimeout(() => {
                    this.setupSameNewAlternatives();
                    this.table.focusRow(0);
                });

                this.dataChanged.emit(this.journalEntryLines);
            },
            err => {
                completeCallback('Lagring feilet');

                this.toastService.addToast('Feil ved lagring!', ToastType.bad, null, this.toastService.parseErrorMessageFromError(err));
                console.log('error in postJournalEntryData: ', err);
            });

    }

    public removeJournalEntryData() {
        if (confirm('Er du sikker på at du vil forkaste alle endringene dine?')) {
            this.journalEntryLines = new Array<JournalEntryData>();
        }
    }

    public addJournalEntryLine(data) {
        let newItems = this.table.getTableData();

        data.JournalEntryNo = this.lastUsedJournalEntryNumber ? this.lastUsedJournalEntryNumber : this.firstAvailableJournalEntryNumber;
        data.SameOrNew = data.JournalEntryNo;

        newItems.push(data);

        // Use JSON parse/stringify because UniTable reacts to data in different formats (object vs JournalEntryData objects).
        // Not sure why this happens, but _.cloneDeep, concat ect does not solve the problem.
        this.journalEntryLines = JSON.parse(JSON.stringify(newItems));

        // run this in settimeout because we need to wait for the unitable to update it's datasource before
        // setting up the updated alternatives
        setTimeout(() => {
            this.setupSameNewAlternatives();
        });

        this.dataChanged.emit(this.journalEntryLines);
    }

    private rowChanged(event) {
        var tableData = this.table.getTableData();

        this.dataChanged.emit(tableData);
    }

    public getTableData() {
        return this.table.getTableData();
    }
}
