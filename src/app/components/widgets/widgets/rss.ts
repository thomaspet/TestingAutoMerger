import { Component } from '@angular/core';

@Component({
    selector: 'uni-rss',
    template: ` <div>
                    <style> .img-width { height: auto } .img-heigth { width : auto; } </style>
                    <div class="uni-dashboard-chart-header" style="color: #fff; text-align: center">Nyheter fra kundesenteret</div>
                    <ul style="list-style: none;">
                        <li *ngFor="let item of rssItem"> 
                            <div style="float: left; width: 200px; ">
                                <img [src]="item.image" style="max-width: 100%; max-height: 100%; object-fit: contain;" height="120" width="200" >
                            </div>
                            <div style="float: left; width: calc(100% - 201px)"> 
                                <p style="margin: 0;">24.03.2017</p>
                                <h2 style="margin: -16px 0 0 0; padding: 0; font-size: 1rem; font-weight: bold;"> {{ item.title  }} </h2>  
                                <p style="margin: -10px 0 0 0; font-size: 0.8rem;"> {{ item.text }} </p>
                            </div>
                            <div style="clear: both"></div>
                        </li>
                    </ul>
                </div>`
})

export class UniRSSWidget {

    private items: any[] = [];

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
        }
    ]

    constructor() { }

}