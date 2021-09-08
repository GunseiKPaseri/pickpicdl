import * as React from 'react';
import {State} from '../redux';
import {makeStyles} from '@material-ui/core/styles';
import {useSelector} from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography} from '@material-ui/core';
import ImgTable from './ImgTable';
import {ImgViewer} from './ImgViewer';
import {ThemeChanger} from './ThemeChanger';
import {FilenameChanger} from './FilenameChanger';
import {ZipGenerator} from './ZipGenerator';
import {HoveringItem} from '../type';
// import {PasswordForm} from './PasswordForm';

const useStyles = makeStyles((theme) => ({
  offset: theme.mixins.toolbar,
  grow: {
    flexGrow: 1,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
}));

const App = ():JSX.Element => {
  const classes = useStyles();
  // const {selectedItems, zip, password} =
  const hovering =
    useSelector<State, HoveringItem | null>((state)=>state.hovering);
  return (
    <>
      <AppBar position='fixed'>
        <Toolbar>
          <Typography className={classes.title} variant='h6' noWrap>
            💟PicPickDL
          </Typography>
          <FilenameChanger />
          <ZipGenerator />
          <div className={classes.grow} />
          <ThemeChanger />
        </Toolbar>
      </AppBar>
      <div className={classes.offset} />
      <ImgTable />
      {hovering && <ImgViewer />}
    </>
  );
};

export default App;
