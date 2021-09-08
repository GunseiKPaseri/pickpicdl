import * as React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography} from '@material-ui/core';
import ImgTable from './ImgTable';
import {ImgViewer} from './ImgViewer';
import {ThemeChanger} from './ThemeChanger';
import {FilenameChanger} from './FilenameChanger';
import {ZipGenerator} from './ZipGenerator';

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
      <ImgViewer />
    </>
  );
};

export default App;
