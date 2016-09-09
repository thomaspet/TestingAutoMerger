import {Component, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {VatReport, AltinnGetVatReportDataFromAltinnStatus, VatReportSummaryPerPost} from '../../../../unientities';
import {UniCurrencyPipe} from '../../../../pipes/UniCurrencyPipe';
import {UniAccountNumberPipe} from '../../../../pipes/UniAccountNumberPipe';
import {UniDateFormatPipe} from '../../../../pipes/UniDateFormatPipe';
import {AltinnAuthenticationDataModal} from '../../../common/modals/AltinnAuthenticationDataModal';
import {VatReportService} from '../../../../services/Accounting/VatReportService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

@Component({
    selector: 'vatreport-receipt-view',
    templateUrl: 'app/components/accounting/vatreport/receipt/receipt.html',
    pipes: [UniCurrencyPipe, UniAccountNumberPipe, UniDateFormatPipe],
    directives: [AltinnAuthenticationDataModal]
})
export class ReceiptVat {
    @Input() public vatReport: VatReport;
    @Input() public reportSummaryPerPost: VatReportSummaryPerPost[];
    @Output() public vatReportDidChange: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(AltinnAuthenticationDataModal) private altinnAuthenticationDataModal: AltinnAuthenticationDataModal;

    private onError: (error) => void = (error) => {
        this.toastService.addToast('Error', ToastType.bad, null, 'En feil oppstod, forsøk igjen senere!');
        console.log('An error occurred in the receipt.ts file:', error);
    };

    constructor(
        private vatReportService: VatReportService,
        private toastService: ToastService
    ) {}

    public checkForReceipt() {
        this.altinnAuthenticationDataModal.getUserAltinnAuthorizationData()
            .then(authData =>
                this.vatReportService.tryToReadAndUpdateVatReportData(this.vatReport.ID, authData)
                    .subscribe(response => {
                            if (response.Status === AltinnGetVatReportDataFromAltinnStatus.WaitingForAltinnResponse) {
                                this.toastService.addToast(
                                    'Info',
                                    ToastType.warn,
                                    7,
                                    'Du må signere MVA meldingen i Altinn før du kan hente kvitteringen'
                                );
                            } else if (response.Status === AltinnGetVatReportDataFromAltinnStatus.RejectedByAltinn) {
                                this.toastService.addToast(
                                    'Info',
                                    ToastType.warn,
                                    7,
                                    'MVA meldingen ble avvist av Altinn'
                                );
                            } else {
                                this.vatReportService.Get(this.vatReport.ID, ['TerminPeriod'])
                                    .subscribe(updatedVatReport => {
                                            this.vatReport = updatedVatReport;
                                            this.vatReportDidChange.emit(updatedVatReport);
                                        },
                                        this.onError
                                    );
                            }
                        },
                        this.onError
                    )
            );
    }
}
