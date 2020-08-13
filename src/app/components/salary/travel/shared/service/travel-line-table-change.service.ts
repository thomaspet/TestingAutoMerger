import { Injectable } from '@angular/core';
import { WAGE_TYPE_FIELD, ACCOUNT_FIELD, INVOICE_ACCOUNT_FIELD, TRAVEL_TYPE_FIELD, VAT_TYPE_FIELD } from './travel-lines-table.service';
import { TravelLine, WageType } from '@uni-entities';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { IRowChangeEvent } from '@uni-framework/ui/unitable';
import { switchMap, map } from 'rxjs/operators';
import { DimensionsColumnsService } from './dimensionsColumns/dimensions-columns.service';
import { TravelLineService } from '@app/components/salary/travel/shared/service/travel-line.service';

@Injectable()
export class TravelLineTableChangeService {

    constructor(
        private travelLineService: TravelLineService,
        private dimensionsColumnsService: DimensionsColumnsService
    ) { }
    public handleChange(event: IRowChangeEvent, wageTypes$: BehaviorSubject<WageType[]>): Observable<TravelLine> {
        return Observable
            .of(event.rowModel)
            .pipe(
                map((travelLine: TravelLine) => {
                    if (!travelLine.ID && !travelLine._createguid) {
                        travelLine._createguid = this.travelLineService.getNewGuid();
                    }
                    if (!travelLine.From) {
                        travelLine.From = new Date();
                    }
                    if (event.field === ACCOUNT_FIELD) {
                        this.mapAccountToTravelLine(travelLine);
                    }
                    if (event.field === INVOICE_ACCOUNT_FIELD) {
                        this.mapInvoiceAccountToTravelLine(travelLine);
                    }
                    if (event.field === TRAVEL_TYPE_FIELD) {
                        this.mapTravelTypeToTravelLine(travelLine, wageTypes$);
                    }
                    if (event.field === WAGE_TYPE_FIELD) {
                        this.mapWageTypeToTravelLine(travelLine);
                    }
                    if (event.field === VAT_TYPE_FIELD) {
                        travelLine.VatTypeID = travelLine.VatType && travelLine.VatType.ID;
                    }
                    this.dimensionsColumnsService.handleChange(travelLine['Dimensions'], event);
                    return travelLine;
                }),
                switchMap(travelLine => {
                    if ((
                            event.field === WAGE_TYPE_FIELD
                            || event.field === ACCOUNT_FIELD
                            || event.field === TRAVEL_TYPE_FIELD
                        )
                        && !!travelLine.From) {
                        return this.travelLineService.suggestVatType(travelLine);
                    }
                    return of(travelLine);
                }),
            );
    }


    private mapTravelTypeToTravelLine(travelLine: TravelLine, wageTypes$: BehaviorSubject<WageType[]>): TravelLine {
        const wts = wageTypes$.getValue();
        const travelType = travelLine.travelType;
        travelLine[WAGE_TYPE_FIELD] = wts && wts.find(wt => wt.WageTypeNumber === travelType.WageTypeNumber);
        travelLine.Description = travelLine.Description || travelType.ForeignDescription;
        travelLine.InvoiceAccount = travelType.InvoiceAccount;
        if (travelLine[WAGE_TYPE_FIELD]) {
            this.mapWageTypeToTravelLine(travelLine);
        }
        return travelLine;
    }

    private mapWageTypeToTravelLine(line: TravelLine): TravelLine {
        const wt: WageType = line[WAGE_TYPE_FIELD];
        line.travelType.WageTypeNumber = wt && wt.WageTypeNumber;
        line.AccountNumber = wt && wt.AccountNumber;

        return line;
    }

    private mapAccountToTravelLine(travelLine: TravelLine): TravelLine {
        if (!travelLine[ACCOUNT_FIELD]) {
            return travelLine;
        }
        travelLine.AccountNumber = travelLine[ACCOUNT_FIELD].AccountNumber;

        return travelLine;
    }

    private mapInvoiceAccountToTravelLine(travelLine: TravelLine): TravelLine {
        if (!travelLine[INVOICE_ACCOUNT_FIELD]) { return travelLine; }
        travelLine.InvoiceAccount = travelLine[INVOICE_ACCOUNT_FIELD].AccountNumber;
        return travelLine;
    }
}
