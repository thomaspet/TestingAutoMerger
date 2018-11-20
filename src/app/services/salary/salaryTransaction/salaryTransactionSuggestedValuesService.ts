import {Injectable} from '@angular/core';
import {EmploymentService} from '../employee/employmentService';
import {PayrollrunService} from '../payrollRun/payrollrunService';
import {SalaryTransaction, LocalDate, Account, VatType} from '../../../unientities';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {SalaryTransactionService} from '@app/services/salary/salaryTransaction/salaryTransactionService';
import {VatTypeService} from '@app/services/accounting/vatTypeService';

@Injectable()
export class SalaryTransactionSuggestedValuesService {

    constructor(
        private payrollRunService: PayrollrunService,
        private employmentService: EmploymentService,
        private salaryTransactionService: SalaryTransactionService,
        private vatTypeService: VatTypeService,
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
        return this.vatTypeService
            .getVatTypeOnAccount(trans.Account)
            .map((vatType) => {
                if (!vatType) {
                    return trans;
                }
                trans.VatTypeID = vatType.ID;
                trans.VatType = vatType;
                return trans;
            });
    }
}
