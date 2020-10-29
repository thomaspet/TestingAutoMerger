import {NgModule} from '@angular/core';
import {annualSettlementRoutes} from '@app/components/accounting/annual-settlement/annual-settlement.routes';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {LayoutModule} from '@app/components/layout/layoutModule';
import {RouterModule} from '@angular/router';
import {AnnualSettlementStepsComponent} from '@app/components/accounting/annual-settlement/annual-settlement-steps/annual-settlement-steps.component';
import {AnnualSettlementToolbarComponent} from '@app/components/accounting/annual-settlement/annual-settlement-toolbar/annual-settlement-toolbar.component';
import {AnnualSettlementSelectorComponent} from '@app/components/accounting/annual-settlement/annual-settlement-selector/annual-settlement-selector.component';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {AnnualSettlementGetIconPipe} from '@app/components/accounting/annual-settlement/annual-settlement-get-icon-class.pipe';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        RouterModule.forChild(annualSettlementRoutes)
    ],
    declarations: [
        AnnualSettlementToolbarComponent,
        AnnualSettlementStepsComponent,
        AnnualSettlementSelectorComponent,
        AnnualSettlementGetIconPipe
    ],
    providers: [
        AnnualSettlementService
    ]
})
export class AnnualSettlementModule {}
