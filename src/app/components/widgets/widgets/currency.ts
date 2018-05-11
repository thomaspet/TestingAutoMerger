import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';
import * as moment from 'moment';

@Component({
    selector: 'uni-currency-widget',
    template: `
        <section class="currency_widget" (click)="navigate()">
            <span class="label">{{label}}</span>
            <span class="last-update-date" [ngClass]="reactionClass">
                {{date}}
            </span>
            <span class="currency_widget_bank">Norges Bank</span>
        </section>
    `
})
export class UniCurrencyWidget {
    public widget: IUniWidget;
    public label: string = '';
    public date: string;
    public reactionClass: string = '';

    constructor(
        private dataService: WidgetDataService,
        private router: Router
    ) {}

    public ngAfterViewInit() {
        if (this.widget) {
            this.getData();
        }
    }

    public getData() {
        this.dataService.getData(
            '/api/biz/currencies?action=get-latest-currency-downloaded-date&downloadSource=1'
        ).subscribe(lastUpdateDate => {
            this.date = moment(lastUpdateDate).format('DD.MM.YYYY');
            const daysSinceUpdate = moment(lastUpdateDate).date() - moment(new Date()).date();

            if (daysSinceUpdate <= 2) {
                this.reactionClass = 'good';
            } else {
                this.reactionClass = daysSinceUpdate <= 5 ? 'warn' : 'bad';
            }

            this.label = daysSinceUpdate <= 0
                ? 'Oppdatert valutakurs'
                : 'Utdatert valutakurs fra';
        });
    }

    // public getReactionClass(daysSinceUpdate: number): string {
    //     if (daysSinceUpdate <= 2) {
    //         return 'good';
    //     }

    //     return daysSinceUpdate <= 5 ? 'warn' : 'bad';
    // }

    // public setColor(difference: number) {
    //     if (difference <= 2) {
    //         return 'green';
    //     }

    //     return difference <= 5 ? 'orange' : 'red';
    // }

    // public setLabel(difference: number) {
    //     return difference <= 0 ? 'Oppdatert valutakurs:' : 'Utdatert valutakurs fra:';
    // }

    public navigate() {
        if (!this.widget._editMode) {
            this.router.navigateByUrl('/currency/exchange');
        }
    }
}
