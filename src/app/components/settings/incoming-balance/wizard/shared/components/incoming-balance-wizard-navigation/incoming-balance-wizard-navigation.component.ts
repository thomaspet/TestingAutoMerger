import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IncomingBalanceTab, IncomingBalanceNavigationService } from '@app/components/settings/incoming-balance/shared/services/incoming-balance-navigation.service';

@Component({
  selector: 'uni-incoming-balance-wizard-navigation',
  templateUrl: './incoming-balance-wizard-navigation.component.html',
  styleUrls: ['./incoming-balance-wizard-navigation.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomingBalanceWizardNavigationComponent implements OnInit {
    @Input() currentTab: IncomingBalanceTab;
    @Input() nextDisabled: boolean;
    @Input() previousDisabled: boolean;
    constructor(public navigationService: IncomingBalanceNavigationService) { }

    ngOnInit(): void {
    }

}
