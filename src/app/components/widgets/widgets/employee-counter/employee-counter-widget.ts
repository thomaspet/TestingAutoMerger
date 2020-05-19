import { Component, ViewChild, ElementRef } from '@angular/core';
import { StatisticsService } from '@app/services/services';
import { Employee, Employment } from '@uni-entities';



@Component({
    selector: 'uni-employee-counter',
    templateUrl: './employee-counter-widget.html',
    styleUrls: ['./employee-counter-widget.sass']
})
export class EmployeeCounterWidget {
    @ViewChild('sum_employees') liquidityChart: ElementRef;

    activeEmployeesCount: number = 0;
    femaleEmployeesCount: number = 0;
    maleEmployeesCount: number = 0;
    startDateThisYear: number = 0;
    endDateThisYear: number = 0;
    activeEmployments: number = 0;


    constructor(
        private statisticsService: StatisticsService,
    ) { }

    ngOnInit(): void {
        this.statisticsService.GetAllUnwrapped('model=Employee&select=Sex as Sex,EmployeeNumber as EmployeeNumber').subscribe(
                (employees: Employee[]) => {
                    this.activeEmployeesCount = employees.length;
                    this.femaleEmployeesCount = employees.filter(x => x.Sex === 1).length;
                    this.maleEmployeesCount = employees.filter(x => x.Sex === 2).length;
                }
            );
        this.statisticsService.GetAllUnwrapped('model=Employment&select=min(StartDate),employeeID&having=year(min(StartDate)) eq activeyear()')
            .subscribe((employments: Employment[]) => {
                this.startDateThisYear = employments.length;
                }
            );
        this.statisticsService.GetAllUnwrapped('model=Employment&select=max(EndDate),employeeID,sum(casewhen(setornull(EndDate),1,0))&having=year(max(EndDate)) eq activeyear() and sum(casewhen(setornull(EndDate),1,0)) le 0')
            .subscribe((employments: Employment[]) => {
                this.endDateThisYear = employments.length;
                }
            );
        this.statisticsService.GetAllUnwrapped('model=Employment&select=count(ID) as sum&filter=setornull(EndDate) or EndDate gt getdate()')
            .subscribe(x => {
                this.activeEmployments = x[0].sum;
                }
            );
    }
}
