import { Component, Input } from '@angular/core';
import { IUniWidget } from '../uniWidget';
import { WidgetDataService } from '../widgetDataService';

@Component({
    selector: 'uni-rss',
    template: `
        <div class="uni-dashboard-chart-header" style="color: #fff; text-align: center"> {{ widget.config.header }}</div>
        <ul style="list-style: none; height: calc(100% - 24px); overflow-y: scroll; margin: 0;">
            <li *ngFor="let item of items" style="margin-top: 10px;">
                <aside class="image-container">
                    <img [src]="item.Image">
                </aside>

                <article>
                    <p style="margin: 0; text-align: left; font-size: 0.8rem">{{ item.PubDate | date: 'dd.MM.yyyy' }}</p>
                    <p style="margin: 0; padding: 0; font-size: 1rem; font-weight: bold; color: black; text-align: left;"> {{ item.Title  }} </p>
                    <p style="margin: 0; font-size: 0.8rem; text-align: left; line-height: 1.6em;"> {{ item.desc }} </p>
                    <a target="_black" [href]="item.Link" style="margin: 0; float: left; font-size: 0.9rem; text-decoration: none;">Les mer</a>
                </article>
                <div style="clear: both"></div>
            </li>
        </ul>
   `
})

export class UniRSSWidget {
    public widget: IUniWidget;
    private items: any[] = [];

    constructor(private widgetDataService: WidgetDataService) { }

    public ngAfterViewInit() {
        if (this.widget) {
            this.initializeRSS();
        }
    }

    private initializeRSS() {
        this.widgetDataService.getData(this.widget.config.dataEndpoint)
            .subscribe((data: any) => {
                //Loop the data to trim the text down to a 250 characters without HTML tags..
                data.Items.forEach((item: any) => {
                    item.desc = this.strip(item.Description).slice(0, 150);
                    item.desc += '....';
                    //Dummy to add picture if no picture from rss feed
                    if (!item.Image) {
                        item.Image = 'https://cdn.shopify.com/s/files/1/0863/0000/products/batman_5_0615c5e4-b844-4e01-b60b-6ac2acec5d0d_compact.jpg?v=1490102355';
                    }

                })
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
