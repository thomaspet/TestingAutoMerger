import { Injectable } from '@angular/core';
import {
    Account, SalaryTransaction, Department, Project, PayrollRun, WageType, SalaryTransactionSupplement, WageTypeSupplement, LocalDate
} from '@uni-entities';
import { SalaryTransactionViewService } from '../../shared/services/salary-transaction/salary-transaction-view.service';
import { IEmployee } from '@app/services/salary/employee/employeeService';
@Injectable()
export class SalaryTransactionChangeService {

    constructor(private salaryTransViewService: SalaryTransactionViewService) { }

    public mapWagetypeToTrans(
        rowModel: SalaryTransaction, employee: IEmployee, payrollRun: PayrollRun, departments: Department[], projects: Project[]
    ) {
        const wagetype: WageType = rowModel['Wagetype'];
        if (!wagetype) {
            rowModel['WageTypeID'] = null;
            rowModel['WageTypeNumber'] = null;
            return;
        }
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['FromDate'] = payrollRun.FromDate;
        rowModel['ToDate'] = payrollRun.ToDate;
        rowModel['_BasePayment'] = wagetype.Base_Payment;
        rowModel['Text'] = wagetype.WageTypeName;

        if (!rowModel.Amount) {
            rowModel['Amount'] = 1;
        }
        if (employee) {
            const employment = employee.Employments.find(emp => emp.Standard === true);
            if (employment) {
                rowModel['employment'] = employment;
                this.salaryTransViewService.mapEmploymentToTrans(rowModel, departments, projects);
            }
        }

        const supplements: SalaryTransactionSupplement[] = [];

        if (rowModel['Supplements']) {
            rowModel['Supplements']
                .filter(x => x.ID)
                .forEach((supplement: SalaryTransactionSupplement) => {
                    supplement.Deleted = true;
                    supplements.push(supplement);
                });
        }

        if (wagetype.SupplementaryInformations) {
            wagetype.SupplementaryInformations.forEach((supplement: WageTypeSupplement) => {
                const transSupplement = new SalaryTransactionSupplement();
                transSupplement.WageTypeSupplementID = supplement.ID;
                transSupplement.WageTypeSupplement = supplement;
                supplements.push(transSupplement);
            });
            rowModel['Supplements'] = supplements;
        }
    }

    public mapVatToTrans(rowModel: SalaryTransaction) {
        const account: Account = rowModel['_Account'];

        if (account != null && account.VatType != null) {
            rowModel.VatType = account.VatType;
            rowModel.VatTypeID = account.VatType.ID;
        } else {
            rowModel.VatType = null;
            rowModel.VatTypeID = null;
        }
    }

    public mapAccountToTrans(rowModel: SalaryTransaction): void {
        const account: Account = rowModel['_Account'];
        if (!account) {
            rowModel.Account = null;
            return;
        }

        rowModel.Account = account.AccountNumber;
    }

    public checkDates(rowModel) {
        const fromDate: LocalDate = new LocalDate(rowModel['FromDate']?.toString());
        const toDate: LocalDate = new LocalDate(rowModel['ToDate']?.toString());
        if (toDate < fromDate) {
            rowModel['ToDate'] = fromDate.toString();
        }
    }
}
