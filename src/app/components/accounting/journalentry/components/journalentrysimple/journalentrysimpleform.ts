import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter, OnChanges} from "@angular/core";
import {NgIf} from "@angular/common";
import {Observable} from "rxjs/Observable";

import {FieldLayout, Departement, Project, VatType, VatCodeGroup, Account, JournalEntry, JournalEntryLine, JournalEntryLineDraft, Dimensions} from "../../../../../unientities";
import {JournalEntryData} from "../../../../../models/models";

import {UniForm, UniField} from '../../../../../../framework/uniform';
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
                     
            self.fields = [{
                EntityType: "JournalEntryLineDraft",
                Property: "SameOrNew",
                Placement: 1,
                Hidden: self.mode == JournalEntryMode.Supplier,
                FieldType: 3,
                ReadOnly: false,
                LookupField: false,
                Label: "Bilagsnr",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    source: self.journalalternatives,
                    template: (alternative) => `${alternative.Name}`,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 500,
                    index: self.journalalternativesindex,
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "FinancialDate",
                Placement: 3,
                Hidden: false,
                FieldType: 2,
                ReadOnly: false,
                LookupField: false,
                Label: "Dato",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 2,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },             
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "InvoiceNumber",
                Placement: 11,
                Hidden: self.mode != JournalEntryMode.Payment,
                FieldType: 10,
                ReadOnly: false,
                LookupField: false,
                Label: "Fakturanr",
                Description: "Fakturanr",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
				Options: {                   
				},
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 10,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "DebitAccountID",
                Placement: 4,
                Hidden: false,
                FieldType: 0,
                ReadOnly: false,
                LookupField: false,
                Label: "Debet",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {                  
                    displayProperty: 'AccountName',
                    valueProperty: 'ID',
                    template: (account:Account) => `${account.AccountNumber} - ${account.AccountName}`,
                    minLength: 1,
                    debounceTime: 300,
                    search: (query:string) => self.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType'])           
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 3,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            }, 
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "DebitVatTypeID",
                Placement: 4,
                Hidden: self.mode == JournalEntryMode.Payment,
                FieldType: 3,
                ReadOnly: false,
                LookupField: false,
                Label: "MVA",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    source: self.vattypes,
                    displayProperty: 'VatCode',
                    valueProperty: 'ID',
                    template: (vattype:VatType) =>  `${vattype.VatCode} (${ vattype.VatPercent }%)`,
                    debounceTime: 500
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 4,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "CreditAccountID",
                Placement: 4,
                Hidden: false,
                FieldType: 0,
                ReadOnly: false,
                LookupField: false,
                Label: "Kredit",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    valueProperty: 'ID',
                    displayProperty: 'AccountName',
                    template: (account:Account) => `${account.AccountNumber} - ${account.AccountName}`,
                    minLength: 1,
                    debounceTime: 300,
                    search: (query:string) => self.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType'])   
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 5,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "CreditVatTypeID",
                Placement: 4,
                Hidden: self.mode == JournalEntryMode.Payment,
                FieldType: 3,
                ReadOnly: false,
                LookupField: false,
                Label: "MVA",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    displayProperty: 'VatCode',
                    valueProperty: 'ID',
                    template: (vattype:VatType) => `${vattype.VatCode} (${ vattype.VatPercent }%)`,
                    source: self.vattypes,
                    debounceTime: 500 
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 6,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "Amount",
                Placement: 2,
                Hidden: false,
                FieldType: 6,
                ReadOnly: false,
                LookupField: false,
                Label: "Beløp",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    step: 1
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 7,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "Dimensions.DepartementID",
                Placement: 4,
                Hidden: self.mode == JournalEntryMode.Payment,
                FieldType: 3,
                ReadOnly: false,
                LookupField: false,
                Label: "Avdeling",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    source: self.departements,
                    template: (departement) => `${departement.Name}`,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 500
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 8,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "Dimensions.ProjectID",
                Placement: 4,
                Hidden: self.mode == JournalEntryMode.Payment,
                FieldType: 3,
                ReadOnly: false,
                LookupField: false,
                Label: "Prosjekt",
                Description: "",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    source: self.projects,
                    template: (project) => `${project.Name}`,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 500
                },
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 9,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            },
            {
                ComponentLayoutID: 1,
                EntityType: "JournalEntryLineDraft",
                Property: "Description",
                Placement: 11,
                Hidden: false,
                FieldType: 10,
                ReadOnly: false,
                LookupField: false,
                Label: "Beskrivelse",
                Description: "Beskrivelse av føring",
                HelpText: "",
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: "",
                StatusCode: 0,
                ID: 10,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            }
            ];
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
            
            console.log("== FIELDS ==");
            console.log(this.fields);
                                                        
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
        this.form.Fields['FinancialDate'].focus();
      
        // FinancialDate changed
        this.form.Fields['FinancialDate'].onChange.subscribe(() => {
            this.focusAfterFinancialDate();
        });
        
        // DebitAccountID
        this.form.Fields['DebitAccountID'].onTab.subscribe(() => {
           this.form.Fields['CreditAccountID'].focus()
        });
        
        /* TODO: onUnTab / onSelect / onEnter missing
        
        this.form.Fields['DebitAccountID'].onEnter.subscribe(() => {
           this.form.Fields['CreditAccountID'].focus()           
        });
        
        this.form.Fields['DebitAccountID'].onSelect.subscribe((account:Account) => {
            if (account && account.VatType) {
                this.journalEntryLine.DebitVatType = account.VatType;
                this.journalEntryLine = _.deepClone(this.journalEntryLine);
            }   
    
            this.form.Fields['CreditAccountID'].focus();
        });
        
        this.form.Fields['DebitVatTypeID'].onEnter.subscribe(() => {
            this.form.Fields['CreditAccountID'].focus();
        });
        
        this.form.Fields['CreditAccountID'].onSelect.subscribe((account:Account) => {
                if (account && account.VatType) {
                    this.journalEntryLine.CreditVatType = account.VatType;   
                    this.journalEntryLine = _.deepClone(this.journalEntryLine);
                }
                
                this.form.Fields['Amount'].focus();
        });
        */

        this.form.Fields['CreditAccountID'].onTab.subscribe(() => {
            this.form.Fields['Amount'].focus();
        });
        
        /*
        this.form.Fields['CreditAccountID'].onUnTab.subscribe(() => {
            this.form.Fields['DebetAccountID'].focus();
        });
        
        this.form.Fields['CreditVatTypeID'].onEnter.subscribe(() => {
           this.form.Fields['Amount'].focus(); 
        });
        
        this.form.Fields['Amount'].onEnter.subscribe(() => {
           this.form.Fields['Dimensions.DepartementID'].focus(); 
        });

        this.form.Fields['Amount'].onUnTab.subscribe(() => {
            this.form.Fields['CreditAccountID'].focus();
        });
        
        this.form.Fields['Dimensions.DepartementID'].onEnter.subscribe(() => {
            this.form.Fields['Dimensions.ProjectID'].focus();
        });
        
        this.form.Fields['Dimensions.ProjectID'].onEnter.subscribe(() => {
           this.form.Fields['Description'].focus(); 
        });
        */
                
        // Invoice tabbing
        this.form.Fields['InvoiceNumber'].onTab.subscribe((data) => {                        
                        if (this.journalEntryLine.InvoiceNumber && this.journalEntryLine.InvoiceNumber !== '') {
                            this.customerInvoiceService.getInvoiceByInvoiceNumber(this.journalEntryLine.InvoiceNumber)
                                .subscribe((data) => {
                                        if (data && data.length > 0) {                                            
                                            let invoice = data[0];
                                            if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
                                                for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                                                    let line = invoice.JournalEntry.Lines[i];
                                                    
                                                    if (line.Account.UsePostPost) {                                        
                                                        this.journalEntryLine.CreditAccount = line.Account;
                                                        this.journalEntryLine.CreditAccountID = line.AccountID;
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
