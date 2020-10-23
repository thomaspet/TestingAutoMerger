import { NgModule } from '@angular/core';
import { IncomingBalanceRoutingModule } from './incoming-balance-routing.module';
import { IncomingBalanceSharedModule } from './shared/incoming-balance-shared.module';
import { IncomingBalanceComponent } from './incoming-balance.component';
import { IncomingBalanceStoreService } from './services/incoming-balance-store.service';
import { IncomingBalanceHttpService } from './services/incoming-balance-http.service';

@NgModule({
    imports: [
        IncomingBalanceSharedModule,
        IncomingBalanceRoutingModule,
    ],
    declarations: [IncomingBalanceComponent],
    providers: [
        IncomingBalanceStoreService,
        IncomingBalanceHttpService,
    ]
})
export class IncomingBalanceModule { }
