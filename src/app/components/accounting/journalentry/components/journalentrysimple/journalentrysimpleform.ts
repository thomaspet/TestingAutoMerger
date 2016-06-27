import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter, OnChanges, ElementRef, Renderer} from '@angular/core';
import {Control} from '@angular/common';
import {Observable} from 'rxjs/Observable';

import {FieldLayout, Departement, Project, VatType, VatCodeGroup, Account, JournalEntry, JournalEntryLine, JournalEntryLineDraft, Dimensions} from '../../../../../unientities';
import {JournalEntryData} from '../../../../../models/models';

import {UniForm, UniField, UniFieldLayout} from '../../../../../../framework/uniform';
import {UniAutocompleteConfig} from '../../../../../../framework/controls/autocomplete/autocomplete';
import {AccountService, JournalEntryService, CustomerInvoiceService} from '../../../../../services/services';

declare var _;
declare var jQuery;
declare var moment;

export enum JournalEntryMode {
    Manual,
    Supplier,
    Payment
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
       
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild('addButton') private addButton: ElementRef;
    @ViewChild('updateButton') private updateButton: ElementRef;
    
    private config: any = {};
    private fields: any[] = [];
   
    private departements: Departement[];
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
  
    constructor(private accountService: AccountService,
                private journalEntryService: JournalEntryService,
                private customerInvoiceService: CustomerInvoiceService,
                private renderer: Renderer) {   
        this.isLoaded = false;
        this.isEditMode = false;
        this.departements = [];
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
                this.departements = this.dropdownData[0];
                this.projects = this.dropdownData[1]
                this.vattypes = this.dropdownData[2];
                this.accounts = this.dropdownData[3];
                
                // Add empty element to top of dropdown
                this.departements.unshift(null);
                this.projects.unshift(null);
                            
                // Refresh sources 
                this.fields[3].Options.source = this.accounts;
                this.fields[4].Options.source = this.vattypes;
                this.fields[5].Options.source = this.accounts;
                this.fields[6].Options.source = this.vattypes;
                //this.fields[8].Options.source = this.departements;
                //this.fields[9].Options.source = this.projects;
                this.fields = _.cloneDeep(this.fields);
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
    }  
    
    public ready(event) {
        if (!this.disabled) {
            this.form.editMode();
        } else {
            this.form.readMode();
        }
        
        console.log('ready!');
             
        this.form.field('FinancialDate').focus();
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
        
        setTimeout(() => { 
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
                this.setFocusOnDebit();
            }  
        });              
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
        });
    }
        
    private abortEditJournalEntry(event) {
        this.aborted.emit(null);
    }
    
    private emptyJournalEntry(event) {
        var oldData: JournalEntryData = _.cloneDeep(this.journalEntryLine);              
    
        this.journalEntryLine = new JournalEntryData();
        this.journalEntryLine.SameOrNew = oldData.SameOrNew;      
        this.journalEntryLine.FinancialDate = oldData.FinancialDate;

        this.setFocusOnDebit();        
    }
    
    private setFocusOnDebit() {
        this.form.field('DebitAccountID').focus();
    }  
    
    private onLeaveSameOrNew() {
        this.form.field('FinancialDate').focus();
    }
    
    private onLeaveFinancialDate() {
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
                                        if (line.SubAccount) { 
                                            this.journalEntryLine.CreditAccount = line.SubAccount;
                                            this.journalEntryLine.CreditAccountID = line.SubAccountID;
                                        } else {
                                            this.journalEntryLine.CreditAccount = line.Account;
                                            this.journalEntryLine.CreditAccountID = line.AccountID;
                                        }
                                        this.journalEntryLine.Amount = line.RestAmount;

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
        this.form.field('FinancialDate').focus();
        //this.form.field('CreditAccountID').focus();
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
        sameOrNewAlternative.Classes = 'small-field';
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
                    this.onLeaveFinancialDate();                        
                },
                enter: (event) => {
                    this.onLeaveFinancialDate();                        
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
            displayProperty: 'AccountName',
            valueProperty: 'ID',
            template: (account: Account) => { if (account) { return `${account.AccountNumber} - ${account.AccountName}`} return ''},
            minLength: 1,
            debounceTime: 300,
            search: (query: string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType']),
            events: {
                select: (account: Account) => {
                    if (account && account.VatType) {
                        this.journalEntryLine.DebitVatType = account.VatType;
                        this.journalEntryLine = _.deepClone(this.journalEntryLine);
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
        debitVat.FieldType = 3;
        debitVat.Label = 'MVA';
        debitVat.Property = 'DebitVatTypeID';
        debitVat.ReadOnly = false;
        debitVat.Hidden = this.mode === JournalEntryMode.Payment;   
        debitVat.Options = {                  
            source: this.vattypes,
            displayProperty: 'VatCode',
            valueProperty: 'ID',
            template: (vattype: VatType) =>  `${vattype.VatCode} (${ vattype.VatPercent }%)`,
            debounceTime: 500,
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
            displayProperty: 'AccountName',
            valueProperty: 'ID',
            template: (account: Account) => { if (account) { return `${account.AccountNumber} - ${account.AccountName}`} return ''},
            minLength: 1,
            debounceTime: 300,
            search: (query: string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType']),
            events: {
                select: (account: Account) => {
                    if (account && account.VatType) {
                        this.journalEntryLine.CreditVatType = account.VatType;
                        this.journalEntryLine = _.deepClone(this.journalEntryLine);
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
        creditVat.FieldType = 3;
        creditVat.Label = 'MVA';
        creditVat.Property = 'CreditVatTypeID';
        creditVat.ReadOnly = false;
        creditVat.Hidden = this.mode === JournalEntryMode.Payment;   
        creditVat.Options = {                  
            source: this.vattypes,
            displayProperty: 'VatCode',
            valueProperty: 'ID',
            template: (vattype: VatType) =>  `${vattype.VatCode} (${ vattype.VatPercent }%)`,
            debounceTime: 500,
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
                
        var departement = new UniFieldLayout();            
        departement.FieldSet = 0;
        departement.Section = 0;
        departement.Combo = 0;
        departement.FieldType = 3;
        departement.Label = 'Avdeling';
        departement.Property = 'Dimensions.DepartementID';
        departement.ReadOnly = false;
        departement.Hidden = self.mode == JournalEntryMode.Payment;   
        departement.Options = {                  
            source: self.departements,
            template: (departement) => `${departement ? departement.Name : ''}`,
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
                        this.renderer.invokeElementMethod(this.addButton.nativeElement, 'focus', []);
                    } else {
                        this.renderer.invokeElementMethod(this.updateButton.nativeElement, 'focus', []);
                    }                    
                }
            }
        }
        
        this.fields = [sameOrNewAlternative, finanicalDate, invoiceNumber,
                        debitAccount, debitVat, creditAccount, creditVat,
                        amount, /*departement, project,*/ description];
                
        this.config = {};
    }     
} 
