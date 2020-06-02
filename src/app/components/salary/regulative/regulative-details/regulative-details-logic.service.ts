import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { StatisticsService, ErrorService } from '@app/services/services';
import { LocalDate, Regulative, RegulativeGroup } from '@uni-entities';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { saveAs } from 'file-saver';
import { RegulativeService } from '@app/components/salary/regulative/shared/service/regulativeService';

export interface IRegulativeData {
    ID: number;
    StartDate: LocalDate;
    Active: boolean;
    DisplayDate: string;
}
@Injectable({
  providedIn: 'root'
})
export class RegulativeDetailsLogicService {
    exporting: boolean;

    constructor(
        private statisticsService: StatisticsService,
        private regulativeService: RegulativeService,
        private errorService: ErrorService,
    ) { }

    getLookup(regulativeID: number) {
        return (urlParams: HttpParams) => {
            let params = urlParams || new HttpParams();
            let filter = params.get('filter');
            filter = `${(filter ? `(${filter}) and ` : '')} RegulativeID eq ${regulativeID}`;
            params = params.set('filter', filter);
            params = params.set('model', 'RegulativeStep');
            params = params.set('select', 'Step as Step,Amount as Amount');
            return this.statisticsService.GetAllByHttpParams(params);
        };
    }

    getAllRegulatives(groupID: number): Observable<IRegulativeData[]> {
        return this.statisticsService
            .GetAllUnwrapped(
                `select=ID as ID,StartDate as StartDate,CreatedAt as CreatedAt` +
                `&model=Regulative&` +
                `filter=RegulativeGroupID eq ${groupID}` +
                `&${this.regulativeService.standardOrderby()}` +
                `&distinct=true`)
            .pipe(
                map((data: IRegulativeData[]) => data.filter((regulative: IRegulativeData, index, array) => {
                    return array.findIndex(r => r.StartDate === regulative.StartDate) === index;
                })),
                map(regulatives => {
                    if (regulatives.length) {
                        regulatives[0].Active = true;
                    }
                    regulatives.forEach(regulative => {
                        regulative.DisplayDate = moment(regulative.StartDate).format('DD.MM.YYYY');
                    });
                    return regulatives;
                }),
            );
    }

    exportRegulativeAndDownloadFile(regulative: IRegulativeData, regulativeGroup: RegulativeGroup): Observable<Blob> {
        this.exporting = true;
        const startDate = new LocalDate(regulative.StartDate.toString());
        const dateString = `${startDate.day}-${startDate.month}-${startDate.year}`;
        return this.regulativeService
            .export({...new Regulative(), ID: regulative.ID})
            .pipe(
                tap(file => {
                    const filename = `${regulativeGroup.Name || 'Regulativ'}_${dateString}`;
                    saveAs(file, `${filename}.xlsx`);
                }),
                catchError((err, obs) => this.errorService.handleRxCatch(err, obs))
            );
    }
}
