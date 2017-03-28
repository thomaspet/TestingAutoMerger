import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IUniWidget } from '../uniWidget';

import * as moment from 'moment';

@Component({
    selector: 'uni-widget-list',
    template: `
                <div style="background-color:white; height: 100%;"> 
                    <div class="uni-dashboard-chart-header"> {{ widget.config.header }}</div>
                    <ol style="list-style: none; padding: 0; margin: 0; color: black; text-align: left; overflow-y: auto; max-height: calc(100% - 25px)">
                        <li *ngFor="let item of widget.config.items" style="font-size: 0.8rem; padding: 2px 10px;"> 
                            <strong>{{ item.user }}</strong> 
                            {{ item.action }} 
                            <a (click)="onClickNavigate(item.link)" style="cursor: pointer;"> {{ item.module }} </a>
                            <time style="float: right; margin: 0;"> {{ item.momentTime }} </time>
                        </li>
                    </ol>    
                </div>
            `
})

export class UniListWidget {

    public widget: IUniWidget;

    constructor(private router: Router) { }

    ngAfterViewInit() {
        var mydate;
        this.widget.config.items.forEach(item => {
            mydate = moment.utc(item.timestamp).toDate();
            item.momentTime = moment(mydate).fromNow();
        })
    }

    onClickNavigate(link: string) {
        if (!this.widget.dragMode) {
            this.router.navigateByUrl(link);
        }
    }

}