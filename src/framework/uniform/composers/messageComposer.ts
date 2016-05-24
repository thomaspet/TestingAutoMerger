import {UniFieldLayout} from '../unifieldlayout';
import {UniValidator} from '../validators';

/**
 * Compose an object of messages like:
 *
 *     {
 *         'messageID1': 'errroMessage1',
 *         'messageID2': 'errroMessage2',
 *         ...
 *     }
 */
export class MessageComposer {

    public static composeMessages(fieldConfig: UniFieldLayout) {
        let messages = {};
        MessageComposer.assignMessages(fieldConfig.AsyncValidators, messages);
        MessageComposer.assignMessages(fieldConfig.SyncValidators, messages);
        return messages;
    }

    private static assignMessages(validators: any[], messages: any) {
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator: any) => {
                var v = new UniValidator(validator);
                messages[v.ValidatorKey] = v.ErrorMessage;
            });
        }
    }
}
