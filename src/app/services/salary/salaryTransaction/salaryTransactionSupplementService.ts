import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryTransactionSupplement, WageTypeSupplement, Valuetype} from '../../../unientities';
import * as moment from 'moment';

@Injectable()
export class SupplementService extends BizHttp<SalaryTransactionSupplement> {

    constructor(protected http: UniHttp) {
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
        return `${wtSupp.Description} ${this.displayValue(supp, wtSupp)}`;
    }

    private getDate(date: Date) {
        return moment(date).format('dd.MM.yy');
    }

    public anyUnfinished(supps: SalaryTransactionSupplement[], wtSupps: WageTypeSupplement[] = []) {
        return supps
            .some(supp => {
                let wtSupplement = wtSupps
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
}
