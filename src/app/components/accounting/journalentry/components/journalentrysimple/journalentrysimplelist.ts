import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount, IJournalEntry, IJournalEntryLine, IJournalEntryLineDraft} from "../../../../../interfaces";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService} from "../../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../../framework/forms";

import {JournalEntrySimpleEdit} from './journalentrysimpleedit';

@Component({
    selector: "journal-entry-simple-list",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimplelist.html",
    directives: [JournalEntrySimpleEdit]    
})
export class JournalEntrySimpleList {
    
    public selectedJournalEntryLine : IJournalEntryLine;
        
    constructor() {
  
    }
    
    editViewUpdated(updatedLine : IJournalEntryLine) {        
        //todo
    }
}