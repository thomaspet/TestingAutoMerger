import { Injectable } from '@angular/core';
import { DashboardDataService } from '@app/components/common/dashboard/dashboard-data.service';
import { catchError, map, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable()
export class EmployeeWidgetService {

    constructor(private dataService: DashboardDataService) { }
    public getStartDateThisYear() {
        return this.dataService.get(
            '/api/statistics?model=Employment&select=min(StartDate),employeeID&having=year(min(StartDate)) eq activeyear()&wrap=false'
        ).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(employments => employments?.length)
        );
    }

    public getEndDateThisYear() {
        return this.dataService.get(
            '/api/statistics?model=Employment&select=max(EndDate),employeeID,sum(casewhen(setornull(EndDate),1,0))&having=year(max(EndDate)) eq activeyear() and sum(casewhen(setornull(EndDate),1,0)) le 0&wrap=false'
        ).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            }),
            map(employments => employments?.length)
        );
    }

    public getEmployeeCounts() {
        const select = `count(ID) as employeeCount,divide(sum(WorkPercent),100) as fullTimeEquivalents,sum(casewhen(Employee.Sex eq 1,1,0)) as female,sum(casewhen(Employee.Sex eq 2,1,0)) as male`;
        const filter = `StartDate le getdate() and (setornull(EndDate) or EndDate ge getdate() )`;

        return this.dataService.get(`/api/statistics?model=Employment&expand=Employee&select=${select}&filter=${filter}&wrap=false`).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    public hasNoEmployees(): Observable<boolean> {
        return this.dataService
            .get('api/statistics?model=Employee&select=count(ID) as count')
            .pipe(
                map(result => !result.Data[0]?.count),
            );
    }
}
