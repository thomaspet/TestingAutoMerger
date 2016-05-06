import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
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
import {AccountService} from "../../../../../services/services";

declare var _;

@Component({
    selector: 'journal-entry-simple-form',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleform.html',
    directives: [UniComponentLoader],
    providers: [AccountService]
})
export class JournalEntrySimpleForm {
    @Input()
    DropdownData: any;
    
    @Input()
    JournalEntryLine: JournalEntryData;
    
    @Input()
    nextJournalNumber: string;
    
    @Input()
    journalEntryLines: Array<JournalEntryData>;
    
    @Output() Created = new EventEmitter<any>();
    @Output() Aborted = new EventEmitter<any>();
    @Output() Updated = new EventEmitter<any>();
       
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;    
    
    FormConfig: UniFormBuilder;
    
    departements: Departement[];
    projects: Project[];
    vattypes: VatType[];
    accounts: Account[];
    
    isLoaded: boolean;
    isEditMode: boolean;
    formInstance: UniForm;
    
    constructor(private accountService: AccountService) {   
        this.isLoaded = false;
        this.isEditMode = false;
        this.departements = [];
        this.projects = []; 
        this.vattypes = [];
        this.accounts = [];
        this.JournalEntryLine = new JournalEntryData();
        this.JournalEntryLine.SameOrNew = "1"; // new by default
    }
    
    ngOnChanges(changes: {[propName: string]: SimpleChange}) {         
        if (changes['DropdownData'] != null) {
            this.departements = this.DropdownData[0];
            this.projects = this.DropdownData[1];
            this.vattypes = this.DropdownData[2];
            this.accounts = this.DropdownData[3];  
        }
        
        if (changes['JournalEntryLine'] != null) {
            this.isEditMode = true;
        }
    }
         
    addJournalEntry(event: any) {        
        var oldData: JournalEntryData = _.cloneDeep(this.formInstance.Value);              
                
        // next journal number?
        if (oldData.SameOrNew == "1") {
            oldData.JournalEntryNo = this.getNextJournalNumber();
        } else {
            var numbers = this.findJournalNumbers();
            oldData.JournalEntryNo = `${numbers.last}-${numbers.year}`;        
        }
        
        oldData.SameOrNew = oldData.JournalEntryNo;
        this.Created.emit(oldData);
                
        this.JournalEntryLine = new JournalEntryData(); 
        this.JournalEntryLine.FinancialDate = oldData.FinancialDate;
        this.JournalEntryLine.SameOrNew = oldData.SameOrNew;      
        
        var self = this;
        this.formInstance.ready.toPromise().then((instance: UniForm)=>{
            instance.Model = self.JournalEntryLine;
            console.log('refreshet formInstance, self.JournalEntryLine:', self.JournalEntryLine);
        });
        
        this.setFocusOnDebit();
        console.log('addJournalEntry kjørt');          
    }
    
    editJournalEntry(event: any) {     
        var newData: JournalEntryData = this.formInstance.Value;
        
        if (newData.SameOrNew == "1") {
            newData.JournalEntryNo = this.getNextJournalNumber();
        } else {
            newData.JournalEntryNo = newData.SameOrNew;
        }

        this.Updated.emit(newData);
    }
        
    abortEditJournalEntry(event) {
        this.Aborted.emit(null);
    }
    
    emptyJournalEntry(event) {
        this.JournalEntryLine = new JournalEntryData();
        this.setFocusOnDebit();
    }
    
    private setFocusOnDebit() {
        var debitaccount: UniFieldBuilder = this.formInstance.find('DebitAccountID');
        debitaccount.setFocus(); 
    }
    
    private getNextJournalNumber(): string {       
        var numbers = this.findJournalNumbers();
        return `${numbers.last + (this.journalEntryLines.length > 0 ? 1 : 0)}-${numbers.year}`;
    }
    
    private findJournalNumbers() {
        var first, last;
        
        if (this.journalEntryLines) {
            this.journalEntryLines.forEach((l:JournalEntryData) => {   
                var parts = l.JournalEntryNo.split('-');
                var no = parseInt(parts[0]);
                if (!first || no < first) first = no;
                if (!last || no > last) last = no;
            });            
        }
        
        var parts = this.nextJournalNumber.split('-');
        if (!first) {
            first = parseInt(parts[0]);
            last = first;
        }
        
        return {
            first: first,
            last: last,
            year: parts[1]
        };
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
                    Legend: "",
                    StatusCode: 0,
                    ID: 10,
                    Deleted: false,
                    CustomFields: null 
                }
            ]               
        };   
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.JournalEntryLine);
        this.FormConfig.hideSubmitButton();  
        this.extendFormConfig();
        this.loadForm();                      
    }
        
    extendFormConfig() {        
        var sameornew: UniFieldBuilder = this.FormConfig.find('SameOrNew');  
        var departement: UniFieldBuilder = this.FormConfig.find('Dimensions.DepartementID');       
        var project: UniFieldBuilder = this.FormConfig.find('Dimensions.ProjectID');
        var debitvattype: UniFieldBuilder = this.FormConfig.find('DebitVatTypeID');
        var debitaccount: UniFieldBuilder = this.FormConfig.find('DebitAccountID');
        var creditaccount: UniFieldBuilder = this.FormConfig.find('CreditAccountID');
        var creditvattype: UniFieldBuilder = this.FormConfig.find('CreditVatTypeID');
        var description: UniFieldBuilder = this.FormConfig.find('Description');
        var amount: UniFieldBuilder = this.FormConfig.find('Amount');

        var journalalternatives = new Array<any>();
        var samealternative = {ID: "0", Name: "Samme"};
        var newalternative = {ID: "1", Name: "Ny"}
        var journalalternativesindex = 0;
               
        // add list of possible numbers from start to end
        if (this.isEditMode) {
            var range = this.findJournalNumbers();  
            var current = parseInt(this.JournalEntryLine.JournalEntryNo.split('-')[0]);
            for(var i = 0; i <= (range.last - range.first); i++) {
                var jn = `${i+range.first}-${range.year}`;
                journalalternatives.push({ID: jn, Name: jn});
                if ((i+range.first) == current) { journalalternativesindex = i; } 
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
        departement.onSelect = () => {
        //    project.setFocus();
        };

        project.setKendoOptions({
           dataTextField: 'Name',
           dataValueField: 'ID',
           dataSource: this.projects 
        });      
        project.addClass('large-field');
        project.onSelect = () => {
        //    description.setFocus();
        }
     
        debitaccount.setKendoOptions(UniAutocompleteConfig.build({
            valueKey: 'AccountNumber',
            template: (obj:Account) => `${obj.AccountNumber} - ${obj.AccountName}`,
            minLength: 2,
            debounceTime: 300,
            search: (query:string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`)
        }));
         
        debitvattype.setKendoOptions({
           dataTextField: 'VatCode',
           dataValueField: 'ID',
           template: "${data.VatCode} (${ data.VatPercent }%)",
           dataSource: this.vattypes 
        });
        debitvattype.onSelect = () => {
        //  creditaccount.setFocus();  
        };
        
        creditaccount.setKendoOptions(UniAutocompleteConfig.build({
            valueKey: 'AccountNumber',
            template: (obj:Account) => `${obj.AccountNumber} - ${obj.AccountName}`,
            minLength: 2,
            debounceTime: 300,
            search: (query:string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`)
        }));
        creditaccount.onChange = () => {
            console.log("== CREDIT ACCOUNT SELECTED ==");
            //console.log(account);
        }
        creditvattype.setKendoOptions({
           dataTextField: 'VatCode',
           dataValueField: 'ID',
           template: "${data.VatCode} (${ data.VatPercent }%)",
           dataSource: this.vattypes 
        });
        creditvattype.onSelect = () => {
        //   amount.setFocus();  
        };    
        
        description.addClass('large-field');     
    }    
           
    loadForm() {       
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = self.FormConfig;
            cmp.instance.ready.subscribe((instance:UniForm) => {
                self.formInstance = cmp.instance

                // set focus on finanical date
                var financialdate: UniFieldBuilder = cmp.instance.find('FinancialDate');
                financialdate.setFocus();
            });
        });
    }
} 