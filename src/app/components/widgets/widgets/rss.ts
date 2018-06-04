import {Component} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';
import {UniModalService, UniChangelogModal} from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-rss',
    template: `
        <section class="uni-widget-header">Nyhetsbrev</section>
        <ul>
            <li class="rss-item sticky">
                <header>Nytt design i Uni Economy</header>
                <article>Uni Economy har fått nytt design. <a (click)="openChangelogModal()">Se introduksjonsvideo</a>.</article>
            </li>
            <li *ngFor="let item of rssFeed" class="rss-item">
                <header>
                    {{item.Title}}
                    <small>{{item.PubDate | date: 'dd.MM.yyyy'}}</small>
                </header>
                <img *ngIf="item.Image" [src]="item.Image" />

                <article>{{item.Description}}</article>
                <a target="_blank" href="{{item.Link}}">Les mer</a>
            </li>
        </ul>
   `
})
export class UniRSSWidget {
    public widget: IUniWidget;
    public rssFeed: any[] = [];

    constructor(
        private widgetDataService: WidgetDataService,
        private modalService: UniModalService
    ) {}

    public ngAfterViewInit() {
        if (this.widget) {
            const endpoint = '/api/biz/rss?action=rss';
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

    public openChangelogModal() {
        this.modalService.open(UniChangelogModal, {
            closeOnClickOutside: false,
            closeOnEscape: false,
            hideCloseButton: true
        });
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
