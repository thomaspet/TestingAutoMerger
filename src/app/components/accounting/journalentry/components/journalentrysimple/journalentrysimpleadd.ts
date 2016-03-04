import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount, IJournalEntry, IJournalEntryLine, IJournalEntryLineDraft} from "../../../../../../framework/interfaces/interfaces";
import {JournalEntryData} from "../../../../../models/models";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService} from "../../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {IComponentLayout, IFieldLayout} from "../../../../../../framework/interfaces/interfaces";

@Component({
    selector: "journal-entry-simple-add",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleadd.html",
    directives: [UniComponentLoader]    
})
export class JournalEntrySimpleAdd {
    @Input()
    JournalEntryLine: JournalEntryData;
                            
    @Output() Created = new EventEmitter<any>();
       
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;    
    
    FormConfig: UniFormBuilder;
        
    constructor() {        
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
                    Property: "VatTypeID",
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
        this.loadForm();
    }
       
    loadForm() {
        var self = this;
        console.log("loadForm");
        console.log(this.UniCmpLoader);
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
           cmp.instance.config = self.FormConfig;
        });
    }
} 