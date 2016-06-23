import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../framework/core/http/http';

interface SyncAction {
    label: string;
    request: () => Observable<any>;
    busy?: boolean;
}

@Component({
    selector: 'company-sync-modal',
    template: `
        <dialog class="uniModal" *ngIf="isOpen">
            <article class="modal-content">
                <h2>Vent litt, mens vi gjør ting klart...</h2>

                <ul class="progress-list">
                    <li *ngFor="let action of actions" [attr.aria-busy]="action.busy">
                        {{action.label}}
                    </li>                    
                </ul>
            </article>
        </dialog>
    `,
})
export class CompanySyncModal {
    private isOpen: boolean = false;
    private actions: SyncAction[];
    private completionCount: number = 0;

    constructor(private http: UniHttp) {
        this.actions = [
            {
                label: 'Synkroniserer valuta',
                request: () => {
                    return this.http.asGET()
                        .usingBusinessDomain()
                        .withEndPoint('currency?action=download-from-norgesbank')
                        .send();
                }
            },
            {
                label: 'Synkroniserer mva',
                request: () => {
                    return this.http.asPUT()
                        .usingBusinessDomain()
                        .withEndPoint('vattypes?action=synchronize')
                        .send();
                }
            },
            {
                label: 'Synkroniserer kontoplan',
                request: () => {
                    return this.http.asPUT()
                        .usingBusinessDomain()
                        .withEndPoint('accounts?action=synchronize-ns4102-as')
                        .send();
                }
                
            }
        ];
    }

    public open() {
        this.completionCount = 0;
        this.isOpen = true;
        this.actions.forEach((action) => {
            action.busy = true;
            action.request().subscribe(
                (response) => {
                    action.busy = false;
                    this.completionCount++;
                    this.closeIfFinished();
                },
                (error) => {
                    // TODO: How do we handle errors here?
                    action.busy = false;
                    this.completionCount++;
                    this.closeIfFinished();
                });
        });
    }

    private closeIfFinished() {
        if (this.completionCount === this.actions.length) {
            setTimeout(() => {
                this.isOpen = false;
            }, 250);
        }
    }

}
