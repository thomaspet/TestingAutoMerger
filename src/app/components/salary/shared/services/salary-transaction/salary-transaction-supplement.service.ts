import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { SalaryTransactionSupplement, WageTypeSupplement, Valuetype } from '@uni-entities';
import { ErrorService } from '@app/services/services';


export enum SalaryTransactionSupplementValidationCodes {
    TransDoesntExist = 116101,
    DoesNotMatchWageType = 116102
}

@Injectable()
export class SalaryTransactionSupplementService extends BizHttp<SalaryTransactionSupplement> {

    constructor(
        protected http: UniHttp,
        private errorService: ErrorService,
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
                return this.displayDate(supp.ValueDate);
            case Valuetype.IsMoney:
                return '' + supp.ValueMoney;
            case Valuetype.Period:
                return `${this.displayDate(supp.ValueDate)} - ${this.displayDate(supp.ValueDate2)}`;
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

    private displayDate(date: Date) {
        return moment(date).format('DD.MM.YYYY');
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
        if (!wtSupp) {
            return false;
        }
        switch (wtSupp.ValueType) {
            case Valuetype.IsBool:
                return false;
            case Valuetype.IsString:
                return !supp.ValueString;
            case Valuetype.IsMoney:
                return !supp.ValueMoney;
            case Valuetype.IsDate:
                return this.isDateUnfinished(supp.ValueDate);
            case Valuetype.Period:
                return (this.isDateUnfinished(supp.ValueDate) && this.isDateUnfinished(supp.ValueDate2));

            default:
                return true;
        }
    }

    private isDateUnfinished(date: Date) {
        return !date || date === new Date('0001-01-01T00:00:00Z');
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
