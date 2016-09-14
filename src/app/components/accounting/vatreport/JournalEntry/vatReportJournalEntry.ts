import {Component, Input, OnInit} from '@angular/core';
import {JournalEntryService} from '../../../../services/services';
import {JournalEntryManual} from '../../journalentry/journalentrymanual/journalentrymanual';
import {VatReport} from '../../../../unientities';


@Component({
    selector: 'vatreport-journal-entry',
    templateUrl: 'app/components/accounting/vatreport/JournalEntry/vatReportJournalEntry.html',
    directives: [JournalEntryManual],
    providers: [JournalEntryService]
})
export class VatReportJournalEntry {
    @Input() public vatReport: VatReport;
//    @ViewChild(JournalEntryManual) private journalEntryManual: JournalEntryManual;
    //private disabled: boolean = true;
    private journalEntryNumber: string = "";

    constructor(
        private _journalEntryService: JournalEntryService) {
    }

    public ngOnInit() {
        this.journalEntryNumber = this.vatReport.JournalEntry.JournalEntryNumber;
    }
}
