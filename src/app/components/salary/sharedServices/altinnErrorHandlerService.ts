import {Injectable} from '@angular/core';
import {AltinnReceipt} from '@uni-entities';

@Injectable()
export class AltinnErrorHandlerService {

    constructor() {}

    public generateError(receipt: AltinnReceipt): string {
        if (!receipt.ErrorText) {
            return '';
        }
        if (receipt.ErrorText !== 'An error occurred') {
            return 'Feilmelding fra Altinn: ' + receipt.ErrorText;
        }

        return ` Feilmelding fra Altinn: ${receipt.ErrorText}`
                + '\n Forslag:'
                + '\n\t 1. Sjekk at systempålogging stemmer'
                + '\n\t     (trykk "Test login" på innstillinger under Altinn)'
                + '\n'
                + '\n\t 2. Gå til innstillinger og sjekk at orgnr stemmer overens'
                + '\n\t     med Altinn systempålogging';
    }
}
