import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IncomeReportsService } from '@app/components/salary/income-reports/shared/shared-services/incomeReportsService';
import { IncomeReportData, StatusCodeIncomeReport } from '@uni-entities';
import { ConfirmActions, UniConfirmModalV2, UniModalService } from '@uni-framework/uni-modal';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { IncomeReportStore } from './income-reports.store';
import { IncomeReportModal } from './shared/components/income-report-modal/income-report-modal';

@Injectable()
export class IncomeReportsActions {
    constructor(
        private incomeReportsService: IncomeReportsService,
        private router: Router,
        private store: IncomeReportStore,
        private modalService: UniModalService
    ) { }

    createIncomeReportBasedOnID(id: number) {
        this.incomeReportsService
            .Get(id, ['Employment'])
            .subscribe(incomeReport => this.createIncomeReportBasedOn(incomeReport));
    }

    createIncomeReportBasedOn(incomeReport: IncomeReportData) {
        this.modalService
            .open(IncomeReportModal, { data: incomeReport })
            .onClose
            .subscribe(incomereportdata => {
                if (incomereportdata) {
                    this.router.navigateByUrl('/salary/incomereports/' + incomereportdata.ID);
                }
            });
    }

    getIncomeReportCounters() {
        return forkJoin([
            this.incomeReportsService.getIncomeReportsCountByType(),
            this.incomeReportsService.getIncomeReportsCountByType(StatusCodeIncomeReport.Created),
            this.incomeReportsService.getIncomeReportsCountByType(StatusCodeIncomeReport.Sent),
            this.incomeReportsService.getIncomeReportsCountByType(StatusCodeIncomeReport.Rejected)
        ]);
    }

    deleteIncomeReport(line) {
        let warningText = '';
        if (line.StatusCode === StatusCodeIncomeReport.Sent) {
            warningText = 'Inntektsmeldingen du ønsker å slette er allerede sendt inn til Altinn. For å bevare konsistens i dataene mellom ditt system og Altinn vil inntektsmeldingen få status lik Slettet. Du vil fremdeles finne den i systemet, men sensitive personopplysninger i inntektsmeldingen er fjernet.';
        }
        return this.modalService.open(UniConfirmModalV2, {
            header: 'Bekreft sletting',
            message: 'Er du sikker på at du vil slette intektsmeldingen?',
            warning: warningText,
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.pipe(switchMap((closeAction: ConfirmActions) => {
            return closeAction === ConfirmActions.ACCEPT ? this.incomeReportsService.deleteIncomeReport(line.ID) : of(false);
        }));
    }

    navigateToNewIncomeReport() {
        return this.router.navigateByUrl('/salary/incomereports/0');
    }

    loadIncomeReports(incomeReportStatus = '', params: HttpParams) {
        return this.incomeReportsService.getIncomeReports(incomeReportStatus, params);

    }

    save(incomereportdata: IncomeReportData = this.store.currentIncomeReport) {
        return this.incomeReportsService.Put(incomereportdata.ID, incomereportdata).pipe(
            tap(() => this.store.incomeReportIsDirty = false)
        );
    }

    openAskForSaveIncomeReportModal() {
        const modalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har endringer i inntektsskjema som ikke er lagret. Ønsker du å lagre disse før du fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.pipe(switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.save().pipe(
                    catchError(err => of(false)),
                    map(val => true)
                );
            }
            return of(confirm !== ConfirmActions.CANCEL);
        }));
    }

}
