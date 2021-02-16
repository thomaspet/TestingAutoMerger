import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ElsaContractService, UserService, UserRoleService} from '@app/services/services';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {AuthService} from '@app/authService';
import {SignalRService} from '@app/services/common/signal-r.service';
import {trigger, style, transition, animate, state, group} from '@angular/animations';
import {ElsaSupportUserDTO} from '@app/models';
import {Subscription} from 'rxjs';

@Component({
    selector: 'support-access-indicator',
    templateUrl: './support-access-indicator.html',
    styleUrls: ['./support-access-indicator.sass'],
    animations: [
        trigger('slideInOut', [
            state('in', style({height: '*', opacity: 0})),
            transition(':leave', [
                style({height: '*', opacity: 1}),
                group([
                    animate(100, style({height: 0})),
                    animate('70ms ease-in-out', style({'opacity': '0'}))
                ])

            ]),
            transition(':enter', [
                style({height: '0', opacity: 0}),
                group([
                    animate(100, style({height: '*'})),
                    animate('200ms ease-in-out', style({'opacity': '1'}))
                ])

            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportAccessIndicator {
    supportUsers: ElsaSupportUserDTO[] = [];
    showDialog = false;

    isAdmin = false;

    companyChangeSubscription: Subscription;

    constructor(
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private userService: UserService,
        private userRoleService: UserRoleService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef,
        private signalRService: SignalRService,
    ) {}

    ngOnInit() {
        this.checkSupportUsers();

        this.companyChangeSubscription = this.authService.companyChange.subscribe(() => {
            this.checkSupportUsers();
        });
    }

    checkSupportUsers() {
        this.userRoleService.hasAdminRole(this.authService.currentUser.ID).subscribe(isAdmin => {
            this.isAdmin = isAdmin;
            this.getSupportUsers();
        });

        this.signalRService.pushMessage$.subscribe((message: any) => {
            if (message && message.entityType === 'notification') {
                if (
                    message.cargo
                    && message.cargo.entityType === 'User'
                    && message.cargo.message.toLowerCase().startsWith('support user')
                ) {
                    this.getSupportUsers();
                }
            }
        });
    }

    ngOnDestroy() {
        this.signalRService.pushMessage$.unsubscribe();
        this.companyChangeSubscription.unsubscribe();
    }

    getSupportUsers() {
        this.elsaContractService.getSupportUsers().subscribe(users => {
            this.supportUsers = users.filter(su => su.StatusCode === 110001); // Active
            if (this.supportUsers[0]) {
                this.supportUsers[0]['_supportTypeText'] = this.translateSupportType(this.supportUsers[0].SupportType);
            }
            this.cdr.markForCheck();
        });
    }

    showMore() {
        this.showDialog = !this.showDialog;
    }

    deactivateSupportUser() {
        const userToBeDeactivatedEmail = this.supportUsers[0].DisplayName ? this.supportUsers[0].DisplayName : 'Denne brukeren';
        this.userService.PostAction(this.supportUsers[0].ID, 'inactivate').subscribe(() => {
            this.toastService.addToast(
                'Support avsluttet',
                ToastType.good,
                ToastTime.medium,
                `${userToBeDeactivatedEmail} har ikke lenger tilgang til selskapet ditt`
            );
            this.showDialog = false;
            this.getSupportUsers();
        });
    }

    translateSupportType(supportType: number): string {
        return supportType === 0 ? 'supportbruker' : 'regnskapsfører';
    }
}
