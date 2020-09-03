import { Injectable } from '@angular/core';
import { DashboardDataService } from '../../../dashboard-data.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
export interface IEmployee {
    id: number;
    number: number;
    name: string;
    eMail: string;
    birthDate: Date;
    subEntityName: string;
}
@Injectable()
export class RecentEmployeesService {

    constructor(private dataService: DashboardDataService) { }

    public GetEmployees(): Observable<IEmployee[]> {
        return this.dataService
            .get(`/api/statistics`
                + `?select=`
                    + `ID as id,`
                    + `EmployeeNumber as number,`
                    + `BusinessRelationInfo.Name as name,`
                    + `DefaultEmail.EmailAddress as eMail,`
                    + `BirthDate as birthDate,`
                    + `SubEntityInfo.Name as subEntityName,`
                    + `CreatedAt`
                + `&model=Employee`
                + `&expand=BusinessRelationInfo.DefaultEmail,SubEntity`
                + `&join=SubEntity.BusinessRelationID eq BusinessRelation.ID as SubEntityInfo`
                + `&orderby=CreatedAt desc`
                + `&top=10`)
            .pipe(
                map(result => result.Data.map(data => ({...data, birthDate: data.birthDate && moment(data.birthDate).format('L')}))),
            );
    }
}
