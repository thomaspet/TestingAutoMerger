import {Component, OnInit, Output, EventEmitter, keyframes} from '@angular/core';
import {ApiKey} from '@uni-entities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniComponentLayout, LayoutBuilder, FieldSize, UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {ApiKeyService, ErrorService} from '@app/services/services';

@Component({
    selector: 'apikeyline',
    templateUrl: './apikeyline.html'
})
export class ApikeyLine implements OnInit {
    @Output() private keySaved: EventEmitter<any> = new EventEmitter<any>();

    public busy: boolean;
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private apikeyLine$: BehaviorSubject<ApiKey> = new BehaviorSubject(new ApiKey());
    public config$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private apikeyService: ApiKeyService,
        private errorService: ErrorService,
        private layoutBuilder: LayoutBuilder
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

        this.fields$.next([
            descField,
            urlField,
            keyField,
            typeField
        ]);
    }
}
