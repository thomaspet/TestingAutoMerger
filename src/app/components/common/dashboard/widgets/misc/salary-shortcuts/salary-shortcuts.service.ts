import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
export interface IShortcut {
    name: string;
    link: string;
}
@Injectable()
export class SalaryShortcutsService {

    constructor(
        private router: Router
    ) { }

    public getShortcuts(): IShortcut[] {
        return [
            {
                name: 'DASHBOARD.SALARY_SHORTCUTS.EMPLOYEE_TITLE',
                link: 'salary/employees',
            },
            {
                name: 'DASHBOARD.SALARY_SHORTCUTS.WAGE_TYPE_TITLE',
                link: 'salary/wagetypes',
            },
            {
                name: 'DASHBOARD.SALARY_SHORTCUTS.PAYROLL_RUN_TITLE',
                link: 'salary/payrollrun',
            },
            {
                name: 'DASHBOARD.SALARY_SHORTCUTS.A_MELDING_TITLE',
                link: 'salary/amelding',
            },
            {
                name: 'DASHBOARD.SALARY_SHORTCUTS.TICKER_TITLE',
                link: 'overview?code=employee_list',
            },
            {
                name: 'DASHBOARD.SALARY_SHORTCUTS.REPORT_TITLE',
                link: 'reports?category=Payroll',
            },
        ];
    }

    public navigate(shortcut: IShortcut): void {
        if (!shortcut?.link) {
            return;
        }
        this.router.navigateByUrl(shortcut.link);
    }
}
