import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ElsaContractService, UserService, UserRoleService} from '@app/services/services';
import {User} from '@uni-entities';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {AuthService} from '@app/authService';
import {SignalRService} from '@app/services/common/signal-r.service';
import {trigger, style, transition, animate, state, group} from '@angular/animations';

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
                    animate('100ms ease-in-out', style({'opacity': '0'}))
                ])

            ]),
            transition(':enter', [
                style({height: '0', opacity: 0}),
                group([
                    animate(100, style({height: '*'})),
                    animate('100ms ease-in-out', style({'opacity': '1'}))
                ])

            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportAccessIndicator {
    supportUsers: User[] = [];
    showDialog = false;
    showBanner = false;

    isAdmin = false;

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
        if (!sessionStorage.getItem('hideSupportUserBanner')) {
            this.showBanner = true;
        }

        this.userRoleService.hasAdminRole(this.authService.currentUser.ID).subscribe(isAdmin => {
            this.isAdmin = isAdmin;
        });

        this.checkForSupportUsers();

        this.signalRService.pushMessage$.subscribe((message: any) => {
            if (message && message.entityType === 'notification') {
                if (
                    message.cargo
                    && message.cargo.entityType === 'User'
                    && message.cargo.message.toLowerCase().startsWith('support user')
                ) {
                    this.checkForSupportUsers();
                }
            }
        });
    }

    ngOnDestroy() {
        this.signalRService.pushMessage$.unsubscribe();
    }

    checkForSupportUsers() {
        this.elsaContractService.getSupportUsers().subscribe(users => {
            this.supportUsers = users;
            this.cdr.markForCheck();
        });
    }

    closeBanner() {
        sessionStorage.setItem('hideSupportUserBanner', 'true');
        this.showBanner = false;
    }

    showMore() {
        this.showDialog = !this.showDialog;
    }

    deactivateSupportUser() {
        this.userService.PostAction(this.supportUsers[0].ID, 'inactivate').subscribe(() => {
            this.toastService.addToast(
                'Support avsluttet',
                ToastType.good,
                ToastTime.medium,
                `${this.supportUsers[0].Email} har ikke lenger lesetilgang til selskapet ditt`
            );
            this.showDialog = false;
            this.checkForSupportUsers();
        });
    }
}
