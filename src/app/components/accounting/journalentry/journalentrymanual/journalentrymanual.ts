import {Component, SimpleChange, Input, Output, EventEmitter} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, IVatType, IVatCodeGroup, IAccount, IJournalEntry, IJournalEntryLine, ISupplierInvoice} from "../../../../interfaces";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService, SupplierInvoiceService} from "../../../../services/services";

import {TabService} from "../../../layout/navbar/tabstrip/tabService";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../src/framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {UniTabs} from '../../../layout/uniTabs/uniTabs';

import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';

@Component({
    selector: "journal-entry-manual",
    templateUrl: "app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html",
    directives: [JournalEntrySimple, JournalEntryProfessional]    
})
export class JournalEntryManual {    
    @Input() SupplierInvoice : ISupplierInvoice;
    
    public journalEntryMode : string;
  
    constructor() {
        
    }
    
    ngOnInit() {
        this.journalEntryMode = "SIMPLE";
        
        if (this.SupplierInvoice !== null) {
            
        }
    }
    
    
}