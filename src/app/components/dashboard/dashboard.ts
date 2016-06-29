import {Component, Input, ElementRef} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../framework/core/http/http';
import {ROUTER_DIRECTIVES, Router, CanReuse, OnReuse} from "@angular/router-deprecated";

declare var Chart;
declare var moment;

export interface IChartDataSet {
    label: string;
    labels: string[];
    chartType: string;
    backgroundColor: string[] | string;
    borderColor: any; //String or null
    data: number[];
}

@Component({
    selector: 'uni-dashboard',
    templateUrl: 'app/components/dashboard/dashboard.html',
    directives: [ROUTER_DIRECTIVES]
})

export class Dashboard implements CanReuse {

    public welcomeHidden: boolean = localStorage.getItem('welcomeHidden');
    public transactionList = [];
    public myTransactionList = [];
    public journalEntryList = [];
    public user: any;
    public current: any;
    public months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    private colors: string[] = ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'];

    constructor(private tabService: TabService, private http: UniHttp, private router: Router) {
        this.tabService.addTab({ name: 'Dashboard', url: '/', active: true, moduleID: 0 });
        Chart.defaults.global.maintainAspectRatio = false;
        this.welcomeHidden = false;
        this.current = JSON.parse(localStorage.getItem('companySettings'));
        console.log('Hello');
    }

    public routerCanReuse() {
        return false;
    } 

    public ngAfterViewInit() {

        this.getInvoicedData().subscribe(
            data => this.chartGenerator('invoicedChart', this.twelveMonthChartData(data[0].Data, 'Fakturert', '#7293cb', '#396bb1', 'bar', 'sumTaxExclusiveAmount')),
            error => console.log(error)
        )

        this.getOrdreData().subscribe(
            (data) => { this.chartGenerator('ordre_chart', this.twelveMonthChartData(data[0].Data, 'Ordre', '#84ba5b', '#3e9651', 'bar', 'sumTaxExclusiveAmount')) },
            (error) => { console.log(error); }
        )

        this.getQuoteData().subscribe(
            (data) => { this.chartGenerator('quote_chart', this.twelveMonthChartData(data[0].Data, 'Tilbud', '#e1974c', '#da7c30', 'bar', 'sumTaxExclusiveAmount')) },
            (error) => { console.log(error); }
        )

        this.getOperatingData().subscribe(
            (data) => { this.chartGenerator('operating_chart', this.twelveMonthChartData(data[0].Data, 'Driftsresultater', '#9067a7', '#6b4c9a', 'line', 'sumamount', -1)) },
            (error) => { console.log(error); }
        )

        this.getLastJournalEntry().subscribe(
            (data) => { this.generateLastTenList(data, true); },
            (error) => { console.log(error) }
        )

        this.getMyUserInfo().subscribe(
            (data) => {
                this.user = data;
                this.getMyTransactions()
                    .subscribe(
                    (data) => { this.generateLastTenList(data[0].Data, false, true) },
                    (error) => { console.log(error) }
                    )
            },
            error => console.log(error)
        )

        this.getTransactions().subscribe(
            (data) => { this.generateLastTenList(data[0].Data, false) },
            (error) => { console.log(error) }
        );

        this.getAssets().subscribe(
            (data) => { this.chartGenerator('assets_chart', this.assetsChartData(data[0].Data)) },
            (error) => { console.log(error); }
        )
    }

    public hideWelcome() {
        this.welcomeHidden = true;
        localStorage.setItem('welcomeHidden', 'true');
    }

    public refreshDash() {
        this.router.navigateByUrl('/');
    }

    public widgetListItemClicked(url) {
        this.router.navigateByUrl(url);
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
        if (isJournalEntry) {
            for (var i = 0; i < data.length; i++) {
                var mydate = moment.utc(data[i].RegisteredDate).toDate();
                data[i].time = moment(mydate).fromNow();
                data[i].url = '/accounting/transquery/detailsByJournalEntryNumber/' + data[i].JournalEntryNumber;
            }
            this.journalEntryList = data;
        } else {
            for (var i = 0; i < data.length; i++) {
                var mydate = moment.utc(data[i].CreatedAt).toDate();
                data[i].time = moment(mydate).fromNow();
                data[i].DisplayName = this.CapitalizeDisplayName(this.removeLastNameIfAny(data[i].DisplayName));
                this.findModuleDisplayNameAndURL(data[i]);

                if (i !== 0 && new Date(data[i].CreatedAt).getSeconds() - new Date(data[i - 1].CreatedAt).getSeconds() < 3 && data[i].EntityType === data[i - 1].EntityType) {
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

    //Constructs the data for the assets pie chart
    private assetsChartData(data: any): IChartDataSet {
        var myLabels = [];
        var myData = [];
        var myColors = [];
        for (var i = 0; i < data.length; i++) {
            myLabels.push(data[i].Name);
            if (data[i].sumamount < 0) {
                data[i].sumamount *= -1;
                myLabels[i] = data[i].Name + ' (Negativt)';
            }
            myData.push(data[i].sumamount);
            myColors.push(this.colors[i]);
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
        switch (data.EntityType) {
            case 'CustomerQuote':
                data.module = 'Tilbud';
                data.url = '/sales/quote/details/' + data.EntityID;
                break;
            case 'CustomerOrder':
                data.module = 'Ordre';
                data.url = '/sales/order/details/' + data.EntityID;
                break;
            case 'CustomerInvoice':
                data.module = 'Faktura';
                data.url = '/sales/invoice/details/' + data.EntityID;
                break;
            case 'JournalEntryLine':
                data.module = 'Jour. line';
                /*NEED REAL URL*/
                data.url = '/';
                break;
            case 'SupplierInvoice':
                data.module = 'Lev. faktura';
                data.url = '/accounting/journalentry/supplierinvoices/' + data.EntityID;
                break;
            case 'NumberSeries':
                data.module = 'Nummerserie';
                /*NEED REAL URL*/
                data.url = '/sales/customer/list';
                break;
            case 'AccountGroup':
                data.module = 'Kontogruppe';
                data.url = '/accounting/accountsettings';
                break;
            case 'Employee':
                data.module = 'Ansatt';
                data.url = '/salary/employees/' + data.EntityID;
                break;
            case 'Customer':
                data.module = 'Kunde';
                data.url = '/sales/customer/details/' + data.EntityID;
                break;
            case 'Product':
                data.module = 'Produkt';
                data.url = '/products/details/' + data.EntityID;
                break;
            case 'SalaryTransaction':
                data.module = 'SalaryTransaction';
                /*NEED REAL URL*/
                data.url = '/sales/customer/list';
                break;
            case 'PayrollRun':
                data.module = 'Lønnsavregning';
                data.url = '/salary/payrollrun/' + data.EntityID;
                break;
            case 'Account':
                data.module = 'Konto';
                data.url = '/accounting/accountsettings';
                break;
            case 'Address':
                data.module = 'Adresse';
                /*NEED REAL URL*/
                data.url = '/sales/customer/list';
                break;
            case 'Dimensions':
                data.module = 'Dimensions';
                /*NEED REAL URL*/
                data.url = '/sales/customer/list';
                break;
            case 'File':
                data.module = 'File';
                /*NEED REAL URL*/
                data.url = '/sales/customer/list';
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
            .usingBusinessDomain()
            .withEndPoint(
            "statistics?model=AuditLog&select=entitytype,entityid,field,displayname,createdat,updatedat&filter=field eq 'updatedby' and ( not contains(entitytype,'item') ) &join=auditlog.createdby eq user.globalidentity&top=50&orderby=id desc"
            )
            .send();
    }

    //Gets 10 last transactions of current logged in user (Currently error, donno y)
    public getMyTransactions() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
            "statistics?model=AuditLog&select=entitytype,field,entityid,displayname,createdat,updatedat&filter=createdby eq '"
            + this.user.GlobalIdentity
            + "' and ( not contains(entitytype,'item') ) and ( field eq 'updatedby' )&join=auditlog.createdby eq user.globalidentity&top=60&orderby=id desc"
            )
            .send();
    }

    //Gets user info objcet
    public getMyUserInfo() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('users?action=current-session')
            .send();
    }

    //Gets sum invoiced current year (Query needs improving)
    public getInvoicedData() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=CustomerInvoice&select=sum(TaxExclusiveAmount),month(InvoiceDate),year(InvoiceDate)&filter=month(invoicedate) ge 1 and year(invoicedate) eq 2016&range=monthinvoicedate')
            .send();
    }

    //Gets ordre sum current year (Query needs improving)
    public getOrdreData() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=CustomerOrder&select=sum(TaxExclusiveAmount),month(OrderDate),year(OrderDate)&range=monthorderdate ')
            .send();
    }

    //Gets quote sum current year (Query needs improving)
    public getQuoteData() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=CustomerQuote&select=sum(TaxExclusiveAmount),month(QuoteDate),year(QuoteDate)&range=monthquotedate ')
            .send();
    }

    //Gets 10 last journal entries
    public getLastJournalEntry() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('journalentrylines?skip=0&top=10&expand=VatType,Account&orderby=id desc')
            .send();
    }

    //Gets operating profis/loss data
    public getOperatingData() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000&range=monthfinancialdate')
            .send();
    }

    //Gets assets data
    public getAssets() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=journalentryline&select=sum(amount),name&filter=maingroupid eq 2&join=journalentryline.accountid eq account.id and account.accountgroupid eq accountgroup.id&top=50')
            .send();
    }
}