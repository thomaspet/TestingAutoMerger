import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount, IJournalEntry, IJournalEntryLine, IJournalEntryLineDraft} from "../../../../../../framework/interfaces/interfaces";
import {JournalEntryData} from "../../../../../models/models";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService, DepartementService, ProjectService} from "../../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {IComponentLayout, IFieldLayout, IDepartement, IProject} from "../../../../../../framework/interfaces/interfaces";

@Component({
    selector: "journal-entry-simple-add",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleadd.html",
    directives: [UniComponentLoader],
    providers: [DepartementService, ProjectService, VatTypeService, AccountService]    
})
export class JournalEntrySimpleAdd {
    @Input()
    JournalEntryLine: JournalEntryData;
                            
    @Output() Created = new EventEmitter<any>();
       
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;    
    
    FormConfig: UniFormBuilder;
    
    departements: IDepartement[];
    projects: IProject[];
    vattypes: IVatType[];
    accounts: IAccount[];
        
    constructor(private departementService: DepartementService,
                private projectService: ProjectService,
                private vattypeService: VatTypeService,
                private accountService: AccountService) {        
    }
    
    addJournalEntry(event: any) {        
        this.Created.emit(event)
    }
    
    ngAfterViewInit() {
        this.JournalEntryLine = new JournalEntryData();
        this.JournalEntryLine.JournalEntryNo = 1;
        this.JournalEntryLine.Amount = 100;
        this.JournalEntryLine.FinancialDate = new Date();

        // TODO get it from the API and move these to backend migrations        
        var view: IComponentLayout = {
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
                    FieldType: 0,
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
                    Label: "Debit",
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
                    Label: "Kreditt",
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
                    Placement: 1,
                    Hidden: false,
                    FieldType: 0,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Beskrivelse",
                    Description: "En liten beskrivelse",
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
        
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.vattypeService.GetAll(null),
            this.accountService.GetAll(null)
        ).subscribe(response => {
            this.departements = response[0];
            this.projects = response[1];
            this.vattypes = response[2];
            this.accounts = response[3];
                          
            this.extendFormConfig();
            this.loadForm();
        });
    }
    
    extendFormConfig() {
        var departement: UniFieldBuilder = this.FormConfig.find('Departement');       
        departement.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: this.departements
        });
        
        var project: UniFieldBuilder = this.FormConfig.find('Project');
        project.setKendoOptions({
           dataTextField: 'Name',
           dataValueField: 'ID',
           dataSource: this.projects 
        });      

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
    }
       
    loadForm() {
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
           cmp.instance.getEventEmitter().subscribe(self.submit(self));
        });
    }
    
    private submit(context: JournalEntrySimpleAdd) {
        return () => {
            console.log("SUBMIT");
            console.log(context.JournalEntryLine);
            
            this.addJournalEntry(context.JournalEntryLine);
            
            //context.Api.Post(context.Model).subscribe((result: any) => {
            //    alert(JSON.stringify(result));
            //});
        };
    }
} 