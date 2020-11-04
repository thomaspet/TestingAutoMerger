import { Component, OnInit } from '@angular/core';
import { IncomingBalanceNavigationService } from './shared/services/incoming-balance-navigation.service';

@Component({
    selector: 'uni-incoming-balance',
    templateUrl: './incoming-balance.component.html',
    styleUrls: ['./incoming-balance.component.sass']
})
export class IncomingBalanceComponent implements OnInit {
    showAdvanced: boolean;

    constructor(
        public navigationService: IncomingBalanceNavigationService
    ) { }

    ngOnInit(): void {

    }
}
