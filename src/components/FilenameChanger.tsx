import {
  IconButton,
  makeStyles,
  TextField,
  Tooltip,
  useTheme} from '@material-ui/core';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import browser from 'webextension-polyfill';
import {getRenameFileAction, State} from '../redux';
import {Icon} from '@iconify/react';
import formTextboxIcon from '@iconify/icons-mdi/form-textbox';
import {PicObjWithBlob} from '../type';
import {renamer} from '../util/renamer';

const useStyles = makeStyles((theme) => ({
  textField: {
    'color': theme.palette.common.white,
    '&:before': {
      borderColor: theme.palette.common.white,
    },
    '&:after': {
      borderColor: theme.palette.common.white,
    },
  },
}));

export const FilenameChanger = () => {
  const classes = useStyles();
  const selectedItems =
    useSelector<State, PicObjWithBlob[]>((state)=>state.selectedItems);
  const theme = useTheme();
  const dispatch = useDispatch();
  const [rename, setRename] = React.useState<string>('');
  return (<>
    <Tooltip title={
      selectedItems.length>0 ? browser.i18n.getMessage('RENAME') : ''
    }>
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
    <TextField
      label={browser.i18n.getMessage('FILENAME')}
      value={rename}
      onChange={(e)=>{
        setRename(e.target.value);
      }}
      InputProps={{
        className: classes.textField,
      }}/>
  </>);
};
