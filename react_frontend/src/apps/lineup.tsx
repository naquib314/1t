import "src/public-path";
import "react-hot-loader/patch";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import * as ReactDOM from "react-dom";
import LineupTable from "src/lineup/components/LineupTable"

const container = document.getElementById("lineup-root");

const App = hot(() => {
  return (
    <LineupTable/>
  );
});

ReactDOM.render(<App />, container);
