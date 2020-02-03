import { Component, OnInit, ViewChild } from '@angular/core';
import { FinancialYearService, ThirdPartyData, AltinnIntegrationService, ErrorService, ThirdPartyItem, SupplierInvoiceService } from '@app/services/services';
import { IUniSaveAction } from '@uni-framework/save/save';
import { AltinnReceipt, SupplierInvoice } from '@uni-entities';
import { ToastType, ToastService } from '@uni-framework/uniToast/toastService';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { Observable } from 'rxjs';
import { RequestMethod } from '@uni-framework/core/http';
import { UniTableColumn, UniTableConfig, UniTableColumnType } from '@uni-framework/ui/unitable';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IUniInfoConfig } from '@uni-framework/uniInfo/uniInfo';
import {UniModalService} from '@uni-framework/uni-modal';
import {SelfEmployedDetailsModal} from '@app/components/altinn/overview/selfemployed/selfemployed-details-modal/selfemployed-details-modal';

@Component({
    selector: 'selfemployed-view',
    templateUrl: './selfemployedview.html',
    styleUrls: ['./selfemployedview.sass']
})

export class SelfEmployedView implements OnInit {

    @ViewChild(AgGridWrapper, { static: true })
    public table: AgGridWrapper;

    public toolbarConfig: IToolbarConfig;
    public actions: IUniSaveAction[];
    public year: number;
    public payments: any[];
    public tableConfig: UniTableConfig;

    public infoConfig: IUniInfoConfig = {
        headline: ''
      };

    constructor(
        private altinnService: AltinnIntegrationService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        // private modalService: UniModalService,
        // private modulusService: ModulusService,
        private toastService: ToastService,
        private supplierInvoiceService: SupplierInvoiceService,
        private modalService: UniModalService
    ) {}

    ngOnInit(): void {
        this.toolbarConfig = {
            title: `RF-1301 Selvst. næringsdrivende`
        };
        this.year = this.financialYearService.getActiveYear();

        this.setTableConfig();
        this.updateSaveActions();

        this.getPayments().subscribe((payments) => {
            this.payments = payments;
        });
/*
        this.getInvoices().subscribe((invoices) => {
            this.invoices = invoices;
        });
        this.getSupplierInvoice(755).subscribe((invoices) => {
            this.invoicesPerSupplier = invoices;
        });*/
    }

    public onDataLoaded() {
        this.table.agGridApi.selectAll();
    }

    private setTableConfig() {
        const nameCol = new UniTableColumn('name', 'Leverandør', UniTableColumnType.Text, false);
        const orgNumberCol = new UniTableColumn('number', 'Organisasjonsnummer', UniTableColumnType.Text, false);
        const amountCol = new UniTableColumn('amount', 'Beløp', UniTableColumnType.Money, true);
        amountCol.isSumColumn = true;

        const columns = [ nameCol, orgNumberCol, amountCol ];

        this.tableConfig = new UniTableConfig('selfemployedview.table', true)
            .setColumns(columns)
            .setSearchable(true)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setColumnMenuVisible(true)
            .setContextMenu([{
                label: 'Se detaljer',
                action: line => this.openDetailsModal(line)
            }]);
    }

    private stringToAmount(value: string) {
        const amountString = value
            .replace(/\s/g, '')
            .replace(',', '.');
        return parseFloat(amountString);
    }

    private openDetailsModal(line) {
        this.modalService.open(SelfEmployedDetailsModal, {
            data: {line: line, year: this.year}
        }).onClose.subscribe(value => {
            if (value !== null) {
                const amount = this.stringToAmount(value);
                this.payments.forEach(item => {
                    if (item.supplierID === line.supplierID) {
                        item.amount = amount;
                    }
                });
                this.payments = [].concat(this.payments);
            }
        });
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push( {
            label: 'Send til Altinn',
            action: (done) => this.sendToAltinn(done),
            disabled: false,
            main: true
        });
    }

    private sendToAltinn(done) {
        const request = <ThirdPartyData> {};
        request.year = this.year;
        request.items = this.table.getSelectedRows();
        if (request.items.length === 0) {
            this.toastService.addToast('Ingen leverandører er valgt', ToastType.warn);
            done();
            return;
        }
        // hvis tid: sjekk om number er gyldig (organisasjonsnummer eller fødselsnummer)

        this.altinnService.sendSelfEmployed(request).subscribe(
            (response: AltinnReceipt) => {
                if (response) {
                    if (response.ErrorText) {
                        this.errorService.handle(response.ErrorText);
                    } else {
                        this.toastService.addToast('Oppgave for Betaling til selvstendig næringsdrivende er sendt', ToastType.good, 3);
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

    private getPayments(): Observable<any> {
        return this.supplierInvoiceService.Action(null, 'get-selfemployed-payments', 'year=' + this.year, RequestMethod.Get);
    }

    private getInvoices(): Observable<any> {
        return this.supplierInvoiceService.Action(null, 'get-selfemployed-invoices', 'year=' + this.year, RequestMethod.Get);
    }

    private getSupplierInvoice(supplierID: number): Observable<any> {
        return this.supplierInvoiceService.GetAction(supplierID, 'get-supplierinvoices&year=' + this.year);
    }

}
