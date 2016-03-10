import {Component, Input} from "angular2/core";
import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice} from "../../../../unientities";

@Component({
    selector: "journal-entry-manual",
    templateUrl: "app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html",
    directives: [JournalEntrySimple, JournalEntryProfessional]    
})
export class JournalEntryManual {    
    @Input()
    SupplierInvoice : SupplierInvoice;
    
    public journalEntryMode : string;
  
    constructor() {
        
    }
    
    ngOnInit() {
        this.journalEntryMode = "SIMPLE";
        
        if (this.SupplierInvoice !== null) {
            
        }
    }
    
    
}