import {Component} from '@angular/core';

@Component({
    selector: 'newsletter-widget',
    templateUrl: './newsletter-widget.html',
    styleUrls: ['./newsletter-widget.sass']
})
export class NewsletterWidget {

    imageUrl: string = 'themes/newsletter.svg';

    constructor() { }

    goToNewsletter() {
        window.open('https://info.unieconomy.no/nytt-i-systemet', '_blank');
    }

}
