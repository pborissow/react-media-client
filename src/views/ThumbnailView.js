import React, { useState } from 'react';
import './ThumbnailView.css';

//******************************************************************************
//**  Thumbnails View
//******************************************************************************
/**
 *   Used to fetch media items and folders from the server and render 
 *   thumbnails.
 *
 ******************************************************************************/

export const ThumbnailView = ({data, filter, setFilter, loading}) => { 

    const config = {
        size: 300
    };


  //**************************************************************************
  //** Folder
  //************************************************************************** 
    function Folder({item}){      
        return (
            <div 
                key={item.id} className="thumbnail" 
                onClick={()=>{
                    if (!filter.path) filter.path = [];
                    filter.path.push(item.name);
                    setFilter(JSON.parse(JSON.stringify(filter)));
                }}
            >
                <div className="folder-icon"></div>
                <div>{item.name}</div>
            </div>
        )
    };


  //**************************************************************************
  //** Thumbnail
  //**************************************************************************    
    function Thumbnail({item}){   
        var path = "image?width=" + config.size + "&id=";
        var url = path + item.id;

        return (

            <div 
                key={item.id} className="thumbnail" style={{backgroundImage: "none"}}
                onClick={()=>{
                    console.log(item);
                }}
            >
                <img style={{display:"none"}} 
                    onLoad={(e)=>{
                        var img = e.target;
                        var thumbnail = img.parentNode;
                        thumbnail.style.backgroundImage = "url(\"" +  img.src + "\")";
                        //thumbnail.removeChild(img);
                    }} 
                    onError={(e)=>{
                        var img = e.target;
                        var thumbnail = img.parentNode;
                        thumbnail.className += " not-available";
                        //thumbnail.removeChild(img);
                    }}
                    src={url}
                ></img>
            </div>  
        )
    };


  //**************************************************************************
  //** render
  //**************************************************************************    
    return (
      <div className='thumbnail-view'>
        {
        
        loading === "false" ? (<h1>Search for Books</h1>) : 
        loading === "null" ? (<h1>No Book Found</h1>) : 
        (        
            
            data && data.map((item) => {
                item.isFolder = item.hash==="-";                
                if (item.isFolder){ 
                    return <Folder key={item.id} item={item}/>
                }
                else{                    
                    return <Thumbnail key={item.id} item={item}/>
                }
            })        
        
        )      
    
        }
      </div>
    );
}