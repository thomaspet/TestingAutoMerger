import {Component} from "@angular/core";
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';


@Component({
    selector: "payments",
    templateUrl: "app/components/accounting/journalentry/payments/payments.html",
    directives: [JournalEntryManual],    
})
export class Payments {    
    constructor() {
  
    }
}