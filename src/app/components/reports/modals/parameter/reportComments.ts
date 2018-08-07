import { Component, Input, Output, OnInit, AfterViewInit, EventEmitter } from '@angular/core';
import { ErrorService, StatisticsService } from '@app/services/services';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs/Observable';

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
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

            <article [attr.aria-busy]="busy" class="modal-content">
                <uni-table
                    [resource]="data?.comments"
                    [config]="tableConfig"
                    (rowDeleted)="onRowDeleted($event)">
                </uni-table>
            </article>

            <footer>
                <button *ngIf="options.buttonLabels.accept" class="good" id="good_button_ok" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>

                <button *ngIf="options.buttonLabels.reject" class="bad" (click)="reject()">
                    {{options.buttonLabels.reject}}
                </button>

                <button *ngIf="options.buttonLabels.cancel" class="cancel" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
                </button>
            </footer>
        </section>
    `
})
export class UniReportComments implements IUniModal, OnInit {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean = false;
    data: ReportCommentSetup;
    tableConfig: UniTableConfig;
    deleteList: ReportComment[] = [];

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
    ) { }


    ngOnInit() {
        this.tableConfig = this.createTableConfig();
        this.data = this.options.data;

        this.data.comments.forEach( x => x._state = undefined );
        this.deleteList = [];

        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Ok',
                cancel: 'Avbryt'
            };
        }
    }

    accept() {
        this.commitChanges().then( () => this.onClose.emit(ConfirmActions.ACCEPT) );
    }

    commitChanges(): Promise<boolean> {

        return new Promise( (resolve, reject) => {
            let todo = 0;
            let completed = 0;

            for (let i = 0; i < this.data.comments.length; i++) {
                const comment = this.data.comments[i];
                if (comment._state) {
                    todo++;
                    if (comment._state === 'new') {
                        this.postComment(comment).subscribe( x =>
                            this.putComment( { ID: x.ID, Text: comment.Text }).subscribe( y => {
                                    this.data.comments[i] = y;
                                    completed++;
                                    if (completed >= todo) { resolve(true); }
                                }));
                    } else {
                        this.putComment(comment).subscribe( x => {
                            this.data.comments[i] = x;
                            completed++;
                            if (completed >= todo) { resolve(true); }
                        });
                    }
                }
            }

            this.deleteList.forEach( x => {
                todo++;
                this.deleteComment(x).subscribe( () => {
                    completed++;
                    if (completed >= todo) { resolve(true); }
                });
            });

            if (todo === 0) {
                resolve(true);
            }

        });
    }

    private postComment(comment: ReportComment): Observable<ReportComment> {
        const http = this.statisticsService.GetHttp();
        const companyKey = this.data.config.companyKey;
        const route = `comments/${this.data.config.entity}/${this.data.config.id}`;
        if (companyKey) { http.appendHeaders({ CompanyKey: companyKey}); }
        return http
            .usingBusinessDomain()
            .asPOST()
            .withEndPoint(route)
            .withBody(comment)
            .send({}, undefined, !companyKey)
            .map(response => response.json());
    }

    private putComment(comment: ReportComment): Observable<ReportComment> {
        const http = this.statisticsService.GetHttp();
        const companyKey = this.data.config.companyKey;
        const route = `comments/${comment.ID}`;
        if (companyKey) { http.appendHeaders({ CompanyKey: companyKey}); }
        return http
            .usingBusinessDomain()
            .asPUT()
            .withEndPoint(route)
            .withBody(comment)
            .send({}, undefined, !companyKey)
            .map(response => response.json());
    }

    private deleteComment(comment: ReportComment): Observable<ReportComment> {
        const http = this.statisticsService.GetHttp();
        const companyKey = this.data.config.companyKey;
        const route = `comments/${comment.ID}`;
        if (companyKey) { http.appendHeaders({ CompanyKey: companyKey}); }
        return http
            .usingBusinessDomain()
            .asDELETE()
            .withEndPoint(route)
            .send({}, undefined, !companyKey)
            .map(response => comment);
    }

    cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

    private createTableConfig(): UniTableConfig {
        const cfg = new UniTableConfig('reportparams.commenteditor', true, true, 10);
        cfg.columns = [
            new UniTableColumn('ID', 'ID', UniTableColumnType.Number)
                .setVisible(false)
                .setWidth('3rem')
                .setEditable(false),

            new UniTableColumn('Text', 'Kommentar', UniTableColumnType.Text)
                .setWidth('80%')
                .setMaxLength(8000)

        ];
        cfg.deleteButton = true;
        cfg.autoAddNewRow = true;
        cfg.columnMenuVisible = true;
        cfg.setChangeCallback( x => this.onEditChange(x) );
        cfg.autoScrollIfNewCellCloseToBottom = true;

        return cfg;
    }

    public onEditChange(event) {
        const row: ReportComment = event.rowModel;
        if (event.originalIndex >= this.data.comments.length) {
            row._state = 'new';
            row['ID'] = undefined;
            this.data.comments.push(row);
        } else {
            row._state = row.ID ? 'updated' : row._state;
            this.data.comments[event.originalIndex] = row;
        }
        return row;
    }

    public onRowDeleted(event) {
        const rowIndex = event.rowModel ? event.rowModel._originalIndex : -1;
        if (rowIndex < 0 || rowIndex >= this.data.comments.length) {
            return;
        }
        const row: ReportComment = event.rowModel;
        if (row.ID) {
            this.deleteList.push(row);
        }
        this.data.comments.splice(rowIndex, 1);
    }
}
