import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {map, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {NumberFormat} from '@app/services/common/numberFormatService';
import {ConfirmActions, ICommentModalResult} from '@uni-framework/uni-modal';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'annual-settlement-reconcile',
    templateUrl: './annual-settlement-reconcile.component.html',
    styleUrls: ['./annual-settlement-reconcile.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnualSettlementReconcileComponent {
    annualSettlement: any;
    config: UniTableConfig;
    accounts$ = new BehaviorSubject([]);
    onDestroy$ = new Subject();
    showInfoBox = true;
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
        private changeDetector: ChangeDetectorRef) {}

    ngOnInit() {
        this.config = this.generateReconcileTableConfig();
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.addTab(id);
            this.annualSettlementService.getAnnualSettlementWithReconcile(id)
                .subscribe((as: any) => {
                    this.annualSettlement = as;
                    this.setAccounts(this.annualSettlement.Reconcile.Accounts);
                    this.changeDetector.markForCheck();
                });
        });
    }
    ngAfterViewInit() {
        setTimeout(() => {
            (<HTMLElement>document.querySelector('input[tabIndex="100"]')).focus();
        }, 200);
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
    }
    callOpenModalForComment(account, oldBalance) {
        return this.annualSettlementService.openModalForComment(account.Comment).subscribe((result: ICommentModalResult) => {
            if (result && result.action === ConfirmActions.ACCEPT) {
                const _account = this.findAccount(account._AccountNumber);
                _account.Comment = result.comment;
                this.setAccount(_account);
            } else {
                const _account = this.findAccount(account._AccountNumber);
                _account.Balance = oldBalance;
                this.setAccount(_account);
            }
        });
    }
    completeReconcile() {
        this.annualSettlementService.moveFromStep2ToStep3(this.annualSettlement).subscribe(() => {
            this.toast.addToast('Avstem balansen completed', ToastType.good, ToastTime.short);
            this.router.navigateByUrl('/accounting/annual-settlement');
        });
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
    private generateReconcileTableConfig() {
        const cols = [
            new UniTableColumn('_AccountNumber', 'Konto')
                .setEditable(false)
                .setWidth('5rem'),
            new UniTableColumn('_AccountName', 'Kontonavn')
                .setEditable(false)
                .setWidth('10rem'),
            new UniTableColumn('_TotalAmount', 'Saldo i rengskapet', UniTableColumnType.Money)
                .setEditable(false),
            new UniTableColumn('Balance', 'Din saldo', UniTableColumnType.PermanentInput)
                .setEditable(false)
                .setAlignment('right')
                .setOptions({
                    type: UniTableColumnType.Money,
                    textAlignment: 'right',
                    onChange: (value, row) => {
                        const account = this.findAccount(row._AccountNumber);
                        const balance = parseFloat(value + '');
                        const oldBalance = account.Balance;
                        if (balance !== account.Balance) {
                            account.Balance = balance;
                            this.callOpenModalForComment(account, oldBalance);
                        }
                    }
                }),
            new UniTableColumn('_button', ' ', UniTableColumnType.Button)
                .setEditable(false)
                .setWidth('5rem')
                .setOptions({
                    hiddenResolver: (row) => row.Balance ===  row._TotalAmount,
                    buttonType: 'saldo-button',
                    labelResolver: (row) => this.numberFormat.asMoney(row._TotalAmount),
                    onClick: (row) => {
                        this.updateBalanceFromButton(row);
                    }
                }),
            new UniTableColumn('IsApproved', 'Godkjent')
                .setEditable(false)
                .setWidth('7rem')
                .setType(UniTableColumnType.Checkbox)
                .setCheckboxConfig({
                    checked: (row) => row.IsApproved,
                    onChange: (row, checked) => row.IsApproved = checked
                }),
            new UniTableColumn('Comment', ' ', UniTableColumnType.Icon)
                .setAlignment('center')
                .setWidth('2rem')
                .setEditable(false)
                .setOptions({
                    headerIconResolver: () => 'chat_bubble_outline',
                    iconResolver: (row) => {
                        if (!row.Comment && (row.Balance === 0 || row.Balance === row._TotalAmount)) {
                            return {
                                text: 'chat_bubble_outline'
                            };
                        }
                        if (!row.Comment && (row.Balance !== 0 && row.Balance !== row._TotalAmount)) {
                            return {
                                text: 'mark_chat_unread'
                            };
                        }
                        if (row.Comment) {
                            return {
                                text: 'mark_chat_read'
                            };
                        }
                    },
                    outlined: true,
                    titleResolver: (row) => row.Comment,
                    onClick: (row) => {
                        return this.callOpenModalForComment(row, row.Balance);
                    }
                })
        ];
        return new UniTableConfig('accounting.annualsettlement.reconcile', true, false)
            .setAutoAddNewRow(false)
            .setSearchable(false)
            .setColumns(cols)
            .setColumnMenuVisible(false);
    }

    private findAccount(accountNumber) {
        const accounts = this.accounts$.getValue();
        return accounts.find(x => x._AccountNumber === accountNumber);
    }
    private setAccount(account) {
        const accounts = this.getAccounts();
        const index = accounts.findIndex(x => x._AccountNumber === account._AccountNumber);
        accounts[index] = account;
        this.setAccounts(accounts);
    }
    private getAccounts() {
        return [...this.accounts$.getValue()];
    }
    private setAccounts(accounts) {
        this.accounts$.next(accounts);
        this.annualSettlement.Reconcile.Accounts = accounts;
    }
}
