import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount} from "../../../../../../framework/interfaces/interfaces";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryAggregated} from "../../../../../services/services";

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
    public selectedJournalEntryLine : JournalEntryAggregated;
    
    public journalEntryLines: Array<JournalEntryAggregated>;
        
    constructor(private journalEntryService : JournalEntryService) {
        this.journalEntryLines = new Array<JournalEntryAggregated>();
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
    
    setSelectedJournalEntryLine(selectedLine: JournalEntryAggregated) {        
        this.selectedJournalEntryLine = selectedLine;
        
                
    }
    
    abortEdit() {
        this.selectedJournalEntryLine = null;        
    }
    
    editViewUpdated(updatedLine : JournalEntryAggregated) {        
        
    }
}

