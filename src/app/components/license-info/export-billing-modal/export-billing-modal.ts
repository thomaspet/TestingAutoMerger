import {Component, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ErrorService, ElsaContractService, ElsaCustomersService} from '@app/services/services';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {BillingData, ElsaCompanyLicense} from '@app/models';
import * as moment from 'moment';
import {forkJoin} from 'rxjs';
import {saveAs} from 'file-saver';

interface CompanyBilling {
    CompanyName: string;
    ExternalCustomerID: string;
    OrderNumber: number;
    Product: {
        ProductID: number;
        Amount: number;
    }[];
}

@Component({
    selector: 'export-billing-modal',
    templateUrl: './export-billing-modal.html',
    styleUrls: ['./export-billing-modal.sass']
})
export class ExportBillingModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();
    busy = false;

    form = new FormGroup({
        OrderNumber: new FormControl('', Validators.required),
        Period: new FormControl('', Validators.required),
        OrderDate: new FormControl(moment(new Date()).format('YYYY-MM-DD'), Validators.required),
        Reference: new FormControl('', Validators.required),
    });

    constructor(
        private errorService: ErrorService,
        private elsaContractService: ElsaContractService,
        private elsaCustomerService: ElsaCustomersService,
    ) {}

    ngOnInit() {
        this.busy = true;
        this.form.controls.Period.setValue(
            moment(new Date(this.options.data.selectedYear, this.options.data.selectedMonth, 1)).format('YYYY-MM-DD')
        );
        this.elsaCustomerService.getByContractID(this.options.data.contractID)
            .finally(() => this.busy = false)
            .subscribe(
                res => this.form.controls.Reference.setValue(res.ContactPerson || ''),
                err => console.error(err)
            );
    }

    onSubmit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.getBillingData();
        }
    }

    getBillingData() {
        const period = this.form.value.Period;
        const year = moment(period).year();
        const month = moment(period).month() + 1;
        const contractID = this.options.data.contractID;
        this.busy = true;
        forkJoin([
            this.elsaContractService.getBillingEstimate(contractID, year, month),
            this.elsaContractService.getCompanyLicenses(contractID)
        ])
        .subscribe(res => {
            this.handleData(res[0], res[1]);
        }, err => {
            this.busy = false;
            this.errorService.handle(err);
        });
    }

    handleData(billing: BillingData, companies: ElsaCompanyLicense[]) {

        // active companylicenses
        companies = companies.filter(company => {
            if (moment(company.EndDate).isValid()) {
                return moment(company.EndDate).isAfter(moment(new Date()));
            } else {
                return true;
            }
        });

        const cb: CompanyBilling[] = [];
        let orderNumber = +this.form.value.OrderNumber;

        for (const item of billing.Items) {
            if (item.Unit === 'bruker') {
                for (const detail of item.Details) {
                    if (detail.Tags) {

                        // we need to recalculate amount for each user on each company
                        const amount = +(detail.Counter / item.Days).toFixed(2);

                        for (const tag of detail.Tags) {

                            // check if company is already added
                            const companyIndex = cb.findIndex(company => company.CompanyName.toLowerCase() === tag.toLowerCase());
                            if (companyIndex !== -1) {

                                // if product is already added to company, sum up the amount, if not, add the product
                                const productIndex = cb[companyIndex].Product.findIndex(product => product.ProductID === item.ProductID);
                                if (productIndex !== -1) {
                                    cb[companyIndex].Product[productIndex].Amount =
                                        +(cb[companyIndex].Product[productIndex].Amount + amount).toFixed(2);
                                } else {
                                    cb[companyIndex].Product.push({ProductID: item.ProductID, Amount: amount});
                                }
                            } else {
                                cb.push({
                                    CompanyName: tag,
                                    ExternalCustomerID: companies.find(
                                        company => company.CompanyName.toLowerCase() === tag.toLowerCase()
                                        )?.ExternalCustomerID || '',
                                    OrderNumber: orderNumber,
                                    Product: [{ProductID: item.ProductID, Amount: amount}]
                                });

                                // increment orderNumber for each unique company we add
                                orderNumber++;
                            }
                        }
                    }
                }

            // item.Unit is 'selskap' or 'stk'
            } else {
                for (const detail of item.Details) {

                    // check if company is already added
                    const index = cb.findIndex(company => company.CompanyName.toLowerCase() === detail?.Name.toLowerCase());
                    if (index !== -1) {
                        cb[index].Product.push({ProductID: item.ProductID, Amount: detail.Counter});
                    } else {
                        cb.push({
                            CompanyName: detail?.Name || '',
                            ExternalCustomerID: companies.find(
                                company => company.CompanyName.toLowerCase() === detail?.Name.toLowerCase()
                                )?.ExternalCustomerID || '',
                            OrderNumber: orderNumber,
                            Product: [{ProductID: item.ProductID, Amount: detail.Counter}]
                        });

                        // increment orderNumber for each unique company we add
                        orderNumber++;
                    }
                }
            }
        }

        this.convertToCsvAndDownload(cb);
    }

    convertToCsvAndDownload (cb: CompanyBilling[]) {
        try {
            const csv = [];

            // csv files has to start with BOM (uFEFF) to support ÆØÅ
            csv.push(
                `\uFEFFOrdrenr;Ordredato;Leveringsdato;Kundenr;Kundenavn;Vår referanse;Deres referanse;` +
                `Hovedselger;Rekvisisjon;Leveringsadr.;Lev.postnr.;Lev.poststed;Varenr;Varenavn;` +
                `Antall;Pris eks. mva;Rabatt %;Prosjekt;Avdeling`
            );

            for (const order of cb) {
                for (const product of order.Product) {
                    csv.push([
                        order.OrderNumber,
                        moment(this.form.value.OrderDate).format('MM.DD.YYYY'),
                        '',
                        order.ExternalCustomerID,
                        order.CompanyName,
                        this.form.value.Reference,
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        product.ProductID,
                        '',
                        product.Amount,
                        '',
                        '',
                        '',
                        ''
                    ].join(';'));
                }
            }

            const fileName = 'Ordregrunnlag ' + moment(this.form.value.Period).format('MMMM YYYY') + '.csv';

            const csvBlob = new Blob([csv.join('\n')], {type: 'text/csv;charset=utf-8;'});
            saveAs(csvBlob, fileName);

        } catch (e) {
            console.error(e);
        } finally {
            this.busy = false;
        }
    }
}
