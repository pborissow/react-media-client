import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Explorer from "./views/Explorer";
import AdminPanel from "./admin/AdminPanel";
import './Application.css';


//******************************************************************************
//**  Main Application
//******************************************************************************
/**
 *   Primary interface to the media library.
 *
 ******************************************************************************/

export const Application = function() {

    const tabs = new Map();
    var currTab = "Home";
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
      typography: { //delete global font styles inserted into the body
        allVariants: {
          color: null,
          fontSize: null,
          fontFamily: null,
          fontWeight: null,
          lineHeight: null,
          letterSpacing: null
        },
      },
    });


  //**************************************************************************
  //** Header
  //**************************************************************************
    function Header(){
      return (
        <div className="app-header"></div>
      )
    };


  //**************************************************************************
  //** Tabbar
  //**************************************************************************
    function Tabbar(){
      return (
        <div className="app-nav-bar">
          <div className="app-tab-container">
            {
              ["Home", "Admin"].map((tabName)=>{
                return <div key={tabName} onClick={onTabClick}
                className={tabName==currTab? "active" : ""}>{tabName}</div>;
              })
            }
          </div>
        </div>
      )
    };


  //**************************************************************************
  //** Panel
  //**************************************************************************
    function Panel(props){
        const divRef = useRef(null);

        useEffect(() => {
            const div = divRef.current;
            tabs.set(props.tabName, div);
        }, []);

        return (
          <div ref={divRef} style={{display: props.tabName===currTab ? "" : "none"}}>
            {props.children}
          </div>
        )
    };


  //**************************************************************************
  //** onTabClick
  //**************************************************************************
    var onTabClick = function(e){
        var tab = e.target;
        if (tab.className==="active") return;


      //Update tabbar
        let t = tab.parentNode.firstChild;
        while (t) {
            if (t.nodeType === 1 && t!==tab) t.className = "";
            t = t.nextSibling;
        }
        tab.className = "active";


      //Show/Hide panel
        tabs.get(currTab).style.display = "none";
        currTab = tab.innerText;
        tabs.get(currTab).style.display = "";
    };


  //**************************************************************************
  //** render
  //**************************************************************************
    return (

      <ThemeProvider theme={darkTheme}>
      <CssBaseline />
        <div className='app'>
          <Header/>
          <Tabbar/>
          <div className='app-body'>
            <Panel tabName="Home"><Explorer/></Panel>
            <Panel tabName="Admin"><AdminPanel/></Panel>
          </div>
        </div>
      </ThemeProvider>

    );
}