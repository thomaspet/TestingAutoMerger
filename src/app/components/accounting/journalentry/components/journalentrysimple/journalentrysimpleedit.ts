import {Component, Input, Output, EventEmitter} from "angular2/core";
import {JournalEntryLine} from "../../../../../unientities";

@Component({
    selector: "journal-entry-simple-edit",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleedit.html"    
})
export class JournalEntrySimpleEdit {
    @Input() JournalEntryLine: JournalEntryLine;
    
    @Output() Updated = new EventEmitter<JournalEntryLine>();
        
    constructor() {
  
    }
    
    
    
}