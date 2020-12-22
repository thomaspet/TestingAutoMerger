import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from './../../../../../framework/uni-modal';
import {UserService, ErrorService, CustomerInvoiceReminderService, DistributionPlanService} from '@app/services/services';

@Component({
    selector: 'uni-reminder-sending-modal',
    templateUrl: './reminderSendingModal.html'
})
export class UniReminderSendingModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    public casehandlerEmail: string;
    public reminderIds: Array<number>;

    public hasDistributionPlan?: boolean;

    public remindersWithDistributionPlan: number;
    public remindersWithEmail: number;
    public remindersWithPrint: number;
    public hasPrintService: boolean;
    public canDistributeAllRemindersUsingPlan: boolean;

    public alreadySentCount: number;

    public sendByEmail: boolean = true;
    public sendByPrint: boolean = false;
    public sendToCasehandler: boolean = true;

    constructor(private userService: UserService,
        private errorService: ErrorService,
        private reminderService: CustomerInvoiceReminderService,
        private distributionPlanService: DistributionPlanService) {
        this.userService.getCurrentUser()
            .subscribe(res => {
                this.casehandlerEmail = res.Email;
            });

    }

    public ngOnInit() {
        this.reminderIds = this.options.data.reminders;

        // get data from the API with information about if we have distribution plans set up,
        // if email addresses are registered, if print can be sent, etc.,
        // so we can show the user better information about what will happen next
        this.reminderService.ActionWithBody(null, this.reminderIds, 'can-distribute-reminders')
            .subscribe(result => {
                this.hasDistributionPlan = result.RemindersWithDistributionPlan > 0;
                this.remindersWithDistributionPlan = result.RemindersWithDistributionPlan;
                this.remindersWithEmail = result.RemindersWithEmail;
                if (this.remindersWithEmail === 0) {
                    this.sendByEmail = false;
                }
                this.remindersWithPrint = result.RemindersWithPrint;
                this.hasPrintService = result.HasPrintService;
                if (this.hasPrintService) {
                    this.sendByPrint = true;
                }
                this.canDistributeAllRemindersUsingPlan = result.CanDistributeAllRemindersUsingPlan;
                this.alreadySentCount = result.AlreadySentCount;
            },
            err => this.errorService.handle(err));
    }

    send() {
        // call the API to start distribution based on input from user
        this.reminderService.ActionWithBody(null, {
            ReminderIds: this.reminderIds,
            SendByDistributionPlanFirst: true,
            SendByEmailIfPossible: this.sendByEmail,
            SendByPrintServiceIfPossible: this.sendByPrint,
            SendRemainingToCasehandler: this.sendToCasehandler,
            CasehandlerEmail: this.casehandlerEmail
        }, 'distribute-reminders')
        .subscribe(res => {
            this.onClose.emit({});
        },
        err => {
            this.errorService.handle(err);
        });
    }
}
