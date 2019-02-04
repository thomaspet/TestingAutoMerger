import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule, MatSlideToggleModule } from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';

import {NotificationService} from './notification-service';
import {Notifications} from './notifications';
import {NotificationsDropdown} from './notifications-dropdown/notifications-dropdown';
import {NotificationItem} from './notification-item/notification-item';

@NgModule({
    imports: [
        CommonModule,
        MatMenuModule,
        MatSlideToggleModule,
        OverlayModule,
        ScrollingModule
    ],
    declarations: [
        Notifications,
        NotificationsDropdown,
        NotificationItem,
    ],
    entryComponents: [NotificationsDropdown],
    providers: [NotificationService],
    exports: [Notifications]
})
export class NotificationsModule {}
