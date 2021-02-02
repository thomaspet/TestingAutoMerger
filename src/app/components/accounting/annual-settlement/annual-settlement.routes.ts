import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {AnnualSettlementRoadMapComponent} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-road-map.component';
import {AnnualSettlementCheckListComponent} from '@app/components/accounting/annual-settlement/annual-settlement-check-list/annual-settlement-check-list.component';
import {AnnualSettlementReconcileComponent} from '@app/components/accounting/annual-settlement/annual-settlement-reconcile/annual-settlement-reconcile.component';
import {AnnualSettlementDispositionIncludingTaxComponent} from '@app/components/accounting/annual-settlement/annual-settlement-disposition-including-tax/annual-settlement-disposition-including-tax.component';
import {AnnualSettlementWriteofDifferenceStep} from '@app/components/accounting/annual-settlement/annual-settlement-writeof-difference/annual-settlement-writeof-difference';
import {AnnualSettlementWriteofDifferenceEnkStep} from '@app/components/accounting/annual-settlement/annual-settlement-writeof-difference/difference-enk/difference-enk';
import {AnnualSettlementSummaryComponent} from '@app/components/accounting/annual-settlement/annual-settlement-summary/annual-settlement-summary.component';

export const annualSettlementRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: AnnualSettlementRoadMapComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/check-list',
        component: AnnualSettlementCheckListComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/reconcile',
        component: AnnualSettlementReconcileComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/tax-depreciation-and-differences',
        component: AnnualSettlementWriteofDifferenceStep,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/tax-depreciation-and-differences-enk',
        component: AnnualSettlementWriteofDifferenceEnkStep,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/disposition-including-tax',
        component: AnnualSettlementDispositionIncludingTaxComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/summary',
        component: AnnualSettlementSummaryComponent,
        canDeactivate: [CanDeactivateGuard]
    }
];
