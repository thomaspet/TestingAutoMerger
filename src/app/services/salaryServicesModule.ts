import {NgModule, ModuleWithProviders} from '@angular/core';
import {BasicAmountService} from './salary/basicAmount/basicAmountService';
import {CompanySalaryService} from './salary/companySalary/companySalaryService';
import {CompanyVacationRateService} from './salary/companySalary/companyVacationRateService';
import {EmployeeService} from './salary/employee/employeeService';
import {EmploymentService} from './salary/employee/employmentService';
import {SharedPayrollRunService} from './salary/payrollRun/shared-payroll-run.service';
import {SalaryTransactionService} from './salary/salaryTransaction/salaryTransactionService';
import {WageTypeService} from './salary/wageType/wageTypeService';
import {GrantService} from './salary/grants/grantService';
import {VacationpayLineService} from './salary/payrollRun/vacationpayLineService';
import {EmployeeTaxCardService} from './salary/employee/employeeTaxCardService';
import {SalarybalanceService} from './salary/salarybalance/salarybalanceService';
import {SalaryBalanceLineService} from './salary/salarybalance/salaryBalanceLineService';
import {TravelService} from './salary/travel/travelService';
import {SalarybalanceTemplateService} from './salary/salarybalanceTemplate/salarybalanceTemplateService';
import {EmployeeLanguageService} from './salary/employee/employee-language.service';
import {IncomeReportsService} from '../components/salary/income-reports/shared-services/incomeReportsService';

export * from './salary/basicAmount/basicAmountService';
export * from './salary/companySalary/companySalaryService';
export * from './salary/companySalary/companyVacationRateService';
export * from './salary/employee/employeeService';
export * from './salary/employee/employmentService';
export * from './salary/payrollRun/shared-payroll-run.service';
export * from './salary/salaryTransaction/salaryTransactionService';
export * from './salary/wageType/wageTypeService';
export * from './salary/grants/grantService';
export * from './salary/payrollRun/vacationpayLineService';
export * from './salary/employee/employeeTaxCardService';
export * from './salary/salarybalance/salarybalanceService';
export * from './salary/salarybalance/salaryBalanceLineService';
export * from './salary/travel/travelService';
export * from './salary/salarybalanceTemplate/salarybalanceTemplateService';
export * from './salary/employee/employee-language.service';
export * from '../components/salary/income-reports/shared-services/incomeReportsService';


@NgModule({})
export class SalaryServicesModule {
    static forRoot(): ModuleWithProviders<SalaryServicesModule> {
        return {
            ngModule: SalaryServicesModule,
            providers: [
                BasicAmountService,
                CompanySalaryService,
                CompanyVacationRateService,
                EmployeeService,
                EmploymentService,
                SharedPayrollRunService,
                SalaryTransactionService,
                WageTypeService,
                GrantService,
                VacationpayLineService,
                EmployeeTaxCardService,
                SalarybalanceService,
                SalaryBalanceLineService,
                TravelService,
                SalarybalanceTemplateService,
                EmployeeLanguageService
            ]
        };
    }
}

