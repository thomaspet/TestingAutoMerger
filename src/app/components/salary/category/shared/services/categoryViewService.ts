import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import { EmployeeCategoryService } from '@app/components/salary/shared/services/category/employeeCategoryService';
import { ErrorService } from '@app/services/services';
import { EmployeeCategory } from '@uni-entities';
import { IToolbarSearchConfig } from '@app/components/common/toolbar/toolbar';

@Injectable()
export class CategoryViewService {

    constructor(
        private router: Router,
        private employeecategoryService: EmployeeCategoryService,
        private errorService: ErrorService
    ) {}

    public setupSearchConfig(empCat: EmployeeCategory): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.employeecategoryService.GetAll(
                `filter=ID ne ${empCat.ID} and (startswith(ID, '${query}') `
                + `or contains(Name, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: EmployeeCategory) => `${item.ID} - `
                + `${item.Name}`,
            initValue: (!empCat || !empCat.Name)
                ? 'Ny kategori'
                : `${empCat.ID} - ${empCat.Name || 'Kategori'}`,
            onSelect: selected => this.router.navigate(['salary/employeecategories/' + selected.ID])
        };
    }
}
