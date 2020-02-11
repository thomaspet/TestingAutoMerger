import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, StatisticsService} from '@app/services/services';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {Observable} from 'rxjs';

@Component({
    selector: 'closed-entries-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign closed-entries-modal" style="width: 75rem">
            <header><i class="material-icons" style="margin-right: 1rem">link</i> Koblede transaksjoner</header>
            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>
                <ul>
                    <li *ngFor="let match of matchList" [class.selected]="match._currentID === selectedPost.ID">
                        <section class="match-container">
                            <span>{{match.JLFinancialDate | date: 'dd.MM.yy'}}</span>
                            <section class="info-container-middle">
                                <div *ngIf="match.JLDescription && match.JLAmount">
                                    <span class="leader-text">Regnskap:</span>
                                    <span class="desc">{{match.JLDescription}}</span>
                                    <span class="amount" [ngClass]="match.JLAmount >= 0 ? 'good' : 'bad'">
                                        {{match.JLAmount | uninumberformat: 'money'}}
                                    </span>
                                </div>

                                <div *ngIf="match.BEDescription && match.BEAmount">
                                    <span class="leader-text">Bank:</span>
                                    <span class="desc">{{match.BEDescription}}</span>
                                    <span class="amount" [ngClass]="match.BEAmount >= 0 ? 'good' : 'bad'">
                                        {{match.BEAmount | uninumberformat: 'money'}}
                                    </span>
                                </div>
                            </section>
                            <i class="material-icons" title="Løs opp kobling" (click)="open(match.ID)">link_off</i>
                        </section>
                    </li>
                </ul>
            </article>

            <footer>
                <button (click)="close()" class="secondary">Lukk</button>
                <button (click)="openAll()" class="c2a" *ngIf="matchList?.length > 1">Løs opp alle</button>
            </footer>
        </section>
    `,
})

export class ClosedEntriesModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<boolean> = new EventEmitter();

    selectedPost: any;
    hasOpened: boolean = false;
    busy: boolean = true;
    matchList: any[] = [];
    queryString = 'model=BankStatementMatch&select=Group&filter=';
    matchQuery = `model=BankStatementMatch&select=ID as ID,BankStatementEntryID,JournalEntrylineID,JL.Description,JL.FinancialDate,`
    + `JL.Amount,Amount,BE.Description,BE.Amount,JL.JournalEntryNumber&filter=Group eq '#GUID'`
    + `&join=BankStatementMatch.JournalEntryLineID eq JournalEntryLine.ID as JL `
    + `and BankStatementMatch.BankStatementEntryID eq BankStatementEntry.ID as BE`;

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private toast: ToastService,
        private http: UniHttp
    ) { }

    ngOnInit() {
        this.selectedPost = this.options.data;
        this.reloadData();
    }

    reloadData() {
        let getGroupFilter = `JournalEntryLineID eq ${this.selectedPost.ID}`;

        if (this.selectedPost.IsBankEntry) {
            getGroupFilter = `BankStatementEntryID eq ${this.selectedPost.ID}`;
        }
        this.statisticsService.GetAllUnwrapped(this.queryString + getGroupFilter).subscribe((response) => {
            if (response && response[0]) {
                const groupGUID = response[0].BankStatementMatchGroup;
                this.statisticsService.GetAllUnwrapped(this.matchQuery.replace('#GUID', groupGUID)).subscribe((matches) => {
                    this.matchList = matches.map(m => {
                        m._currentID = this.selectedPost.IsBankEntry
                            ? m.BankStatementMatchBankStatementEntryID
                            : m.BankStatementMatchJournalEntryLineID;
                        return m;
                    });
                    this.busy = false;
                });
            }
        }, err => {
            this.busy = false;
            this.errorService.handle(err);
            this.onClose.emit(false);
        });
    }

    open(ID: number) {
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
        this.busy = true;
        const deletes = [];

        this.matchList.forEach(match => {
            deletes.push(this.onDelete(match.ID));
        });

        Observable.forkJoin(deletes).subscribe(() => {
            this.toast.addToast('Alle koblinger fjernet', ToastType.good, 5);
            this.onClose.emit(true);
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

    removeMatchOrCloseModal(id: number) {
        if (this.matchList.length === 1) {
            this.onClose.emit(true);
        } else {
            this.hasOpened = true;
            this.matchList.splice(this.matchList.findIndex(match => match.ID === id), 1);
        }
        this.busy = false;
    }

    close() {
        this.onClose.emit(this.hasOpened);
    }
}
