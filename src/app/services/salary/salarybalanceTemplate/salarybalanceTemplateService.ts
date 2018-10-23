import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryBalanceTemplate, SalBalType, Employee, SalaryBalance} from '../../../unientities';
import {Observable} from 'rxjs';
import {FieldType} from '@uni-framework/ui/uniform/index';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {SalaryTransactionService} from '@app/services/salary/salaryTransaction/salaryTransactionService';

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
        protected http: UniHttp,
        private uniModalService: UniModalService,
        private salaryTransactionService: SalaryTransactionService
    ) {
        super(http);
        this.relativeURL = SalaryBalanceTemplate.RelativeUrl;
        this.entityType = SalaryBalanceTemplate.EntityType;
    }

    private clearCache() {
        this.salaryTransactionService.invalidateCache();
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

    public save(template: SalaryBalanceTemplate, done: (msg: string) => void = null) {
        return this.uniModalService
            .confirm({
                header: 'Lagre trekkmal',
                message: 'Alle trekkene tilknyttet denne malen blir oppdatert',
            })
            .onClose
            .do((res: ConfirmActions) => {
                if (res === ConfirmActions.ACCEPT || !done) { return; }
                done('Lagring avbrutt');
            })
            .filter((res: ConfirmActions) => res === ConfirmActions.ACCEPT)
            .switchMap(() => template.ID ? super.Put(template.ID, template) : super.Post(template))
            .do(() => this.clearCache());
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
