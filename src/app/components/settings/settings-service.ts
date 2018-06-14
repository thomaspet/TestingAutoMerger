import {Injectable} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniSaveAction} from '@uni-framework/save/save';

@Injectable()
export class SettingsService {
    public saveActions$: BehaviorSubject<IUniSaveAction[]> = new BehaviorSubject([]);

    constructor(router: Router) {
        // Clear saveactions on navigation in case the view we navigate to does not add saveactions
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.saveActions$.next([]);
            }
        });
    }

    public setSaveActions(saveActions: IUniSaveAction[]) {
        // Avoid changeAfterCheck error
        setTimeout(() => {
            this.saveActions$.next(saveActions);
        });
    }
}
