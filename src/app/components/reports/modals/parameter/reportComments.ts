import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { cloneDeep } from 'lodash';

import { ErrorService } from '@app/services/services';
import { UniHttp } from '@uni-framework/core/http/http';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { UniTableConfig, UniTableColumn } from '@uni-framework/ui/unitable';

export interface ReportComment {
    ID?: number;
    Text: string;
    _state?: 'updated' | 'new';
}

export interface ReportCommentConfig {
    filter: string;
    entity?: string;
    id?: any;
    companyKey?: string;
}

export interface ReportCommentSetup {
    config: ReportCommentConfig ;
    comments: ReportComment[];
}

@Component({
    selector: 'uni-report-comments',
    template: `
        <section role="dialog" class="uni-modal" style="width: 50vw">
            <header>Rediger kommentarer</header>

            <article class="scrollable" >
                <ag-grid-wrapper (keydown.esc)="$event.stopPropagation()" [(resource)]="comments" [config]="tableConfig"></ag-grid-wrapper>
            </article>

            <footer>
                <button class="good" (click)="save()">Lagre</button>
                <button class="warning" (click)="onClose.emit()">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniReportComments implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    data: ReportCommentSetup;
    tableConfig: UniTableConfig;
    comments: ReportComment[];

    constructor(private http: UniHttp, private errorService: ErrorService) {}

    ngOnInit() {
        this.tableConfig = this.createTableConfig();
        this.data = this.options.data;
        this.comments = cloneDeep(this.data.comments);
    }

    runRequestsSequentially(requests, index, total) {
        if (index === total) {
            this.onClose.emit(true);
            return;
        } else if (index < total) {
            requests[index].subscribe(() => {
                this.runRequestsSequentially(requests, ++index, total);
            }, (err) => this.errorService.handle(err));
            return;
        } else {
            this.errorService.handle('An error on reportComments.ts -> runRequestsSequentially.');
        }
    }

    save() {
        // Allow blur from submit click to trigger change event in table before saving
        setTimeout(() => {
            const changedComments = this.comments.filter(comment => comment['_isDirty']);

            if (!changedComments.length) {
                this.onClose.emit(false);
                return;
            }

            const requests = changedComments.map(comment => {
                const request = comment.ID > 0
                    ? this.putComment(comment)
                    : this.postComment(comment);

                // Update ID and dirty state on success. So that if another request errors the
                // forkJoin the already saved comments wont be saved again on next submit.
                return request.pipe(tap(res => {
                    comment['_isDirty'] = false;
                    if (res.ID && !comment.ID) {
                        comment.ID = res.ID;
                    }
                }));
            });
            this.runRequestsSequentially(requests, 0, requests.length);
        });
    }

    private postComment(comment: ReportComment): Observable<ReportComment> {
        const companyKey = this.data.config.companyKey;
        const route = `comments/${this.data.config.entity}/${this.data.config.id}`;
        if (companyKey) { this.http.appendHeaders({ CompanyKey: companyKey}); }
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withEndPoint(route)
            .withBody(comment)
            .send({}, undefined, !companyKey)
            .map(response => response.body);
    }

    private putComment(comment: ReportComment): Observable<ReportComment> {
        const companyKey = this.data.config.companyKey;
        const route = `comments/${comment.ID}`;
        if (companyKey) { this.http.appendHeaders({ CompanyKey: companyKey}); }
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withEndPoint(route)
            .withBody(comment)
            .send({}, undefined, !companyKey)
            .map(response => response.body);
    }

    private createTableConfig(): UniTableConfig {
        return new UniTableConfig('reportparams.commenteditor', true)
            .setDeleteButton(true)
            .setColumns([
                new UniTableColumn('ID', 'ID')
                    .setEditable(false)
                    .setWidth('5rem', false)
                    .setVisible(false),
                new UniTableColumn('Text', 'Kommentar')
            ]);
    }
}
