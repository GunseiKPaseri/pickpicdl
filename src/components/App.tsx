/*

// img Download
$('#dlbutton').on('click', async ()=>{
  let target = $('.imgchk:checked').map(function() {
    // eslint-disable-next-line no-invalid-this
    return $(this).parent().parent().attr('data-href');
  }).get().map((x)=>imglist[x]).flatMap((x) => (x.blob === null ? [] : [x]));

  if (target.length === 0) {
    $('#dllink').attr('href', '#');
    $('#dllink').text(`選択しなさい`);
    return;
  }

  const mime = $('#imgconvert').val();
  if (typeof mime === 'string' && mime !== '') {
    // convert
    const ext = mime2ext(mime);
    target = await Promise.all(target.map(async (x) => {
      if (x.blob.type === mime) return x;
      const image = await blobImg2imgelement(x.blob);
      const blob = await imgelement2blob(image, mime, 1);
      return {...x, filename: changeExt(x.filename, ext), blob};
    }));
  }
  const zipBlob = await generateZipBlob(target, 'archive.zip');
  const zipBase64 = await blob2base64(zipBlob);
  $('#dllink').attr('href', zipBase64);
  $('#dllink').text(`ダウンロード(${(new Date()).toString()})`);
});*/

import * as React from 'react';
import MaterialTable, {MTableToolbar} from 'material-table';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {convertOption, PicObjWithBlob} from '../type';
import {
  getClearBlobURIAction,
  //  getChangePasswordAction,
  getGenZipAction,
  getSetSelectedItemAction,
  State} from '../redux';
import {useTheme} from '@material-ui/core/styles';
import {useDispatch, useSelector} from 'react-redux';
import {
  Button,
  CircularProgress,
  MenuItem, Select} from '@material-ui/core';
import {
  GetApp as GetAppIcon,
  Archive as ArchiveIcon} from '@material-ui/icons';
// import {PasswordForm} from './PasswordForm';


const App = ():JSX.Element => {
  const theme = useTheme();
  // Redux State
  const list = useSelector<State, PicObjWithBlob[]>((state) =>
    Object.keys(state.items).map((key)=>state.items[key]));
  // const {selectedItems, zip, password} =
  const {selectedItems, zip} =
    useSelector<State, State>((state)=>state);
  const dispatch = useDispatch();
  // React State
  const [mime, setMime] = React.useState<convertOption>('default');
  const handleMIMESelectChange =
    (e: React.ChangeEvent<{value: unknown}>)=>{
      dispatch(getClearBlobURIAction());
      if (e.target.value ==='default' || e.target.value === 'image/png') {
        setMime(e.target.value);
      }
    };
  return (
    <>
      <MaterialTable options={{
        filtering: true,
        selection: true,
        showTitle: false,
        rowStyle: (rowData) => ({
          backgroundColor:
            rowData.tableData.checked ?
              lighten(theme.palette.secondary.light, 0.85) : '',
        }),
      }}
      components={{
        Toolbar: (props) => (
          <MTableToolbar {...props}>
          </MTableToolbar>
        ),
      }}
      onSelectionChange={(data) => dispatch(getSetSelectedItemAction(data))}
      columns={[
        {
          title: '画像',
          render: (rowData) =>
            <img src={rowData.uri} style={{maxWidth: 50, maxHeight: 50}} />,
          editable: 'never',
        },
        {
          title: 'URI',
          field: 'uri',
          render: (rowData)=><input type='url' value={rowData.uri} readOnly />,
          editable: 'never',
        },
        {
          title: 'ファイル名',
          field: 'filename',
          render: (rowData)=>rowData.filename.slice(-15),
        },
        {title: 'リソース', field: 'from', editable: 'never'},
      ]}
      data={list} />
      <Button disabled={zip!==null || selectedItems.length === 0}
        startIcon={zip==='loading' ? undefined : <ArchiveIcon />}
        onClick={zip===null && selectedItems.length>0 ? ()=>{
          dispatch(getGenZipAction(selectedItems, mime));
        } : undefined}>
        {zip==='loading' ? <CircularProgress /> : '生成' }
      </Button>
      <Select value={mime} onChange={handleMIMESelectChange}>
        <MenuItem value={'default'}>変換なし</MenuItem>
        <MenuItem value={'image/png'}>Pngに変換</MenuItem>
      </Select>
      {/*
      // まだパスワード付きはできないっぽい（結構最近に動きがあったからワンチャン）
      <PasswordForm password={password}
        handleChange={(p: string) => dispatch(getChangePasswordAction(p))}/>
      */}
      {
        zip===null || zip ==='loading' ? <></>:
        <a href = {zip.uri} download style={{textDecoration: 'none'}}>
          <Button startIcon={<GetAppIcon />}>
            ダウンロード({zip.generated.toLocaleString('ja-JP')})
          </Button>
        </a>
      }
    </>
  );
};

export default App;
