import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, VatType, VatCodeGroup, Account, Dimensions} from "../../../../../unientities";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService} from "../../../../../services/services";
import {JournalEntryData} from "../../../../../models/models";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../../framework/forms";

import {JournalEntrySimpleEdit} from './journalentrysimpleedit';
import {JournalEntrySimpleAdd} from './journalentrysimpleadd';

@Component({
    selector: "journal-entry-simple",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html",
    directives: [JournalEntrySimpleEdit, JournalEntrySimpleAdd],
    providers: [JournalEntryService]    
})
export class JournalEntrySimple {
    public selectedJournalEntryLine : JournalEntryData;
    
    public journalEntryLines: Array<JournalEntryData>;
    public validationResult: any;
        
    constructor(private journalEntryService : JournalEntryService) {
        this.journalEntryLines = new Array<JournalEntryData>();        
    }
    
    ngOnInit() {
        this.journalEntryService.getAggregatedData()
            .subscribe(data => 
            {                
                this.journalEntryLines = data;
            }); 
    }       
    
    postJournalEntryData() {
        this.journalEntryService.postJournalEntryData(this.journalEntryLines)
            .subscribe(
                data => {
                    data.forEach((row) => row.FinancialDate = new Date(row.FinancialDate));
                    
                    console.log(data);
                    this.journalEntryLines = data
                },
                err => console.log('error in postJournalEntryData: ', err)
            );
    }
    
    validateJournalEntryData() {
        this.journalEntryService.validateJournalEntryData(this.journalEntryLines)
            .subscribe(
                data => {
                    this.validationResult = data;
                    console.log('valideringsresultat:', data);
                },
                err => console.log('error int validateJournalEntryData:', err)
            );
    }
    
    addDummyJournalEntry() {
        var newline = JournalEntryService.getSomeNewDataForMe();
        newline.JournalEntryNo = Math.round((this.journalEntryLines.length/3) + 1);         
        this.journalEntryLines.unshift(newline);
    }
    
    newLineCreated(journalEntryLine : any) {
        var newline = JournalEntryService.getSomeNewDataForMe();
        newline.JournalEntryNo = Math.round((this.journalEntryLines.length/3) + 1);        
        this.journalEntryLines.unshift(newline);
    }
    
    setSelectedJournalEntryLine(selectedLine: JournalEntryData) {        
        this.selectedJournalEntryLine = selectedLine;
    }
    
    abortEdit() {
        this.selectedJournalEntryLine = null;        
    }
    
    editViewUpdated(updatedLine : JournalEntryData) {        
        
    }
}

