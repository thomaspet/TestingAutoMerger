import {Component} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';

@Component({
    selector: 'uni-rss',
    template: `
        <section class="uni-widget-header">Nytt om Uni Economy</section>
        <ul>
            <li *ngFor="let item of rssFeed" class="rss-item">
                <img *ngIf="item.Image" [src]="item.Image" />
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
        if (this.widget) {
            let endpoint = '/api/biz/rss/1';
            this.widgetDataService.getData(endpoint).subscribe(
                data => {
                    if (data && data.Items) {
                        this.rssFeed = data.Items.map(item => {
                            const html = item.Description;
                            item.Description = this.stripHTML(html);
                            const baseUrl = this.getBaseUrl(item.Link);
                            const img = this.findImageUrl(html);
                            item.Image = img ? baseUrl + img : null;
                            return item;
                        });
                    }
                },
                err => console.log("Couldn't load the rss feed for the news dashboard widget:", err)
            );
        }
    }

    private stripHTML(html: string): string {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        return dom.body.textContent;
    }

    private getBaseUrl(url: string): string {
        const parts = url.split('/');
        // skipping protocol so that it uses the same protocol as the parent site
        return '//' + parts[2];
    }

    private findImageUrl(html: string): string {
        const imageREGEX = `<img [^>]+ src=["']([^"']+)["'] [^>]+\/>`;
        const match = html.match(imageREGEX);
        if (match && match[1]) {
            return match[1];
        }
    }
}
