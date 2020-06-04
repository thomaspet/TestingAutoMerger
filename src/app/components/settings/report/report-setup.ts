import {Component, Input} from '@angular/core';
import {ReportTypeService, CampaignTemplateService} from '@app/services/services';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {CompanySettings} from '@uni-entities';
import { Observable, BehaviorSubject } from 'rxjs';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform/index';

@Component({
    selector: 'uni-report-settings',
    templateUrl: './report-setup.html',
    styleUrls: ['./report-setup.sass']
})

export class UniReportSettingsView {

    @Input()
    companySettings$ = new BehaviorSubject<CompanySettings>(null);

    isDirty: boolean;

    quoteFormList: any[];
    orderFormList: any[];
    invoiceFormList: any[];
    invoiceReminderFormList: any[];

    isOpen = [true, false, false, false, false];

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

    // Store form values
    invoice = {};
    order = {};
    quote = {};
    reminder = {};

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

    fields$ = new BehaviorSubject<UniFieldLayout[]>([
        {
            FieldType: FieldType.DROPDOWN,
            Label: 'Vis logo i rapport',
            Property: 'LogoHideField',
            Options: {
                source: this.logoHideOptions,
                valueProperty: 'Value',
                displayProperty: 'Label',
                hideDeleteButton: true,
                searchable: false,
            }
        },
        {
            FieldType: FieldType.DROPDOWN,
            Label: 'Rapportlogo plassering',
            Property: 'LogoAlign',
            Options: {
                source: this.logoAlignOptions,
                valueProperty: 'Alignment',
                displayProperty: 'Label',
                hideDeleteButton: true,
                searchable: false,
            }
        },
        {
            FieldType: FieldType.DROPDOWN,
            Label: 'Standard språk',
            Property: 'Localization',
            Options: {
                source: this.localizationOptions,
                valueProperty: 'Culture',
                displayProperty: 'Label',
                hideDeleteButton: true,
                searchable: false,
            }
        },
        <any>{
            EntityType: 'CompanySettings',
            Property: 'ShowKIDOnCustomerInvoice',
            FieldType: FieldType.CHECKBOX,
            Label: 'Vis KID i fakturablankett',
        }
    ]);

    constructor(
        private reportTypeService: ReportTypeService,
        private campaignTemplateService: CampaignTemplateService,
    ) { }

    ngOnChanges(changes) {
        if (changes['companySettings$'] && changes['companySettings$'].currentValue) {
            this.getDataAndShowForm();
        }
    }

    ngOnDestroy() {
        this.fields$.complete();
        this.companySettings$.complete();
    }

    getDataAndShowForm() {
        Observable.forkJoin(
            this.reportTypeService.getFormType(ReportTypeEnum.QUOTE),
            this.reportTypeService.getFormType(ReportTypeEnum.ORDER),
            this.reportTypeService.getFormType(ReportTypeEnum.INVOICE),
            this.reportTypeService.getFormType(ReportTypeEnum.REMINDER),
            this.campaignTemplateService.getTemplateText(),
        ) .subscribe((response) => {
            this.quoteFormList = response[0];
            this.orderFormList = response[1];
            this.invoiceFormList = response[2];
            this.invoiceReminderFormList = response[3];

            this.template.CustomerInvoice = response[4].find(res => res.EntityName === 'CustomerInvoice')
                || { EntityName: 'CustomerInvoice', ID: 0, Template: '' };
            this.template.CustomerOrder = response[4].find(res => res.EntityName === 'CustomerOrder')
                || { EntityName: 'CustomerOrder', ID: 0, Template: '' };
            this.template.CustomerQuote = response[4].find(res => res.EntityName === 'CustomerQuote')
                || { EntityName: 'CustomerQuote', ID: 0, Template: '' };

            if (this.companySettings$.getValue()) {
                this.formatViewData();
            }
        });
    }

    formatViewData() {
        const companySettings = this.companySettings$.getValue();

        if (this.quoteFormList[0] && this.quoteFormList[0].ID !== 0) {
            this.quoteFormList.unshift({Description: 'Ikke valgt', ID: 0});
            this.orderFormList.unshift({Description: 'Ikke valgt', ID: 0});
            this.invoiceFormList.unshift({Description: 'Ikke valgt', ID: 0});
            this.invoiceReminderFormList.unshift({Description: 'Ikke valgt', ID: 0});
        }

        this.invoice = this.invoiceFormList.find(form => form.ID === companySettings.DefaultCustomerInvoiceReportID)
            || this.invoiceFormList[0];
        this.order = this.orderFormList.find(form => form.ID === companySettings.DefaultCustomerOrderReportID)
            || this.orderFormList[0];
        this.quote = this.quoteFormList.find(form => form.ID === companySettings.DefaultCustomerQuoteReportID)
            || this.quoteFormList[0];
        this.reminder = this.invoiceReminderFormList.find(form => form.ID === companySettings.DefaultCustomerInvoiceReminderReportID)
            || this.invoiceReminderFormList[0];
    }

    formChange() {
        const companySettings = this.companySettings$.getValue();
        companySettings['_isDirty'] = true;
        this.isDirty = true;
        this.companySettings$.next(companySettings);
    }

    tofFormChange(value: any, TOFType: number) {
        const companySettings = this.companySettings$.getValue();
        switch (TOFType) {
            case 1:
                this.invoice = value;
                companySettings.DefaultCustomerInvoiceReportID = value.ID;
                break;
            case 2:
                this.order = value;
                companySettings.DefaultCustomerOrderReportID = value.ID;
                break;
            case 3:
                this.quote = value;
                companySettings.DefaultCustomerQuoteReportID = value.ID;
                break;
            case 4:
                this.reminder = value;
                companySettings.DefaultCustomerInvoiceReminderReportID = value.ID;
        }

        companySettings['_isDirty'] = true;
        this.isDirty = true;

        this.companySettings$.next(companySettings);
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