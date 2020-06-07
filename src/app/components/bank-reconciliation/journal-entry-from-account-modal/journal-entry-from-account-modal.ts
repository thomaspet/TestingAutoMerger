import {Component, Input, Output, EventEmitter} from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import {StatisticsService, BankStatementService, ErrorService} from '@app/services/services';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { JournalEntryLine, BankAccount } from '@uni-entities';

@Component({
    selector: 'journal-entry-from-account-modal',
    templateUrl: './journal-entry-from-account-modal.html',
    styleUrls: ['./journal-entry-from-account-modal.sass']
})

export class JournalEntryFromAccountModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    journalEntryLineSuggestions: any[] = [];
    selectedBankAccount: BankAccount;
    matches = [];
    busy = false;
    currentAction: string = '';

    constructor (
        private statisticsService: StatisticsService,
        private bankStatementService: BankStatementService,
        private errorService: ErrorService
    ) { }

    ngOnInit() {
        this.matches = this.options.data.matches;
        this.selectedBankAccount = this.options.data.selectedBankAccount;
        this.journalEntryLineSuggestions = this.createJournalEntryLineSuggestions(this.matches, this.options.data.selectedBankAccount);
    }

    journal() {
        this.busy = true;

        this.currentAction = 'Lager bilag...';
        this.bookJournalEntries(this.journalEntryLineSuggestions).subscribe(journalEntries => {

            // Get the lines created for each JournalEntry
            const ques = [];
            journalEntries.forEach(jl => ques.push(this.getJournalEntryLines(jl.ID)));

            this.currentAction = 'Henter bilagslinjer...';
            Observable.forkJoin(ques).subscribe(response => {
                const ids = [];
                const postpostids = [];

                // Maps response from the JournalEntryLines just created. One is for bankreconciliation and on for postpost mark
                response.forEach((res: any) => {
                    res.forEach(line => {
                        if (line?.AccountID === this.selectedBankAccount.AccountID) {
                            ids.push(line.ID);
                        } else {
                            postpostids.push(line.ID);
                        }
                    });
                });

                const postpostPairs = [];

                ids.forEach((id, index) => {
                    // Uses the original journalentrylineID from subaccount side + the new journalentryline to pair and automagic postpost
                    postpostPairs.push(this.createPostPostPair(this.matches[index].JournalEntryLineID, postpostids[index]));
                    // Update the JournalEntryLineID on the match to new line
                    this.matches[index].JournalEntryLineID = id;
                });


                this.currentAction = 'Bankavstemmer...';
                // Lets do the bank reconciliation first. Match bank entries with new created journalentrylines
                this.bankStatementService.matchItems(this.matches).subscribe(() => {

                    this.currentAction = 'Postpost-marker...';
                    this.postpostMark(postpostPairs).subscribe(() => {
                        this.busy = false;
                        this.currentAction = '';
                        this.close(true);
                    }, err => {
                        this.errorService.handle(err);
                        this.busy = false;
                    });

                }, err => {
                    this.errorService.handle(err);
                    this.busy = false;
                });

            }, err => {
                this.errorService.handle(err);
                this.busy = false;
            });
        }, err => {
            this.errorService.handle(err);
            this.busy = false;
        });
    }

    createPostPostPair(id1: number, id2: number) {
        return {
            JournalEntryLineId1: id1,
            JournalEntryLineId2: id2
        };
    }

    createJournalEntryLineSuggestions(lines: any[], bankAccount: BankAccount): JournalEntryLine[] {
        const suggestions = [];

        lines.forEach(line => {
            const journalEntry = {
                DraftLines: [
                    {
                        FinancialDate: moment(line.Date).format('YYYY-MM-DD'),
                        Description: line.Description,
                        Amount: line.Amount * -1,
                        AccountID: line.SubAccountID,
                        Account: line.SubAccountName
                    },
                    {
                        FinancialDate: moment(line.Date).format('YYYY-MM-DD'),
                        Description: line.Description,
                        Amount: line.Amount,
                        AccountID: bankAccount.AccountID,
                        Account: bankAccount.Account.AccountNumber + ' - ' + bankAccount.Account.AccountName
                    }
                ]
            };

            suggestions.push(journalEntry);
        });

        return suggestions;
    }

    bookJournalEntries(body) {
        return this.statisticsService.GetHttp()
            .usingBusinessDomain()
            .asPOST()
            .withBody(body)
            .withEndPoint('journalentries?action=book-journal-entries')
            .send()
            .map(response => response.body);
    }

    getJournalEntryLines(id: number) {
        return this.statisticsService.GetAllUnwrapped(`model=JournalEntryLine&select=ID as ID,AccountID as AccountID&filter=JournalEntryID eq ${id}`);
    }

    postpostMark(body) {
        return this.statisticsService.GetHttp()
            .usingBusinessDomain()
            .asPOST()
            .withBody(body)
            .withEndPoint('postposts?action=markposts')
            .send()
            .map(response => response.body);
    }

    close(value: boolean) {
        this.onClose.emit(value);
    }

}
