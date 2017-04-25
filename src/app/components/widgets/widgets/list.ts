import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IUniWidget } from '../uniWidget';
import { WidgetDataService } from '../widgetDataService';

import * as moment from 'moment';

interface IListItem {
    username: string;
    action: string;
    time: string;
    module: string;
    moduleID: number;
}

@Component({
    selector: 'uni-widget-list',
    template: `
                <article class="uniListWidget">
                    <h1 class="uni-dashboard-chart-header">
                        {{ widget.config.header }}
                    </h1>

                    <ol *ngIf="myListItems">
                        <li *ngFor="let item of myListItems">

                            <strong>{{ item.username }}</strong>

                            {{ item.action }}

                            <a (click)="onClickNavigate(item)">
                                {{ item.module }}
                            </a>


                            <time>
                                {{ item.time }}
                            </time>
                        </li>
                    </ol>
                </article>
            `
})

export class UniListWidget {

    public widget: IUniWidget;
    public myListItems: IListItem[];

    constructor(private router: Router, private widgetDataService: WidgetDataService) { }

    ngAfterViewInit() {
        var mydate;
        this.loadListWidget();
        //this.widget.config.items.forEach(item => {
        //    mydate = moment.utc(item.timestamp).toDate();
        //    item.momentTime = moment(mydate).fromNow();
        //})
    }

    private loadListWidget() {
        this.widgetDataService.getData(this.widget.config.dataEndPoint)
            .subscribe(data => { this.myListItems = this.formatListData(data.Data) }, err => console.log(err));
    }

    private formatListData(list: any[]) {
        if (!list) return;
        let myNewList = [];
        list.forEach((item) => {
            item.username = this.CapitalizeDisplayName(this.removeLastNameIfAny(item[this.widget.config.listItemKeys.username]));
            this.translateModuleName(item);
            //item.action = item[this.widget.config.listItemKeys.action];
            item.action = 'endret'
            //item.moduleID = item[this.widget.config.listItemKeys.moduleID];

            var mydate = moment.utc(item[this.widget.config.listItemKeys.time]).toDate();
            item.time = moment(mydate).subtract(1, 'm').fromNow();

            if (this.widget.config.listItemKeys.uniqueID) {
                if (myNewList.length > 0) {
                    if (myNewList[myNewList.length - 1][this.widget.config.listItemKeys.uniqueID] !== item[this.widget.config.listItemKeys.uniqueID]) {
                        myNewList.push(item);
                    }
                } else {
                    myNewList.push(item);
                }
            } else {
                myNewList.push(item);
            }


        })
        return myNewList.slice(0, this.widget.config.listItemKeys.numberToDisplay);
    }

    private onClickNavigate(item: any) {
        console.log(item);
        if (!this.widget._editMode) {
            this.router.navigateByUrl(item.link);
        }
    }

    //Returns first name of user..
    private removeLastNameIfAny(str: string) {
        if (!str) {
            return str;
        } else if (str.indexOf(' ') === -1) {
            return str;
        } else {
            return str.substr(0, str.indexOf(' '));
        }
    }

    //Capitalize first letter in every word in string (Stack Overflow solution)
    private CapitalizeDisplayName(str: string) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    //While translations are not available backend..
    private translateModuleName(item: any) {
        let addressRoute;
        let changedModule;
        let url;
        switch (item[this.widget.config.listItemKeys.module]) {
            case 'CustomerQuote':
                item.module = 'Tilbud' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/quotes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'CustomerOrder':
                item.module = 'Ordre' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/orders/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'CustomerInvoice':
                item.module = 'Faktura' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/invoices/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'JournalEntryLine':
                item.module = 'Bilagslinje' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/quotes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'SupplierInvoice':
                item.module = 'Leverandørfaktura' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/accounting/bill/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'NumberSeries':
                item.module = 'Nummerserie' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/quotes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'AccountGroup':
                item.module = 'Kontogruppe' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/quotes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'Employee':
                item.module = 'Ansatt ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/salary/employees/' + item[this.widget.config.listItemKeys.moduleID] + '/personal-details';
                break;
            case 'Employment':
                if (item.AuditLogRoute) {
                    addressRoute = item.AuditLogRoute.split('/');
                    if (addressRoute[addressRoute.length - 1] !== 'EmployeeLeave') {
                        item.module = 'Arbeidsforhold  på Ansatt ' + addressRoute[addressRoute.length - 1];
                        item.link = '/salary/employees/' + addressRoute[addressRoute.length - 1] + '/employments';
                    } else {
                        item.module = 'et arbeidsforhold';
                        item.link = '/salary/employees';
                    }
                } else {
                    item.module = 'et arbeidsforhold';
                    item.link = '/salary/employees';
                }
                break;
            case 'BankAccount':
                if (item.AuditLogRoute) {
                    addressRoute = item.AuditLogRoute.split('/');
                    item.module = 'Bankkonto på Ansatt ' + addressRoute[addressRoute.length - 1];
                    item.link = '/salary/employees/' + addressRoute[addressRoute.length - 1] + '/personal-details';
                } else {
                    item.module = 'en Bankkonto';
                    item.link = '/';
                }

                break;
            case 'Customer':
                item.module = 'Kunde' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/customer/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'Product':
                item.module = 'Produkt' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/products/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'SalaryTransaction':
                item.module = 'SalaryTransaction' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/quotes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'PayrollRun':
                item.module = 'Lønnsavregning' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/sales/quotes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'Account':
                item.module = 'Konto' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/accounting/accountsettings';
                break;
            case 'Address':
                if (item.AuditLogRoute) {
                    addressRoute = item.AuditLogRoute.split('/');
                    changedModule = 'Kunde';
                    url = 'customer';
                    if (addressRoute[addressRoute.length - 2] === 'suppliers') {
                        changedModule = 'Leverandør';
                        url = addressRoute[addressRoute.length - 2];
                    }
                    item.module = 'Adresse på ' + changedModule + ' ' + addressRoute[addressRoute.length - 1];
                    item.link = '/sales/' + url + '/' + addressRoute[addressRoute.length - 1];
                } else {
                    item.module = 'en Adresse';
                    item.link = '/';
                }
                break;
            case 'Dimensions':
                item.module = 'Dimensions' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/dimensions/project';
                break;
            case 'File':
                item.module = 'File' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/accounting/bills?filter=Inbox';
                break;
            case 'CompanySettings':
                item.module = 'Innstillinger';
                item.link = '/sales/quotes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'Project':
                item.module = 'Prosjekt' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/dimensions/project/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'Department':
                item.module = 'Avdeling' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/dimensions/department/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'User':
                item.module = 'Bruker' + ' ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/settings/user';
                break;
            case 'Altinn':
                item.module = 'innstillinger for Altinn';
                item.link = '/settings/altinn';
                break;
            case 'SubEntity':
                item.module = 'innstillinger for Lønn';
                item.link = '/settings/aga-and-subentities';
                break;
            case 'CompanySalary':
                item.module = 'innstillinger for Lønn';
                item.link = '/settings/aga-and-subentities';
                break;
            case 'VatType':
                item.module = 'innstillinger for MVA';
                item.link = '/accounting/vatsettings';
                break;

            case 'BusinessRelation':
                if (item.AuditLogRoute) {
                    addressRoute = item.AuditLogRoute.split('/');
                    changedModule = 'Kunde';
                    url = 'customer';
                    if (addressRoute[addressRoute.length - 2] === 'suppliers') {
                        changedModule = 'Leverandør';
                        url = addressRoute[addressRoute.length - 2];
                    }
                    item.module = 'informasjon på ' + changedModule + ' ' + addressRoute[addressRoute.length - 1];
                    item.link = '/sales/' + url + '/' + addressRoute[addressRoute.length - 1];
                } else {
                    item.module = 'en relasjon';
                    item.link = '/';
                }

                break;

            case 'Supplier':
                item.module = 'Leverandør ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/suppliers/' + item[this.widget.config.listItemKeys.moduleID];
                break;

            case 'WorkRelation':
                item.module = 'Stilling ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/timetracking/workers/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            case 'WorkType':
                item.module = 'Timeart ' + item[this.widget.config.listItemKeys.moduleID];
                item.link = '/timetracking/worktypes/' + item[this.widget.config.listItemKeys.moduleID];
                break;
            default:
                item.module = 'noe';
                item.link = '/';
        }
    }

}
