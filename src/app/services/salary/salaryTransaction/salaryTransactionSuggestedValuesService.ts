import {Injectable} from '@angular/core';
import {EmploymentService} from '../employee/employmentService';
import {PayrollrunService} from '../payrollRun/payrollrunService';
import {SalaryTransaction, LocalDate, Account} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';
import {SalaryTransactionService} from '@app/services/salary/salaryTransaction/salaryTransactionService';
import {AccountService} from '@app/services/accounting/accountService';

@Injectable()
export class SalaryTransactionSuggestedValuesService {

    constructor(
        private payrollRunService: PayrollrunService,
        private employmentService: EmploymentService,
        private salaryTransactionService: SalaryTransactionService,
        private accountService: AccountService,
    ) { }

    public suggestFromDate(
        salaryTransaction: SalaryTransaction,
        recurringPost: boolean = false): Observable<SalaryTransaction> {
        let employmentObs = salaryTransaction.EmploymentID
            ? this.employmentService.Get(salaryTransaction.EmploymentID)
            : this.employmentService.getStandardEmployment(salaryTransaction.EmployeeID);
        return Observable
            .forkJoin(
                this.payrollRunService
                    .getEarliestOpenRunOrLatestSettled(),
                employmentObs)
            .map((result) => {
                let [run, emp] = result;
                let dateField: Date;

                if (run && emp) {
                    if (run.StatusCode && (run.ToDate >= emp.StartDate)) {
                        let date = new LocalDate(run.ToDate);
                        dateField = moment(date).add(1, 'days').toDate();
                    } else if (run.FromDate >= emp.StartDate) {
                        dateField = run.FromDate;
                    }
                }

                if (!dateField && emp) {
                    dateField = emp.StartDate;
                }

                if (!dateField) {
                    dateField = new LocalDate().toDate();
                }

                return dateField;
            })
            .map(dateField => {
                if (recurringPost) {
                    salaryTransaction.recurringPostValidFrom = dateField;
                } else {
                    salaryTransaction.FromDate = dateField;
                }

                return salaryTransaction;
            });
    }

    public suggestVatType(trans: SalaryTransaction): Observable<SalaryTransaction> {
        if (!trans.Account) {
            trans.VatType = null;
            trans.VatTypeID = null;
            return Observable.of(trans);
        }
        return this.accountService
            .GetAll(`filter=AccountNumber eq ${trans.Account}&top=1`, ['VatType.VatTypePercentages'])
            .map(accounts => accounts[0])
            .map((account: Account) => {
                if (!account) {
                    return trans;
                }
                trans.VatTypeID = account.VatTypeID;
                trans.VatType = account.VatType;
                return trans;
            });
    }
}
