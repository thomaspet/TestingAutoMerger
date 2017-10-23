import {Component, OnInit, Input} from '@angular/core';
import {TaxCardReadStatus} from '../../../../unientities';

@Component({
    selector: 'tax-card-read-status',
    templateUrl: './taxCardReadStatus.html'
})

export class TaxCardReadStatusComponent implements OnInit {

    @Input() public status: TaxCardReadStatus;

    constructor() {}

    ngOnInit() {}
}
