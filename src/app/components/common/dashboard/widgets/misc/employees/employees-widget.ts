import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {forkJoin} from 'rxjs';
import {theme, THEMES} from 'src/themes/theme';
import { EmployeeWidgetService } from './shared/services/employee-widget.service';
import { Router } from '@angular/router';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { StandardVacationPayModalComponent } from '@app/components/common/modals/standard-vacation-pay-modal/standard-vacation-pay-modal.component';

@Component({
    selector: 'employees-widget',
    templateUrl: './employees-widget.html',
    styleUrls: ['./employees-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesWidget {
    loading = true;
    hasData = false;

    colors = [theme.widgets.primary, theme.widgets.secondary];

    isBruno: boolean = theme.theme === THEMES.EXT02;
    activeEmployees: number;
    femaleEmployees: number;
    maleEmployees: number;
    startDateThisYear: number;
    endDateThisYear: number;
    fullTimeEquivalents: number;
    isFirstTimeUser: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private widgetService: EmployeeWidgetService,
        private router: Router,
        private modalService: UniModalService,
    ) {}

    ngOnInit() {
        this.widgetService
            .hasNoEmployees()
            .subscribe(noEmployees => this.isFirstTimeUser = noEmployees);

        this.widgetService.getEmployeeCounts().subscribe(res => {
            const counts = res && res[0] || {};
            if (counts.employeeCount) {
                this.hasData = true;

                this.activeEmployees = counts.employeeCount;
                this.femaleEmployees = counts.female || 0;
                this.maleEmployees = counts.male || 0;
                this.fullTimeEquivalents = Math.round((counts.fullTimeEquivalents || 0));

                forkJoin([this.widgetService.getStartDateThisYear(), this.widgetService.getEndDateThisYear()]).subscribe(([start, end]) => {
                    this.startDateThisYear = start || 0;
                    this.endDateThisYear = end || 0;
                    this.loading = false;
                    this.cdr.markForCheck();
                });
            } else {
                this.hasData = false;
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    openStandardVacationPayModal(): void {
        this.modalService.open(StandardVacationPayModalComponent).onClose.subscribe((x: ConfirmActions) => {
            if (x === ConfirmActions.ACCEPT) {
                this.router.navigateByUrl('/salary/employees');
            }
        });
    }

}
