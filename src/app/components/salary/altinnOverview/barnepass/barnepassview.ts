import {Component, OnInit, ViewChild} from '@angular/core';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { IUniSaveAction } from '@uni-framework/save/save';
import { Product, AltinnReceipt, ReportDefinition } from '@uni-entities';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { AltinnIntegrationService, ErrorService, CustomerInvoiceService, FinancialYearService, ProductService, ModulusService, ReportDefinitionService, ReportNames, OppgaveBarnepass, BarnepassLeveranse } from '@app/services/services';
import { RequestMethod } from '@uni-framework/core/http';
import { IUniInfoConfig } from '@uni-framework/uniInfo/uniInfo';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniModalService, UniConfirmModalV2, ConfirmActions } from '@uni-framework/uni-modal';
import { BarnepassProductsModal } from '../../../../../framework/uni-modal/modals/barnepassModals/barnepassProductsModal';
import { BarnepassSenderModal } from '../../../../../framework/uni-modal/modals/barnepassModals/barnepassSenderModal';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { Observable } from 'rxjs';

declare var _;

@Component({
    selector: 'barnepass-view',
    templateUrl: './barnepassview.html',
    styleUrls: ['./barnepassview.sass']
})

export class BarnepassView implements OnInit {

    @ViewChild(AgGridWrapper)
    public table: AgGridWrapper;

    public toolbarConfig: IToolbarConfig;
    public actions: IUniSaveAction[];
    public tableConfig: UniTableConfig;

    public products: Product[];
    public invoices: OppgaveBarnepass[];
    public year: number;

    private sendReportDisabled = true;
    private report: ReportDefinition;

    public infoConfig: IUniInfoConfig = {
        headline: ''
      };

    constructor(
        private altinnService: AltinnIntegrationService,
        private errorService: ErrorService,
        private customerInvoiceService: CustomerInvoiceService,
        private productService: ProductService,
        private financialYearService: FinancialYearService,
        private modalService: UniModalService,
        private modulusService: ModulusService,
        private toastService: ToastService,
        private reportDefinitionService: ReportDefinitionService
    ) {}

    ngOnInit(): void {
        this.toolbarConfig = {
            title: `RF-1301 Pass og stell av barn`
        };
        this.year = this.financialYearService.getActiveYear();

        Observable.forkJoin(
            this.getProducts(),
            this.getInvoices(),
            this.altinnService.isBarnepassSendt(this.year),
            this.reportDefinitionService.getReportByName(ReportNames.BARNEPASS)
        ).subscribe((res) => {
            this.products = res[0];
            this.invoices = res[1];
            this.sendReportDisabled = !res[2];
            this.report = res[3];
            this.updateSaveActions();
        });

        this.setTableConfig();
    }

    private setTableConfig() {
        const orgNumberCol = new UniTableColumn('foedselsnummer', 'Fødselsnummer', UniTableColumnType.Text);
        const nameCol = new UniTableColumn('navn', 'Kundenavn', UniTableColumnType.Text);
        const amountCol = new UniTableColumn('paaloeptBeloep', `Beløp`, UniTableColumnType.Money);
        const emailCol = new UniTableColumn('email', 'E-post', UniTableColumnType.Text);
        const columns = [ nameCol, orgNumberCol, amountCol, emailCol ];

        this.tableConfig = new UniTableConfig('barnepassview.table', false)
            .setColumns(columns)
            .setSearchable(true)
            ;
        this.tableConfig.columnMenuVisible = false;
    }

    private updateSaveActions() {
        this.actions = [];

        let actionLabel = 'Send til Altinn';
        if (this.report) {
            actionLabel += ' og rapporter til kunder';
        }
        this.actions.push( {
            label: actionLabel,
            action: (done) => this.sendBarnepass(done),
            disabled: false,
            main: true
        });
        if (this.report) {
            this.actions.push( {
                label: 'Rapporter til kunder',
                action: (done) => this.sendReportToCustomers(done),
                disabled: this.sendReportDisabled
            });
        }
    }

    private getProducts(): Observable<any> {
        return this.productService.Action(null, 'get-barnepass-products', null, RequestMethod.Get);
    }

    private getInvoices(): Observable<any> {
        return this.customerInvoiceService.Action(null, 'get-barnepass-data', 'year=' + this.year, RequestMethod.Get);
    }

    private sendBarnepass(done) {
        let request = <BarnepassLeveranse> {};
        request.inntektsaar = this.year;
        request.oppgave = this.table.getTableData(true);
        const invalidSSN = request.oppgave
            .map(person => person.foedselsnummer)
            .filter(ssn => !this.modulusService.validSSN(ssn));
        if (invalidSSN.length > 0) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Fødselsnummer ' + invalidSSN + ' er ugyldig!',
                message: 'Ugyldig fødselsnummer vil bli avvist av Altinn. <br><br>' +
                    'Vil du sende oppgave for kun kunder med gyldige fødselsnummer?',
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Nei'
                }
            });
            modal.onClose.subscribe(response => {
                if (response !== ConfirmActions.ACCEPT) {
                    done('Sending avbrutt');
                    return;
                }
                request = this.removeInvalidFromRequest(request, invalidSSN);
                this.sendToAltinnAndReportToCustomers(request, done);
            });
        } else {
            this.sendToAltinnAndReportToCustomers(request, done);
        }
    }

    private sendReportToCustomers(done) {
        this.openSenderModal();
        done();
    }

    private removeInvalidFromRequest(request: BarnepassLeveranse, invalidSSN: string[]): BarnepassLeveranse {
        invalidSSN.forEach((invalid) => {
            const remove = request.oppgave.find(x => x.foedselsnummer === invalid);
            const index = request.oppgave.indexOf(remove);
            request.oppgave.splice(index, 1);
        });
        return request;
    }

    private sendToAltinnAndReportToCustomers(request: BarnepassLeveranse, done) {
        this.altinnService.sendBarnepass(request).subscribe(
            (response: AltinnReceipt) => {
                if (response) {
                    if (response.ErrorText) {
                        this.errorService.handle(response.ErrorText);
                    } else {
                        this.sendReportDisabled = false;
                        this.updateSaveActions();
                        this.toastService.addToast('Oppgave for Pass og stell av barn er sendt', ToastType.good, 3);
                        this.sendReportToCustomers(done);
                        done();
                    }
                }
            }, err => {
                this.errorService.handle(err);
                const msg = err.status === 500 ? 'Sjekk Altinn innstillinger, ' : '';
                done(msg + err.statusText);
            }
        );
    }

    openProductsModal() {
        this.modalService.open(BarnepassProductsModal, {
            data: {
                model: _.cloneDeep(this.products)
            }
        }).onClose.subscribe(response => {
            if (response) {
                this.products = response;
                this.getInvoices();
            }
        });
    }

    openSenderModal() {
        this.modalService.open(BarnepassSenderModal, {
            data: {
                year: this.year,
                report: this.report
            }
        });
    }

}
