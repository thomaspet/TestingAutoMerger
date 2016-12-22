import {Component, HostListener} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../core/http/http';
import {ErrorService} from '../../app/services/services';
import {Notification, NotificationStatus} from '../../app/unientities';
import moment from 'moment';
declare const _;

import {entityTypeMap as salaryMap} from '../../app/components/salary/salaryRoutes';
import {entityTypeMap as salesMap} from '../../app/components/sales/salesRoutes';
import {entityTypeMap as accountingMap} from '../../app/components/accounting/accountingRoutes';
import {entityTypeMap as timetrackingMap} from '../../app/components/timetracking/timetrackingRoutes';

@Component({
    selector: 'uni-notifications',
    templateUrl: 'framework/notifications/notifications.html'
})
export class UniNotifications {
    private isOpen: boolean;
    private notifications: Notification[] = [];
    private unreadCount: number;

    constructor(
        private http: UniHttp,
        private errorService: ErrorService,
        private router: Router
    ) {
        this.getNotifications();
    }

    private getNotifications() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(Notification.RelativeUrl)
            .send()
            .map(res => res.json())
            .subscribe(
                (notifications) => {
                    // REVISIT: orderBy ID desc when possible on backend
                    this.notifications = notifications.reverse();

                    this.unreadCount = notifications.reduce((count, value: Notification) => {
                        if (value.StatusCode === NotificationStatus.New) {
                            count++;
                        }
                        return count;
                    }, 0);
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
    private onEscapeKeydown() {
        this.close();
    }

    private onNotificationClick(notification: Notification): void {
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

    private toggleReadStatus(notification: Notification): void {
        if (notification.StatusCode === 900010) {
            this.markAsRead(notification);
        } else {
            this.markAsUnread(notification);
        }
    }

    private markAsRead(notification: Notification): void {

        // Optimistically setting the status immedeately
        notification.StatusCode = 900020;
        this.unreadCount--;

        this.http.asPUT()
            .usingBusinessDomain()
            .withEndPoint(`${Notification.RelativeUrl}/${notification.ID}`)
            .send({action: 'mark-as-read'})
            .subscribe((res) => {
                notification = res;
                console.log(res);
            });
    }

    private markAsUnread(notification: Notification): void {
        // TODO: MARK AS UNREAD ON BACKEND!
        console.info('Marking as unread not implemented yet. 😿');
        notification.StatusCode = 900010;
        this.unreadCount++;
    }

    private markAllAsRead(): void {
        this.notifications.forEach((notification) => {
            if (notification.StatusCode === NotificationStatus.New) {
                this.markAsRead(notification);
            }
        });
    }

    private deleteNotification(notification: Notification): void {
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
