import { NgModule } from '@angular/core';
import { AppCommonModule } from '@app/components/common/appCommonModule';
import { LibraryImportsModule } from '@app/library-imports.module';
import { UniFrameworkModule } from '@uni-framework/frameworkModule';
import { BalanceSearch } from './balanceSearch';
import { BalanceSearchRoutingModule } from './balanceSearch-routing.module';

@NgModule({
    imports: [BalanceSearchRoutingModule, AppCommonModule, LibraryImportsModule, UniFrameworkModule],
    declarations: [BalanceSearch],
    providers: []
})
export class BalanceSearchModule { }
