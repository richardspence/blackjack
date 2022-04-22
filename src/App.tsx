import React from 'react';
import './App.css';
import { createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/styles';
import { SnackbarProvider } from 'notistack';
import { MainView } from './components/MainView';

// const useStyles = makeStyles(theme => ({
//   cards: {
//     position: 'relative',
//     left: 0,
//     top: 0,
//     zIndex: 20,
//   },
//   videoBase: {
//     position: 'relative',
//     left: 0,
//     top: 0,
//     zIndex: 10,
//   },
//   table: {
//     position: 'relative',
//     height: 'calc(100vh - 65px)',
//     overflow: 'hidden',
//   },
//   menuButton: {
//     marginRight: 2,
//   },
//   title: {
//     flexGrow: 1,
//   },
// }));
const muiTheme = {
  palette: {
    type: "light",
    primary: {
      main: "#2194BB"
    },
    secondary: {
      main: "#DAC338"
    },
    // text: {
    //   main: "rgba(33,33,33,1)"
    // },
    success: {
      main: "rgba(0,0,0,1)"
    },
    info: {
      main: "rgba(0,0,0,1)"
    },
    warning: {
      main: "rgba(0,0,0,1)"
    },
    bg: {
      main: "#FFFFFF"
    }
  }
};
function App() {
  return (
    <div className="App2">
      <ThemeProvider theme={createTheme(muiTheme)} >
        <SnackbarProvider maxSnack={10}>

          <CssBaseline />
          <header className="App2-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}


          </header>
         <MainView />
        </SnackbarProvider>
      </ThemeProvider>

    </div>
  );
}

export default App;
