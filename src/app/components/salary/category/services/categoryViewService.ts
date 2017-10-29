import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {EmployeeCategoryService, ErrorService} from '../../../../services/services';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';
import {EmployeeCategory} from '../../../../unientities';

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
