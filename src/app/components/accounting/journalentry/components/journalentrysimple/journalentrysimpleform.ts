import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";

import {FieldType, FieldLayout, ComponentLayout, Departement, Project, VatType, VatCodeGroup, Account, JournalEntry, JournalEntryLine, JournalEntryLineDraft} from "../../../../../unientities";
import {JournalEntryData} from "../../../../../models/models";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
 
@Component({
    selector: "journal-entry-simple-form",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleform.html",
    directives: [UniComponentLoader]
})
export class JournalEntrySimpleForm {
    @Input()
    DropdownData: any;
    
    @Input()
    JournalEntryLine: JournalEntryData;
                                
    @Output() Created = new EventEmitter<any>();
    @Output() Aborted = new EventEmitter<any>();
       
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;    
    
    FormConfig: UniFormBuilder;
    
    departements: Departement[];
    projects: Project[];
    vattypes: VatType[];
    accounts: Account[];
    
    isLoaded: boolean;
    
    @ViewChild(UniForm)
    form: UniForm;
        
    constructor() {   
        this.isLoaded = false;
        this.departements = [];
        this.projects = []; 
        this.vattypes = [];
        this.accounts = [];
        this.JournalEntryLine = new JournalEntryData();
    }
        
    addJournalEntry(event: any) {        
        this.Created.emit(event);
        
        var oldData = this.JournalEntryLine; 
        this.JournalEntryLine = new JournalEntryData(); 
        this.JournalEntryLine.JournalEntryNo = oldData.JournalEntryNo;
        this.JournalEntryLine.FinancialDate = oldData.FinancialDate;
    }
    
    ngOnChanges(changes: {[propName: string]: SimpleChange}) { 
        
        this.departements = this.DropdownData[0];
        this.projects = this.DropdownData[1];
        this.vattypes = this.DropdownData[2];
        this.accounts = this.DropdownData[3];
        
        var self = this;

        setTimeout(() => {
            if(self.form != null) {
                //self.form.refresh(self.FormConfig); 
            }
        });   
    }
        
    ngAfterViewInit() {
        // TODO get it from the API and move these to backend migrations        
        var view: ComponentLayout = {
            Name: "ManualJournalEntryLineDraft",
            BaseEntity: "JournalEntryLineDraft",
            StatusID: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "JournalEntryNo",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 6,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Bilagsnr",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
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
                    StatusID: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "DebitAccountNumber",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Debet",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 3,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "CreditAccountNumber",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kredit",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "VatType",
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
                    StatusID: 0,
                    ID: 5,
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
                    StatusID: 0,
                    ID: 6,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "Departement",
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
                    StatusID: 0,
                    ID: 7,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "Project",
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
                    StatusID: 0,
                    ID: 8,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "JournalEntryLineDraft",
                    Property: "Description",
                    Placement: 11,
                    Hidden: false,
                    FieldType: 11,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Beskrivelse",
                    Description: "Beskrivelse av føring",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 9,
                    Deleted: false,
                    CustomFields: null 
                }
            ]               
        };   
        
        this.FormConfig = new UniFormLayoutBuilder().build(view, this.JournalEntryLine);  
        this.extendFormConfig();
        this.loadForm();
                        
    }
    
    extendFormConfig() {
        var journalEntryNo: UniFieldBuilder = this.FormConfig.find('JournalEntryNo');       
        journalEntryNo.setKendoOptions({
           format: "n0",
           min: 1
        });
        journalEntryNo.addClass('small-field');
        
        var departement: UniFieldBuilder = this.FormConfig.find('Departement');       
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.departements
        });
        departement.addClass('large-field');
        
        var project: UniFieldBuilder = this.FormConfig.find('Project');
        project.setKendoOptions({
           dataTextField: 'Name',
           dataValueField: 'ID',
           dataSource: this.projects 
        });      
        project.addClass('large-field');
        
        var vattype: UniFieldBuilder = this.FormConfig.find('VatType');
        vattype.setKendoOptions({
           dataTextField: 'VatCode',
           dataValueField: 'ID',
           template: "${data.VatCode} (${ data.VatPercent }%)",
           dataSource: this.vattypes 
        });      

        var debitaccount: UniFieldBuilder = this.FormConfig.find('DebitAccountNumber');
        debitaccount.setKendoOptions({
           dataTextField: 'AccountNumber',
           dataValueField: 'ID',
           dataSource: this.accounts
        });      
        
        var creditaccount: UniFieldBuilder = this.FormConfig.find('CreditAccountNumber');
        creditaccount.setKendoOptions({
           dataTextField: 'AccountNumber',
           dataValueField: 'ID',
           dataSource: this.accounts
        }); 
        
        var description: UniFieldBuilder = this.FormConfig.find('Description');
        description.addClass('large-field');     
    }
    
    
    private buildFormConfig(layout: ComponentLayout, model: JournalEntryData) {
        this.FormConfig = new UniFormLayoutBuilder().build(layout, model);
    }
       
    loadForm() {
        
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           cmp.instance.getEventEmitter().subscribe(self.submit(self));
           //self.elementRef.nativeElement.focus();
        });
    }
    
    abortEditJournalEntry(event) {
        this.Aborted.emit(null);
    }
    
    private submit(context: JournalEntrySimpleForm) {
        return () => {
            this.addJournalEntry(context.JournalEntryLine);
        };
    }
} 