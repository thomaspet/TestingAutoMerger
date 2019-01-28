import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Notification} from '@uni-entities';
import * as moment from 'moment';

@Component({
    selector: 'notification-item',
    templateUrl: './notification-item.html',
    styleUrls: ['./notification-item.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItem {
    @Input() notification: Notification;

    notificationType: 'approval' | 'inbox' | 'mention';
    notificationText: string;
    icon: string;
    timestamp: string;

    ngOnChanges() {
        if (this.notification) {
            const sourceEntityType = this.notification.SourceEntityType;
            const sourceEntityID = this.notification.SourceEntityID;
            const entityType = this.notification.EntityType;
            const entityID = this.notification.EntityID;

            if (sourceEntityType === 'Comment') {
                this.notificationType = 'mention';
                this.notificationText = `Du har blitt nevnt i en kommentar på ${entityType} ${entityID}`;
                this.icon = 'comment';
            }

            if (sourceEntityType === 'File') {
                this.notificationType = 'inbox';
                this.icon = 'description';

                if (this.notification['_count'] > 1) {
                    this.notificationText = `${this.notification['_count']} nye leverandørfaktura i innboks`;
                } else {
                    this.notificationText = `Ny leverandørfaktura i innboks`;
                }
            }

            if (entityType === 'Approval') {
                this.notificationType = 'approval';
                this.notificationText = `Du har blitt bedt om å godkjenne ${sourceEntityType} ${sourceEntityID}`;
                this.icon = 'assignment_turned_in'; // 'thumb_up_alt';
            }

            const createdAt = moment(this.notification.CreatedAt);
            if (createdAt.isValid()) {
                this.timestamp = createdAt.fromNow();
            }
        }
    }
}
