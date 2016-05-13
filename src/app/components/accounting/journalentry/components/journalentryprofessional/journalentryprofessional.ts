import {Component, Input} from "@angular/core";
import {VatType, Account, Dimensions, SupplierInvoice} from '../../../../../unientities';
import {VatTypeService, AccountService, JournalEntryService, DepartementService, ProjectService} from '../../../../../services/services';
import {JournalEntrySimpleCalculationSummary} from '../../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryData} from '../../../../../models/models';

@Component({
    selector: "journal-entry-professional",
    templateUrl: "app/components/accounting/journalentry/components/journalentryprofessional/journalentryprofessional.html"    
})
export class JournalEntryProfessional {
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public showButtons : boolean = true;
        
    constructor() {
  
    }
}