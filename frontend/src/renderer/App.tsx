import React, { useState } from 'react'
import logo from './assets/logo.svg'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'


const NumericKeyboard: React.FC = () => {
  const layout = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3']];
  const [text, setText] = useState('');
  return (
    <div style={{ flex: 1, backgroundColor: "red" }}>
      <div style={{ backgroundColor: "red" }}>{text}</div>
      <div>
        {layout.map(row =>
          <div style={{ display: "flex", flexDirection: "row", width: '30vw', height: '10vw' }}>
            {row.map(entry => <div onClick={() => setText(`${text}${entry}`)} style={{ display: "flex", flex: 1, border: "1px solid black", justifyContent: "center", alignContent: "center", alignItems: "center", fontSize: '5em' }}>{entry}</div>)}
          </div>)}
      </div>
    </div>
  )

}

const App: React.FC = () => {
  return (
    <div className="App">
      <div style={{ backgroundColor: "red", width: "100vw", height: "100vh" }}>
        <NumericKeyboard />
      </div>
    </div>
  )
}

export default hot(App)
