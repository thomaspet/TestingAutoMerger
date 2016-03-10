import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, VatType, VatCodeGroup, Account, JournalEntry, JournalEntryLine, JournalEntryLineDraft} from "../../../../../unientities";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService} from "../../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../../framework/forms";

@Component({
    selector: "journal-entry-simple-edit",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleedit.html"    
})
export class JournalEntrySimpleEdit {
    @Input() JournalEntryLine: JournalEntryLine;
    
    @Output() Updated = new EventEmitter<any>();
    @Output() Aborted = new EventEmitter<any>();
        
    constructor() {
  
    }
    
    abortEditJournalEntry(event) {
        this.Aborted.emit(null);
    }
    
    
}