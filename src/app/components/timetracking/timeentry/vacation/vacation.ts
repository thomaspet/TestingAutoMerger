import {Component, Input, Output, EventEmitter} from '@angular/core';
import {WorkerService} from '../../../../services/timetracking/workerService';
import {WorkTimeOff} from '../../../../unientities';
import {ErrorService} from '../../../../services/services';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {EditVacationModal} from './edit-vacation-modal';
import {UniModalService} from '@uni-framework/uni-modal';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType
} from '@uni-framework/ui/unitable/index';
import { IContextMenuItem } from '@app/components/common/toolbar/toolbar';

@Component({
    selector: 'vacation',
    templateUrl: './vacation.html',
})
export class View {
    @Input()
    public set workrelationid(id: number) {
        this.parentId = id;
        this.loadList();
    }

    @Output()
    public saved: EventEmitter<any> = new EventEmitter();

    items: Array<WorkTimeOff> = [];
    uniTableConfig: UniTableConfig;
    parentId: number = 0;

    constructor(
        private workerService: WorkerService,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private toastService: ToastService
    ) { }

    public ngOnInit() {
        this.setUpTable();
    }

    private loadList() {
        if (this.parentId) {
            this.workerService.get<WorkTimeOff>('worktimeoff',
                { filter: `workrelationid eq ${this.parentId}`, top: 30, orderBy: 'todate desc' })
            .subscribe( (items: any) => {
                this.items = items;
            }, err => this.errorService.handle(err));
        } else {
            this.items.length = 0;
        }
    }

    openEditModal(item: any = null) {
        const config = {
            data: { item: item, workRelationID: this.parentId },
            header: !item ? 'Ny ferie' : 'Rediger ferie',
            message: ''
        };

        this.modalService.open(EditVacationModal, config).onClose.subscribe((response) => {
            if (response) {
                this.saved.emit();
                this.loadList();
            }
        }, err => this.toastService.addToast('Noe gikk galt', ToastType.bad, 8, 'Kunne ikke slette ferie'));
    }

    deleteVacation(item) {
        this.workerService.deleteTimeOff(item.ID).subscribe(res => {
            this.saved.emit();
            this.loadList();
            this.toastService.addToast('Ferie slettet', ToastType.good, 5);
        }, err => this.toastService.addToast('Noe gikk galt', ToastType.bad, 8, 'Kunne ikke slette ferie'));
    }

    private setUpTable() {
        const cols = [
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text ),
            new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate),
            new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate)
        ];

        const contextMenu: IContextMenuItem[] = [
            { label: 'Rediger ferie', action: (item) => this.openEditModal(item) },
            { label: 'Slett ferie', action: (item) => this.deleteVacation(item) }
        ];

        this.uniTableConfig = new UniTableConfig('', false, false)
            .setColumns(cols)
            .setAutoAddNewRow(false)
            .setContextMenu(contextMenu)
            .setMultiRowSelect(false);
    }

}
