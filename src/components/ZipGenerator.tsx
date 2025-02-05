import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import browser from 'webextension-polyfill';
import {
  getClearBlobURIAction,
  //  getChangePasswordAction,
  getGenZipAction,
  State} from '../redux';
import {convertOption} from '../type';
import {
  GetApp as GetAppIcon,
  Archive as ArchiveIcon,
} from '@material-ui/icons';
import {
  alpha,
  makeStyles,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Tooltip} from '@material-ui/core';
import {genZipFileName} from '../util/renamer';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
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

export const ZipGenerator = () => {
  const classes = useStyles();
  const {zip, selectedItems} = useSelector<State, State>((state)=>state);
  const dispatch = useDispatch();
  // React State
  const [mime, setMime] = React.useState<convertOption>('');
  const handleMIMESelectChange =
    (e: React.ChangeEvent<{value: unknown}>)=>{
      dispatch(getClearBlobURIAction());
      if (e.target.value ==='' || e.target.value === 'image/png') {
        setMime(e.target.value);
      }
    };
  const handleDragLink = (e: React.DragEvent<HTMLAnchorElement>) => {
    if (zip===null || zip ==='loading') return;
    console.log(zip.uri);
    e.dataTransfer.setData(
        'DownloadURL',
        `application/zip:${genZipFileName(zip.generated)}:${zip.uri}`);
  };
  return (<>
    <Tooltip title={
        zip===null && selectedItems.length>0 ?
          browser.i18n.getMessage('GENERATE') : ''
    }>
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
        {browser.i18n.getMessage('CONVERT')}
      </InputLabel>
      <Select
        id='converter-option'
        value={mime}
        onChange={handleMIMESelectChange}
        className={classes.select}>
        <MenuItem value=''>
          {browser.i18n.getMessage('NOCONVERT')}</MenuItem>
        <MenuItem value='image/png'>
          {browser.i18n.getMessage('CONVERT2', 'png')}
        </MenuItem>
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
        download={genZipFileName(zip.generated)}
        underline='none'
        onDragStart={handleDragLink}>
        <Button color='inherit' startIcon={<GetAppIcon />}>
          {browser.i18n.getMessage('DOWNLOAD') +
          '('+zip.generated.toLocaleString('ja-JP') +')'}
        </Button>
      </Link>
    }
  </>);
};
