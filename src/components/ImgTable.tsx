import MaterialTable, {Action, Column} from 'material-table';
import React, {CSSProperties} from 'react';
import {alpha} from '@material-ui/core/styles/colorManipulator';
import {TextField, useTheme} from '@material-ui/core';
import {CenterFocusWeak as CenterFocusWeakIcon} from '@material-ui/icons';
import {useDispatch, useSelector} from 'react-redux';
import {
  getRenameFileAction,
  getSetHoverItemAction,
  getSetSelectedItemAction,
  State,
} from '../redux';
import {PicObjWithBlob} from '../type';
import {selectElementCommand} from '../panel';
import {RegexFilter, regexFilterFunction} from './RegexFilter';
import browser from 'webextension-polyfill';

const ImgStyle:CSSProperties = {
  objectFit: 'contain',
  width: 56,
  height: 56,
  background: `
    linear-gradient(
      45deg, #9e9e9e 25%, transparent 25%, transparent 75%, #9e9e9e 75%),
    linear-gradient(
      45deg, #9e9e9e 25%, transparent 25%, transparent 75%, #9e9e9e 75%)
  `,
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 8px 8px',
  backgroundColor: '#e0e0e0',
};

const ImgTable = ():JSX.Element => {
  const theme = useTheme();
  // Redux State
  const {items, themetype} = useSelector<State, State>((state) => state);
  const list = Object.keys(items).map((key)=>items[key]);
  const [columnObject] = React.useState<Column<PicObjWithBlob>[]>([
    {
      title: browser.i18n.getMessage('IMAGE'),
      render: (rowData) =>
        <img
          src={rowData.uri}
          style={ImgStyle}
          onMouseEnter={(e) => {
            const t = e.target as HTMLImageElement;
            const {left, top} = t.getBoundingClientRect();
            dispatch(getSetHoverItemAction({
              src: rowData.uri,
              left: window.pageXOffset + left + t.clientWidth,
              top: window.pageYOffset + top + t.clientHeight/2,
            }));
          }}
          onMouseLeave={(e) => {
            dispatch(getSetHoverItemAction(null));
          }}
        />,
      editable: 'never',
    },
    {
      title: 'URI',
      field: 'uri',
      render: (rowData)=>
        <TextField
          type='url'
          value={rowData.uri}
          size='small'
          InputProps={{readOnly: true}} />,
      editable: 'never',
      filterComponent: (props) =>
        <RegexFilter
          columnDef={props.columnDef}
          onFilterChange={props.onFilterChanged} />,
      customFilterAndSearch: regexFilterFunction,
    },
    {
      title: browser.i18n.getMessage('FILENAME'),
      field: 'filename',
      render: (rowData) =><TextField
        defaultValue={rowData.filename}
        onBlur={(e)=>{
          dispatch(getRenameFileAction(
              [{uri: rowData.uri, filename: e.target.value}]));
        }}/>,
      filterComponent: (props) =>
        <RegexFilter
          columnDef={props.columnDef}
          onFilterChange={props.onFilterChanged} />,
      customFilterAndSearch: regexFilterFunction,
    },
    {
      title: browser.i18n.getMessage('RESOURCE'),
      field: 'treeinfo',
      editable: 'never',
      render: (rowData)=>
        (rowData.treeinfo.length > 30 ?
          '...'+rowData.treeinfo.slice(-30) : rowData.treeinfo),
      filterComponent: (props) =>
        <RegexFilter
          columnDef={props.columnDef}
          onFilterChange={props.onFilterChanged} />,
      customFilterAndSearch: regexFilterFunction,
    },
  ]);

  const actions: Action<PicObjWithBlob>[] = [{
    icon: () => <CenterFocusWeakIcon />,
    tooltip: browser.i18n.getMessage('FOCUS'),
    onClick: (e, rowDatas)=>{
      if (Array.isArray(rowDatas)) {
        //
      } else {
        selectElementCommand(rowDatas.selector);
      }
    },
    position: 'row',
  }];

  const dispatch = useDispatch();
  return (
    <MaterialTable options={{
      filtering: true,
      selection: true,
      showTitle: false,
      rowStyle: (rowData) => ({
        backgroundColor:
            rowData.tableData.checked ?
            alpha(themetype === 'dark' ?
                theme.palette.common.white :
                theme.palette.common.black, 0.25) : '',
      }),
    }}
    localization={{
      pagination: {
        firstTooltip: browser.i18n.getMessage('FirstPage'),
        previousTooltip: browser.i18n.getMessage('PreviousPage'),
        nextTooltip: browser.i18n.getMessage('NextPage'),
        lastTooltip: browser.i18n.getMessage('LastPage'),
        labelRowsSelect: browser.i18n.getMessage('rows'),
        labelDisplayedRows: browser.i18n.getMessage(
            'pagelabel', ['{from}', '{to}', '{count}']),
      },
      header: {actions: ''},
      toolbar: {
        nRowsSelected: browser.i18n.getMessage('selectLabel', '{0}'),
        searchTooltip: browser.i18n.getMessage('SEARCH'),
        searchPlaceholder: browser.i18n.getMessage('SEARCH'),
      },
      body: {
        emptyDataSourceMessage: browser.i18n.getMessage('NoRecordsToDisplay'),
      },
    }}
    onSelectionChange={(data) => dispatch(getSetSelectedItemAction(data))}
    columns={columnObject}
    data={list}
    actions={actions}/>
  );
};
export default ImgTable;
