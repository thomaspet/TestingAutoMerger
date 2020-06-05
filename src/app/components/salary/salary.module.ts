import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {salaryRoutes} from './salary.routes';
import {SalaryComponent} from './salary.component';
import { AMeldingModule } from './a-melding/a-melding.module';
import { BalanceModule } from './balance/balance.module';
import { AnnualStatementModule } from './annual-statement/annual-statement.module';
import { CategoryModule } from './category/category.module';
import { EmployeeModule } from './employee/employee.module';
import { OTPExportModule } from './otp-export/otp-export.module';
import { PayrollRunModule } from './payroll-run/payroll-run.module';
import { RegulativeModule } from './regulative/regulative.module';
import { SalaryBalanceTemplateModule } from './salary-balance-template/salary-balance-template.module';
import { SalaryTransactionSupplementModule } from './salary-transaction-supplement/salary-transaction-supplement.module';
import { TravelModule } from './travel/travel.module';
import { VariablePayrollsModule } from './variable-payrolls/variable-payrolls.module';
import { WageTypeModule } from './wage-type/wage-type.module';

@NgModule({
    imports: [
        AMeldingModule,
        BalanceModule,
        AnnualStatementModule,
        CategoryModule,
        EmployeeModule,
        OTPExportModule,
        PayrollRunModule,
        RegulativeModule,
        SalaryBalanceTemplateModule,
        SalaryTransactionSupplementModule,
        TravelModule,
        VariablePayrollsModule,
        WageTypeModule,

        RouterModule.forChild(salaryRoutes),
    ],
    declarations: [
        SalaryComponent,
    ],
    providers: [

    ]
})
export class SalaryModule {}
