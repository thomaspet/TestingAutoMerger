import {Component} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {AuditLog} from '../../unientities';
import {ROUTER_DIRECTIVES, Router} from "@angular/router-deprecated";
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

export class Dashboard {

    public welcomeHidden: boolean = localStorage.getItem('welcomeHidden');
    public chartDataLoaded: boolean = localStorage.getItem('chartDataLoaded');
    public transactionList = [];
    public myTransactionList = [];
    public journalEntryList = [];
    public data;
    public user: any;
    public months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    constructor(private tabService: TabService, private http: UniHttp, private router: Router) {
        this.tabService.addTab({ name: 'Dashboard', url: '/', active: true, moduleID: 0 });
        Chart.defaults.global.maintainAspectRatio = false;
        this.welcomeHidden = false;

    }

    public ngAfterViewInit() {

        //INVOICED CHART
        //var data: IChartDataSet = {
        //    labels: ["March", "April", "May", "June"],
        //    chartType: 'bar',
        //    data: [125000, 154000, 235000, 500000],
        //    label: 'Fakturert',
        //    backgroundColor: '#7293cb',
        //    borderColor: '#396bb1',
        //}
        //this.chartGenerator('invoicedChart', data)

        //OPERATING PROFIT/LOSS CHART
        var data: IChartDataSet = {
            labels: ['2013', '2014', '2015', '2016'],
            chartType: 'line',
            label: 'Driftsresultat',
            backgroundColor: '#7293cb',
            borderColor: '#396bb1',
            data: [2125000, 3154000, 6235000, 4000000]
        }
        this.chartGenerator('operating_chart', data);

        //ASSETS CHART
        data = {
            data: [250000, 350000, 200000, 500000, 410000],
            labels: ['Kontanter og bankinnskudd', 'Kortsiktige fordringer', 'Anleggsmidler', 'Varelager', 'Andre midler'],
            chartType: 'pie',
            label: '',
            backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
            borderColor: null
        }
        this.chartGenerator('assets_chart', data);

        //PAYROLL CHART
        data = {
            data: [2560000, 2720000, 2528000, 1950000, 2400000],
            labels: ['January', 'February', 'March', 'April', 'May'],
            chartType: 'bar',
            label: '',
            backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
            borderColor: null
        }
        this.chartGenerator('payroll_chart', data);

        //ORDRE CHART
        //data = {
        //    data: [32000, 36000, 29500, 40000],
        //    labels: ['March', 'April', 'May', 'June'],
        //    chartType: 'bar',
        //    label: '',
        //    backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60'],
        //    borderColor: null
        //}
        //this.chartGenerator('ordre_chart', data)

        //this.getTransactions()
        //    .subscribe(
        //    data => this.generateTransactionsArray(data),
        //    error => console.log(error)
        //    );

        this.getInvoicedData()
            .subscribe(
            data => this.chartGenerator('invoicedChart', this.invoicedChartData(data[0].Data, 'Fakturert', '#7293cb', '#396bb1')),
            error => console.log(error)
            )

        this.getMyUserInfo().subscribe(
            (data) => {
                this.user = data;
                this.getMyTransactions()
                    .subscribe(
                    (data) => { console.log(data); },
                    (error) => { console.log(error) }
                    )
            },
            error => console.log(error) //Error handling
        )

        this.getOrdreData().subscribe(
            (data) => { this.chartGenerator('ordre_chart', this.invoicedChartData(data[0].Data, 'Fakturert', '#84ba5b', '#3e9651')) },
            (error) => { console.log(error); }
        )

        this.getLastJournalEntry().subscribe(
            (data) => { this.genereateJournalEntryList(data); },
            (error) => { console.log(error) }
        )

    }

    public hideWelcome() {
        this.welcomeHidden = true;
        localStorage.setItem('welcomeHidden', 'true');
    }

    public widgetListItemClicked(url) {
        this.router.navigateByUrl(url);
    }

    private generateTransactionsArray(data: any, mine?: boolean) {
        for (var i = 0; i < data.length; i++) {
  
            //Dummycheck ATM
            if (data[i].EntityType === 'CustomerQuote') {
                data[i].url = '/sales/quote/details/' + data[i].EntityID;
                data[i].module = 'tilbudnr ' + data[i].EntityID;
            } else if (data[i].EntityType === 'Dimensions') {
                data[i].url = '/sales/quote/details/' + data[i].EntityID;
                data[i].module = 'tilbudnr ' + data[i].EntityID;
            } else if (data[i].EntityType === 'PayrollRun') {
                data[i].url = '/salary/payrollrun/' + data[i].EntityID;
                data[i].module = 'lønnsavregning ' + data[i].EntityID;
            } else if (data[i].EntityType === 'SalaryTransaction') {
                data[i].url = '/salary/payrollrun/' + data[i].EntityID;
                data[i].module = 'lønn ' + data[i].EntityID;
            } else {
                data[i].url = '/salary/quote/details/' + 1;
                data[i].module = 'noe ' + data[i].EntityID;
            }

            var date = new Date(data[i].CreatedAt);
            data[i].time = moment(data[i].CreatedAt).fromNow();
        }
        if (mine) {
            this.myTransactionList = data;
        } else {
            this.transactionList = data;
        }

    }

    private genereateJournalEntryList(data: any) {
        
        for (var i = 0; i < data.length; i++) {
            data[i].time = moment(data[i].RegisteredDate).fromNow();
            data[i].url = '/accounting/transquery/detailsByJournalEntryNumber/' + data[i].JournalEntryNumber;
        }
        this.journalEntryList = data;
    }

    //For invoiced chart
    private invoicedChartData(data: any, label: string, bgColor: string, bdColor: string): IChartDataSet {
        var numberOfMonths = 6;
        var currentMonth = new Date().getMonth();
        var myChartLabels = [];
        var myMonths = [];
        var myData = [];

        var totalLabel = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].sumTaxExclusiveAmount === null) {
                myData.push(0);
            } else {
                myData.push(data[i].sumTaxExclusiveAmount);
            }
            totalLabel += myData[i];
        }

        return {
            label: 'Total: ' + totalLabel,
            labels: this.months,
            chartType: 'bar',
            backgroundColor: bgColor,
            borderColor: bdColor,
            data: myData
        }
    }

    private chartGenerator(elementID: string, data: any) {
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

    /**
        SHOULD BE MOVED TO SERVICE, BUT VS WONT LET ME CREATE NEW FILES 
    **/
    
    //Gets 10 last transactions
    public getTransactions() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
            "workitems?action=statistics&model=AuditLog&select=entitytype,entityid,field,displayname,createdat,updatedat&filter=field eq 'updatedby' &join=auditlog.createdby eq user.globalidentity&top=10&orderby=id desc"
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
            + "' and ( field eq 'updatedby' )&join=auditlog.createdby eq user.globalidentity&top=60&orderby=id desc"
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

    //Gets sum invoiced 4 months (Query needs improving)
    public getInvoicedData() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=CustomerInvoice&select=sum(TaxExclusiveAmount),month(InvoiceDate),year(InvoiceDate)&filter=month(invoicedate) ge 1 and year(invoicedate) eq 2016&range=monthinvoicedate')
            .send();
    }

    //Gets ordre sum for last 4 months (Query needs improving)
    public getOrdreData() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('statistics?model=CustomerOrder&select=sum(TaxExclusiveAmount),month(OrderDate),year(OrderDate)&range=monthorderdate ')
            .send();
    }

    //Gets payroll data (Last 6 months?)
    public getLastJournalEntry() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('journalentrylines?skip=0&top=10&expand=VatType,Account&orderby=id desc')
            .send();
    }
}