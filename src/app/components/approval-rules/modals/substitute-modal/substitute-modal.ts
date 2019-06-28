import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ApprovalSubstitute, User, LocalDate} from '@uni-entities';
import {ErrorService, UserService, ApprovalSubstituteService} from '@app/services/services';
import * as moment from 'moment';

@Component({
    selector: 'substitute-modal',
    templateUrl: './substitute-modal.html',
    styleUrls: ['./substitute-modal.sass'],
    host: {class: 'uni-redesign'}
})
export class SubstituteModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose = new EventEmitter();

    users: User[];
    substitute: ApprovalSubstitute;
    busy: boolean = true;
    validationMessage: string;

    constructor(
        private userService: UserService,
        private errorService: ErrorService,
        private substituteService: ApprovalSubstituteService
    ) {}

    ngOnInit() {
        this.substitute = this.options.data || <ApprovalSubstitute> {};
        this.userService.GetAll().subscribe(
            res => {
                this.users = res || [];
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.onClose.emit();
            }
        );
    }

    validate(): boolean {
        this.validationMessage = '';

        if (
            !this.substitute.SubstituteUserID
            || !this.substitute.UserID
            || !this.substitute.FromDate
            || !this.substitute.ToDate
        ) {
            this.validationMessage = 'Alle felt må være fylt ut';
            return false;
        }

        if (moment(this.substitute.ToDate).isBefore(moment(this.substitute.FromDate))) {
            this.validationMessage = 'Fra dato må være før til dato';
            return false;
        }

        if (moment(this.substitute.ToDate).isBefore(moment())) {
            this.validationMessage = 'Til dato kan ikke være før dagens dato';
            return false;
        }

        return true;
    }

    save() {
        if (!this.validate()) {
            return;
        }

        if (this.substitute.FromDate) {
            this.substitute.FromDate = new LocalDate(<any> this.substitute.FromDate);
        }

        if (this.substitute.ToDate) {
            this.substitute.ToDate = new LocalDate(<any> this.substitute.ToDate);
        }

        const request = this.substitute.ID > 0
            ? this.substituteService.Put(this.substitute.ID, this.substitute)
            : this.substituteService.Post(this.substitute);

        this.busy = true;
        request.subscribe(
            res => this.onClose.emit(res),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }
}
