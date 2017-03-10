import {type} from '../util';

export const ActionTypes = {
    RETRIEVE:                       type('[Language] Retrieve'),
    RETRIEVE_SUCCESS:               type('[Language] Retrieve success'),
    RETRIEVE_FAIL:                  type('[Language] Retrieve fail'),
    RETRIEVE_ONE:                   type('[Language] Retrieve one'),
    RETRIEVE_ONE_SUCCESS:           type('[Language] Retrieve one success'),
    RETRIEVE_ONE_FAIL:              type('[Language] Retrieve one fail'),
    CREATE:                         type('[Language] Create'),
    CREATE_SUCCESS:                 type('[Language] Create Success'),
    CREATE_FAIL:                    type('[Language] Create Fail'),
    UPDATE:                         type('[Language] Update'),
    UPDATE_SUCCESS:                 type('[Language] Update Success'),
    UPDATE_FAIL:                    type('[Language] Update Fail'),
    DELETE:                         type('[Language] Delete'),
    DELETE_SUCCESS:                 type('[Language] Delete Success'),
    DELETE_FAIL:                    type('[Language] Delete Fail'),
    ENABLE:                         type('[Language] Enable'),
    ENABLE_SUCCESS:                 type('[Language] Enable Success'),
    ENABLE_FAIL:                    type('[Language] Enable Fail'),
    DISABLE:                        type('[Language] Disable'),
    DISABLE_SUCCESS:                type('[Language] Disable Success'),
    DISABLE_FAIL:                   type('[Language] Disable Fail'),
    OPEN_LANGUAGE_MODAL:            type('[Language] Open Language Modal'),
    CLOSE_LANGUAGE_MODAL:           type('[Language] Close Language Modal'),
    OPEN_DELETE_LANGUAGE_MODAL:     type('[Language] Open Delete Language Modal'),
    CLOSE_DELETE_LANGUAGE_MODAL:    type('[Language] Close Delete Language Modal'),
    SET_CURRENT_LANGUAGE:           type('[Language] Set current language'),
};
