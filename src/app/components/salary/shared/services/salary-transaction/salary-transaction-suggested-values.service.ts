import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {VatTypeService} from '@app/services/accounting/vatTypeService';
import { EmploymentService, SharedPayrollRunService } from '@app/services/services';
import { SalaryTransaction, LocalDate } from '@uni-entities';

@Injectable()
export class SalaryTransactionSuggestedValuesService {

    constructor(
        private sharedPayrollRunService: SharedPayrollRunService,
        private employmentService: EmploymentService,
        private vatTypeService: VatTypeService,
    ) { }

    public suggestFromDate(
        salaryTransaction: SalaryTransaction,
        recurringPost: boolean = false): Observable<SalaryTransaction> {
        const employmentObs = salaryTransaction.EmploymentID
            ? this.employmentService.Get(salaryTransaction.EmploymentID)
            : this.employmentService.getStandardEmployment(salaryTransaction.EmployeeID);
        return Observable
            .forkJoin(
                this.sharedPayrollRunService
                    .getEarliestOpenRunOrLatestSettled(),
                employmentObs)
            .map((result) => {
                const [run, emp] = result;
                let dateField: Date;

                if (run && emp) {
                    if (run.StatusCode && (run.ToDate >= emp.StartDate)) {
                        const date = new LocalDate(run.ToDate);
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
