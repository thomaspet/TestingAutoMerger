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
                <div style="background-color:white; height: 100%;">
                    <div class="uni-dashboard-chart-header"> {{ widget.config.header }}</div>
                    <ol *ngIf="myListItems" style="list-style: none; padding: 0; margin: 0; color: black; text-align: left; overflow-y: auto; max-height: calc(100% - 25px);">
                        <li *ngFor="let item of myListItems" style="font-size: 0.8rem; padding: 2px 10px;">
                            <strong>{{ item.username }}</strong>
                            {{ item.action }}
                            <a (click)="onClickNavigate()" style="cursor: pointer;"> {{ item.module }} {{ item.moduleID }} </a>
                            <time style="float: right; margin: 0;"> {{ item.time }} </time>
                        </li>
                    </ol>
                </div>
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

    loadListWidget() {
        this.widgetDataService.getData(this.widget.config.dataEndPoint)
            .subscribe(data => { this.myListItems = this.formatListData(data.Data) }, err => console.log(err));
    }

    formatListData(list: any[]) {
        list.forEach((item) => {
            item.username = item[this.widget.config.listItemKeys.username];
            item.module = item[this.widget.config.listItemKeys.module];
            item.action = item[this.widget.config.listItemKeys.action];
            item.moduleID = item[this.widget.config.listItemKeys.moduleID];

            var mydate = moment.utc(item[this.widget.config.listItemKeys.time]).toDate();
            item.time = moment(mydate).subtract(1, 'm').fromNow();
        })
        return list;
    }

    onClickNavigate() {
        if (!this.widget._editMode) {
            //Helpfunction to find link based on module and ID?
            var link = '/sales/customer';
            this.router.navigateByUrl(link);
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

}