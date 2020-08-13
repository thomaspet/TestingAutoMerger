import {Component, EventEmitter, SimpleChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {ApiKey, FieldType, LocalDate, TypeOfIntegration} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ApiKeyService, ErrorService} from '@app/services/services';
import {THEMES, theme} from 'src/themes/theme';

enum ExternalType {
    none = 0,
    Traveltext = 1,
    TraveltextNew = 2,
    SRReise = 3,
}

@Component({
    selector: 'apikey-line-modal',
    templateUrl: './apikey-modal.html'
})
export class ApikeyLineModal implements IUniModal {
    options: IModalOptions;
    onClose = new EventEmitter<boolean>();

    busy: boolean;
    fields$ = new BehaviorSubject(this.getFormFields());
    model$ = new BehaviorSubject(<ApiKey> {});

    constructor(
        private apikeyService: ApiKeyService,
        private errorService: ErrorService
    ) {}

    save() {
        const data = this.model$.getValue();
        const request = data.ID
            ? this.apikeyService.Put(data.ID, data)
            : this.apikeyService.Post(data);

        this.busy = true;
        request.pipe(
            switchMap((savedKey: ApiKey) => this.apikeyService.setIntegrationKey(savedKey.ID, data.IntegrationKey))
        ).subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    onFormChange(event: SimpleChanges) {
        if (event['_ExternalSystem']) {
            this.model$.next(this.setSystemDefaultData(this.model$.getValue()));
        }
    }

    private setSystemDefaultData(model: ApiKey): ApiKey {
        switch (model['_ExternalSystem']) {
            case ExternalType.Traveltext:
            case ExternalType.TraveltextNew:
                const url = model['_ExternalSystem'] === ExternalType.Traveltext
                    ? 'https://traveltext.no/api/v1'
                    : 'https://backend.traveltext.no/api/v1';

                return <ApiKey> {
                    Description: 'TravelText reiseregning',
                    Url: url,
                    IntegrationKey: model.IntegrationKey,
                    IntegrationType: TypeOfIntegration.TravelAndExpenses,
                    FilterDate: new LocalDate(),
                };
            case ExternalType.SRReise:
                return <ApiKey> {
                    Description: 'Reiseregning SR-Reise',
                    Url: 'https://sb1-backend.traveltext.no/api/v1',
                    IntegrationKey: model.IntegrationKey,
                    IntegrationType: TypeOfIntegration.TravelAndExpenses,
                    FilterDate: new LocalDate(),
                };
            default:
                return model;
        }
    }

    private getFormFields() {
        // These options should probably be somewhere on the API
        const externalSystemOptions = [{ ID: ExternalType.none, Name: '' }];
        if (theme.theme === THEMES.SR) {
            externalSystemOptions.push({ ID: ExternalType.SRReise, Name: 'SR-Reise' });
        } else {
            externalSystemOptions.push(...[
                { ID: ExternalType.Traveltext, Name: 'Traveltext' },
                { ID: ExternalType.TraveltextNew, Name: 'Traveltext (ny)' }
            ]);
        }

        return [
            {
                Property: '_ExternalSystem',
                Label: 'Eksternt system',
                FieldType: FieldType.DROPDOWN,
                Options: {
                    source: externalSystemOptions,
                    displayProperty: 'Name',
                    valueProperty: 'ID'
                }
            },
            {
                Property: 'Description',
                Label: 'Beskrivelse',
                FieldType: FieldType.TEXT
            },
            {
                Property: 'Url',
                Label: 'Url',
                FieldType: FieldType.TEXT
            },
            {
                Property: 'IntegrationKey',
                Label: 'Nøkkel',
                FieldType: FieldType.TEXT
            },
            {
                Property: 'IntegrationType',
                Label: 'Type',
                FieldType: FieldType.DROPDOWN,
                Options: {
                    source: this.apikeyService.getIntegrationTypes(),
                    displayProperty: 'Name',
                    valueProperty: 'ID'
                }
            },
            {
                Property: 'FilterDate',
                Label: 'Godkjent fra og med',
                FieldType: FieldType.LOCAL_DATE_PICKER
            }
        ];
    }
}
