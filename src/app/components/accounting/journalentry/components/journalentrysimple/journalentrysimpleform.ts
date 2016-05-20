import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter, OnChanges} from "@angular/core";
import {Observable} from "rxjs/Observable";

import {FieldType, FieldLayout, ComponentLayout, Departement, Project, VatType, VatCodeGroup, Account, JournalEntry, JournalEntryLine, JournalEntryLineDraft, Dimensions} from "../../../../../unientities";
import {JournalEntryData} from "../../../../../models/models";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniAutocompleteConfig} from "../../../../../../framework/controls/autocomplete/autocomplete";
import {AccountService, JournalEntryService} from "../../../../../services/services";

declare var _;
declare var jQuery;
declare var moment;

@Component({
    selector: 'journal-entry-simple-form',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleform.html',
    directives: [UniComponentLoader],
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
       
    @ViewChild(UniComponentLoader)
    uniCmpLoader: UniComponentLoader;    
    
    formConfig: UniFormBuilder;
    
    departements: Departement[];
    projects: Project[];
    vattypes: VatType[];
    accounts: Account[];
    
    isLoaded: boolean;
    isEditMode: boolean;
    formInstance: UniForm;
    
    SAME_OR_NEW_SAME: string = "0";
    SAME_OR_NEW_NEW: string = "1";
    
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
         
    addJournalEntry(event: any, journalEntryNumber: string = null) {  
        if (this.journalEntryLines.length == 0 && journalEntryNumber == null && !this.hideSameOrNew) {
            // New line fetch next journal entry number from server first
            var journalentrytoday: JournalEntryData = new JournalEntryData();
            journalentrytoday.FinancialDate = moment().toDate();
            this.journalEntryService.getNextJournalEntryNumber(journalentrytoday).subscribe((next) => {
                this.addJournalEntry(event, next);
            });            
        } else {
            var oldData: JournalEntryData = _.cloneDeep(this.formInstance.Value);              
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
            
            this.formInstance.Model = this.journalEntryLine;
            this.setFocusOnDebit();
        }                
    }
    
    editJournalEntry(event: any) {     
        var newData: JournalEntryData = this.formInstance.Value;
        
        if (newData.SameOrNew === this.SAME_OR_NEW_NEW) {
            var numbers = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
            newData.JournalEntryNo = numbers.nextNumber;
        } else {
            newData.JournalEntryNo = newData.SameOrNew;
        }

        this.updated.emit(newData);
    }
        
    abortEditJournalEntry(event) {
        this.aborted.emit(null);
    }
    
    emptyJournalEntry(event) {
        var oldData: JournalEntryData = _.cloneDeep(this.formInstance.Value);              
    
        this.journalEntryLine = new JournalEntryData();
        this.journalEntryLine.SameOrNew = oldData.SameOrNew;      
        this.journalEntryLine.FinancialDate = oldData.FinancialDate;

        this.formInstance.Model = this.journalEntryLine;
        this.setFocusOnDebit();        
    }
    
    private setFocusOnDebit() {
        var debitaccount: UniFieldBuilder = this.formInstance.find('DebitAccountID');
        debitaccount.setFocus(); 
    }

    ngAfterViewInit() {  
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "ManualJournalEntryLineDraft",
            BaseEntity: "JournalEntryLineDraft",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "SameOrNew",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Bilagsnr",
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
                    ID: 1,
                    Deleted: false,
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
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: "",
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "DebitVatTypeID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "MVA",
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
                    ID: 4,
                    Deleted: false,
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
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: "",
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "CreditVatTypeID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "MVA",
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
                    ID: 6,
                    Deleted: false,
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
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: "",
                    StatusCode: 0,
                    ID: 7,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "Dimensions.DepartementID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Avdeling",
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
                    ID: 8,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "Dimensions.ProjectID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Prosjekt",
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
                    ID: 9,
                    Deleted: false,
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
                    CustomFields: null 
                }
            ]               
        };   
        
        this.formConfig = new UniFormLayoutBuilder().build(view, this.journalEntryLine);
        this.formConfig.hideSubmitButton();  
        this.extendFormConfig();
        this.loadForm();                      
    }
        
    extendFormConfig() {        
        var sameornew: UniFieldBuilder = this.formConfig.find('SameOrNew');  
        var financialdate: UniFieldBuilder = this.formConfig.find('FinancialDate');
        var departement: UniFieldBuilder = this.formConfig.find('Dimensions.DepartementID');       
        var project: UniFieldBuilder = this.formConfig.find('Dimensions.ProjectID');
        var debitvattype: UniFieldBuilder = this.formConfig.find('DebitVatTypeID');
        var debitaccount: UniFieldBuilder = this.formConfig.find('DebitAccountID');
        var creditaccount: UniFieldBuilder = this.formConfig.find('CreditAccountID');
        var creditvattype: UniFieldBuilder = this.formConfig.find('CreditVatTypeID');
        var description: UniFieldBuilder = this.formConfig.find('Description');
        var amount: UniFieldBuilder = this.formConfig.find('Amount');

        var journalalternatives = [];
        var samealternative = {ID: this.SAME_OR_NEW_SAME, Name: "Samme"};
        var newalternative = {ID: this.SAME_OR_NEW_NEW, Name: "Ny"}
        var journalalternativesindex = 0;
        
        // Hide SameOrNew?
        if (this.hideSameOrNew) {
            sameornew.hidden = true;
        }
           
        // navigation
        financialdate.onSelect = () => {
            debitaccount.setFocus();  
        };
        
        debitaccount.onSelect = (account: Account) => {
            if (account && account.VatType) {
                this.journalEntryLine.DebitVatType = account.VatType;
                this.formInstance.Model = this.journalEntryLine;
            }
    
            creditaccount.setFocus();
        }
        
        debitaccount.onEnter = () => {
            creditaccount.setFocus();
        }
        
        debitaccount.onTab = () => {
            creditaccount.setFocus();
        }
        
        debitvattype.onEnter = () => {
            creditaccount.setFocus();
        }
        
        creditaccount.onSelect = (account: Account) => {
            if (account && account.VatType) {
                this.journalEntryLine.CreditVatType = account.VatType;   
                this.formInstance.Model = this.journalEntryLine;
            }
            
            amount.setFocus();        
        }
        
        creditaccount.onEnter = () => {
            amount.setFocus();
        }
        
        creditaccount.onTab = () => {
            amount.setFocus();
        }
        
        creditaccount.onUnTab = () => {
            debitaccount.setFocus();
        }
    
        creditvattype.onEnter = () => {
            amount.setFocus();
        }
        
        amount.onEnter = () => {
            departement.setFocus();
        }
        
        amount.onUnTab = () => {
            creditaccount.setFocus();
        }
        
        departement.onEnter = () => {
            project.setFocus();
        }

        project.onEnter = () => {
            description.setFocus();
        }
                             
        // add list of possible numbers from start to end
        if (this.isEditMode && !this.hideSameOrNew) {
            var range = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
            var current = parseInt(this.journalEntryLine.JournalEntryNo.split('-')[0]);
            for(var i = 0; i <= (range.last - range.first); i++) {
                var jn = `${i+range.first}-${range.year}`;
                journalalternatives.push({ID: jn, Name: jn});
                if ((i+range.first) === current) { journalalternativesindex = i; } 
            }
        } else {
            journalalternatives.push(samealternative);
            journalalternativesindex = 1;
        }
        
        // new always last one
        journalalternatives.push(newalternative);
                             
        sameornew.setKendoOptions({
           autoBind: true,
           dataTextField: 'Name',
           dataValueField: 'ID',
           dataSource: journalalternatives,
           index: journalalternativesindex
        });
        
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.departements
        });
        departement.addClass('large-field');

        project.setKendoOptions({
           dataTextField: 'Name',
           dataValueField: 'ID',
           dataSource: this.projects 
        });      
        project.addClass('large-field');
     
        debitaccount.setKendoOptions(UniAutocompleteConfig.build({
            valueKey: 'ID',
            template: (obj:Account) => `${obj.AccountNumber} - ${obj.AccountName}`,
            minLength: 1,
            debounceTime: 300,
            search: (query:string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType'])
        }));
         
        debitvattype.setKendoOptions({
           dataTextField: 'VatCode',
           dataValueField: 'ID',
           template: "${data.VatCode} (${ data.VatPercent }%)",
           dataSource: this.vattypes 
        });
        
        creditaccount.setKendoOptions(UniAutocompleteConfig.build({
            valueKey: 'ID',
            template: (obj:Account) => `${obj.AccountNumber} - ${obj.AccountName}`,
            minLength: 1,
            debounceTime: 300,
            search: (query:string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`, ['VatType'])
        }));
  
        creditvattype.setKendoOptions({
           dataTextField: 'VatCode',
           dataValueField: 'ID',
           template: "${data.VatCode} (${ data.VatPercent }%)",
           dataSource: this.vattypes 
        });
        
        description.addClass('large-field');     
    }    
           
    loadForm() {       
        var self = this;
        return this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
            cmp.instance.config = self.formConfig;
            cmp.instance.ready.subscribe((instance:UniForm) => {
                self.formInstance = cmp.instance

                // set focus on finanical date
                var financialdate: UniFieldBuilder = cmp.instance.find('FinancialDate');
                financialdate.setFocus();
            });
        });
    }
} 
