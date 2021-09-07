import * as React from 'react';
import {convertOption} from '../type';
import {
  getClearBlobURIAction,
  //  getChangePasswordAction,
  getGenZipAction,
  getRenameFileAction,
  State} from '../redux';
import {alpha, makeStyles, useTheme} from '@material-ui/core/styles';
import {useDispatch, useSelector} from 'react-redux';
import {
  AppBar,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem, Select, TextField, Toolbar, Tooltip, Typography} from '@material-ui/core';
import {
  GetApp as GetAppIcon,
  Archive as ArchiveIcon,
  Label,
  CodeSharp} from '@material-ui/icons';
import ImgTable from './ImgTable';
import {ImgViewer} from './ImgViewer';
import {Icon} from '@iconify/react';
import formTextboxIcon from '@iconify/icons-mdi/form-textbox';
import { theme } from 'webextension-polyfill';
import { renamer } from '../util/renamer';
// import {PasswordForm} from './PasswordForm';

const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.toolbar,
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  textField: {
    'color': theme.palette.common.white,
    '&:before': {
      borderColor: theme.palette.common.white,
    },
    '&:after': {
      borderColor: theme.palette.common.white,
    },
  },
  label: {
    'color': theme.palette.common.white,
  },
  select: {
    'color': theme.palette.common.white,
    'borderRadius': theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.black, 0.1),
    },
    '&:before': {
      borderColor: theme.palette.common.white,
    },
    '&:after': {
      borderColor: theme.palette.common.white,
    },
  },
}));

const App = ():JSX.Element => {
  const classes = useStyles();
  // const {selectedItems, zip, password} =
  const {selectedItems, zip, hovering} =
    useSelector<State, State>((state)=>state);
  const dispatch = useDispatch();
  const theme = useTheme();
  // React State
  const [mime, setMime] = React.useState<convertOption>('');
  const [rename, setRename] = React.useState<string>('');
  const handleMIMESelectChange =
    (e: React.ChangeEvent<{value: unknown}>)=>{
      dispatch(getClearBlobURIAction());
      if (e.target.value ==='' || e.target.value === 'image/png') {
        setMime(e.target.value);
      }
    };
  return (
    <>
      <AppBar position='fixed'>
        <Toolbar>
          <Typography className={classes.title} variant='h6' noWrap>
            💟PicPickDL
          </Typography>
          <Tooltip title={selectedItems.length>0 ? '名前を変更' : ''}>
            <IconButton color='inherit'
              disabled={selectedItems.length === 0}
              onClick={selectedItems.length>0 ? ()=>{
                const x = renamer(rename, selectedItems);
                dispatch(getRenameFileAction(x));
              } : undefined}>
              <Icon
                icon={formTextboxIcon}
                color={
                  selectedItems.length === 0 ?
                    undefined :
                    theme.palette.common.white}
              />
            </IconButton>
          </Tooltip>
          <TextField className={classes.textField}
            label='ファイル名'
            value={rename}
            onChange={(e)=>{
              setRename(e.target.value);
            }} />
          <Tooltip title={zip===null && selectedItems.length>0 ? '生成' : ''}>
            <IconButton color='inherit'
              disabled={zip!==null || selectedItems.length === 0}
              onClick={zip===null && selectedItems.length>0 ? ()=>{
                dispatch(getGenZipAction(selectedItems, mime));
              } : undefined}>
              {zip==='loading' ?
                <CircularProgress color='inherit' /> : <ArchiveIcon /> }
            </IconButton>
          </Tooltip>
          <FormControl className={classes.formControl}>
            <InputLabel
              htmlFor='converter-option'
              className={classes.label}>
                形式変換
            </InputLabel>
            <Select
              id='converter-option'
              value={mime}
              onChange={handleMIMESelectChange}
              className={classes.select}>
              <MenuItem value=''>変換なし</MenuItem>
              <MenuItem value='image/png'>Pngに変換</MenuItem>
            </Select>
          </FormControl>
          {/*
          // まだパスワード付きはできないっぽい（結構最近に動きがあったからワンチャン）
          <PasswordForm password={password}
            handleChange={(p: string) => dispatch(getChangePasswordAction(p))}/>
          */}
          {
            zip===null || zip ==='loading' ? <></>:
            <Link
              color='inherit'
              href={zip.uri}
              download
              underline='none'>
              <Button color='inherit' startIcon={<GetAppIcon />}>
                ダウンロード({zip.generated.toLocaleString('ja-JP')})
              </Button>
            </Link>
          }
        </Toolbar>
      </AppBar>
      <div className={classes.offset} />
      <ImgTable />
      {hovering && <ImgViewer />}
    </>
  );
};

export default App;
