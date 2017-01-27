import {Component, EventEmitter} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../framework/core/http/http';
import {Router} from '@angular/router';
import {ErrorService} from '../../services/services';
import {AuthService} from '../../../framework/core/authService';
import {Company} from '../../unientities';

declare var Chart;
declare var moment;

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
    templateUrl: 'app/components/dashboard/dashboard.html'
})

export class Dashboard {

    public welcomeHidden: boolean = JSON.parse(localStorage.getItem('welcomeHidden'));
    public transactionList = [];
    public myTransactionList = [];
    public journalEntryList = [];
    public inboxList = [];
    public emptyInboxMessage = '';
    public user: any;
    public current: Company;
    public months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    private colors: string[] = ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'];
    private loadReload: EventEmitter<Company> = new EventEmitter<Company>();

    constructor(
        private tabService: TabService,
        private http: UniHttp,
        private router: Router,
        private errorService: ErrorService,
        private authService: AuthService
    ) {
        this.tabService.addTab({ name: 'Nøkkeltall', url: '/', active: true, moduleID: UniModules.Dashboard });
        Chart.defaults.global.maintainAspectRatio = false;

        this.getCompany().subscribe(
            (data) => { this.current = data[0]; },
            err => this.errorService.handle(err)
        );

        this.authService.companyChange.subscribe(
            company => this.loadReload.emit(company)
            /* No error handling neccesary */
        );
    }

    public ngAfterViewInit() {
        this.loadReload.subscribe(company => {

            this.getInvoicedData().subscribe(
                data => this.chartGenerator('invoicedChart', this.twelveMonthChartData(data.Data, 'Fakturert', '#7293cb', '#396bb1', 'bar', 'sumTaxExclusiveAmount')),
                err => this.errorService.handle(err)
            );
            this.getOrdreData().subscribe(
                (data) => this.chartGenerator('ordre_chart', this.twelveMonthChartData(data.Data, 'Ordre', '#84ba5b', '#3e9651', 'bar', 'sumTaxExclusiveAmount')),
                err => this.errorService.handle(err)
            );

            this.getQuoteData().subscribe(
                (data) => this.chartGenerator('quote_chart', this.twelveMonthChartData(data.Data, 'Tilbud', '#e1974c', '#da7c30', 'bar', 'sumTaxExclusiveAmount')),
                err => this.errorService.handle(err)
            );

            this.getOperatingData().subscribe(
                (data) => this.chartGenerator('operating_chart', this.twelveMonthChartData(data.Data, 'Driftsresultater', '#9067a7', '#6b4c9a', 'line', 'sumamount', -1)),
                err => this.errorService.handle(err)
            );

            this.getLastJournalEntry().subscribe(
                (data) => this.generateLastTenList(data, true),
                err => this.errorService.handle(err)
            );

            this.getMyUserInfo().subscribe(
                (data) => {
                    this.user = data;
                    this.getMyTransactions()
                        .subscribe(
                            (data) => this.generateLastTenList(data.Data, false, true),
                            err => this.errorService.handle(err)
                        );
                },
                err => this.errorService.handle(err)
            );

            this.getTransactions().subscribe(
                (data) => this.generateLastTenList(data.Data, false),
                err => this.errorService.handle(err)
            );

            this.getAssets().subscribe(
                (data) => this.chartGenerator('assets_chart', this.assetsChartData(data.Data)),
                err => this.errorService.handle(err)
            );

            this.getMail().subscribe(
                (data) => this.fixInboxItems(data.Data),
                err => this.errorService.handle(err)
            );

        });

        // First load is manual, the following times it is done by authService.companyChange event
        this.loadReload.emit(this.current);
    }

    public hideWelcome() {
        this.welcomeHidden = true;
        localStorage.setItem('welcomeHidden', JSON.stringify(true));
    }

    public widgetListItemClicked(url) {
        this.router.navigateByUrl(url);
    }

    private fixInboxItems(data: any[] = []) {
        if (data.length === 0) {
            this.emptyInboxMessage = 'Ingen nye dokumenter';
            return;
        }
        var mydate;
        data.forEach((item) => {
            mydate = moment.utc(item.FileCreatedAt).toDate();
            item.time = moment(mydate).fromNow();
            item.url = '/accounting/bill/0?fileid=' + item.FileID;
        })

        this.inboxList = data;
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
                this.findModuleDisplayNameAndURL(data[i]);

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

    //  Constructs the data for the assets pie chart
    private assetsChartData(data: any = []): IChartDataSet {
        var myLabels = [];
        var myData = [];
        var myColors = [];

        if (data.length === 0) {
            myLabels.push('Ingen eiendeler');
            myData.push(1);
            myColors.push(this.colors[0]);
        } else {
            for (var i = 0; i < data.length; i++) {
                myLabels.push(data[i].accountgroupName);
                if (data[i].sumamount < 0) {
                    data[i].sumamount *= -1;
                    myLabels[i] = data[i].accountgroupName + ' (Negativt)';
                }
                myData.push(data[i].sumamount);
                myColors.push(this.colors[i]);
            }
        }


        return {
            label: '',
            labels: myLabels,
            chartType: 'pie',
            backgroundColor: myColors,
            borderColor: null,
            data: myData
        }
    }

    //Generates a new Chart
    private chartGenerator(elementID: string, data: IChartDataSet) {
        let myElement = document.getElementById(elementID);
        let myChart = new Chart(myElement, {
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

    /***********************
     HELP METHODS
     ************************/

    //Dummy temp switch that adds better name and url to list items
    private findModuleDisplayNameAndURL(data: any) {

        let entityID = data.AuditLogEntityID;

        switch (data.AuditLogEntityType) {
            case 'CustomerQuote':
                data.module = 'Tilbud';
                data.url = '/sales/quotes/' + entityID;
                break;
            case 'CustomerOrder':
                data.module = 'Ordre';
                data.url = '/sales/orders/' + entityID;
                break;
            case 'CustomerInvoice':
                data.module = 'Faktura';
                data.url = '/sales/invoices/' + entityID;
                break;
            case 'JournalEntryLine':
                data.module = 'Jour. line';
                /*NEED REAL URL*/
                data.url = '/';
                break;
            case 'SupplierInvoice':
                data.module = 'Lev. faktura';
                data.url = '/accounting/journalentry/supplierinvoices/' + entityID;
                break;
            case 'NumberSeries':
                data.module = 'Nummerserie';
                /*NEED REAL URL*/
                data.url = '/sales/customer/';
                break;
            case 'AccountGroup':
                data.module = 'Kontogruppe';
                data.url = '/accounting/accountsettings';
                break;
            case 'Employee':
                data.module = 'Ansatt';
                data.url = '/salary/employees/' + entityID;
                break;
            case 'Customer':
                data.module = 'Kunde';
                data.url = '/sales/customer/' + entityID;
                break;
            case 'Product':
                data.module = 'Produkt';
                data.url = '/products/' + entityID;
                break;
            case 'SalaryTransaction':
                data.module = 'SalaryTransaction';
                /*NEED REAL URL*/
                data.url = '/sales/customer/';
                break;
            case 'PayrollRun':
                data.module = 'Lønnsavregning';
                data.url = '/salary/payrollrun/' + entityID;
                break;
            case 'Account':
                data.module = 'Konto';
                data.url = '/accounting/accountsettings';
                break;
            case 'Address':
                data.module = 'Adresse';
                /*NEED REAL URL*/
                data.url = '/sales/customer/';
                break;
            case 'Dimensions':
                data.module = 'Dimensions';
                /*NEED REAL URL*/
                data.url = '/sales/customer/';
                break;
            case 'File':
                data.module = 'File';
                /*NEED REAL URL*/
                data.url = '/sales/customer/';
                break;
            case 'CompanySettings':
                data.module = 'Innstillinger';
                data.url = '/settings/company';
                break;
            default:


        }
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

    public getCompany() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('companysettings')
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
}
