import {Component, Input, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';

import {IUniWidget} from '../uniWidget';
import {ApiKeyService, TravelService, ErrorService} from '@app/services/services';
import {ApiKey, TypeOfIntegration} from '@uni-entities';
import {WidgetDataService} from '@app/components/widgets/widgetDataService';

interface IIntegrationConfig {
    label: string;
    icon: string;
    desciption: string;
}
@Component({
    selector: 'uni-integration-counter-widget',
    template: `
        <div class="sum_widget" [ngClass]="widget.config.class" (click)="onClickNavigate()">
            <div class="numbers-section">
                <div class="header">{{(config$ | async)?.label}}</div>
                <div>{{count$ | async}}</div>
            </div>

            <i class="material-icons-outlined">{{ widget.config.icon }}</i>
        </div>
    `
})
export class UniIntegrationCounterWidget {
    @Input() public widget: IUniWidget;

    public count$: BehaviorSubject<number> = new BehaviorSubject(null);
    public config$: BehaviorSubject<IIntegrationConfig> = new BehaviorSubject(null);

    constructor(
        private apiKeyService: ApiKeyService,
        private travelService: TravelService,
        private errorService: ErrorService,
        private router: Router,
        private widgetDataService: WidgetDataService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        if (!this.widget) {
            return;
        }

        this.getData(this.widget);
        this.config$.next(this.getConfig(this.widget.config.type));
    }

    private getData(widget: IUniWidget) {
        this.apiKeyService
            .getApiKey(widget.config.type)
            .do(key => {
                if (!key) {
                    this.count$.next(0);
                }
            })
            .filter(key => !!key)
            .switchMap(key => this.beforeCount(key, widget))
            .switchMap(() => this.widgetDataService.getData(this.getDataEndpoint(widget.config.type)))
            .map(res => res.Data[0])
            .map(res => {
                const valueKey = this.getValueKey(widget.config.type);
                if (valueKey) {
                    return res[valueKey];
                } else if (typeof res === 'number') {
                    return res;
                }
                return 0;
            })
            .subscribe(
                count => this.count$.next(count),
                () => {},
            );
    }

    private beforeCount(apiKey: ApiKey, widget: IUniWidget): Observable<any> {
        if (!apiKey || !widget) {
            return Observable.of(null);
        }
        switch (apiKey.IntegrationType) {
            case TypeOfIntegration.TravelAndExpenses:
                return this.travelService.ttImport(apiKey);
            default:
                return Observable.of(null);
        }
    }

    private getConfig(integrationType: TypeOfIntegration): IIntegrationConfig {
        return {
            label: this.getLabel(integrationType),
            icon: this.getIcon(integrationType),
            desciption: this.getDescription(integrationType)
        };
    }

    private getLink(integrationType: TypeOfIntegration): string {
        switch (integrationType) {
            case TypeOfIntegration.TravelAndExpenses:
                return '/salary/travels';
            default:
                return '/';
        }
    }

    private getLabel(integrationType: TypeOfIntegration): string {
        switch (integrationType) {
            case TypeOfIntegration.TravelAndExpenses:
                return 'Reiser';
            default:
                return '';
        }
    }

    private getDescription(integrationType: TypeOfIntegration): string {
        switch (integrationType) {
            case TypeOfIntegration.TravelAndExpenses:
                return 'Reiser';
            default:
                return '';
        }
    }

    private getIcon(integrationType: TypeOfIntegration): string {
        switch (integrationType) {
            case TypeOfIntegration.TravelAndExpenses:
                return 'travel';
            default:
                return '';
        }
    }

    private getDataEndpoint(integrationType: TypeOfIntegration): string {
        switch (integrationType) {
            case TypeOfIntegration.TravelAndExpenses:
                return '/api/statistics?model=Travel&select=count(ID) as Count&filter=State eq 0';
            default:
                return '';
        }
    }

    private getValueKey(integrationType: TypeOfIntegration): string {
        switch (integrationType) {
            case TypeOfIntegration.TravelAndExpenses:
                return 'Count';
            default:
                return '';
        }
    }

    public onClickNavigate() {
        if (!this.widget._editMode) {
            this.router.navigateByUrl(this.getLink(this.widget.config.type));
        }
    }
}
