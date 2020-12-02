import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

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
    accounts$ = new BehaviorSubject([]);
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
            this.annualSettlementService.getAnnualSettlement(id).pipe(
                switchMap(as => {
                    if (as.Reconcile.StatusCode === 36000) {
                        return this.annualSettlementService.startReconcile(as);
                    }
                    addMockData(as);
                    return of(as);
                })
            ).subscribe((as => {
                this.annualSettlement = as;
                this.config = this.generateReconcileTable();
                this.accounts$.next(this.annualSettlement.Reconcile.Accounts);
                this.changeDetector.markForCheck();
            }));
        });
    }
    private addTab(id: number) {
        this.tabService.addTab({
            name: 'Årsavslutning Reconcile', url: `/accounting/annual-settlement/${id}/reconcile`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }

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

    ngOnDestroy() {
        this.accounts$.complete();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
