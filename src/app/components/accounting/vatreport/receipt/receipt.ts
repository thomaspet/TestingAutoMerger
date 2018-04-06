import {Component, Input, Output, EventEmitter} from '@angular/core';
import {VatReport, AltinnGetVatReportDataFromAltinnStatus, VatReportSummaryPerPost} from '../../../../unientities';
import {AltinnAuthenticationModal} from '../../../common/modals/AltinnAuthenticationModal';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {UniModalService} from '../../../../../framework/uni-modal';
import {
    ErrorService,
    VatReportService
} from '../../../../services/services';

@Component({
    selector: 'vatreport-receipt-view',
    templateUrl: './receipt.html'
})
export class ReceiptVat {
    @Input() public vatReport: VatReport;
    @Input() public reportSummaryPerPost: VatReportSummaryPerPost[];
    @Output() public vatReportDidChange: EventEmitter<any> = new EventEmitter<any>();

    private busy: boolean = false;

    constructor(
        private vatReportService: VatReportService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

    public checkForReceipt() {

        this.modalService
            .open(AltinnAuthenticationModal)
            .onClose
            .filter(auth => !!auth)
            .do(() => this.busy = true)
            .switchMap(authData => this.vatReportService.tryToReadAndUpdateVatReportData(this.vatReport.ID, authData))
            .subscribe(response => {
                if (response.Status === AltinnGetVatReportDataFromAltinnStatus.WaitingForAltinnResponse) {
                    this.toastService.addToast(
                        'Info',
                        ToastType.warn,
                        ToastTime.medium,
                        'Du må signere MVA meldingen i Altinn før du kan hente kvitteringen. '
                            + 'Dette kan gjøres direkte i Altinn eller med knappen nederst i skjermbildet'
                    );

                    this.busy = false;
                } else if (response.Status === AltinnGetVatReportDataFromAltinnStatus.RejectedByAltinn) {
                    this.toastService.addToast(
                        'Info',
                        ToastType.warn,
                        ToastTime.medium,
                        'MVA meldingen ble avvist av Altinn'
                    );

                    this.busy = false;
                } else {
                    this.vatReportService.Get(
                        this.vatReport.ID, ['TerminPeriod', 'VatReportType', 'VatReportArchivedSummary']
                    ).subscribe(updatedVatReport => {
                        this.vatReport = updatedVatReport;
                        this.vatReportDidChange.emit(updatedVatReport);

                        this.toastService.addToast('Kvitteringsdata hentet fra Altinn', ToastType.good);
                        this.busy = false;
                    },
                    err => this.errorService.handle(err));
                }
            },
            err => this.errorService.handle(err));
    }
}
