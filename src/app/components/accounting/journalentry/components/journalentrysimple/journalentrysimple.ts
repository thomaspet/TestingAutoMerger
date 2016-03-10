import {Component} from "angular2/core";
import {JournalEntrySimpleList} from './journalentrysimplelist';
import {JournalEntrySimpleAdd} from './journalentrysimpleadd';
import {JournalEntryLine} from "../../../../../unientities";

@Component({
    selector: "journal-entry-simple",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html",
    directives: [JournalEntrySimpleList, JournalEntrySimpleAdd]
})
export class JournalEntrySimple {
    constructor() {

    }

    newLineCreated(journalEntryLine: JournalEntryLine) {
        //todo
    }
}