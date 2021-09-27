import {Action} from 'redux';
import {
  convertOption, HoveringItem, PicObjWithBlob} from './type';

// define ActionTypes
const AppPrefix = '@@picpickdl/' as const;
const ActionTypes = {
  SET_URL: `${AppPrefix}SET_URL`,
  SET_SELECTED_ITEM: `${AppPrefix}SET_SELECTED_ITEM`,
  ADD_ITEMS: `${AppPrefix}ADD_ITEMS`,
  RENAME_FILE: `${AppPrefix}RENAME_FILE`,
  ADD_BAD_URIS: `${AppPrefix}ADD_BAD_URIS`,
  CHANGE_PASSWORD: `${AppPrefix}CHANGE_PASSWORD`,
  CLEAR_BLOBURI: `${AppPrefix}CLEAR_BLOBURI`,
  GEN_ZIP: `${AppPrefix}GEN_ZIP`,
  REQUEST_GEN_ZIP: `${AppPrefix}REQUEST_GEN_ZIP`,
  RESPONSE_GEN_ZIP: `${AppPrefix}RESPONSE_GEN_ZIP`,
  SET_HOVER_ITEM: `${AppPrefix}SET_HOVER_ITEM`,
  CHANGE_THEME: `${AppPrefix}CHANGE_THEME`,
} as const;

// define Action & ActionGenerator

// SET_URL
interface setUrlAction extends Action {
  type: typeof ActionTypes.SET_URL,
  props: {url: string},
}
export const getSetUrlAction = (url: string):setUrlAction => ({
  type: ActionTypes.SET_URL,
  props: {url},
});

// SET_SELECTED_ITEM
interface setSelectedItemAction extends Action {
  type: typeof ActionTypes.SET_SELECTED_ITEM,
  props: {items: PicObjWithBlob[]},
}
export const getSetSelectedItemAction =
  (items: PicObjWithBlob[]):setSelectedItemAction => ({
    type: ActionTypes.SET_SELECTED_ITEM,
    props: {items},
  });

// ADD_ITEMS
interface addItemsAction extends Action {
  type: typeof ActionTypes.ADD_ITEMS,
  props: {items: PicObjWithBlob[]},
}
export const getAddItemsAction = (items: PicObjWithBlob[]):addItemsAction => ({
  type: ActionTypes.ADD_ITEMS,
  props: {items},
});

// RENAME_FILE
interface renameFileAction extends Action {
  type: typeof ActionTypes.RENAME_FILE,
  props: {uri: string, filename: string}[],
}
export const getRenameFileAction =
  (set: {uri: string, filename: string}[]):renameFileAction => ({
    type: ActionTypes.RENAME_FILE,
    props: set,
  });

// ADD_BAD_URIS
interface addBadURIs extends Action {
  type: typeof ActionTypes.ADD_BAD_URIS,
  props: {uris: string[]},
}
export const getAddBadURIsAction = (uris: string[]):addBadURIs => ({
  type: ActionTypes.ADD_BAD_URIS,
  props: {uris},
});

// CHANGE_PASSWORD
interface changePassword extends Action {
  type: typeof ActionTypes.CHANGE_PASSWORD,
  props: {password: string},
}
export const getChangePasswordAction = (password: string):changePassword => ({
  type: ActionTypes.CHANGE_PASSWORD,
  props: {password},
});

// CLEAR_BLOBURI
interface clearBlobURIAction extends Action {
  type: typeof ActionTypes.CLEAR_BLOBURI,
}
export const getClearBlobURIAction = ():clearBlobURIAction => ({
  type: ActionTypes.CLEAR_BLOBURI,
});

// GEN_ZIP
interface genZip extends Action {
  type: typeof ActionTypes.GEN_ZIP,
  props: {files: PicObjWithBlob[], mime: convertOption},
}
export const getGenZipAction =
  (files: PicObjWithBlob[], mime: convertOption):genZip => ({
    type: ActionTypes.GEN_ZIP,
    props: {files, mime},
  });

// REQUEST_GEN_ZIP
interface requestGenZip extends Action {
  type: typeof ActionTypes.REQUEST_GEN_ZIP,
}
export const getRequestGenZipAction = ():requestGenZip => ({
  type: ActionTypes.REQUEST_GEN_ZIP,
});

// RESPONSE_GEN_ZIP
interface responseGenZip extends Action {
  type: typeof ActionTypes.RESPONSE_GEN_ZIP,
  props: {uri: string},
}
export const getResponseGenZipAction = (uri: string):responseGenZip => ({
  type: ActionTypes.RESPONSE_GEN_ZIP,
  props: {uri},
});

// SET_HOVER_ITEM

interface setHoverItem extends Action {
  type: typeof ActionTypes.SET_HOVER_ITEM,
  props: HoveringItem | null,
}
export const getSetHoverItemAction =
  (item: HoveringItem | null):setHoverItem => ({
    type: ActionTypes.SET_HOVER_ITEM,
    props: item,
  });

// CHANGE_THEME
interface changeThemeAction extends Action {
  type: typeof ActionTypes.CHANGE_THEME,
  props: {themetype: 'dark'|'light'},
}
export const getChangeThemeAction =
  (themetype: 'dark'|'light'):changeThemeAction => ({
    type: ActionTypes.CHANGE_THEME,
    props: {themetype},
  });

// total
type AppActions =
  setUrlAction |
  setSelectedItemAction |
  addItemsAction |
  renameFileAction |
  addBadURIs |
  changePassword |
  genZip |
  clearBlobURIAction |
  requestGenZip |
  responseGenZip |
  setHoverItem |
  changeThemeAction;

// Saga

import {takeLatest, call, put, all, fork, select} from 'redux-saga/effects';
import {generateZipBlob} from './util/zipblob';
import {imgConverter} from './util/imgConverter';
import {changeExt, mime2ext} from './util/mime2ext';
import {blob2base64} from './util/blobutil';
import {storageAvailable} from './util/env';

// ZIP_DL_LINK
// eslint-disable-next-line require-jsdoc
function* genZipFile({props}: genZip) {
  yield put(getRequestGenZipAction());
  // convert
  const files: PicObjWithBlob[] = yield call((targets: PicObjWithBlob[]) =>
    Promise.all(targets.map(
        (x)=>(props.mime === '' ?
            Promise.resolve({
              ...x, filename: changeExt(x.filename, mime2ext(x.blob.type))}) :
            imgConverter(x, props.mime)))),
  props.files);

  // password
  const {password}:State = yield select();

  // genZip
  const zipBlob: Blob =
    yield call(generateZipBlob, files, 'generated_zip_file', password);
  const base64: string = yield call(blob2base64, zipBlob);
  yield put(getResponseGenZipAction(base64));
}
// eslint-disable-next-line require-jsdoc
function* watchGenZipFile() {
  yield takeLatest(ActionTypes.GEN_ZIP, genZipFile);
}

// eslint-disable-next-line require-jsdoc
export function* rootSaga() {
  yield all([
    fork(watchGenZipFile),
  ]);
}

// define state & reducer
export type State = {
  url: string;
  items: {[keyof: string]: PicObjWithBlob};
  selectedItems: PicObjWithBlob[];
  baduri: Set<string>;
  zip: null | 'loading' | {uri: string, generated: Date};
  password: string;
  hovering: HoveringItem | null;
  themetype: 'dark' | 'light';
};
export const initialState:State = {
  url: '',
  items: {},
  selectedItems: [],
  baduri: new Set(),
  zip: null,
  password: '',
  hovering: null,
  themetype:
    storageAvailable('localStorage') &&
      localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
};

export const reducer = (state=initialState, action: AppActions):State=>{
  switch (action.type) {
    case ActionTypes.SET_URL:
      return {
        ...state,
        url: action.props.url,
        selectedItems: [],
        items: {},
        baduri: new Set(Array.from(state.baduri)),
      };
    case ActionTypes.CLEAR_BLOBURI:
      return {
        ...state,
        zip: null,
      };
    case ActionTypes.SET_SELECTED_ITEM:
      return {
        ...state,
        selectedItems: action.props.items,
        zip: null,
      };
    case ActionTypes.ADD_ITEMS:
      return {
        ...state,
        items: Object.fromEntries([
          ...Object.entries(state.items),
          ...action.props.items.map((x)=>[x.uri, x]),
        ]),
        baduri: new Set(Array.from(state.baduri)),
      };
    case ActionTypes.RENAME_FILE:
      return {
        ...state,
        items: Object.fromEntries([
          ...Object.entries(state.items),
          ...action.props
              .flatMap<[string, PicObjWithBlob]>(({uri, filename})=>{
                const y = state.items[uri];
                return (y ? [[uri, {...y, filename}]] : []);
              }),
        ]),
      };
    case ActionTypes.ADD_BAD_URIS:
      return {
        ...state,
        baduri: new Set([...Array.from(state.baduri), ...action.props.uris]),
      };
    case ActionTypes.CHANGE_PASSWORD:
      return {
        ...state,
        password: action.props.password,
      };
    case ActionTypes.REQUEST_GEN_ZIP:
      return {
        ...state,
        zip: 'loading',
      };
    case ActionTypes.RESPONSE_GEN_ZIP:
      return {
        ...state,
        zip: {uri: action.props.uri, generated: new Date()},
      };
    case ActionTypes.SET_HOVER_ITEM:
      return {
        ...state,
        hovering: (action.props ? {...action.props} : null),
      };
    case ActionTypes.CHANGE_THEME:
      storageAvailable('localStorage') &&
        localStorage.setItem('theme', action.props.themetype);
      return {
        ...state,
        themetype: action.props.themetype,
      };
    default: return state;
  }
};
