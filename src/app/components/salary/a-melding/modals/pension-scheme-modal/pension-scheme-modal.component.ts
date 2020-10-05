import { Component, OnInit, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions, UniModalService } from '@uni-framework/uni-modal';
import { Observable, forkJoin } from 'rxjs';
import { PensionSchemeService, IPensionSchemeDto } from '@app/components/salary/a-melding/shared/service/pension-scheme.service';
import { UniTranslationService, ErrorService } from '@app/services/services';
import { AutocompleteOptions } from '@uni-framework/ui/autocomplete/autocomplete';
import { map, finalize } from 'rxjs/operators';
import { IAmeldingPeriod } from '@app/components/salary/a-melding/shared/service/a-melding.service';
import { CustomPensionSchemeModalComponent } from '@app/components/salary/a-melding/modals/custom-pension-scheme-modal/custom-pension-scheme-modal.component';
@Component({
    selector: 'uni-pension-scheme-modal',
    templateUrl: './pension-scheme-modal.component.html',
    styleUrls: ['./pension-scheme-modal.component.sass']
})
export class PensionSchemeModalComponent implements OnInit, IUniModal {
    onClose: EventEmitter<IPensionSchemeDto[]> = new EventEmitter();
    options?: IModalOptions;
    forceCloseValueResolver?: () => any;
    period: IAmeldingPeriod;
    pensionSchemes: IPensionSchemeDto[] = [];
    filteredPensionSchemes: IPensionSchemeDto[] = [];
    needSave: boolean;
    autocompleteOptions: AutocompleteOptions;
    busy: boolean;

    constructor(
        private pensionSchemeService: PensionSchemeService,
        private translationService: UniTranslationService,
        private errorService: ErrorService,
        private modalService: UniModalService,
    ) { }

    ngOnInit(): void {
        this.autocompleteOptions = this.getAutocompleteOptions();
        this.forceCloseValueResolver = () => this.pensionSchemes;

        this.period = this.options?.data;
        if (!this.period?.year || !this.period?.month) {
            this.onClose.emit([]);
        }
        this.pensionSchemeService
            .getSchemes(this.period.year, this.period.month)
            .subscribe(schemes => this.setSchemes(schemes));
    }

    addCustomScheme() {
        this.modalService
            .open(CustomPensionSchemeModalComponent, {
                data: this.period,
            })
            .onClose
            .subscribe(scheme => this.add(scheme));
    }

    add(scheme: IPensionSchemeDto) {
        if (!scheme?.identificator || this.pensionSchemes.some(p => p.identificator === scheme.identificator)) {
            return;
        }
        scheme.year = this.period.year;
        scheme.month = this.period.month;
        this.setSchemes([...this.pensionSchemes, scheme]);
    }

    remove(scheme: IPensionSchemeDto) {
        if (!scheme?.identificator || !this.pensionSchemes.some(p => p.identificator === scheme.identificator)) {
            return;
        }
        if (scheme.id) {
            scheme.deleted = true;
            this.setSchemes([...this.pensionSchemes.filter(p => p.id !== scheme.id), scheme]);
        } else {
            this.setSchemes(this.pensionSchemes.filter(p => p.identificator !== scheme.identificator));
        }
    }

    saveAndClose() {
        this.busy = true;
        forkJoin(
            this.pensionSchemeService.saveAllDtos(this.pensionSchemes.filter(p => !p.id)),
            this.pensionSchemeService.removeAllDtos(this.pensionSchemes.filter(p => p.deleted)),
        )
        .pipe(
            finalize(() => this.busy = false),
        )
        .subscribe(
            ([saved]: [IPensionSchemeDto[], any[]]) => this.close(
                [
                    ...this.pensionSchemes
                        .filter(p => !p.deleted && p.id),
                    ...saved,
                ]
            ),
            error => this.errorService.handle(error),
        );
    }

    close(schemes = this.pensionSchemes) {
        this.onClose.emit(schemes.filter(p => p.id));
    }

    onSelect(scheme: IPensionSchemeDto) {
        this.add(scheme);
    }

    private getAutocompleteOptions(): AutocompleteOptions {
        return {
            lookup: query => this.lookup(query),
            displayFunction: this.template,
            placeholder: this.translationService.translate('SALARY.PENSION_SCHEME.SEARCH_PLACEHOLDER'),
            autofocus: true,
            clearInputOnSelect: true,
        };
    }

    private lookup(query: string): Observable<IPensionSchemeDto[]> {
        return this.pensionSchemeService
            .search(query)
            .pipe(
                map(result => [
                    {name: this.translationService.translate('SALARY.PENSION_SCHEME.NO_DATA')},
                    ...result,
                ])
            );
    }

    private setSchemes(schemes: IPensionSchemeDto[]) {
        this.pensionSchemes = schemes;
        this.filteredPensionSchemes = schemes.filter(p => !p.deleted);
        this.needSave = schemes.some(s => !s.id || s.deleted);
    }

    private template(scheme: IPensionSchemeDto) {
        return !scheme?.identificator
            ? scheme?.name
            || '' : `${scheme.identificator} - ${scheme.name}`;
    }

}
