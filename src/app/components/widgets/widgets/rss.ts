import { Component, Input } from '@angular/core';
import { IUniWidget } from '../uniWidget';
import { WidgetDataService } from '../widgetDataService';

@Component({
    selector: 'uni-rss',
    template: `
        <div style="height: 100%; background-color: #fff;">
            <div class="uni-dashboard-chart-header" style="color: #fff; text-align: center"> {{ widget.config.header }}</div>
            <ul style="list-style: none; height: calc(100% - 24px); overflow-y: scroll; margin: 0;">
                <li *ngFor="let item of items" style="margin-top: 10px;">
                    <div style="float: left; width: 200px; ">
                        <img [src]="item.image" style="max-width: 100%; max-height: 100%; object-fit: contain;" height="160" width="160" >
                    </div>
                    <div style="float: left; width: calc(100% - 201px)">
                        <p style="margin: 0; text-align: left;">{{ item.PubDate | date: 'dd.MM.yyyy' }}</p>
                        <h3 style="margin: -10px 0 0 0; padding: 0; font-size: 1.3rem; font-weight: bold; color: black; text-align: left;"> {{ item.title  }} </h3>
                        <p style="margin: -10px 0 0 0; font-size: 0.8rem; text-align: left;"> {{ item.desc }} </p>
                        <a target="_black" [href]="item.link" style="margin: 0; float: left; font-size: 0.9rem; text-decoration: none;">Les mer</a>
                    </div>
                    <div style="clear: both"></div>
                </li>
            </ul>
        </div>`
})

export class UniRSSWidget {
    public widget: IUniWidget;
    private items: any[] = [];
    private readMoreLink: string = '';

    constructor(private widgetDataService: WidgetDataService) { }

    public ngAfterViewInit() {
        if (this.widget) {
            this.initializeRSS();
        }
    }

    private initializeRSS() {
        this.widgetDataService.getData(this.widget.config.dataEndpoint)
            .subscribe((data: any) => {
                data.Items.push(data.Items[0]);
                data.Items.push(data.Items[0]);

                data.Items.forEach((item: any) => {
                    item.desc = this.strip(item.Description).slice(0, 250);
                    item.desc += '....';
                })
                data.Items[1].image = 'https://cdn.shopify.com/s/files/1/0863/0000/products/batman_5_0615c5e4-b844-4e01-b60b-6ac2acec5d0d_compact.jpg?v=1490102355';
                this.items = data.Items;
            },
            (err: any) => {
                console.log(err);
            });
    }

    private strip(html: string) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

}
