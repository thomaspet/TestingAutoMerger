import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryBalanceTemplate, SalBalType, Employee, SalaryBalance} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {FieldType} from '@uni-framework/ui/uniform/index';

@Injectable()
export class SalarybalanceTemplateService extends BizHttp<SalaryBalanceTemplate> {

    private defaultExpands: string[] = [];

    private instalmentTypes: {ID: SalBalType, Name: string}[] = [
        {ID: SalBalType.Advance, Name: 'Forskudd'},
        {ID: SalBalType.Contribution, Name: 'Bidragstrekk'},
        {ID: SalBalType.Outlay, Name: 'Utleggstrekk'},
        {ID: SalBalType.Garnishment, Name: 'Påleggstrekk'},
        {ID: SalBalType.Union, Name: 'Fagforeningstrekk'},
        {ID: SalBalType.Other, Name: 'Andre'}
    ];

    constructor(
        protected http: UniHttp
    ) {
        super(http);
        this.relativeURL = SalaryBalanceTemplate.RelativeUrl;
        this.entityType = SalaryBalanceTemplate.EntityType;
    }

    public getInstalmentTypes() {
        return this.instalmentTypes;
    }

    public getInstalment(salarybalanceTemplate: SalaryBalanceTemplate) {
        if (salarybalanceTemplate) {
            return this.instalmentTypes.find(x => x.ID === salarybalanceTemplate.InstalmentType);
        } else {
            return null;
        }
    }

    public getPrevious(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID lt ${ID}&top=1&orderBy=ID desc`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getNext(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID gt ${ID}&top=1&orderBy=ID`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getTemplate(id: number | string, expand: string[] = null): Observable<any> {
        if (id === 0) {
            if (expand) {
                return this.GetNewEntity(expand, 'salarybalancetemplate');
            }
            return this.GetNewEntity(this.defaultExpands, 'salarybalancetemplate');
        } else {
            if (expand) {
                return this.Get(id, expand);
            }
            return this.Get(id, this.defaultExpands);
        }
    }

    public saveTemplate(salbalTemplate: SalaryBalanceTemplate): Observable<SalaryBalanceTemplate> {
        return salbalTemplate.ID
            ? super.Put(salbalTemplate.ID, salbalTemplate)
            : super.Post(salbalTemplate);
    }
}
