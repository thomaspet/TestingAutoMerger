import {Component, OnInit, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {ApiKey, TypeOfIntegration, LocalDate} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import {UniComponentLayout, LayoutBuilder, FieldSize, UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {ApiKeyService, ErrorService} from '@app/services/services';

enum ExternalType {
    none = 0,
    Traveltext = 1,
    SRReise = 2,
}
@Component({
    selector: 'apikeyline',
    templateUrl: './apikeyline.html'
})
export class ApikeyLine implements OnInit {
    @Output() private keySaved: EventEmitter<any> = new EventEmitter<any>();

    public busy: boolean;
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public apikeyLine$: BehaviorSubject<ApiKey> = new BehaviorSubject(new ApiKey());
    public config$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private apikeyService: ApiKeyService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        this.createLayout();
    }

    public saveApikeyLine() {
        this.apikeyLine$
            .asObservable()
            .take(1)
            .do(() => this.busy = true)
            .finally(() => this.busy = false)
            .switchMap((apikeyline: ApiKey) => {
                return apikeyline.ID
                    ? this.apikeyService.Put(apikeyline.ID, apikeyline)
                    : this.apikeyService.Post(apikeyline);
            })
            .switchMap((savedKey) => this.apikeyService.setIntegrationKey(savedKey.ID, this.apikeyLine$.value.IntegrationKey))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(() => this.keySaved.emit(true));
    }

    private createLayout() {

        const templateField = new UniFieldLayout();
        templateField.Property = '_ExternalSystem';
        templateField.Label = 'Eksternt system';
        templateField.FieldType = FieldType.DROPDOWN;
        templateField.Options = {
            source: [
                {ID: ExternalType.none, Name: ''},
                {ID: ExternalType.Traveltext, Name: 'Traveltext'},
                {ID: ExternalType.SRReise, Name: 'SR-Reise'},
            ],
            displayProperty: 'Name',
            valueProperty: 'ID',
        };

        const descField = new UniFieldLayout();
        descField.Property = 'Description';
        descField.Label = 'Beskrivelse';
        descField.FieldType = FieldType.TEXT;

        const urlField = new UniFieldLayout();
        urlField.Property = 'Url';
        urlField.Label = 'Url';
        urlField.FieldType = FieldType.TEXT;

        const keyField = new UniFieldLayout();
        keyField.Property = 'IntegrationKey';
        keyField.Label = 'Nøkkel';
        keyField.FieldType = FieldType.TEXT;

        const typeField = new UniFieldLayout();
        typeField.Property = 'IntegrationType';
        typeField.Label = 'Type';
        typeField.FieldType = FieldType.DROPDOWN;
        typeField.Options = {
            source: this.apikeyService.getIntegrationTypes(),
            displayProperty: 'Name',
            valueProperty: 'ID'
        };

        const dateField = new UniFieldLayout();
        dateField.Property = 'FilterDate';
        dateField.Label = 'Godkjent fra og med';
        dateField.FieldType = FieldType.LOCAL_DATE_PICKER;

        this.fields$.next([
            templateField,
            descField,
            urlField,
            keyField,
            typeField,
            dateField,
        ]);
    }

    public formChange(event: SimpleChanges) {
        if (event['_ExternalSystem']) {
            this.apikeyLine$
                .take(1)
                .map(model => this.externalSystemDefaultData(model))
                .subscribe(model => this.apikeyLine$.next(model));
        }
    }

    private externalSystemDefaultData(model: ApiKey): ApiKey {
        switch (model['_ExternalSystem']) {
            case ExternalType.Traveltext:
                return <any>{
                    Description: 'TravelText reiseregning',
                    Url: 'https://traveltext.no/api/v1',
                    IntegrationKey: model.IntegrationKey,
                    IntegrationType: TypeOfIntegration.TravelAndExpenses,
                    FilterDate: new LocalDate(),
                };
            case ExternalType.SRReise:
                return <any> {
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
}
