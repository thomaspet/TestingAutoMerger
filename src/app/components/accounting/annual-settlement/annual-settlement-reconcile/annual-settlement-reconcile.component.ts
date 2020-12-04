import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {map, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ICommentModalResult} from '@uni-framework/uni-modal/modals/comment-modal/comment-modal.component';
import {UniMath} from '@uni-framework/core/uniMath';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';

@Component({
    selector: 'annual-settlement-reconcile',
    templateUrl: './annual-settlement-reconcile.component.html',
    styleUrls: ['./annual-settlement-reconcile.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnualSettlementReconcileComponent {
    annualSettlement: any;
    config;
    onDestroy$ = new Subject();
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private annualSettlementService: AnnualSettlementService,
        private tabService: TabService,
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
                    this.changeDetector.markForCheck();
                });
        });
    }
    private addTab(id: number) {
        this.tabService.addTab({
            name: 'Årsavslutning Reconcile', url: `/accounting/annual-settlement/${id}/reconcile`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }
    updateBalanceFromButton(account) {
        account.Balance = account._TotalAmount;
        account.IsApproved = true;
        this.changeDetector.markForCheck();
    }
    updateBalance(account) {
        account.Balance = (account.Balance + '').replace(',', '.').replace(' ', '');
        account.Balance = UniMath.useFirstTwoDecimals(parseFloat(account.Balance));
        if (account.Balance !== account._LastBalance) {
            account._LastBalance = account.Balance;
            if (account.Balance === account._TotalAmount) {
                this.updateBalanceFromButton(account);
                return;
            }
            account.IsApproved = false;
            this.callOpenModalForComment(account);
        }
    }
    callOpenModalForComment(account) {
        this.annualSettlementService.openModalForComment(account.Comment).subscribe((result: ICommentModalResult) => {
            if (result) {
                account.Comment = result.comment;
                this.changeDetector.markForCheck();
            }
        });
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
    private generateReconcileTableConfig() {
        const cols = [
            new UniTableColumn('AccountNumber', 'Konto'),
            new UniTableColumn('AccountName', 'Kontonavn'),
            new UniTableColumn('CompanyAmount', 'Saldo i rengskapet'),
            new UniTableColumn('MayAmount', 'Din saldo'),
            new UniTableColumn('_button', ' '),
            new UniTableColumn('Approved', 'Godkjent')
                .setType(UniTableColumnType.Checkbox),
            new UniTableColumn('Comment', ' ')
        ];
        return new UniTableConfig('accounting.annualsettlement.reconcile', false, false)
            .setSearchable(false)
            .setColumns(cols)
            .setColumnMenuVisible(false);
    }
}
