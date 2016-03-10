import {Component} from "angular2/core";
import {JournalEntrySimpleEdit} from './journalentrysimpleedit';
import {JournalEntryLine} from "../../../../../unientities";

@Component({
    selector: "journal-entry-simple-list",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimplelist.html",
    directives: [JournalEntrySimpleEdit]    
})
export class JournalEntrySimpleList {
    
    public selectedJournalEntryLine : JournalEntryLine;
        
    constructor() {
  
    }
    
    editViewUpdated(updatedLine : JournalEntryLine) {
        //todo
    }
}