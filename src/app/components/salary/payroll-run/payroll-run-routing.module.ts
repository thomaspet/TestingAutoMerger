import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PayrollRunListComponent } from './payroll-run-list.component';
import { PayrollRunDetailsComponent } from './payroll-run-details.component';
import { CanDeactivateGuard } from '@app/canDeactivateGuard';
import { WagetypeSyncGuard } from '../wage-type/wage-type-sync.guard';


const routes: Routes = [
  {
    path: '',
    component: PayrollRunListComponent,
  },
  {
    path: ':id',
    component: PayrollRunDetailsComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [WagetypeSyncGuard],
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRunRoutingModule { }
