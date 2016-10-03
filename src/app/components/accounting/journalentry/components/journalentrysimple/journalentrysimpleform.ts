import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter, OnChanges, Renderer} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Department, Project, VatType, Account} from '../../../../../unientities';
import {JournalEntryData} from '../../../../../models/models';

import {UniForm, UniFieldLayout} from '../../../../../../framework/uniform';
import {AccountService, JournalEntryService, CustomerInvoiceService} from '../../../../../services/services';

declare var _;
declare var moment;

export enum JournalEntryMode {
    Manual,
    Supplier,
    Payment,
    JournalEntryView
}

@Component({
    selector: 'journal-entry-simple-form',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleform.html',
    directives: [UniForm],
    providers: [AccountService, JournalEntryService, CustomerInvoiceService]
})
export class JournalEntrySimpleForm implements OnChanges {
    @Input() public dropdownData: any;
    @Input() public journalEntryLine: JournalEntryData;
    @Input() public journalEntryLines: Array<JournalEntryData>;
    @Input() public mode: number = JournalEntryMode.Manual;
    @Input() public disabled: boolean = false;
    @Output() public created: EventEmitter<any> = new EventEmitter<any>();
    @Output() public aborted: EventEmitter<any> = new EventEmitter<any>();
    @Output() public updated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public deleted: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(UniForm) public form: UniForm;

    private config: any = {};
    private fields: any[] = [];

    private departments: Department[];
    private projects: Project[];
    private vattypes: VatType[];
    private accounts: Account[];

    public isLoaded: boolean;
    public isEditMode: boolean;
    public journalalternatives: Array<any> = [];
    public journalalternativesindex: number = 0;

    private SAME_OR_NEW_SAME: string = '0';
    private SAME_OR_NEW_NEW: string = '1';

    private sameAlternative: any = {ID: this.SAME_OR_NEW_SAME, Name: 'Samme'};
    private newAlternative: any = {ID: this.SAME_OR_NEW_NEW, Name: 'Ny'}

    public isDirty: boolean;

    constructor(private accountService: AccountService,
                private journalEntryService: JournalEntryService,
                private customerInvoiceService: CustomerInvoiceService,
                private renderer: Renderer) {
        this.isLoaded = false;
        this.isEditMode = false;
        this.departments = [];
        this.projects = [];
        this.vattypes = [];
        this.accounts = [];
        this.journalEntryLine = new JournalEntryData();
    }

    public ngOnInit() {
        if (!this.isEditMode) {
            this.journalEntryLine.SameOrNew = this.mode == JournalEntryMode.Supplier ? this.SAME_OR_NEW_SAME : this.SAME_OR_NEW_NEW;
        }

        this.setupFields();
        this.setupSameNewAlternatives();

        this.isDirty = false;
    }

    private setupSameNewAlternatives() {
        this.journalalternatives = [];

        // add list of possible numbers from start to end
        if (this.isEditMode && this.mode !== JournalEntryMode.Supplier && this.journalEntryLines.length > 0) {
            var range = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
            var current = parseInt(this.journalEntryLine.JournalEntryNo.split('-')[0]);
            for(var i = 0; i <= (range.last - range.first); i++) {
                var jn = `${i + range.first}-${range.year}`;
                this.journalalternatives.push({ID: jn, Name: jn});
                if ((i + range.first) === current) { this.journalalternativesindex = i; }
            }
        } else {
            this.journalalternatives.push(this.sameAlternative);
            this.journalalternativesindex = 1;
        }

        // new always last one
        this.journalalternatives.push(this.newAlternative);

        // Update source
        this.fields[0].Options.source = this.journalalternatives;
        this.fields = _.cloneDeep(this.fields);
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {

        if (this.fields.length === 0) {
            this.setupFields();
        }

        setTimeout(() => {
            if (changes['dropdownData'] !== null && this.dropdownData) {
                this.departments = this.dropdownData[0];
                this.projects = this.dropdownData[1]
                this.vattypes = this.dropdownData[2];
                this.accounts = this.dropdownData[3];

                // Add empty element to top of dropdown
                this.departments.unshift(null);
                this.projects.unshift(null);

                // Refresh sources
                this.fields[3].Options.source = this.accounts;
                this.fields[4].Options.source = this.vattypes;
                this.fields[5].Options.source = this.accounts;
                this.fields[6].Options.source = this.vattypes;
                //this.fields[8].Options.source = this.departments;
                //this.fields[9].Options.source = this.projects;
                this.fields = _.cloneDeep(this.fields);

                setTimeout(() => {
                    this.form.field('FinancialDate').focus();
                });
            }
        });

        if (changes['journalEntryLine']) {
            this.journalEntryLine = _.cloneDeep(this.journalEntryLine);
            this.isEditMode = true;
        }
    }

    public submit(line) {
    }

    public change(line) {
        console.log('change in journalentrysimpleform: ', line);
        this.isDirty = true;
    }

    public ready(event) {
        if (!this.disabled) {
            this.form.editMode();
        } else {
            this.form.readMode();
        }
    }

    private validateJournalEntryData(): string {
        let validationResult: string = '';

        if (!this.journalEntryLine.FinancialDate) {
            validationResult += 'Dato må registreres\n';
        }

        if (!this.journalEntryLine.CreditAccountID && !this.journalEntryLine.DebitAccountID) {
            validationResult += 'Debetkonto, kreditkonto, eller begge må registreres\n';
        }


        if (!this.journalEntryLine.Amount || isNaN(this.journalEntryLine.Amount)) {
            validationResult += 'Beløp må være et tall\n';
        }

        return validationResult;
    }

    private addJournalEntry(event: any, journalEntryNumber: string = null) {

        // simple validations before adding
        let validationResult = this.validateJournalEntryData();
        if (validationResult !== '') {
            alert('Vennligst korriger følgende feil:\n\n' + validationResult);
            return;
        }

        if (this.journalEntryLines.length == 0 && journalEntryNumber == null && this.mode != JournalEntryMode.Supplier) {
            // New line fetch next journal entry number from server first
            var journalentrytoday: JournalEntryData = new JournalEntryData();
            journalentrytoday.FinancialDate = moment().toDate();
            this.journalEntryService.getNextJournalEntryNumber(journalentrytoday).subscribe((next) => {
                this.addJournalEntry(event, next);
            });
        } else {
            var oldData: JournalEntryData = _.cloneDeep(this.journalEntryLine);

            if (this.mode != JournalEntryMode.Supplier) {
                var numbers = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines, journalEntryNumber);
                if (numbers) {
                    // next or same journal number?
                    if (oldData.SameOrNew === this.SAME_OR_NEW_NEW && this.mode != JournalEntryMode.Supplier) {
                        oldData.JournalEntryNo = numbers.nextNumber;
                    } else {
                        oldData.JournalEntryNo = numbers.lastNumber;
                    }
                }
            }

            var oldsameornew = oldData.SameOrNew;
            oldData.SameOrNew = oldData.JournalEntryNo;
            this.created.emit(oldData);

            this.journalEntryLine = new JournalEntryData();
            this.journalEntryLine.FinancialDate = oldData.FinancialDate;

            if (this.mode == JournalEntryMode.Supplier) {
                this.journalEntryLine.SameOrNew = this.SAME_OR_NEW_SAME;
            } else {
                this.journalEntryLine.SameOrNew = oldsameornew == this.SAME_OR_NEW_SAME ? this.SAME_OR_NEW_SAME : this.SAME_OR_NEW_NEW;
            }

            this.setupSameNewAlternatives();

            setTimeout(() => {
                this.setFocusAfterFinancialDate();
            });
        }

        this.isDirty = false;
    }

    private editJournalEntry(event: any) {
        setTimeout(() => {
            // simple validations before adding
            let validationResult = this.validateJournalEntryData();
            if (validationResult !== '') {
                alert('Vennligst korriger følgende feil:\n\n' + validationResult);
                return;
            }

            if (this.journalEntryLine.SameOrNew === this.SAME_OR_NEW_NEW) {
                var numbers = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
                this.journalEntryLine.JournalEntryNo = numbers.nextNumber;
            } else {
                this.journalEntryLine.JournalEntryNo = this.journalEntryLine.SameOrNew;
            }

            this.updated.emit(this.journalEntryLine);

            this.isDirty = false;
        });
    }

    private abortEditJournalEntry(event) {
        this.aborted.emit(null);
    }

    private deleteEditJournalEntry(event) {
        this.deleted.emit(null);
    }

    private emptyJournalEntry(event) {
        var oldData: JournalEntryData = _.cloneDeep(this.journalEntryLine);

        this.journalEntryLine = new JournalEntryData();
        this.journalEntryLine.SameOrNew = oldData.SameOrNew;
        this.journalEntryLine.FinancialDate = oldData.FinancialDate;

        this.isDirty = false;

        setTimeout(() => {
            this.setFocusOnDebit();
        });
    }

    private setFocusOnDebit() {
        this.form.field('DebitAccountID').focus();
    }

    private onLeaveSameOrNew() {
        this.form.field('FinancialDate').focus();
    }

    private setFocusAfterFinancialDate() {
        if (this.mode === JournalEntryMode.Payment) {
            this.form.field('InvoiceNumber').focus();
        } else {
            this.form.field('DebitAccountID').focus();
        }
    }

    private onLeaveInvoiceNumber() {

        this.form.field('DebitAccountID').focus();

        if (this.journalEntryLine.InvoiceNumber && this.journalEntryLine.InvoiceNumber !== '') {
            this.customerInvoiceService.getInvoiceByInvoiceNumber(this.journalEntryLine.InvoiceNumber)
                .subscribe((data) => {

                        if (data && data.length > 0) {
                            let invoice = data[0];
                            if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
                                for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                                    let line = invoice.JournalEntry.Lines[i];

                                    if (line.Account.UsePostPost) {
                                        this.journalEntryLine.CustomerInvoiceID = invoice.ID;
                                        this.journalEntryLine.Amount = line.RestAmount;

                                        if (line.SubAccount) {
                                            this.journalEntryLine.CreditAccountID = line.SubAccountID;
                                            this.journalEntryLine.CreditAccount = line.SubAccount;
                                        } else {
                                            this.journalEntryLine.CreditAccountID = line.AccountID;
                                            this.journalEntryLine.CreditAccount = line.Account;
                                        }

                                        this.journalEntryLine = _.cloneDeep(this.journalEntryLine);
                                        break;
                                    }
                                }
                            }
                        }
                    },
                    (err) => console.log('Error retrieving information about invoice')
                );
        }
    }

    private onLeaveDebitAccount() {
        this.form.field('CreditAccountID').focus();
    }

    private onLeaveCreditAccount() {
        this.form.field('Amount').focus();
    }

    private setupFields() {

        let sameOrNewAlternative = new UniFieldLayout();
        sameOrNewAlternative.FieldSet = 0;
        sameOrNewAlternative.Section = 0;
        sameOrNewAlternative.Combo = 0;
        sameOrNewAlternative.FieldType = 3;
        sameOrNewAlternative.Label = 'Bilagsnr';
        sameOrNewAlternative.Property = 'SameOrNew';
        sameOrNewAlternative.ReadOnly = false;
        sameOrNewAlternative.Hidden = this.mode == JournalEntryMode.Supplier;
        sameOrNewAlternative.Options = {
            source: this.journalalternatives,
            template: (alternative) => `${alternative.Name}`,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 500,
            index: this.journalalternativesindex,
            events: {
                enter: (event) => {
                    this.onLeaveSameOrNew();
                }
            }
        };

        var finanicalDate = new UniFieldLayout();
        finanicalDate.FieldSet = 0;
        finanicalDate.Section = 0;
        finanicalDate.Combo = 0;
        finanicalDate.FieldType = 2;
        finanicalDate.Label = 'Dato';
        finanicalDate.Property = 'FinancialDate';
        finanicalDate.ReadOnly = false;
        finanicalDate.Options = {
            events: {
                tab: (event) => {
                    this.setFocusAfterFinancialDate();
                },
                enter: (event) => {
                    this.setFocusAfterFinancialDate();
                }
            }
        }

        var invoiceNumber = new UniFieldLayout();
        invoiceNumber.FieldSet = 0;
        invoiceNumber.Section = 0;
        invoiceNumber.Combo = 0;
        invoiceNumber.FieldType = 10;
        invoiceNumber.Label = 'Fakturanr';
        invoiceNumber.Property = 'InvoiceNumber';
        invoiceNumber.ReadOnly = false;
        invoiceNumber.Hidden = this.mode !== JournalEntryMode.Payment;
        invoiceNumber.Options = {
            events: {
                tab: (event) => {
                    this.onLeaveInvoiceNumber();
                },
                enter: (event) => {
                    this.onLeaveInvoiceNumber();
                }
            }
        };

        var debitAccount = new UniFieldLayout();
        debitAccount.FieldSet = 0;
        debitAccount.Section = 0;
        debitAccount.Combo = 0;
        debitAccount.FieldType = 0;
        debitAccount.Label = 'Debet';
        debitAccount.Property = 'DebitAccountID';
        debitAccount.ReadOnly = false;
        debitAccount.Classes = 'large-field';
        debitAccount.Options = {
            source: this.accounts,
            displayProperty: 'AccountName',
            valueProperty: 'ID',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            minLength: 1,
            debounceTime: 200,
            search: (searchValue: string) => Observable.from([this.accounts.filter((account) => account.AccountNumber.toString().startsWith(searchValue) || account.AccountName.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)]),
            events: {
                select: (model: JournalEntryData) => {
                    let accountID = model.DebitAccountID;
                    if (accountID) {
                        let account = this.accounts.find(x => x.ID === accountID);

                        if (account && account.VatType) {
                            this.journalEntryLine.DebitVatTypeID = account.VatTypeID;
                            this.journalEntryLine.DebitVatType = account.VatType;
                            this.journalEntryLine = _.cloneDeep(this.journalEntryLine);
                        }
                    }
                },
                tab: (event) => {
                    this.onLeaveDebitAccount();
                },
                enter: (event) => {
                    this.onLeaveDebitAccount();
                }
            }
        };

        var debitVat = new UniFieldLayout();
        debitVat.FieldSet = 0;
        debitVat.Section = 0;
        debitVat.Combo = 0;
        debitVat.FieldType = 0;
        debitVat.Label = 'MVA';
        debitVat.Property = 'DebitVatTypeID';
        debitVat.ReadOnly = false;
        debitVat.Hidden = this.mode === JournalEntryMode.Payment;
        debitVat.Options = {
            source: this.vattypes,
            search: (searchValue: string) => Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent.toString() === searchValue || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)]),
            displayProperty: 'VatCode',
            valueProperty: 'ID',
            template: (vattype: VatType) => vattype ? `${vattype.VatCode}: ${vattype.VatPercent}% – ${vattype.Name}` : '',
            debounceTime: 100,
            events: {
                enter: (event) => {
                        this.form.field('CreditAccountID').focus();
                }
            }
        };

        var creditAccount = new UniFieldLayout();
        creditAccount.FieldSet = 0;
        creditAccount.Section = 0;
        creditAccount.Combo = 0;
        creditAccount.FieldType = 0;
        creditAccount.Label = 'Kredit';
        creditAccount.Property = 'CreditAccountID';
        creditAccount.ReadOnly = false;
        creditAccount.Classes = 'large-field';
        creditAccount.Options = {
            source: this.accounts,
            displayProperty: 'AccountName',
            valueProperty: 'ID',
            template: (account: Account) => { if (account) { return `${account.AccountNumber} - ${account.AccountName}`} return ''},
            minLength: 1,
            debounceTime: 200,
            search: (searchValue: string) => Observable.from([this.accounts.filter((account) => account.AccountNumber.toString().startsWith(searchValue) || account.AccountName.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)]),
            events: {
                select: (model: JournalEntryData) => {
                    let accountID = model.CreditAccountID;
                    if (accountID) {
                        let account = this.accounts.find(x => x.ID === accountID);

                        if (account && account.VatType) {
                            this.journalEntryLine.CreditVatTypeID = account.VatTypeID;
                            this.journalEntryLine.CreditVatType = account.VatType;
                            this.journalEntryLine = _.cloneDeep(this.journalEntryLine);
                        }
                    }
                },
                tab: (event) => {
                    this.onLeaveCreditAccount();
                },
                enter: (event) => {
                    this.onLeaveCreditAccount();
                }
            }
        };

        var creditVat = new UniFieldLayout();
        creditVat.FieldSet = 0;
        creditVat.Section = 0;
        creditVat.Combo = 0;
        creditVat.FieldType = 0;
        creditVat.Label = 'MVA';
        creditVat.Property = 'CreditVatTypeID';
        creditVat.ReadOnly = false;
        creditVat.Hidden = this.mode === JournalEntryMode.Payment;
        creditVat.Options = {
            source: this.vattypes,
            search: (searchValue: string) => Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent.toString() === searchValue || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)]),
            displayProperty: 'VatCode',
            valueProperty: 'ID',
            template: (vattype: VatType) => vattype ? `${vattype.VatCode}: ${vattype.VatPercent}% – ${vattype.Name}` : '',
            debounceTime: 100,
            events: {
                enter: (event) => {
                    this.form.field('Amount').focus();
                }
            }
        };

        var amount = new UniFieldLayout();
        amount.FieldSet = 0;
        amount.Section = 0;
        amount.Combo = 0;
        amount.FieldType = 10;
        amount.Label = 'Beløp';
        amount.Property = 'Amount';
        amount.ReadOnly = false;
        amount.Options = {
            events: {
                enter: (event) => {
                    this.form.field('Description').focus();
                }
            }
        };

        /*
        KE 26.06.2016: Removed for now, dimensions are not supported before 30.06

        var department = new UniFieldLayout();
        department.FieldSet = 0;
        department.Section = 0;
        department.Combo = 0;
        department.FieldType = 3;
        department.Label = 'Avdeling';
        department.Property = 'Dimensions.DepartmentID';
        department.ReadOnly = false;
        department.Hidden = self.mode == JournalEntryMode.Payment;
        department.Options = {
            source: self.departments,
            template: (department) => `${department ? department.Name : ''}`,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 500
        };

        var project = new UniFieldLayout();
        project.FieldSet = 0;
        project.Section = 0;
        project.Combo = 0;
        project.FieldType = 3;
        project.Label = 'Prosjekt';
        project.Property = 'Dimensions.ProjectID';
        project.ReadOnly = false;
        project.Hidden = self.mode == JournalEntryMode.Payment;
        project.Options = {
            source: self.projects,
            template: (project) => `${project ? project.Name : ''}`,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 500
        };
        */
        let description = new UniFieldLayout();
        description.FieldSet = 0;
        description.Section = 0;
        description.Combo = 0;
        description.FieldType = 10;
        description.Label = 'Beskrivelse av føring';
        description.Property = 'Description';
        description.ReadOnly = false;
        description.Classes = 'large-field';
        description.Options = {
            events: {
                enter: (event) => {
                    if (!this.isEditMode) {
                        this.form.field('AddButton').focus();
                    } else {
                        this.form.field('UpdateButton').focus();
                    }
                }
            }
        }

        var addButton = new UniFieldLayout();
        addButton.FieldSet = 0;
        addButton.Property = 'AddButton';
        addButton.Section = 0;
        addButton.Combo = 0;
        addButton.FieldType = 1;
        addButton.Label = 'Legg til';
        addButton.ReadOnly = false;
        addButton.Hidden = this.isEditMode;
        addButton.Options = {
            class: 'good',
            click: (event) => {
                this.addJournalEntry(event);
            }
        };

        var updateButton = new UniFieldLayout();
        updateButton.FieldSet = 0;
        updateButton.Property = 'UpdateButton';
        updateButton.Section = 0;
        updateButton.Combo = 0;
        updateButton.FieldType = 1;
        updateButton.Label = 'Oppdater';
        updateButton.ReadOnly = false;
        updateButton.Hidden = !this.isEditMode;
        updateButton.Options = {
            class: 'good',
            click: (event) => {
                this.editJournalEntry(event);
            }
        };

        var emptyButton = new UniFieldLayout();
        emptyButton.FieldSet = 0;
        emptyButton.Property = 'EmptyButton';
        emptyButton.Section = 0;
        emptyButton.Combo = 0;
        emptyButton.FieldType = 1;
        emptyButton.Label = 'Tøm';
        emptyButton.ReadOnly = false;
        emptyButton.Hidden = this.isEditMode;
        emptyButton.Options = {
            click: (event) => {
                this.emptyJournalEntry(event);
            }
        };

        var abortButton = new UniFieldLayout();
        abortButton.FieldSet = 0;
        abortButton.Property = 'AbortButton';
        abortButton.Section = 0;
        abortButton.Combo = 0;
        abortButton.FieldType = 1;
        abortButton.Label = 'Avbryt';
        abortButton.ReadOnly = false;
        abortButton.Hidden = !this.isEditMode;
        abortButton.Options = {
            click: (event) => {
                this.abortEditJournalEntry(event);
            }
        };

        var deleteButton = new UniFieldLayout();
        deleteButton.FieldSet = 0;
        deleteButton.Property = 'DeleteButton';
        deleteButton.Section = 0;
        deleteButton.Combo = 0;
        deleteButton.FieldType = 1;
        deleteButton.Label = 'Slett';
        deleteButton.ReadOnly = false;
        deleteButton.Hidden = !this.isEditMode;
        deleteButton.Options = {
            class: 'error',
            click: (event) => {
                this.deleteEditJournalEntry(event);
            }
        };


        this.fields = [sameOrNewAlternative, finanicalDate, invoiceNumber,
                        debitAccount, debitVat, creditAccount, creditVat,
                        amount, /*department, project,*/ description, addButton, updateButton, emptyButton, abortButton/*, deleteButton */];

        this.config = {};
    }
}
