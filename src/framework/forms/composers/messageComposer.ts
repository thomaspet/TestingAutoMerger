import {UniFieldBuilder} from "./../builders/uniFieldBuilder";
export class MessageComposer {

    public static composeMessages(fieldConfig:UniFieldBuilder) {
        let messages = {};
        MessageComposer.assignMessages(fieldConfig.asyncValidators, messages);
        MessageComposer.assignMessages(fieldConfig.syncValidators, messages);
        return messages;
    }

    private static assignMessages(validators, messages){
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator:any)=> {
                messages[validator.name] = validator.message;
            });
        }
    }
}
