import { Component, OnInit } from '@angular/core';
import { IncomingBalanceLogicService } from '../../shared/services/incoming-balance-logic.service';
import { IncomingBalanceNavigationService } from '../../shared/services/incoming-balance-navigation.service';

@Component({
    selector: 'uni-incoming-balance-preparation',
    templateUrl: './incoming-balance-preparation.component.html',
    styleUrls: ['./incoming-balance-preparation.component.sass']
})
export class IncomingBalancePreparationComponent implements OnInit {
    hideInfoBox: boolean;

    constructor(
        private logicService: IncomingBalanceLogicService,
        public navigationService: IncomingBalanceNavigationService,
    ) { }

    ngOnInit(): void {
        this.logicService.reportRoute('preparation');
    }

}
