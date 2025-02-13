import { useState, useEffect } from 'react';

//******************************************************************************
//**  Retriever
//******************************************************************************
/**
 *   Class used to fetch media items and folders from the server.
 *
 ******************************************************************************/

export default class Retriever {

    isFetching = false;
    config = {
        limit: 50
    };

    eof = false;
    currPage = 0;


  //**************************************************************************
  //** Constructor
  //**************************************************************************
    constructor() {
        //console.log(new Date());
    }


    clear(){

        this.currPage = 0;
        this.eof = false;
    }

    setFilter(filter){
        this.clear();
        this.filter = filter;




        //console.log(this.filter);
    }


  //**************************************************************************
  //** fetch
  //**************************************************************************
    async fetch(callback) {

        if (this.eof){
            callback.apply(this, [[]]);
            return;
        }


        var page = this.currPage+1;
        //if (pageRequests.has(page)) return;
        if (this.isFetching) return;
        this.isFetching = true;

        this.currPage++;



        try {

            var path = "";
            var params = {};
            for (var key in this.filter) {
                if (this.filter.hasOwnProperty(key)){

                    if (key=="path"){
                        for (var i=0; i<this.filter.path.length; i++){
                            path += "/" + encodeURIComponent(this.filter.path[i]);
                        }
                    }
                    else if (key=="page"){

                    }
                    else{
                        params[key] = this.filter[key];
                    }
                }
            }

            var limit = this.config.limit;

            const response = await fetch('/index' + path + "?page=" + page + "&limit=" + limit, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            const items = await response.json();
            items.forEach((item)=>{
                item.isFolder = item.hash==="-";
            });


            if (items.length<limit) this.eof = true;
            this.isFetching = false;

            callback.apply(this, [items]);

        }
        catch (error) {
            this.isFetching = false;
        }
    }


  //**************************************************************************
  //** isEOF
  //**************************************************************************
    isEOF (){
        return this.eof;
    };

}


//React hook used to fetch media items and folders from the server.

function useFilter(filter, retriever) {
    const [result, setResult] = useState([]);

    useEffect(() => {

        if (filter) {
            retriever.setFilter(filter);
            retriever.fetch((json)=>{
                setResult(json);
            });
        }

    }, [filter]);

    return [result];
};


export {useFilter};