import React, { useState } from 'react';
import { ThumbnailView } from "./ThumbnailView";
import useFilter from "../utils/Retriever";
//import './Explorer.css';

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
  //** updateFilter
  //**************************************************************************   
    function updateFilter(){
        if (!filter.path || !filter.path.length) return;
        filter.path.pop();                                              
        setFilter(JSON.parse(JSON.stringify(filter)));
    }

    
  //**************************************************************************
  //** Toolbar
  //**************************************************************************  
    function Toolbar(){      
      return (
        <div className="toolbar">
          <button onClick={updateFilter}>Back</button> 
        </div>
      )
    };


  //**************************************************************************
  //** render
  //**************************************************************************   
    return (
      <div>
        <Toolbar />    
        <ThumbnailView filter={filter} setFilter={setFilter} data={items} loading={loading} />
      </div>
    );
}

export default Explorer;