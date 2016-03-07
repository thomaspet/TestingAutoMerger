import {Component, Input, Output, EventEmitter, SimpleChange} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount, IJournalEntry, IJournalEntryLine, IJournalEntryLineDraft} from "../../../../../interfaces";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService} from "../../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../../framework/forms";

import {JournalEntrySimpleList} from './journalentrysimplelist';
import {JournalEntrySimpleAdd} from './journalentrysimpleadd';

@Component({
    selector: "journal-entry-simple",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html",
    directives: [JournalEntrySimpleList, JournalEntrySimpleAdd]    
})
export class JournalEntrySimple {    
    constructor() {
  
    }
    
    newLineCreated(journalEntryLine : IJournalEntryLine) {
        //todo
    }
}