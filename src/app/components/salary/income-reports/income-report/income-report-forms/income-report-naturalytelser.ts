import { Component, Input, OnInit } from '@angular/core';
import { CodeListRowsCodeListRow, IncomeReportData } from '@uni-entities';
import { IModalOptions, UniModalService } from '@uni-framework/uni-modal';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { IncomeReportStore } from '../../income-reports.store';
import { IncomeReportHelperService, Ytelse} from '../../shared/shared-services/incomeReportHelperService';
import { IncomeReportNaturalytelseModal } from '../income-report-modals/naturalytelse-modal/income-report-naturalytelse.modal';


@Component({
    selector: 'income-report-naturalytelser',
    templateUrl: './income-report-naturalytelser.html',
    styleUrls: ['./income-report-naturalytelser.sass']
})

export class IncomeReportNaturalytelser implements OnInit {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    public opphoerYtelse: Ytelse = new Ytelse();
    public gjennopptagelsYtelse: Ytelse = new Ytelse();

    opphoerAvNaturalytelseListe: any[];
    gjenopptakelseNaturalytelseListe: any[];

    hasNaturalytelser: boolean = false;

    ytelser: CodeListRowsCodeListRow[];
    selectedYtelse: string;

    constructor(
        public incomeReportHelperService: IncomeReportHelperService,
        private incomeReportStore: IncomeReportStore,
        private modalService: UniModalService,
        private toast: ToastService
    ) {
    }

    ngOnInit(): void {
        this.incomeReportHelperService.getNaturalytelser().subscribe(
            res => this.ytelser = res
        );
    }


    public ngOnChanges() {
        if (this.incomereport) {
            if (this.incomereport['Report'].Skjemainnhold.gjenopptakelseNaturalytelseListe.length > 0 ||
                this.incomereport['Report'].Skjemainnhold.opphoerAvNaturalytelseListe.length > 0) {
                this.hasNaturalytelser = true;
            } else {
                this.hasNaturalytelser = false;
            }

            this.gjenopptakelseNaturalytelseListe = this.incomereport['Report'].Skjemainnhold.gjenopptakelseNaturalytelseListe;
            this.opphoerAvNaturalytelseListe = this.incomereport['Report'].Skjemainnhold.opphoerAvNaturalytelseListe;
        } else {
            this.gjenopptakelseNaturalytelseListe = [];
            this.opphoerAvNaturalytelseListe = [];
        }
    }

    deleteOpphoer(item) {
        if (this.readOnly) {
            return;
        }
        const index = this.opphoerAvNaturalytelseListe.indexOf(item, 0);
        if (index > -1) {
            this.opphoerAvNaturalytelseListe.splice(index, 1);
            this.incomeReportStore.incomeReportIsDirty = true;
        }
    }

    deleteGjennopptagelse(item) {
        if (this.readOnly) {
            return;
        }
        const index = this.gjenopptakelseNaturalytelseListe.indexOf(item, 0);
        if (index > -1) {
            this.gjenopptakelseNaturalytelseListe.splice(index, 1);
            this.incomeReportStore.incomeReportIsDirty = true;
        }
    }
    OpenNaturalytelseModal(isGjennoptagelse: boolean = false) {
        if (this.readOnly) {
            return;
        }
        let ytelserListe = this.ytelser;
        if (isGjennoptagelse) {
            // Should only contain values used in opphoerAvNaturalytelseListe
            ytelserListe = ytelserListe.filter(function(e) {
                return this.map(function (c: Ytelse) { return c.naturalytelseType; }).indexOf(e.Code) >= 0;
            }, this.opphoerAvNaturalytelseListe);
        }
        const options: IModalOptions = {
            header: isGjennoptagelse ? 'Arbeidstaker mottar igjen naturalytelser' : 'Naturalytelser som faller bort under fraværet',
            modalConfig: {
                showBelop: !isGjennoptagelse,
                ytelser: ytelserListe,
            },
            data: {
                employmentID: this.incomereport.EmploymentID,
            }
        };

        this.modalService.open(IncomeReportNaturalytelseModal, options).onClose.subscribe((response: Ytelse) => {
            if (response) {
                if (isGjennoptagelse) {
                    response.beloepPrMnd = null;
                    this.gjenopptakelseNaturalytelseListe.push(response);
                } else {
                    this.opphoerAvNaturalytelseListe.push(response);
                }
                this.incomeReportStore.incomeReportIsDirty = true;
                this.toast.addToast('Naturalytelse lagt til', ToastType.good, 5);
            }
        });
    }

}
