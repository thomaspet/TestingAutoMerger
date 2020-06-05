import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { CategoryViewComponent } from './category-view.component';
import { CategoryListComponent } from './category-list.component';
import { CategoryDetailComponent } from './views/category-details.component';
import { CategoryViewService } from './shared/services/category-view.service';

@NgModule({
    imports: [
        SalarySharedModule,
    ],
    declarations: [
        CategoryViewComponent,
        CategoryListComponent,
        CategoryDetailComponent,
    ],
    providers: [
        CategoryViewService,
    ]
  })
  export class CategoryModule { }
