import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {catchError, map, switchMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {NumberFormat} from '@app/services/common/numberFormatService';
import {ConfirmActions, ICommentModalResult, UniModalService} from '@uni-framework/uni-modal';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniMath} from '@uni-framework/core/uniMath';
import {UniReconcileAccountFileUploadModal} from './reconcile-file-upload';

@Component({
    selector: 'annual-settlement-reconcile',
    templateUrl: './annual-settlement-reconcile.component.html',
    styleUrls: ['./annual-settlement-reconcile.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnualSettlementReconcileComponent {
    warningMessage = 'Siden din saldo ikke er den samme som saldo du har i rengskapet må du legge til en kommentar som forklarer hvorfor.' +
        ' Fullfør avstemmingen kan gjøres når alle linjer har grønt Godkjent-ikon.';
    annualSettlement: any;
    accounts$ = new BehaviorSubject([]);
    onDestroy$ = new Subject();
    showInfoBox = true;
    allAccountsAreApproved = false;
    busy = false;
    infoContent = {
        title: 'Slik bruker du sjekkelisten',
        text: `
            <p>
                Her vil du få en oversikt over alle dine balansekontoer som inneholder en saldo. Disse må du sjekke at stemmer med saldoen
                som står på dine årsoppgaver knyttet til de ulike områdene/kontoene.
            </p>
            <p>
                Om din saldo er den samme som i regnskaper klikker du bare på knappen med regnskapssaldoen på høyre side av registreringsfeltet
                og summen vil bli fylt inn og kontoen vil bli satt til kontrollert.
            </p>
            <p>
                Har du en differanse på en eller flere kontoer må du legge ved en kommentar som forklarer hvorfor dette er tilfelle.
                Når det er gjort må du manuelt sette kontoen til “Godkjent”.
            </p>
            <p>
                Når alle kontoene er kontrollert klikker du “Fullfør avstemming” og du kan gå videre i årsavslutningen.
            </p>
        `
    };
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private annualSettlementService: AnnualSettlementService,
        private tabService: TabService,
        private toast: ToastService,
        private numberFormat: NumberFormat,
        private changeDetector: ChangeDetectorRef,
        private modalService: UniModalService) {}

    ngOnInit() {
        this.busy = true;
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.addTab(id);
            this.annualSettlementService.getAnnualSettlementWithReconcile(id)
                .subscribe((as: any) => {
                    this.annualSettlement = as;
                    this.setAccounts(this.annualSettlement.Reconcile.Accounts);
                    this.busy = false;
                    this.allAccountsAreApproved = this.checkIfAllAccountsAreApproved();
                    this.changeDetector.markForCheck();
                }, () => this.busy = false, () => this.busy = false);
        }, (err) => {
            this.toast.addToast('Error lagring', ToastType.warn, ToastTime.medium, err.message);
            this.busy = false;
        }, () => this.busy = false);
    }

    private addTab(id: number) {
        this.tabService.addTab({
            name: 'Årsavslutning Reconcile', url: `/accounting/annual-settlement/${id}/reconcile`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }

    updateBalanceFromButton(_account) {
        const account = this.findAccount(_account._AccountNumber);
        account.Balance = account._TotalAmount;
        account.IsApproved = true;
        this.setAccount(account);
        this.allAccountsAreApproved = this.checkIfAllAccountsAreApproved();
    }
    updateBalance(account) {
        account.Balance = (account.Balance + '').replace(',', '.').replace(' ', '');
        account.Balance = UniMath.round(parseFloat(account.Balance).toFixed(2)) || 0;
        if (account.Balance !== account._LastBalance) {
            account._LastBalance = account.Balance;
            if (account.Balance === account._TotalAmount) {
                this.updateBalanceFromButton(account);
                return;
            }
            account.IsApproved = account.Comment ? true : false;
            this.setAccount(account);
            this.allAccountsAreApproved = this.checkIfAllAccountsAreApproved();
        }
    }

    openFileModal(account) {
        this.modalService.open(UniReconcileAccountFileUploadModal, { data: { account } }).onClose.subscribe((hasAttachements: boolean) => {
            account.HasAttachements = hasAttachements;
            const accounts = this.accounts$.getValue();
            const index = accounts.findIndex(acc => acc.ID === account.ID);
            accounts.splice(index, 1, account);
            this.accounts$.next(accounts);
        })
    }

    callOpenModalForComment(account, oldBalance) {
        if (this.annualSettlement?.StatusCode !== 36105) {
            return;
        }
        return this.annualSettlementService.openModalForComment(account.Comment).subscribe((result: ICommentModalResult) => {
            if (result && result.action === ConfirmActions.ACCEPT) {
                if (!result.comment) {
                    return;
                }
                const _account = this.findAccount(account._AccountNumber);
                _account.Comment = result.comment;
                _account.IsApproved = true;
                this.setAccount(_account);
            } else {
                const _account = this.findAccount(account._AccountNumber);
                _account.Balance = oldBalance;
                this.setAccount(_account);
            }
            this.allAccountsAreApproved = this.checkIfAllAccountsAreApproved();
        });
    }
    completeReconcile(done) {
        this.annualSettlementService.saveAnnualSettlement(this.annualSettlement, false).pipe(
            switchMap(() => this.annualSettlementService.moveFromStep2ToStep3(this.annualSettlement))
        ).subscribe(() => {
            if (done) {
                done();
            }
            this.toast.addToast('Avstem balansen completed', ToastType.good, ToastTime.short);
            this.router.navigateByUrl('/accounting/annual-settlement');
        }, (err) => {
            if (done) {
                this.toast.addToast('Error lagring', ToastType.warn, ToastTime.medium, err.message);
                done();
            }
        }, () => {
            if (done) {
                done();
            }
        });
    }
    saveAnnualSettlement(done) {
        this.annualSettlementService
            .saveAnnualSettlement(this.annualSettlement)
            .subscribe((as) => {
                if (done) {
                    done();
                }
                this.annualSettlement = as;
            });
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private findAccount(accountNumber) {
        const accounts = this.accounts$.getValue();
        return accounts.find(x => x._AccountNumber === accountNumber);
    }
    private setAccount(account) {
        const accounts = this.getAccounts();
        const index = accounts.findIndex(x => x._AccountNumber === account._AccountNumber);
        if (index >= 0) {
            accounts[index] = account;
        }
        this.setAccounts(accounts);
    }
    private getAccounts() {
        return [...this.accounts$.getValue()];
    }
    private setAccounts(accounts) {
        this.accounts$.next(accounts);
        this.annualSettlement.Reconcile.Accounts = accounts;
    }
    private checkIfAllAccountsAreApproved() {
        return this.getAccounts().reduce((result, account) => {
            if (result === true) {
                return account.IsApproved;
            }
            return false;
        }, true);
    }
}
