import {Component, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'bruno-product-packages',
    templateUrl: 'bruno-product-packages.html',
    styleUrls: ['./bruno-product-packages.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrunoProductPackages {
    @Output() packageSelected = new EventEmitter<string>();

    packages = [
        {
            recommended: false,
            name: 'mini',
            price: 129,
            title: 'MINI',
            description: 'Kort forklaring av pakken og hvem den passer for',
            bulletPoints: [
                '1 bruker',
                'Trenger tekst her',
                'Trenger tekst her'
            ]
        },
        {
            recommended: true,
            name: 'plus',
            price: 249,
            title: 'PLUSS',
            description: 'Kort forklaring av pakken og hvem den passer for',
            bulletPoints: [
                '10 brukere',
                'Trenger tekst her',
                'Trenger tekst her'
            ]
        },
        {
            recommended: false,
            name: 'complete',
            price: 499,
            title: 'KOMPLETT',
            description: 'Kort forklaring av pakken og hvem den passer for',
            bulletPoints: [
                '10+ brukere',
                'Trenger tekst her',
                'Trenger tekst her'
            ]
        }
    ];
}
