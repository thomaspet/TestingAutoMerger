import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter, OnChanges} from "@angular/core";
import {NgIf} from "@angular/common";
import {Observable} from "rxjs/Observable";

import {FieldLayout, Departement, Project, VatType, VatCodeGroup, Account, JournalEntry, JournalEntryLine, JournalEntryLineDraft, Dimensions} from "../../../../../unientities";
import {JournalEntryData} from "../../../../../models/models";

import {UniForm, UniField, UniFieldLayout} from '../../../../../../framework/uniform';
import {UniAutocompleteConfig} from "../../../../../../framework/controls/autocomplete/autocomplete";
import {AccountService, JournalEntryService, CustomerInvoiceService} from "../../../../../services/services";

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
    @Input()
    dropdownData: any;
    
    @Input()
    journalEntryLine: JournalEntryData;
       
    @Input()
    journalEntryLines: Array<JournalEntryData>;
    
    @Input()
    mode: number = JournalEntryMode.Manual;
    
    @Output()
    created = new EventEmitter<any>();

    @Output() 
    aborted = new EventEmitter<any>();
    
    @Output() 
    updated = new EventEmitter<any>();
       
    @ViewChild(UniForm)
    public form: UniForm; 
    
    config: any = {};
    fields: any[] = [];
   
    departements: Departement[];
    projects: Project[];
    vattypes: VatType[];
    accounts: Account[];
    
    isLoaded: boolean;
    isEditMode: boolean;
    journalalternatives = [];
    journalalternativesindex = 0;
    
    SAME_OR_NEW_SAME: string = "0";
    SAME_OR_NEW_NEW: string = "1";
    
    sameAlternative = {ID: this.SAME_OR_NEW_SAME, Name: "Samme"};
    newAlternative = {ID: this.SAME_OR_NEW_NEW, Name: "Ny"}
  
    constructor(private accountService: AccountService,
                private journalEntryService: JournalEntryService,
                private customerInvoiceService: CustomerInvoiceService) {   
        this.isLoaded = false;
        this.isEditMode = false;
        this.departements = [];
        this.projects = []; 
        this.vattypes = [];
        this.accounts = [];
        this.journalEntryLine = new JournalEntryData();
    }
    
    ngOnInit() {    
        if (!this.isEditMode) {           
            this.journalEntryLine.SameOrNew = this.mode == JournalEntryMode.Supplier ? this.SAME_OR_NEW_SAME : this.SAME_OR_NEW_NEW;
        }
        
        this.setupFields();
        this.setupSameNewAlternatives();    
    }
    
    private setupFields() {    
        let self = this;
        //this.journalEntryService.layout('JournalEntryLineForm').toPromise().then((layout: any) => {
        //    self.fields = layout.Fields;
            
            var sameOrNewAlternative = new UniFieldLayout();
            sameOrNewAlternative.FieldSet = 0;
            sameOrNewAlternative.Section = 0;
            sameOrNewAlternative.Combo = 0;
            sameOrNewAlternative.FieldType = 3;
            sameOrNewAlternative.Label = 'Bilagsnr';
            sameOrNewAlternative.Property = 'SameOrNew';
            sameOrNewAlternative.ReadOnly = false;
            sameOrNewAlternative.Hidden = self.mode == JournalEntryMode.Supplier; 
            sameOrNewAlternative.Options = {
                source: self.journalalternatives,
                template: (alternative) => `${alternative.Name}`,
                valueProperty: 'ID',
                displayProperty: 'Name',
                debounceTime: 500,
                index: self.journalalternativesindex,
            };          
            
            var finanicalDate = new UniFieldLayout();
            finanicalDate.FieldSet = 0;
            finanicalDate.Section = 0;
            finanicalDate.Combo = 0;
            finanicalDate.FieldType = 2;
            finanicalDate.Label = 'Dato';
            finanicalDate.Property = 'FinancialDate';
            finanicalDate.ReadOnly = false;
                
            var invoiceNumber = new UniFieldLayout();
            invoiceNumber.FieldSet = 0;
            invoiceNumber.Section = 0;
            invoiceNumber.Combo = 0;
            invoiceNumber.FieldType = 10;
            invoiceNumber.Label = 'Fakturanr';
            invoiceNumber.Property = 'InvoiceNumber';
            invoiceNumber.ReadOnly = false;
            invoiceNumber.Hidden = self.mode != JournalEntryMode.Payment;
     
            var debitAccount = new UniFieldLayout();            
            debitAccount.FieldSet = 0;
            debitAccount.Section = 0;
            debitAccount.Combo = 0;
            debitAccount.FieldType = 0;
            debitAccount.Label = 'Debet';
            debitAccount.Property = 'DebitAccountID';
            debitAccount.ReadOnly = false;
            debitAccount.Options = {                  
                displayProperty: 'AccountName',
                valueProperty: 'ID',
                template: (account:Account) => `${account.AccountNumber} - ${account.AccountName}`,
                minLength: 1,
                debounceTime: 300,
                search: (query:string) => self.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType'])           
            };

            var debitVat = new UniFieldLayout();            
            debitVat.FieldSet = 0;
            debitVat.Section = 0;
            debitVat.Combo = 0;
            debitVat.FieldType = 3;
            debitVat.Label = 'MVA';
            debitVat.Property = 'DebitVatTypeID';
            debitVat.ReadOnly = false;
            debitVat.Hidden = self.mode == JournalEntryMode.Payment;   
            debitVat.Options = {                  
                source: self.vattypes,
                displayProperty: 'VatCode',
                valueProperty: 'ID',
                template: (vattype:VatType) =>  `${vattype.VatCode} (${ vattype.VatPercent }%)`,
                debounceTime: 500
            };
        
            var creditAccount = new UniFieldLayout();            
            creditAccount.FieldSet = 0;
            creditAccount.Section = 0;
            creditAccount.Combo = 0;
            creditAccount.FieldType = 0;
            creditAccount.Label = 'Kredit';
            creditAccount.Property = 'CreditAccountID';
            creditAccount.ReadOnly = false;
            creditAccount.Options = {                  
                displayProperty: 'AccountName',
                valueProperty: 'ID',
                template: (account:Account) => `${account.AccountNumber} - ${account.AccountName}`,
                minLength: 1,
                debounceTime: 300,
                search: (query:string) => self.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType'])           
            };
            
            var creditVat = new UniFieldLayout();            
            creditVat.FieldSet = 0;
            creditVat.Section = 0;
            creditVat.Combo = 0;
            creditVat.FieldType = 3;
            creditVat.Label = 'MVA';
            creditVat.Property = 'CreditVatTypeID';
            creditVat.ReadOnly = false;
            creditVat.Hidden = self.mode == JournalEntryMode.Payment;   
            creditVat.Options = {                  
                source: self.vattypes,
                displayProperty: 'VatCode',
                valueProperty: 'ID',
                template: (vattype:VatType) =>  `${vattype.VatCode} (${ vattype.VatPercent }%)`,
                debounceTime: 500
            };
            
            var amount = new UniFieldLayout();
            amount.FieldSet = 0;
            amount.Section = 0;
            amount.Combo = 0;
            amount.FieldType = 6;
            amount.Label = 'Beløp';
            amount.Property = 'Amount';
            amount.ReadOnly = false;
            amount.Options = {
                step: 1
            };
     
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
                template: (departement) => `${departement.Name}`,
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
                template: (project) => `${project.Name}`,
                valueProperty: 'ID',
                displayProperty: 'Name',
                debounceTime: 500
            };
            
            var description = new UniFieldLayout();
            description.FieldSet = 0;
            description.Section = 0;
            description.Combo = 0;
            description.FieldType = 10;
            description.Label = 'Beskrivelse av føring';
            description.Property = 'Description';
            description.ReadOnly = false;
       
            self.fields = [sameOrNewAlternative, finanicalDate, invoiceNumber,
                           debitAccount, debitVat, creditAccount, creditVat,
                           amount, departement, project], description;
         
        //}); 
                
        this.config = {
        };
    }
    
    focusAfterFinancialDate() {
        if (this.mode != JournalEntryMode.Payment) {
            this.form.Fields['DebitAccountID'].focus();
        } else {
            this.form.Fields['InvoiceNumber'].focus();                            
        }
    }
    
    setupSameNewAlternatives() {      
        this.journalalternatives = [];
        
        // add list of possible numbers from start to end
        if (this.isEditMode && this.mode != JournalEntryMode.Supplier && this.journalEntryLines.length > 0) {
            var range = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
            var current = parseInt(this.journalEntryLine.JournalEntryNo.split('-')[0]);
            for(var i = 0; i <= (range.last - range.first); i++) {
                var jn = `${i+range.first}-${range.year}`;
                this.journalalternatives.push({ID: jn, Name: jn});
                if ((i+range.first) === current) { this.journalalternativesindex = i; } 
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
                
    ngOnChanges(changes: {[propName: string]: SimpleChange}) {  
        if (this.fields.length == 0) {
            this.setupFields();
        }
        
        if (changes['dropdownData'] != null && this.dropdownData) {
            this.departements = this.dropdownData[0];
            this.projects = this.dropdownData[1];
            this.vattypes = this.dropdownData[2];
            this.accounts = this.dropdownData[3]; 
            
            // Refresh sources 
            this.fields[3].Options.source = this.accounts;
            this.fields[4].Options.source = this.vattypes;
            this.fields[5].Options.source = this.accounts;
            this.fields[6].Options.source = this.vattypes;
            this.fields[8].Options.source = this.departements;
            this.fields[9].Options.source = this.projects;
            this.fields = _.cloneDeep(this.fields);
        }
        
        if (changes['journalEntryLine'] != null) {
            this.isEditMode = true;
        }
    }
    
    public submit(line) {
    }
      
    public change(line) {
    }  
    
    public ready(line) {
        var self = this;
             
        this.form.Fields['FinancialDate'].focus();
      
        // FinancialDate changed
        self.form.Fields['FinancialDate'].onChange.subscribe(() => {
            self.focusAfterFinancialDate();
        });
        
        // DebitAccountID
        self.form.Fields['DebitAccountID'].onTab.subscribe(() => {
           self.form.Fields['CreditAccountID'].focus()
        });
        
        /* TODO: onUnTab / onSelect / onEnter missing
        
        self.form.Fields['DebitAccountID'].onEnter.subscribe(() => {
           self.form.Fields['CreditAccountID'].focus()           
        });
        
        self.form.Fields['DebitAccountID'].onSelect.subscribe((account:Account) => {
            if (account && account.VatType) {
                self.journalEntryLine.DebitVatType = account.VatType;
                self.journalEntryLine = _.deepClone(this.journalEntryLine);
            }   
    
            self.form.Fields['CreditAccountID'].focus();
        });
        
        self.form.Fields['DebitVatTypeID'].onEnter.subscribe(() => {
            self.form.Fields['CreditAccountID'].focus();
        });
        
        self.form.Fields['CreditAccountID'].onSelect.subscribe((account:Account) => {
                if (account && account.VatType) {
                    self.journalEntryLine.CreditVatType = account.VatType;   
                    self.journalEntryLine = _.deepClone(this.journalEntryLine);
                }
                
                self.form.Fields['Amount'].focus();
        });

        self.form.Fields['CreditAccountID'].onUnTab.subscribe(() => {
            self.form.Fields['DebetAccountID'].focus();
        });
        
        self.form.Fields['CreditVatTypeID'].onEnter.subscribe(() => {
           self.form.Fields['Amount'].focus(); 
        });
        
        */
        
        self.form.Fields['Amount'].onTab.subscribe(() => {
           self.form.Fields['Dimensions.DepartementID'].focus(); 
        });
        
        /*
        self.form.Fields['Amount'].onEnter.subscribe(() => {
           self.form.Fields['Dimensions.DepartementID'].focus(); 
        });

        self.form.Fields['Amount'].onUnTab.subscribe(() => {
            self.form.Fields['CreditAccountID'].focus();
        });
        
        self.form.Fields['Dimensions.DepartementID'].onEnter.subscribe(() => {
            self.form.Fields['Dimensions.ProjectID'].focus();
        });
        
        self.form.Fields['Dimensions.ProjectID'].onEnter.subscribe(() => {
           self.form.Fields['Description'].focus(); 
        });
        */
                
        // Invoice tabbing
        self.form.Fields['InvoiceNumber'].onTab.subscribe((data) => {    
            console.log("===== INVOICENUMBER ======");                    
            if (self.journalEntryLine.InvoiceNumber && self.journalEntryLine.InvoiceNumber !== '') {
                self.customerInvoiceService.getInvoiceByInvoiceNumber(self.journalEntryLine.InvoiceNumber)
                    .subscribe((data) => {
                            if (data && data.length > 0) {                                            
                                let invoice = data[0];
                                if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
                                    for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                                        let line = invoice.JournalEntry.Lines[i];
                                        
                                        if (line.Account.UsePostPost) {                                        
                                            self.journalEntryLine.CreditAccount = line.Account;
                                            self.journalEntryLine.CreditAccountID = line.AccountID;
                                            self.journalEntryLine.Amount = line.RestAmount;
                                            
                                            self.journalEntryLine = _.cloneDeep(self.journalEntryLine);                                                    
                                            break;                                        
                                        }
                                    }    
                                }
                            }                                                                
                        },
                        (err) => console.log('Error retrieving information about invoice')
                    );    
            }          
        });
    }
         
    addJournalEntry(event: any, journalEntryNumber: string = null) {  
        if (this.journalEntryLines.length == 0 && journalEntryNumber == null && this.mode != JournalEntryMode.Supplier) {
            // New line fetch next journal entry number from server first
            var journalentrytoday: JournalEntryData = new JournalEntryData();
            journalentrytoday.FinancialDate = moment().toDate();
            this.journalEntryService.getNextJournalEntryNumber(journalentrytoday).subscribe((next) => {
                this.addJournalEntry(event, next);
            });            
        } else {
            var oldData: JournalEntryData = _.cloneDeep(this.journalEntryLine);              
            var numbers = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines, journalEntryNumber);
     
            if (numbers) {
                // next or same journal number?
                if (oldData.SameOrNew === this.SAME_OR_NEW_NEW && this.mode != JournalEntryMode.Supplier) {
                    oldData.JournalEntryNo = numbers.nextNumber;
                } else {
                    oldData.JournalEntryNo = numbers.lastNumber;        
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
    }
    
    editJournalEntry(event: any) {     
        if (this.journalEntryLine.SameOrNew === this.SAME_OR_NEW_NEW) {
            var numbers = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
            this.journalEntryLine.JournalEntryNo = numbers.nextNumber;
        } else {
            this.journalEntryLine.JournalEntryNo = this.journalEntryLine.SameOrNew;
        }
        
        this.updated.emit(this.journalEntryLine);
    }
        
    abortEditJournalEntry(event) {
        this.aborted.emit(null);
    }
    
    emptyJournalEntry(event) {
        var oldData: JournalEntryData = _.cloneDeep(this.journalEntryLine);              
    
        this.journalEntryLine = new JournalEntryData();
        this.journalEntryLine.SameOrNew = oldData.SameOrNew;      
        this.journalEntryLine.FinancialDate = oldData.FinancialDate;

        this.setFocusOnDebit();        
    }
    
    private setFocusOnDebit() {
        this.form.Fields['DebitAccountID'].focus();
    }       
} 
