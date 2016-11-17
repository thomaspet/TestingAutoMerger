import {Component, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {VatReport, AltinnGetVatReportDataFromAltinnStatus, VatReportSummaryPerPost} from '../../../../unientities';
import {AltinnAuthenticationDataModal} from '../../../common/modals/AltinnAuthenticationDataModal';
import {VatReportService} from '../../../../services/Accounting/VatReportService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'vatreport-receipt-view',
    templateUrl: 'app/components/accounting/vatreport/receipt/receipt.html'
})
export class ReceiptVat {
    @Input() public vatReport: VatReport;
    @Input() public reportSummaryPerPost: VatReportSummaryPerPost[];
    @Output() public vatReportDidChange: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(AltinnAuthenticationDataModal) private altinnAuthenticationDataModal: AltinnAuthenticationDataModal;

    private busy: boolean = false;

    constructor(
        private vatReportService: VatReportService,
        private toastService: ToastService,
        private errorService: ErrorService
    ) {}

    public checkForReceipt() {

        this.altinnAuthenticationDataModal.getUserAltinnAuthorizationData()
            .then(authData => {
                this.busy = true;

                this.vatReportService.tryToReadAndUpdateVatReportData(this.vatReport.ID, authData)
                    .subscribe(response => {
                            if (response.Status === AltinnGetVatReportDataFromAltinnStatus.WaitingForAltinnResponse) {
                                this.toastService.addToast(
                                    'Info',
                                    ToastType.warn,
                                    7,
                                    'Du må signere MVA meldingen i Altinn før du kan hente kvitteringen. Dette kan gjøres direkte i Altinn eller med knappen nederst i skjermbildet'
                                );

                                this.busy = false;
                            } else if (response.Status === AltinnGetVatReportDataFromAltinnStatus.RejectedByAltinn) {
                                this.toastService.addToast(
                                    'Info',
                                    ToastType.warn,
                                    7,
                                    'MVA meldingen ble avvist av Altinn'
                                );

                                this.busy = false;
                            } else {
                                this.vatReportService.Get(this.vatReport.ID, ['TerminPeriod', 'VatReportType','VatReportArchivedSummary'])
                                    .subscribe(updatedVatReport => {
                                            this.vatReport = updatedVatReport;
                                            this.vatReportDidChange.emit(updatedVatReport);

                                            this.toastService.addToast('Kvitteringsdata hentet fra Altinn', ToastType.good);
                                            this.busy = false;
                                        },
                                        this.errorService.handle
                                    );
                            }
                        },
                        this.errorService.handle
                    );
                }
            );
    }
}
