import {Component, Input} from '@angular/core';
import {BankService, ReportDefinitionService} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {UniReportParamsModal} from '../../../reports/modals/parameter/reportParamModal';
import {Observable} from 'rxjs';

import * as moment from 'moment';

@Component({
    selector: 'uni-reconciliation-report-view',
    templateUrl: './reconciliation-report.html',
    styleUrls: ['reconciliation-report.sass']
})

export class UniReconciliationReportView {

    @Input()
    bankAccounts: any[] = [];

    @Input()
    currentAccount: any;

    reportData: any;

    viewTypes = [
        { label: 'Månedlig visning',    value: 'month' },
        { label: 'Detaljert visning',   value: 'details' }
    ];
    currentView: any = this.viewTypes[0];
    incommingBalance: number = 0;

    constructor (
        private bankService: BankService,
        private toast: ToastService,
        private reportService: ReportDefinitionService,
        private modalService: UniModalService,
    ) { }

    ngOnInit() {
        this.currentAccount = this.currentAccount || this.bankAccounts[0];
        this.getDataAndLoadList();
    }

    getDataAndLoadList() {
        Observable.forkJoin(
            this.bankService.getMonthlyReconciliationData(this.currentAccount.AccountID),
            this.bankService.getIncommingAccountBalance(this.currentAccount.AccountID)
        ).subscribe(([data, balance]) => {
            this.reportData = data.map((item) => {
                item.Period = moment(item.FromDate).format('DD.MM.YYYY') + ' - ' +  moment(item.Todate).format('DD.MM.YYYY');
                return item;
            });
            this.incommingBalance = balance && balance.Balance || 0;
        });
    }

    viewSelect() {
        if (this.currentView.value === 'details') {
            this.toast.addToast('Detaljvisning kommer snart :)', ToastType.good, 5);
        }
    }

    openReport() {
        this.reportService.GetAll(`filter=name eq 'Bankavstemming'`)
            .subscribe( (reports: Array<any>) => {
                if (reports.length) {
                    const report = reports[0];

                    this.modalService.open(UniReportParamsModal,
                        {   data: report,
                            header: report.Name,
                            message: report.Description
                        }).onClose.subscribe(modalResult => {
                            if (modalResult === ConfirmActions.ACCEPT) {
                                this.modalService.open(UniPreviewModal, {
                                    data: report
                                });
                            }
                        });
                }
            });
        return;
    }
}