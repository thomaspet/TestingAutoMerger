import { Injectable } from '@angular/core';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
// import { PensionScheme } from '@uni-entities';
import { StatisticsService } from '@app/services/services';
import { map } from 'rxjs/operators';
import { Observable, forkJoin, of } from 'rxjs';
import { PensionScheme } from '@uni-entities';
export interface IPensionSchemeDto {
    identificator?: string;
    name: string;
    id?: number;
    deleted?: boolean;
    year?: number;
    month?: number;
}
@Injectable()
export class PensionSchemeService extends BizHttp<PensionScheme> {
    constructor(
        private statistics: StatisticsService,
        protected http: UniHttp
    ) {
        super(http);
        super.entityType = PensionScheme.EntityType;
        super.relativeURL = PensionScheme.RelativeUrl;
    }

    public saveAllDtos(schemes: IPensionSchemeDto[]): Observable<IPensionSchemeDto[]> {
        if (!schemes?.length) {
            return of([]);
        }
        return forkJoin(schemes.map(scheme => this.saveDto(scheme)));
    }

    public saveDto(scheme: IPensionSchemeDto): Observable<IPensionSchemeDto> {
        return (scheme.id
            ? super.Put(scheme.id, this.mapToBackendScheme(scheme))
            : super.Post(this.mapToBackendScheme(scheme)))
            .pipe(
                map(result => ({...scheme, id: result.ID})),
            );
    }

    public removeAllDtos(schemes: IPensionSchemeDto[]): Observable<IPensionSchemeDto[]> {
        if (!schemes?.length) {
            return of([]);
        }
        return forkJoin(schemes.map(scheme => super.Remove(scheme.id)));
    }

    public getNames(year: number, period: number) {
        return this.getSchemes(year, period)
            .pipe(
                map((schemes: IPensionSchemeDto[]) => this.toNames(schemes))
            );
    }

    public toNames(schemes: IPensionSchemeDto[]) {
        return schemes.map(scheme => scheme.name).join(', ');
    }

    public getSchemes(year: number, period: number): Observable<IPensionSchemeDto[]> {
        return forkJoin(
            this.getAllSchemes('StandardPensionSchemeSupplier', year, period),
            this.getAllSchemes('PensionSchemeSupplier', year, period)
        ).pipe(
            map((result) => result.reduce((acc, curr) => [...acc, ...curr], [])),
        );
    }

    private getAllSchemes(
        model: 'StandardPensionSchemeSupplier' | 'PensionSchemeSupplier',
        year: number,
        period: number,
    ) {
        return this.statistics
        .GetAllUnwrapped(
            `Select=ID as id,Identificator as identificator,${model}.Name as name` +
            `&filter=year eq ${year} and period eq ${period} and isnull(${model}.Name,'') ne ''` +
            `&model=PensionScheme` +
            `&join=PensionScheme.Identificator eq ${model}.Identificator`
        );
    }

    public search(query: string): Observable<IPensionSchemeDto[]> {
        return forkJoin(
            this.searchSuppliers(query, 'StandardPensionSchemeSupplier'),
            this.searchSuppliers(query, 'PensionSchemeSupplier'),
        )
        .pipe(
            map((result) => result.reduce((acc, curr) => [...acc, ...curr], [])),
        );
    }

    private searchSuppliers(
        query: string,
        model: 'StandardPensionSchemeSupplier' | 'PensionSchemeSupplier'
    ): Observable<IPensionSchemeDto[]> {
        return this.statistics
        .GetAllUnwrapped(
            `Select=Identificator as identificator,Name as name` +
            `&filter=startswith(Identificator,'${query}') or contains(Name,'${query}')` +
            `&model=${model}` +
            `&top=50`
        );
    }

    private mapToBackendScheme(scheme: IPensionSchemeDto): PensionScheme {
        return <PensionScheme>{
            ID: scheme.id,
            Identificator: scheme.identificator,
            Deleted: scheme.deleted,
            Year: scheme.year,
            Period: scheme.month,
        };
    }
}
