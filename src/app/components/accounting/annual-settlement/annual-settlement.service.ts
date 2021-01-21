import {Injectable} from '@angular/core';
import {BizHttp, RequestMethod, UniHttp} from '@uni-framework/core/http';
import {map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {of} from 'rxjs/observable/of';
import * as _ from 'lodash';
import {forkJoin, throwError} from 'rxjs';
import {GoToAltinnModalComponent} from '@app/components/accounting/annual-settlement/annual-settlement-summary/goToAltinnModal.component';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {UniNumberFormatPipe} from '@uni-framework/pipes/uniNumberFormatPipe';

export enum StatusCodeReconcile {
    NotBegun = 36000,
    InProgress = 36005,
    Completed = 36010
}

// const journalEntryAccountNumbers = [2050, 8920, 2800, 8300, 8960, 8960, 8990, 2080, 2500, 2120, 8320, 1070, 8920];

@Injectable()
export class AnnualSettlementService extends BizHttp<any> {

    public relativeURL = 'annualsettlement';
    protected entityType = 'AnnualSettlement';
    baseUrl = environment.BASE_URL + environment.API_DOMAINS.BUSINESS;
    statisticsUrl = environment.BASE_URL + environment.API_DOMAINS.STATISTICS;
    noCache = true;

    constructor(
        protected http: UniHttp,
        private modalService: UniModalService,
        private toast: ToastService,
        private numberPipe: UniNumberFormatPipe) {
        super(http);
    }

    saveAnnualSettlement(entity) {
        if (!entity) {
            this.toast.addToast('on "saveAnnualSettlement" method entity is null');
            return of(entity);
        }
        if (entity.Fields) {
            entity.AnnualSettlementJSONData = JSON.stringify(entity.Fields);
        }
        return this.Put(entity.ID, entity).pipe(
            tap(() => this.toast.addToast('Lagret', ToastType.good, ToastTime.short))
        );
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
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('vatreports?action=validate-vatreports-for-financialyear&financialYear=' + financialYear)
            .send().pipe(
                map(res => res.body),
                map((result: any[]) => !!(result && result.length === 0))
            );
    }

    checkAmelding(financialYear) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('amelding?action=validate-periods&year=' + financialYear)
            .send().pipe(
                map(res => res.body),
                map((result: any[]) => !!(result && result.length === 0))
            );
    }

    checkLastyear(financialYear) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('annualsettlement?action=get-account-balance&fromAccountNumber=1000&toAccountNumber=2999&toFinancialYear=' + (financialYear - 1))
            .send()
            .pipe(
                map(res => res.body),
                map((result: number) => result > -1 && result < 1)
            );
    }

    checkStocksCapital(financialYear) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('annualsettlement?action=get-account-balance&fromAccountNumber=2000&toAccountNumber=2000&toFinancialYear=' + (financialYear))
            .send()
            .pipe(
                map(res => res.body),
                map((result: number) => result <= -30000)
            );
    }
    checkAssets(financialYear) {
        return forkJoin([
            this.checkAssetsAccountBalance(financialYear),
            this.checkAssetsIncomingFinancialValue(financialYear)
        ]).pipe(
            map(([
                    assetsAccountBalanceResult,
                    checkAssetsIncomingFinancialValueResult
                 ]) => {
                return <number>checkAssetsIncomingFinancialValueResult === <number>assetsAccountBalanceResult;
            })
        );
    }
    checkAssetsIncomingFinancialValue(financialYear) {
        return this.http
            .asGET()
                .usingBusinessDomain()
                .withEndPoint('assets?action=get-assets-incoming-financial-value&year=' + (financialYear + 1))
                .send()
            .pipe(
                map(res => res.body)
            );
    }

    checkAssetsAccountBalance(financialYear) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('annualsettlement?action=get-account-balance&fromAccountNumber=1000&toAccountNumber=1299&toFinancialYear=' + (financialYear))
            .send()
            .pipe(
                map(res => res.body)
            );
    }

    getAccountBalanceForSet(fromAccountNumber: number, toAccountNumber: number, year: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`annualsettlement?action=get-account-balance&fromAccountNumber=${fromAccountNumber}&toAccountNumber=${toAccountNumber}&toFinancialYear=${year}`)
            .send()
            .map(res => res.body);
    }

    getAssetAndGroups(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`annualsettlement/${id}?action=get-asset-and-groups`)
            .send()
            .map(res => res.body);
    }

    updateTaxbasedIB(body: any) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(body)
            .withEndPoint(`annualsettlement?action=update-taxbased-IB`)
            .send()
            .map(res => res.body);
    }

    getAssetTaxbasedIBDetails(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`annualsettlement/${id}?action=get-asset-taxbased-IB-details`)
            .send()
            .map(res => res.body);
    }

    getStockAccountsIBAndUB() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`annualsettlement?action=get-stock-accounts-IB-and-UB&year=2020`)
            .send()
            .map(res => res.body);
    }

    getAnnualSettlementWithCheckList(as) {
        const checkList = Object.assign({}, as.AnnualSettlementCheckList);
        return this.checkMvaMelding(as.AccountYear)
            .pipe(
                tap(resultMvaMelding => {
                    checkList.IsMvaMeldingOK = checkList.IsMvaMeldingOK === null || checkList.IsMvaMeldingOK === undefined
                        ? resultMvaMelding
                        : checkList.IsMvaMeldingOK;
                }),
                switchMap(() => this.checkAmelding(as.AccountYear)),
                tap(resultAmelding => {
                    checkList.IsAmeldingOK = checkList.IsAmeldingOK === null || checkList.IsAmeldingOK === undefined
                        ? resultAmelding
                        : checkList.IsAmeldingOK;
                }),
                switchMap(() => this.checkLastyear(as.AccountYear)),
                tap(resultLastYear => {
                    checkList.AreAllPreviousYearsEndedAndBalances = (checkList.AreAllPreviousYearsEndedAndBalances === null
                    || checkList.AreAllPreviousYearsEndedAndBalances === undefined)
                        ? resultLastYear
                        : checkList.AreAllPreviousYearsEndedAndBalances;
                }),
                switchMap(() => this.checkStocksCapital(as.AccountYear)),
                tap(resultStocksCapital => {
                    checkList.IsShareCapitalOK = checkList.IsShareCapitalOK === null || checkList.IsShareCapitalOK === undefined
                        ? resultStocksCapital
                        : checkList.IsShareCapitalOK;
                }),
                switchMap(() => this.checkAssets(as.AccountYear)),
                tap(resultAssets => {
                    checkList.IsAssetsOK = checkList.IsAssetsOK === null || checkList.IsAssetsOK === undefined
                        ? resultAssets
                        : checkList.IsAssetsOK;
                }),
                map(() => {
                    const _as = Object.assign({}, as);
                    _as.AnnualSettlementCheckList = checkList;
                    return _as;
                })
            );
    }

    moveFromStep1ToStep2(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'OneToStepTwo' );
    }
    moveFromStep2ToStep3(annualSettlement) {
        return this.completeReconcile(annualSettlement).pipe(
            switchMap(() => this.Transition(annualSettlement.ID, annualSettlement, 'TwoToStepThree' ))
        );
    }
    moveFromStep3ToStep4(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'ThreeToStepFour' );
    }
    moveFromStep4ToStep5(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'FourToStepFive' );
    }
    moveFromStep4ToStep6(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'FourToStepSix' );
    }
    moveFromStep5ToStep6(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'FiveToStepSix' );
    }
    moveFromStep5ToStep7(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'FiveToComplete' );
    }
    moveFromStep6ToStep7(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'SixToComplete' );
    }
    moveFromStep6ToStep5(annualSettlement) {
        return this.Transition(annualSettlement.ID, annualSettlement, 'SixToStepFive' );
    }
    startReconcile(annualSettlement) {
        if (annualSettlement.Reconcile.StatusCode === StatusCodeReconcile.NotBegun) {
            return this.http
                .asPOST()
                .usingBusinessDomain()
                .withEndPoint(`reconcile/${annualSettlement.Reconcile.ID}?action=BeginReconcile`)
                .send()
                .pipe(switchMap(() => this.addAccountsToReconcile(annualSettlement.Reconcile.ID)));
        }
        return this.addAccountsToReconcile(annualSettlement.Reconcile.ID);
    }
    completeReconcile(annualSettlement) {
        if (annualSettlement.Reconcile.StatusCode === StatusCodeReconcile.InProgress) {
            return this.http
                .asPOST()
                .usingBusinessDomain()
                .withEndPoint(`reconcile/${annualSettlement.Reconcile.ID}?action=CompleteReconcile`)
                .send();
        }
        return of(null);
    }
    addAccountsToReconcile(reconcileID) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`reconcile?action=AddAccountsToReconcile&reconcileID=${reconcileID}`)
            .send()
            .pipe(map(res => res.body));
    }

    getReconcileAccountsData(reconcile) {
        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint(
                '?model=ReconcileAccount'
                + '&select=Account.ID as AccountID,Account.AccountName as AccountName,'
                + 'Account.AccountNumber as AccountNumber,sum(JournalEntryLine.Amount) as TotalAmount'
                + '&filter=ReconcileAccount.ReconcileID eq ' + reconcile.ID
                // + ' and JournalEntryLine.FinancialDate ge \'' + reconcile.FromDate
                + ' and JournalEntryLine.FinancialDate le  \'' + reconcile.ToDate + '\''
                + '&groupby=ReconcileAccount.AccountID'
                + '&join=ReconcileAccount.AccountID eq Account.ID and ReconcileAccount.AccountID eq JournalEntryLine.AccountID'
            ).send().pipe(
                map(res => res.body),
                map((response: any) => response.Data)
            );
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
                annualSettlement.Reconcile.Accounts = _.orderBy(annualSettlement.Reconcile.Accounts, ['_AccountNumber'], ['asc']);
                annualSettlement.Reconcile.Accounts = annualSettlement.Reconcile.Accounts.filter(acc => !!acc._TotalAmount);
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
        return this.modalService.openCommentModal({data: data}).onClose;
    }
    transition(annualSettlement: any, fromStep: number, toStep: number) {
        const transitionMethod = `moveFromStep${fromStep}ToStep${toStep}`;
        if (this[transitionMethod]) {
            return this[transitionMethod](annualSettlement).pipe(
                switchMap(() => this.getAnnualSettlementWithReconcile(annualSettlement.ID))
            );
        }
        return throwError({
            message: `Transition "${transitionMethod}" not valid`,
            entity: annualSettlement,
            method: transitionMethod
        });
    }
    reset(annualSettelment) {
        return this.Action(annualSettelment.ID, 'reset-annualsettlement');
    }

    updateAnnualSettlement(annualSettelment) {
        return this.http
            .asPUT()
            .withEndPoint(this.relativeURL + `/${annualSettelment.ID}`)
            .usingBusinessDomain()
            .withBody(annualSettelment)
            .send()
            .pipe(map(res => res.body));
    }

    getTaxAndDisposalItems(annualSettlement: any, maxDividendAmount: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`annualsettlement/${annualSettlement.ID}?action=get-tax-calculation-and-disposal`)
            .send()
            .pipe(
                map(res => res.body),
                map(list => {
                    let slice = 1;
                    if (list[6].Item === 'Til disponering') {
                        slice = 0;
                    }
                    list[4 + slice]['info'] = 'tooltip text for 5';
                    list[5 + slice]['info'] = 'tooltip text for 6';
                    list[7 + slice]['editable'] = true;
                    list[7 + slice]['placeholder'] = 'Sum utbytte';
                    list[7 + slice]['Item'] += ' (Du kan maksimalt ta ut ' + this.numberPipe.transform(maxDividendAmount, 'money')
                        + ' i utbytte dette året)';
                    return [
                        {
                            title: 'Grunnlag for skatt',
                            items: [list[0], list[1], list[2]]
                        },
                        {
                            title: 'Til disponering',
                            items: (() => {
                                if (slice === 1) {
                                    return [list[3], list[4], list[5], list[6], list[7]];
                                }
                                return [list[3], list[4], list[5], list[6]];
                            })()
                        },
                        {
                            title: 'Utbytte',
                            items: [list[7 + slice], list[8 + slice], list[9 + slice]]
                        }
                    ];
                })
            );
    }
    getResult(id) {
        return this.Action(id, 'calculate-result', '', RequestMethod.Get);
    }
    getMaxDividendAmount(annualSettlement) {
        return this.Action(annualSettlement.ID, 'calculate-max-dividend-amount', '', RequestMethod.Get);
    }
    previewAnnualSettlementJournalEntry(annualSettlement) {
        return this.Action(annualSettlement.ID, 'preview-annualsettlement-journalentry', '', RequestMethod.Get);
    }
    generateAnnualSettlementJournalEntry(annualSettlement) {
        return this.Action(annualSettlement.ID, 'generate-annualsettlement-journalentry', '', RequestMethod.Get);
    }
    getAnnualSettlementSummary(annualSettlement) {
        return this.Action(annualSettlement.ID, 'get-annualesettlement-summary', '', RequestMethod.Get).pipe(
            map(list => {
                return [
                    {
                        title: 'Skattepliktig inntekt',
                        items: [list[0], list[1], list[2], list[3]]
                    },
                    {
                        title: 'Skattekostnad',
                        items: [list[4], list[5], list[6]]
                    },
                    {
                        title: 'Betalbar skatt',
                        items: [list[7], list[8], list[9]]
                    }
                ];
            })
        );
    }
    openGoToAltinnModal() {
        return this.modalService.open(GoToAltinnModalComponent);
    }
    openContactModal(annualSettlement, data) {
        return this.modalService.open(GoToAltinnModalComponent).onClose.pipe(
            map(result => {
                if (result) {
                    annualSettlement.Fields = Object.assign(annualSettlement.Fields, data);
                    return annualSettlement;
                }
                else return null;
            })
        );
    }
}
