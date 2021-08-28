import {Action} from 'redux';
import {convertOption, PicObjWithBlob} from './type';

// define ActionTypes
const AppPrefix = 'picpickdl/' as const;
const ActionTypes = {
  SET_URL: `${AppPrefix}SET_URL`,
  SET_SELECTED_ITEM: `${AppPrefix}SET_SELECTED_ITEM`,
  ADD_ITEM: `${AppPrefix}ADD_ITEM`,
  RENAME_FILE: `${AppPrefix}RENAME_FILE`,
  ADD_BAD_URI: `${AppPrefix}ADD_BAD_URI`,
  GEN_ZIP: `${AppPrefix}GEN_ZIP`,
  REQUEST_GEN_ZIP: `${AppPrefix}REQUEST_GEN_ZIP`,
  RESPONSE_GEN_ZIP: `${AppPrefix}RESPONSE_GEN_ZIP`,
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

// ADD_ITEM
interface addItemAction extends Action {
  type: typeof ActionTypes.ADD_ITEM,
  props: {item: PicObjWithBlob},
}
export const getAddItemAction = (item: PicObjWithBlob):addItemAction => ({
  type: ActionTypes.ADD_ITEM,
  props: {item},
});

// RENAME_FILE
interface renameFileAction extends Action {
  type: typeof ActionTypes.RENAME_FILE,
  props: {uri: string, filename: string},
}
export const getRenameFileAction =
  (uri: string, filename: string):renameFileAction => ({
    type: ActionTypes.RENAME_FILE,
    props: {uri, filename},
  });

// ADD_BAD_URI
interface addBadURI extends Action {
  type: typeof ActionTypes.ADD_BAD_URI,
  props: {uri: string},
}
export const getAddBadURIAction = (uri: string):addBadURI => ({
  type: ActionTypes.ADD_BAD_URI,
  props: {uri},
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


// total
type AppActions =
  setUrlAction |
  setSelectedItemAction |
  addItemAction |
  renameFileAction |
  addBadURI |
  requestGenZip |
  responseGenZip;

// Saga

import {takeLatest, call, put, all, fork} from 'redux-saga/effects';
import {generateZipBlob} from './util/zipblob';
import {imgConverter} from './util/imgConverter';

// ZIP_DL_LINK
// eslint-disable-next-line require-jsdoc
function* genZipFile({props}: genZip) {
  yield put(getRequestGenZipAction());
  // convert
  const files: PicObjWithBlob[] = yield call((targets: PicObjWithBlob[]) =>
    Promise.all(targets.map((x)=>imgConverter(x, props.mime))), props.files);

  // genZip
  const zipBlob: Blob =
    yield call(generateZipBlob, files, 'generated_zip_file');
  console.log('読んでない？');
  yield put(getResponseGenZipAction(URL.createObjectURL(zipBlob)));
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
};
export const initialState:State = {
  url: '',
  items: {},
  selectedItems: [],
  baduri: new Set(),
  zip: null,
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
    case ActionTypes.SET_SELECTED_ITEM:
      return {
        ...state,
        selectedItems: action.props.items,
        zip: null,
      };
    case ActionTypes.ADD_ITEM:
      return {
        ...state,
        items: {
          ...state.items,
          [action.props.item.uri]: {
            ...action.props.item,
          },
        },
        baduri: new Set(Array.from(state.baduri)),
      };
    case ActionTypes.RENAME_FILE:
      if (!state.items[action.props.uri]) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.props.uri]:
            {
              ...state.items[action.props.uri],
              filename: action.props.filename,
            },
        },
        baduri: new Set(Array.from(state.baduri)),
      };
    case ActionTypes.ADD_BAD_URI:
      return {
        ...state,
        baduri: new Set([...Array.from(state.baduri), action.props.uri]),
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
    default: return state;
  }
};
