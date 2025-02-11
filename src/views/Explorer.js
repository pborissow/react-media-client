import React, { useState } from 'react';
import {Button, Switch, FormControlLabel } from '@mui/material';


import { ThumbnailView } from "./ThumbnailView";
import useFilter from "../utils/Retriever";
import './Explorer.css';


//******************************************************************************
//**  Explorer
//******************************************************************************
/**
 *   Used to browse photos and videos, create/edit albums, etc.
 *
 ******************************************************************************/

function Explorer() {
    const [filter, setFilter] = useState({});
    const [items, loading] = useFilter(filter);


  //**************************************************************************
  //** moveBack
  //**************************************************************************
    function moveBack(){

        var showAll = filter.recursive===true;
        if (showAll){
            delete filter.recursive;
        }


        if (!filter.path || !filter.path.length===0){
            //title.clear();
            if (showAll) updateFilter();
        }
        else{
            filter.path.pop();
            //title.update();
            updateFilter();
        }

    };


  //**************************************************************************
  //** updateFilter
  //**************************************************************************
    function updateFilter(){
        setFilter(JSON.parse(JSON.stringify(filter)));
    };



  //**************************************************************************
  //** Title
  //**************************************************************************
  function Title(){
    return (
      <div className="title">

      </div>
    )
  };


  //**************************************************************************
  //** Toolbar
  //**************************************************************************
    function Toolbar(){
      return (
        <div className="panel-toolbar">
          <Button onClick={moveBack} variant="outlined" className="toolbar-button back">Up</Button>

          <div style={{float:"right", margin: "0 20px 0"}}>
            <FormControlLabel labelPlacement="start"
                control={
                    <Switch checked={filter.recursive} label="Show All" onChange={(e)=>{
                        filter.recursive = e.target.checked;
                        updateFilter();
                    }} />
                }
                label="Show All"
            />
          </div>

        </div>
      )
    };


  //**************************************************************************
  //** render
  //**************************************************************************
    return (
      <div className="media-explorer">
        <Title />
        <Toolbar />
        <ThumbnailView filter={filter} setFilter={setFilter} data={items} loading={loading} />
      </div>
    );
}

export default Explorer;