import {Injectable} from '@angular/core';
import {BizHttp, UniHttp} from '@uni-framework/core/http';
import {map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {ConfirmActions} from '@uni-framework/uni-modal';
import {of} from 'rxjs/observable/of';
import * as _ from 'lodash';

export enum StatusCodeReconcile {
    NotBegun = 36000,
    InProgress = 36005,
    Completed = 36010
}

@Injectable()
export class AnnualSettlementService extends BizHttp<any> {

    public relativeURL = 'annualsettlement';
    protected entityType = 'AnnualSettlement';
    baseUrl = environment.BASE_URL + environment.API_DOMAINS.BUSINESS;
    statisticsUrl = environment.BASE_URL + environment.API_DOMAINS.STATISTICS;
    httpClient: HttpClient;

    constructor(protected http: UniHttp, private modalService: UniModalService) {
        super(http);
        this.httpClient = this.http.http;
    }

    getAnnualSettlements() {
        return this.GetAll();
    }

    getAnnualSettlement(id) {
        return this.Get(id, ['AnnualSettlementCheckList', 'Reconcile', 'Reconcile.Account']);
    }

    createFinancialYear(year: number) {
        return this.Post({
            _createguid: this.getNewGuid(),
            AccountYear: year
        });
    }

    checkMvaMelding(financialYear) {
        return this.httpClient.get(
            this.baseUrl + 'vatreports?action=validate-vatreports-for-financialyear&financialYear=' + financialYear
        ).pipe(
            map((result: any[]) => (result && result.length === 0))
        );
    }

    checkAmelding(financialYear) {
        return this.http.http.get(
            this.baseUrl + 'amelding?action=validate-periods&year=' + financialYear
        ).pipe(
            map((result: any[]) => (result && result.length === 0))
        );
    }

    checkLastyear(financialYear) {
        return this.http.http.get(
            this.baseUrl +
            'annualsettlement?action=get-account-balance&fromAccountNumber=1000&toAccountNumber=2999&toFinancialYear=' + financialYear
        ).pipe(
            map((result: number) => result > -1 && result < 1)
        );
    }

    checkStocksCapital(financialYear) {
        return this.http.http.get(
            this.baseUrl
            + 'annualsettlement?action=get-account-balance&fromAccountNumber=1000&toAccountNumber=1299&toFinancialYear=' + financialYear
        ).pipe(
            map((result: number) => result < 30000)
        );
    }

    checkList(as) {
        const checkList = Object.assign({}, as.AnnualSettlementCheckList);
        return this.checkMvaMelding(as.AccountYear)
            .pipe(
                tap(resultMvaMelding => checkList.IsMvaMeldingOK = resultMvaMelding),
                switchMap(() => this.checkAmelding(as.AccountYear)),
                tap(resultAmelding => checkList.IsAmeldingOK = resultAmelding),
                switchMap(() => this.checkLastyear(as.AccountYear)),
                tap(resultAmelding => checkList.AreAllPreviousYearsEndedAndBalances = resultAmelding),
                switchMap(() => this.checkStocksCapital(as.AccountYear)),
                tap(resultStocksCapital => checkList.IsSharedCapitalOK = resultStocksCapital),
                map(() => checkList)
            );
    }

    moveFromStep1ToStep2(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'OneToStepTwo' );
    }
    moveFromStep5ToStep6(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'FiveToStepSix' );
        // demo - return this.httpClient.put(this.baseUrl + `taxreport/?action=send-annual&annualSettlementID=` + annualSettlement.ID, null);
    }
    moveFromStep2ToStep3(annualSettlement) {
        return this.completeReconcile(annualSettlement).pipe(
            switchMap(() => this.Transition(annualSettlement.ID, annualSettlement, 'TwoToStepThree' ))
        );
    }
    startReconcile(annualSettlement) {
        if (annualSettlement.Reconcile.StatusCode === StatusCodeReconcile.NotBegun) {
            return this.httpClient
                .post(this.baseUrl + `reconcile/${annualSettlement.Reconcile.ID}?action=BeginReconcile`, null)
                .pipe(switchMap(() => this.addAccountsToReconcile(annualSettlement.Reconcile.ID)));
        }
        return this.addAccountsToReconcile(annualSettlement.Reconcile.ID);
    }
    completeReconcile(annualSettlement) {
        if (annualSettlement.Reconcile.StatusCode === StatusCodeReconcile.InProgress) {
            return this.httpClient
                .post(this.baseUrl + `reconcile/${annualSettlement.Reconcile.ID}?action=CompleteReconcile`, null);
        }
        return of(null);
    }
    addAccountsToReconcile(reconcileID) {
        return this.httpClient.put(this.baseUrl + `reconcile?action=AddAccountsToReconcile&reconcileID=${reconcileID}`, null);
    }

    getReconcileAccountsData(reconcile) {
        return this.httpClient.get(this.statisticsUrl
            + '?model=ReconcileAccount'
            + '&select=Account.ID as AccountID,Account.AccountName as AccountName,'
            + 'Account.AccountNumber as AccountNumber,sum(JournalEntryLine.Amount) as TotalAmount'
            + '&filter=ReconcileAccount.ReconcileID eq ' + reconcile.ID
            + ' and JournalEntryLine.FinancialDate ge \'' + reconcile.FromDate
            + '\' and JournalEntryLine.FinancialDate le  \'' + reconcile.ToDate + '\''
            + '&groupby=ReconcileAccount.AccountID'
            + '&join=ReconcileAccount.AccountID eq Account.ID and ReconcileAccount.AccountID eq JournalEntryLine.AccountID'
        ).pipe(map((response: any) => response.Data));
    }

    getAnnualSettlementWithReconcile(annualSettlementID) {
        let annualSettlement = null;
        return this.getAnnualSettlement(annualSettlementID).pipe(
            tap((as) => annualSettlement = as),
            switchMap(as => {
                let source$;
                if (as.Reconcile.StatusCode === 36000) {
                    source$ = this.startReconcile(as);
                } else {
                    source$ = this.addAccountsToReconcile(as.Reconcile.ID);

                }
                return source$;
            }),
            map(reconcile => {
                annualSettlement.Reconcile = reconcile;
                return annualSettlement;
            }),
            switchMap((_as: any) => this.getReconcileAccountsData(_as.Reconcile)),
            map(accountsInfo => {
                accountsInfo.forEach(info => {
                    const reconcileAccount = annualSettlement.Reconcile.Accounts
                        .find(acc => acc.AccountID === info.AccountID);
                    if (reconcileAccount) {
                        reconcileAccount._AccountName = info.AccountName;
                        reconcileAccount._AccountNumber = info.AccountNumber;
                        reconcileAccount._TotalAmount = info.TotalAmount;
                        reconcileAccount._LastBalance = reconcileAccount.Balance;
                    }
                });
                annualSettlement.Reconcile.Accounts = _.orderBy(annualSettlement.Reconcile.Accounts, ['_AccountNumber'],['asc']);
                return annualSettlement;
            })
        );
    }

    openModalForComment(initialComment) {
        const data = {
            header:         'Du har fått en differanse',
            description:    `Du har lagt inn en annen saldo på denne kontoen enn saldo som er registrert i regnskapet.
                             Skriv en kommentar som beskriver hvorfor.`,
            placeholder:    'Skriv inn kommentaren din',
            comment:         initialComment
        };
        if (initialComment) {
            return this.modalService.confirm({
                header: 'Oppdater kommentaren',
                message: 'Vil du oppdatere den siste kommentaren din?'
            }).onClose.pipe(
                switchMap((result: ConfirmActions) => {
                    if (result === ConfirmActions.ACCEPT) {
                        return this.modalService.openCommentModal({data: data}).onClose;
                    } else {
                        return of({action: result, comment: initialComment});
                    }
                })
            );
        } else {
            return this.modalService.openCommentModal({data: data}).onClose;
        }
    }
}
