import {Component} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';

@Component({
    selector: 'uni-rss',
    template: `
        <section class="uni-widget-header">{{ widget.config.header }}</section>
        <ul>
            <li *ngFor="let item of rssFeed" class="rss-item">
                <header>
                    {{item.Title}}
                    <small>{{item.PubDate | date: 'dd.MM.yyyy'}}</small>
                </header>
                <article>{{item.Description}}</article>
                <a target="_blank" href="{{item.Link}}">Les mer</a>
            </li>
        </ul>
   `
})
export class UniRSSWidget {
    public widget: IUniWidget;
    private rssFeed: any[] = [];

    constructor(private widgetDataService: WidgetDataService) { }

    public ngAfterViewInit() {
        if (this.widget && this.widget.config) {
            let endpoint = '/api/biz/rss/1';
            this.widgetDataService.getData(endpoint).subscribe(
                data => {
                    if (data && data.Items) {
                        this.rssFeed = data.Items.map(item => {
                            item.Description = this.stripHTML(item.Description);
                            return item;
                        });
                    }
                },
                err => console.log(err)
            );
        }
    }

    private stripHTML(html: string): string {
        var tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

}
