import React from "react";
import Home from "./pages/Home/Home";
import {createTheme, ThemeProvider} from "@mui/material";
import '@fontsource/gaegu';


const theme = createTheme({
    palette: {
        primary: {
            main: "#b5d3f6",
        },
        text: {
            primary: "#b5d3f6",
        }
    },
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    color: "#b5d3f6",
                    fontSize: '1.35em',
                    fontWeight: 700,
                    '&.Mui-disabled': {
                        color: "#b5d3f6",
                    },
                }
            }
        }
    },
    typography: {
        allVariants: {
            color: "#b5d3f6",
            fontSize: '2em',
            fontWeight: 700,
            fontFamily: 'Gaegu, cursive',
        }
    }
});

function App() {
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
          <Home />
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
