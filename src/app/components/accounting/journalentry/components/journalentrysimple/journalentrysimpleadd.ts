import {Component, Input, Output, EventEmitter} from "angular2/core";
import {JournalEntryLine} from "../../../../../unientities";

@Component({
    selector: "journal-entry-simple-add",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleadd.html"    
})
export class JournalEntrySimpleAdd {
    @Input()
    JournalEntryLine: JournalEntryLine;
        
    @Output() Created = new EventEmitter<JournalEntryLine>();
        
    constructor() {
  
    }
}