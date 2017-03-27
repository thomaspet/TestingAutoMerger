import { Component, Input } from '@angular/core';
import {IUniWidget} from '../uniWidget';
@Component({
    selector: 'uni-rss',
    template: `
        <div style="height: 100%;">
            <div class="uni-dashboard-chart-header" style="color: #fff; text-align: center"> {{ widget.config.header }}</div>
            <ul style="list-style: none; height: 100%; overflow-y: scroll;">
                <li *ngFor="let item of rssItem">
                    <div style="float: left; width: 200px; ">
                        <img [src]="item.image" style="max-width: 100%; max-height: 100%; object-fit: contain;" height="120" width="200" >
                    </div>
                    <div style="float: left; width: calc(100% - 201px)">
                        <p style="margin: 0; text-align: left;">24.03.2017</p>
                        <h2 style="margin: -10px 0 0 0; padding: 0; font-size: 1rem; font-weight: bold; color: black; text-align: left;"> {{ item.title  }} </h2>
                        <p style="margin: -10px 0 0 0; font-size: 0.8rem; text-align: left;"> {{ item.text }} </p>
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

    //Dummydata.. Endpoint for getting RSS-feed needed.. (URL in config ?? )
    private rssItem: any[] = [
        {
            image: 'http://orig09.deviantart.net/5199/f/2010/144/8/c/noir_batman_by_yorshy.jpg',
            title: 'Uni Economy lansert',
            text: 'Siden Uni Economy ble lansert i 2017 har salget være knallbra. ',
            link: 'http://www.unimicro.no'
        },
        {
            image: 'https://leaderonomics.com/wp-content/uploads/2013/07/2794269061_f70cee271d_z.jpg',
            title: 'V3 blir fornyet',
            text: 'V3 blir lansert i nytt skall i 2018. Full funksjonalitet ned til kjernen',
            link: 'http://www.unimicro.no'
        },
        {
            image: 'https://s-media-cache-ak0.pinimg.com/736x/b7/52/bf/b752bf59e93bb8306ad00f3912d321a7.jpg',
            title: 'Uni Micro utvider',
            text: 'Uni Micro As utvider arbeidsstyrken med 10 nye utviklere og 5 nye kundekonsulenter ',
            link: 'http://www.unimicro.no'
        },
        {
            image: 'http://orig09.deviantart.net/5199/f/2010/144/8/c/noir_batman_by_yorshy.jpg',
            title: 'Uni Economy lansert',
            text: 'Siden Uni Economy ble lansert i 2017 har salget være knallbra. ',
            link: 'http://www.unimicro.no'
        },
        {
            image: 'https://leaderonomics.com/wp-content/uploads/2013/07/2794269061_f70cee271d_z.jpg',
            title: 'V3 blir fornyet',
            text: 'V3 blir lansert i nytt skall i 2018. Full funksjonalitet ned til kjernen',
            link: 'http://www.unimicro.no'
        },
        {
            image: 'https://s-media-cache-ak0.pinimg.com/736x/b7/52/bf/b752bf59e93bb8306ad00f3912d321a7.jpg',
            title: 'Uni Micro utvider',
            text: 'Uni Micro As utvider arbeidsstyrken med 10 nye utviklere og 5 nye kundekonsulenter ',
            link: 'http://www.unimicro.no'
        }
    ];

    constructor() { }

}
