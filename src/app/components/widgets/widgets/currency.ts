import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';
import * as moment from 'moment';

@Component({
    selector: 'uni-currency-widget',
    template: `
        <section class="currency_widget" [ngClass]="cls" (click)="navigate()" title="Valuta">
            <label>{{ label }}</label>
            <p class="currency_widget_number">{{ date }}</p>
            <p class="currency_widget_bank">Norges Bank</p>
        </section>
    `
})

export class UniCurrencyWidget {

    public widget: IUniWidget;
    public label: string = '';
    public date: string;
    public days: number = 0;
    public cls: string = '';

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
        this.dataService.getData(this.widget.config.dataEndpoint).subscribe((res) => {
           this.date = moment(res).format('DD.MM.YYYY');
           this.days = moment(res).date() - moment(new Date()).date();
           this.cls = this.setColor(this.days);
           this.label = this.setLabel(this.days);
        });
    }

    public setColor(difference: number) {
        if (difference <= 2) {
            return 'green';
        }

        return difference <= 5 ? 'orange' : 'red';
    }

    public setLabel(difference: number) {
        return difference <= 0 ? 'Oppdatert valutakurs:' : 'Utdatert valutakurs fra:';
    }

    public navigate() {
        this.router.navigateByUrl('/currency/exchange');
    }
}
