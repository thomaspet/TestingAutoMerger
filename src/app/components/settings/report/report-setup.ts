import {Component, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {ReportTypeService, CampaignTemplateService} from '@app/services/services';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {CompanySettings} from '@uni-entities';

@Component({
    selector: 'uni-report-settings',
    templateUrl: './report-setup.html',
    styleUrls: ['./report-setup.sass']
})

export class UniReportSettingsView {

    @Input()
    companySettings: CompanySettings;

    isDirty: boolean;

    quoteFormList: any[];
    orderFormList: any[];
    invoiceFormList: any[];

    isOpen: boolean[] = [true, false, false, false];

    logoHideOptions: {Value: number, Label: string}[] = [
        {Value: 1, Label: 'Firmanavn'},
        {Value: 2, Label: 'Logo'},
        {Value: 3, Label: 'Firmanavn & logo'},
    ];

    logoAlignOptions: {Alignment: number, Label: string}[] = [
        {Alignment: 1, Label: 'Venstre'},
        {Alignment: 2, Label: 'Høyre'}
    ];

    localizationOptions: {Culture: string, Label: string}[] = [
        {Culture: 'no', Label: 'Norsk bokmål'},
        {Culture: 'en', Label: 'Engelsk'},
    ];

    // Store values
    template: any = {};
    logoHide: any = {};
    lang: any = {};

    // Store form values
    invoice = {};
    order = {};
    quote = {};

    selectConfig = {
        template: (item) => item ? item.Label : '',
        searchable: false,
        hideDeleteButton: true
    };

    formComfig = {
        template: (item) => item ? item.Description : '',
        searchable: false,
        hideDeleteButton: true
    };

    constructor(
        private reportTypeService: ReportTypeService,
        private campaignTemplateService: CampaignTemplateService,
    ) {}

    ngOnChanges(changes) {
        if (changes['companySettings'] && changes['companySettings'].currentValue) {
            this.getDataAndShowForm();
        }
    }

    getDataAndShowForm() {
        Observable.forkJoin(
            this.reportTypeService.getFormType(ReportTypeEnum.QUOTE),
            this.reportTypeService.getFormType(ReportTypeEnum.ORDER),
            this.reportTypeService.getFormType(ReportTypeEnum.INVOICE),
            this.campaignTemplateService.getTemplateText(),
        ) .subscribe((response) => {
            this.quoteFormList = response[0];
            this.orderFormList = response[1];
            this.invoiceFormList = response[2];

            this.template.CustomerInvoice = response[3].find(res => res.EntityName === 'CustomerInvoice')
                || { EntityName: 'CustomerInvoice', ID: 0, Template: '' };
            this.template.CustomerOrder = response[3].find(res => res.EntityName === 'CustomerOrder')
                || { EntityName: 'CustomerOrder', ID: 0, Template: '' };
            this.template.CustomerQuote = response[3].find(res => res.EntityName === 'CustomerQuote')
                || { EntityName: 'CustomerQuote', ID: 0, Template: '' };

            if (this.companySettings) {
                this.formatViewData();
            }
        });
    }

    formatViewData() {
        this.logoHide = this.logoHideOptions.find(opt => opt.Value === this.companySettings.LogoHideField);
        this.lang = this.localizationOptions.find(opt => opt.Culture === this.companySettings.Localization);

        if (this.quoteFormList[0] && this.quoteFormList[0].ID !== 0) {
            this.quoteFormList.unshift({Description: 'Ikke valgt', ID: 0});
            this.orderFormList.unshift({Description: 'Ikke valgt', ID: 0});
            this.invoiceFormList.unshift({Description: 'Ikke valgt', ID: 0});
        }

        this.invoice = this.invoiceFormList.find(form => form.ID === this.companySettings.DefaultCustomerInvoiceReportID)
            || this.invoiceFormList[0];
        this.order = this.orderFormList.find(form => form.ID === this.companySettings.DefaultCustomerOrderReportID)
            || this.orderFormList[0];
        this.quote = this.quoteFormList.find(form => form.ID === this.companySettings.DefaultCustomerQuoteReportID)
            || this.quoteFormList[0];
    }

    logoChange(value) {
        this.logoHide = value;
        this.companySettings.LogoHideField = value.Value;
        this.isDirty = true;
    }

    languageChange(value) {
        this.lang = value;
        this.companySettings.Localization = value.Culture;
        this.isDirty = true;
    }

    alignmentChange(value) {
        this.companySettings.LogoAlign = value.Alignment;
        this.isDirty = true;
    }

    tofFormChange(value: any, TOFType: number) {
        switch (TOFType) {
            case 1:
                this.invoice = value;
                this.companySettings.DefaultCustomerInvoiceReportID = value.ID;
                break;
            case 2:
                this.order = value;
                this.companySettings.DefaultCustomerInvoiceReportID = value.ID;
                break;
            case 3:
                this.quote = value;
                this.companySettings.DefaultCustomerQuoteReportID = value.ID;
                break;
        }
        this.isDirty = true;
    }

    saveReportSettings(): Observable<any> {
        if (!this.isDirty) {
            return Observable.of(true);
        }

        const queries = [];

        for (const key in this.template) {
            if (this.template[key]._isDirty) {
                queries.push(this.template[key].ID
                    ? this.campaignTemplateService.Put(this.template[key].ID, this.template[key])
                    : this.campaignTemplateService.Post(this.template[key])
                );
            }
        }

        if (!queries.length) {
            return Observable.of(true);
        } else {
            return Observable.forkJoin(queries);
        }
    }
}