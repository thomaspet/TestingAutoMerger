import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniQueryDefinition} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';
import {IReference} from '../../models/iReference';

export class UniQueryDefinitionService extends BizHttp<UniQueryDefinition> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = UniQueryDefinition.RelativeUrl;
        this.DefaultOrderBy = null;
        this.entityType = UniQueryDefinition.EntityType;
    }

    public getReferenceByModuleId(moduleID: number): Observable<IReference[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?filter=ModuleID eq ${moduleID}&select=ID,Name`)
            .send()
            .map(response => response.json())
            .map(queryDefinitions =>
                queryDefinitions.map(queryDefinition => ({
                        id: queryDefinition.ID,
                        name: queryDefinition.Name
                    })
                )
            );
    }
}
