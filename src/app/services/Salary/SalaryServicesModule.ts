import {NgModule} from '@angular/core';
import {AMeldingService} from './AMelding/AMeldingService';
import {BasicAmountService} from './BasicAmount/BasicAmountService';
import {CompanySalaryService} from './CompanySalary/CompanySalaryService';
import {CompanyVacationRateService} from './CompanySalary/CompanyVacationRateService';
import {EmployeeCategoryService} from './Employee/EmployeeCategoryService';
import {EmployeeLeaveService} from './Employee/EmployeeLeaveService';
import {EmployeeService} from './Employee/EmployeeService';
import {EmploymentService} from './Employee/EmploymentService';
import {PayrollrunService} from './Payrollrun/PayrollrunService';
import {SalaryTransactionService} from './SalaryTransaction/SalaryTransactionService';
import {InntektService} from './WageType/InntektService';
import {WageTypeService} from './WageType/WageTypeService';
import {GrantService} from './Grants/GrantService';
import {VacationpayLineService} from './Payrollrun/VacationpayLineService';
import {EmployeeTaxCardService} from './Employee/EmployeeTaxCardService';

@NgModule({
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
        EmployeeTaxCardService
    ]
})
export class SalaryServicesModule { }

