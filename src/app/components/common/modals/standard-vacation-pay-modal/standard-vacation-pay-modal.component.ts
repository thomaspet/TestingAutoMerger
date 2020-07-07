import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { IUniModal, IModalOptions, ConfirmActions } from '@uni-framework/uni-modal';
import { Router } from '@angular/router';
import { StatisticsService, CompanyVacationRateService, ErrorService } from '@app/services/services';

@Component({
  selector: 'uni-standard-vacation-pay-modal',
  templateUrl: './standard-vacation-pay-modal.component.html',
  styleUrls: ['./standard-vacation-pay-modal.component.sass'],
})

export class StandardVacationPayModalComponent implements OnInit, IUniModal  {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    isStandardVacationPaySet: boolean;
    standardVacationRate: number = 12;

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private companyVacationRateService: CompanyVacationRateService,
        private errorService: ErrorService,
        ) { }

    ngOnInit(): void {
        this.statisticsService.GetAllUnwrapped('model=CompanyVacationRate').subscribe(x => {
            this.isStandardVacationPaySet = x[0].countid > 0;
        });
    }

    public close(): void {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

    public canDeactivate(): boolean {
        this.onClose.emit(ConfirmActions.REJECT);
        return true;
    }

    public save(): void {
        if (!this.isStandardVacationPaySet) {
            this.companyVacationRateService.Post({
                Rate: this.standardVacationRate,
                Rate60: 2.3,
                _createguid: this.companyVacationRateService.getNewGuid(),
                FromDate: '01.01.' + new Date().getFullYear()
            }).subscribe(
                () => {
                    this.onClose.emit(ConfirmActions.ACCEPT);
                },
                err => {
                    this.errorService.handle(err);
                    this.onClose.emit(ConfirmActions.REJECT);
                }
            );
        } else {
            this.onClose.emit(ConfirmActions.ACCEPT);
        }
    }
}
