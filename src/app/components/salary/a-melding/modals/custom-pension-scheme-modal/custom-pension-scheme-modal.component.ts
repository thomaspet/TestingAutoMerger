import { Component, OnInit, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { Observable, BehaviorSubject } from 'rxjs';
import { IPensionSchemeDto } from '@app/components/salary/a-melding/shared/service/pension-scheme.service';
import { CustomPensionSchemeService } from '@app/components/salary/a-melding/shared/service/custom-pension-scheme.service';
import { IAmeldingPeriod } from '@app/components/salary/a-melding/shared/service/a-melding.service';
import { switchMap, take, finalize, map } from 'rxjs/operators';
import { UniFieldLayout } from '@uni-framework/ui/uniform';
import { ErrorService } from '@app/services/services';

@Component({
    selector: 'uni-custom-pension-scheme-modal',
    templateUrl: './custom-pension-scheme-modal.component.html',
    styleUrls: ['./custom-pension-scheme-modal.component.sass']
})
export class CustomPensionSchemeModalComponent implements OnInit, IUniModal {

    onClose: EventEmitter<IPensionSchemeDto> = new EventEmitter();
    model$: BehaviorSubject<IPensionSchemeDto> = new BehaviorSubject(null);
    config$: BehaviorSubject<any> = new BehaviorSubject({autoFocus: true});
    fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    options?: IModalOptions;
    period: IAmeldingPeriod;
    busy: boolean;
    needSave: boolean;
    forceCloseValueResolver?: () => any = () => null;
    canDeactivate?: () => boolean | Observable<boolean> = () => !this.busy;

    constructor(
        private customPensionSchemeService: CustomPensionSchemeService,
        private errorService: ErrorService,
    ) { }

    ngOnInit(): void {
        this.period = this.options.data;
        this.model$.next(<IPensionSchemeDto>{
            year: this.period.year,
            month: this.period.month
        });
        this.fields$.next(this.customPensionSchemeService.getLayout());
    }

    onFormChange() {
        this.model$
            .pipe(
                take(1),
                map(model => !!(model?.identificator && model?.name)),
            )
            .subscribe(needSave => this.needSave = needSave);
    }

    saveAndClose() {
        this.busy = true;
        this.model$
            .pipe(
                take(1),
                switchMap(model => this.save(model)),
                finalize(() => this.busy = false),
            )
            .subscribe(
                model => this.close(model),
                err => this.errorService.handle(err),
            );
    }

    save(scheme: IPensionSchemeDto): Observable<IPensionSchemeDto> {
        return this.customPensionSchemeService.createCustomScheme(scheme);
    }

    close(scheme?: IPensionSchemeDto) {
        this.onClose.next(scheme);
    }

}
