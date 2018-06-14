import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransactionSupplement, WageTypeSupplement, Valuetype, SalaryTransaction, WageType} from '../../../unientities';
import * as moment from 'moment';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../common/errorService';
import {WageTypeService} from '../wageType/wageTypeService';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';

export enum SalaryTransactionSupplementValidationCodes {
    TransDoesntExist = 116101,
    DoesNotMatchWageType = 116102
}

@Injectable()
export class SupplementService extends BizHttp<SalaryTransactionSupplement> {

    constructor(
        protected http: UniHttp,
        private errorService: ErrorService,
        private wageTypeService: WageTypeService,
        private toastService: ToastService
    ) {
        super(http);
        this.entityType = SalaryTransactionSupplement.EntityType;
        this.relativeURL = SalaryTransactionSupplement.RelativeUrl;
    }

    public displayValue(supp: SalaryTransactionSupplement, wtSupp: WageTypeSupplement = null): string {
        if (!supp.WageTypeSupplement && !wtSupp) {
            return supp.ValueString;
        }
        wtSupp = wtSupp || supp.WageTypeSupplement;

        switch (wtSupp.ValueType) {
            case Valuetype.IsBool:
                return supp.ValueBool ? 'JA' : 'NEI';
            case Valuetype.IsDate:
                return this.getDate(supp.ValueDate);
            case Valuetype.IsMoney:
                return '' + supp.ValueMoney;
            case Valuetype.Period:
                return `${this.getDate(supp.ValueDate)} - ${supp.ValueDate2}`;
            default:
                return supp.ValueString;
        }
    }

    public displaySupplement(supp: SalaryTransactionSupplement, wtSupp: WageTypeSupplement = null) {
        if (!supp.WageTypeSupplement && !wtSupp) {
            return '';
        }
        wtSupp = wtSupp || supp.WageTypeSupplement;
        return `${wtSupp.Description || wtSupp.Name} ${this.displayValue(supp, wtSupp)}`;
    }

    private getDate(date: Date) {
        return moment(date).format('dd.MM.yy');
    }

    public anyUnfinished(supps: SalaryTransactionSupplement[], wtSupps: WageTypeSupplement[] = []) {
        return supps
            .some(supp => {
                const wtSupplement = wtSupps
                    .find(wtSupp => wtSupp.ID === supp.WageTypeSupplementID) || supp.WageTypeSupplement;
                return this.isUnfinished(supp, wtSupplement);
            });
    }

    public isUnfinished(supp: SalaryTransactionSupplement, wtSupp: WageTypeSupplement) {
        if (wtSupp && wtSupp.ValueType === Valuetype.IsBool) {
            return false;
        }

        return !supp.ValueDate
            && !supp.ValueDate2
            && !supp.ValueMoney || supp.ValueMoney === 0
            && !supp.ValueString;
    }

    public supplementsCleanUpToast() {
        this.toastService
            .addToast(
                'Rettet tilleggsopplysninger',
                ToastType.warn,
                ToastTime.long,
                'Tilleggsopplysninger på en eller flere lønnsposter matchet ikke tilleggsopplysninger på tilhørende lønnsart. ' +
                'Vi har gått gjennom opplysningene og ryddet for deg.');
    }

    public checkForChangedSupplements(obj: any) {
        const validationErrors = this.errorService.extractValidationMessages(obj);
        if (!validationErrors.some(x => x.ComplexValidationRule
            && x.ComplexValidationRule.ValidationCode === SalaryTransactionSupplementValidationCodes.DoesNotMatchWageType)) {
            return;
        }
        this.supplementsCleanUpToast();
    }
}
