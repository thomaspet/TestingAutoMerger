import {Component, OnInit, ViewChild} from '@angular/core';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { IUniSaveAction } from '@uni-framework/save/save';
import { Product, BarnepassLeveranse, OppgaveBarnepass, AltinnReceipt } from '@uni-entities';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { AltinnIntegrationService, ErrorService, CustomerInvoiceService, FinancialYearService, ProductService, ModulusService } from '@app/services/services';
import { RequestMethod } from '@uni-framework/core/http';
import { IUniInfoConfig } from '@uni-framework/uniInfo/uniInfo';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniModalService, UniConfirmModalV2, ConfirmActions } from '@uni-framework/uni-modal';
import { BarnepassProductsModal } from './barnepassProductsModal';

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
        private modulusService: ModulusService
    ) {}
    
    ngOnInit(): void {
        this.toolbarConfig = {
            title: `RF-1301 Pass og stell av barn`
        };
        this.year = this.financialYearService.getActiveYear();
        this.updateSaveActions();

        this.getProducts();
        this.getInvoices();

        this.setTableConfig();
    }

    private setTableConfig()
    {
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

        this.actions.push(
        {
            label: 'Send til Altinn',//TODO TC-919 - og rapporter til kunder
            action: (done) => this.sendBarnepass(done),
            disabled: false,
            main: true
        } /* TODO TC-919,
        {
            label: 'Rapporter til kunder',
            action: () => {}
        }*/
        );
    }

    private getProducts()
    {
        this.productService.Action(null, 'get-barnepass-products', null, RequestMethod.Get).subscribe((result) => {
            this.products = result;
        });
    }

    private getInvoices()
    {
        this.customerInvoiceService.Action(null, 'get-barnepass-data', 'year=' + this.year, RequestMethod.Get).subscribe((result) => {
            this.invoices = result;
        });
    }
    
    private sendBarnepass(done) {
        let request = new BarnepassLeveranse();
        request.inntektsaar = this.year;
        request.oppgave = this.table.getTableData(true);
        const invalidSSN = this.isValidSSN();
        if (invalidSSN !== '')
        {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Fødselsnummer ' + invalidSSN + ' er ugyldig!',
                message: 'Vil du sende oppgave for kun fakturaer med gyldige fødselsnummer?'
            });
            modal.onClose.subscribe(response => {
                if (response !== ConfirmActions.ACCEPT) {
                    done('Sending avbrutt');
                    return;
                }
                request = this.removeInvalidFromRequest(request, invalidSSN);
                this.sendBarnepassToAltinn(request, done);
            });
        }
        else {
            this.sendBarnepassToAltinn(request, done);
        }
    }

    private removeInvalidFromRequest(request: BarnepassLeveranse, invalidSSN: string): BarnepassLeveranse
    {
        let invalidList = invalidSSN.split(', ');
        invalidList.forEach((invalid) => {
            const remove = request.oppgave.find(x => x.foedselsnummer === invalid);
            const index = request.oppgave.indexOf(remove);
            request.oppgave.splice(index, 1);
        });
        return request;
    }

    private sendBarnepassToAltinn(request: BarnepassLeveranse, done)
    {
        this.altinnService.sendBarnepass(request).subscribe(
            (response: AltinnReceipt) => {
                if (response) {
                    if (response.ErrorText) {
                        this.errorService.handle(response.ErrorText);
                    } else {
                        done('Oppgave for Pass og stell av barn er sendt');
                        //TODO TC-919 Rapporter til kunder
                    }
                }
            }, err => {
                this.errorService.handle(err);
                const msg = err.status === 500 ? 'Sjekk Altinn innstillinger, ' : '';
                done(msg + err.statusText);
            }
        );
    }

    private isValidSSN(): string
    {
        let invalidSSN = '';
        this.table.getTableData(true).forEach((person) => {
            if (!this.modulusService.validSSN(person.foedselsnummer))
            {
                if (invalidSSN !== '')
                {
                    invalidSSN = invalidSSN + ', ';
                }
                invalidSSN = invalidSSN + person.foedselsnummer;
            }
        });
        return invalidSSN;
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

}
