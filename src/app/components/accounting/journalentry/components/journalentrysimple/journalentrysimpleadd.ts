import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount, IJournalEntry, IJournalEntryLine, IJournalEntryLineDraft} from "../../../../../interfaces";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService} from "../../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../../framework/forms";

@Component({
    selector: "journal-entry-simple-add",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimpleadd.html"    
})
export class JournalEntrySimpleAdd {
    @Input()
    JournalEntryLine: IJournalEntryLine;
        
    @Output() Created = new EventEmitter<IJournalEntryLine>();
        
    constructor() {
  
    }
}