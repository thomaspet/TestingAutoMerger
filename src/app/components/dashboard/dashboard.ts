/// <reference path="../../../../typings/modules/chart.js/index.d.ts" />
import {Component, EventEmitter, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../framework/core/http/http';
import {Router} from '@angular/router';
import {ErrorService, CompanySettingsService} from '../../services/services';
import {AuthService} from '../../../framework/core/authService';
import { Company } from '../../unientities';
import { WidgetDatasetBuilder, ChartColorEnum } from '../widgets/widgetDatasetBuilder';
import { WidgetDataService } from '../widgets/widgetDataService';

import * as moment from 'moment';
import * as Chart from 'chart.js';
import {UniImage} from '../../../framework/uniImage/uniImage';
import {CompanySettings} from '../../unientities';

export interface IChartDataSet {
    label: string;
    labels: string[];
    chartType: string;
    backgroundColor: string[] | string;
    borderColor: any; // String or null
    data: number[];
}

@Component({
    selector: 'uni-dashboard',
    templateUrl: './dashboard.html'
})

export class Dashboard {
    @ViewChild(UniImage) private logoImage: UniImage;

    public welcomeHidden: boolean = JSON.parse(localStorage.getItem('welcomeHidden'));
    public transactionList = [];
    public myTransactionList = [];
    public journalEntryList = [];
    public inboxList = [];
    public emptyInboxMessage = '';
    public user: any;
    public current: CompanySettings;
    public months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    private colors: string[] = ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'];
    private loadReload: EventEmitter<Company> = new EventEmitter<Company>();
    private builder = new WidgetDatasetBuilder();

    private widgets: any[] = [];

    constructor(
        private tabService: TabService,
        private http: UniHttp,
        private router: Router,
        private errorService: ErrorService,
        private authService: AuthService,
        private companySettingsService: CompanySettingsService,
        private widgetDataService: WidgetDataService
    ) {
        this.tabService.addTab({ name: 'Nøkkeltall', url: '/', active: true, moduleID: UniModules.Dashboard });

        // Avoid compile error. Seems to be something weird with the chart.js typings file
        (<any> Chart).defaults.global.maintainAspectRatio = false;

        this.authService.companyChange.subscribe(
            company => this.loadReload.emit()
            /* No error handling neccesary */
        );

        this.widgets = this.fakeLayout();
    }

    //For 12 month charts
    private twelveMonthChartData(data: any, label: string, bgColor: string, bdColor: string, chartType: string, dataValue: string, multiplyValue: number = 1): IChartDataSet {
        var numberOfMonths = 6;
        var currentMonth = new Date().getMonth();
        var myChartLabels = [];
        var myMonths = [];
        var myData = [];

        var totalLabel = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i][dataValue] === null) {
                myData.push(0);
            } else {
                myData.push(data[i][dataValue] * multiplyValue);
            }
            totalLabel += myData[i];
        }
        totalLabel = ~~totalLabel;
        totalLabel = this.format(totalLabel);

        return {
            label: 'Total: ' + totalLabel,
            labels: this.months,
            chartType: chartType,
            backgroundColor: bgColor,
            borderColor: bdColor,
            data: myData
        }
    }

    //Data for dashboards lists
    private generateLastTenList(data: any, isJournalEntry: boolean, myTransactions?: boolean) {
        if (!data || !data.length) {
            return;
        }

        if (isJournalEntry) {
            for (var i = 0; i < data.length; i++) {
                var mydate = moment.utc(data[i].RegisteredDate).toDate();
                data[i].time = moment(mydate).fromNow();
                data[i].url = '/accounting/transquery/details;journalEntryNumber=' + data[i].JournalEntryNumber;
            }
            this.journalEntryList = data;
        } else {
            for (var i = 0; i < data.length; i++) {
                var mydate = moment.utc(data[i].AuditLogCreatedAt).toDate();
                data[i].time = moment(mydate).fromNow();
                data[i].UserDisplayName = this.CapitalizeDisplayName(this.removeLastNameIfAny(data[i].UserDisplayName));

                if (i !== 0 && new Date(data[i].AuditLogCreatedAt).getSeconds() - new Date(data[i - 1].AuditLogCreatedAt).getSeconds() < 3 && data[i].AuditLogEntityType === data[i - 1].AuditLogEntityType) {
                    data.splice(i, 1);
                    i--;
                }

            }
            if (data.length > 10) {
                data.splice(9, data.length - 10);
            }
            if (myTransactions) {
                this.myTransactionList = data;
            } else {
                this.transactionList = data;
            }

        }
    }

    //Generates a new Chart
    private chartGenerator(elementID: string, data: IChartDataSet) {
        let myElement = document.getElementById(elementID);

        let chartSettings: Chart.ChartSettings = {

        }

        let myChart = new Chart(<any> myElement, {
            type: data.chartType,
            data: {
                labels: data.labels,
                datasets: [
                    {
                        data: data.data,
                        backgroundColor: data.backgroundColor,
                        label: data.label,
                        borderColor: data.borderColor
                    }
                ]
            }
        });
    }

    //Returns first name of user..
    private removeLastNameIfAny(str: string) {
        if (str.indexOf(' ') === -1) {
            return str;
        } else {
            return str.substr(0, str.indexOf(' '));
        }
    }

    //Capitalize first letter in every word in string (Stack Overflow solution)
    private CapitalizeDisplayName(str: string) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    //Formats number
    private format(num) {
        var n = num.toString(), p = n.indexOf('.');
        return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) {
            return p < 0 || i < p ? ($0 + ' ') : $0;
        });
    }

    /********************************************************************
     SHOULD BE MOVED TO SERVICE, BUT VS WONT LET ME CREATE NEW FILES
     *********************************************************************/

    //Gets 10 last transactions
    public getTransactions() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(
                "/api/statistics?model=AuditLog&select=id,entitytype,entityid,field,User.displayname,createdat,updatedat&filter=field eq 'updatedby' and ( not contains(entitytype,'item') ) &join=auditlog.createdby eq user.globalidentity&top=50&orderby=id desc"
            )
            .send()
            .map(response => response.json());
    }

    //Gets 10 last transactions of current logged in user (Currently error, donno y)
    public getMyTransactions() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(
                "/api/statistics?model=AuditLog&select=id,entitytype,field,entityid,User.displayname,createdat,updatedat&filter=createdby eq '"
                + this.user.GlobalIdentity
                + "' and ( not contains(entitytype,'item') ) and ( field eq 'updatedby' )&join=auditlog.createdby eq user.globalidentity&top=60&orderby=id desc"
            )
            .send()
            .map(response => response.json());
    }

    //Gets user info objcet
    public getMyUserInfo() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('users?action=current-session')
            .send()
            .map(response => response.json());
    }

    //Gets sum invoiced current year (Query needs improving)
    public getInvoicedData() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=CustomerInvoice&select=sum(TaxExclusiveAmount),month(InvoiceDate),year(InvoiceDate)&filter=month(invoicedate) ge 1 and year(invoicedate) eq 2016&range=monthinvoicedate')
            .send()
            .map(response => response.json());
    }

    //Gets ordre sum current year (Query needs improving)
    public getOrdreData() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=CustomerOrder&select=sum(TaxExclusiveAmount),month(OrderDate),year(OrderDate)&range=monthorderdate')
            .send()
            .map(response => response.json());
    }

    //Gets quote sum current year (Query needs improving)
    public getQuoteData() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=CustomerQuote&select=sum(TaxExclusiveAmount),month(QuoteDate),year(QuoteDate)&range=monthquotedate')
            .send()
            .map(response => response.json());
    }

    //Gets 10 last journal entries
    public getLastJournalEntry() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('journalentrylines?skip=0&top=10&expand=VatType,Account&orderby=id desc')
            .send()
            .map(response => response.json());
    }

    //Gets operating profis/loss data
    public getOperatingData() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000 and account.accountnumber le 9999 &range=monthfinancialdate')
            .send()
            .map(response => response.json());
    }

    //Gets assets data
    public getAssets() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint('/api/statistics?model=journalentryline&select=sum(amount),accountgroup.name&filter=accountgroup.maingroupid eq 2&join=journalentryline.accountid eq account.id and account.accountgroupid eq accountgroup.id&top=50')
            .send()
            .map(response => response.json());
    }

    public getMail() {
        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint("/api/statistics?skip=0&top=10&model=FileTag&select=FileTag.TagName as FileTagTagName,FileTag.ID as FileTagID,FileTag.Status as FileTagStatus,File.UpdatedBy as FileUpdatedBy,File.UpdatedAt as FileUpdatedAt,File.StorageReference as FileStorageReference,File.StatusCode as FileStatusCode,File.Size as FileSize,File.PermaLink as FilePermaLink,File.Pages as FilePages,File.OCRData as FileOCRData,File.Name as FileName,File.Md5 as FileMd5,File.ID as FileID,File.Description as FileDescription,File.Deleted as FileDeleted,File.CreatedBy as FileCreatedBy,File.CreatedAt as FileCreatedAt,File.ContentType as FileContentType&expand=File&orderby=File.ID desc&filter=FileTag.Status eq 0 and FileTag.TagName eq 'IncomingMail'")
            .send()
            .map(response => response.json())
    }

    public fakeLayout() {

        return [
            {
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'TILBUD',
                    description: 'Tilbudsoversikt',
                    icon: 'paperclip',
                    link: '/sales/quotes'
                }
            },
            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'ORDRE',
                    description: 'Ordreoversikt',
                    icon: 'chat',
                    link: '/sales/orders'
                }
            },
            {
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'FAKTURA',
                    description: 'Fakturaoversikt',
                    icon: 'globe',
                    link: '/sales/invoices'
                }
            },
            {
                width: 1,
                height: 1,
                x: 3,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'KUNDER',
                    description: 'Kundeoversikt',
                    icon: 'user',
                    link: '/sales/customer'
                }
            },
            {
                width: 1,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'TIMER',
                    description: 'Timeføring',
                    icon: 'calender',
                    link: '/timetracking/timeentry'
                }
            },
            {
                width: 3,
                height: 1,
                x: 5,
                y: 0,
                widgetType: 'clock',
                config: {
                    dateColor: '#7698bd',
                    showSeconds: false
                }
            },
            {
                width: 1,
                height: 1,
                x: 8,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'epost',
                    description: 'Uleste eposter',
                    icon: 'globe',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 14,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 9,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'ehf',
                    description: 'Uleste eposter',
                    icon: 'bell',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 3,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 10,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'pdf',
                    description: 'Uleste eposter',
                    icon: 'search',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 9,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 11,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'utlegg',
                    description: 'Uleste eposter',
                    icon: 'paperclip',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 21,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 8,
                y: 5,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'varsler',
                    description: 'Uleste eposter',
                    icon: 'bell',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 6,
                    class: 'uni-widget-notification-lite-blue'
                }
            },
            {
                width: 1,
                height: 1,
                x: 9,
                y: 5,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'utlegg',
                    description: 'Uleste eposter',
                    icon: 'paperclip',
                    link: '/sales/quotes',
                    amount: 1,
                    class: 'uni-widget-notification-lite-blue'
                }
            },
            {
                width: 4,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'chart',
                config: {
                    header: 'Driftsresultater',
                    chartType: 'line',
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    colors: ['#ab6857'],
                    dataEndpoint: ['/api/statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000 and account.accountnumber le 9999 &range=monthfinancialdate'],
                    dataKey: ['sumamount'],
                    multiplyValue: -1,
                    dataset: [],
                    options: {
                        showLines: true,
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'top'
                        }
                    },
                    title: ['Driftsresultat'],
                    drilldown: false,
                    chartID: 487515
                }
            },
            {
                width: 4,
                height: 3,
                x: 4,
                y: 1,
                widgetType: 'chart',
                config: {
                    header: 'Tilbud, ordre og faktura - 2016',
                    chartType: 'bar',
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    colors: ['#7293cb', '#e1974c', '#84ba5b'],
                    dataEndpoint: ['/api/statistics?model=CustomerQuote&select=sum(TaxExclusiveAmount),month(QuoteDate),year(QuoteDate)&range=monthquotedate', '/api/statistics?model=CustomerOrder&select=sum(TaxExclusiveAmount),month(OrderDate),year(OrderDate)&range=monthorderdate', '/api/statistics?model=CustomerInvoice&select=sum(TaxExclusiveAmount),month(InvoiceDate),year(InvoiceDate)&filter=month(invoicedate) ge 1 and year(invoicedate) eq 2016&range=monthinvoicedate'],
                    dataKey: ['sumTaxExclusiveAmount', 'sumTaxExclusiveAmount', 'sumTaxExclusiveAmount'],
                    multiplyValue: 1,
                    dataset: [],
                    options: {},
                    title: ['Tilbud', 'Ordre', 'Faktura'],
                    drilldown: false,
                    chartID: 458751
                }
            },
            {
                width: 4,
                height: 3,
                x: 0,
                y: 4,
                widgetType: 'chart',
                config: {
                    header: 'Antall ansatte per stilling',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: ['/api/statistics?skip=0&top=50&model=Employee&select=Employee.ID as EmployeeID,BusinessRelationInfo.Name as BusinessRelationInfoName,Employments.JobName as EmploymentsJobName,Employments.Standard as EmploymentsStandard&expand=BusinessRelationInfo,Employments&distinct=false'],
                    dataKey: ['EmploymentsJobName'],
                    maxNumberOfLabels: 7,
                    useIf: 'EmploymentsStandard',
                    addDataValueToLabel: true, //Only recommended if you are using tooltips callback
                    dataset: [],
                    options: {
                        cutoutPercentage: 85,
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'left'
                        },
                        tooltips: {
                            callbacks: {
                                label: (item, data) => {
                                    let total = data.datasets[item.datasetIndex].data.reduce((previousValue, currentValue) => { return previousValue + currentValue });
                                    let currentValue = data.datasets[item.datasetIndex].data[item.index];
                                    return Math.floor(((currentValue / total) * 100) + 0.5) + "%";
                                }
                            }
                        },
                    },
                    title: [],
                    drilldown: false,
                    chartID: 845715
                }
            },
            {
                width: 4,
                height: 3,
                x: 4,
                y: 4,
                widgetType: 'chart',
                config: {
                    header: 'Utestående per kunde',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: ['/api/statistics?skip=0&top=50&model=Customer&select=Info.Name as InfoName,CustomerInvoices.RestAmount as CustomerInvoicesRestAmount,CustomerInvoices.TaxExclusiveAmount as CustomerInvoicesTaxExclusiveAmount,CustomerInvoices.StatusCode as CustomerInvoicesStatusCode&expand=Info,CustomerInvoices&distinct=false'],
                    dataKey: ['InfoName', 'CustomerInvoicesRestAmount'],
                    maxNumberOfLabels: 7,
                    useIf: '',
                    addDataValueToLabel: false,
                    dataset: [],
                    options: {
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                    title: [],
                    drilldown: false,
                    chartID: 845721
                }
            },
            {
                width: 4,
                height: 4,
                x: 8,
                y: 0,
                widgetType: 'rss',
                config: {
                    header: 'Nyheter fra kundesenteret',
                    dataEndpoint: "/api/biz/rss/1",
                    RSSType: 1 // DOCUMENTATION: https://unimicro.atlassian.net/wiki/pages/viewpage.action?spaceKey=UE&title=RssListe
                }
            }
        ]


    }
}
