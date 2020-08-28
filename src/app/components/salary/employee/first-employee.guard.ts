import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { StatisticsService, SubEntityService, ErrorService } from '@app/services/services';
import { switchMap, map, catchError } from 'rxjs/operators';
import { SubEntity } from '@uni-entities';

@Injectable()
export class FirstEmployeeGuard implements CanActivate {
    constructor(
        private statisticsService: StatisticsService,
        private subEntityService: SubEntityService,
        private errorService: ErrorService,
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean>  {
        return this.statisticsService
            .GetAllUnwrapped('select=count(id) as count&model=Employee')
            .pipe(
                switchMap((data: any[]) => !!data[0]?.count
                    ? of(true)
                    : this.handleSubEntityImport()
                ),
                catchError(err => {
                    this.errorService.handle(err);
                    return of(false);
                })
            );
    }

    private handleSubEntityImport(): Observable<boolean> {
        return this.statisticsService
            .GetAllUnwrapped(`select=OrgNumber as OrgNumber,SuperiorOrganizationID as SuperiorOrganizationID&model=SubEntity`)
            .pipe(
                switchMap((data: SubEntity[]) => data.length > 1
                    ? of(true)
                    : this.importMissingSubEntities(data.find(sub => !sub.SuperiorOrganizationID)?.OrgNumber)
                )
            );
    }

    private importMissingSubEntities(orgNumber: string): Observable<boolean> {
        if (!orgNumber) {
            return of(false);
        }
        return this.subEntityService
            .checkZonesAndSaveFromEnhetsregisteret(orgNumber)
            .pipe(
                map(subEntities => !!subEntities.length)
            );
    }
}
