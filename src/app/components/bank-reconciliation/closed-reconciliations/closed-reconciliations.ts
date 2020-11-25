import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {BankStatementSession, StatisticsService, ErrorService} from '@app/services/services';
import {trigger, style, transition, animate} from '@angular/animations';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {UniHttp} from '@uni-framework/core/http/http';

@Component({
    selector: 'closed-reconciliations',
    templateUrl: './closed-reconciliations.html',
    styleUrls: ['./closed-reconciliations.sass'],
    animations: [
        trigger('container', [
          transition(':enter', [
            style({transform: 'translateX(100%)'}),
            animate('400ms ease-in-out', style({transform: 'translateX(0%)'}))
          ]),
          transition(':leave', [
            style({transform: 'translateX(0%)'}),
            animate('400ms ease-out', style({transform: 'translateX(100%)'}))
          ])
        ])
      ],
      changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosedReconciliations {
    @Input()
    item: any;

    @Output()
     close = new EventEmitter();

    busy = true;
    hasOpened = false;

    buttonLocked = false;
    groupGuid: any;
    matchList: any[] = [];
    queryString = 'model=BankStatementMatch&select=Group&filter=';
    matchQuery = `model=BankStatementMatch&select=ID as ID,BankStatementEntryID,JournalEntrylineID,JL.Description,JL.FinancialDate,`
    + `JL.Amount,Amount,BE.Description,BE.Amount,BE.BookingDate,JL.JournalEntryNumber&filter=Group eq '#GUID'`
    + `&join=BankStatementMatch.JournalEntryLineID eq JournalEntryLine.ID as JL `
    + `and BankStatementMatch.BankStatementEntryID eq BankStatementEntry.ID as BE`;

    constructor(
        public session: BankStatementSession,
        private statisticsService: StatisticsService,
        private cdr: ChangeDetectorRef,
        private toast: ToastService,
        private http: UniHttp,
        private errorService: ErrorService
        ) { }

    ngOnChanges() {
        this.reloadData();
    }

    reloadData() {
        this.busy = true;
        this.groupGuid = undefined;
        let getGroupFilter = `JournalEntryLineID eq ${this.item.ID}`;

        if (this.item.IsBankEntry) {
            getGroupFilter = `BankStatementEntryID eq ${this.item.ID}`;
        }
        this.statisticsService.GetAllUnwrapped(this.queryString + getGroupFilter).subscribe((response) => {
            if (response && response[0]) {
                this.groupGuid = response[0].BankStatementMatchGroup;
                this.statisticsService.GetAllUnwrapped(this.matchQuery.replace('#GUID', this.groupGuid)).subscribe((matches) => {
                    this.matchList = matches.map(m => {
                        m._currentID = this.item.IsBankEntry
                            ? m.BankStatementMatchBankStatementEntryID
                            : m.BankStatementMatchJournalEntryLineID;
                        return m;
                    });
                    this.cdr.markForCheck();
                    this.busy = false;
                });
            } else {
                this.busy = false;
                this.buttonLocked = true;
                this.cdr.markForCheck();
            }
        }, err => {
            this.busy = false;
            this.errorService.handle(err);
            this.close.emit(false);
        });
    }

    open(clickEvent, ID: number) {

        clickEvent.stopPropagation();
        this.busy = true;

        this.onDelete(ID).subscribe(() => {
            this.toast.addToast('Kobling fjernet', ToastType.good, 5);
            this.removeMatchOrCloseModal(ID);
        }, err => {
            this.busy = false;
            this.errorService.handle(err);
        });
    }

    openAll() {
        if (!this.groupGuid) { return; }

        this.busy = true;

        this.onDeleteGroup(this.groupGuid).subscribe(() => {
            this.toast.addToast('Alle koblinger fjernet', ToastType.good, 5);
            this.close.emit(true);
        }, err => {
            this.busy = false;
            this.errorService.handle(err);
        });
    }

    onDelete(ID) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint('bankstatementmatch/' + ID)
            .send();
    }

    onDeleteGroup(groupGUID) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('bankstatementmatch?action=delete-group&group=' + groupGUID)
            .send();
    }

    removeMatchOrCloseModal(id: number) {
        if (this.matchList.length === 1) {
            this.close.emit(true);
        } else {
            this.hasOpened = true;
            this.matchList.splice(this.matchList.findIndex(match => match.ID === id), 1);
        }
        this.busy = false;
        this.cdr.markForCheck();
    }

    closeView() {
        this.close.emit(this.hasOpened);
    }
}
