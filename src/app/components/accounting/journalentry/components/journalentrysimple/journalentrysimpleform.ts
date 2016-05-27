import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter, OnChanges} from "@angular/core";
import {NgIf} from "@angular/common";
import {Observable} from "rxjs/Observable";

import {FieldLayout, Departement, Project, VatType, VatCodeGroup, Account, JournalEntry, JournalEntryLine, JournalEntryLineDraft, Dimensions} from "../../../../../unientities";
import {JournalEntryData} from "../../../../../models/models";

import {UniForm, UniField} from '../../../../../../framework/uniform';
import {UniAutocompleteConfig} from "../../../../../../framework/controls/autocomplete/autocomplete";
import {AccountService, JournalEntryService} from "../../../../../services/services";

declare var _;
declare var jQuery;
declare var moment;

@Component({
    selector: 'journal-entry-simple-form',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleform.html',
    directives: [UniForm, NgIf],
    providers: [AccountService, JournalEntryService]
})
export class JournalEntrySimpleForm implements OnChanges {
    @Input()
    dropdownData: any;
    
    @Input()
    journalEntryLine: JournalEntryData;
       
    @Input()
    journalEntryLines: Array<JournalEntryData>;
    
    @Input()
    hideSameOrNew: boolean;
    
    @Output()
    created = new EventEmitter<any>();

    @Output() 
    aborted = new EventEmitter<any>();
    
    @Output() 
    updated = new EventEmitter<any>();
       
    @ViewChild(UniForm)
    public form: UniForm; 
    
    public config: any = {};
    public fields: any[] = [];
   
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
                private journalEntryService: JournalEntryService) {   
        this.isLoaded = false;
        this.isEditMode = false;
        this.departements = [];
        this.projects = []; 
        this.vattypes = [];
        this.accounts = [];
        this.journalEntryLine = new JournalEntryData();
        this.hideSameOrNew = false;      
        
        this.setupSameNewAlternatives();
        
        let self = this;
        //this.journalEntryService.layout('JournalEntryLineForm').toPromise().then((layout: any) => {
        //    self.fields = layout.Fields;
              
            self.fields = [{
                EntityType: "JournalEntryLineDraft",
                Property: "SameOrNew",
                Placement: 1,
                Hidden: self.hideSameOrNew,
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
                    template: (obj) => `${obj.Name}`,
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
                Options: {
                    onSelect: () => {
                        self.form.Fields['DebetAccountID'].focus();
                    } 
                },
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
                    template: (obj:Account) => `${obj.AccountNumber} - ${obj.AccountName}`,
                    minLength: 1,
                    debounceTime: 300,
                    search: (query:string) => self.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType']),
                    onSelect: (account: Account) => {
                        if (account && account.VatType) {
                            self.journalEntryLine.DebitVatType = account.VatType;
                            self.journalEntryLine = _.deepClone(self.journalEntryLine);
                        }   
    
                        self.form.Fields['CreditAccountID'].focus();
                    },
                    onEnter: () => {
                        self.form.Fields['CreditAccountID'].focus();
                    },
                    onTab: () => {                        
                        self.form.Fields['CreditAccountID'].focus();
                    }             
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
                Hidden: false,
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
                    template: "${data.VatCode} (${ data.VatPercent }%)",
                    source: self.vattypes,
                    onEnter: () => {
                        self.form.Fields['CreditAccountID'].focus();
                    }   
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
                    template: (obj:Account) => `${obj.AccountNumber} - ${obj.AccountName}`,
                    minLength: 1,
                    debounceTime: 300,
                    search: (query:string) => self.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType']),
                    onSelect: (account: Account) => {
                        if (account && account.VatType) {
                            this.journalEntryLine.CreditVatType = account.VatType;   
                            this.journalEntryLine = _.deepClone(this.journalEntryLine);
                        }
                        
                        self.form.Fields['Amount'].focus();
                    },
                    onEnter: () => {
                        self.form.Fields['Amount'].focus();
                    },
                    onTab: () => {
                        self.form.Fields['Amount'].focus();                       
                    },
                    onUnTab: () => {
                        self.form.Fields['DebetAccountID'].focus();
                    }   
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
                Hidden: false,
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
                    template: "${data.VatCode} (${ data.VatPercent }%)",
                    source: this.vattypes,
                    onEnter: () => {
                        self.form.Fields['Amount'].focus();
                    }   
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
                    onEnter: () => {
                        self.form.Fields['Dimensions.DepartementID'].focus();
                    },
                    onUnTab: () => {
                        self.form.Fields['CreditAccountID'].focus();
                    },
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
                Hidden: false,
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
                    template: (obj) => `${obj.name}`,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 500,
                    onEnter: () => {
                        self.form.Fields['Dimensions.ProjectID'].focus();
                    }
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
                Hidden: false,
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
                    template: (obj) => `${obj.name}`,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 500,
                    onEnter: () => {
                        self.form.Fields['Description'].focus();
                    }
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
            submitText: '' // TODO remove and use disable subit when available in new UniForm
        };

    }
    
    setupSameNewAlternatives() {        
        // add list of possible numbers from start to end
        if (this.isEditMode && !this.hideSameOrNew) {
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
    }
    
    ngOnInit() {
        if (!this.isEditMode) {           
            this.journalEntryLine.SameOrNew = this.hideSameOrNew ? this.SAME_OR_NEW_SAME : this.SAME_OR_NEW_NEW;
        } 
    }
            
    ngOnChanges(changes: {[propName: string]: SimpleChange}) {                 
        if (changes['dropdownData'] != null && this.dropdownData) {
            this.departements = this.dropdownData[0];
            this.projects = this.dropdownData[1];
            this.vattypes = this.dropdownData[2];
            this.accounts = this.dropdownData[3];  
        }
        
        if (changes['journalEntryLine'] != null) {
            this.isEditMode = true;
        }
    }
    
    public submit(line) {
        console.log('Submit: ', line);
    }
      
    public change(line) {
        console.log('Change: ', line);
    }  
    
    public ready(line) {
        console.log('Ready:', line);        
        this.form.Fields['FinancialDate'].focus();
    }
         
    addJournalEntry(event: any, journalEntryNumber: string = null) {  
        if (this.journalEntryLines.length == 0 && journalEntryNumber == null && !this.hideSameOrNew) {
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
                if (oldData.SameOrNew === this.SAME_OR_NEW_NEW && !this.hideSameOrNew) {
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
            
            if (this.hideSameOrNew) {
                this.journalEntryLine.SameOrNew = this.SAME_OR_NEW_SAME;
            } else {
                this.journalEntryLine.SameOrNew = oldsameornew == this.SAME_OR_NEW_SAME ? this.SAME_OR_NEW_SAME : this.SAME_OR_NEW_NEW;
            }
            
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
