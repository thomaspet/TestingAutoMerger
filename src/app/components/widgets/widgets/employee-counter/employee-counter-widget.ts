import { Component, ViewChild, ElementRef } from '@angular/core';
import { StatisticsService, ErrorService } from '@app/services/services';
import { UniMath } from '@uni-framework/core/uniMath';
import { Observable, of } from 'rxjs';
import { theme, THEMES } from 'src/themes/theme';
import { StandardVacationPayModalComponent } from '@app/components/common/modals/standard-vacation-pay-modal/standard-vacation-pay-modal.component';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { tap, switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
    selector: 'uni-employee-counter',
    templateUrl: './employee-counter-widget.html',
    styleUrls: ['./employee-counter-widget.sass']
})
export class EmployeeCounterWidget {
    @ViewChild('employee_counter') employeeChart: ElementRef;

    activeEmployeesCount: number = 0;
    femaleEmployeesCount: number = 0;
    maleEmployeesCount: number = 0;
    startDateThisYear: number = 0;
    endDateThisYear: number = 0;
    activeEmployments: number = 0;
    isBruno: boolean = theme.theme === THEMES.EXT02;
    isFirstTimeUser: boolean = false;


    constructor(
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        Observable.forkJoin(
            this.statisticsService.GetAllUnwrapped('model=Employment&select=Employee.Sex as Sex,Employee.EmployeeNumber as EmployeeNumber&expand=Employee&filter=StartDate le getdate() and (setornull(EndDate) or EndDate ge getdate() )&distinct=true'),
            this.statisticsService.GetAllUnwrapped('model=Employee')
        ).pipe(
            map(([activeEmployees, employeeCount]) => {
                this.activeEmployeesCount = activeEmployees.length;
                this.femaleEmployeesCount = activeEmployees.filter(x => x.Sex === 1).length;
                this.maleEmployeesCount = activeEmployees.filter(x => x.Sex === 2).length;
                return !(employeeCount[0].countid > 0);
            }),
            switchMap((isFirstTimeUser: boolean) => {
                this.isFirstTimeUser = isFirstTimeUser;
                return isFirstTimeUser ? of() : Observable.forkJoin(
                    this.statisticsService.GetAllUnwrapped('model=Employment&select=min(StartDate),employeeID&having=year(min(StartDate)) eq activeyear()'),
                    this.statisticsService.GetAllUnwrapped('model=Employment&select=max(EndDate),employeeID,sum(casewhen(setornull(EndDate),1,0))&having=year(max(EndDate)) eq activeyear() and sum(casewhen(setornull(EndDate),1,0)) le 0'),
                    this.statisticsService.GetAllUnwrapped('model=Employment&select=divide(sum(WorkPercent),100) as sum&filter=setornull(EndDate) or EndDate gt getdate()'),
                    );
                })
        ).subscribe(
            ([startDateThisYear, endDateThisYear, activeEmps]) => {
                this.startDateThisYear = startDateThisYear.length;
                this.endDateThisYear = endDateThisYear.length;
                this.activeEmployments = UniMath.round(Math.round(activeEmps[0].sum), 2);
            },
            (error) => this.errorService.handle(error)
        );
    }

    public openStandardVacationPayModal(): void {
        this.modalService.open(StandardVacationPayModalComponent).onClose.subscribe((x: ConfirmActions) => {
            if (x === ConfirmActions.ACCEPT) {
                this.router.navigateByUrl('/salary/employees');
            }
        });
    }
}
