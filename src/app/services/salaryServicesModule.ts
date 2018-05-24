import {NgModule, ModuleWithProviders} from '@angular/core';
import {AMeldingService} from './salary/AMelding/AMeldingService';
import {BasicAmountService} from './salary/basicamount/basicAmountService';
import {CompanySalaryService} from './salary/companysalary/companySalaryService';
import {CompanyVacationRateService} from './salary/companysalary/companyVacationRateService';
import {EmployeeCategoryService} from './salary/employee/employeeCategoryService';
import {EmployeeLeaveService} from './salary/employee/employeeLeaveService';
import {EmployeeService} from './salary/employee/employeeService';
import {EmploymentService} from './salary/employee/employmentService';
import {PayrollrunService} from './salary/payrollrun/payrollRunService';
import {SalaryTransactionService} from './salary/salarytransaction/salaryTransactionService';
import {InntektService} from './salary/wagetype/inntektService';
import {WageTypeService} from './salary/wagetype/wageTypeService';
import {GrantService} from './salary/grants/grantService';
import {VacationpayLineService} from './salary/payrollrun/vacationpayLineService';
import {EmployeeTaxCardService} from './salary/employee/employeeTaxCardService';
import {SalarySumsService} from './salary/salaryTransaction/salarySumsService';
import {SalarybalanceService} from './salary/salarybalance/salarybalanceService';
import {SalaryBalanceLineService} from './salary/salarybalance/salaryBalanceLineService';
import {SupplementService} from './salary/salarytransaction/salaryTransactionSupplementService';
import {SalaryTransactionSuggestedValuesService} from './salary/salaryTransaction/salaryTransactionSuggestedValuesService';
import {AnnualStatementService} from './salary/annualStatement/annualStatementService';
import {VacationRateEmployeeService} from './salary/vacationrate/vacationRateEmployeeService';
import {TravelTypeService} from './salary/travel/travelTypeService';

export * from './salary/AMelding/AMeldingService';
export * from './salary/basicamount/basicAmountService';
export * from './salary/companysalary/companySalaryService';
export * from './salary/companysalary/companyVacationRateService';
export * from './salary/employee/employeeCategoryService';
export * from './salary/employee/employeeLeaveService';
export * from './salary/employee/employeeService';
export * from './salary/employee/employmentService';
export * from './salary/payrollrun/payrollRunService';
export * from './salary/salarytransaction/salaryTransactionService';
export * from './salary/wagetype/inntektService';
export * from './salary/wagetype/wageTypeService';
export * from './salary/grants/grantService';
export * from './salary/payrollrun/vacationpayLineService';
export * from './salary/employee/employeeTaxCardService';
export * from './salary/salaryTransaction/salarySumsService';
export * from './salary/salarybalance/salarybalanceService';
export * from './salary/salarybalance/salaryBalanceLineService';
export * from './salary/salarytransaction/salaryTransactionSupplementService';
export * from './salary/salaryTransaction/salaryTransactionSuggestedValuesService';
export * from './salary/annualStatement/annualStatementService';
export * from './salary/vacationrate/vacationRateEmployeeService';
export * from './salary/travel/travelTypeService';

@NgModule({})
export class SalaryServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SalaryServicesModule,
            providers: [
                AMeldingService,
                BasicAmountService,
                CompanySalaryService,
                CompanyVacationRateService,
                EmployeeCategoryService,
                EmployeeLeaveService,
                EmployeeService,
                EmploymentService,
                PayrollrunService,
                SalaryTransactionService,
                InntektService,
                WageTypeService,
                GrantService,
                VacationpayLineService,
                EmployeeTaxCardService,
                SalarySumsService,
                SalarybalanceService,
                SalaryBalanceLineService,
                SupplementService,
                SalaryTransactionSuggestedValuesService,
                AnnualStatementService,
                VacationRateEmployeeService,
                TravelTypeService
            ]
        };
    }
}

