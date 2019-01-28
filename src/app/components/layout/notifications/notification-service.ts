import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {Notification} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import * as moment from 'moment';

@Injectable()
export class NotificationService extends BizHttp<Notification> {
    notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject([]);
    unreadCount$: BehaviorSubject<number> = new BehaviorSubject(0);

    readTimestamp: Date = new Date('2019-01-20');

    constructor(uniHttp: UniHttp) {
        super(uniHttp);
        this.relativeURL = 'notifications';
        this.DefaultOrderBy = 'CreatedAt desc';

        try {
            this.readTimestamp = JSON.parse(localStorage.getItem('notifications_read_timestamp'));
        } catch (e) {}

        if (!this.readTimestamp) {
            this.readTimestamp = new Date();
            localStorage.setItem('notifications_read_timestamp', JSON.stringify(this.readTimestamp));
        }
    }

    markNotificationsRead() {
        this.readTimestamp = new Date();
        localStorage.setItem(
            'notifications_read_timestamp',
            JSON.stringify(this.readTimestamp)
        );
    }

    getNotifications(filter?: string) {
        let query = 'top=99';
        if (filter) {
            query += '&filter=' + filter;
        }

        return this.GetAll(query).pipe(
            map((notifications: Notification[]) => {
                notifications = notifications.map(notification => this.setNotificationMetadata(notification));
                return this.groupInboxNotifications(notifications);
            })
        );
    }

    private setNotificationMetadata(notification: Notification): Notification {
        const createdAt = moment(notification.CreatedAt);
        if (createdAt.isValid()) {
            notification['_timestamp'] = createdAt.fromNow();

            if (createdAt.isAfter(moment(this.readTimestamp))) {
                notification['_unread'] = true;
            }
        }

        return notification;
    }

    private groupInboxNotifications(notifications: Notification[]): Notification[] {
        const grouped: Notification[] = [];

        notifications.forEach(notification => {
            if (notification.SourceEntityType === 'File') {
                const previousNotificiation = grouped[grouped.length - 1];
                if (previousNotificiation
                    && previousNotificiation.SourceEntityType === 'File'
                    && previousNotificiation.CompanyKey === notification.CompanyKey
                    && previousNotificiation['_timestamp'] === notification['_timestamp']
                ) {
                    previousNotificiation['_count']++;
                } else {
                    notification['_count'] = 1;
                    grouped.push(notification);
                }

            } else {
                grouped.push(notification);
            }
        });

        return grouped;
    }
}
