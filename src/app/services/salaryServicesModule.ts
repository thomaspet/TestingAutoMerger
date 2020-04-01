import {NgModule, ModuleWithProviders} from '@angular/core';
import {AMeldingService} from './salary/aMelding/aMeldingService';
import {BasicAmountService} from './salary/basicAmount/basicAmountService';
import {CompanySalaryService} from './salary/companySalary/companySalaryService';
import {CompanyVacationRateService} from './salary/companySalary/companyVacationRateService';
import {EmployeeCategoryService} from './salary/employee/employeeCategoryService';
import {EmployeeLeaveService} from './salary/employee/employeeLeaveService';
import {EmployeeService} from './salary/employee/employeeService';
import {EmploymentService} from './salary/employee/employmentService';
import {PayrollrunService} from './salary/payrollRun/payrollrunService';
import {SalaryTransactionService} from './salary/salaryTransaction/salaryTransactionService';
import {InntektService} from './salary/wageType/inntektService';
import {WageTypeService} from './salary/wageType/wageTypeService';
import {GrantService} from './salary/grants/grantService';
import {VacationpayLineService} from './salary/payrollRun/vacationpayLineService';
import {EmployeeTaxCardService} from './salary/employee/employeeTaxCardService';
import {SalarySumsService} from './salary/salaryTransaction/salarySumsService';
import {SalarybalanceService} from './salary/salarybalance/salarybalanceService';
import {SalaryBalanceLineService} from './salary/salarybalance/salaryBalanceLineService';
import {SupplementService} from './salary/salaryTransaction/salaryTransactionSupplementService';
import {SalaryTransactionSuggestedValuesService} from './salary/salaryTransaction/salaryTransactionSuggestedValuesService';
import {AnnualStatementService} from './salary/annualStatement/annualStatementService';
import {VacationRateEmployeeService} from './salary/vacationrate/vacationRateEmployeeService';
import {TravelTypeService} from './salary/travel/travelTypeService';
import {TravelService} from './salary/travel/travelService';
import {TravelLineService} from './salary/travel/travelLineService';
import {SalarybalanceTemplateService} from './salary/salarybalanceTemplate/salarybalanceTemplateService';
import {EmployeeOnCategoryService} from './salary/employee/EmployeeOnCategoryService';
import {PayrollRunOnCategoryService} from './salary/payrollRun/payrollRunOnCategoryService';
import {OtpExportWagetypesService} from './salary/otpExport/otpExportWagetypesService';
import {RegulativeGroupService} from './salary/regulative/regulativeGroupService';
import {RegulativeService} from './salary/regulative/regulativeService';

export * from './salary/aMelding/aMeldingService';
export * from './salary/basicAmount/basicAmountService';
export * from './salary/companySalary/companySalaryService';
export * from './salary/companySalary/companyVacationRateService';
export * from './salary/employee/employeeCategoryService';
export * from './salary/employee/employeeLeaveService';
export * from './salary/employee/employeeService';
export * from './salary/employee/employmentService';
export * from './salary/payrollRun/payrollrunService';
export * from './salary/salaryTransaction/salaryTransactionService';
export * from './salary/wageType/inntektService';
export * from './salary/wageType/wageTypeService';
export * from './salary/grants/grantService';
export * from './salary/payrollRun/vacationpayLineService';
export * from './salary/employee/employeeTaxCardService';
export * from './salary/salaryTransaction/salarySumsService';
export * from './salary/salarybalance/salarybalanceService';
export * from './salary/salarybalance/salaryBalanceLineService';
export * from './salary/salaryTransaction/salaryTransactionSupplementService';
export * from './salary/salaryTransaction/salaryTransactionSuggestedValuesService';
export * from './salary/annualStatement/annualStatementService';
export * from './salary/vacationrate/vacationRateEmployeeService';
export * from './salary/travel/travelTypeService';
export * from './salary/travel/travelService';
export * from './salary/travel/travelLineService';
export * from './salary/salarybalanceTemplate/salarybalanceTemplateService';
export * from './salary/employee/EmployeeOnCategoryService';
export * from './salary/payrollRun/payrollRunOnCategoryService';
export * from './salary/otpExport/otpExportWagetypesService';
export * from './salary/regulative/regulativeGroupService';
export * from './salary/regulative/regulativeService';


@NgModule({})
export class SalaryServicesModule {
    static forRoot(): ModuleWithProviders<SalaryServicesModule> {
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
                TravelTypeService,
                TravelService,
                TravelLineService,
                SalarybalanceTemplateService,
                EmployeeOnCategoryService,
                PayrollRunOnCategoryService,
                OtpExportWagetypesService,
                RegulativeGroupService,
                RegulativeService
            ]
        };
    }
}

