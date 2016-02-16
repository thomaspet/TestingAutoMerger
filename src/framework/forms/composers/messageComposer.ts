import {UniFieldBuilder} from "./../builders/uniFieldBuilder";

/**
 * Compose an object of messages like:
 *
 *     {
 *         "messageID1": "errroMessage1",
 *         "messageID2": "errroMessage2",
 *         ...
 *     }
 */
export class MessageComposer {

    public static composeMessages(fieldConfig: UniFieldBuilder) {
        let messages = {};
        MessageComposer.assignMessages(fieldConfig.asyncValidators, messages);
        MessageComposer.assignMessages(fieldConfig.syncValidators, messages);
        return messages;
    }

    private static assignMessages(validators: any[], messages: any) {
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator: any) => {
                messages[validator.name] = validator.message;
            });
        }
    }
}
