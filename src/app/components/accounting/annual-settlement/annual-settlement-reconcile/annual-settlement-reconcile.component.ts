import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {tap} from 'rxjs/internal/operators/tap';

const addMockData = (annualSettlement) => {
    annualSettlement.Reconcile.Accounts = [
        {
            AccountNumber: 1000,
            AccountName: 'Account 1000',
            CompanyAmount: 20000,
            MyAmount: 0,
            Approved: false,
            Comment: null
        },
        {
            AccountNumber: 1500,
            AccountName: 'Account 1500',
            CompanyAmount: 50000,
            MyAmount: 0,
            Approved: false,
            Comment: null
        },
        {
            AccountNumber: 1000,
            AccountName: 'Account 1000',
            CompanyAmount: 20000,
            MyAmount: 0,
            Approved: false,
            Comment: null
        },
        {
            AccountNumber: 1500,
            AccountName: 'Account 1500',
            CompanyAmount: 50000,
            MyAmount: 0,
            Approved: false,
            Comment: null
        }
    ];
};

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
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
    /*
    private generateReconcileTable() {
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
    */
}
