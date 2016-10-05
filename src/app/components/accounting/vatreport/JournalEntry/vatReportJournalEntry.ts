import {Component, Input, OnInit} from '@angular/core';
import {JournalEntryService} from '../../../../services/services';
import {JournalEntryManual} from '../../journalentry/journalentrymanual/journalentrymanual';
import {VatReport} from '../../../../unientities';


@Component({
    selector: 'vatreport-journal-entry',
    templateUrl: 'app/components/accounting/vatreport/JournalEntry/vatReportJournalEntry.html'
})
export class VatReportJournalEntry {
    @Input() public vatReport: VatReport;
    private journalEntryNumber: string = '';

    constructor(
        private _journalEntryService: JournalEntryService) {
    }

    public ngOnInit() {
        this.journalEntryNumber = this.vatReport.JournalEntry.JournalEntryNumber;
    }
}
