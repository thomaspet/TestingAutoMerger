import { NgModule } from '@angular/core';
import { AppCommonModule } from '@app/components/common/appCommonModule';
import { LibraryImportsModule } from '@app/library-imports.module';
import { UniFrameworkModule } from '@uni-framework/frameworkModule';
import { IncomingBalanceGuard } from './guards/incoming-balance.guard';
import { IncomingBalanceLogicService } from './services/incoming-balance-logic.service';
import { IncomingBalanceNavigationService } from './services/incoming-balance-navigation.service';
import { UnlockIncomingBalanceModalComponent } from './components/unlock-incoming-balance-modal/unlock-incoming-balance-modal.component';
import { IncomingBalanceBookingInfoModalComponent } from './components/incoming-balance-booking-info-modal/incoming-balance-booking-info-modal.component';
import { IncomingBalanceRoutingModalComponent } from './components/incoming-balance-routing-modal/incoming-balance-routing-modal.component';



@NgModule({
    declarations: [
        UnlockIncomingBalanceModalComponent,
        IncomingBalanceBookingInfoModalComponent,
        IncomingBalanceRoutingModalComponent,
    ],
    imports: [
        LibraryImportsModule,
        AppCommonModule,
        UniFrameworkModule,
    ],
    exports: [
        LibraryImportsModule,
        AppCommonModule,
        UniFrameworkModule,
        IncomingBalanceRoutingModalComponent,
    ],
    providers: [
        IncomingBalanceLogicService,
        IncomingBalanceNavigationService,
        IncomingBalanceGuard,
    ]
})
export class IncomingBalanceSharedModule { }
