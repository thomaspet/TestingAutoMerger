import {Component, Input, SimpleChange, ViewChild} from '@angular/core';
import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice} from '../../../../unientities';
import {JournalEntryData} from '../../../../models/models';

@Component({
    selector: 'journal-entry-manual',
    templateUrl: 'app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html',
    directives: [JournalEntrySimple, JournalEntryProfessional]    
})
export class JournalEntryManual {    
    @Input()
    supplierInvoice : SupplierInvoice;
    @Input() runAsSubComponent : boolean = false;
    @ViewChild(JournalEntrySimple) private journalEntrySimple: JournalEntrySimple;
    
    public journalEntryMode: string;

  
    constructor() {
    }
    
    ngOnInit() {
        this.journalEntryMode = 'SIMPLE';
        
        if (this.supplierInvoice !== null) {
            
        }
    }
    
    getJournalEntryData(): Array<JournalEntryData> {
        if (this.journalEntrySimple) {
            return this.journalEntrySimple.journalEntryLines;
        }   
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        
    }
}