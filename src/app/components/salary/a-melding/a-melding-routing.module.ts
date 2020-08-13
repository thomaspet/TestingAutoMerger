import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AMeldingViewComponent } from './a-melding-view.component';



const routes: Routes = [
  {
    path: '',
    component: AMeldingViewComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AMeldingRoutingModule { }
