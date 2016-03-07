import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount} from "../../../../../../framework/interfaces/interfaces";
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
    
    newLineCreated(journalEntryLine : any) {      
        this.journalEntryLines.push(JournalEntryService.getSomeNewDataForMe());
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

