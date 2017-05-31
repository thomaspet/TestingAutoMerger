import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeCategory} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {FieldType} from 'uniform-ng2/main';

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
            .GetAll(`filter=contains(Name,'${query}')${ignoreFilter ? ' and (' + ignoreFilter + ')' : ''}&top=50`);
    }

    public getEmployeesInCategory(categoryID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${categoryID}?action=employeesoncategory`)
            .send()
            .map(response => response.json());
    }

    public getPayrollrunsInCategory(categoryID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${categoryID}?action=payrollrunsoncategory`)
            .send()
            .map(response => response.json());
    }

    public getPrevious(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID lt ${ID}&top=1&orderBy=ID desc`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }
    
    public getNext(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID gt ${ID}&top=1&orderBy=ID`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }
    
    public saveCategory(category: EmployeeCategory) {
        return super.Post(category);
    }

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'currentcategory',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'currentcategory',
                    Property: 'Name',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    hasLineBreak: false
                }
            ]
        }]);
    }
}
