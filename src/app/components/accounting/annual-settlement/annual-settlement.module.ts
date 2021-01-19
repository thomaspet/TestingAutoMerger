import {NgModule} from '@angular/core';
import {annualSettlementRoutes} from '@app/components/accounting/annual-settlement/annual-settlement.routes';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {LayoutModule} from '@app/components/layout/layoutModule';
import {RouterModule} from '@angular/router';
import {AnnualSettlementRoadMapComponent} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-road-map.component';
import {AnnualSettlementRoadMapToolbarComponent} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-road-map-toolbar.component';
import {AnnualSettlementSelectorComponent} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-selector/annual-settlement-selector.component';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {AnnualSettlementGetIconPipe} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-selector/annual-settlement-get-icon-class.pipe';
import {AnnualSettlementStepsComponent} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-steps/annual-settlement-steps.component';
import {AnnualSettlementCheckListComponent} from '@app/components/accounting/annual-settlement/annual-settlement-check-list/annual-settlement-check-list.component';
import {AnnualSettlementReconcileComponent} from '@app/components/accounting/annual-settlement/annual-settlement-reconcile/annual-settlement-reconcile.component';
import {AnnualSettlementDispositionIncludingTaxComponent} from '@app/components/accounting/annual-settlement/annual-settlement-disposition-including-tax/annual-settlement-disposition-including-tax.component';
import {AnnualSettlementHeaderComponent} from '@app/components/accounting/annual-settlement/annual-settlement-header/annual-settlement-header.component';
import {AnnualSettlementWriteofDifferenceStep} from '@app/components/accounting/annual-settlement/annual-settlement-writeof-difference/annual-settlement-writeof-difference';
import {SummaryDetailComponent} from '@app/components/accounting/annual-settlement/summary-detail/summary-detail.component';
import {AccountsSummaryModalComponent} from '@app/components/accounting/annual-settlement/annual-settlement-disposition-including-tax/accounts-summary-modal.component';
import {GoToAltinnModalComponent} from '@app/components/accounting/annual-settlement/annual-settlement-summary/goToAltinnModal.component';
import {AnnualSettlementSummaryComponent} from '@app/components/accounting/annual-settlement/annual-settlement-summary/annual-settlement-summary.component';
import {AssetsEditModal} from '@app/components/accounting/annual-settlement/annual-settlement-writeof-difference/assets-edit-modal';
import {ContactModalComponent} from '@app/components/accounting/annual-settlement/annual-settlement-summary/contactModal.component';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        RouterModule.forChild(annualSettlementRoutes)
    ],
    declarations: [
        AnnualSettlementRoadMapToolbarComponent,
        AnnualSettlementRoadMapComponent,
        AnnualSettlementSelectorComponent,
        AnnualSettlementStepsComponent,
        AnnualSettlementGetIconPipe,
        AnnualSettlementCheckListComponent,
        AnnualSettlementReconcileComponent,
        AnnualSettlementDispositionIncludingTaxComponent,
        AnnualSettlementHeaderComponent,
        AnnualSettlementWriteofDifferenceStep,
        AnnualSettlementSummaryComponent,
        SummaryDetailComponent,
        AccountsSummaryModalComponent,
        GoToAltinnModalComponent,
        AssetsEditModal,
        ContactModalComponent
    ],
    providers: [
        AnnualSettlementService
    ]
})
export class AnnualSettlementModule {}
