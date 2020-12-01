import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {UniTableColumn, UniTableConfig} from '@uni-framework/ui/unitable';

@Component({
    selector: 'annual-settlement-reconcile',
    templateUrl: './annual-settlement-reconcile.component.html',
    styleUrls: ['./annual-settlement-reconcile.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnualSettlementReconcileComponent {
    annualSettlement: any;
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
                    return of(as);
                })
            ).subscribe((as => {
                console.log(as);
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
            new UniTableColumn('Konto', 'AccountNumber'),
            new UniTableColumn('Kontonavn', 'AccountName'),
            new UniTableColumn('Saldo i rengskapet', 'AccountName'),
            new UniTableColumn('Din saldo', 'AccountName'),
            new UniTableColumn('', '_button'),
            new UniTableColumn('Godkjent', '_accepted'),
            new UniTableColumn('', '_comment'),
        ];
        return new UniTableConfig('accounting.annualsettlement.reconcile', false, false)
            .setSearchable(false)
            .setColumns(cols)
            .setColumnMenuVisible(false);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
