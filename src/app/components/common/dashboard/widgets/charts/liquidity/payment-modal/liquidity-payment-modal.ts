import {Component, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CustomLiquidityPayment, CustomLiquidityPaymentInterval} from '@uni-entities';
import {ErrorService} from '@app/services/services';
import * as moment from 'moment';

interface EditPaymentModel extends Partial<CustomLiquidityPayment> {
    _date?: Date;
}

@Component({
    selector: 'liquidity-payment-modal',
    templateUrl: './liquidity-payment-modal.html',
    styleUrls: ['./liquidity-payment-modal.sass']
})
export class LiquidityPaymentModal {
    onClose = new EventEmitter<boolean>();

    busy = true;
    dirty = false;

    payments: CustomLiquidityPayment[];

    editMode = false;
    editModel: EditPaymentModel;

    constructor(
        private http: HttpClient,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.http.get<CustomLiquidityPayment[]>('/api/biz/liquiditypayment').subscribe(
            payments => {
                this.payments = payments;
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    startEdit(payment?: CustomLiquidityPayment) {
        this.editModel = payment || {
            Amount: 50,
            IsCustomerPayment: true,
            Description: 'Test',
            CustomLiquidityPaymentType: CustomLiquidityPaymentInterval.OneTime,
        };

        this.editModel._date = payment?.DueDate
            ? new Date(<any> payment.DueDate)
            : moment().add(1, 'day').toDate();

        this.editMode = true;
    }

    savePayment() {
        if (this.editModel) {
            this.editModel.DueDate = <any> moment(this.editModel._date).format('YYYY-MM-DD');

            const request = this.editModel.ID
                ? this.http.put(`/api/biz/liquiditypayment/${this.editModel.ID}`, this.editModel)
                : this.http.post('/api/biz/liquiditypayment', this.editModel);

            this.busy = true;
            request.subscribe(
                (res: CustomLiquidityPayment) => {
                    const index = this.payments.findIndex(p => p.ID === res.ID);
                    if (index >= 0) {
                        this.payments[index] = res;
                    } else {
                        this.payments.push(res);
                    }

                    this.editMode = false;
                    this.dirty = true;
                    this.busy = false;
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }

    }

    deletePayment(payment) {
        this.busy = true;
        this.http.delete(`/api/biz/liquiditypayment/${payment.ID}`).subscribe(
            () => {
                this.payments = this.payments.filter(p => p.ID !== payment.ID);
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    // Called by modalService when closing on backdrop clicks etc.
    // Make sure we emit dirty state here, so the host component know when to refresh the data.
    forceCloseValueResolver() {
        return this.dirty;
    }
}
