import {Component, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../core/http/http';
import {ErrorService, CompanyService} from '../../app/services/services';
import {Notification, NotificationStatus, Company} from '../../app/unientities';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../app/authService';
import {UniModalService, ConfirmActions} from '../uni-modal';

import * as moment from 'moment';
import {
    accountingRouteMap,
    salaryRouteMap,
    salesRouteMap,
    timetrackingRouteMap,
    commonRouteMap
} from './entityRouteMap';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';


@Component({
    selector: 'uni-notifications',
    templateUrl: './notifications.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniNotifications {
    public isOpen: boolean;
    public notifications: Notification[] = [];
    public unreadCount: number;
    private companies: Company[];

    constructor(
        private http: UniHttp,
        private errorService: ErrorService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private authService: AuthService,
        private companyService: CompanyService,
        private modalService: UniModalService,
        private toastService: ToastService,
    ) {
        this.getNotifications();

        this.companyService.GetAll(null).subscribe(
            res => this.companies = res,
            err => this.errorService.handle(err)
        );

        // if (typeof (OneSignal) !== 'undefined') {
        //     OneSignal.on('notificationDisplay', (event) => {
        //         this.getNotifications();
        //     });
        // }
    }

    private getNotifications() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(Notification.RelativeUrl + '?orderby=ID desc')
            .send()
            .map(res => res.json())
            .subscribe((notifications) => {
                this.notifications = notifications;
                this.unreadCount = notifications.reduce((count, value: Notification) => {
                    if (value.StatusCode === NotificationStatus.New) {
                        count++;
                    }
                    return count;
                }, 0);

                this.cdr.markForCheck();
            },
            err => this.errorService.handle(err)
            );
    }

    public toggle(event: MouseEvent) {
        event.stopPropagation(); // avoid triggering clickOutside
        this.isOpen = !this.isOpen;
    }

    public close() {
        this.isOpen = false;
    }

    @HostListener('keydown.esc')
    public onEscapeKeydown() {
        this.close();
    }

    public onNotificationClick(notification: Notification): void {
        if (notification.StatusCode === NotificationStatus.New) {
            this.markAsRead(notification);
        }

        this.close();
        const notificationRoute = this.getNotificationRoute(notification);

        if (notification.CompanyKey === this.authService.getCompanyKey()) {
            this.router.navigateByUrl(notificationRoute);
            return;
        }

        // Change companies before routing
        this.modalService.confirm({
            header: 'Bytte selskap?',
            message: `
                Navigering til denne varselen vil føre til endring av aktivt selskap.
                Ulagrede endringer vil bli forkastet. Ønsker du å fortsette?
            `
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                const company = this.companies.find(c => c.Key === notification.CompanyKey);
                if (!company) {
                    this.toastService.addToast(
                        'Mistet tilgang',
                        ToastType.warn,
                        ToastTime.long,
                        `Det ser ut som om du nå mangler tilgang til ${notification.CompanyName},
                        vennligst kontakt selskapets administrator om du ønsker tilgang.`,
                    );

                    return;
                }

                this.authService.setActiveCompany(company, notificationRoute);
            }
        });
    }

    private getNotificationRoute(notification: Notification) {
        const entityType = notification.EntityType.toLowerCase();
        let route = '';

        if (accountingRouteMap[entityType]) {
            route = '/accounting/' + accountingRouteMap[entityType];
        } else if (salesRouteMap[entityType]) {
            route = '/sales/' + salesRouteMap[entityType];
        } else if (salaryRouteMap[entityType]) {
            route = '/salary/' + salaryRouteMap[entityType];
        } else if (timetrackingRouteMap[entityType]) {
            route = '/timetracking/' + timetrackingRouteMap[entityType];
        } else if (commonRouteMap[entityType]) {
            route = commonRouteMap[entityType];
        } else if (notification.EntityType === 'File' && notification.SenderDisplayName === 'Uni Micro AP') {
            route = '/accounting/bills/0?fileid=:id';
        }

        if (!route) {
            route = '';
        }

        return route.replace(/:id/i, notification.EntityID.toString());
     }

    public toggleReadStatus(notification: Notification): void {
        if (notification.StatusCode === NotificationStatus.New) {
            this.markAsRead(notification);
        } else {
            this.markAsUnread(notification);
        }
    }

    private setNotificationReadStatus(id: number, read: boolean): Observable<Notification> {
        const markAction = read ? 'mark-as-read' : 'mark-as-unread';
        return this.http.asPUT()
            .usingBusinessDomain()
            .withEndPoint(`${Notification.RelativeUrl}/${id}`)
            .send({ action: markAction });
    }

    private markAsRead(notification: Notification): void {
        // Optimistically setting the status immedeately
        notification.StatusCode = NotificationStatus.Read;
        this.unreadCount--;
        this.setNotificationReadStatus(notification.ID, true).subscribe(
            res => notification = res,
            err => this.errorService.handle(err)
        );
    }

    private markAsUnread(notification: Notification): void {
        notification.StatusCode = NotificationStatus.New;
        this.unreadCount++;
        this.setNotificationReadStatus(notification.ID, false).subscribe(
            res => notification = res,
            err => this.errorService.handle(err)
        );
    }

    public markAllAsRead(): void {
        this.notifications.forEach((notification) => {
            if (notification.StatusCode === NotificationStatus.New) {
                this.markAsRead(notification);
            }
        });
    }

    public deleteNotification(notification: Notification): void {
        // FIXME: Delete doesn't seem to persist.
        this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`${Notification.RelativeUrl}/${notification.ID}`)
            .send();
        let indx = this.notifications.indexOf(notification);
        this.notifications.splice(indx, 1);
    }

    public getNotificationTime(notification: Notification): string {
        return moment(notification.CreatedAt).fromNow();
    }


    public getNotificationText(notification: Notification) {
        if (notification.EntityType  === 'File' && notification.SenderDisplayName === 'Uni Micro AP') {
            return `${notification.EntityType}/${notification.EntityID} - Inngående EHF`
        }

        if (notification.EntityType === 'Approval') {
            return 'Du har blitt tildelt en godkjenning på '
                + notification.SourceEntityType
                + ' '
                + notification.SourceEntityID;
        }

        if (notification.SourceEntityType === 'Comment') {
            return 'Du har blitt nevnt i en kommentar på '
                + notification.EntityType
                + ' '
                + notification.EntityID;
        }

        if (notification.EntityType === 'CustomerInvoiceReminder') {
            return notification.Message;
        }

        return `${notification.EntityType}/${notification.EntityID}`;
    }

}
