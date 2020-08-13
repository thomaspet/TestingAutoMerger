import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { EmployeeCategory, Employee, PayrollRun, FieldType } from '@uni-entities';

@Injectable()
export class EmployeeCategoryService extends BizHttp<EmployeeCategory> {

    private defaultExpands: string[] = [];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = EmployeeCategory.RelativeUrl;
        this.entityType = EmployeeCategory.EntityType;
    }

    public getCategory(id: number | string, expand: string[] = null): Observable<any> {
        if (id === 0) {
            if (expand) {
                return this.GetNewEntity(expand, 'employeecategory');
            }
            return this.GetNewEntity(this.defaultExpands, 'employeecategory');
        } else {
            if (expand) {
                return this.Get(id, expand);
            }
            return this.Get(id, this.defaultExpands);
        }
    }

    public searchCategories(query: string, ignoreFilter: string): Observable<EmployeeCategory[]> {
        return this
            .GetAll(`filter=(contains(Name,'${query}') or startswith(ID,'${query}'))`
                + `${ignoreFilter ? ' and (' + ignoreFilter + ')' : ''}&top=50`);
    }

    public getEmployeesInCategory(categoryID: number): Observable<Employee[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${categoryID}?action=employeesoncategory`)
            .send()
            .map(response => response.body);
    }

    public getPayrollrunsInCategory(categoryID: number): Observable<PayrollRun[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${categoryID}?action=payrollrunsoncategory`)
            .send()
            .map(response => response.body);
    }

    public getPrevious(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID lt ${ID}&top=1&orderBy=ID desc`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getNext(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID gt ${ID}&top=1&orderBy=ID`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'currentcategory',
            Fields: [
                {
                    EntityType: 'currentcategory',
                    Property: 'Name',
                    FieldType: FieldType.TEXT,
                    Label: 'Navn',
                    FieldSet: 0,
                    Section: 0
                }
            ]
        }]);
    }
}
