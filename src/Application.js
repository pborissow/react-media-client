import React, { useState, useEffect, useRef } from 'react';
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


  //**************************************************************************
  //** Header
  //**************************************************************************
    function Header(){
      return (
        <div className="header"></div>
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
            console.log(div);
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
      <div>
        <Header/>
        <Tabbar/>
        <Panel tabName="Home"><Explorer/></Panel>
        <Panel tabName="Admin"><AdminPanel/></Panel>
      </div>
    );
}