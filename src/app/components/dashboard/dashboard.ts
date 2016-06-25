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
    public data;
    public user: any;
    public months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    constructor(private tabService: TabService, private http: UniHttp, private router: Router) {
        this.tabService.addTab({ name: 'Dashboard', url: '/', active: true, moduleID: 0 });
        Chart.defaults.global.maintainAspectRatio = false;
        this.welcomeHidden = false;

            //Needs check to see if it is already loaded.. No need to load user more then once
        if (true) {
            this.getMyUserInfo().subscribe(
                (data) =>  {
                    this.user = data;
                    this.getMyTransactions()
                        .subscribe(
                        (data) => { console.log(data); },
                        (error) => { console.log(error) }
                        )
                },
                error => console.log(error) //Error handling
            )
        }
        
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
        this.chartGenerator('assets_chart', data)

        this.getTransactions()
            .subscribe(
            data => this.generateTransactionsArray(data),
            error => console.log(error)
        );

        this.getInvoicedData()
            .subscribe(
            data => this.chartGenerator('invoicedChart', this.invoicedChartData(data)),
            error => console.log(error)
        )
        
    }

    public hideWelcome() {
        this.welcomeHidden = true;
        localStorage.setItem('welcomeHidden', 'true');
    }

    public lastTransactionsClicked(index: number) {
        console.log(this.transactionList[index].url);
        this.router.navigateByUrl(this.transactionList[index].url);
    }

    private generateTransactionsArray(data: any) {
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
        this.transactionList = data;
    }

    //For invoiced chart
    private invoicedChartData(data): IChartDataSet {
        console.log(data);
        var numberOfMonths = 4;
        var currentMonth = new Date().getMonth();
        var myChartLabels = [];
        var myMonths = [];
        var myData = [];

        while (myChartLabels.length !== numberOfMonths) {
            myChartLabels.splice(0, 0, this.months[currentMonth]);
            myMonths.splice(0,0,currentMonth + 1);
            if (currentMonth === 0) {
                currentMonth = 11;
            } else {
                currentMonth--;
            }
        }

        for (var i = 0; i < numberOfMonths; i++) {
            if (data[0].monthInvoiceDate === myMonths[i]) {
                myData.push(data[0].sumTaxExclusiveAmount);
                data.splice(0, 1);
            } else {
                myData.push(0);
            }
        }
        return {
            label: 'Fakturert',
            labels: myChartLabels,
            chartType: 'bar',
            backgroundColor: '#7293cb',
            borderColor: '#396bb1',
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
                "workitems?action=statistics&model=AuditLog&select=entitytype,entityid,displayname,createdat,updatedat&filter=createdby eq '"
                + this.user.GlobalIdentity
                + "' &join=auditlog.createdby eq user.globalidentity&top=50&orderby=id desc"
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

    public getInvoicedData() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('workitems?action=statistics&model=CustomerInvoice&select=sum(TaxExclusiveAmount),month(InvoiceDate),year(InvoiceDate)&filter=month(invoicedate) ge 2 and year(invoicedate) eq 2016')
            .send();
    }
}