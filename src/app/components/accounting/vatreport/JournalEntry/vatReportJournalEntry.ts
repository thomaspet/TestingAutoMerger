import {Component, Input} from '@angular/core';
import {JournalEntryService} from '../../../../services/services';
import {VatReport} from '../../../../unientities';


@Component({
    selector: 'vatreport-journal-entry',
    templateUrl: './vatReportJournalEntry.html'
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
