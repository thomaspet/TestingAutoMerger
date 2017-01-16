import { Component, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { UniHttp } from '../core/http/http';
import { ErrorService } from '../../app/services/services';
import { Notification, NotificationStatus } from '../../app/unientities';
import { Observable } from 'rxjs/Observable';
import moment from 'moment';
declare const _;

import { entityTypeMap as salaryMap } from '../../app/components/salary/salaryRoutes';
import { entityTypeMap as salesMap } from '../../app/components/sales/salesRoutes';
import { entityTypeMap as accountingMap } from '../../app/components/accounting/accountingRoutes';
import { entityTypeMap as timetrackingMap } from '../../app/components/timetracking/timetrackingRoutes';
declare const OneSignal;

@Component({
    selector: 'uni-notifications',
    templateUrl: './notifications.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniNotifications {
    private isOpen: boolean;
    private notifications: Notification[] = [];
    private unreadCount: number;

    constructor(
        private http: UniHttp,
        private errorService: ErrorService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.getNotifications();
        if (typeof (OneSignal) !== 'undefined') {
            OneSignal.on('notificationDisplay', (event) => {
                this.getNotifications();
            });
        }
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
        const entityType = notification.EntityType;
        let route = '';

        if (accountingMap[entityType]) {
            route = '/accounting/' + accountingMap[entityType];
        } else if (salesMap[entityType]) {
            route = '/sales/' + salesMap[entityType];
        } else if (salaryMap[entityType]) {
            route = '/salary/' + salaryMap[entityType];
        } else if (timetrackingMap[entityType]) {
            route = '/timetracking/' + timetrackingMap[entityType];
        }

        route = route.replace(/:id/i, notification.EntityID.toString());
        this.router.navigateByUrl(route);

        if (notification.StatusCode === NotificationStatus.New) {
            this.markAsRead(notification);
        }

        this.close();
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

    private getNotificationTime(notification: Notification): string {
        return moment(notification.CreatedAt).fromNow();
    }


    private getNotificationText(notification: Notification) {
        // TODO: rework this..
        let text = '';
        if (notification.SourceEntityType === 'Comment') {
            text += 'Du har blitt nevnt i en kommentar på ';
        }

        text += `${notification.EntityType}/${notification.EntityID}`;
        return text;
    }

}
