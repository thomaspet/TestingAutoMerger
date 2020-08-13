import {Injectable} from '@angular/core';
import {Observable, throwError, of} from 'rxjs';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {SalaryTransactionService} from '@app/services/salary/salaryTransaction/salaryTransactionService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import {switchMap, map, tap} from 'rxjs/operators';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { SalaryBalanceTemplate, SalBalType, SalaryBalance, SalBalDrawType } from '@uni-entities';

@Injectable()
export class SalarybalanceTemplateService extends BizHttp<SalaryBalanceTemplate> {

    private defaultExpands: string[] = [];

    private instalmentTypes: {ID: SalBalType, Name: string}[] = [
        {ID: SalBalType.Advance, Name: 'Forskudd'},
        {ID: SalBalType.Contribution, Name: 'Bidragstrekk'},
        {ID: SalBalType.Outlay, Name: 'Utleggstrekk'},
        {ID: SalBalType.Garnishment, Name: 'Utleggstrekk skatt'},
        {ID: SalBalType.Union, Name: 'Fagforeningstrekk'},
        {ID: SalBalType.Other, Name: 'Andre'}
    ];

    constructor(
        protected http: UniHttp,
        private uniModalService: UniModalService,
        private salaryTransactionService: SalaryTransactionService,
        private toastService: ToastService
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

    public save(
        template: SalaryBalanceTemplate,
        salBals: SalaryBalance[] = [],
    ): Observable<SalaryBalanceTemplate> {
        const errors = [];

        if (!template.InstalmentType) {
            errors.push('type');
        }

        if (!template.WageTypeNumber) {
            errors.push('lønnsart');
        }

        template.SupplierID = template.SupplierID || 0;
        if (!template.SupplierID && template.InstalmentType !== SalBalType.Other) {
            errors.push('leverandør');
        }

        if (errors.length > 0) {
            const lastError = errors.pop();
            const errorString = !!errors.length ? `${errors.join(', ')} og ${lastError}` : lastError;

            const message = `Legg til ${errorString} før du lagrer`;
            this.toastService.addToast(message, ToastType.warn, 5);
            return throwError('Lagring avbrutt');
        }

        template.SalaryBalances = this.prepareSalBalsForTemplate(salBals.filter(x => x.EmployeeID), template);

        let canSave = of(true);
        if (template.ID) {
            canSave = this.uniModalService.confirm({
                header: 'Lagre trekkmal',
                message: 'Alle trekkene tilknyttet denne malen blir oppdatert',
            }).onClose.pipe(map(res => res === ConfirmActions.ACCEPT));
        }

        return canSave.pipe(
            switchMap(save => {
                if (save) {
                    return this.saveTemplate(template).pipe(tap(() => this.clearCache()));
                } else {
                    return throwError('Lagring avbrutt');
                }
            })
        );
    }

    private prepareSalBalsForTemplate(salBals: SalaryBalance[], template: SalaryBalanceTemplate) {
        if (!salBals || !salBals.length) {
            return [];
        }
        salBals.forEach(salBal => {
            if (!salBal.ID) {
                salBal._createguid = this.getNewGuid();
                salBal.Type = SalBalDrawType.FixedAmount;
            }
            if (!salBal.WageTypeNumber) {
                salBal.WageTypeNumber = template.WageTypeNumber;
            }
        });

        return salBals;
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
