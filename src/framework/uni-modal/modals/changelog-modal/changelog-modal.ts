import {
    Component,
    Output,
    EventEmitter,
} from '@angular/core';

import {Observable} from 'rxjs';
import {IUniModal, ConfirmActions} from '../../interfaces';

@Component({
    selector: 'uni-news-modal',
    templateUrl: './changelog-modal.html',
    styleUrls: ['./changelog-modal.sass']
})
export class UniChangelogModal {
    /*
        The functionality for this modal is not implemented yet.
        It's intended to display news about certain updates to the user
        on first login after the changes.

        The feed (and hasBeenDisplayed check) should come from somewhere else,
        but since the app redesign it scheduled to go live in two days we'll
        have to hard code the content for this popup.
    */

    public onClose: EventEmitter<any> = new EventEmitter(false);
}
