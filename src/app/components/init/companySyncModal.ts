import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../framework/core/http/http';

interface ISyncAction {
    label: string;
    request: () => Observable<any>;
    busy: boolean;
    finished: boolean;
}

@Component({
    selector: 'company-sync-modal',
    template: `
        <dialog class="uniModal" *ngIf="isOpen">
            <article class="modal-content">
                <h2>Vent litt, mens vi gjør ting klart...</h2>

                <ul class="progress-list">
                    <li *ngFor="let action of actions" class="progress-item" [ngClass]="{'finished': action.finished}" [attr.aria-busy]="action.busy">
                        {{action.label}}
                    </li>                    
                </ul>
            </article>
        </dialog>
    `,
})
export class CompanySyncModal {
    private isOpen: boolean = false;
    private actions: ISyncAction[];
    private completionCount: number = 0;

    constructor(private http: UniHttp) {
        this.actions = [
            {
                label: 'Synkroniserer kontoplan',
                request: () => {
                    return this.http.asPUT()
                        .usingBusinessDomain()
                        .withEndPoint('accounts?action=synchronize-ns4102-as')
                        .send()
                        .map(response => response.json());
                },
                busy: false,
                finished: false
            },
            {
                label: 'Synkroniserer valuta',
                request: () => {
                    return this.http.asGET()
                        .usingBusinessDomain()
                        .withEndPoint('currency?action=download-from-norgesbank')
                        .send()
                        .map(response => response.json());
                },
                busy: false,
                finished: false
            },
            {
                label: 'Synkroniserer mva',
                request: () => {
                    return this.http.asPUT()
                        .usingBusinessDomain()
                        .withEndPoint('vattypes?action=synchronize')
                        .send()
                        .map(response => response.json());
                },
                busy: false,
                finished: false
            },
            {
                label: 'Oppretter regnskapsår med perioder',
                request: () => {
                    return this.http.asGET()
                        .usingBusinessDomain()
                        .withEndPoint('journalentries?action=get-or-create-financial-year')
                        .send()
                        .map(response => response.json());
                },
                busy: false,
                finished: false
            }
        ];
    }

    public open() {
        this.completionCount = 0;
        this.isOpen = true;

        // We need to run account sync first, as mva sync is depending on accounts being synced
        this.actions[0].busy = true;
        this.actions[0].request().subscribe(
            (response) => {
                this.onActionCompleted(this.actions[0]);
                this.runActions(this.actions.slice(1));
            },
            (error) => {
                this.onActionCompleted(this.actions[0]);
                this.runActions(this.actions.slice(1));
            });
    }

    private runActions(actions: ISyncAction[]) {
        actions.forEach((action) => {
            action.busy = true;
            action.request().subscribe(
                (response) => {
                    this.onActionCompleted(action);
                },
                (error) => {
                    this.onActionCompleted(action);
                });
        });
    }

    private onActionCompleted(action: ISyncAction) {
        action.busy = false;
        action.finished = true;
        this.completionCount++;

        if (this.completionCount === this.actions.length) {
            setTimeout(() => {
                this.isOpen = false;
            }, 250);
        }
    }

}
