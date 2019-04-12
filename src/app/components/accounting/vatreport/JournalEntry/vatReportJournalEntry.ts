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
    private transqueryUrl: string = '#/accounting/transquery?JournalEntryNumber=';

    constructor(
        private _journalEntryService: JournalEntryService) {
    }

    public ngOnInit() {
        this.journalEntryNumber = this.vatReport.JournalEntry.JournalEntryNumber;
        const numberAndYear: any = this.journalEntryNumber.split('-');
        if (numberAndYear.length < 2) {
            numberAndYear.push(new Date().getFullYear());
        }
        this.transqueryUrl += `${numberAndYear[0]}&AccountYear=${numberAndYear[1]}`;
    }
}
