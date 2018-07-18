import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StatisticsService} from '../statisticsService';
import {ErrorService} from '../errorService';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';

const MAX_RESULTS = 50;

@Injectable()
export class UniSearchDimensionConfig {

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {}

    public generateDimensionConfig(dimension: number, service): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.getDimensionQuery(searchTerm, dimension))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem) => {
                if (selectedItem.ID) {
                    return service.getCustomDimension(dimension, selectedItem.ID)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Nr.', 'Navn'],
            rowTemplateFn: item => [
                item.Number,
                item.Name
            ],
            inputTemplateFn: item => `${item.Number} - ${item.Name}`,
            maxResultsLength: MAX_RESULTS
        };
    }

    public generateProjectConfig(service: any): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.getProjectQuery(searchTerm))
                .catch(err => err),
            onSelect: (selectedItem) => {
                if (selectedItem.ID) {
                    return service.Get(selectedItem.ID)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Nr.', 'Navn'],
            rowTemplateFn: item => [
                item.ProjectNumber,
                item.Name
            ],
            inputTemplateFn: item => `${item.ProjectNumber} - ${item.Name}`,
            maxResultsLength: MAX_RESULTS
        };
    }

    public generateDepartmentConfig(service: any): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => this
                .statisticsService
                .GetAllUnwrapped(this.getDepartmentQuery(searchTerm))
                .catch(err => err),
            onSelect: (selectedItem) => {
                if (selectedItem.ID) {
                    return service.Get(selectedItem.ID)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Nr.', 'Navn'],
            rowTemplateFn: item => [
                item.DepartmentNumber,
                item.Name
            ],
            inputTemplateFn: item => `${item.DepartmentNumber} - ${item.Name}`,
            maxResultsLength: MAX_RESULTS
        };
    }

    private getProjectQuery(searchInput: string) {
        return `model=Project&select=ProjectNumber as ProjectNumber,Name as Name,ID as ID&` +
            `filter=contains(ProjectNumber, '${searchInput}') or contains(Name, '${searchInput}')`;
    }

    private getDepartmentQuery(searchInput: string) {
        return `model=Department&select=DepartmentNumber as DepartmentNumber,Name as Name,ID as ID&` +
            `filter=contains(DepartmentNumber, '${searchInput}') or contains(Name, '${searchInput}')`;
    }

    private getDimensionQuery(searchInput: string, dimension: number) {
        return `model=Dimension${dimension}&select=Number as Number,Name as Name,ID as ID&` +
            `filter=contains(Number, '${searchInput}') or contains(Name, '${searchInput}')`;
    }
}
