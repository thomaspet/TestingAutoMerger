import {Component} from '@angular/core';
import {ApprovalService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {ApprovalStatus, Approval, UserDto} from '@uni-entities';
import PerfectScrollbar from 'perfect-scrollbar';
import {WidgetDataService} from '../../widgetDataService';
import {Router} from '@angular/router';

interface ApprovalExtended extends Approval {
    _icon: string;
    _iconClass: string;
    _typeText: string;
    _label: string;
    _amount: number;
}

@Component({
    selector: 'assignments-widget',
    templateUrl: './assignments-widget.html',
    styleUrls: ['./assignments-widget.sass']
})
export class AssignmentsWidget {
    user: UserDto;
    approvals: ApprovalExtended[];
    scrollbar: PerfectScrollbar;

    constructor(
        private router: Router,
        private authService: AuthService,
        private approvalService: ApprovalService,
        private widgetDataService: WidgetDataService
    ) {}

    ngAfterViewInit() {
        const el = document.getElementById('assignments-widget-content');
        if (el) {
            this.scrollbar = new PerfectScrollbar(el, {wheelPropagation: true});
        }
    }

    ngOnDestroy() {
        if (this.scrollbar && this.scrollbar.destroy) {
            this.scrollbar.destroy();
        }
    }

    ngOnInit() {
        this.user = this.authService.currentUser;
        if (this.widgetDataService.hasAccess('ui_approval_accounting')) {
            const filter = `filter=UserID eq ${this.user.ID} and StatusCode eq ${ApprovalStatus.Active}`;
            this.approvalService.GetAll(filter, ['Task.Model']).subscribe(
                approvals => {
                    // Try to extract information to display in a clean way.
                    // This probably wont work forever, as the texts set on the
                    // approval/task might change at some point.
                    // Ideally we should get the information in a cleaner way from the api.
                    this.approvals = (approvals || []).map((approval: ApprovalExtended) => {
                        const task = approval.Task;
                        if (task) {
                            if (task.Model.Name === 'SupplierInvoice') {
                                approval._typeText = 'Leverandørfaktura';
                                approval._icon = 'arrow_right_alt';
                                approval._iconClass = 'blue';

                                const titleSplit = (task.Title || '').split(/-(.+)/);
                                if (titleSplit[1] && +titleSplit[1]) {
                                    approval._label = titleSplit[0];
                                    approval._amount = +titleSplit[1];
                                }
                            } else if (task.Model.Name === 'WorkItemGroup') {
                                approval._typeText = 'Timeliste';
                                approval._icon = 'watch_later';
                                approval._iconClass = 'green';

                                const titleSplit = (task.Title || '').split('(');
                                if (titleSplit[0] && titleSplit[0].length) {
                                    approval._label = titleSplit[0];
                                }
                            }
                        }


                        return approval;
                    });

                    setTimeout(() => {
                        if (this.scrollbar) {
                            this.scrollbar.update();
                        }
                    });
                },
                () => this.approvals = []
            );
        } else {
            this.approvals = [];
        }
    }

    onApprovalClick(approval: Approval) {
        const hasInvoiceAccess = this.authService.canActivateRoute(this.user, 'accounting/bills');
        const isInvoice = approval.Task.Model.Name === 'SupplierInvoice';

        if (isInvoice && hasInvoiceAccess) {
            this.router.navigateByUrl(`/accounting/bills/${approval.Task.EntityID}`);
        } else {
            this.router.navigateByUrl(`/assignments/approvals?showCompleted=false&id=${approval.ID}`);
        }
    }
}
