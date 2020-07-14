import { NgModule } from '@angular/core';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { CategoryViewComponent } from './category-view/category-view.component';
import { CategoryListComponent } from './category.component';
import { CategoryDetailComponent } from './category-details/category-details.component';
import { CategoryViewService } from './services/category-view.service';

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
