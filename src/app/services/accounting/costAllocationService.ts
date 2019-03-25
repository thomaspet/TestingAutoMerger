import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CostAllocation, JournalEntryLineDraft, LocalDate} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

@Injectable()
export class CostAllocationService extends BizHttp<CostAllocation> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CostAllocation.RelativeUrl;
        this.entityType = CostAllocation.EntityType;
    }

    public search(query: string): Observable<CostAllocation[]> {
        return super.GetAll(`filter=startswith(ID,'${query}') or contains(Name,'${query}')`);
    }

    public getCostAllocationOptions(source$) {
        const defaultValue = source$
            .map(source => (source && source.CostAllocationID) || 0)
            .switchMap(id => id > 0
                ? this.GetAll(`filter=ID eq ${id}&top=1`)
                : Observable.of([]))
            .take(1);

        return {
            getDefaultData: () => defaultValue,
            template: (obj: CostAllocation) => obj && obj.ID ? `${obj.ID} - ${obj.Name}` : '',
            search: (query: string) => this.search(query),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        }
    }

    public getDraftLinesBySupplierID(supplierID: number, useAccountID?: number, currencyAmount?: number, currencyCodeID?: number, exchangeRate?: number, financialDate?: LocalDate, vatDate?: LocalDate): Observable<JournalEntryLineDraft[]> {
        return super.GetAction(null, `create-journalentrylinesdrafts-from-supplier-costallocation&supplierId=${supplierID}&useAccountID=${useAccountID || ''}&currencyAmount=${currencyAmount || ''}&currencyCodeID=${currencyCodeID || ''}&exchangeRate=${exchangeRate || ''}&financialDate=${financialDate || ''}&vatDate=${vatDate || ''}`);
    }

    public getDraftLinesByAccountID(accountID: number, useAccountID?: number, currencyAmount?: number, currencyCodeID?: number, exchangeRate?: number, financialDate?: LocalDate, vatDate?: LocalDate): Observable<JournalEntryLineDraft[]> {
        return super.GetAction(null, `create-journalentrylinedrafts-from-account-costallocation&accountID=${accountID}&useAccountID=${useAccountID || ''}&currencyamount=${currencyAmount || ''}&currencyCodeID=${currencyCodeID || ''}&exchangeRate=${exchangeRate || ''}&financialDate=${financialDate || ''}&vatDate=${vatDate || ''}`);
    }

    public getDraftLinesByCostAllocationID(costAllocationID: number, useAccountID?: number, currencyAmount?: number, currencyCodeID?: number, exchangeRate?: number, financialDate?: LocalDate, vatDate?: LocalDate): Observable<JournalEntryLineDraft[]> {
        return super.GetAction(null, `create-journalentrylinedrafts-from-costallocation&costAllocationID=${costAllocationID}&useAccountID=${useAccountID || ''}&currencyAmount=${currencyAmount || ''}&currencyCodeID=${currencyCodeID || ''}&exchangeRate=${exchangeRate || ''}&financialDate=${financialDate || ''}&vatDate=${vatDate || ''}`);
    }

}
