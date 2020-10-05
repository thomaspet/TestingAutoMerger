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
        window.open('https://support.unimicro.no/nytt-fra-uni-micro', '_blank');
    }

}
