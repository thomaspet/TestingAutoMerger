import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {WidgetDataService} from '../widgetDataService';
import * as moment from 'moment';
const LOCALSTORAGE_KEY = 'newsfeed_last_read';

@Component({
    selector: 'newsfeed',
    templateUrl: 'newsfeed.html',
    styleUrls: ['./newsfeed.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsfeedWidget {
    rssFeed = [];
    hasUnread: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private widgetDataService: WidgetDataService
    ) {}

    ngAfterViewInit() {
        let lastReadDate: Date;
        try {
            const dateString = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
            if (dateString) {
                lastReadDate = new Date(dateString);
            }
        } catch (err) {
            console.error(err);
        }

        const endpoint = '/api/biz/rss?action=rss';
        this.widgetDataService.getData(endpoint).subscribe(
            data => {
                if (data && data.Items) {
                    this.rssFeed = data.Items.map(item => {
                        const html = item.Description;
                        item.Description = this.stripHTML(html);

                        if (item.Enclosure && item.Enclosure.Url) {
                            item.Image = item.Enclosure.Url;
                        } else {
                            const baseUrl = this.getBaseUrl(item.Link);
                            const imgUrl = this.findImageUrl(html);
                            item.Image = imgUrl?.startsWith('/') ? (baseUrl + imgUrl) : imgUrl;
                        }

                        return item;
                    });

                    const lastPublish = data.Items[0] && data.Items[0].PubDate;
                    if (lastPublish && lastReadDate) {
                        this.hasUnread = moment(lastPublish).isAfter(moment(lastReadDate));
                    } else if (!lastReadDate) {
                        this.hasUnread = true;
                    }

                    this.cdr.markForCheck();
                }
            },
            err => console.error(err)
        );
    }

    setRead() {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(new Date()));
        this.hasUnread = false;
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
