import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {AnnualSettlementRoadMapComponent} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-road-map.component';
import {AnnualSettlementCheckListComponent} from '@app/components/accounting/annual-settlement/annual-settlement-check-list/annual-settlement-check-list.component';
import {AnnualSettlementReconcileComponent} from '@app/components/accounting/annual-settlement/annual-settlement-reconcile/annual-settlement-reconcile.component';
import {AnnualSettlementTestPageComponent} from '@app/components/accounting/annual-settlement/annual-settlement-test-page/annual-settlement-test-page.component';
import {AnnualSettlementWizardAnnualAccountsComponent} from '@app/components/accounting/annual-settlement/annual-settlement-wizard-annual-accounts/annual-settlement-wizard-annual-accounts.component';
import {AnnualSettlementDispositionIncludingTaxComponent} from '@app/components/accounting/annual-settlement/annual-settlement-disposition-including-tax/annual-settlement-disposition-including-tax.component';
import {AnnualSettlementWizardTaxFormComponent} from '@app/components/accounting/annual-settlement/annual-settlement-wizard-tax-form/annual-settlement-wizard-tax-form.component';

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
        component: AnnualSettlementTestPageComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/disposition-including-tax',
        component: AnnualSettlementDispositionIncludingTaxComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/wizzard-tax-form',
        component: AnnualSettlementWizardTaxFormComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/wizzard-annual-accounts',
        component: AnnualSettlementWizardAnnualAccountsComponent,
        canDeactivate: [CanDeactivateGuard]
    }
];
