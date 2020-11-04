import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalanceSearch } from './balanceSearch';

const routes: Routes = [
        {
            path: '',
            component: BalanceSearch,
        },
    ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BalanceSearchRoutingModule { }
